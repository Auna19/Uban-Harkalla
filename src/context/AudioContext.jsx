import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  
  // Track playback events in current browser session
  const landingPlayedRef = useRef(false);
  const lastAuthEventRef = useRef(null);

  // Initialize shared audio element once
  useEffect(() => {
    const audio = new Audio('/UBAN HARKALLA MP3.mp3');
    audio.loop = false; // Strictly non-looping as required
    audio.volume = volume;
    audio.preload = 'auto'; // Preload for instant, zero-latency mobile playback
    audioRef.current = audio;

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
  const safePlay = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      // Rewind to start if ended
      if (audioRef.current.ended) {
        audioRef.current.currentTime = 0;
      }
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        await promise;
        setAutoplayBlocked(false);
        setIsPlaying(true);
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        console.info('Autoplay waiting for first touch gesture on mobile.');
      } else {
        console.warn('Playback notice:', err.message);
      }
      setIsPlaying(false);
    }
  }, []);

  // One-time interaction listener for seamless mobile playback on first touch/interaction
  useEffect(() => {
    let triggered = false;

    const handleFirstGesture = async () => {
      if (triggered) return;
      if (!audioRef.current) return;

      // If already playing or landing audio already played, clean up listeners
      if (isPlaying || landingPlayedRef.current) {
        removeGestureListeners();
        return;
      }

      try {
        if (audioRef.current.ended) {
          audioRef.current.currentTime = 0;
        }
        const promise = audioRef.current.play();
        if (promise !== undefined) {
          await promise;
          triggered = true;
          landingPlayedRef.current = true;
          setAutoplayBlocked(false);
          setIsPlaying(true);
          removeGestureListeners();
        }
      } catch (err) {
        // If still restricted, keep listeners attached for subsequent touch
      }
    };

    const removeGestureListeners = () => {
      const events = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'];
      events.forEach((evt) => {
        window.removeEventListener(evt, handleFirstGesture, { capture: true });
        document.removeEventListener(evt, handleFirstGesture, { capture: true });
      });
    };

    const events = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleFirstGesture, { capture: true, passive: true });
      document.addEventListener(evt, handleFirstGesture, { capture: true, passive: true });
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
   * Called only when visitor lands on the landing page (Home).
   * Attempts playback once per full page load. Ordinary in-app navigation
   * does not replay it because landingPlayedRef stays true during the session.
   */
  const triggerLandingPlayback = useCallback(() => {
    if (landingPlayedRef.current) return; // Already played for this load
    landingPlayedRef.current = true;
    safePlay();
  }, [safePlay]);

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

  // Handle first manual user interaction to unlock blocked autoplay if pending
  const manualPlayAudio = useCallback(() => {
    setUserInteracted(true);
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
