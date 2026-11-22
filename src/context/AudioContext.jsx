import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Track playback state in current browser session
  const landingPlayedRef = useRef(false);
  const hasStartedRef = useRef(false);
  const isStartingRef = useRef(false);
  const lastAuthEventRef = useRef(null);

  // Fallback Audio instance for SSR / immediate access before DOM mount
  useEffect(() => {
    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio('/uban-harkalla-audio.mp3');
      audio.loop = false;
      audio.volume = volume;
      audio.preload = 'auto';
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audioRef.current = audio;
    }

    if (audio) {
      audio.load();
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
    };
    const handleError = (e) => {
      console.warn('Audio playback notice:', e);
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
    const audio = audioRef.current;
    if (!audio) return Promise.resolve();

    try {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      const promise = audio.play();
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
              console.info('Autoplay waiting for mobile user interaction.');
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

  // Global one-time interaction listener for zero-delay mobile playback on first touch/interaction
  useEffect(() => {
    if (hasStartedRef.current || isPlaying) return;

    const events = ['touchstart', 'touchend', 'pointerdown', 'click'];

    const removeListeners = () => {
      events.forEach((evt) => {
        document.removeEventListener(evt, onFirstInteraction, true);
        window.removeEventListener(evt, onFirstInteraction, true);
      });
    };

    const onFirstInteraction = () => {
      // Guard against race conditions and concurrent calls from multiple simultaneous touch events
      if (hasStartedRef.current || isStartingRef.current) return;
      isStartingRef.current = true;
      removeListeners(); // Immediately remove listeners to prevent duplicate triggers from cancelling playback

      // 1. Mobile Web Audio unlock
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          if (!window.__ubhAudioCtx) {
            window.__ubhAudioCtx = new AudioContextClass();
          }
          if (window.__ubhAudioCtx.state === 'suspended') {
            window.__ubhAudioCtx.resume();
          }
        }
      } catch (_) {}

      // 2. HTMLAudioElement play
      const audio = audioRef.current;
      if (!audio) {
        isStartingRef.current = false;
        return;
      }

      try {
        if (audio.ended) {
          audio.currentTime = 0;
        }
        // Direct, synchronous play call inside the native user gesture frame
        const promise = audio.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              hasStartedRef.current = true;
              landingPlayedRef.current = true;
              setAutoplayBlocked(false);
              setIsPlaying(true);
              isStartingRef.current = false;
            })
            .catch(() => {
              isStartingRef.current = false;
              // If this gesture was not accepted, re-bind once for the next interaction
              if (!hasStartedRef.current) {
                events.forEach((evt) => {
                  document.addEventListener(evt, onFirstInteraction, { capture: true, once: true });
                });
              }
            });
        } else {
          isStartingRef.current = false;
        }
      } catch (err) {
        isStartingRef.current = false;
      }
    };

    events.forEach((evt) => {
      document.addEventListener(evt, onFirstInteraction, { capture: true, passive: true });
      window.addEventListener(evt, onFirstInteraction, { capture: true, passive: true });
    });

    return () => {
      removeListeners();
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
   * Attempts immediate autoplay. If restricted by mobile browser policies,
   * it fails cleanly without locking out subsequent gestures.
   */
  const triggerLandingPlayback = useCallback(() => {
    if (landingPlayedRef.current || hasStartedRef.current || isStartingRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.ended) {
        audio.currentTime = 0;
      }
      isStartingRef.current = true;
      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            landingPlayedRef.current = true;
            hasStartedRef.current = true;
            setAutoplayBlocked(false);
            setIsPlaying(true);
            isStartingRef.current = false;
          })
          .catch(() => {
            // Autoplay blocked by mobile browser policy; awaiting first touch
            isStartingRef.current = false;
            console.info('Autoplay waiting for touch interaction.');
          });
      } else {
        isStartingRef.current = false;
      }
    } catch (_) {
      isStartingRef.current = false;
    }
  }, []);

  /**
   * Called only when a visitor successfully registers or logs in.
   * Plays the audio once as a welcome experience.
   */
  const triggerAuthWelcomePlayback = useCallback((authEventId) => {
    if (lastAuthEventRef.current === authEventId) return;
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
      <audio
        ref={audioRef}
        id="uban-harkalla-audio"
        src="/uban-harkalla-audio.mp3"
        preload="auto"
        playsInline
        webkit-playsinline="true"
        style={{ display: 'none' }}
      />
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
