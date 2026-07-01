// src/core/hooks/useKeyboard.js
import { useEffect } from 'react';

/**
 * Calls `onEnter`/`onEscape`/`onArrow` for keyboard-driven navigation,
 * supporting WCAG keyboard-accessibility requirements.
 */
export function useKeyboard({ onEnter, onEscape, onArrowLeft, onArrowRight } = {}) {
  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'Enter':
        case ' ':
          if (onEnter) {
            e.preventDefault();
            onEnter(e);
          }
          break;
        case 'Escape':
          if (onEscape) onEscape(e);
          break;
        case 'ArrowLeft':
          if (onArrowLeft) onArrowLeft(e);
          break;
        case 'ArrowRight':
          if (onArrowRight) onArrowRight(e);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, onEscape, onArrowLeft, onArrowRight]);
}
