import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated circular progress ring used for the Reflect-phase score circle.
 *
 * props:
 *  - value: number (0-100)
 *  - size: number (px)
 *  - strokeWidth: number
 *  - label: string (small caption under the value)
 *  - displayValue: string (text shown in the centre, e.g. "8/10")
 */
export default function ProgressRing({
  value = 0,
  size = 160,
  strokeWidth = 10,
  label = 'Score',
  displayValue,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
        }}
      >
        <span className="score-circle-value" style={{ fontSize: size * 0.22 }}>
          {displayValue ?? `${Math.round(value)}%`}
        </span>
        <span className="score-circle-label">{label}</span>
      </div>
    </div>
  );
}
