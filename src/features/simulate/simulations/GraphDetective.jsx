// src/features/simulate/simulations/GraphDetective.jsx
import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button.jsx';
import PictographDisplay from '../../../components/PictographDisplay.jsx';
import {
  genMostLeast, genMoreFewer, genFindTotal, genFindDifference,
} from '../../../core/questions/questionGenerators.js';
import { sounds } from '../../../utils/audio.js';

const ROUNDS = 3;
const DETECTIVE_GENERATORS = [genMostLeast, genMoreFewer, genFindTotal, genFindDifference];

function newRound(idx) {
  const fn = DETECTIVE_GENERATORS[Math.floor(Math.random() * DETECTIVE_GENERATORS.length)];
  return fn(`detective_${idx}`, 2);
}

export default function GraphDetective({ onComplete }) {
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { setQuestion(newRound(0)); }, []);

  if (!question) return null;
  const isCorrect = selected === question.correctAnswer;

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    setConfirmed(true);
    if (isCorrect) { sounds.correct(); setScore((s) => s + 1); }
    else sounds.wrong();
  };

  const handleNext = () => {
    const next = round + 1;
    if (next >= ROUNDS) { onComplete?.(score); return; }
    setRound(next);
    setQuestion(newRound(next));
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

      <PictographDisplay {...question.graph} size="md" />

      <p className="sim-instruction" style={{ marginTop: 10 }}>{question.questionText}</p>

      <div className="options-grid">
        {question.options.map((opt) => {
          let cls = 'option-btn';
          if (confirmed) {
            if (opt === question.correctAnswer) cls += ' correct';
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
              {isCorrect ? '🔍 Case solved! Great detective work.' : `❌ Answer: ${question.correctAnswer}`}
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
