// src/config/worlds.config.js
export const WORLDS = [
  {
    id: 0,
    name: 'Fun Fair Booth',
    emoji: '🎪',
    accent: '#F97316',
    description: 'Help Sophie and Max read the picture graphs at the fun fair',
    tags: ['READ_KEY', 'COUNT_CATEGORY', 'IDENTIFY_SYMBOL'],
    questionCount: 34,
    boss: { name: 'Count Critter', emoji: '🎪', reward: 'Fair Star Badge 🎪' },
  },
  {
    id: 1,
    name: 'Classroom Survey',
    emoji: '🏫',
    accent: '#7C3AED',
    description: "Compare survey results with Ms. Emma's class",
    tags: ['MOST_LEAST', 'MORE_FEWER', 'ORDER_CATEGORIES'],
    questionCount: 33,
    boss: { name: 'Mix-Up Monster', emoji: '🤯', reward: 'Survey Champ Badge 🏫' },
  },
  {
    id: 2,
    name: 'Data Detective Lab',
    emoji: '🔍',
    accent: '#0EA5E9',
    description: 'Solve totals, differences, and tricky two-step cases',
    tags: ['FIND_TOTAL', 'FIND_DIFFERENCE', 'TWO_STEP_WORD_PROBLEM', 'MIXED_REVIEW'],
    questionCount: 33,
    boss: { name: 'The Data Dragon', emoji: '🐉', reward: 'Data Detective Badge 🔍' },
  },
];

export const PLAY_MODES = [
  { id: 'guided',      name: 'Guided Practice',      icon: '🧭', desc: '5 questions with hints, no time pressure', questionCount: 5,  hints: true,  timed: false, lives: false },
  { id: 'independent', name: 'Independent Practice', icon: '✍️', desc: '10 questions, no hints, full XP',           questionCount: 10, hints: false, timed: false, lives: false },
  { id: 'timed',       name: 'Timed Challenge',      icon: '⏱️', desc: '8 questions in 60 seconds, bonus XP',       questionCount: 8,  hints: false, timed: true,  timeLimit: 60, lives: false },
  { id: 'boss',        name: 'Boss Battle',          icon: '👑', desc: '5 questions, 3 lives — defeat the boss!',  questionCount: 5,  hints: false, timed: false, lives: true },
];

export const BADGES = [
  { id: 'first_graph',    name: 'First Graph',    icon: '📊', desc: 'First correct answer' },
  { id: 'key_master',     name: 'Key Master',     icon: '🔑', desc: '5 consecutive correct' },
  { id: 'fair_star',      name: 'Fair Star',      icon: '🎪', desc: 'Complete World 1' },
  { id: 'survey_champ',   name: 'Survey Champ',   icon: '🏫', desc: 'Complete World 2' },
  { id: 'data_detective', name: 'Data Detective', icon: '🔍', desc: 'Complete World 3' },
  { id: 'picto_master',   name: 'Picto Master',   icon: '🏆', desc: 'Complete all 3 worlds' },
  { id: 'graph_boss',     name: 'Graph Boss',     icon: '👑', desc: 'Defeat a boss battle' },
];

export const XP_REWARDS = { CORRECT: 10, STREAK_BONUS: 15, STATION_COMPLETE: 20, WORLD_COMPLETE: 50, BOSS_WIN: 100 };
