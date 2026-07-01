import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Displays an XP popup that floats up and fades out.
 * Renders a list of currently-active popups (keyed by id).
 */
export function XPPopup({ popups }) {
  return (
    <AnimatePresence>
      {popups.map((p) => (
        <motion.div
          key={p.id}
          className="xp-popup"
          style={{ left: p.x ?? '50%', top: p.y ?? '50%' }}
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -60, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          +{p.amount} XP
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

/**
 * Simple coin/gem counter pill — used in HUD displays.
 */
export default function CoinCounter({ icon = '🪙', value, label }) {
  return (
    <div className="hud-item">
      <span aria-hidden="true">{icon}</span>
      <span>{value}{label ? ` ${label}` : ''}</span>
    </div>
  );
}
