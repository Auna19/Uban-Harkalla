import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  
  // Eagerly initialize shared Audio instance immediately so it is available
  // synchronously to all child useEffect hooks on initial render
  if (!audioRef.current && typeof window !== 'undefined') {
    const audio = new Audio('/UBAN HARKALLA MP3.mp3');
    audio.loop = false; // Strictly non-looping as required
    audio.volume = 0.8;
    audio.preload = 'auto'; // Preload for instant, zero-latency playback
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audioRef.current = audio;
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  // Track playback state in current browser session
  const landingPlayedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const lastAuthEventRef = useRef(null);

  // Bind audio element lifecycle events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Audio stops completely after finish
    };
    const handleError = (e) => {
      console.warn('Audio playback error (non-fatal):', e);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  // Safe Play wrapper that handles browser autoplay policies
  const safePlay = useCallback(() => {
    if (!audioRef.current) return Promise.resolve();
    try {
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        return promise
          .then(() => {
            hasStartedRef.current = true;
            landingPlayedRef.current = true;
            setAutoplayBlocked(false);
            setIsPlaying(true);
          })
          .catch((err) => {
            if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
              console.info('Autoplay waiting for first touch gesture on mobile.');
            } else {
              console.warn('Playback notice:', err.message);
            }
            setIsPlaying(false);
          });
      }
      return Promise.resolve();
    } catch (err) {
      setIsPlaying(false);
      return Promise.resolve();
    }
  }, []);

  // One-time interaction listener for seamless mobile playback on first touch/interaction anywhere
  useEffect(() => {
    // If audio already started or is currently playing, clean up
    if (hasStartedRef.current || isPlaying) return;

    const handleFirstGesture = () => {
      if (hasStartedRef.current) {
        removeGestureListeners();
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;

      try {
        if (audio.ended) {
          audio.currentTime = 0;
        }
        // Direct, synchronous play call inside the user gesture event frame
        const promise = audio.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              hasStartedRef.current = true;
              landingPlayedRef.current = true;
              setAutoplayBlocked(false);
              setIsPlaying(true);
              removeGestureListeners();
            })
            .catch(() => {
              // Still restricted by browser on this specific gesture, keep listeners attached for subsequent touch
            });
        }
      } catch (err) {
        // Keep listeners attached
      }
    };

    const removeGestureListeners = () => {
      const events = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'click', 'scroll', 'keydown'];
      events.forEach((evt) => {
        window.removeEventListener(evt, handleFirstGesture, { capture: true });
        document.removeEventListener(evt, handleFirstGesture, { capture: true });
        if (document.body) {
          document.body.removeEventListener(evt, handleFirstGesture, { capture: true });
        }
      });
    };

    const events = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'click', 'scroll', 'keydown'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleFirstGesture, { capture: true, passive: true });
      document.addEventListener(evt, handleFirstGesture, { capture: true, passive: true });
      if (document.body) {
        document.body.addEventListener(evt, handleFirstGesture, { capture: true, passive: true });
      }
    });

    return () => {
      removeGestureListeners();
    };
  }, [isPlaying]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !audioRef.current.muted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const setVolume = useCallback((val) => {
    const clampVal = Math.max(0, Math.min(1, val));
    if (audioRef.current) {
      audioRef.current.volume = clampVal;
      if (clampVal === 0) {
        audioRef.current.muted = true;
        setIsMuted(true);
      } else if (audioRef.current.muted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
    setVolumeState(clampVal);
  }, []);

  /**
   * Called when visitor lands on the landing page (Home).
   * Attempts instant playback. If the browser restricts unmuted autoplay (standard on mobile),
   * it fails gracefully WITHOUT marking landingPlayedRef=true, allowing the user's very first
   * touch, scroll, or tap anywhere on the screen to trigger smooth playback.
   */
  const triggerLandingPlayback = useCallback(() => {
    if (landingPlayedRef.current || hasStartedRef.current) return; // Already played for this load
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            landingPlayedRef.current = true;
            hasStartedRef.current = true;
            setAutoplayBlocked(false);
            setIsPlaying(true);
          })
          .catch(() => {
            // Mobile browser blocked unmuted autoplay.
            // Do NOT mark landingPlayedRef.current = true so first user touch anywhere will play!
            console.info('Autoplay restricted by mobile browser policy; awaiting first touch interaction.');
          });
      }
    } catch (err) {
      // Ignored
    }
  }, []);

  /**
   * Called only when a visitor successfully registers or logs in.
   * Plays the audio once as a welcome experience.
   */
  const triggerAuthWelcomePlayback = useCallback((authEventId) => {
    if (lastAuthEventRef.current === authEventId) return; // Prevent duplicate trigger
    lastAuthEventRef.current = authEventId;
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    safePlay();
  }, [safePlay]);

  // Handle manual user play from the UI controller
  const manualPlayAudio = useCallback(() => {
    hasStartedRef.current = true;
    landingPlayedRef.current = true;
    setAutoplayBlocked(false);
    safePlay();
  }, [safePlay]);

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        autoplayBlocked,
        play: manualPlayAudio,
        pause,
        toggleMute,
        setVolume,
        triggerLandingPlayback,
        triggerAuthWelcomePlayback,
        dismissAutoplayBanner: () => setAutoplayBlocked(false),
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
