// src/core/questions/questionBank.js
import {
  genReadKey, genCountCategory, genIdentifySymbol,
  genMostLeast, genMoreFewer, genOrderCategories,
  genFindTotal, genFindDifference, genTwoStepWordProblem, genMixedReview,
} from './questionGenerators.js';
import { BADGES } from '../../config/worlds.config.js';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DISTRIBUTION = [
  // [type, generatorFn, [easyCount, medCount, hardCount]]
  ['READ_KEY',              genReadKey,            [5, 4, 3]], // 12
  ['COUNT_CATEGORY',        genCountCategory,      [5, 4, 3]], // 12
  ['IDENTIFY_SYMBOL',       genIdentifySymbol,     [4, 4, 2]], // 10
  ['MOST_LEAST',            genMostLeast,          [4, 4, 3]], // 11
  ['MORE_FEWER',            genMoreFewer,          [4, 4, 3]], // 11
  ['ORDER_CATEGORIES',      genOrderCategories,    [4, 4, 3]], // 11
  ['FIND_TOTAL',            genFindTotal,          [3, 3, 3]], // 9
  ['FIND_DIFFERENCE',       genFindDifference,     [3, 3, 3]], // 9
  ['TWO_STEP_WORD_PROBLEM', genTwoStepWordProblem, [3, 2, 3]], // 8
  ['MIXED_REVIEW',          genMixedReview,        [3, 2, 2]], // 7
  // = 100 ✓
];

export function generateSessionQuestions() {
  let all = [];
  let counter = 1;
  for (const [type, genFn, [e, m, h]] of DISTRIBUTION) {
    for (let i = 0; i < e; i++) all.push(genFn(`${type}_${counter++}`, 1));
    for (let i = 0; i < m; i++) all.push(genFn(`${type}_${counter++}`, 2));
    for (let i = 0; i < h; i++) all.push(genFn(`${type}_${counter++}`, 3));
  }
  all = shuffleArray(all);
  // Assign to worlds: 0–33 → World 0, 34–66 → World 1, 67–99 → World 2
  all.forEach((q, idx) => { q.world = Math.floor(idx / 34); });
  return all;
}

// Badge tests, scoreAnswer, calcStars, isWorldUnlocked
export const BADGE_TESTS = {
  first_graph:     (s) => s.totalScore > 0,
  key_master:      (s) => s.maxStreak >= 5,
  fair_star:       (s) => s.worldResults.some((w) => w?.worldId === 0),
  survey_champ:    (s) => s.worldResults.some((w) => w?.worldId === 1),
  data_detective:  (s) => s.worldResults.some((w) => w?.worldId === 2),
  picto_master:    (s) => [0, 1, 2].every((id) => s.worldResults.some((w) => w?.worldId === id)),
  graph_boss:      (s) => s.bossWon,
};
export function checkBadges(sessionState) {
  return BADGES.filter((b) => (BADGE_TESTS[b.id] ? BADGE_TESTS[b.id](sessionState) : false));
}
export function scoreAnswer({ isCorrect, isFirstTry, streak }) {
  if (!isCorrect) return { xp: 0, newStreak: 0 };
  let xp = isFirstTry ? 10 : 5;
  const newStreak = streak + 1;
  if (newStreak >= 5 && newStreak % 5 === 0) xp += 5;
  return { xp, newStreak };
}
export function calcStars(correctCount, totalCount = 10) {
  const pct = totalCount > 0 ? correctCount / totalCount : 0;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.5) return 1;
  return 0;
}
export function isWorldUnlocked() { return true; }
