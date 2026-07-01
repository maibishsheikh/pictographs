// src/features/simulate/simulations/BuildAGraph.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button.jsx';
import PictographDisplay from '../../../components/PictographDisplay.jsx';
import { generateDataTable } from '../../../core/questions/pictographFactory.js';
import { sounds } from '../../../utils/audio.js';

const ROUNDS = 3;

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function newRoundData() {
  return generateDataTable({ numCategories: randInt(3, 4) });
}

export default function BuildAGraph({ onComplete }) {
  const [round, setRound] = useState(0);
  const [table, setTable] = useState(null);
  const [placed, setPlaced] = useState({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const startRound = () => {
    const t = newRoundData();
    setTable(t);
    const initial = {};
    t.categories.forEach((c) => { initial[c.id] = 0; });
    setPlaced(initial);
    setChecked(false);
  };

  useEffect(() => { startRound(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  if (!table) return null;

  const targetCounts = {};
  table.categories.forEach((c) => { targetCounts[c.id] = c.count; });

  const increment = (id) => {
    if (checked) return;
    setPlaced((prev) => {
      const cat = table.categories.find((c) => c.id === id);
      const next = Math.min(prev[id] + table.scaleValue, cat.count + table.scaleValue * 3);
      sounds.click();
      return { ...prev, [id]: next };
    });
  };
  const decrement = (id) => {
    if (checked) return;
    setPlaced((prev) => ({ ...prev, [id]: Math.max(0, prev[id] - table.scaleValue) }));
  };
  const resetRow = (id) => setPlaced((prev) => ({ ...prev, [id]: 0 }));
  const resetAll = () => {
    const cleared = {};
    table.categories.forEach((c) => { cleared[c.id] = 0; });
    setPlaced(cleared);
    setChecked(false);
  };

  const allMatched = table.categories.every((c) => placed[c.id] === c.count);

  const handleCheck = () => {
    if (!allMatched || checked) return;
    setChecked(true);
    sounds.correct();
    setScore((s) => s + 1);
  };

  const handleNext = () => {
    const next = round + 1;
    if (next >= ROUNDS) { onComplete?.(score); return; }
    setRound(next);
    startRound();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6,
        fontSize: '0.78rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
        <span>Round {round + 1} / {ROUNDS}</span>
        <span>Score: {score}/{round}</span>
      </div>

      <p className="sim-instruction">
        Tap + / − to place {table.scaleEmoji} symbols until each row matches the data table below.
      </p>

      {/* Data table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        {table.categories.map((c) => (
          <div key={c.id} style={{
            display: 'flex', justifyContent: 'space-between', padding: '4px 10px',
            background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem',
          }}>
            <span>{c.emoji} {c.label}</span>
            <span style={{ color: 'var(--gold)' }}>{c.count} votes</span>
          </div>
        ))}
      </div>

      <PictographDisplay
        title={table.title}
        categories={table.categories}
        scaleValue={table.scaleValue}
        scaleEmoji={table.scaleEmoji}
        editable
        placedCounts={placed}
        targetCounts={targetCounts}
        onIncrement={increment}
        onDecrement={decrement}
        size="md"
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' }}>
        <button className="bag-reset-btn" onClick={resetAll} type="button">↺ Reset All</button>
        {table.categories.map((c) => (
          <button key={c.id} className="bag-reset-btn" onClick={() => resetRow(c.id)} type="button">
            ↺ Reset {c.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 8, flexShrink: 0 }}>
        {!checked && (
          <Button variant="primary" size="sm" onClick={handleCheck} disabled={!allMatched} style={{ width: '100%' }}>
            Check Graph ✓
          </Button>
        )}
        {checked && (
          <>
            <div style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)', marginBottom: 8,
              background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.4)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.88rem', textAlign: 'center',
            }}>
              🎉 Great graph! Every row matches the data.
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
