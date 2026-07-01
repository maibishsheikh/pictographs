import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button.jsx';

/**
 * Fullscreen feedback overlay shown after answering a question.
 *
 * props:
 *  - visible: boolean
 *  - correct: boolean
 *  - message: string (e.g. "Excellent! You've got it!")
 *  - explanation: string (optional, shown on both correct/wrong)
 *  - onDismiss: () => void (manual dismiss — required for wrong answers)
 *  - autoAdvanceMs: number (if set, auto-calls onDismiss after delay — correct answers)
 */
export default function FeedbackOverlay({
  visible,
  correct,
  message,
  explanation,
  onDismiss,
  autoAdvanceMs,
}) {
  React.useEffect(() => {
    if (visible && correct && autoAdvanceMs && onDismiss) {
      const t = setTimeout(onDismiss, autoAdvanceMs);
      return () => clearTimeout(t);
    }
  }, [visible, correct, autoAdvanceMs, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`feedback-overlay ${correct ? 'correct' : 'wrong'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="feedback-content"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <span className="feedback-emoji" role="img" aria-hidden="true">
              {correct ? '🎉' : '🤔'}
            </span>
            <div className="feedback-message">{message}</div>
            {explanation && (
              <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                {explanation}
              </div>
            )}
            {!correct && onDismiss && (
              <div style={{ marginTop: 18 }}>
                <Button variant="primary" size="sm" onClick={onDismiss}>
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
