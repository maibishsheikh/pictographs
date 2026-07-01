import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button.jsx';

const PHASES = [
  { icon: '🤔', label: 'Wonder',   desc: 'A data mystery!' },
  { icon: '📖', label: 'Story',    desc: "Sophie's Fun Fair" },
  { icon: '🧪', label: 'Simulate', desc: 'Build a graph' },
  { icon: '🎮', label: 'Play',     desc: '100 challenges' },
  { icon: '📓', label: 'Reflect',  desc: 'Quiz & review' },
];

const FEATURES = [
  { icon: '🎯', label: '100 Questions' },
  { icon: '📊', label: 'Picture Graphs' },
  { icon: '🏆', label: 'Badges & XP' },
];

export default function IntroScreen({ onBegin }) {
  return (
    <div className="intro-screen">
      <motion.div className="intro-badge"
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        ✨ Intellia Global · Grade 2 Maths
      </motion.div>

      <motion.h1 className="intro-title"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 200, damping: 16 }}>
        <span className="title-main">PictoQuest</span>
        <span className="title-sub">Data Handling — Reading Pictographs</span>
      </motion.h1>

      {/* Mascot teaser */}
      <motion.div className="mascot-container"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <span className="mascot" role="img" aria-label="Tally the Owl">🦉</span>
        <div className="speech-bubble">Read it. Count it. Crack the data! 📊</div>
      </motion.div>

      {/* Journey map */}
      <motion.div className="intro-journey-map"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        {PHASES.map((step, i) => (
          <motion.div key={step.label} className="intro-journey-step glass-card"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 + i * 0.06 }}>
            <span className="step-icon" role="img" aria-hidden="true">{step.icon}</span>
            <div className="step-label">{step.label}</div>
            <div className="step-desc">{step.desc}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Button variant="primary" size="lg" onClick={onBegin}>🚀 Begin Your Journey!</Button>
      </motion.div>

      <div className="intro-feature-cards">
        {FEATURES.map(f => (
          <div key={f.label} className="intro-feature-card glass-card">{f.icon} {f.label}</div>
        ))}
      </div>
    </div>
  );
}
