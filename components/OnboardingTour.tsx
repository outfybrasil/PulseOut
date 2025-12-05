import React, { useState } from 'react';
import { 
  IconVitality, 
  IconPockets, 
  IconPing, 
  IconInsight, 
  IconArbiter, 
  IconArrowRight, 
  IconCheck 
} from './Icons';

interface OnboardingTourProps {
  onComplete: () => void;
}

const STEPS = [
  {
    title: "Bem-vindo ao PULSEOUT",
    description: "Você acaba de entrar em uma rede desenhada para a profundidade. Esqueça a rolagem infinita e a dopamina barata. Aqui, a moeda é a conexão genuína.",
    icon: IconVitality,
    color: "text-pulse-vitality"
  },
  {
    title: "Pockets: Micro-Comunidades",
    description: "Nada de grupos com 50.000 pessoas gritando. Pockets são limitados a 50 membros. Para entrar, você precisa aplicar e ser aceito. Qualidade > Quantidade.",
    icon: IconPockets,
    color: "text-emerald-400"
  },
  {
    title: "Pings: Intenção Real",
    description: "Não existem DMs ilimitadas. Você tem 5 'Pings' por dia para iniciar conversas privadas. Use-os com sabedoria e sempre forneça um contexto.",
    icon: IconPing,
    color: "text-indigo-400"
  },
  {
    title: "Sentimento > Like",
    description: "Interaja com humanidade: Inspirou (Novas ideias), Profundo (Reflexão), Apoio (Solidariedade) e Grato (Reconhecimento).",
    icon: IconInsight,
    color: "text-purple-400"
  },
  {
    title: "PULSE Score & Árbitros",
    description: "Sua pontuação (0-150) define sua influência. Comportamento tóxico reduz seu score. Pontuação alta permite criar Pockets e virar Árbitro.",
    icon: IconArbiter,
    color: "text-rose-400"
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-pulse-dark/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-pulse-base border border-slate-700 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
        
        {/* Background Ambient Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-colors duration-500`}></div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-pulse-vitality' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        {/* Corrected Key Position */}
        <div key={currentStep} className="flex-1 flex flex-col items-center text-center justify-center animate-fade-in-up">
          <div className={`w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 shadow-lg`}>
            <StepIcon className={`w-10 h-10 ${STEPS[currentStep].color}`} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            {STEPS[currentStep].title}
          </h2>
          
          <p className="text-slate-400 text-lg leading-relaxed">
            {STEPS[currentStep].description}
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={onComplete}
            className="text-slate-500 hover:text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            Pular Tour
          </button>

          <button 
            onClick={handleNext}
            className="bg-pulse-vitality text-pulse-dark font-bold py-3 px-6 rounded-xl hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10 group"
          >
            {currentStep === STEPS.length - 1 ? 'Começar Jornada' : 'Próximo'}
            {currentStep === STEPS.length - 1 ? (
               <IconCheck className="w-4 h-4" />
            ) : (
               <IconArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};