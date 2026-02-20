import React from 'react';
import { WorkoutStats } from '../constants';
import { motion } from 'motion/react';
import { Trophy, Flame, Timer, Activity, ArrowLeft, Share2 } from 'lucide-react';

interface DashboardProps {
  stats: WorkoutStats;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, onBack }) => {
  return (
    <div className="h-full overflow-y-auto p-8 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold text-white mb-2">Treino Concluído!</h2>
            <p className="text-zinc-500 font-mono uppercase tracking-widest text-xs">Resumo da sua atividade ODS 3</p>
          </div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <ArrowLeft size={18} />
            <span>Voltar ao Menu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            label="Pontuação" 
            value={stats.score.toString()} 
            icon={<Trophy className="text-amber-400" />} 
            delay={0.1}
          />
          <StatCard 
            label="Calorias" 
            value={`${stats.calories} kcal`} 
            icon={<Flame className="text-rose-500" />} 
            delay={0.2}
          />
          <StatCard 
            label="Duração" 
            value={`${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`} 
            icon={<Timer className="text-emerald-400" />} 
            delay={0.3}
          />
          <StatCard 
            label="Precisão" 
            value={`${stats.accuracy}%`} 
            icon={<Activity className="text-indigo-400" />} 
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-8">
            <h3 className="text-xl font-display font-bold mb-6">Impacto na Saúde</h3>
            <div className="space-y-6">
              <ImpactItem 
                title="Saúde Cardiovascular" 
                description="Seu treino de alta intensidade melhorou sua circulação e resistência cardíaca."
                progress={85}
              />
              <ImpactItem 
                title="Flexibilidade & Postura" 
                description="As poses de Yoga ajudaram a alinhar sua coluna e reduzir tensões musculares."
                progress={60}
              />
              <ImpactItem 
                title="Bem-estar Mental" 
                description="A atividade física libera endorfinas, combatendo o estresse e a ansiedade."
                progress={95}
              />
            </div>
          </div>

          <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
              <Share2 className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-lg font-display font-bold mb-2">Compartilhe seu Progresso</h3>
            <p className="text-sm text-zinc-500 mb-8">Inspire outros a se moverem pelo ODS 3.</p>
            <button className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Gerar Relatório
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function StatCard({ label, value, icon, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel p-6 flex flex-col items-center text-center"
    >
      <div className="mb-4 p-3 bg-white/5 rounded-xl">{icon}</div>
      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-2xl font-display font-bold text-white">{value}</span>
    </motion.div>
  );
}

function ImpactItem({ title, description, progress }: any) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <h4 className="font-bold text-zinc-200">{title}</h4>
        <span className="text-emerald-500 font-mono text-xs">{progress}%</span>
      </div>
      <p className="text-xs text-zinc-500 mb-3">{description}</p>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full bg-emerald-500"
        />
      </div>
    </div>
  );
}
