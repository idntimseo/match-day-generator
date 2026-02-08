
export interface MatchDetails {
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  homeLogoUrl?: string;
  awayLogo?: string;
  awayLogoUrl?: string;
  tournament: string;
  matchDate: string;
  style: BannerStyle;
  // Manual Mode specific fields
  customBackground?: string;
  backgroundUrl?: string;
  layout: ManualLayout;
  textColor: string;
  accentColor: string;
}

export enum BannerStyle {
  MODERN = 'Modern & Clean',
  EPIC = 'Epic Stadium',
  NEON = 'Neon Cyberpunk',
  VINTAGE = 'Vintage Classic',
  MINIMAL = 'Minimalist'
}

export enum ManualLayout {
  ELITE_BROADCAST = 'Elite Broadcast (TV Style)',
  CLASSIC_VS = 'Classic VS',
  SPLIT_SCREEN = 'Split Screen',
  BOTTOM_BRANDING = 'Bottom Branding'
}

export interface BannerResult {
  imageUrl: string;
  prompt: string;
}
