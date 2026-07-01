// src/core/questions/questionFactory.js
import { generateSessionQuestions } from './questionBank.js';

// Shuffle array (Fisher-Yates) — re-exported for use by simulate/play features
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The 100-question session is generated once per "play session" and cached,
// so that re-entering a world or switching modes draws from a stable pool
// instead of re-randomising everything from scratch.
let _cachedSession = null;

export function getSession() {
  if (!_cachedSession) _cachedSession = generateSessionQuestions();
  return _cachedSession;
}

export function resetSession() {
  _cachedSession = generateSessionQuestions();
  return _cachedSession;
}

// All questions belonging to a given world (0-9)
export function getWorldPool(worldId) {
  return getSession().filter((q) => q.world === worldId);
}

// Generate questions for a specific world + mode (used by Play phase).
// excludeHard drops difficulty-3 questions for Guided Practice; if that
// leaves too few questions, the full pool is used as a fallback.
export function generateModeQuestions(worldId, count, { excludeHard = false } = {}) {
  let pool = getWorldPool(worldId);
  if (excludeHard) {
    const easier = pool.filter((q) => q.difficulty < 3);
    if (easier.length >= Math.min(count, 3)) pool = easier;
  }
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

// Reflect-phase quiz: one question sampled from a spread of worlds.
export function getReflectQuestions(count = 5) {
  const session = getSession();
  const worldIds = shuffle([...new Set(session.map((q) => q.world))]).slice(0, count);
  return worldIds.map((w) => {
    const pool = session.filter((q) => q.world === w && q.difficulty <= 2);
    const fromPool = pool.length ? pool : session.filter((q) => q.world === w);
    return fromPool[Math.floor(Math.random() * fromPool.length)];
  }).filter(Boolean);
}
