import React, { useEffect, useState } from 'react';
import { fetchAnalytics, AnalyticsSnapshot, StudentSession, pushIntervention } from '../services/analyticsService';
import { getEAICore } from '../utils/ssotParser';

const TeacherCockpit: React.FC = () => {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [interventionSent, setInterventionSent] = useState<string | null>(null);

  const loadData = async () => {
    const data = await fetchAnalytics();
    setSnapshot(data);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Faster polling for live feel
    return () => clearInterval(interval);
  }, []);

  const handleIntervention = async (command: string, label: string) => {
      if (!selectedStudent) return;
      setIsLoading(true);
      await pushIntervention(selectedStudent.id, 'COMMAND_INJECTION', { command });
      setInterventionSent(`Commando '${command}' verzonden.`);
      setTimeout(() => {
          setInterventionSent(null);
          setIsLoading(false);
          setSelectedStudent(null);
      }, 1200);
  };

  const getSentimentColor = (s: string) => {
      if (s === 'STRUGGLE') return 'text-red-400 border-red-500/30 bg-red-900/10';
      if (s === 'BORED') return 'text-orange-400 border-orange-500/30 bg-orange-900/10';
      if (s === 'NEUTRAL') return 'text-slate-400 border-slate-600/30 bg-slate-800/50';
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-900/10';
  };

  const INTERVENTION_GROUPS = [
      {
          label: "Didactische Sturing",
          color: "text-blue-400",
          buttons: [
              { label: "Modeling (Voordoen)", cmd: "/modelen", desc: "AI doet één stap voor." },
              { label: "Scaffolding (Hulp)", cmd: "/vocab", desc: "Geef begrippenkader." },
              { label: "Fading (Loslaten)", cmd: "/fading", desc: "Laat leerling zelfstandig." },
          ]
      },
      {
          label: "Toetsing & Check",
          color: "text-emerald-400",
          buttons: [
              { label: "Quiz (3 vragen)", cmd: "/quizgen", desc: "Genereer formatieve toets." },
              { label: "Begripscheck", cmd: "/beurtvraag", desc: "Dwing tot samenvatting." },
              { label: "Foutenjacht", cmd: "/misvatting", desc: "Laat fout zoeken." },
          ]
      },
      {
          label: "Metacognitie & Regie",
          color: "text-purple-400",
          buttons: [
              { label: "Reflectie", cmd: "/meta", desc: "Zoom uit op strategie." },
              { label: "Planning", cmd: "/checkin", desc: "Herijk het doel." },
              { label: "Zelf-score", cmd: "/rubric", desc: "Laat zelf beoordelen." },
          ]
      }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-6 overflow-y-auto font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                <span className="text-teal-500 text-[10px] font-bold uppercase tracking-widest">Live Control Room</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Klassikale Monitoring</h1>
          </div>
          
          <div className="flex gap-4">
              <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-white">{snapshot?.activeStudents ?? '-'}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Online</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-emerald-400">{snapshot?.avgMastery ?? '-'}%</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">Mastery</div>
              </div>
              <div className="bg-slate-900/50 border border-red-900/30 px-4 py-2 rounded-lg text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-red-400">{snapshot?.interventionNeeded ?? '-'}</div>
                  <div className="text-[9px] text-red-400/70 uppercase tracking-widest">Alerts</div>
              </div>
          </div>
        </header>

        {/* STUDENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {snapshot?.students.map((student) => {
                
                // EMPTY STATE CARD FOR LOCAL USER
                if (student.status === 'WAITING') {
                    return (
                        <div key={student.id} className="relative bg-slate-900/20 border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center group">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 group-hover:bg-slate-800 transition-colors">
                                <span className="animate-pulse text-2xl">📡</span>
                            </div>
                            <h3 className="text-slate-400 font-bold mb-1">Wachten op verbinding...</h3>
                            <p className="text-xs text-slate-600 max-w-xs">Start de 'Student Studio' in een ander venster en voltooi de setup om hier live data te zien.</p>
                        </div>
                    );
                }

                // DATA CARD
                return (
                <div 
                    key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className={`group relative bg-[#0b1120] border transition-all duration-300 rounded-xl overflow-hidden cursor-pointer hover:border-teal-500/40 ${student.lastAnalysis.sentiment === 'STRUGGLE' ? 'border-red-500/40 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-slate-800'}`}
                >
                    {/* Status Bar */}
                    <div className={`h-1 w-full ${student.status === 'ONLINE' ? (student.lastAnalysis.sentiment === 'STRUGGLE' ? 'bg-red-500' : 'bg-teal-500') : 'bg-slate-700'}`}></div>
                    
                    <div className="p-5 flex flex-col h-full">
                        {/* TOP ROW: Identity & Hard Stats */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${student.isRealUser ? 'bg-teal-900/20 border-teal-500 text-teal-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                    {student.avatar}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-white leading-tight">{student.name}</h3>
                                        {student.isRealUser && <span className="text-[9px] bg-teal-500 text-black font-bold px-1.5 rounded uppercase">YOU</span>}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{student.currentModule}</span>
                                        <span className="text-slate-600">•</span>
                                        <span className="text-[10px] text-slate-500 font-mono">{student.currentNodeId}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-mono font-bold text-white">{student.progress}%</div>
                                <div className="text-[9px] text-slate-500 uppercase tracking-widest">Progressie</div>
                            </div>
                        </div>

                        {/* MIDDLE ROW: The Dashboard Density */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Left: Hard Metrics */}
                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Score</span>
                                    <span className={`text-xs font-bold font-mono ${student.stats.accuracy < 60 ? 'text-red-400' : 'text-emerald-400'}`}>{student.stats.accuracy}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Streak</span>
                                    <span className="text-xs font-bold font-mono text-white">{student.stats.streak} 🔥</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Opgaven</span>
                                    <span className="text-xs font-bold font-mono text-white">{student.stats.exercisesDone}</span>
                                </div>
                            </div>

                            {/* Right: SSOT States */}
                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 flex flex-col justify-between">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Fase</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{student.lastAnalysis.phase}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Kennis</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{student.lastAnalysis.kLevel}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 uppercase">Agency</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{student.lastAnalysis.agency}</span>
                                </div>
                            </div>
                        </div>

                        {/* LIVE FEED: Last Events */}
                        <div className="mb-4 flex-1">
                            <h4 className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-2">Live Activiteit</h4>
                            <div className="space-y-1">
                                {student.recentEvents.slice(0, 2).map((evt, idx) => (
                                    <div key={idx} className="flex gap-2 items-center text-[10px]">
                                        <span className="text-slate-600 font-mono">{new Date(evt.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                        <span className={`font-bold ${evt.type === 'ERROR' ? 'text-red-400' : (evt.type === 'HINT' ? 'text-orange-400' : 'text-teal-400')}`}>[{evt.type}]</span>
                                        <span className="text-slate-400 truncate">{evt.desc}</span>
                                    </div>
                                ))}
                                {student.recentEvents.length === 0 && <span className="text-[10px] text-slate-700 italic">Geen recente activiteit.</span>}
                            </div>
                        </div>

                        {/* BOTTOM: AI Summary */}
                        <div className="mt-auto">
                            <div className={`text-[10px] p-2 rounded border-l-2 ${student.lastAnalysis.sentiment === 'STRUGGLE' ? 'bg-red-900/10 border-red-500 text-red-200' : 'bg-slate-800 border-teal-500 text-slate-300'}`}>
                                <span className="font-bold opacity-70 block mb-0.5 uppercase">AI Diagnose:</span>
                                "{student.lastAnalysis.summary}"
                            </div>
                            
                            {student.alerts.length > 0 && (
                                <div className="mt-2 flex gap-2">
                                    {student.alerts.map(a => (
                                        <span key={a} className="text-[9px] font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/30 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                );
            })}
        </div>

        {/* DETAILED INTERVENTION MODAL */}
        {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-700 bg-[#0b1120] flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-white">{selectedStudent.name}</h2>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSentimentColor(selectedStudent.lastAnalysis.sentiment)}`}>
                                    {selectedStudent.lastAnalysis.sentiment}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">
                                {selectedStudent.currentModule} • Node: {selectedStudent.currentNodeId}
                            </p>
                        </div>
                        <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                            
                            {/* COL 1: DIAGNOSE (HARD + SOFT) */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Diepte Analyse</h3>
                                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Laatste AI Observatie</span>
                                            <p className="text-xs text-slate-300 italic leading-relaxed">"{selectedStudent.lastAnalysis.summary}"</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Score</span>
                                                <span className="text-lg font-mono text-white">{selectedStudent.stats.accuracy}%</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold block">Active</span>
                                                <span className="text-lg font-mono text-white">{selectedStudent.stats.lastActiveSecondsAgo}s</span>
                                            </div>
                                        </div>
                                        <div className="border-t border-slate-800 pt-4">
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">SSOT Parameters</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                                                    <div className="text-[9px] text-slate-500">Kennis</div>
                                                    <div className="text-xs font-bold text-teal-400">{selectedStudent.lastAnalysis.kLevel}</div>
                                                </div>
                                                <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                                                    <div className="text-[9px] text-slate-500">Regie</div>
                                                    <div className="text-xs font-bold text-purple-400">{selectedStudent.lastAnalysis.agency}</div>
                                                </div>
                                                <div className="bg-slate-950 p-2 rounded text-center border border-slate-800">
                                                    <div className="text-[9px] text-slate-500">Fase</div>
                                                    <div className="text-xs font-bold text-blue-400">{selectedStudent.lastAnalysis.phase}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COL 2 & 3: INTERVENTION CONSOLE */}
                            <div className="lg:col-span-2 flex flex-col">
                                <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4">Verstuur Didactische Ingreep (SSOT)</h3>
                                
                                {interventionSent ? (
                                    <div className="flex-1 flex items-center justify-center bg-green-900/10 border border-green-500/30 rounded-lg animate-in zoom-in">
                                        <div className="text-center text-green-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 mx-auto mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-sm font-bold">{interventionSent}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {INTERVENTION_GROUPS.map((group, idx) => (
                                            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                                                <h4 className={`text-xs font-bold uppercase mb-3 ${group.color}`}>{group.label}</h4>
                                                <div className="space-y-2">
                                                    {group.buttons.map((btn) => (
                                                        <button 
                                                            key={btn.cmd}
                                                            onClick={() => handleIntervention(btn.cmd, btn.label)}
                                                            className="w-full text-left p-3 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all group flex items-start justify-between"
                                                        >
                                                            <div>
                                                                <div className="text-sm font-bold text-white group-hover:text-teal-300">{btn.label}</div>
                                                                <div className="text-[10px] text-slate-500 group-hover:text-slate-400">{btn.desc}</div>
                                                            </div>
                                                            <code className="text-[9px] bg-black/30 px-1.5 py-0.5 rounded text-slate-600 font-mono mt-0.5">{btn.cmd}</code>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default TeacherCockpit;