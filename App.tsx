
import React, { useState } from 'react';
import Header from './components/Header';
import BannerForm from './components/BannerForm';
import BannerPreview from './components/BannerPreview';
import ManualRenderer from './components/ManualRenderer';
import { MatchDetails, BannerStyle, ManualLayout } from './types';
import { generateMatchBanner } from './services/geminiService';

const App: React.FC = () => {
  const [isManualMode, setIsManualMode] = useState(true); // Default to Manual for easier editing
  const [details, setDetails] = useState<MatchDetails>({
    homeTeam: 'HOME',
    awayTeam: 'AWAY',
    tournament: 'PREMIER LEAGUE',
    matchDate: 'Sabtu, 24 Januari 2026 22.00 WIB',
    style: BannerStyle.EPIC,
    layout: ManualLayout.ELITE_BROADCAST,
    textColor: '#ffffff',
    accentColor: '#ffffff',
    backgroundUrl: 'https://cdn.sportjaya.me/img/img_fed84bcd86ff4cf2.png' // Default background set
  });

  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isManualMode) return; 

    if (!details.homeTeam || !details.awayTeam) {
      setError("Isi dulu nama kedua tim, Bre!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateMatchBanner(details);
      setGeneratedImage(result.imageUrl);
      setGeneratedPrompt(result.prompt);
    } catch (err: any) {
      setError(err.message || "Gagal generate banner AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 selection:bg-indigo-500/30 font-inter">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>

      <Header isManualMode={isManualMode} setIsManualMode={setIsManualMode} />

      <main className="max-w-[1440px] mx-auto px-6 py-8 lg:py-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-8">
            <BannerForm 
              details={details} 
              onChange={setDetails} 
              onSubmit={handleGenerate}
              loading={loading}
              isManual={isManualMode}
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <i className="fas fa-triangle-exclamation"></i>
                <p className="text-xs font-bold uppercase">{error}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="sticky top-28">
              {isManualMode ? (
                <div className="space-y-6">
                  <ManualRenderer details={details} />
                </div>
              ) : (
                <BannerPreview 
                  imageUrl={generatedImage} 
                  prompt={generatedPrompt}
                  loading={loading} 
                  matchInfo={`${details.homeTeam} vs ${details.awayTeam}`}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-900/50 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
          <span className="text-[10px] font-black uppercase tracking-widest">BolaBanner v2.7 // Elite TV Style</span>
          <p className="text-[10px] font-bold uppercase">Manual Mode: Zero Cost, Instant Result</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
