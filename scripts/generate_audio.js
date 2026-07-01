// scripts/generate_audio.js
//
// Pre-generates all known narration phrases as .mp3 files into
// public/assets/audio/ and writes src/utils/audioMap.js.
//
// Usage: npm run generate-audio
// Requires: VITE_ELEVENLABS_API_KEY in .env.local

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...vals] = line.split('=');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}
loadEnv();

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('❌  VITE_ELEVENLABS_API_KEY not set in .env.local');
  process.exit(1);
}

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';
const VOICE_MODEL = 'eleven_multilingual_v2';
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'assets', 'audio');
const MAP_PATH  = path.join(__dirname, '..', 'src', 'utils', 'audioMap.js');

const VOICE_SETTINGS = {
  statement:     { stability: 0.65, similarity_boost: 0.80, style: 0.30 },
  question:      { stability: 0.55, similarity_boost: 0.75, style: 0.50 },
  encouragement: { stability: 0.50, similarity_boost: 0.85, style: 0.60 },
  emphasis:      { stability: 0.75, similarity_boost: 0.90, style: 0.20 },
  thinking:      { stability: 0.70, similarity_boost: 0.78, style: 0.40 },
  celebration:   { stability: 0.45, similarity_boost: 0.85, style: 0.80 },
  instruction:   { stability: 0.65, similarity_boost: 0.80, style: 0.30 },
};

// ── Phrases to pre-generate ────────────────────────────────────────────────
// Every string here must exactly match the text passed to playNarration()
// in src/utils/narration.js, so audioMap.js lookups succeed at runtime.
// Generated from the segments actually fired by the app — keep this in
// sync whenever narration.js changes.
const phrases = [
  // WONDER — narrated text is built from each WONDER_QUESTIONS entry
  // (question + subtext), so it always matches the on-screen card exactly.
  { text: "Hmm, I wonder! If I have 4 plates with 3 cookies on each, how many cookies are there in total?", style: 'encouragement' },
  { text: "What if there's a fast way to add the same number again and again?", style: 'thinking' },
  { text: "Hmm, I wonder! If there are 5 spiders and each spider has 8 legs, how many legs are there altogether?", style: 'encouragement' },
  { text: "Counting one by one takes so long — is there a quicker way?", style: 'thinking' },
  { text: "Hmm, I wonder! How can equal groups help us count things faster?", style: 'encouragement' },
  { text: "Equal groups are like teams of the same size!", style: 'thinking' },
  { text: "Hmm, I wonder! If we know how many groups and how many in each group, can we find the total without counting?", style: 'encouragement' },
  { text: "Multiplication is just adding the same number again and again!", style: 'thinking' },
  { text: "Hmm, I wonder! What happens when we put objects into rows and columns?", style: 'encouragement' },
  { text: "That's exactly what an array does!", style: 'thinking' },
  // STORY — Jack's Apple Baskets
  { text: "Jack picked apples from the orchard. He has 4 baskets, and he puts exactly 3 apples in each basket. Jack wonders... how many apples does he have in total? Let's help Jack!", style: 'statement' },
  { text: "Each basket has the same number of apples — that means they are equal groups! When groups are equal, we can find the total quickly using multiplication. 4 groups of 3 equals 12! Multiply means groups of the same size!", style: 'statement' },
  { text: "Jack drew his baskets in neat rows, like a grid. This is called an array. Each row has 3 apples, and there are 4 rows. The number of groups times the size of each group equals the total! Crack the multiplication code!", style: 'statement' },
  { text: "Jack was so excited! He learned he could use equal groups and arrays to multiply quickly instead of counting one by one. Multiplication — here we come! Your turn now!", style: 'celebration' },
  // SIMULATE
  { text: "Station one — Group and Count! Tap to add baskets and watch the total grow. Each basket has the same number of apples inside. Let's go!", style: 'statement' },
  { text: "Station two — Array Builder! Look at the equal groups diagram. Find the missing number to complete the multiplication fact. Look carefully!", style: 'statement' },
  { text: "Final station — Number Sentence! You will see a multiplication sentence with one blank. Use the number pad to fill it in. You've got this!", style: 'statement' },
  // PLAY — Boss Battle
  { text: "The Boss Battle begins! Answer the questions correctly to defeat the boss and claim your Multiplication Master trophy!", style: 'emphasis' },
  { text: "You defeated the boss! The Golden Multiplication Trophy is yours!", style: 'celebration' },
  // INTRO / reserved — not currently narrated on-screen, but pre-generated
  // for future use (e.g. if IntroScreen narration is wired in later).
  { text: "Let's explore equal groups and multiplication!", style: 'encouragement' },
];


