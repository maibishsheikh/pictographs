// scripts/clean_audio.js
//
// Repository hygiene utility: deletes any .mp3 files in
// public/assets/audio/ that are no longer referenced by audioMap.js
// (e.g. after narration text was changed or removed).
//
// Usage: node scripts/clean_audio.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR = path.join(__dirname, '..', 'public', 'assets', 'audio');
const MAP_PATH = path.join(__dirname, '..', 'src', 'utils', 'audioMap.js');

async function main() {
  if (!fs.existsSync(AUDIO_DIR)) {
    console.log('ℹ️   No audio directory found — nothing to clean.');
    return;
  }

  const mapUrl = `file://${MAP_PATH.replace(/\\/g, '/')}?t=${Date.now()}`;
  const { audioMap } = await import(mapUrl);

  const validFilenames = new Set(
    Object.values(audioMap).map((p) => path.basename(p))
  );

  const files = fs.readdirSync(AUDIO_DIR).filter((f) => f.endsWith('.mp3'));
  let removed = 0;

  for (const file of files) {
    if (!validFilenames.has(file)) {
      fs.unlinkSync(path.join(AUDIO_DIR, file));
      console.log(`🗑   Removed orphaned file: ${file}`);
      removed++;
    }
  }

  console.log(
    removed > 0
      ? `✅  Cleaned ${removed} orphaned file(s). ${validFilenames.size} active file(s) kept.`
      : `✅  Nothing to clean — all ${files.length} file(s) are referenced in audioMap.js.`
  );
}

main();
