
import React, { useRef, useEffect, useState } from 'react';
// Changed OfflineLayout to ManualLayout to match types.ts definition
import { MatchDetails, ManualLayout } from '../types';

interface OfflineRendererProps {
  details: MatchDetails;
}

const OfflineRenderer: React.FC<OfflineRendererProps> = ({ details }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (details.customBackground) {
      const bgImg = new Image();
      bgImg.src = details.customBackground;
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, width, height);
        drawOverlays(ctx, width, height);
      };
    } else {
      // Default Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Add a stadium-like pattern
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      drawOverlays(ctx, width, height);
    }
  };

  const drawOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 2. Layout Overlays
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, width, height);

    // Dynamic Gradient Overlay based on accent color
    const accentGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 800);
    accentGrad.addColorStop(0, 'transparent');
    accentGrad.addColorStop(1, details.accentColor + '22');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, width, height);

    // Text Settings
    const primaryFont = 'Oswald';
    const secondaryFont = 'Inter';

    // 3. Render Based on Layout
    // Updated OfflineLayout reference to ManualLayout
    if (details.layout === ManualLayout.CLASSIC_VS) {
      // VS Text
      ctx.fillStyle = details.accentColor;
      ctx.font = `bold 120px ${primaryFont}`;
      ctx.textAlign = 'center';
      ctx.fillText('VS', width / 2, height / 2 + 40);

      // Home Side
      renderTeam(ctx, details.homeTeam, details.homeLogo, width * 0.25, height / 2);
      // Away Side
      renderTeam(ctx, details.awayTeam, details.awayLogo, width * 0.75, height / 2);
    } 
    // Updated OfflineLayout reference to ManualLayout
    else if (details.layout === ManualLayout.SPLIT_SCREEN) {
      ctx.fillStyle = details.accentColor + '44';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width * 0.5, 0);
      ctx.lineTo(width * 0.4, height);
      ctx.lineTo(0, height);
      ctx.fill();

      renderTeam(ctx, details.homeTeam, details.homeLogo, width * 0.25, height / 2, 250);
      renderTeam(ctx, details.awayTeam, details.awayLogo, width * 0.75, height / 2, 250);
    }
    // Updated OfflineLayout reference to ManualLayout
    else if (details.layout === ManualLayout.BOTTOM_BRANDING) {
       ctx.fillStyle = 'rgba(0,0,0,0.8)';
       ctx.fillRect(0, height - 150, width, 150);
       
       ctx.fillStyle = 'white';
       ctx.font = `bold 80px ${primaryFont}`;
       ctx.textAlign = 'center';
       ctx.fillText(`${details.homeTeam.toUpperCase()} VS ${details.awayTeam.toUpperCase()}`, width/2, height/2);

       if(details.homeLogo) renderLogo(ctx, details.homeLogo, 100, height - 75, 100);
       if(details.awayLogo) renderLogo(ctx, details.awayLogo, width - 100, height - 75, 100);
    }

    // 4. Tournament & Date
    ctx.fillStyle = 'white';
    ctx.font = `bold 24px ${secondaryFont}`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '5px';
    ctx.fillText(details.tournament.toUpperCase(), width / 2, 80);
    
    ctx.fillStyle = details.accentColor;
    ctx.font = `bold 20px ${secondaryFont}`;
    ctx.fillText(details.matchDate.toUpperCase(), width / 2, 120);

    // Decorative Borders
    ctx.strokeStyle = details.accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, width - 40, height - 40);
  };

  const renderTeam = (ctx: CanvasRenderingContext2D, name: string, logo: string | undefined, x: number, y: number, logoSize = 300) => {
    if (logo) {
      renderLogo(ctx, logo, x, y - 80, logoSize);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.arc(x, y - 80, logoSize/2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;
    ctx.font = `bold 60px Oswald`;
    ctx.textAlign = 'center';
    ctx.fillText(name.toUpperCase(), x, y + 160);
    ctx.shadowBlur = 0;
  };

  const renderLogo = (ctx: CanvasRenderingContext2D, src: string, x: number, y: number, size: number) => {
    const img = new Image();
    img.src = src;
    try {
        const aspect = img.width / img.height;
        let w = size;
        let h = size / aspect;
        if (h > size) {
            h = size;
            w = size * aspect;
        }
        ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    } catch(e) {}
  };

  useEffect(() => {
    const interval = setInterval(draw, 100); // Polling for real-time updates as images load
    return () => clearInterval(interval);
  }, [details]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `offline-banner-${details.homeTeam}-vs-${details.awayTeam}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden border border-slate-700 bg-black group">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
           <button 
             onClick={handleDownload}
             className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:scale-110 transition-transform"
           >
             <i className="fas fa-download mr-2"></i> Download Offline Banner
           </button>
        </div>
      </div>
      <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Canvas Preview Mode</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase">Res: 1280x720</span>
      </div>
    </div>
  );
};

export default OfflineRenderer;