// ── Helpers ───────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 55);
}

// ── CLI args ──────────────────────────────────────────────────────────────
// node scripts/generate_audio.js --index 4
// node scripts/generate_audio.js --text "Hello there!" --style celebration
// node scripts/generate_audio.js --list                (show all phrases + indices)
function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--index') out.index = parseInt(args[++i], 10);
    if (args[i] === '--text') out.text = args[++i];
    if (args[i] === '--style') out.style = args[++i];
    if (args[i] === '--list') out.list = true;
  }
  return out;
}

async function generateAudio(text, style) {
  const settings = VOICE_SETTINGS[style] ?? VOICE_SETTINGS.statement;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': API_KEY },
      body: JSON.stringify({ text, model_id: VOICE_MODEL, voice_settings: settings }),
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

// ── Main ──────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  const { index, text: cliText, style: cliStyle, list } = parseArgs();

  if (list) {
    phrases.forEach((p, i) => console.log(`[${i}] (${p.style}) ${p.text.slice(0, 70)}…`));
    return;
  }

  if (cliText) {
    const style = cliStyle || 'statement';
    const filename = `audio_${slugify(cliText)}.mp3`;
    const filePath = path.join(AUDIO_DIR, filename);
    console.log(`🎙  Generating single statement (${style}): "${cliText.slice(0, 60)}…"`);
    const buf = await generateAudio(cliText, style);
    fs.writeFileSync(filePath, buf);
    console.log(`✅  Saved: public/assets/audio/${filename}`);
    return;
  }

  if (Number.isInteger(index)) {
    const phrase = phrases[index];
    if (!phrase) {
      console.error(`❌  No phrase at index ${index}. Run with --list to see valid indices.`);
      return;
    }
    const filename = `audio_${slugify(phrase.text)}_${index}.mp3`;
    const filePath = path.join(AUDIO_DIR, filename);
    console.log(`🎙  Generating [${index}] ${phrase.style}: "${phrase.text.slice(0, 60)}…"`);
    const buf = await generateAudio(phrase.text, phrase.style);
    fs.writeFileSync(filePath, buf);
    console.log(`✅  Saved: public/assets/audio/${filename}`);
    console.log(`ℹ️   This single run does NOT rewrite audioMap.js — run without flags to regenerate the full map.`);
    return;
  }

  // No flags: full batch generation
  const audioMapEntries = [];
  let generated = 0;

  for (let i = 0; i < phrases.length; i++) {
    const { text, style } = phrases[i];
    const filename = `audio_${slugify(text)}_${i}.mp3`;
    const filePath = path.join(AUDIO_DIR, filename);
    const assetPath = `assets/audio/${filename}`;

    audioMapEntries.push([text, assetPath]);

    if (fs.existsSync(filePath)) {
      console.log(`⏭  Skipping (exists): ${filename}`);
      continue;
    }

    try {
      process.stdout.write(`🎙  Generating [${i + 1}/${phrases.length}] ${style}: "${text.slice(0, 48)}…" `);
      const buf = await generateAudio(text, style);
      fs.writeFileSync(filePath, buf);
      console.log(`✓ ${filename}`);
      generated++;
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.error(`\n❌  Failed: ${err.message}`);
    }
  }

  const mapContent = `// src/utils/audioMap.js
// AUTO-GENERATED by scripts/generate_audio.js — do not edit by hand.
// Run \`npm run generate-audio\` to regenerate.

export const audioMap = {
${audioMapEntries.map(([text, p]) => `  ${JSON.stringify(text)}: ${JSON.stringify(p)},`).join('\n')}
};
`;
  fs.writeFileSync(MAP_PATH, mapContent);

  console.log(`\n✅  Done. Generated ${generated} new files. audioMap.js updated (${audioMapEntries.length} entries).`);
})();
