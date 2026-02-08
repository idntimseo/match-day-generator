
import React, { useRef, useEffect, useState } from 'react';
import { MatchDetails, ManualLayout } from '../types';

interface ManualRendererProps {
  details: MatchDetails;
}

const ManualRenderer: React.FC<ManualRendererProps> = ({ details }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({});

  const loadImage = (url: string, key: string) => {
    if (!url || loadedImages[key]?.src === url) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      setLoadedImages(prev => ({ ...prev, [key]: img }));
    };
    img.onerror = () => console.warn(`Failed to load ${key}`);
  };

  useEffect(() => {
    const bgSource = details.customBackground || details.backgroundUrl;
    if (bgSource) loadImage(bgSource, 'bg');

    const homeLogoSource = details.homeLogo || details.homeLogoUrl;
    if (homeLogoSource) loadImage(homeLogoSource, 'homeLogo');

    const awayLogoSource = details.awayLogo || details.awayLogoUrl;
    if (awayLogoSource) loadImage(awayLogoSource, 'awayLogo');
  }, [
    details.customBackground, 
    details.backgroundUrl, 
    details.homeLogo, 
    details.homeLogoUrl, 
    details.awayLogo, 
    details.awayLogoUrl
  ]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1920;
    const H = 1080;
    canvas.width = W;
    canvas.height = H;

    // 0. Solid Base Layer
    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, W, H);

    // 1. Draw Background with ULTRA Opacity
    const bg = loadedImages['bg'];
    if (bg) {
      const scale = Math.max(W / bg.width, H / bg.height);
      const x = (W / 2) - (bg.width / 2) * scale;
      const y = (H / 2) - (bg.height / 2) * scale;
      
      // Opacity tetap di 0.95 biar sangat terang
      ctx.globalAlpha = 0.95;
      ctx.drawImage(bg, x, y, bg.width * scale, bg.height * scale);
      ctx.globalAlpha = 1.0; 
      
      // Ultra Soft Vignette (Sangat Tipis)
      const grad = ctx.createRadialGradient(W/2, H/2, 400, W/2, H/2, W/2);
      grad.addColorStop(0, 'rgba(0,0,0,0.05)'); 
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');  
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#0a0f1a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#0a0f1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    const homeLogo = loadedImages['homeLogo'];
    const awayLogo = loadedImages['awayLogo'];

    if (details.layout === ManualLayout.ELITE_BROADCAST) {
      // 2. Tournament (Top Center)
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = '700 48px Oswald';
      ctx.letterSpacing = '6px';
      ctx.shadowColor = 'rgba(0,0,0,1)'; 
      ctx.shadowBlur = 15;
      ctx.fillText(details.tournament.toUpperCase(), W / 2, 420);
      ctx.shadowBlur = 0;

      // 3. Main Names & VS
      const centerY = H / 2;
      const vsWidth = 140;
      const gapBetweenNameAndVs = 60;
      const logoGap = 120;
      const maxNameWidth = 550; 
      const baseFontSize = 130;

      const getScaledFontSize = (text: string, maxWidth: number, initialSize: number) => {
        ctx.font = `900 ${initialSize}px Oswald`;
        let width = ctx.measureText(text).width;
        if (width > maxWidth) {
          return initialSize * (maxWidth / width);
        }
        return initialSize;
      };

      const homeFontSize = getScaledFontSize(details.homeTeam.toUpperCase(), maxNameWidth, baseFontSize);
      const awayFontSize = getScaledFontSize(details.awayTeam.toUpperCase(), maxNameWidth, baseFontSize);

      ctx.fillStyle = 'white';
      ctx.font = 'italic 700 80px Oswald';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 12;
      ctx.fillText('vs', W / 2, centerY + 30);

      ctx.font = `900 ${homeFontSize}px Oswald`;
      ctx.textAlign = 'right';
      const homeX = W / 2 - vsWidth / 2 - gapBetweenNameAndVs;
      ctx.fillText(details.homeTeam.toUpperCase(), homeX, centerY + 50);
      const actualHomeWidth = ctx.measureText(details.homeTeam.toUpperCase()).width;

      ctx.font = `900 ${awayFontSize}px Oswald`;
      ctx.textAlign = 'left';
      const awayX = W / 2 + vsWidth / 2 + gapBetweenNameAndVs;
      ctx.fillText(details.awayTeam.toUpperCase(), awayX, centerY + 50);
      const actualAwayWidth = ctx.measureText(details.awayTeam.toUpperCase()).width;
      ctx.shadowBlur = 0;

      // 4. Logos
      const logoSize = 180;
      const homeLogoX = Math.max(150, homeX - actualHomeWidth - logoGap);
      const awayLogoX = Math.min(W - 150, awayX + actualAwayWidth + logoGap);

      if (homeLogo) {
        renderLogo(ctx, homeLogo, homeLogoX, centerY, logoSize);
      }
      if (awayLogo) {
        renderLogo(ctx, awayLogo, awayLogoX, centerY, logoSize);
      }

      // 5. Match Date
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = '500 42px Inter';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 8;
      ctx.fillText(details.matchDate, W / 2, centerY + 160);
      ctx.shadowBlur = 0;
    } 
    else {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px Inter';
      ctx.fillText(details.tournament.toUpperCase(), W / 2, 100);
      
      if (details.layout === ManualLayout.CLASSIC_VS) {
        renderTeam(ctx, details.homeTeam, homeLogo, W * 0.28, H / 2);
        renderTeam(ctx, details.awayTeam, awayLogo, W * 0.72, H / 2);
        ctx.fillStyle = details.accentColor;
        ctx.font = 'bold 120px Oswald';
        ctx.fillText('VS', W / 2, H / 2 + 40);
      } else if (details.layout === ManualLayout.SPLIT_SCREEN) {
        ctx.fillStyle = details.accentColor + '33';
        ctx.beginPath(); ctx.moveTo(W*0.4, 0); ctx.lineTo(W*0.6, 0); ctx.lineTo(W*0.5, H); ctx.lineTo(W*0.3, H); ctx.fill();
        renderTeam(ctx, details.homeTeam, homeLogo, W * 0.25, H / 2, 450);
        renderTeam(ctx, details.awayTeam, awayLogo, W * 0.75, H / 2, 450);
      }
    }

    // LINE BORDER DIHAPUS SESUAI REQUEST USER
  };

  const renderLogo = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number) => {
    const aspect = img.width / img.height;
    let w = size;
    let h = size / aspect;
    if (h > size) {
      h = size; w = size * aspect;
    }
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 30;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    ctx.shadowBlur = 0;
  };

  const renderTeam = (ctx: CanvasRenderingContext2D, name: string, logo: HTMLImageElement | undefined, x: number, y: number, logoSize = 400) => {
    if (logo) renderLogo(ctx, logo, x, y - 100, logoSize);
    ctx.fillStyle = 'white';
    ctx.font = '900 90px Oswald';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 15;
    ctx.fillText(name.toUpperCase(), x, y + 220);
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    const timeout = setTimeout(draw, 50);
    return () => clearTimeout(timeout);
  }, [details, loadedImages]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `matchday-${details.homeTeam}-vs-${details.awayTeam}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 p-2 rounded-[2.5rem] border border-slate-800 shadow-2xl relative group overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-auto rounded-[2rem] shadow-2xl bg-[#05080f]" />
        <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-md">
           <button onClick={handleDownload} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-sm tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl">
             <i className="fas fa-download mr-3"></i> Download JPG
           </button>
        </div>
      </div>
      <div className="flex items-center justify-between px-8 py-4 bg-indigo-600/10 border border-indigo-600/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Elite Broadcast Engine Active</span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase">Border removed • Ultra Clarity Mode</span>
      </div>
    </div>
  );
};

export default ManualRenderer;
