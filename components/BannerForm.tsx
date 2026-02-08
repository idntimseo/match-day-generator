
import React, { useRef, useState, useEffect } from 'react';
import { MatchDetails, BannerStyle, ManualLayout } from '../types';

interface BannerFormProps {
  details: MatchDetails;
  onChange: (details: MatchDetails) => void;
  onSubmit: () => void;
  loading: boolean;
  isManual?: boolean;
}

const PRESET_LEAGUES = [
  "PREMIER LEAGUE",
  "LA LIGA",
  "SERIE A",
  "BUNDESLIGA",
  "LIGUE 1",
  "UEFA CHAMPIONS LEAGUE",
  "UEFA EUROPA LEAGUE",
  "INDONESIA LIGA 1",
  "INDONESIA LIGA 2",
  "PIALA INDONESIA",
  "WORLD CUP",
  "AFF CHAMPIONSHIP",
  "CUSTOM / MANUAL"
];

const BannerForm: React.FC<BannerFormProps> = ({ details, onChange, onSubmit, loading, isManual }) => {
  const homeLogoInput = useRef<HTMLInputElement>(null);
  const awayLogoInput = useRef<HTMLInputElement>(null);
  const bgInput = useRef<HTMLInputElement>(null);
  
  const [selectedLeague, setSelectedLeague] = useState<string>(
    PRESET_LEAGUES.includes(details.tournament.toUpperCase()) ? details.tournament.toUpperCase() : "CUSTOM / MANUAL"
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...details, [name]: value });
  };

  const handleLeagueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLeague(value);
    if (value !== "CUSTOM / MANUAL") {
      onChange({ ...details, tournament: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof MatchDetails) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...details, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); if(!isManual) onSubmit(); }} 
      className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-8"
    >
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-xl font-black text-white flex items-center gap-3 font-oswald tracking-wide">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isManual ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
            <i className={isManual ? 'fas fa-pen-ruler' : 'fas fa-futbol'}></i>
          </span>
          {isManual ? 'CANVAS DESIGNER' : 'AI MATCH DATA'}
        </h2>
      </header>
      
      {isManual && (
        <div className="space-y-6 animate-in slide-in-from-top duration-500">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Layout Template</label>
            <select 
              name="layout" 
              value={details.layout} 
              onChange={handleChange} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-bold focus:ring-2 focus:ring-indigo-600 appearance-none cursor-pointer"
            >
              {Object.values(ManualLayout).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Background Image (Link/File)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                name="backgroundUrl" 
                placeholder="https://images.unsplash.com/..." 
                value={details.backgroundUrl || ''} 
                onChange={handleChange}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white"
              />
              <button 
                type="button" 
                onClick={() => bgInput.current?.click()}
                className="bg-slate-800 px-4 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <i className="fas fa-upload text-xs text-indigo-400"></i>
              </button>
            </div>
            <input type="file" ref={bgInput} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'customBackground')} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Home Team */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Home Team Name</label>
            <input
              required
              type="text"
              name="homeTeam"
              value={details.homeTeam}
              onChange={handleChange}
              placeholder="e.g. TOTTENHAM"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 text-sm font-bold uppercase"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Logo Link (URL)</label>
            <input 
              type="text" 
              name="homeLogoUrl" 
              placeholder="https://..." 
              value={details.homeLogoUrl || ''} 
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => homeLogoInput.current?.click()}
            className={`w-full h-24 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${details.homeLogo ? 'border-indigo-600/50 bg-indigo-600/5' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'}`}
          >
            {details.homeLogo ? <img src={details.homeLogo} alt="Home" className="h-full w-full object-contain p-2" /> : <i className="fas fa-image text-slate-700 text-xl"></i>}
            {!details.homeLogo && <span className="text-[9px] font-black uppercase text-slate-600">Or Upload Image</span>}
          </button>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'homeLogo')} className="hidden" ref={homeLogoInput} />
        </div>

        {/* Away Team */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Away Team Name</label>
            <input
              required
              type="text"
              name="awayTeam"
              value={details.awayTeam}
              onChange={handleChange}
              placeholder="e.g. ARSENAL"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-600 text-sm font-bold uppercase"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Logo Link (URL)</label>
            <input 
              type="text" 
              name="awayLogoUrl" 
              placeholder="https://..." 
              value={details.awayLogoUrl || ''} 
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => awayLogoInput.current?.click()}
            className={`w-full h-24 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 overflow-hidden ${details.awayLogo ? 'border-indigo-600/50 bg-indigo-600/5' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'}`}
          >
            {details.awayLogo ? <img src={details.awayLogo} alt="Away" className="h-full w-full object-contain p-2" /> : <i className="fas fa-image text-slate-700 text-xl"></i>}
            {!details.awayLogo && <span className="text-[9px] font-black uppercase text-slate-600">Or Upload Image</span>}
          </button>
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'awayLogo')} className="hidden" ref={awayLogoInput} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Tournament</label>
          <select 
            value={selectedLeague} 
            onChange={handleLeagueChange}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-bold focus:ring-2 focus:ring-indigo-600"
          >
            {PRESET_LEAGUES.map(league => <option key={league} value={league}>{league}</option>)}
          </select>
          {selectedLeague === "CUSTOM / MANUAL" && (
            <input 
              type="text" 
              name="tournament" 
              value={details.tournament} 
              onChange={handleChange} 
              placeholder="Type league name..."
              className="w-full bg-slate-900 border border-indigo-600/30 rounded-xl px-4 py-3 text-xs text-white animate-in fade-in duration-300" 
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Schedule</label>
          <input type="text" name="matchDate" value={details.matchDate} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white" />
        </div>
      </div>

      {!isManual && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Artistic Style</label>
            <select 
              name="style" 
              value={details.style} 
              onChange={handleChange} 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-bold"
            >
              {Object.values(BannerStyle).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button
            disabled={loading}
            type="submit"
            className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl overflow-hidden group ${loading ? 'bg-slate-800 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span className="font-oswald uppercase tracking-widest">Designing...</span>
              </>
            ) : (
              <>
                <i className="fas fa-wand-magic-sparkles"></i>
                <span className="font-oswald uppercase tracking-widest">Generate AI Banner</span>
              </>
            )}
          </button>
        </div>
      )}

      {isManual && (
        <p className="text-[10px] text-center text-indigo-400 font-black uppercase tracking-[0.2em]">
          Canvas is rendering in Real-Time
        </p>
      )}
    </form>
  );
};

export default BannerForm;
