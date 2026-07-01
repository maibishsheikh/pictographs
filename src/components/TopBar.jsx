import React from 'react';
import { Volume2, VolumeX, Home } from 'lucide-react';

/**
 * Fixed top-bar controls: home button (top-left) and audio toggle
 * (top-right). Persists across all phases.
 */
export default function TopBar({ audioEnabled, onToggleAudio, onHome, showHome = true }) {
  return (
    <>
      {showHome && (
        <button
          className="home-btn"
          aria-label="Go to home / intro screen"
          onClick={onHome}
        >
          <Home size={20} />
        </button>
      )}
      <button
        className="audio-toggle-btn"
        aria-label={audioEnabled ? 'Mute narration' : 'Unmute narration'}
        onClick={onToggleAudio}
      >
        {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </>
  );
}
