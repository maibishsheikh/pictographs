import React from 'react';

/**
 * PictographDisplay — renders a scaled picture graph.
 *
 * props:
 *  - title: string
 *  - categories: [{ id, label, emoji, count }]   count = REAL quantity
 *  - scaleValue: number   (key value: 2, 5, or 10)
 *  - scaleEmoji: string   (symbol drawn in the key)
 *  - highlightCategoryId?: string   (glow one row)
 *  - editable?: boolean   (Build-a-Graph mode)
 *  - placedCounts?: { [categoryId]: number }  REAL quantity currently placed (editable mode)
 *  - targetCounts?: { [categoryId]: number }  REAL quantity target (editable mode, for the green-lock check)
 *  - onIncrement?: (id) => void
 *  - onDecrement?: (id) => void
 *  - size?: 'sm' | 'md'
 */
export default function PictographDisplay({
  title,
  categories = [],
  scaleValue,
  scaleEmoji,
  highlightCategoryId,
  editable = false,
  placedCounts = {},
  targetCounts = {},
  onIncrement,
  onDecrement,
  size = 'md',
}) {
  return (
    <div className={`pictograph-card pictograph-${size}`}>
      {title && <div className="pictograph-title">{title}</div>}

      {categories.map((cat) => {
        const realCount = editable ? (placedCounts[cat.id] ?? 0) : cat.count;
        const symbolCount = scaleValue ? Math.round(realCount / scaleValue) : 0;
        const isHighlighted = !editable && highlightCategoryId === cat.id;
        const isMatched = editable && targetCounts[cat.id] !== undefined && realCount === targetCounts[cat.id];

        return (
          <div
            key={cat.id}
            className={`pictograph-row ${isHighlighted ? 'highlight' : ''} ${isMatched ? 'bag-row-matched' : ''}`}
          >
            <div className="pictograph-row-label">
              <span aria-hidden="true">{cat.emoji}</span> {cat.label}
            </div>
            <div className="pictograph-symbols" aria-label={`${symbolCount} symbols`}>
              {Array.from({ length: symbolCount }).map((_, i) => (
                <span key={i} aria-hidden="true">{scaleEmoji}</span>
              ))}
            </div>
            {editable ? (
              <div className="bag-row-controls">
                <button
                  type="button"
                  className="bag-count-btn"
                  aria-label={`Remove one ${cat.label} symbol`}
                  onClick={() => onDecrement?.(cat.id)}
                  disabled={realCount <= 0}
                >
                  −
                </button>
                <span className="bag-current-count">{symbolCount}</span>
                <button
                  type="button"
                  className="bag-count-btn"
                  aria-label={`Add one ${cat.label} symbol`}
                  onClick={() => onIncrement?.(cat.id)}
                >
                  +
                </button>
              </div>
            ) : (
              <div className="pictograph-row-total">= {cat.count}</div>
            )}
          </div>
        );
      })}

      {scaleValue != null && (
        <div className="key-fact-box">
          <span className="key-value">🔑 Key: 1 {scaleEmoji} = {scaleValue}</span>
        </div>
      )}
    </div>
  );
}
