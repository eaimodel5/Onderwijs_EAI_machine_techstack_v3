
import React, { useState, useEffect } from 'react';
import { LearnerProfile } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: LearnerProfile, goal: string) => void;
  isOpen: boolean;
  currentProfile?: LearnerProfile;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, isOpen, currentProfile }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<LearnerProfile>({
    name: '',
    subject: '',
    level: '',
    grade: ''
  });
  const [goal, setGoal] = useState('');

  const t = {
      step1_title: "Fijn dat je er bent",
      step2_title: "Jouw onderwijsniveau",
      step3_title: "De context van vandaag",
      step4_title: "Je startpunt bepalen",
      name_label: "EVEN KENNISMAKEN",
      subject_label: "VAKGEBIED",
      level_label: "SELECTIE",
      grade_label: "LEERJAAR",
      goal_label: "LEERVRAAG",
      next_btn: "VOLGENDE",
      start_btn: "START SESSIE",
      bypass_btn: "Overslaan en direct beginnen",
      system_label: "EAI STUDIO",
      progress: "STAP",
      placeholders: {
          name: "Hoe heet je?",
          subject: "Bijv. Geschiedenis",
          grade: "Bijv. Klas 4",
          goal: "Waar wil je vandaag aan werken?"
      },
      levels: [
          { val: "VMBO", label: "VMBO" },
          { val: "HAVO", label: "HAVO" },
          { val: "VWO", label: "VWO" }
      ]
  };

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

  const goNext = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (step < 4) setStep(prev => (prev + 1) as any);
      else handleSubmit();
  };

  const goBack = () => {
      if (step > 1) setStep(prev => (prev - 1) as any);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;
    onComplete(formData, goal);
  };

  const handleSkip = () => {
    const emptyProfile: LearnerProfile = {
        name: 'Gast',
        subject: null,
        level: null,
        grade: null
    };
    onComplete(emptyProfile, "Ik wil graag een open sessie starten zonder specifieke context.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000000]/80 backdrop-blur-2xl text-cyan-50 font-sans transition-all duration-500">
      <div className="absolute inset-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>

      <div className="relative w-full max-w-md bg-[#0b1120] border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8),0_0_0_1px_rgba(6,182,212,0.1)] p-8 flex flex-col animate-in zoom-in-95 fade-in duration-300 overflow-hidden min-h-[500px]">
          
            {/* Top Bar: Progress */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= step ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-800'}`}></div>
                        ))}
                    </div>
                    <span className="text-[9px] font-mono text-cyan-600 ml-2 tracking-widest">{t.progress} {step}/4</span>
                </div>
            </div>

            <form onSubmit={step === 4 ? handleSubmit : goNext} className="flex-1 flex flex-col">
                
                <div className="min-h-[220px]">
                    {/* === STEP 1: IDENTITY === */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-right-8 duration-300 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-cyan-500 tracking-widest mb-2 block">{t.name_label}</label>
                                <h2 className="text-2xl font-bold text-white mb-6">{t.step1_title}</h2>
                            </div>
                            
                            <div className="relative group">
                                <input 
                                    type="text" 
                                    autoFocus
                                    required
                                    value={formData.name || ''}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-black/30 border-b-2 border-slate-700 px-0 py-4 text-xl text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-all font-sans"
                                    placeholder={t.placeholders.name}
                                />
                            </div>
                        </div>
                    )}

                    {/* === STEP 2: LEVEL (Big Buttons) === */}
                    {step === 2 && (
                        <div className="animate-in slide-in-from-right-8 duration-300 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-cyan-500 tracking-widest mb-2 block">{t.level_label}</label>
                                <h2 className="text-2xl font-bold text-white mb-6">{t.step2_title}</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {t.levels.map(lvl => (
                                    <button
                                        key={lvl.val}
                                        type="button"
                                        onClick={() => {
                                            setFormData({...formData, level: lvl.val});
                                            setTimeout(() => setStep(3), 150);
                                        }}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 group ${
                                            formData.level === lvl.val 
                                                ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                                                : 'bg-black/20 border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-white/5'
                                        }`}
                                    >
                                        <span className="text-lg font-bold tracking-tight">{lvl.label}</span>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.level === lvl.val ? 'border-cyan-400' : 'border-slate-600'}`}>
                                            {formData.level === lvl.val && <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === STEP 3: CONTEXT === */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-8 duration-300 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-cyan-500 tracking-widest mb-2 block">{t.system_label}</label>
                                <h2 className="text-2xl font-bold text-white mb-6">{t.step3_title}</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{t.subject_label}</label>
                                    <input 
                                        type="text" 
                                        autoFocus
                                        required
                                        value={formData.subject || ''}
                                        onChange={e => setFormData({...formData, subject: e.target.value})}
                                        className="w-full bg-black/30 border border-slate-700 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                                        placeholder={t.placeholders.subject}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">{t.grade_label}</label>
                                    <input 
                                        type="text" 
                                        value={formData.grade || ''}
                                        onChange={e => setFormData({...formData, grade: e.target.value})}
                                        className="w-full bg-black/30 border border-slate-700 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                                        placeholder={t.placeholders.grade}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === STEP 4: GOAL === */}
                    {step === 4 && (
                        <div className="animate-in slide-in-from-right-8 duration-300 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-cyan-500 tracking-widest mb-2 block">{t.goal_label}</label>
                                <h2 className="text-2xl font-bold text-white mb-6">{t.step4_title}</h2>
                            </div>

                            <div className="relative">
                                <textarea 
                                    required
                                    autoFocus
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                    className="w-full h-32 bg-black/30 border border-slate-700 rounded-lg px-4 py-3 text-base text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all resize-none leading-relaxed"
                                    placeholder={t.placeholders.goal}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Footer */}
                <div className="pt-8 flex gap-3 mt-auto">
                    {step > 1 && (
                        <button 
                            type="button"
                            onClick={goBack}
                            className="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            ←
                        </button>
                    )}
                    <button 
                        type="submit"
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-[0.98] tracking-widest uppercase text-xs"
                    >
                        {step === 4 ? t.start_btn : t.next_btn}
                    </button>
                </div>

                {/* Bypass Link */}
                <div className="text-center pt-4">
                    <button 
                        type="button"
                        onClick={handleSkip}
                        className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors border-b border-transparent hover:border-slate-500 pb-0.5"
                    >
                        {t.bypass_btn}
                    </button>
                </div>
            </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
