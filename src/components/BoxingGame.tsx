import React, { useEffect, useState, useRef } from 'react';
import { Results } from '@mediapipe/pose';
import { Target } from '../constants';
import { LANDMARK_INDICES } from '../types';
import { checkCollision } from '../utils/math';
import { motion, AnimatePresence } from 'motion/react';

interface BoxingGameProps {
  results: Results | null;
  isPaused: boolean;
  onScore: (pts: number) => void;
}

export const BoxingGame: React.FC<BoxingGameProps> = ({ results, isPaused, onScore }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const lastSpawnRef = useRef<number>(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSpawnRef.current > 1500) {
        const newTarget: Target = {
          id: Math.random().toString(36).substr(2, 9),
          x: 0.2 + Math.random() * 0.6,
          y: 0.2 + Math.random() * 0.4,
          type: Math.random() > 0.5 ? 'left' : 'right',
          active: true,
          startTime: now,
        };
        setTargets(prev => [...prev, newTarget]);
        lastSpawnRef.current = now;
      }

      // Cleanup old targets
      setTargets(prev => prev.filter(t => now - t.startTime < 2000));
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (!results?.poseLandmarks || isPaused) return;

    const leftWrist = results.poseLandmarks[LANDMARK_INDICES.LEFT_WRIST];
    const rightWrist = results.poseLandmarks[LANDMARK_INDICES.RIGHT_WRIST];

    setTargets(prev => {
      let hit = false;
      const next = prev.map(target => {
        if (!target.active) return target;

        const wrist = target.type === 'left' ? leftWrist : rightWrist;
        // Mirroring correction: MediaPipe is mirrored
        const mirroredWrist = { ...wrist, x: 1 - wrist.x };

        if (checkCollision(mirroredWrist, target, 0.15)) {
          onScore(10);
          hit = true;
          return { ...target, active: false };
        }
        return target;
      });
      return hit ? next : prev;
    });
  }, [results, isPaused, onScore]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {targets.map(target => target.active && (
          <motion.div
            key={target.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className={`absolute w-24 h-24 rounded-full border-4 flex items-center justify-center ${
              target.type === 'left' ? 'border-emerald-500 bg-emerald-500/20' : 'border-rose-500 bg-rose-500/20'
            }`}
            style={{ 
              left: `${target.x * 100}%`, 
              top: `${target.y * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-white font-bold text-xl">
              {target.type === 'left' ? 'L' : 'R'}
            </div>
            {/* Countdown ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="276"
                className="opacity-30"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <h3 className="text-emerald-500 font-display font-bold text-lg uppercase tracking-widest mb-2">Alvos Ativos</h3>
        <p className="text-zinc-500 text-xs">Acerte os círculos com o pulso correspondente</p>
      </div>
    </div>
  );
};
