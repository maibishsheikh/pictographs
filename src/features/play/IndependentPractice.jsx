// src/features/play/IndependentPractice.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard.jsx';
import FeedbackOverlay from '../../components/FeedbackOverlay.jsx';
import Button from '../../components/Button.jsx';
import { XPPopup } from '../../components/CoinCounter.jsx';
import { XP_REWARDS } from '../../config/worlds.config.js';
import { sounds } from '../../utils/audio.js';

export default function IndependentPractice({ questions, worldAccent, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [popups, setPopups] = useState([]);

  const question = questions[index];
  const isLast = index >= questions.length - 1;

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    const isCorrect = selected === question.correctAnswer;
    setConfirmed(true);
    setShowFeedback(true);

    if (isCorrect) {
      sounds.correct();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const gained = newStreak >= 5 ? XP_REWARDS.STREAK_BONUS : XP_REWARDS.CORRECT;
      setXp((x) => x + gained);
      setCorrect((c) => c + 1);
      setPopups((p) => [...p, { id: Date.now(), amount: gained }]);
      setTimeout(() => setPopups((p) => p.slice(1)), 1400);
    } else {
      sounds.wrong();
      setStreak(0);
      setLives((l) => Math.max(0, l - 1));
    }
  };

  const handleDismiss = () => {
    setShowFeedback(false);
    if (isLast || lives === 0) {
      onComplete?.({ xp, correct, total: questions.length, streak });
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  if (!question) return null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="hud" style={{ marginBottom: 16 }}>
        <div className="hud-item hearts">
          {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
        </div>
        <div className="hud-item">⭐ {xp} XP</div>
        {streak >= 2 && <div className="hud-item">🔥 {streak} Streak</div>}
        <div className="hud-item">📝 {index + 1} / {questions.length}</div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
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
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button variant="primary" onClick={handleConfirm} disabled={!selected}>
            Check Answer ✓
          </Button>
        </div>
      )}

      <FeedbackOverlay
        visible={showFeedback}
        correct={selected === question?.correctAnswer}
        message={selected === question?.correctAnswer ? "Brilliant! Keep going! 🎉" : "Almost! Check the key and count carefully."}
        explanation={confirmed ? question?.explanation : null}
        onDismiss={handleDismiss}
        autoAdvanceMs={selected === question?.correctAnswer ? 1800 : undefined}
      />

      <XPPopup popups={popups} />
    </div>
  );
}
