// src/features/play/PlayPhase.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuidedPractice      from './GuidedPractice.jsx';
import IndependentPractice from './IndependentPractice.jsx';
import TimedChallenge      from './TimedChallenge.jsx';
import BossBattle          from './BossBattle.jsx';
import Button              from '../../components/Button.jsx';
import { WORLDS, PLAY_MODES, XP_REWARDS } from '../../config/worlds.config.js';
import { generateModeQuestions } from '../../core/questions/questionFactory.js';
import { calcStars } from '../../core/questions/questionBank.js';

function StarRow({ stars }) {
  return (
    <div className="star-rating" style={{ fontSize: '1.2rem', margin: 0 }}>
      {[0, 1, 2].map(i => <span key={i} className={i < stars ? 'star-filled' : 'star-empty'}>⭐</span>)}
    </div>
  );
}

// ── World selector ────────────────────────────────────────────────────────
function WorldSelector({ onSelect, worldProgress }) {
  return (
    <div className="play-screen">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', textAlign: 'center', flexShrink: 0 }}>
        Choose Your World 🌍
      </h2>
      <div className="world-grid">
        {WORLDS.map(world => {
          const prog = worldProgress[world.id] ?? {};
          const stars = prog.correct !== undefined ? calcStars(prog.correct ?? 0, prog.total ?? 1) : 0;
          return (
            <motion.div key={world.id} className="world-card glass-card"
              whileHover={{ y: -3, boxShadow: `0 8px 24px ${world.accent}44` }}
              onClick={() => onSelect(world)}
              style={{ borderColor: `${world.accent}44`, cursor: 'pointer' }}>
              <div className="world-emoji">{world.emoji}</div>
              <div className="world-name" style={{ color: world.accent }}>{world.name}</div>
              <div className="world-desc">{world.description}</div>
              {prog.correct !== undefined && <StarRow stars={stars} />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Mode selector ─────────────────────────────────────────────────────────
function ModeSelector({ world, onSelect, onBack }) {
  return (
    <div className="play-screen">
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 700, alignSelf: 'flex-start', flexShrink: 0 }}>← Back</button>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', textAlign: 'center', flexShrink: 0 }}>
        {world.emoji} {world.name}
      </h2>
      <div className="mode-grid">
        {PLAY_MODES.map(mode => (
          <motion.div key={mode.id} className="mode-card glass-card"
            whileHover={{ y: -2 }} onClick={() => onSelect(mode)} style={{ cursor: 'pointer' }}>
            <div className="mode-icon">{mode.icon}</div>
            <div className="mode-name">{mode.name}</div>
            <div className="mode-desc">{mode.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── World complete ────────────────────────────────────────────────────────
function WorldComplete({ world, result, onPlayAgain, onChooseWorld, onReflect }) {
  const stars = calcStars(result.correct, result.total);
  return (
    <div className="play-screen">
      <motion.div className="glass-card"
        style={{ maxWidth: 440, width: '100%', padding: '24px 28px', textAlign: 'center' }}
        initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div style={{ fontSize: '2.6rem', marginBottom: 6 }}>{world.emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', color: 'var(--gold)', marginBottom: 6 }}>
          {world.name} Complete!
        </h2>
        <StarRow stars={stars} />
        <p style={{ margin: '10px 0', fontSize: '1rem' }}>
          {result.correct} / {result.total} correct · {result.xp} XP
        </p>
        {result.boss && !result.lost && (
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>
            👑 Boss Defeated! +{XP_REWARDS.BOSS_WIN} XP
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          <Button variant="outline" size="sm" onClick={onPlayAgain}>🔄 Again</Button>
          <Button variant="outline" size="sm" onClick={onChooseWorld}>🌍 Worlds</Button>
          <Button variant="primary" size="sm" onClick={onReflect}>📓 Reflect</Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main PlayPhase ────────────────────────────────────────────────────────
export default function PlayPhase({ onComplete, playNarration }) {
  const [screen, setScreen] = useState('worlds');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [worldProgress, setWorldProgress] = useState({});
  const [lastResult, setLastResult] = useState(null);

  const handleWorldSelect = w => { setSelectedWorld(w); setScreen('modes'); };
  const handleModeSelect = m => {
    setSelectedMode(m);
    setQuestions(generateModeQuestions(selectedWorld.id, m.questionCount, { excludeHard: m.id === 'guided' }));
    setScreen('playing');
  };
  const handleGameComplete = useCallback(result => {
    setLastResult(result);
    setWorldProgress(prev => ({ ...prev, [selectedWorld.id]: result }));
    setScreen('worldComplete');
  }, [selectedWorld]);

  const renderGame = () => {
    const props = { questions, worldAccent: selectedWorld?.accent, onComplete: handleGameComplete, playNarration };
    switch (selectedMode?.id) {
      case 'guided':      return <GuidedPractice      {...props} />;
      case 'independent': return <IndependentPractice {...props} />;
      case 'timed':       return <TimedChallenge      {...props} />;
      case 'boss':        return <BossBattle          {...props} world={selectedWorld} />;
      default: return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {screen === 'worlds' && (
        <motion.div key="worlds" style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <WorldSelector onSelect={handleWorldSelect} worldProgress={worldProgress} />
        </motion.div>
      )}
      {screen === 'modes' && selectedWorld && (
        <motion.div key="modes" style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <ModeSelector world={selectedWorld} onSelect={handleModeSelect} onBack={() => setScreen('worlds')} />
        </motion.div>
      )}
      {screen === 'playing' && (
        <motion.div key="playing" style={{ position: 'absolute', inset: 0, top: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 14px', overflowY: 'auto', overflowX: 'hidden' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%', maxWidth: 600, flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <button onClick={() => setScreen('modes')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'inherit' }}>
              ← {selectedWorld?.emoji} {selectedWorld?.name}
            </button>
            <span>·</span>
            <span style={{ color: selectedWorld?.accent }}>{selectedMode?.icon} {selectedMode?.name}</span>
          </div>
          {renderGame()}
        </motion.div>
      )}
      {screen === 'worldComplete' && lastResult && selectedWorld && (
        <motion.div key="complete" style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <WorldComplete world={selectedWorld} result={lastResult}
            onPlayAgain={() => handleModeSelect(selectedMode)}
            onChooseWorld={() => setScreen('worlds')}
            onReflect={onComplete} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
