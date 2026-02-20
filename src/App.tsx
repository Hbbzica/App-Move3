/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Dumbbell, 
  Music, 
  Wind, 
  LayoutDashboard, 
  Play, 
  ArrowLeft,
  Trophy,
  Flame,
  Timer
} from 'lucide-react';
import { PoseTracker } from './components/PoseTracker';
import { VoiceController } from './components/VoiceController';
import { GameMode, MOTIVATIONAL_PHRASES, WorkoutStats } from './constants';
import { Results } from '@mediapipe/pose';
import { estimateCalories } from './utils/math';
import confetti from 'canvas-confetti';

// Game Components
import { BoxingGame } from './components/BoxingGame';
import { YogaGame } from './components/YogaGame';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [mode, setMode] = useState<GameMode>('menu');
  const [score, setScore] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastResults, setLastResults] = useState<Results | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [phrase, setPhrase] = useState(MOTIVATIONAL_PHRASES[0]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (mode !== 'menu' && mode !== 'dashboard' && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        if (duration % 15 === 0) {
          setPhrase(MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, isPaused, duration]);

  const handlePoseResults = useCallback((results: Results) => {
    setLastResults(results);
  }, []);

  const handleVoiceCommand = useCallback((command: string) => {
    if (command === 'start') setIsPaused(false);
    if (command === 'pause') setIsPaused(true);
    if (command === 'menu') setMode('menu');
  }, []);

  const startWorkout = (newMode: GameMode) => {
    setMode(newMode);
    setScore(0);
    setDuration(0);
    setIsPaused(false);
    setStats(null);
  };

  const finishWorkout = () => {
    const finalStats: WorkoutStats = {
      mode,
      duration,
      score,
      calories: Math.round(estimateCalories(mode, duration)),
      accuracy: Math.min(100, Math.round((score / (duration * 2)) * 100)),
      timestamp: Date.now(),
    };
    setStats(finalStats);
    setMode('dashboard');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#ffffff', '#34d399']
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">MOVER<span className="text-emerald-500">3</span></h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Vision Health Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {mode !== 'menu' && mode !== 'dashboard' && (
            <div className="flex items-center gap-8 px-6 py-2 glass-panel">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Score</span>
                <span className="text-xl font-display font-bold text-emerald-500">{score}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Time</span>
                <span className="text-xl font-display font-bold">
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
          <VoiceController onCommand={handleVoiceCommand} />
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'menu' ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col items-center justify-center p-8"
            >
              <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <MenuCard 
                  title="Boxe Rítmico" 
                  description="Acerte os alvos no ritmo da música e queime calorias."
                  icon={<Dumbbell size={32} />}
                  color="emerald"
                  onClick={() => startWorkout('boxing')}
                />
                <MenuCard 
                  title="Yoga & Equilíbrio" 
                  description="Mantenha poses precisas para melhorar flexibilidade."
                  icon={<Wind size={32} />}
                  color="indigo"
                  onClick={() => startWorkout('yoga')}
                />
                <MenuCard 
                  title="Dança Livre" 
                  description="Siga os movimentos e divirta-se com o rastreio corporal."
                  icon={<Music size={32} />}
                  color="rose"
                  onClick={() => startWorkout('dance')}
                />
                <MenuCard 
                  title="Alongamento" 
                  description="Sessões rápidas para melhorar sua postura diária."
                  icon={<Timer size={32} />}
                  color="amber"
                  onClick={() => startWorkout('stretching')}
                />
              </div>
              
              <div className="mt-12 text-center max-w-lg">
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Utilize sua webcam para rastreio corporal completo. 
                  Foco no <span className="text-emerald-500 font-medium">ODS 3</span>: 
                  Saúde e Bem-estar através da tecnologia.
                </p>
              </div>
            </motion.div>
          ) : mode === 'dashboard' ? (
            <Dashboard key="dashboard" stats={stats!} onBack={() => setMode('menu')} />
          ) : (
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full grid grid-cols-1 lg:grid-cols-2 gap-4 p-4"
            >
              {/* Left Side: Camera Feed */}
              <div className="relative h-full">
                <PoseTracker onResults={handlePoseResults} active={!isPaused} />
                <div className="absolute bottom-6 left-6 right-6 p-4 glass-panel z-30">
                  <p className="text-emerald-400 font-medium italic text-center">"{phrase}"</p>
                </div>
              </div>

              {/* Right Side: Game Elements */}
              <div className="relative h-full glass-panel overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <button 
                    onClick={() => setMode('menu')}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-mono uppercase tracking-wider">Sair</span>
                  </button>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsPaused(!isPaused)}
                      className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-wider transition-all"
                    >
                      {isPaused ? 'Resumir' : 'Pausar'}
                    </button>
                    <button 
                      onClick={finishWorkout}
                      className="px-4 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-mono uppercase tracking-wider transition-all border border-emerald-500/30"
                    >
                      Finalizar
                    </button>
                  </div>
                </div>

                <div className="flex-1 relative">
                  {mode === 'boxing' && (
                    <BoxingGame 
                      results={lastResults} 
                      isPaused={isPaused} 
                      onScore={(pts) => setScore(s => s + pts)} 
                    />
                  )}
                  {mode === 'yoga' && (
                    <YogaGame 
                      results={lastResults} 
                      isPaused={isPaused} 
                      onScore={(pts) => setScore(s => s + pts)} 
                    />
                  )}
                  {(mode === 'dance' || mode === 'stretching') && (
                    <div className="h-full flex items-center justify-center p-12 text-center">
                      <div>
                        <h2 className="text-2xl font-display font-bold mb-4">Modo em Desenvolvimento</h2>
                        <p className="text-zinc-500">Este modo utiliza o mesmo rastreio corporal para validar seus movimentos rítmicos.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function MenuCard({ title, description, icon, color, onClick }: any) {
  const colors: any = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50 text-emerald-500',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50 text-indigo-500',
    rose: 'bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50 text-rose-500',
    amber: 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50 text-amber-500',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-8 rounded-2xl border text-left transition-all duration-300 group ${colors[color]}`}
    >
      <div className="mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold mb-2 text-white">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Iniciar Treino</span>
        <Play size={12} fill="currentColor" />
      </div>
    </motion.button>
  );
}
