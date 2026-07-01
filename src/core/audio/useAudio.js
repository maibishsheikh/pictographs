// src/core/audio/useAudio.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { narrate, stopAudio, setMuted, isMuted } from '../../utils/audio.js';

/**
 * Hook exposing playNarration / stop and global audio-enabled state.
 * Mirrors the reference repo's audio hook API.
 */
export function useAudio() {
  const [audioEnabled, setAudioEnabledState] = useState(!isMuted());
  const activeRef = useRef(null); // token to cancel in-flight narration

  useEffect(() => {
    setMuted(!audioEnabled);
  }, [audioEnabled]);

  const playNarration = useCallback((segments, opts = {}) => {
    const token = Symbol('narration');
    activeRef.current = token;

    return narrate(segments, {
      ...opts,
      shouldContinue: () => activeRef.current === token,
    });
  }, []);

  const stop = useCallback(() => {
    activeRef.current = null;
    stopAudio();
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabledState((prev) => {
      const next = !prev;
      if (!next) stopAudio();
      return next;
    });
  }, []);

  return { audioEnabled, toggleAudio, playNarration, stop };
}
