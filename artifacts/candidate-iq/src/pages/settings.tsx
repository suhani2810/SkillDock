import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Sparkles, ShieldCheck, Palette, MoonStar, SunMedium, ArrowRight, LayoutGrid, Type, Gauge, MonitorSmartphone, SlidersHorizontal, Wand2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const studioModes = [
  { key: "light", label: "Editorial Ivory", description: "Luxury paper-inspired workspace", icon: SunMedium },
  { key: "dark", label: "Midnight Studio", description: "Cinematic dark workspace", icon: MoonStar },
] as const;

const palettes = [
  { key: "amber", label: "Amber Prestige", preview: "from-amber-500/70 to-orange-400/80" },
  { key: "indigo", label: "Indigo Intelligence", preview: "from-indigo-500/70 to-violet-400/80" },
  { key: "emerald", label: "Emerald Growth", preview: "from-emerald-500/70 to-teal-400/80" },
  { key: "rose", label: "Rose Editorial", preview: "from-rose-500/70 to-pink-400/80" },
  { key: "sapphire", label: "Sapphire Executive", preview: "from-blue-500/70 to-cyan-400/80" },
  { key: "graphite", label: "Graphite Professional", preview: "from-slate-500/70 to-slate-700/80" },
  { key: "crimson", label: "Crimson Strategy", preview: "from-red-600/70 to-rose-500/80" },
  { key: "arctic", label: "Arctic Minimal", preview: "from-teal-500/70 to-cyan-500/80" },
] as const;

