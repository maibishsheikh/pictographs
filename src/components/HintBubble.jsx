import React from 'react';
import { motion } from 'framer-motion';

export default function HintBubble({ children }) {
  return (
    <motion.div
      className="hint-bubble"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span aria-hidden="true">💡</span>
      <span>{children}</span>
    </motion.div>
  );
}
