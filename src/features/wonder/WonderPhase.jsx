// src/features/wonder/WonderPhase.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button.jsx';
import { WONDER_QUESTIONS } from './wonder.constants.js';
import { wonderHookNarration } from '../../utils/narration.js';

export default function WonderPhase({ onComplete, playNarration }) {
  const [step, setStep] = useState(0); // 0=orb, 1=mascot, 2=card, 3=btn
  const wonder = useMemo(
    () => WONDER_QUESTIONS[Math.floor(Math.random() * WONDER_QUESTIONS.length)],
    []
  );
  const narrationFiredRef = useRef(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (step >= 2 && !narrationFiredRef.current) {
      narrationFiredRef.current = true;
      const segments = wonderHookNarration(wonder);
      if (segments.length > 0) playNarration?.(segments);
    }
  }, [step, wonder, playNarration]);

  return (
    <div className="wonder-screen">
      {/* Pulsing orb */}
      <motion.div
        className="wonder-orb"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      >
        ?
      </motion.div>

      {/* Mascot */}
      {step >= 1 && (
        <motion.div
          className="mascot-container"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <span className="mascot" role="img" aria-label="Tally">🦉</span>
          <div className="speech-bubble">Hmm, I wonder… what do you think? 🤔</div>
        </motion.div>
      )}

      {/* Question card */}
      {step >= 2 && (
        <motion.div
          className="wonder-card glass-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="wonder-emoji" role="img" aria-hidden="true">{wonder.emoji}</div>
          <p className="wonder-question">{wonder.question}</p>
          <p className="wonder-subtext">{wonder.subtext}</p>
        </motion.div>
      )}

      {/* CTA button */}
      {step >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="primary" size="lg" onClick={onComplete}>
            Let's Discover! ✨
          </Button>
        </motion.div>
      )}
    </div>
  );
}
