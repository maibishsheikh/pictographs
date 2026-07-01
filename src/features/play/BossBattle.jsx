// src/features/play/BossBattle.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard.jsx';
import FeedbackOverlay from '../../components/FeedbackOverlay.jsx';
import Button from '../../components/Button.jsx';
import { XPPopup } from '../../components/CoinCounter.jsx';
import { XP_REWARDS } from '../../config/worlds.config.js';
import { sounds } from '../../utils/audio.js';
import { bossBattleNarration, bossWinNarration } from '../../utils/narration.js';

export default function BossBattle({ questions, world, worldAccent, onComplete, playNarration }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [lives, setLives] = useState(3);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [popups, setPopups] = useState([]);

  const boss = world?.boss ?? { name: 'Number Boss', emoji: '👑', reward: 'Boss Badge 👑' };
  const question = questions[index];
  const isLast = index >= questions.length - 1;

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    const isCorrect = selected === question.correctAnswer;
    setConfirmed(true);
    setShowFeedback(true);
    if (isCorrect) {
      sounds.correct();
      const gained = XP_REWARDS.CORRECT;
      setXp((x) => x + gained);
      setCorrect((c) => c + 1);
      setPopups((p) => [...p, { id: Date.now(), amount: gained }]);
      setTimeout(() => setPopups((p) => p.slice(1)), 1400);
    } else {
      sounds.wrong();
      setLives((l) => l - 1);
    }
  };

  const handleDismiss = () => {
    setShowFeedback(false);
    const isCorrect = selected === question?.correctAnswer;
    const dead = lives - (isCorrect ? 0 : 1) <= 0;

    if (dead && !isCorrect) {
      setLost(true);
      return;
    }
    if (isLast && isCorrect) {
      sounds.badge();
      setWon(true);
      playNarration?.(bossWinNarration());
      onComplete?.({ xp: xp + XP_REWARDS.BOSS_WIN, correct: correct + 1, total: questions.length, boss: true });
      return;
    }
    if (isLast) {
      onComplete?.({ xp, correct, total: questions.length, boss: true });
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setConfirmed(false);
  };

  if (!started) {
    return (
      <div className="boss-banner glass-card">
        <motion.div
          className="boss-emoji"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          {boss.emoji}
        </motion.div>
        <h2 className="boss-title">
          {boss.name}
        </h2>
        <p className="boss-subtitle">
          Answer {questions.length} questions correctly to defeat the boss!
          You have 3 lives ❤️❤️❤️
        </p>
        <div className="conversion-fact-box" style={{ marginBottom: 20 }}>
          🔑 Remember: <span className="mass-value">Symbols × Key = Total</span>
        </div>
        <Button variant="primary" size="lg" onClick={() => { playNarration?.(bossBattleNarration()); setStarted(true); }}>
          Begin Boss Battle! 👑
        </Button>
      </div>
    );
  }

  if (won) {
    return (
      <motion.div
        className="boss-result-screen"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="boss-result-emoji">🏆</div>
        <h2 className="boss-title">Boss Defeated!</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
          You earned: {boss.reward}
        </p>
        <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
          +{XP_REWARDS.BOSS_WIN} XP Bonus! 🎉
        </p>
      </motion.div>
    );
  }

  if (lost) {
    return (
      <div className="boss-result-screen">
        <div className="boss-result-emoji">💔</div>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', marginBottom: 8 }}>
          Out of lives! Try again!
        </h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          You answered {correct} / {questions.length} correctly.
        </p>
        <Button variant="primary" onClick={() => onComplete?.({ xp, correct, total: questions.length, boss: true, lost: true })}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div className="hud" style={{ marginBottom: 16 }}>
        <div className="hud-item hearts">
          {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
        </div>
        <div className="hud-item">⭐ {xp} XP</div>
        <div className="hud-item">📝 {index + 1} / {questions.length}</div>
      </div>

      {/* Boss health bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{boss.emoji} {boss.name}</span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((questions.length - correct) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--red), #ff6b6b)',
            }}
          />
        </div>
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
            Answer! ⚔️
          </Button>
        </div>
      )}

      <FeedbackOverlay
        visible={showFeedback}
        correct={selected === question?.correctAnswer}
        message={selected === question?.correctAnswer ? "That's exactly right! Well done! 🎉" : "Not quite! Remember: Symbols × Key = Total"}
        explanation={confirmed ? question?.explanation : null}
        onDismiss={handleDismiss}
        autoAdvanceMs={selected === question?.correctAnswer ? 1800 : undefined}
      />

      <XPPopup popups={popups} />
    </div>
  );
}
