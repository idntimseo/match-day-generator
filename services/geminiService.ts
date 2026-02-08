
import { GoogleGenAI } from "@google/genai";
import { MatchDetails, BannerStyle } from "../types";

const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    if (url.startsWith('data:image')) return url.split(',')[1];
    // Use a proxy or just try direct fetch (note: might hit CORS if not proxied)
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image URL to base64:", error);
    return null;
  }
};

export const generateMatchBanner = async (details: MatchDetails): Promise<{ imageUrl: string; prompt: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const stylePrompts: Record<BannerStyle, string> = {
    [BannerStyle.MODERN]: "Ultra-modern sports broadcasting aesthetic. Use glassmorphism, clean sans-serif typography (like Inter or Montserrat), dynamic gradient overlays, and sharp geometric vector elements. High-end digital look.",
    [BannerStyle.EPIC]: "Cinematic stadium atmosphere at dusk. Heavy atmosphere with smoke, volumetric lighting, dramatic spotlights, and high-contrast shadows. Text should feel heavy and powerful like a movie title.",
    [BannerStyle.NEON]: "Cyberpunk-inspired sports aesthetic. Vibrant glowing outlines, electric team colors, digital glitch artifacts, and synthwave sunset lighting. Text should have a neon tube glow effect.",
    [BannerStyle.VINTAGE]: "1970s classic football poster. Distressed paper texture, halftone dot patterns, limited color palette, bold blocky slab-serif typography. High-quality print scan look with authentic grain.",
    [BannerStyle.MINIMAL]: "Swiss design school influence. Extreme focus on white space, bold Swiss-style layout, primary geometric shapes, and massive, clear typography. Elegant and strictly organized."
  };

  const layoutRules = `
CRITICAL TYPOGRAPHY & BRANDING RULES (MANDATORY):
1. CHARACTER-BY-CHARACTER SPELLING: You must render the team names exactly: "${details.homeTeam}" and "${details.awayTeam}". 
   - Perform a spelling audit: Count the letters and match them exactly. 
2. IMMUTABLE TEXT: Treat team names as raw data strings. No artistic interpretation.
3. HIGH-CONTRAST TYPOGRAPHY: Use bold, clean, and solid fonts.
4. ABSOLUTE LOGO PRESERVATION: Render the provided club logos as EXACT REPRODUCTIONS. 
5. LOGO PROTECTION ZONES: Keep logos in clear "Safe Zones" on the left and right. Zero overlap with text.
6. BACKGROUND DEPTH: Apply a professional 20% background blur to the stadium only. THE TEXT AND LOGOS MUST BE 100% SHARP.
7. NO TEXT HALLUCINATION: Ensure no extra letters appear anywhere.`;

  let prompt = `Act as a Master Sports Graphic Designer for a professional TV Broadcast. 
  Task: Create a 4K "Match Day" banner with PERFECT SPELLING.

  PRIMARY TEXT ASSETS:
  - HOME: ${details.homeTeam.toUpperCase()}
  - AWAY: ${details.awayTeam.toUpperCase()}
  - TOURNAMENT: ${details.tournament.toUpperCase()}
  - TIME: ${details.matchDate}

  VISUAL STYLE:
  - Theme: ${stylePrompts[details.style]}
  ${layoutRules}

  TECHNICAL SPECIFICATIONS:
  - Resolution: 4K UHD, 16:9 Aspect Ratio.
  - Accuracy: Zero spelling errors on "${details.homeTeam}" and "${details.awayTeam}".`;

  const parts: any[] = [{ text: prompt }];

  // Handle Home Logo (Local or URL)
  const homeLogoSource = details.homeLogo || details.homeLogoUrl;
  if (homeLogoSource) {
    const base64Data = await imageUrlToBase64(homeLogoSource);
    if (base64Data) {
      parts.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
      prompt += `\n- USE LOGO ASSET 1 FOR ${details.homeTeam.toUpperCase()}.`;
    }
  }

  // Handle Away Logo (Local or URL)
  const awayLogoSource = details.awayLogo || details.awayLogoUrl;
  if (awayLogoSource) {
    const base64Data = await imageUrlToBase64(awayLogoSource);
    if (base64Data) {
      parts.push({ inlineData: { data: base64Data, mimeType: "image/png" } });
      prompt += `\n- USE LOGO ASSET 2 FOR ${details.awayTeam.toUpperCase()}.`;
    }
  }

  parts[0].text = prompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });

    let imageUrl = '';
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("Banner generation failed.");
    return { imageUrl, prompt };
  } catch (error) {
    console.error("Strict Generator Error:", error);
    throw error;
  }
};
