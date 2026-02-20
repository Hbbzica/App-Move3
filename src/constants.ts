export const MOTIVATIONAL_PHRASES = [
  "Sua saúde é seu maior patrimônio!",
  "Mais 5 segundos, você consegue!",
  "ODS 3 em ação: seu corpo agradece o movimento hoje!",
  "Excelente forma! Continue assim.",
  "O movimento é o melhor remédio.",
  "Cada soco conta para sua saúde!",
  "Respire fundo e mantenha a pose.",
  "Você está mais forte do que ontem!",
];

export type GameMode = 'menu' | 'boxing' | 'dance' | 'stretching' | 'yoga' | 'dashboard';

export interface Target {
  id: string;
  x: number;
  y: number;
  type: 'left' | 'right';
  active: boolean;
  startTime: number;
}

export interface WorkoutStats {
  mode: GameMode;
  duration: number;
  calories: number;
  score: number;
  accuracy: number;
  timestamp: number;
}
