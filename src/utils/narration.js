// src/utils/narration.js
export const say       = (text) => ({ text, style: 'statement' });
export const ask       = (text) => ({ text, style: 'question' });
export const cheer     = (text) => ({ text, style: 'encouragement' });
export const emphasize = (text) => ({ text, style: 'emphasis' });
export const think     = (text) => ({ text, style: 'thinking' });
export const celebrate = (text) => ({ text, style: 'celebration' });
export const instruct  = (text) => ({ text, style: 'instruction' });

export { VOICE_SETTINGS, VOICE_ID, VOICE_MODEL } from '../config/audio.config.js';

// ─── INTRO ────────────────────────────────────────────────────────────────
export function introNarration() {
  return [cheer("Let's explore picture graphs and data handling!")];
}

// ─── WONDER ──────────────────────────────────────────────────────────────
export function wonderHookNarration(wonder) {
  if (!wonder) return [];
  return [
    cheer(`Hmm, I wonder! ${wonder.question}`),
    think(wonder.subtext),
  ];
}

// ─── STORY — "Sophie's Fun Fair Survey" ──────────────────────────────────
export const storyNarrations = {
  pictoquest: [
    say("Sophie and Max set up a Favourite Fruit voting booth at the school fun fair. Every classmate who walks past sticks one fruit sticker on the poster for their favourite fruit. By lunchtime, the poster is covered in little fruit pictures! Sophie wonders — how can she count all these votes quickly?"),
    say("Ms. Emma helps the class line up the stickers into neat rows — one row per fruit. This is called a picture graph! She then introduces the KEY: a special box that tells us what each picture is really worth. Today's key says: one apple picture equals two votes. So if you see four apple pictures, that means eight votes — not four!"),
    emphasize("Henry counts the apple row, sees four apple pictures, and shouts: four students chose apples! Sophie gently stops him. Wait, Henry — always check the key first! Each picture is worth two votes, so four pictures times two equals eight votes, not four! Henry's cheeks go red, but he smiles — now he knows the golden rule: pictures times the key equals the real total."),
    say("Now the whole class reads the finished graph together. Apples have eight votes, bananas have six, grapes have four, and oranges have two. Ms. Emma asks: which fruit is the most popular? Which is the least? How many votes were there in total? The class adds them all up: eight plus six plus four plus two equals twenty votes altogether!"),
    celebrate("Apples win with eight votes — the most of any fruit! So the fun fair orders apple juice for the snack stand. Sophie cheers: she can now read the key, count a category, compare fruits, and find the total. She is officially a Picture Graph Pro! Now it is your turn — let's practise together!"),
  ],
};

// ─── SIMULATE ────────────────────────────────────────────────────────────
const SIMULATION_NARRATIONS = [
  [say("Station one — Key Cracker! Look at the picture graph and find the key. Then count the pictures in the highlighted row and multiply by the key to find the real amount. Let's crack the key!")],
  [say("Station two — Build a Graph! You will see a data table with vote counts. Tap the plus button to add picture symbols to each row until the count matches. Build the graph from scratch — you can do it!")],
  [say("Station three — Graph Detective! Study the complete picture graph carefully, then answer questions about it. Compare categories, find the total, and spot the difference. Be a data detective!")],
];
export function simulationStationNarration(stationIndex) {
  return SIMULATION_NARRATIONS[stationIndex] ?? [];
}

// ─── PLAY ─────────────────────────────────────────────────────────────────
export const CORRECT_NARRATIONS = [
  cheer("Excellent! You read the graph perfectly!"),
  cheer("Brilliant! You used the key correctly!"),
  cheer("That's exactly right! Well done, data detective!"),
  cheer("Amazing! You are a picture graph pro!"),
];
export const WRONG_NARRATIONS = [
  think("Not quite! Remember to multiply the number of pictures by the key."),
  think("Almost! Check the key first, then count the pictures carefully."),
];
export function bossBattleNarration() {
  return [emphasize("The Boss Battle begins! Answer every question correctly to defeat the boss and claim your Picto Master trophy!")];
}
export function bossWinNarration() {
  return [celebrate("You defeated the boss! The Golden Picture Graph Trophy is yours!")];
}
