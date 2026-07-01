// src/core/questions/pictographFactory.js
//
// Generates random picture-graph datasets for use in question generators
// and simulate stations. Every dataset has:
//   title      — a natural-language survey title
//   categories — [{id, label, emoji, count}] (count = REAL quantity)
//   scaleValue — key: 2, 5, or 10
//   scaleEmoji — the symbol drawn in the graph rows
//
// INVARIANT: every category.count is an exact multiple of scaleValue
// (enforced by construction — never use half-symbols, per Singapore MOE
// Grade-2 curriculum exclusion documented in PRD §4).

const THEMES = [
  {
    title: 'Favourite Fruits',
    scaleEmoji: '🍎',
    categories: [
      { id: 'apple',  label: 'Apple',  emoji: '🍎' },
      { id: 'banana', label: 'Banana', emoji: '🍌' },
      { id: 'grape',  label: 'Grape',  emoji: '🍇' },
      { id: 'orange', label: 'Orange', emoji: '🍊' },
    ],
  },
  {
    title: 'Favourite Pets',
    scaleEmoji: '🐾',
    categories: [
      { id: 'cat',  label: 'Cat',  emoji: '🐱' },
      { id: 'dog',  label: 'Dog',  emoji: '🐶' },
      { id: 'fish', label: 'Fish', emoji: '🐠' },
      { id: 'bird', label: 'Bird', emoji: '🦜' },
    ],
  },
  {
    title: 'Weather This Week',
    scaleEmoji: '☀️',
    categories: [
      { id: 'sunny',  label: 'Sunny',  emoji: '☀️' },
      { id: 'cloudy', label: 'Cloudy', emoji: '⛅' },
      { id: 'rainy',  label: 'Rainy',  emoji: '🌧️' },
      { id: 'windy',  label: 'Windy',  emoji: '💨' },
    ],
  },
  {
    title: 'Favourite Sports',
    scaleEmoji: '⚽',
    categories: [
      { id: 'football',  label: 'Football',  emoji: '⚽' },
      { id: 'swimming',  label: 'Swimming',  emoji: '🏊' },
      { id: 'badminton', label: 'Badminton', emoji: '🏸' },
      { id: 'cycling',   label: 'Cycling',   emoji: '🚴' },
    ],
  },
  {
    title: 'Favourite Ice Cream',
    scaleEmoji: '🍦',
    categories: [
      { id: 'vanilla',    label: 'Vanilla',    emoji: '🍦' },
      { id: 'chocolate',  label: 'Chocolate',  emoji: '🍫' },
      { id: 'strawberry', label: 'Strawberry', emoji: '🍓' },
      { id: 'mango',      label: 'Mango',      emoji: '🥭' },
    ],
  },
  {
    title: 'Vehicles Seen',
    scaleEmoji: '🚗',
    categories: [
      { id: 'car',   label: 'Car',   emoji: '🚗' },
      { id: 'bus',   label: 'Bus',   emoji: '🚌' },
      { id: 'bike',  label: 'Bike',  emoji: '🚲' },
      { id: 'truck', label: 'Truck', emoji: '🚛' },
    ],
  },
  {
    title: 'Favourite Games',
    scaleEmoji: '🎮',
    categories: [
      { id: 'puzzles',    label: 'Puzzles',     emoji: '🧩' },
      { id: 'cards',      label: 'Card Games',  emoji: '🃏' },
      { id: 'boardgames', label: 'Board Games', emoji: '🎲' },
      { id: 'tag',        label: 'Tag',         emoji: '🏃' },
    ],
  },
  {
    title: 'Lunch Choices',
    scaleEmoji: '🍱',
    categories: [
      { id: 'rice',     label: 'Rice',     emoji: '🍚' },
      { id: 'noodles',  label: 'Noodles',  emoji: '🍜' },
      { id: 'sandwich', label: 'Sandwich', emoji: '🥪' },
      { id: 'salad',    label: 'Salad',    emoji: '🥗' },
    ],
  },
  {
    title: 'Birds in the Park',
    scaleEmoji: '🐦',
    categories: [
      { id: 'sparrow', label: 'Sparrow', emoji: '🐦' },
      { id: 'pigeon',  label: 'Pigeon',  emoji: '🕊️' },
      { id: 'crow',    label: 'Crow',    emoji: '🐧' },
      { id: 'parrot',  label: 'Parrot',  emoji: '🦜' },
    ],
  },
  {
    title: 'Outdoor Games',
    scaleEmoji: '🌳',
    categories: [
      { id: 'hopscotch', label: 'Hopscotch', emoji: '🪨' },
      { id: 'skipping',  label: 'Skipping',  emoji: '🪢' },
      { id: 'frisbee',   label: 'Frisbee',   emoji: '🥏' },
      { id: 'kite',      label: 'Kite',      emoji: '🪁' },
    ],
  },
];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SCALE_VALUES = [2, 5, 10];

/**
 * Generate a complete randomised picture-graph dataset.
 * @param {object} opts
 * @param {number}  opts.numCategories  — 3 or 4 (default 4)
 * @param {number}  opts.scaleValue     — force a specific key value (optional)
 * @param {number}  opts.maxSymbols     — max symbols per row (default 8)
 * @param {number}  opts.minSymbols     — min symbols per row (default 1)
 * @returns {{ title, categories, scaleValue, scaleEmoji }}
 */
export function generateDataset({
  numCategories = 4,
  scaleValue    = null,
  maxSymbols    = 8,
  minSymbols    = 1,
} = {}) {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const scale = scaleValue ?? SCALE_VALUES[Math.floor(Math.random() * SCALE_VALUES.length)];

  const cats = shuffleArray(theme.categories).slice(0, numCategories);
  const categories = cats.map(cat => ({
    ...cat,
    count: randInt(minSymbols, maxSymbols) * scale, // always exact multiple
  }));

  return {
    title:      theme.title,
    scaleEmoji: theme.scaleEmoji,
    scaleValue: scale,
    categories,
  };
}

/**
 * Generate a data-TABLE format (used by Build-a-Graph station).
 * Returns the same shape as generateDataset, but with a separate
 * `targetSymbolCount` per category (the student fills this in).
 */
export function generateDataTable(opts = {}) {
  const dataset = generateDataset(opts);
  return {
    ...dataset,
    categories: dataset.categories.map(cat => ({
      ...cat,
      targetSymbolCount: cat.count / dataset.scaleValue,
    })),
  };
}

export { shuffleArray, randInt };
