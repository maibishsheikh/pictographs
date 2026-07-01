// src/core/questions/questionGenerators.js
import { generateDataset } from './pictographFactory.js';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Distractor helpers ────────────────────────────────────────────────────
function countDistractors(correct, scaleValue) {
  // wrong answers are plausible off-by-one-symbol or scale-confusion errors
  const opts = new Set([correct]);
  const offsets = [-scaleValue, scaleValue, -2 * scaleValue, 2 * scaleValue, -1, 1]
    .filter((n) => Number.isInteger(n));
  for (const off of shuffleArray(offsets)) {
    if (opts.size >= 4) break;
    const c = correct + off;
    if (c > 0 && c !== correct) opts.add(c);
  }
  while (opts.size < 4) opts.add(correct + randInt(2, 6) * scaleValue);
  return shuffleArray([...opts]);
}

function totalDistractors(correct) {
  const opts = new Set([correct]);
  for (const off of shuffleArray([-2, -4, -6, 2, 4, 6, 5, 10, -5, -10])) {
    if (opts.size >= 4) break;
    const c = correct + off;
    if (c > 0) opts.add(c);
  }
  while (opts.size < 4) opts.add(correct + randInt(2, 5) * 2);
  return shuffleArray([...opts]);
}

function topCategory(categories) {
  return categories.reduce((a, b) => (b.count > a.count ? b : a));
}

// ── Q1: READ_KEY — What does one symbol represent? ────────────────────────
export function genReadKey(id, diff) {
  const scale = diff === 1 ? pick([2]) : diff === 2 ? pick([2, 5]) : pick([5, 10]);
  const ds = generateDataset({ scaleValue: scale });
  const opts = new Set([scale]);
  for (const candidate of shuffleArray([2, 5, 10, scale * 2, scale * 3, 1])) {
    if (opts.size >= 4) break;
    if (candidate > 0 && !opts.has(candidate)) opts.add(candidate);
  }
  const optsArr = shuffleArray([...opts]).slice(0, 4);
  return {
    id, type: 'READ_KEY', difficulty: diff,
    questionText: `Look at the key. What does each picture (${ds.scaleEmoji}) stand for in the "${ds.title}" graph?`,
    graph: ds,
    options: optsArr,
    correctAnswer: scale,
    hint1: `Find the KEY box at the bottom of the graph — it tells you what 1 picture is worth.`,
    hint2: `The key says 1 ${ds.scaleEmoji} = ${scale}.`,
    explanation: `The key says 1 ${ds.scaleEmoji} = ${scale}, so each picture stands for ${scale}.`,
  };
}

// ── Q2: COUNT_CATEGORY — Count symbols, apply key ─────────────────────────
export function genCountCategory(id, diff) {
  const scale = diff === 1 ? 2 : diff === 2 ? pick([2, 5]) : pick([5, 10]);
  const ds = generateDataset({ scaleValue: scale, numCategories: diff === 1 ? 3 : 4 });
  const target = pick(ds.categories);
  const symbolCount = target.count / scale;
  return {
    id, type: 'COUNT_CATEGORY', difficulty: diff,
    questionText: `The graph shows "${ds.title}". How many votes did ${target.label} get?`,
    graph: { ...ds },
    highlightCategoryId: target.id,
    options: countDistractors(target.count, scale),
    correctAnswer: target.count,
    hint1: `Count the ${ds.scaleEmoji} pictures in the ${target.label} row — there are ${symbolCount}.`,
    hint2: `${symbolCount} pictures × ${scale} (the key) = ${target.count}.`,
    explanation: `There are ${symbolCount} pictures. Each picture = ${scale}, so ${symbolCount} × ${scale} = ${target.count}.`,
  };
}

