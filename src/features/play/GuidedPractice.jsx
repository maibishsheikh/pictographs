// src/features/play/GuidedPractice.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard.jsx';
import FeedbackOverlay from '../../components/FeedbackOverlay.jsx';
import Button from '../../components/Button.jsx';
import { XPPopup } from '../../components/CoinCounter.jsx';
import { XP_REWARDS } from '../../config/worlds.config.js';
import { sounds } from '../../utils/audio.js';

export default function GuidedPractice({ questions, worldAccent, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [popups, setPopups] = useState([]);
  const question = questions[index];
  const isLast = index >= questions.length - 1;

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    const ok = selected === question.correctAnswer;
    setConfirmed(true); setShowFeedback(true);
    if (ok) {
      sounds.correct();
      setXp(x => x + XP_REWARDS.CORRECT); setCorrect(c => c + 1);
      setPopups(p => [...p, { id: Date.now(), amount: XP_REWARDS.CORRECT, x: '50%', y: '40%' }]);
      setTimeout(() => setPopups(p => p.slice(1)), 1400);
    } else {
      sounds.wrong();
    }
  };

  const handleDismiss = () => {
    setShowFeedback(false);
    if (isLast) { onComplete?.({ xp, correct, total: questions.length }); return; }
    setIndex(i => i + 1); setSelected(null); setConfirmed(false);
  };

  if (!question) return null;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      {/* HUD */}
      <div className="hud" style={{ flexShrink: 0 }}>
        <div className="hud-item">📝 {index + 1}/{questions.length}</div>
        <div className="hud-item">⭐ {xp} XP</div>
        <div className="hud-item">✅ {correct}</div>
      </div>
      {/* Progress */}
      <div className="progress-bar-track" style={{ flexShrink: 0 }}>
        <div className="progress-bar-fill" style={{ width: `${((index) / questions.length) * 100}%` }} />
      </div>

      {/* Question area */}
      <div className="play-question-area">
        <AnimatePresence mode="wait">
          <motion.div key={index}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
            <QuestionCard question={question} selected={selected} confirmed={confirmed}
              onSelect={setSelected} showHint worldAccent={worldAccent} />
          </motion.div>
        </AnimatePresence>
        {!confirmed && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <Button variant="primary" onClick={handleConfirm} disabled={!selected}>Check Answer ✓</Button>
          </div>
        )}
      </div>

      <FeedbackOverlay visible={showFeedback} correct={selected === question?.correctAnswer}
        message={selected === question?.correctAnswer ? "Excellent! You've got it! 🎉" : "Not quite — good try! 🤔"}
        explanation={confirmed ? question?.explanation : null}
        onDismiss={handleDismiss} autoAdvanceMs={selected === question?.correctAnswer ? 1800 : undefined} />
      <XPPopup popups={popups} />
    </div>
  );
}
