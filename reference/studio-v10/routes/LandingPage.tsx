import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-teal-500/30 selection:text-teal-200 overflow-x-hidden">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-xs font-bold tracking-[0.2em] uppercase">EAI Studio v10.0</span>
        </div>
        <div className="flex gap-6 text-xs font-medium tracking-widest uppercase">
            <Link to="/teacher" className="hover:text-teal-400 transition-colors hidden sm:block">Docent</Link>
            <Link to="/student" className="bg-white text-black px-5 py-2 rounded-full hover:bg-teal-400 hover:text-white transition-all font-bold">
                Open Studio
            </Link>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <header className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full pt-20">
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <span className="block text-white">
                    HET EINDE
                </span>
                <span className="block text-slate-500">
                    VAN DE
                </span>
                <span className="block text-teal-500">
                    BLACK BOX.
                </span>
            </h1>
            
            <div className="max-w-2xl mt-8 border-l border-white/20 pl-6 animate-in fade-in slide-in-from-left-10 duration-1000 delay-300">
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-light">
                    EAI Studio is geen chatbot. Het is een <strong className="text-white font-medium">deterministische didactische kernel</strong>. 
                    Wij vervangen "magisch denken" door een Single Source of Truth die leerprocessen bewaakt, hallucinaties blokkeert en privacy garandeert.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link to="/student" className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded text-center text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-teal-900/20 hover:scale-105">
                        Start Sessie
                    </Link>
                    <a href="#engine" className="border border-slate-700 hover:border-white text-slate-400 hover:text-white px-8 py-4 rounded text-center text-sm font-bold uppercase tracking-widest transition-all">
                        Bekijk Architectuur
                    </a>
                </div>
            </div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-teal-900/10 blur-[120px] pointer-events-none"></div>
      </header>

      {/* SECTION 2: THE SPLIT */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh] border-b border-white/5">
          {/* Left */}
          <div className="p-12 sm:p-24 border-r border-white/5 flex flex-col justify-center bg-[#050505]">
              <span className="text-red-500 font-mono text-xs uppercase tracking-widest mb-4">Legacy AI</span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-slate-400">De Wrapper Val</h2>
              <ul className="space-y-6 text-slate-500 font-light">
                  <li className="flex gap-4">
                      <span className="text-red-900 font-mono">01</span>
                      <p>Statistische waarschijnlijkheid vervangt feitelijke waarheid. Het model "gokt" het volgende woord.</p>
                  </li>
                  <li className="flex gap-4">
                      <span className="text-red-900 font-mono">02</span>
                      <p>Privacy is een bijzaak. Data wordt gebruikt om modellen te trainen.</p>
                  </li>
                  <li className="flex gap-4">
                      <span className="text-red-900 font-mono">03</span>
                      <p>Geen didactisch geheugen. De AI weet niet of je aan het stampen (K1) of reflecteren (K3) bent.</p>
                  </li>
              </ul>
          </div>

          {/* Right */}
          <div className="p-12 sm:p-24 flex flex-col justify-center bg-[#020617] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-32 h-32 text-teal-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z"/></svg>
              </div>
              <span className="text-teal-500 font-mono text-xs uppercase tracking-widest mb-4">EAI Studio Kernel</span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">De SSOT Standaard</h2>
              <ul className="space-y-6 text-slate-300 font-light relative z-10">
                  <li className="flex gap-4">
                      <span className="text-teal-900 font-mono">01</span>
                      <p><strong className="text-white">Logic Gates.</strong> De AI wordt server-side gecontroleerd. Mag hij antwoord geven? Of moet hij wedervragen?</p>
                  </li>
                  <li className="flex gap-4">
                      <span className="text-teal-900 font-mono">02</span>
                      <p><strong className="text-white">Privacy Shield.</strong> PII (Persoonsgegevens) worden gestript vòòrdat ze de AI bereiken.</p>
                  </li>
                  <li className="flex gap-4">
                      <span className="text-teal-900 font-mono">03</span>
                      <p><strong className="text-white">Curriculum Aware.</strong> De engine kent de SLO-doelen en je voortgang. Hij coacht op maat.</p>
                  </li>
              </ul>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#010205]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                  <div className="text-xl font-bold tracking-tighter mb-2">EAI STUDIO</div>
                  <p className="text-xs text-slate-500">© 2024 Educational Artificial Intelligence.</p>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase">System Operational</span>
              </div>
          </div>
      </footer>

    </div>
  );
};

export default LandingPage;