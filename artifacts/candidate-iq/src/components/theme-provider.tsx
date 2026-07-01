import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";
type PaletteName = "amber" | "indigo" | "emerald" | "rose" | "sapphire" | "graphite" | "crimson" | "arctic";
type MotionMode = "elegant" | "minimal" | "presentation" | "performance";
type SidebarMode = "expanded" | "collapsed";
type LayoutMode = "editorial" | "compact";
type FontSizeMode = "sm" | "base" | "lg";

interface ThemeContextValue {
  theme: ThemeMode;
  palette: PaletteName;
  motion: MotionMode;
  sidebarCollapsed: boolean;
  layout: LayoutMode;
  fontSize: FontSizeMode;
  previewTheme: (value: ThemeMode) => void;
  previewPalette: (value: PaletteName) => void;
  previewMotion: (value: MotionMode) => void;
  clearPreview: () => void;
  setTheme: (theme: ThemeMode) => void;
  setPalette: (palette: PaletteName) => void;
  setMotion: (motion: MotionMode) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLayout: (layout: LayoutMode) => void;
  setFontSize: (fontSize: FontSizeMode) => void;
  resetDemoData: () => void;
  exportDemoData: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const paletteConfig: Record<PaletteName, { label: string; accent: string; accentForeground: string; soft: string; strong: string; text: string; chart1: string; chart2: string; chart3: string; chart4: string; chart5: string }> = {
  amber: { label: "Amber Prestige", accent: "#b8893c", accentForeground: "#fff8f0", soft: "#f7ebd6", strong: "#8f642c", text: "#6f4014", chart1: "#b8893c", chart2: "#2e7d6f", chart3: "#2464d0", chart4: "#b85b7d", chart5: "#2f6f8f" },
  indigo: { label: "Indigo Intelligence", accent: "#5a6be8", accentForeground: "#f6f7ff", soft: "#e8ebff", strong: "#3f54bf", text: "#374389", chart1: "#5a6be8", chart2: "#1d6f6e", chart3: "#af7a1b", chart4: "#b85b7d", chart5: "#3c8dbc" },
  emerald: { label: "Emerald Growth", accent: "#2b7a5c", accentForeground: "#f3fdf8", soft: "#e2f5eb", strong: "#205b45", text: "#234d3c", chart1: "#2b7a5c", chart2: "#4b5bd4", chart3: "#d97706", chart4: "#c2410c", chart5: "#0f766e" },
  rose: { label: "Rose Editorial", accent: "#b85a6c", accentForeground: "#fff7f9", soft: "#fce9ee", strong: "#91404f", text: "#7e3848", chart1: "#b85a6c", chart2: "#2563eb", chart3: "#0f766e", chart4: "#92400e", chart5: "#7c3aed" },
  sapphire: { label: "Sapphire Executive", accent: "#2563eb", accentForeground: "#f2f7ff", soft: "#dbeafe", strong: "#1d4ed8", text: "#213f8f", chart1: "#2563eb", chart2: "#7c3aed", chart3: "#0f766e", chart4: "#b45309", chart5: "#0891b2" },
  graphite: { label: "Graphite Professional", accent: "#475569", accentForeground: "#f7f8fa", soft: "#e2e8f0", strong: "#334155", text: "#334155", chart1: "#475569", chart2: "#64748b", chart3: "#94a3b8", chart4: "#0f172a", chart5: "#1e293b" },
  crimson: { label: "Crimson Strategy", accent: "#b91c1c", accentForeground: "#fff7f7", soft: "#fee2e2", strong: "#991b1b", text: "#7f1d1d", chart1: "#b91c1c", chart2: "#4338ca", chart3: "#ea580c", chart4: "#0f766e", chart5: "#4d7c0f" },
  arctic: { label: "Arctic Minimal", accent: "#0f766e", accentForeground: "#f3fffd", soft: "#d6f5f1", strong: "#115e59", text: "#164e63", chart1: "#0f766e", chart2: "#2563eb", chart3: "#64748b", chart4: "#b45309", chart5: "#7c3aed" },
};

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => readStoredValue<ThemeMode>("skilldock-theme", "light"));
  const [palette, setPaletteState] = useState<PaletteName>(() => readStoredValue<PaletteName>("skilldock-palette", "amber"));
  const [motion, setMotionState] = useState<MotionMode>(() => readStoredValue<MotionMode>("skilldock-motion-mode", "elegant"));
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => readStoredValue<boolean>("skilldock-sidebar-collapsed", false));
  const [layout, setLayoutState] = useState<LayoutMode>(() => readStoredValue<LayoutMode>("skilldock-layout", "editorial"));
  const [fontSize, setFontSizeState] = useState<FontSizeMode>(() => readStoredValue<FontSizeMode>("skilldock-font-size", "base"));
  const [previewThemeState, setPreviewThemeState] = useState<ThemeMode | null>(null);
  const [previewPaletteState, setPreviewPaletteState] = useState<PaletteName | null>(null);
  const [previewMotionState, setPreviewMotionState] = useState<MotionMode | null>(null);

  useEffect(() => {
    const activeTheme = previewThemeState ?? theme;
    const activePalette = previewPaletteState ?? palette;
    const activeMotion = previewMotionState ?? motion;
    const paletteTokens = paletteConfig[activePalette];
    const modeTokens = activeTheme === "dark"
      ? {
          background: "#07111d",
          foreground: "#f2efe7",
          surface: "rgba(15, 23, 42, 0.84)",
          surfaceAlt: "rgba(15, 23, 42, 0.96)",
          border: "rgba(255,255,255,0.12)",
          muted: "#9caec8",
          text: "#f4efe7",
          glow: "rgba(184, 137, 60, 0.2)",
          shadow: "0 24px 80px rgba(4, 8, 18, 0.32)",
          shadowLg: "0 36px 120px rgba(2, 6, 18, 0.45)",
          glass: "rgba(9, 15, 26, 0.74)",
        }
      : {
          background: "#f8f3ea",
          foreground: "#17253b",
          surface: "rgba(255, 253, 248, 0.82)",
          surfaceAlt: "rgba(246, 240, 228, 0.96)",
          border: "rgba(23, 37, 59, 0.1)",
          muted: "#60718d",
          text: "#17253b",
          glow: "rgba(184, 137, 60, 0.16)",
          shadow: "0 24px 80px rgba(15, 23, 42, 0.08)",
          shadowLg: "0 36px 120px rgba(15, 23, 42, 0.12)",
          glass: "rgba(255, 253, 248, 0.72)",
        };

    const motionTokens = activeMotion === "minimal"
      ? { duration: "140ms", easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", range: "0.985" }
      : activeMotion === "presentation"
        ? { duration: "260ms", easing: "cubic-bezier(0.16, 1, 0.3, 1)", range: "1.01" }
        : activeMotion === "performance"
          ? { duration: "80ms", easing: "ease-out", range: "1" }
          : { duration: "220ms", easing: "cubic-bezier(0.22, 1, 0.36, 1)", range: "1.01" };

    document.documentElement.classList.toggle("dark", activeTheme === "dark");
    document.documentElement.style.setProperty("color-scheme", activeTheme === "dark" ? "dark" : "light");
    document.documentElement.style.setProperty("--accent", paletteTokens.accent);
    document.documentElement.style.setProperty("--accent-foreground", paletteTokens.accentForeground);
    document.documentElement.style.setProperty("--accent-soft", paletteTokens.soft);
    document.documentElement.style.setProperty("--accent-strong", paletteTokens.strong);
    document.documentElement.style.setProperty("--accent-text", paletteTokens.text);
    document.documentElement.style.setProperty("--theme-bg", activeTheme === "dark" ? "linear-gradient(135deg, #07111d 0%, #0f172a 100%)" : "linear-gradient(135deg, #fcfbf8 0%, #f6efe1 100%)");
    document.documentElement.style.setProperty("--theme-surface", modeTokens.surface);
    document.documentElement.style.setProperty("--theme-surface-alt", modeTokens.surfaceAlt);
    document.documentElement.style.setProperty("--theme-surface-strong", activeTheme === "dark" ? "rgba(16, 24, 39, 0.96)" : "rgba(255, 253, 248, 0.96)");
    document.documentElement.style.setProperty("--theme-border", modeTokens.border);
    document.documentElement.style.setProperty("--theme-text", modeTokens.text);
    document.documentElement.style.setProperty("--theme-muted", modeTokens.muted);
    document.documentElement.style.setProperty("--theme-glow", modeTokens.glow);
    document.documentElement.style.setProperty("--theme-shadow", modeTokens.shadow);
    document.documentElement.style.setProperty("--theme-shadow-lg", modeTokens.shadowLg);
    document.documentElement.style.setProperty("--theme-glass", modeTokens.glass);
    document.documentElement.style.setProperty("--theme-scrollbar", activeTheme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.14)");
    document.documentElement.style.setProperty("--theme-scrollbar-thumb", activeTheme === "dark" ? "rgba(255,255,255,0.28)" : "rgba(15,23,42,0.28)");
    document.documentElement.style.setProperty("--chart-1", paletteTokens.chart1);
    document.documentElement.style.setProperty("--chart-2", paletteTokens.chart2);
    document.documentElement.style.setProperty("--chart-3", paletteTokens.chart3);
    document.documentElement.style.setProperty("--chart-4", paletteTokens.chart4);
    document.documentElement.style.setProperty("--chart-5", paletteTokens.chart5);
    document.documentElement.style.setProperty("--motion-duration", motionTokens.duration);
    document.documentElement.style.setProperty("--motion-easing", motionTokens.easing);
    document.documentElement.style.setProperty("--motion-scale", motionTokens.range);
    document.documentElement.style.setProperty("--motion-blur", activeMotion === "minimal" ? "blur(16px)" : "blur(24px)");
    document.documentElement.style.setProperty("--motion-opacity", activeMotion === "performance" ? "0.95" : "1");
    document.documentElement.setAttribute("data-theme", activeTheme);
    document.documentElement.setAttribute("data-palette", activePalette);
    document.documentElement.setAttribute("data-motion", activeMotion);
    document.documentElement.setAttribute("data-layout", layout);
    document.documentElement.setAttribute("data-font-size", fontSize);
    document.documentElement.setAttribute("data-sidebar-collapsed", sidebarCollapsed ? "true" : "false");
  }, [fontSize, layout, motion, palette, previewMotionState, previewPaletteState, previewThemeState, sidebarCollapsed, theme]);

  const setTheme = (value: ThemeMode) => {
    setThemeState(value);
    writeStoredValue("skilldock-theme", value);
  };

  const setPalette = (value: PaletteName) => {
    setPaletteState(value);
    writeStoredValue("skilldock-palette", value);
  };

  const setMotion = (value: MotionMode) => {
    setMotionState(value);
    writeStoredValue("skilldock-motion-mode", value);
  };

  const setSidebarCollapsed = (value: boolean) => {
    setSidebarCollapsedState(value);
    writeStoredValue("skilldock-sidebar-collapsed", value);
  };

  const setLayout = (value: LayoutMode) => {
    setLayoutState(value);
    writeStoredValue("skilldock-layout", value);
  };

  const setFontSize = (value: FontSizeMode) => {
    setFontSizeState(value);
    writeStoredValue("skilldock-font-size", value);
  };

  const previewTheme = (value: ThemeMode) => setPreviewThemeState(value);
  const previewPalette = (value: PaletteName) => setPreviewPaletteState(value);
  const previewMotion = (value: MotionMode) => setPreviewMotionState(value);
  const clearPreview = () => {
    setPreviewThemeState(null);
    setPreviewPaletteState(null);
    setPreviewMotionState(null);
  };

  const resetDemoData = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("skilldock-demo-notes");
    window.localStorage.removeItem("quickRankData");
    window.localStorage.removeItem("skilldock-demo-entered");
    window.localStorage.removeItem("skilldock-palette");
    window.localStorage.removeItem("skilldock-motion-mode");
    window.localStorage.removeItem("skilldock-sidebar-collapsed");
    window.localStorage.removeItem("skilldock-layout");
    window.localStorage.removeItem("skilldock-font-size");
    setTheme("light");
    setPalette("amber");
    setMotion("elegant");
    setSidebarCollapsed(false);
    setLayout("editorial");
    setFontSize("base");
  };

  const exportDemoData = () => {
    if (typeof window === "undefined") return;
    const payload = {
      theme,
      palette,
      motion,
      sidebarCollapsed,
      layout,
      fontSize,
      exportedAt: new Date().toISOString(),
      notes: readStoredValue<string>("skilldock-demo-notes", ""),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "skilldock-demo-data.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const value = useMemo(
    () => ({
      theme,
      palette,
      motion,
      sidebarCollapsed,
      layout,
      fontSize,
      previewTheme,
      previewPalette,
      previewMotion,
      clearPreview,
      setTheme,
      setPalette,
      setMotion,
      setSidebarCollapsed,
      setLayout,
      setFontSize,
      resetDemoData,
      exportDemoData,
    }),
    [fontSize, layout, motion, palette, sidebarCollapsed, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