// ── Q3: IDENTIFY_SYMBOL — Graph literacy: titles, labels, category↔row ────
export function genIdentifySymbol(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale });
  const top = topCategory(ds.categories);
  const otherLabels = ds.categories.filter((c) => c.id !== top.id).map((c) => c.label);
  const opts = shuffleArray([top.label, ...shuffleArray(otherLabels).slice(0, 2), 'None of these']).slice(0, 4);
  return {
    id, type: 'IDENTIFY_SYMBOL', difficulty: diff,
    questionText: `The highlighted row in the "${ds.title}" graph has the most pictures. Which category does this row belong to?`,
    graph: { ...ds },
    highlightCategoryId: top.id,
    options: opts,
    correctAnswer: top.label,
    hint1: `Look at the label on the left side of the highlighted row.`,
    hint2: `The highlighted row is labelled "${top.label}".`,
    explanation: `The highlighted row is the ${top.label} row.`,
  };
}

// ── Q4: MOST_LEAST ─────────────────────────────────────────────────────────
export function genMostLeast(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale });
  const sorted = [...ds.categories].sort((a, b) => b.count - a.count);
  const askMost = Math.random() > 0.5;
  const winner = askMost ? sorted[0] : sorted[sorted.length - 1];
  const opts = shuffleArray(ds.categories.map((c) => c.label));
  return {
    id, type: 'MOST_LEAST', difficulty: diff,
    questionText: `The graph shows "${ds.title}". Which category has the ${askMost ? 'MOST' : 'FEWEST'} votes?`,
    graph: ds,
    options: opts,
    correctAnswer: winner.label,
    hint1: `Look at which row has the ${askMost ? 'most' : 'fewest'} ${ds.scaleEmoji} pictures.`,
    hint2: `${askMost ? 'The tallest' : 'The shortest'} row is ${winner.label}.`,
    explanation: `${winner.label} has the ${askMost ? 'most' : 'fewest'} pictures (${winner.count} votes).`,
  };
}

// ── Q5: MORE_FEWER ─────────────────────────────────────────────────────────
export function genMoreFewer(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale });
  const [a, b] = shuffleArray(ds.categories).slice(0, 2);
  const more = a.count >= b.count ? a : b;
  const fewer = a.count >= b.count ? b : a;
  const askMore = Math.random() > 0.5;
  const answer = askMore ? more.label : fewer.label;
  const others = ds.categories.filter((c) => c.id !== a.id && c.id !== b.id).map((c) => c.label);
  const opts = shuffleArray([a.label, b.label, ...others]).slice(0, Math.max(2, Math.min(4, ds.categories.length)));
  return {
    id, type: 'MORE_FEWER', difficulty: diff,
    questionText: `Look at "${ds.title}". Which has ${askMore ? 'more' : 'fewer'} votes — ${a.label} or ${b.label}?`,
    graph: ds,
    options: opts,
    correctAnswer: answer,
    hint1: `Compare the ${a.label} row and the ${b.label} row.`,
    hint2: `${more.label} has ${more.count} and ${fewer.label} has ${fewer.count} — so ${askMore ? more.label : fewer.label} has ${askMore ? 'more' : 'fewer'}.`,
    explanation: `${more.label} (${more.count}) has more than ${fewer.label} (${fewer.count}), so the answer is ${answer}.`,
  };
}

// ── Q6: ORDER_CATEGORIES ───────────────────────────────────────────────────
export function genOrderCategories(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale, numCategories: diff === 3 ? 4 : 3 });
  const sorted = [...ds.categories].sort((a, b) => a.count - b.count);
  const leastToMost = Math.random() > 0.5;
  const orderedList = leastToMost ? sorted : [...sorted].reverse();
  const correct = orderedList.map((c) => c.label).join(' → ');
  const distractors = new Set();
  let attempts = 0;
  while (distractors.size < 3 && attempts < 20) {
    attempts += 1;
    const candidate = shuffleArray(ds.categories.map((c) => c.label)).join(' → ');
    if (candidate !== correct) distractors.add(candidate);
  }
  const allOpts = shuffleArray([correct, ...distractors]).slice(0, 4);
  return {
    id, type: 'ORDER_CATEGORIES', difficulty: diff,
    questionText: `Order the categories in "${ds.title}" from ${leastToMost ? 'least to most' : 'most to least'} votes.`,
    graph: ds,
    options: allOpts,
    correctAnswer: correct,
    hint1: `Find the counts for every category first, then sort them.`,
    hint2: `Counts: ${ds.categories.map((c) => `${c.label}=${c.count}`).join(', ')}.`,
    explanation: `Sorted ${leastToMost ? 'least to most' : 'most to least'}: ${correct}.`,
  };
}