const motionModes = [
  { key: "elegant", label: "Elegant Motion", description: "Crafted transitions and smooth detail" },
  { key: "minimal", label: "Minimal Motion", description: "Low-noise, calm interactions" },
  { key: "presentation", label: "Presentation Mode", description: "Deliberate pacing for live demos" },
  { key: "performance", label: "Performance Mode", description: "Fastest path with lightweight motion" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme, palette, setPalette, motion, setMotion, sidebarCollapsed, setSidebarCollapsed, layout, setLayout, fontSize, setFontSize, resetDemoData, exportDemoData, previewTheme, previewPalette, previewMotion, clearPreview } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[2rem] border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] p-8 shadow-[var(--theme-shadow-lg)] backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-border)] bg-[color:var(--accent-soft)] px-3 py-1 text-sm text-[color:var(--accent-text)]">
              <Wand2 className="h-4 w-4" /> Design Studio
            </div>
            <h1 className="mt-3 font-serif text-4xl text-[color:var(--theme-text)]">Studio Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-[color:var(--theme-muted)]">Tune the atmosphere, palette, motion, and editorial rhythm of your workspace.</p>
          </div>
          <Button onClick={() => { clearPreview(); }} variant="outline" className="gap-2">Reset preview</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] shadow-[var(--theme-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl text-[color:var(--theme-text)]">
              <Palette className="h-5 w-5 text-[color:var(--accent)]" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--theme-text)]">Studio modes</p>
              <div className="grid gap-3 md:grid-cols-2">
                {studioModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button key={mode.key} onMouseEnter={() => previewTheme(mode.key as typeof theme)} onMouseLeave={clearPreview} onClick={() => { setTheme(mode.key as typeof theme); clearPreview(); }} className={`rounded-2xl border p-4 text-left transition-all ${theme === mode.key ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)] shadow-[var(--theme-shadow)]" : "border-[color:var(--theme-border)] bg-white/40 dark:bg-slate-950/40"}`}>
                      <div className="flex items-center gap-2 text-[color:var(--theme-text)]">
                        <Icon className="h-4 w-4 text-[color:var(--accent)]" />
                        <span className="font-medium">{mode.label}</span>
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--theme-muted)]">{mode.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--theme-text)]">Mood palettes</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {palettes.map((item) => (
                  <button key={item.key} onMouseEnter={() => previewPalette(item.key as typeof palette)} onMouseLeave={clearPreview} onClick={() => { setPalette(item.key as typeof palette); clearPreview(); }} className={`rounded-2xl border p-3 text-left transition-all ${palette === item.key ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--theme-border)] bg-white/40 dark:bg-slate-950/40"}`}>
                    <div className={`h-10 rounded-xl bg-gradient-to-r ${item.preview}`} />
                    <div className="mt-3 text-sm font-medium text-[color:var(--theme-text)]">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] shadow-[var(--theme-shadow)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl text-[color:var(--theme-text)]">
              <SlidersHorizontal className="h-5 w-5 text-[color:var(--accent)]" /> Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--theme-text)]">Motion modes</p>
              <div className="grid gap-3">
                {motionModes.map((item) => (
                  <button key={item.key} onMouseEnter={() => previewMotion(item.key as typeof motion)} onMouseLeave={clearPreview} onClick={() => { setMotion(item.key as typeof motion); clearPreview(); }} className={`rounded-2xl border p-3 text-left transition-all ${motion === item.key ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "border-[color:var(--theme-border)] bg-white/40 dark:bg-slate-950/40"}`}>
                    <div className="text-sm font-medium text-[color:var(--theme-text)]">{item.label}</div>
                    <p className="mt-1 text-sm text-[color:var(--theme-muted)]">{item.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--theme-text)]">Layout & accessibility</p>
              <div className="grid gap-3 md:grid-cols-2">
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="rounded-2xl border border-[color:var(--theme-border)] bg-white/40 p-3 text-left dark:bg-slate-950/40">
                  <div className="flex items-center gap-2 text-[color:var(--theme-text)]"><LayoutGrid className="h-4 w-4 text-[color:var(--accent)]" /> Sidebar</div>
                  <p className="mt-2 text-sm text-[color:var(--theme-muted)]">{sidebarCollapsed ? "Collapsed" : "Expanded"}</p>
                </button>
                <button onClick={() => setLayout(layout === "editorial" ? "compact" : "editorial")} className="rounded-2xl border border-[color:var(--theme-border)] bg-white/40 p-3 text-left dark:bg-slate-950/40">
                  <div className="flex items-center gap-2 text-[color:var(--theme-text)]"><MonitorSmartphone className="h-4 w-4 text-[color:var(--accent)]" /> Density</div>
                  <p className="mt-2 text-sm text-[color:var(--theme-muted)]">{layout === "editorial" ? "Editorial" : "Compact"}</p>
                </button>
                <button onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : "sm")} className="rounded-2xl border border-[color:var(--theme-border)] bg-white/40 p-3 text-left dark:bg-slate-950/40">
                  <div className="flex items-center gap-2 text-[color:var(--theme-text)]"><Type className="h-4 w-4 text-[color:var(--accent)]" /> Text size</div>
                  <p className="mt-2 text-sm text-[color:var(--theme-muted)]">{fontSize === "sm" ? "Small" : fontSize === "base" ? "Base" : "Large"}</p>
                </button>
                <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="rounded-2xl border border-[color:var(--theme-border)] bg-white/40 p-3 text-left dark:bg-slate-950/40">
                  <div className="flex items-center gap-2 text-[color:var(--theme-text)]"><Gauge className="h-4 w-4 text-[color:var(--accent)]" /> Atmosphere</div>
                  <p className="mt-2 text-sm text-[color:var(--theme-muted)]">{theme === "light" ? "Editorial Ivory" : "Midnight Studio"}</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] shadow-[var(--theme-shadow)]">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-[#f8f6f1]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-[color:var(--theme-text)]">SkillDock is ready for thoughtful hiring</div>
              <div className="text-sm text-[color:var(--theme-muted)]">Every interaction now responds to your chosen atmosphere.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2" onClick={resetDemoData}><SettingsIcon className="h-4 w-4" />Reset profile</Button>
            <Button className="gap-2 bg-[color:var(--accent)] text-white hover:opacity-90" onClick={exportDemoData}><ArrowRight className="h-4 w-4" />Export preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
