// src/features/story/StoryPhase.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterDialogue from './CharacterDialogue.jsx';
import Button from '../../components/Button.jsx';
import { STORY_SLIDES } from './storyScripts/slides.js';
import { storyNarrations } from '../../utils/narration.js';

const CHAR_DIALOGUE = [
  "Let's help count the votes! 🍓",
  "Always check the key first! 🔑",
  "Pictures × Key = Total votes! 🧮",
  "Let's read the whole graph together! 📊",
  "Your turn now! 🚀",
];

// Per-slide image with graceful error fallback. When `src` is null/undefined
// (no artwork supplied yet), renders the same placeholder frame used for a
// broken/missing image, so the layout never shifts once real art is added.
function SlideImage({ src, alt }) {
  const [errored, setErrored] = useState(false);

  // Reset error state whenever the src changes (slide navigation)
  useEffect(() => { setErrored(false); }, [src]);

  if (!src || errored) {
    return (
      <div className="story-image-placeholder">
        <span className="story-image-placeholder-icon" aria-hidden="true">🖼️</span>
        <span>Image coming soon</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      onError={() => setErrored(true)}
    />
  );
}

export default function StoryPhase({ onComplete, playNarration, stop }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection]       = useState(1);
  // Track the slide that triggered the most recent narration call
  // so the cleanup knows whether to stop (avoids cancelling a narration
  // that belongs to a different phase transition handled by App.jsx).
  const narrationSlideRef = useRef(-1);

  const total  = STORY_SLIDES.length;
  const slide  = STORY_SLIDES[currentSlide];
  const isLast = currentSlide === total - 1;

  // ── Fire narration on every slide visit ──────────────────────────────────
  useEffect(() => {
    const seg = storyNarrations.pictoquest[currentSlide];
    if (seg) {
      narrationSlideRef.current = currentSlide;
      // ⚠️  Wrap single segment in array — narrate() iterates over segments.length
      playNarration?.([seg]);
    }

    return () => {
      // Stop when slide changes or component unmounts
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const goTo = (idx) => {
    stop?.();
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  const goNext = () => (isLast ? onComplete?.() : goTo(currentSlide + 1));
  const goBack = () => currentSlide > 0 && goTo(currentSlide - 1);

  return (
    <div className="story-screen">
      <div className="story-card glass-card">

        {/* ── Slide image (blank placeholder until artwork is supplied) ── */}
        <div className="story-image-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              style={{ width: '100%', height: '100%' }}
            >
              <SlideImage src={slide.image} alt={slide.title} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Text content ── */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 28 }}
            transition={{ duration: 0.28 }}
            className="story-content"
          >
            <h2 className="story-title">{slide.title}</h2>
            <p className="story-body">{slide.text}</p>
            {slide.highlight && <div className="story-highlight">{slide.highlight}</div>}
            {slide.answer    && <p className="story-answer">💡 {slide.answer}</p>}
            <CharacterDialogue slideIndex={currentSlide} text={CHAR_DIALOGUE[currentSlide]} />
          </motion.div>
        </AnimatePresence>

        {/* ── Navigation bar ── */}
        <div className="story-nav">
          <Button variant="outline" size="sm" onClick={goBack} disabled={currentSlide === 0}>
            ← Back
          </Button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className="story-dots">
              {STORY_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`story-dot ${i === currentSlide ? 'active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <span style={{
              fontSize: '0.68rem',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
            }}>
              {currentSlide + 1} / {total}
            </span>
          </div>

          <Button variant="primary" size="sm" onClick={goNext}>
            {isLast ? 'Simulate! 🧪' : 'Next →'}
          </Button>
        </div>

      </div>
    </div>
  );
}
