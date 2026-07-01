/**
 * Premium Design System Utilities
 * Shared colors, spacing, typography scales
 */

export const PremiumDesign = {
  colors: {
    // Backgrounds
    bg: {
      primary: "bg-white",
      secondary: "bg-zinc-50",
      tertiary: "bg-zinc-100",
      accent: "bg-amber-50",
    },
    // Text
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      tertiary: "text-slate-500",
      muted: "text-slate-400",
      accent: "text-amber-600",
    },
    // Borders
    border: {
      light: "border-slate-200",
      medium: "border-slate-300",
      dark: "border-slate-400",
    },
  },
  
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "2.5rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },

  // Shadows
  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    premium: "shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)]",
  },

  // Typography
  typography: {
    // Serif display headings
    h1: "font-serif text-4xl lg:text-5xl font-light tracking-tight leading-tight",
    h2: "font-serif text-3xl lg:text-4xl font-light tracking-tight leading-tight",
    h3: "font-serif text-2xl font-light tracking-tight leading-tight",
    
    // Sans-serif body
    body: "font-sans text-base leading-relaxed",
    bodySm: "font-sans text-sm leading-relaxed",
    bodyLg: "font-sans text-lg leading-relaxed",
    
    // Labels & UI
    label: "font-sans text-sm font-medium uppercase tracking-wide",
    caption: "font-sans text-xs uppercase tracking-wider",
  },
};

export type ColorKey = keyof typeof PremiumDesign.colors;
export type SpacingKey = keyof typeof PremiumDesign.spacing;
