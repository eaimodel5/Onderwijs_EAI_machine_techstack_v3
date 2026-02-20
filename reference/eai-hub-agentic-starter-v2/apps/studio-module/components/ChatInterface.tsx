
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, EAIAnalysis, MechanicalState, LearnerProfile } from '../types';
import { sendMessageToGemini, resetChatSession, checkApiKeyConfigured, sendSystemNudge } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import Dashboard from './Dashboard';
import GameNeuroLinker from './GameNeuroLinker';
import ProfileSetup from './ProfileSetup';
import BootSequence from './BootSequence';
import TechReport from './TechReport';
import DidacticLegend from './DidacticLegend';
import {
  createInitialEAIState,
  updateStateFromAnalysis,
  EAIStateLike,
  calculateDynamicTTL
} from '../utils/eaiLearnAdapter';
import { getEAICore } from '../utils/ssotParser';

type Theme = { bg: string; sidebar: string; border: string; accent: string; accentText: string; buttonActive: string; bubbleUser: string; glow: string; };

const THEMES: Record<string, Theme> = {
    DEFAULT: { bg: 'bg-[#0b1120]', sidebar: 'bg-[#0f172a]/80', border: 'border-slate-800', accent: 'bg-blue-600', accentText: 'text-blue-400', buttonActive: 'border-blue-500 bg-blue-500/10 text-blue-400', bubbleUser: 'bg-blue-600/10 border-blue-500/30 text-blue-100', glow: 'shadow-[0_0_20px_rgba(37,99,235,0.1)]' },
    DEVIL: { bg: 'bg-[#1a0505]', sidebar: 'bg-[#2a0a0a]/80', border: 'border-red-900', accent: 'bg-red-600', accentText: 'text-red-500', buttonActive: 'border-red-500 bg-red-500/10 text-red-400', bubbleUser: 'bg-red-600/10 border-red-500/30 text-red-100', glow: 'shadow-[0_0_30px_rgba(220,38,238,0.2)]' },
    META: { bg: 'bg-[#0f0a1a]', sidebar: 'bg-[#150f25]/80', border: 'border-violet-900', accent: 'bg-violet-600', accentText: 'text-violet-400', buttonActive: 'border-violet-500 bg-violet-500/10 text-violet-400', bubbleUser: 'bg-violet-600/10 border-violet-500/30 text-violet-100', glow: 'shadow-[0_0_20px_rgba(124,58,237,0.15)]' },
    CREATIVE: { bg: 'bg-[#0f1012]', sidebar: 'bg-[#13151a]/80', border: 'border-fuchsia-900', accent: 'bg-fuchsia-600', accentText: 'text-fuchsia-400', buttonActive: 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400', bubbleUser: 'bg-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-100', glow: 'shadow-[0_0_20px_rgba(192,38,233,0.15)]' },
    COACH: { bg: 'bg-[#051a10]', sidebar: 'bg-[#062415]/80', border: 'border-emerald-900', accent: 'bg-emerald-600', accentText: 'text-emerald-400', buttonActive: 'border-emerald-500 bg-emerald-500/10 text-emerald-400', bubbleUser: 'bg-emerald-600/10 border-emerald-500/30 text-emerald-100', glow: 'shadow-[0_0_20px_rgba(5,150,105,0.15)]' },
    SYSTEM: { bg: 'bg-[#081a1a]', sidebar: 'bg-[#0a2020]/80', border: 'border-cyan-900', accent: 'bg-cyan-600', accentText: 'text-cyan-400', buttonActive: 'border-cyan-500 bg-cyan-500/10 text-cyan-400', bubbleUser: 'bg-cyan-600/10 border-cyan-500/30 text-cyan-100', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
    PRAGMATIC: { bg: 'bg-[#1a0f05]', sidebar: 'bg-[#261505]/80', border: 'border-orange-900', accent: 'bg-orange-600', accentText: 'text-orange-400', buttonActive: 'border-orange-500 bg-orange-500/10 text-orange-400', bubbleUser: 'bg-orange-600/10 border-orange-500/30 text-orange-100', glow: 'shadow-[0_0_20px_rgba(234,88,12,0.15)]' }
};

const GET_TOOL_CATEGORIES = () => {
    return {
        START: [
            { label: "Bepaal doel", command: "/checkin", icon: "📍", desc: "Maak afspraken over doel en rol", mode: "COACH" },
            { label: "Kernvraag", command: "/leervraag", icon: "💡", desc: "Vind de kern van je leervraag", mode: "DEFAULT" },
            { label: "Proces check", command: "/fase_check", icon: "⏱️", desc: "Check waar je staat in het proces", mode: "SYSTEM" },
        ],
        UITLEG: [
            { label: "Structureer", command: "/schema", icon: "📐", desc: "Zet tekst om in structuur", mode: "SYSTEM" },
            { label: "Visualiseer", command: "/beeld", icon: "🎨", desc: "Krijg uitleg via een metafoor", mode: "CREATIVE" },
        ],
        UITDAGEN: [
            { label: "Devil's Advocate", command: "/devil", icon: "😈", desc: "Test je idee tegen kritiek", mode: "DEVIL" },
            { label: "Draai om", command: "/twist", icon: "🔄", desc: "Bekijk het van de andere kant", mode: "DEVIL" },
        ],
        CHECK: [
            { label: "Test mij", command: "/quizgen", icon: "📝", desc: "Test kennis met 3 vragen", mode: "COACH" },
            { label: "Samenvatten", command: "/beurtvraag", icon: "🎤", desc: "Vat samen in eigen woorden", mode: "PRAGMATIC" },
        ],
        REFLECTIE: [
            { label: "Helikopter", command: "/meta", icon: "🧠", desc: "Reflecteer op je aanpak", mode: "META" },
            { label: "Score zelf", command: "/rubric", icon: "📊", desc: "Beoordeel je eigen werk", mode: "SYSTEM" },
        ],
        PAUZE: [
            { label: "Neuro-Linker", command: "GAME_NEURO", icon: "💠", desc: "Reset je focus met een spel", mode: "DEFAULT" },
        ]
    };
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>(''); 
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'dashboard'>('chat');
  const [isDesktopDashboardOpen, setDesktopDashboardOpen] = useState(false);
  const [isToolboxOpen, setToolboxOpen] = useState(false); 
  const [activeToolTab, setActiveToolTab] = useState('START');
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES.DEFAULT);
  const [showGame, setShowGame] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(true);
  const [isBooting, setIsBooting] = useState(true);
  const [showTechReport, setShowTechReport] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  
  const [currentAnalysis, setCurrentAnalysis] = useState<EAIAnalysis | null>(null);
  const [currentMechanical, setCurrentMechanical] = useState<MechanicalState | null>(null);
  const [eaiState, setEaiState] = useState<EAIStateLike>(() => createInitialEAIState());
  const [isConnected, setIsConnected] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(true);
  
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>({ name: null, subject: null, level: null, grade: null, goal: null });
  const [ssotVersion, setSsotVersion] = useState('0.0.0');
  
  // Phase 5: Idle Timer Refs
  const lastInteractionRef = useRef<number>(Date.now());
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisRef = useRef<EAIAnalysis | null>(null); 
  const nudgeLevelRef = useRef<number>(0); // 0 = None, 1 = Affective, 2 = Hint, 3 = Scaffold
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSsotVersion(getEAICore().metadata.version); }, []);
  useEffect(() => { setHasApiKey(checkApiKeyConfigured()); }, []);
  useEffect(() => { if (activeMobileTab === 'chat' || window.innerWidth >= 1024) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeMobileTab]);

  // Update refs for timer logic
  useEffect(() => { analysisRef.current = currentAnalysis; }, [currentAnalysis]);

  // --- PHASE 5: IDLE TIMER LOGIC (UPDATED WITH ESCALATION) ---
  const resetIdleTimer = useCallback(() => {
      if (idleTimerRef.current) {
          clearInterval(idleTimerRef.current);
          idleTimerRef.current = null;
      }
      
      // Start polling for idle state
      idleTimerRef.current = setInterval(() => {
          if (isLoading || isBooting || showProfileSetup) return; 
          
          // CRITICAL: Stop nudging if we reached max level (3) to prevent infinite loops
          if (nudgeLevelRef.current >= 3) return;

          const now = Date.now();
          const idleTime = now - lastInteractionRef.current;
          const dynamicTTL = calculateDynamicTTL(analysisRef.current);
          
          if (idleTime > dynamicTTL) {
               // Trigger Nudge
               triggerProactiveNudge();
               // Reset timer ref so we wait another cycle for the NEXT level
               lastInteractionRef.current = Date.now(); 
          }
      }, 5000); // Check every 5s
  }, [isLoading, isBooting, showProfileSetup]);

  useEffect(() => {
      resetIdleTimer();
      return () => { if (idleTimerRef.current) clearInterval(idleTimerRef.current); };
  }, [resetIdleTimer]);

  const triggerProactiveNudge = async () => {
      if (!analysisRef.current) return; 
      
      const nextLevel = nudgeLevelRef.current + 1;
      nudgeLevelRef.current = nextLevel; // Escalate level

      setIsLoading(true);
      setLoadingStatus(`Nudge Level ${nextLevel}...`);
      
      try {
          const response = await sendSystemNudge(analysisRef.current, learnerProfile, nextLevel);
          
          const aiMessage: Message = { 
              id: (Date.now() + 1).toString(), 
              role: 'model', 
              text: response.text, 
              timestamp: new Date(), 
              analysis: response.analysis, 
              mechanical: response.mechanical 
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setCurrentAnalysis(response.analysis);
          setCurrentMechanical(response.mechanical);
          setEaiState(prev => updateStateFromAnalysis(prev, response.analysis, response.mechanical));
      } catch (e) {
          console.error("Nudge failed", e);
      } finally {
          setIsLoading(false);
          setLoadingStatus('');
          lastInteractionRef.current = Date.now(); 
      }
  };

  const updateTheme = (command: string) => {
      const cleanCmd = (command || '').split(/[\s\n]/)[0];
      let newMode = 'DEFAULT';
      Object.values(GET_TOOL_CATEGORIES()).flat().forEach(t => { if (t.command === cleanCmd) newMode = t.mode; });
      setCurrentTheme(THEMES[newMode] || THEMES.DEFAULT);
  };

  const buildCommandMessage = (command: string): string => {
      return command;
  };

  const handleSendMessage = async (textOverride?: string) => {
    // USER INTERACTION DETECTED: RESET EVERYTHING
    lastInteractionRef.current = Date.now();
    nudgeLevelRef.current = 0; // Reset escalation to 0

    const isCommandClick = !!textOverride;
    let textToSend = textOverride || inputText;

    if (textToSend === 'GAME_NEURO') { setShowGame(true); setToolboxOpen(false); return; }
    if (!textToSend.trim() || isLoading) return;

    if (isCommandClick && textToSend.startsWith('/') && !textToSend.includes('\n')) {
        textToSend = buildCommandMessage(textToSend);
    }

    if (isCommandClick) {
        updateTheme(textToSend);
        setToolboxOpen(false); 
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setLoadingStatus('Analyseren...');

    try {
      const response = await sendMessageToGemini(
          userMessage.text, 
          learnerProfile, 
          (status) => setLoadingStatus(status)
      );
      
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response.text, timestamp: new Date(), analysis: response.analysis, mechanical: response.mechanical };
      
      setMessages(prev => [...prev, aiMessage]);
      setCurrentAnalysis(response.analysis);
      setCurrentMechanical(response.mechanical);
      setIsConnected(true);
      setEaiState(prev => updateStateFromAnalysis(prev, response.analysis, response.mechanical));

      if (response.analysis.current_profile) {
          const newProf = response.analysis.current_profile;
          setLearnerProfile(prev => ({
              name: newProf.name || prev.name,
              subject: newProf.subject || prev.subject,
              level: newProf.level || prev.level,
              grade: newProf.grade || prev.grade,
              goal: newProf.goal || prev.goal 
          }));
      }

      if (response.analysis.active_fix) {
          updateTheme(response.analysis.active_fix);
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Failure", timestamp: new Date(), isError: true }]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
      // Reset timer again after response to ensure full wait time before nudge
      lastInteractionRef.current = Date.now(); 
    }
  };

  const toolCategories = GET_TOOL_CATEGORIES();
  const currentCategoryTools = (toolCategories as any)[activeToolTab] || [];

  return (
    <div className={`flex h-[100dvh] w-full ${currentTheme.bg} text-slate-200 overflow-hidden font-sans transition-colors duration-[2000ms] relative overscroll-none`}>
      
      {/* GLOBAL NEURAL GRID */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0" 
           style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050914] to-transparent pointer-events-none z-0"></div>

      {!hasApiKey && <div className="absolute top-0 left-0 right-0 z-[100] bg-red-600 text-white text-[10px] sm:text-xs font-bold uppercase py-2 animate-pulse text-center">⚠️ API KEY MISSING</div>}
      
      {isBooting && <BootSequence onComplete={() => setIsBooting(false)} />}
      <ProfileSetup 
            isOpen={!isBooting && showProfileSetup} 
            currentProfile={learnerProfile}
            onComplete={(p, g) => { 
                const fullProfile = { ...p, goal: g };
                setLearnerProfile(fullProfile); 
                setShowProfileSetup(false); 
                
                if (messages.length === 0) {
                    handleSendMessage(g);
                }
            }} 
      />
      
      {showGame && <GameNeuroLinker onClose={() => setShowGame(false)} />}
      
      {showTechReport && <TechReport onClose={() => setShowTechReport(false)} lastAnalysis={currentAnalysis} lastMechanical={currentMechanical} messages={messages} eaiState={eaiState} />}
      <DidacticLegend isOpen={showLegend} onClose={() => setShowLegend(false)} />
      
      {/* DESKTOP SIDEBAR - REDUCED TO NAVIGATION ONLY */}
      <div className={`hidden lg:flex w-64 flex-col border-r ${currentTheme.border} ${currentTheme.sidebar} backdrop-blur-xl transition-colors duration-[2000ms] z-10 relative`}>
        <div className="p-4 border-b border-white/5 bg-black/10">
             <div className="flex items-center justify-between group cursor-pointer">
                 <div className="flex items-center gap-3" onDoubleClick={() => setShowTechReport(true)}>
                    <div className={`w-8 h-8 ${currentTheme.accent} rounded flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20`}>EAI</div>
                    <span className="font-bold tracking-wide">Studio</span>
                 </div>
                 <div className="text-[10px] font-bold px-2 py-1 bg-white/5 rounded border border-white/10 text-slate-400">NL</div>
             </div>
        </div>
        
        {/* Sidebar Placeholder */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide flex flex-col items-center justify-center opacity-30 hover:opacity-100 transition-opacity">
            <div className="text-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-6 h-6 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                    Intervention<br/>Toolbox
                </p>
                <p className="text-[9px] text-slate-600 mt-2">
                    Access via input menu
                </p>
            </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-black/10">
             <button 
                onClick={() => setDesktopDashboardOpen(!isDesktopDashboardOpen)}
                className={`w-full py-2 rounded border transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${isDesktopDashboardOpen ? currentTheme.buttonActive : 'border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white'}`}
             >
                 <span>Dashboard</span>
                 <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
             </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col h-full relative z-0 transition-all duration-300 ${isDesktopDashboardOpen ? 'lg:mr-96' : ''}`}>
        
        {/* Header (Mobile Only) */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 lg:hidden bg-black/20 backdrop-blur-md z-20 shrink-0">
            {/* CHANGED: onDoubleClick to onClick for Mobile Accessibility */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowTechReport(true)}>
                 <div className="font-bold text-cyan-400 tracking-wider">EAI STUDIO</div>
                 <span className="text-[9px] font-bold px-2 py-0.5 bg-white/5 rounded border border-white/10 text-slate-400">NL</span>
            </div>
            <div className="flex items-center gap-3">
                 <button onClick={() => setShowLegend(true)} className="p-2 text-slate-400">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                 </button>
                 <button onClick={() => setDesktopDashboardOpen(true)} className={`p-2 rounded ${activeMobileTab === 'dashboard' ? 'text-cyan-400 bg-cyan-900/20' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
                 </button>
            </div>
        </div>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-end pb-4">
                {messages.length === 0 && !isBooting && !showProfileSetup && (
                    <div className="text-center text-slate-600 my-auto animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                            <span className="text-2xl animate-pulse">💠</span>
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest mb-1">EAI Core Active</p>
                        <p className="text-xs">SSOT v{ssotVersion} • NL</p>
                    </div>
                )}
                
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} themeClasses={currentTheme.bubbleUser} />
                ))}
                
                {isLoading && (
                     <div className="flex items-center gap-3 text-slate-500 text-xs px-4 animate-in fade-in slide-in-from-bottom-2">
                         <div className="flex gap-1">
                             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                         </div>
                         <span className={`font-mono uppercase tracking-wide ${loadingStatus.includes('⚠️') ? 'text-orange-400 animate-pulse' : 'text-slate-400'}`}>
                             {loadingStatus || 'Processing...'}
                         </span>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 hidden lg:flex flex-col gap-2 z-10">
            <button onClick={() => setShowLegend(true)} className="p-2 bg-black/20 hover:bg-black/40 text-slate-500 hover:text-white rounded-lg border border-white/5 backdrop-blur-sm transition-all" title="Legend">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.122 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
            </button>
             <button onClick={resetChatSession} className="p-2 bg-black/20 hover:bg-red-900/40 text-slate-500 hover:text-red-400 rounded-lg border border-white/5 backdrop-blur-sm transition-all" title="Reset">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            </button>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-[#0b1120] via-[#0b1120]/95 to-transparent z-20">
            <div className="max-w-3xl mx-auto relative flex gap-2 items-end">
                <button onClick={() => setToolboxOpen(!isToolboxOpen)} className="lg:hidden p-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                </button>
                <button onClick={() => setToolboxOpen(!isToolboxOpen)} className="hidden lg:flex p-3 rounded-xl bg-slate-800/50 text-slate-400 border border-slate-700 hover:text-cyan-400 hover:border-cyan-500/50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                </button>
                <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center p-1 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all relative backdrop-blur-sm">
                    <textarea
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                            lastInteractionRef.current = Date.now(); // Reset timer on typing
                            nudgeLevelRef.current = 0; // Reset nudge level on typing
                        }}
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        placeholder="Typ een bericht..."
                        className="flex-1 bg-transparent border-none text-white px-3 py-3 max-h-32 min-h-[50px] focus:ring-0 resize-none placeholder-slate-500 scrollbar-hide text-[16px]"
                        rows={1}
                    />
                    <button onClick={() => handleSendMessage()} disabled={!inputText.trim()} className={`p-2.5 m-1 rounded-xl transition-all duration-300 ${inputText.trim() ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-500' : 'bg-slate-800 text-slate-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
                    </button>
                </div>
            </div>
            <div className="max-w-3xl mx-auto mt-2 flex justify-center">
                 <p className="text-[9px] text-slate-600 font-mono flex items-center gap-2">
                     <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                     {isConnected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
                 </p>
            </div>
        </div>
      </div>

      <Dashboard 
            analysis={currentAnalysis} 
            mechanical={currentMechanical} 
            isOpen={isDesktopDashboardOpen} 
            onClose={() => setDesktopDashboardOpen(false)} 
            theme={currentTheme} 
            isLoading={isLoading} 
            profile={learnerProfile} 
            eaiState={eaiState}
            onEditProfile={() => setShowProfileSetup(true)}
      />

      {isToolboxOpen && (
          <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setToolboxOpen(false)}></div>
              <div className="absolute bottom-0 left-0 right-0 lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bottom-auto lg:w-[640px] lg:rounded-2xl bg-[#0f172a] border-t lg:border border-slate-700 rounded-t-2xl p-4 max-h-[70vh] lg:max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-full lg:animate-in lg:zoom-in-95 lg:slide-in-from-bottom-0 duration-300 shadow-2xl">
                  <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-4 lg:hidden"></div>
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
                       <h2 className="text-lg font-bold text-white tracking-widest uppercase">Intervention Toolbox</h2>
                       <button onClick={() => setToolboxOpen(false)} className="p-1 hover:bg-white/10 rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide snap-x">
                       {Object.keys(toolCategories).map((cat) => (
                           <button key={cat} onClick={() => setActiveToolTab(cat)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border snap-center ${activeToolTab === cat ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'bg-slate-800/50 text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800'}`}>{cat}</button>
                       ))}
                  </div>
                  <div key={activeToolTab} className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {currentCategoryTools.map((tool: any) => (
                            <button key={tool.command} onClick={() => handleSendMessage(tool.command)} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-cyan-500/50 transition-all active:scale-98 group">
                                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform">{tool.icon}</span>
                                <div className="text-left min-w-0">
                                    <div className="text-sm font-bold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">{tool.label}</div>
                                    <div className="text-xs text-slate-500 truncate">{tool.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ChatInterface;
