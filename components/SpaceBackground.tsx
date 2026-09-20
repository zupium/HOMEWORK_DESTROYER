'use client';

import React, { useEffect, useState } from 'react';

interface Star {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

/** Latar luar angkasa: bintang berkelip, nebula, dan garis scan halus. */
export function SpaceBackground() {
  const [stars, setStars] = useState<Star[]>([]);

  // Dibuat di client agar tidak terjadi hydration mismatch (Math.random).
  useEffect(() => {
    setStars(
      Array.from({ length: 110 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 0.6,
        opacity: Math.random() * 0.5 + 0.2,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5
      }))
    );
  }, []);

  return (
    <>
      <div id="starfield" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="star-dot"
            style={
              {
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                '--o': s.opacity,
                '--d': `${s.duration}s`,
                animationDelay: `${s.delay}s`
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="nebula nebula-1" aria-hidden="true" />
      <div className="nebula nebula-2" aria-hidden="true" />
      <div className="nebula nebula-3" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
    </>
  );
}
