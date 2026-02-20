import React, { useState, useEffect } from 'react';
import { LearnerProfile } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProfileSetupProps {
  onComplete: (profile: LearnerProfile, goal: string) => void;
  isOpen: boolean;
  currentProfile?: LearnerProfile;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, isOpen, currentProfile }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<LearnerProfile>({
    name: '',
    subject: '',
    level: '',
    grade: ''
  });
  const [goal, setGoal] = useState('');
  const [isFading, setIsFading] = useState(false);

  const LEARNING_ROUTES = [
      { id: 'pilot_bio', label: '🧬 Biologie', levelLabel: 'VWO', subject: 'Biologie', level: 'VWO', desc: 'Module: Eiwitsynthese', isPilot: true },
      { id: 'pilot_wis', label: '📐 Wiskunde B', levelLabel: 'VWO', subject: 'Wiskunde B', level: 'VWO', desc: 'Module: Differentiëren', isPilot: true },
      { id: 'pilot_eco', label: '💰 Economie', levelLabel: 'HAVO', subject: 'Economie', level: 'HAVO', desc: 'Module: Marktwerking', isPilot: true },
      { id: 'gen_vmbo', label: '🎓 VMBO', levelLabel: 'Algemeen', subject: 'Algemeen', level: 'VMBO', desc: 'Vrije ondersteuning', isPilot: false },
      { id: 'gen_havo', label: '🎓 HAVO', levelLabel: 'Algemeen', subject: 'Algemeen', level: 'HAVO', desc: 'Vrije ondersteuning', isPilot: false },
      { id: 'gen_vwo', label: '🎓 VWO', levelLabel: 'Algemeen', subject: 'Algemeen', level: 'VWO', desc: 'Vrije ondersteuning', isPilot: false }
  ];

  useEffect(() => {
    if (isOpen && currentProfile) {
        setFormData(prev => ({
            ...prev,
            name: currentProfile.name || '',
            subject: currentProfile.subject || '',
            level: currentProfile.level || '',
            grade: currentProfile.grade || ''
        }));
    }
  }, [isOpen, currentProfile]);

  const handleStepChange = (nextStep: 1 | 2 | 3) => {
      setIsFading(true);
      setTimeout(() => {
          setStep(nextStep);
          setIsFading(false);
      }, 300);
  };

  const goNext = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (step < 3) handleStepChange((step + 1) as any);
      else handleSubmit();
  };

  const goBack = () => {
      if (step > 1) handleStepChange((step - 1) as any);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onComplete(formData, goal || "Ik start met de module.");
  };

  const handleGuest = () => {
      // Escape hatch
      const guestProfile: LearnerProfile = {
          name: 'Gastgebruiker',
          subject: 'Algemeen',
          level: 'Algemeen',
          grade: 'N/A'
      };
      onComplete(guestProfile, "Ik verken de applicatie.");
  };

  const handleRouteSelect = (route: typeof LEARNING_ROUTES[0]) => {
      setFormData({
          ...formData,
          subject: route.subject,
          level: route.level
      });
      handleStepChange(3);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a] text-slate-200 font-sans transition-all duration-700">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* ESCAPE HATCH BUTTON */}
      <button 
        onClick={handleGuest} 
        className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20 group flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 hover:bg-white/10 transition-all text-slate-400 hover:text-white"
      >
        <span className="text-xs uppercase tracking-widest font-bold">Doorgaan als Gast</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>

      <div className="w-full max-w-4xl px-4 sm:px-8 relative z-10">
            <div className="flex justify-center gap-3 mb-12">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${i === step ? 'bg-teal-400 scale-125' : 'bg-slate-700'}`}></div>
                ))}
            </div>

            <form onSubmit={step === 3 ? handleSubmit : goNext} className={`transition-opacity duration-300 ${isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <div className="min-h-[400px] flex flex-col items-center text-center">
                    {step === 1 && (
                        <>
                            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">Welkom bij EAI Studio.</h2>
                            <p className="text-slate-400 mb-10 text-lg">Laten we beginnen met je naam.</p>
                            <input 
                                type="text" 
                                autoFocus
                                required
                                value={formData.name || ''}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full max-w-md bg-transparent border-b border-slate-600 px-2 py-4 text-2xl text-center text-white placeholder-slate-700 focus:border-teal-500 focus:outline-none transition-colors"
                                placeholder="Typ je naam..."
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">Kies je leerroute.</h2>
                            <p className="text-slate-400 mb-10 text-lg">Kies een volledige SLO-module of start een vrije sessie.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                                {LEARNING_ROUTES.map(route => (
                                    <button
                                        key={route.id}
                                        type="button"
                                        onClick={() => handleRouteSelect(route)}
                                        className={`group relative p-5 rounded-2xl border text-left transition-all duration-300 active:scale-95 flex flex-col justify-between min-h-[140px] ${route.isPilot ? 'bg-slate-800/60 border-teal-500/30 hover:border-teal-400' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        <div className="flex justify-between items-start w-full mb-2">
                                            <span className={`text-xl font-bold ${route.isPilot ? 'text-white' : 'text-slate-300'}`}>{route.label}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${route.isPilot ? 'bg-teal-900/30 text-teal-400 border-teal-500/30' : 'bg-slate-700/50 text-slate-500 border-slate-600'}`}>{route.levelLabel}</span>
                                        </div>
                                        <div>
                                            <div className={`text-xs ${route.isPilot ? 'text-teal-200/80' : 'text-slate-500'} mb-3`}>{route.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <h2 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">Je startpunt.</h2>
                            <p className="text-slate-400 mb-8 text-lg">Omschrijf kort wat je al weet over dit onderwerp.</p>
                            <div className="bg-slate-800/50 p-4 rounded-xl mb-6 border border-slate-700/50">
                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Gekozen Route</div>
                                <div className="text-lg font-bold text-teal-400">{formData.subject} <span className="text-slate-400">|</span> {formData.level}</div>
                            </div>
                            <textarea 
                                autoFocus
                                value={goal}
                                onChange={e => setGoal(e.target.value)}
                                className="w-full max-w-lg h-32 bg-slate-800/30 rounded-xl px-6 py-5 text-lg text-white placeholder-slate-600 focus:bg-slate-800/50 focus:ring-1 focus:ring-teal-500/50 outline-none resize-none leading-relaxed"
                                placeholder="Ik wil oefenen met..."
                            />
                        </>
                    )}
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex gap-4">
                        {step > 1 && (
                            <button type="button" onClick={goBack} className="px-6 py-3 text-slate-500 hover:text-white transition-colors text-sm font-medium">Terug</button>
                        )}
                        <button type="submit" className="px-10 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-full shadow-lg shadow-teal-900/20 transition-all transform hover:scale-105 active:scale-95 text-sm tracking-wide">
                            {step === 3 ? "Start Sessie" : "Volgende"}
                        </button>
                    </div>
                </div>
            </form>
      </div>
    </div>
  );
};