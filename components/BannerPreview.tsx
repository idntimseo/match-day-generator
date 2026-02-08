
import React, { useState } from 'react';

interface BannerPreviewProps {
  imageUrl: string | null;
  prompt: string | null;
  loading: boolean;
  matchInfo: string;
}

const BannerPreview: React.FC<BannerPreviewProps> = ({ imageUrl, prompt, loading, matchInfo }) => {
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;

    // Convert PNG from AI to JPG using canvas for smaller file size
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const jpgUrl = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = jpgUrl;
        link.download = `bola-banner-${matchInfo.toLowerCase().replace(/\s+/g, '-')}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full min-h-[500px] transition-all duration-700 hover:border-slate-700">
      <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.2em] font-oswald">
            AI Rendering
          </h2>
        </div>
        <div className="flex gap-2">
          {prompt && !loading && (
            <button
              onClick={handleCopyPrompt}
              className={`group/btn relative px-4 py-2 text-[10px] font-black rounded-full flex items-center gap-2 transition-all border ${
                copied 
                ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'COPIED!' : 'COPY PROMPT'}
            </button>
          )}
          {imageUrl && !loading && (
            <button
              onClick={handleDownload}
              className="group/btn relative px-6 py-2 bg-white text-black text-xs font-black rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <i className="fas fa-cloud-download-alt"></i>
              DOWNLOAD JPG
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-8 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {loading ? (
          <div className="text-center space-y-8 z-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
              <div className="w-24 h-24 border-2 border-slate-500/10 border-b-indigo-400 rounded-full animate-[spin_2s_linear_infinite] absolute inset-0"></div>
              <i className="fas fa-futbol absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-white animate-bounce"></i>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-oswald text-white tracking-widest uppercase animate-pulse">Designing Hype...</h3>
              <div className="flex flex-col items-center gap-1">
                <p className="text-indigo-400/80 text-[10px] font-bold uppercase tracking-widest">Optimizing Typography</p>
                <p className="text-slate-600 text-[9px] uppercase tracking-widest">Adjusting Logo Buffer Zones</p>
              </div>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-1000">
            <div className="absolute -inset-10 bg-indigo-600/20 blur-[100px] rounded-full opacity-50"></div>
            <img
              src={imageUrl}
              alt="Generated Banner"
              className="max-w-full max-h-[550px] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <div className="text-center space-y-6 max-w-sm z-10 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto text-slate-700 border border-slate-800 rotate-12 transition-transform duration-500 group-hover:rotate-0">
              <i className="fas fa-image text-4xl"></i>
            </div>
            <div className="space-y-2">
              <p className="text-white font-oswald text-lg uppercase tracking-widest">Canvas Empty</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                Configure your match details and visual style to begin the creative process.
              </p>
            </div>
          </div>
        )}
      </div>

      {imageUrl && !loading && (
        <div className="p-4 bg-slate-900/80 text-[9px] text-slate-500 text-center font-bold uppercase tracking-[0.3em] border-t border-slate-800/50">
          Smart Layout Active • Anti-Overlap System Engaged
        </div>
      )}
    </div>
  );
};

export default BannerPreview;
