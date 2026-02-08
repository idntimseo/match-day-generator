
import React from 'react';

interface HeaderProps {
  isManualMode: boolean;
  setIsManualMode: (mode: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ isManualMode, setIsManualMode }) => {
  return (
    <header className="py-4 px-4 md:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i className="fas fa-futbol text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-oswald tracking-tight uppercase leading-none">
              Bola<span className="text-indigo-500">Banner</span> AI
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hype Generator v2.7</p>
          </div>
        </div>

        {/* Mode Switcher - Centered in Header */}
        <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-800 flex gap-1">
          <button 
            onClick={() => setIsManualMode(false)}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${!isManualMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fas fa-wand-magic-sparkles"></i> AI Mode
          </button>
          <button 
            onClick={() => setIsManualMode(true)}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isManualMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <i className="fas fa-pen-nib"></i> Manual Mode
          </button>
        </div>

        {/* Social / Links Section */}
        <div className="hidden lg:flex gap-4">
          <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-slate-700">
            <i className="fab fa-twitter text-sm"></i>
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-slate-700">
            <i className="fab fa-instagram text-sm"></i>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
