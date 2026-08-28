'use client';

import { getInvestmentColor } from '../lib/utils';
import { useEffect, useState } from 'react';

export default function InvestmentGauge({ score, size = 120 }: { score: number, size?: number }) {
  const [progress, setProgress] = useState(0);
  const color = getInvestmentColor(score);
  
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => {
      setProgress(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--bg-secondary)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: size * 0.25, fontWeight: 'bold', color: 'var(--text-primary)' }}>{score}</span>
      </div>
    </div>
  );
}