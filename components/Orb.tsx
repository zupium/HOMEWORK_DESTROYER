import React, { useId } from 'react';

/** Orb planet dengan cincin berputar — dipakai untuk logo dan tampilan kosong. */
export function Orb() {
  const id = useId().replace(/:/g, '');
  return (
    <svg className="orb" viewBox="0 0 90 90" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`core-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8fe6ff" />
          <stop offset="45%" stopColor="#00c8ff" />
          <stop offset="100%" stopColor="#7b4fff" />
        </radialGradient>
        <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00c8ff" />
          <stop offset="100%" stopColor="#7b4fff" />
        </linearGradient>
      </defs>
      <circle cx="45" cy="45" r="20" fill={`url(#core-${id})`} />
      <circle cx="45" cy="45" r="30" stroke="rgba(0,200,255,0.18)" strokeWidth="1" />
      <g className="orb-ring">
        <ellipse
          cx="45" cy="45" rx="40" ry="14"
          stroke={`url(#ring-${id})`} strokeWidth="1.6"
          transform="rotate(-25 45 45)"
        />
        <circle cx="80" cy="34" r="3" fill="#00ffaa" />
      </g>
    </svg>
  );
}
