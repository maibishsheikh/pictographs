// src/config/audio.config.js
export const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
export const VOICE_MODEL = 'eleven_multilingual_v2';

export const VOICE_SETTINGS = {
  statement:     { stability: 0.65, similarity_boost: 0.80, style: 0.30 },
  question:      { stability: 0.55, similarity_boost: 0.75, style: 0.50 },
  encouragement: { stability: 0.50, similarity_boost: 0.85, style: 0.60 },
  emphasis:      { stability: 0.75, similarity_boost: 0.90, style: 0.20 },
  thinking:      { stability: 0.70, similarity_boost: 0.78, style: 0.40 },
  celebration:   { stability: 0.45, similarity_boost: 0.85, style: 0.80 },
  instruction:   { stability: 0.65, similarity_boost: 0.80, style: 0.30 },
};

export const ELEVENLABS_TTS_URL = (voiceId = VOICE_ID) =>
  `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
