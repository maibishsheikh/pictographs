// src/utils/audio.js
//
// Core audio engine: static (.mp3) → dynamic (ElevenLabs API) → silent skip.
// Module-level singleton `_currentAudio` prevents overlapping playback
// across hook instances (avoids the audio-overlap bug seen with per-hook refs).

import { audioMap } from './audioMap.js';
import { VOICE_ID, VOICE_MODEL, VOICE_SETTINGS } from '../config/audio.config.js';

const BASE_URL = import.meta.env.BASE_URL || '/';

let _currentAudio = null;
let _isMuted = false;
const _elevenLabsCache = new Map();

export function setMuted(muted) {
  _isMuted = muted;
  if (muted && _currentAudio) {
    _currentAudio.pause();
  }
}

export function isMuted() {
  return _isMuted;
}

/**
 * Resolve a playable URL for a narration segment.
 * 1. Exact match in audioMap → static asset.
 * 2. Dynamic ElevenLabs request (cached in-memory) if API key present.
 * 3. null → caller should skip silently.
 */
export async function getAudioUrl(segment) {
  const { text, style = 'statement' } = segment;
  if (!text) return null;

  // 1. Static pre-generated asset
  if (audioMap[text]) {
    const path = audioMap[text];
    return path.startsWith('http') ? path : `${BASE_URL}${path.replace(/^\//, '')}`;
  }

  // 2. Dynamic generation via ElevenLabs (requires API key)
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const cacheKey = `${style}::${text}`;
  if (_elevenLabsCache.has(cacheKey)) {
    return _elevenLabsCache.get(cacheKey);
  }

  try {
    const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.statement;
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: VOICE_MODEL,
          voice_settings: settings,
        }),
      }
    );

    if (!response.ok) return null;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    _elevenLabsCache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
}

/**
 * Stop any currently playing narration.
 */
export function stopAudio() {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio.currentTime = 0;
    _currentAudio = null;
  }
}

/**
 * Play a single narration segment. Resolves when playback ends
 * (or immediately if skipped/muted/unavailable).
 */
export async function speak(segment) {
  if (_isMuted) return;

  const url = await getAudioUrl(segment);
  if (!url) return; // silent skip

  stopAudio();

  return new Promise((resolve) => {
    const audio = new Audio(url);
    _currentAudio = audio;
    audio.onended = () => {
      if (_currentAudio === audio) _currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      if (_currentAudio === audio) _currentAudio = null;
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}

/**
 * Play a sequence of narration segments back-to-back, preloading
 * segment i+1 while segment i plays.
 */
export async function narrate(segments, { onSegmentStart, shouldContinue } = {}) {
  if (!segments || segments.length === 0) return;

  // Preload first segment URL
  let nextUrlPromise = getAudioUrl(segments[0]);

  for (let i = 0; i < segments.length; i++) {
    if (shouldContinue && !shouldContinue()) return;
    if (_isMuted) return;

    const url = await nextUrlPromise;

    // Kick off preload for the next segment immediately
    if (i + 1 < segments.length) {
      nextUrlPromise = getAudioUrl(segments[i + 1]);
    }

    if (onSegmentStart) onSegmentStart(i, segments[i]);

    if (!url) continue; // silent skip for this segment

    await new Promise((resolve) => {
      stopAudio();
      const audio = new Audio(url);
      _currentAudio = audio;
      audio.onended = () => {
        if (_currentAudio === audio) _currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        if (_currentAudio === audio) _currentAudio = null;
        resolve();
      };
      audio.play().catch(() => resolve());
    });
  }
}

/**
 * Preload (but don't play) the audio for a segment.
 */
export function preloadNarration(segment) {
  return getAudioUrl(segment);
}

// ── Lightweight tone-based sound effects (click/correct/wrong/etc.) ──
// Not part of the narration pipeline — purely decorative UI feedback,
// generated on the fly with the Web Audio API (no assets required).
let _audioCtx = null;
function getCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}
function tone(freq, dur, type = 'sine', vol = 0.25) {
  if (_isMuted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch { /* ignore — audio not supported / blocked */ }
}
export const sounds = {
  click:    () => tone(440, 0.06, 'square', 0.12),
  correct:  () => { tone(523, 0.1); setTimeout(() => tone(784, 0.16), 90); },
  wrong:    () => tone(180, 0.22, 'sawtooth', 0.16),
  streak:   () => { tone(659, 0.1); setTimeout(() => tone(880, 0.18), 80); },
  badge:    () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 100); setTimeout(() => tone(880, 0.2), 200); },
};
