// src/features/simulate/simulations/KeyCracker.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button.jsx';
import PictographDisplay from '../../../components/PictographDisplay.jsx';
import { generateDataset } from '../../../core/questions/pictographFactory.js';
import { sounds } from '../../../utils/audio.js';

const ROUNDS = 3;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCountOptions(correct, scaleValue) {
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

function newRoundData() {
  const ds = generateDataset({ numCategories: randInt(3, 4) });
  const target = ds.categories[randInt(0, ds.categories.length - 1)];
  const options = buildCountOptions(target.count, ds.scaleValue);
  return { ds, target, options };
}

export default function KeyCracker({ onComplete }) {
  const [round, setRound] = useState(0);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { setData(newRoundData()); }, []);

  if (!data) return null;
  const { ds, target, options } = data;
  const isCorrect = selected === target.count;

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    setConfirmed(true);
    if (selected === target.count) { sounds.correct(); setScore((s) => s + 1); }
    else sounds.wrong();
  };

  const handleNext = () => {
    const next = round + 1;
    if (next >= ROUNDS) { onComplete?.(score); return; }
    setRound(next);
    setData(newRoundData());
    setSelected(null);
    setConfirmed(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6,
        fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        <span>Round {round + 1} / {ROUNDS}</span>
        <span>Score: {score}/{round}</span>
      </div>

      <p className="sim-instruction">
        How many votes does <strong>{target.label}</strong> really have?
      </p>

      <PictographDisplay
        title={ds.title}
        categories={ds.categories}
        scaleValue={ds.scaleValue}
        scaleEmoji={ds.scaleEmoji}
        highlightCategoryId={target.id}
        size="md"
      />

      <div className="options-grid" style={{ marginTop: 12 }}>
        {options.map((opt) => {
          let cls = 'option-btn';
          if (confirmed) {
            if (opt === target.count) cls += ' correct';
            else if (opt === selected) cls += ' wrong';
            else cls += ' disabled';
          } else if (selected === opt) cls += ' selected';
          return (
            <button key={opt} className={cls} onClick={() => !confirmed && setSelected(opt)}>
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 8, flexShrink: 0 }}>
        {!confirmed && (
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={!selected} style={{ width: '100%' }}>
            Check Answer ✓
          </Button>
        )}
        {confirmed && (
          <>
            <div style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)', marginBottom: 8,
              background: isCorrect ? 'rgba(76,175,80,0.12)' : 'rgba(239,83,80,0.12)',
              border: `1px solid ${isCorrect ? 'rgba(76,175,80,0.4)' : 'rgba(239,83,80,0.4)'}`,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center',
            }}>
              {isCorrect ? '🎉 Correct! Pictures × Key = Real Total!' : `❌ Answer: ${target.count}`}
            </div>
            <Button variant="primary" size="sm" onClick={handleNext} style={{ width: '100%' }}>
              {round + 1 >= ROUNDS ? 'Finish ⭐' : 'Next Round →'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
