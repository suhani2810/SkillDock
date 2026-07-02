import React from "react";
import { Link, useLocation } from "wouter";
import { Users, Briefcase, BarChart3, Settings, Sparkles, ChevronRight, MoonStar, SunMedium, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { SkillDockLogo } from "@/components/skilldock-logo";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme, sidebarCollapsed, setSidebarCollapsed, layout } = useTheme();

  const navigation = [
    { name: "Overview", href: "/", icon: BarChart3 },
    { name: "Job Briefs", href: "/jobs", icon: Briefcase },
    { name: "Candidates", href: "/candidates", icon: Users },
    { name: "Quick Rank", href: "/quick-rank", icon: Sparkles },
  ];

  const isActive = (href: string) => location === href || (href !== "/" && location.startsWith(href));

  return (
    <div className="flex h-screen w-full overflow-hidden transition-all duration-[var(--motion-duration)] ease-[var(--motion-easing)]" style={{ background: "var(--theme-bg)" }}>
      <aside className={`hidden flex-col border-r border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-4 py-5 backdrop-blur md:flex ${sidebarCollapsed ? "w-24" : "w-72"}`}>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white/80 px-3 py-3 shadow-[0_10px_30px_rgba(27,42,65,0.06)] dark:border-white/10 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent)] p-1 text-sm font-semibold text-white shadow-lg">
              <SkillDockLogo className="h-8 w-8" />
            </div>
            <div className={sidebarCollapsed ? "hidden" : "block"}>
              <div className="font-serif text-lg text-[color:var(--theme-text)]">SkillDock</div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--theme-muted)]">Editorial Studio</div>
            </div>
          </div>
          <button
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] p-2 text-[color:var(--theme-text)] shadow-sm transition hover:scale-105"
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto px-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-[var(--motion-duration)] ${
                    active
                      ? "bg-[color:var(--accent)] text-white shadow-[0_10px_20px_rgba(27,42,65,0.12)]"
                      : "text-[color:var(--theme-muted)] hover:bg-[color:var(--accent-soft)] hover:text-[color:var(--accent-text)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className={sidebarCollapsed ? "hidden" : "block"}>{item.name}</span>
                  </div>
                  {active && <ChevronRight className={`h-3.5 w-3.5 ${sidebarCollapsed ? "hidden" : "block"}`} />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-alt)] p-3 shadow-sm">
          <Link href="/settings">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-[#f8f6f1] dark:text-slate-300 dark:hover:bg-slate-950">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </Link>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-semibold text-white">U</div>
              <div>
                <div className="text-sm font-medium text-[color:var(--theme-text)]">Maya Chen</div>
                <div className="text-xs text-[color:var(--theme-muted)]">Principal Recruiter</div>
              </div>
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-full border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] p-2 text-[color:var(--theme-text)] transition hover:scale-105">
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-6 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--accent)] p-1 text-sm font-semibold text-white">
              <SkillDockLogo className="h-7 w-7" />
            </div>
            <div className="font-serif text-base text-[color:var(--theme-text)]">SkillDock</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-alt)] p-2 text-[color:var(--theme-text)] shadow-sm">
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>
            <Link href="/settings">
              <button className="rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface-alt)] p-2 text-[color:var(--theme-text)] shadow-sm">
                <Settings className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className={`mx-auto max-w-7xl transition-all duration-[var(--motion-duration)] ${layout === "compact" ? "px-4 py-4 md:px-6 md:py-6" : "px-6 py-8 md:px-8 md:py-10"}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
