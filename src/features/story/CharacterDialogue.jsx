// src/features/story/CharacterDialogue.jsx
import React from 'react';
import { CHARACTERS } from '../../config/characters.config.js';

// Map slide index → character
const SLIDE_CHARACTERS = ['sophie', 'emma', 'henry', 'emma', 'sophie'];

export default function CharacterDialogue({ slideIndex, text }) {
  const charKey = SLIDE_CHARACTERS[slideIndex] || 'sophie';
  const char = CHARACTERS[charKey];

  return (
    <div className="mascot-container" style={{ marginTop: 16 }}>
      <span className="mascot" role="img" aria-label={char.name}>{char.emoji}</span>
      <div className="speech-bubble" style={{ borderColor: `${char.colour}44` }}>
        {text}
      </div>
    </div>
  );
}
