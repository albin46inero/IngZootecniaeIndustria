// components/FloatingParticles.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function FloatingParticles({ 
  count = 10, 
  className = '' 
}: { 
  count?: number; 
  className?: string;
}) {
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    width: number;
    height: number;
    left: string;
    top: string;
    duration: number;
    delay: number;
    xOffset: number;
  }>>([]);

  useEffect(() => {
    setIsClient(true);
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      width: Math.random() * 60 + 30,
      height: Math.random() * 60 + 30,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 6 + 6,
      delay: Math.random() * 2,
      xOffset: Math.random() * 30 - 15,
    }));
    setParticles(generated);
  }, [count]);

  if (!isClient) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          style={{
            width: particle.width,
            height: particle.height,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}