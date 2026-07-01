// src/features/play/TimedChallenge.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard.jsx';
import Button from '../../components/Button.jsx';
import { XPPopup } from '../../components/CoinCounter.jsx';
import { XP_REWARDS } from '../../config/worlds.config.js';
import { sounds } from '../../utils/audio.js';

const TIME_LIMIT = 60;

export default function TimedChallenge({ questions, worldAccent, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState(false);
  const [popups, setPopups] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (finished) onComplete?.({ xp, correct, total: questions.length, timed: true });
  }, [finished]);

  if (index >= questions.length && !finished) {
    onComplete?.({ xp, correct, total: questions.length, timed: true });
    return null;
  }

  const question = questions[index];
  const timerColor = timeLeft <= 10 ? 'var(--red)' : timeLeft <= 20 ? 'var(--gold)' : 'var(--green)';
  const timerPct = (timeLeft / TIME_LIMIT) * 100;

  const handleConfirm = () => {
    if (!selected || confirmed || finished) return;
    const isCorrect = selected === question.correctAnswer;
    setConfirmed(true);
    if (isCorrect) {
      sounds.correct();
      const gained = XP_REWARDS.CORRECT + 5; // bonus XP for timed
      setXp((x) => x + gained);
      setCorrect((c) => c + 1);
      setPopups((p) => [...p, { id: Date.now(), amount: gained }]);
      setTimeout(() => setPopups((p) => p.slice(1)), 1200);
    } else {
      sounds.wrong();
    }
    // Auto-advance after short delay
    setTimeout(() => {
      setIndex((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    }, 1200);
  };

  if (!question) return null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* HUD */}
      <div className="hud" style={{ marginBottom: 12 }}>
        <div className="hud-item" style={{ color: timerColor, fontWeight: 800 }}>
          ⏱️ {timeLeft}s
        </div>
        <div className="hud-item">⭐ {xp} XP</div>
        <div className="hud-item">📝 {index + 1} / {questions.length}</div>
      </div>

      {/* Timer bar */}
      <div className="progress-bar-track" style={{ marginBottom: 14 }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${timerPct}%`,
            background: `linear-gradient(90deg, ${timerColor}, ${timerColor}aa)`,
            transition: 'width 1s linear',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <QuestionCard
            question={question}
            selected={selected}
            confirmed={confirmed}
            onSelect={setSelected}
            showHint={false}
            worldAccent={worldAccent}
          />
        </motion.div>
      </AnimatePresence>

      {!confirmed && (
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <Button variant="primary" onClick={handleConfirm} disabled={!selected || finished}>
            Answer! ⚡
          </Button>
        </div>
      )}

      <XPPopup popups={popups} />
    </div>
  );
}
