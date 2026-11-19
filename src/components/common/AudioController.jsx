import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, X, Music } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export default function AudioController() {
  const {
    isPlaying,
    isMuted,
    volume,
    autoplayBlocked,
    play,
    pause,
    toggleMute,
    setVolume,
    dismissAutoplayBanner,
  } = useAudio();

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Subtle Autoplay Blocked Toast Notification */}
      {autoplayBlocked && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 max-w-sm bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-700 animate-slide-up flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">UBAN HARKALLA Experience</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Listen to the official UBAN HARKALLA brand audio welcome.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={play}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Play Audio
              </button>
              <button
                onClick={dismissAutoplayBanner}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={dismissAutoplayBanner}
            className="text-slate-400 hover:text-white p-1"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Floating Unobtrusive Brand Audio Control Bar */}
      <div className="fixed bottom-4 right-4 sm:right-6 z-40">
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-lg border border-slate-800/80 px-3 py-2 transition-all">
          <button
            onClick={() => (isPlaying ? pause() : play())}
            title={isPlaying ? 'Pause brand audio' : 'Play brand audio'}
            className="p-1.5 rounded-full hover:bg-slate-800 text-emerald-400 transition-colors flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>

          {/* Sound animation equalizer bars when playing */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 mx-2" title="Audio playing">
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite]" style={{ height: '60%' }}></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_1.1s_infinite]" style={{ height: '100%' }}></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite]" style={{ height: '40%' }}></span>
            </div>
          )}

          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Mini expandable volume control */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <span>Audio</span>
          </button>

          {expanded && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700 ml-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
