import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function ProgressRing({ percentage = 0, label = 'Overall Progress', size = 120 }) {
  const rounded = Math.round(percentage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: size, height: size }}>
        <CircularProgressbar
          value={rounded}
          text={`${rounded}%`}
          styles={buildStyles({
            textSize: '20px',
            pathColor: 'var(--bg-accent)',
            textColor: 'var(--text-primary)',
            trailColor: 'var(--bg-tertiary)',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
      {label && (
        <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