// ── Q7: FIND_TOTAL ─────────────────────────────────────────────────────────
export function genFindTotal(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale, numCategories: diff === 1 ? 3 : 4, maxSymbols: diff === 3 ? 10 : 6 });
  const total = ds.categories.reduce((s, c) => s + c.count, 0);
  return {
    id, type: 'FIND_TOTAL', difficulty: diff,
    questionText: `How many students answered the "${ds.title}" survey in total?`,
    graph: ds,
    options: totalDistractors(total),
    correctAnswer: total,
    hint1: `Add up the votes for every category.`,
    hint2: `${ds.categories.map((c) => `${c.count}`).join(' + ')} = ${total}.`,
    explanation: `${ds.categories.map((c) => `${c.label}(${c.count})`).join(' + ')} = ${total} in total.`,
  };
}

// ── Q8: FIND_DIFFERENCE ────────────────────────────────────────────────────
export function genFindDifference(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale });
  const sorted = [...ds.categories].sort((a, b) => b.count - a.count);
  const [a, b] = diff === 3 ? [sorted[0], sorted[sorted.length - 1]] : shuffleArray(ds.categories).slice(0, 2);
  const bigger = a.count >= b.count ? a : b;
  const smaller = a.count >= b.count ? b : a;
  const difference = bigger.count - smaller.count;
  return {
    id, type: 'FIND_DIFFERENCE', difficulty: diff,
    questionText: `In the "${ds.title}" graph, how many MORE votes did ${bigger.label} get than ${smaller.label}?`,
    graph: ds,
    options: countDistractors(difference, scale),
    correctAnswer: difference,
    hint1: `Subtract the smaller count from the larger count.`,
    hint2: `${bigger.count} − ${smaller.count} = ${difference}.`,
    explanation: `${bigger.count} − ${smaller.count} = ${difference} more votes.`,
  };
}

// ── Q9: TWO_STEP_WORD_PROBLEM ──────────────────────────────────────────────
export function genTwoStepWordProblem(id, diff) {
  const scale = diff === 1 ? 2 : pick([2, 5, 10]);
  const ds = generateDataset({ scaleValue: scale });
  const [a, b] = shuffleArray(ds.categories).slice(0, 2);
  const combined = a.count + b.count;
  const names = ['Sophie', 'Max', 'Emma', 'Henry', 'Lily', 'Oliver'];
  const name = pick(names);
  return {
    id, type: 'TWO_STEP_WORD_PROBLEM', difficulty: diff,
    questionText: `${name} counted the "${ds.title}" graph. ${a.label} got ${a.count / scale} pictures and ${b.label} got ${b.count / scale} pictures. Each picture = ${scale} votes. How many votes did ${a.label} and ${b.label} get together?`,
    graph: ds,
    options: totalDistractors(combined),
    correctAnswer: combined,
    hint1: `First, find the real votes for each: ${a.label} = ${a.count / scale} × ${scale} = ${a.count}.`,
    hint2: `Then add them: ${a.count} + ${b.count} = ${combined}.`,
    explanation: `${a.label}: ${a.count / scale} × ${scale} = ${a.count}. ${b.label}: ${b.count / scale} × ${scale} = ${b.count}. Total: ${a.count} + ${b.count} = ${combined}.`,
  };
}

// ── Q10: MIXED_REVIEW — random pull from all 9 above ──────────────────────
const ALL_GENERATORS = [
  genReadKey, genCountCategory, genIdentifySymbol,
  genMostLeast, genMoreFewer, genOrderCategories,
  genFindTotal, genFindDifference, genTwoStepWordProblem,
];
export function genMixedReview(id, diff) {
  const fn = ALL_GENERATORS[Math.floor(Math.random() * ALL_GENERATORS.length)];
  return { ...fn(id, diff), type: 'MIXED_REVIEW' };
}
