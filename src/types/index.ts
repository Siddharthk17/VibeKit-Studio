export interface User {
  id: string;
  email: string;
}

export interface Page {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  theme_id: string;
  status: 'draft' | 'published';
  content: PageContent;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  hero: HeroSection;
  features: FeatureCard[];
  gallery: string[];
  contact: ContactSection;
}

export interface HeroSection {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
}

export interface FeatureCard {
  title: string;
  description: string;
}

export interface ContactSection {
  title: string;
  subtitle: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
  };
  spacing: {
    section: string;
    card: string;
  };
  radius: string;
  buttonStyle: 'solid' | 'outline' | 'glow' | 'brutal' | 'soft' | 'pixel';
  shadow: string;
}

export interface ContactSubmission {
  id: string;
  page_id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
