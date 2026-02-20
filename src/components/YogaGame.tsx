import React, { useEffect, useState } from 'react';
import { Results } from '@mediapipe/pose';
import { LANDMARK_INDICES } from '../types';
import { calculateAngle } from '../utils/math';
import { motion } from 'motion/react';

interface YogaGameProps {
  results: Results | null;
  isPaused: boolean;
  onScore: (pts: number) => void;
}

export const YogaGame: React.FC<YogaGameProps> = ({ results, isPaused, onScore }) => {
  const [currentPose, setCurrentPose] = useState('Tree Pose');
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (!results?.poseLandmarks || isPaused) return;

    const landmarks = results.poseLandmarks;
    
    // Simple logic for "Tree Pose" (simplified for demo)
    // Check angle of the knee
    const leftHip = landmarks[LANDMARK_INDICES.LEFT_HIP];
    const leftKnee = landmarks[LANDMARK_INDICES.LEFT_KNEE];
    const leftAnkle = landmarks[LANDMARK_INDICES.LEFT_ANKLE];
    
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    
    // In Tree Pose, one leg is bent significantly
    const correct = kneeAngle < 120 && kneeAngle > 40;
    setIsCorrect(correct);

    if (correct) {
      setProgress(prev => Math.min(100, prev + 2));
      if (progress >= 99) {
        onScore(50);
        setProgress(0);
        // In a real app, switch to next pose
      }
    } else {
      setProgress(prev => Math.max(0, prev - 1));
    }
  }, [results, isPaused, progress, onScore]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="mb-8 text-center">
        <h3 className="text-3xl font-display font-bold text-white mb-2">{currentPose}</h3>
        <p className="text-zinc-400">Mantenha a posição para completar o ciclo</p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="#27272a"
            strokeWidth="8"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke={isCorrect ? "#10b981" : "#f43f5e"}
            strokeWidth="8"
            strokeDasharray="754"
            animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-bold">{Math.round(progress)}%</span>
          <span className={`text-[10px] font-mono uppercase tracking-widest mt-2 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isCorrect ? 'Pose Correta' : 'Ajuste sua Pose'}
          </span>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="p-4 glass-panel text-center">
          <span className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Ângulo do Joelho</span>
          <span className="text-xl font-display font-bold">~90°</span>
        </div>
        <div className="p-4 glass-panel text-center">
          <span className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Equilíbrio</span>
          <span className="text-xl font-display font-bold">Estável</span>
        </div>
      </div>
    </div>
  );
};
