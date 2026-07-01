// src/App.jsx
import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import IntroScreen    from './components/IntroScreen.jsx';
import PhaseNav       from './components/PhaseNav.jsx';
import TopBar         from './components/TopBar.jsx';
import FloatingSymbols from './components/FloatingSymbols.jsx';

import WonderPhase   from './features/wonder/WonderPhase.jsx';
import StoryPhase    from './features/story/StoryPhase.jsx';
import SimulatePhase from './features/simulate/SimulatePhase.jsx';
import PlayPhase     from './features/play/PlayPhase.jsx';
import ReflectPhase  from './features/reflect/ReflectPhase.jsx';

import { useAudio } from './core/audio/useAudio.js';
import { resetSession } from './core/questions/questionFactory.js';

const PHASE_ORDER = ['intro', 'wonder', 'story', 'simulate', 'play', 'reflect'];

// Simple fade variant — no y-shift so there's no layout jump
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.22 } },
};

export default function App() {
  const [phase, setPhase] = useState('intro');
  const { audioEnabled, toggleAudio, playNarration, stop } = useAudio();

  const go = useCallback((targetPhase) => {
    stop();
    setPhase(targetPhase);
  }, [stop]);

  const advance = useCallback(() => {
    stop();
    const idx = PHASE_ORDER.indexOf(phase);
    if (idx < PHASE_ORDER.length - 1) setPhase(PHASE_ORDER[idx + 1]);
  }, [phase, stop]);

  const goHome = useCallback(() => { stop(); setPhase('intro'); }, [stop]);

  const restart = useCallback(() => {
    stop();
    resetSession();
    setPhase('wonder');
  }, [stop]);

  const audioProps = { playNarration, stop, audioEnabled };

  return (
    <div className="app-container">
      <FloatingSymbols />
      <TopBar audioEnabled={audioEnabled} onToggleAudio={toggleAudio} onHome={goHome} showHome={phase !== 'intro'} />
      <PhaseNav currentPhase={phase} onPhaseClick={go} />

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
          {phase === 'intro'    && <IntroScreen onBegin={() => go('wonder')} />}
          {phase === 'wonder'   && <WonderPhase   onComplete={advance} {...audioProps} />}
          {phase === 'story'    && <StoryPhase     onComplete={advance} {...audioProps} />}
          {phase === 'simulate' && <SimulatePhase  onComplete={advance} {...audioProps} />}
          {phase === 'play'     && <PlayPhase      onComplete={advance} {...audioProps} />}
          {phase === 'reflect'  && <ReflectPhase   onHome={goHome} onRestart={restart} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
