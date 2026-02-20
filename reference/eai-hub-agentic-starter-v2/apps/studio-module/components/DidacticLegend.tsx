
import React from 'react';

interface DidacticLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

const DidacticLegend: React.FC<DidacticLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const t = {
      title: 'Didactische Modi',
      subtitle: 'Betekenis van de kleuren',
      modes: [
          {
              color: 'bg-blue-600',
              text: 'text-blue-400',
              border: 'border-blue-500/30',
              bgLight: 'bg-blue-500/10',
              label: 'Focus & Structuur',
              desc: 'De standaard modus. De AI helpt je stof te ordenen, geeft uitleg en bewaakt de grote lijn. Hier ben je aan het bouwen.' 
          },
          {
              color: 'bg-red-600',
              text: 'text-red-500',
              border: 'border-red-500/30',
              bgLight: 'bg-red-500/10',
              label: 'Advocaat van de Duivel',
              desc: 'Kritische modus. De AI valt je argumenten aan, zoekt zwakke plekken en dwingt je om scherper na te denken. Geen genade.'
          },
          {
              color: 'bg-violet-600',
              text: 'text-violet-400',
              border: 'border-violet-500/30',
              bgLight: 'bg-violet-500/10',
              label: 'Meta-Reflectie',
              desc: 'Helikopter view. We stoppen met de inhoud en kijken naar HET PROCES. Hoe leer je? Is deze strategie effectief?'
          },
          {
              color: 'bg-emerald-600',
              text: 'text-emerald-400',
              border: 'border-emerald-500/30',
              bgLight: 'bg-emerald-500/10',
              label: 'Coach & Check',
              desc: 'Toetsende modus. De AI stelt quizvragen, vraagt om samenvattingen of geeft feedback op je antwoorden.'
          }
      ]
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0b1120]">
                <div>
                    <h3 className="text-white font-bold text-sm tracking-wide uppercase">{t.title}</h3>
                    <p className="text-[10px] text-slate-500">{t.subtitle}</p>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4 space-y-3">
                {t.modes.map((mode, idx) => (
                    <div key={idx} className={`flex gap-4 p-3 rounded-lg border ${mode.border} ${mode.bgLight}`}>
                        <div className={`w-3 h-3 rounded-full ${mode.color} mt-1 shrink-0 shadow-[0_0_8px_currentColor]`}></div>
                        <div>
                            <h4 className={`text-xs font-bold uppercase mb-1 ${mode.text}`}>{mode.label}</h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed opacity-90">{mode.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-black/20 p-3 text-center border-t border-white/5">
                <p className="text-[9px] text-slate-500 italic">
                    De omgeving past zich automatisch aan op basis van jouw antwoorden.
                </p>
            </div>

        </div>
    </div>
  );
};

export default DidacticLegend;
