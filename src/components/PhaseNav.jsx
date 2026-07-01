import React from 'react';

export const JOURNEY_ITEMS = [
  { icon: '🤔', label: 'Wonder', phase: 'wonder' },
  { icon: '📖', label: 'Story', phase: 'story' },
  { icon: '🧪', label: 'Simulate', phase: 'simulate' },
  { icon: '🎮', label: 'Play', phase: 'play' },
  { icon: '📓', label: 'Reflect', phase: 'reflect' },
];

/**
 * Fixed top-centre JourneyBar — supports direct phase switching
 * (clicking any step navigates immediately, not linear-only).
 */
export default function PhaseNav({ currentPhase, onPhaseClick }) {
  if (currentPhase === 'intro') return null;

  return (
    <nav className="journey-bar" aria-label="Module phase navigation">
      {JOURNEY_ITEMS.map((item, idx) => (
        <React.Fragment key={item.phase}>
          <button
            className={`journey-step ${currentPhase === item.phase ? 'active' : ''}`}
            onClick={() => onPhaseClick(item.phase)}
            aria-current={currentPhase === item.phase ? 'step' : undefined}
          >
            <span className="journey-step-icon" aria-hidden="true">{item.icon}</span>
            <span className="journey-step-label">{item.label}</span>
            <span className="journey-step-dot" />
          </button>
          {idx < JOURNEY_ITEMS.length - 1 && <span className="journey-connector" aria-hidden="true" />}
        </React.Fragment>
      ))}
    </nav>
  );
}
