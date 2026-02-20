import React, { useEffect, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceControllerProps {
  onCommand: (command: string) => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'pt-BR'; // Portuguese as requested in the prompt

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      console.log('Voice Command:', command);
      
      if (command.includes('iniciar') || command.includes('começar') || command.includes('start')) {
        onCommand('start');
      } else if (command.includes('pausar') || command.includes('parar') || command.includes('pause')) {
        onCommand('pause');
      } else if (command.includes('voltar') || command.includes('menu')) {
        onCommand('menu');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech Recognition Error', event.error);
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, onCommand]);

  return (
    <button
      onClick={() => setIsListening(!isListening)}
      className={`p-3 rounded-full transition-all duration-300 ${
        isListening 
          ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
      }`}
      title={isListening ? "Desativar Comandos de Voz" : "Ativar Comandos de Voz"}
    >
      {isListening ? <Mic size={20} /> : <MicOff size={20} />}
    </button>
  );
};
