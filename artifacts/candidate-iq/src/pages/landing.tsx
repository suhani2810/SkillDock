import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, PlayCircle, Compass, Layers3, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillDockLogo } from "@/components/skilldock-logo";

const quotes = [
  { author: "Steve Jobs", text: "Design is not just what it looks like and feels like. Design is how it works." },
  { author: "Da Vinci", text: "Simplicity is the ultimate sophistication." },
  { author: "Naval", text: "The best businesses are built by making people feel something." },
  { author: "Nikola Tesla", text: "The scientific man does not aim at an immediate result." },
  { author: "Satya Nadella", text: "Our industry does not respect tradition. It only respects innovation." },
  { author: "Muhammad Ali", text: "Don’t count the days. Make the days count." },
  { author: "Ratan Tata", text: "I don’t believe in taking right decisions. I take decisions and then make them right." },
  { author: "APJ Abdul Kalam", text: "Dream, dream, dream. Dreams transform into thoughts and thoughts result in action." },
  { author: "Peter Drucker", text: "The best way to predict the future is to create it." },
  { author: "Richard Feynman", text: "What I cannot create, I do not understand." },
];

export default function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const features = useMemo(
    () => [
      { icon: Compass, title: "Curated talent", copy: "Discover people with potential, not just keyword matches." },
      { icon: Layers3, title: "Editorial flow", copy: "Move from brief to shortlist with calm, deliberate rhythm." },
      { icon: ScanLine, title: "Human nuance", copy: "Let AI surface signal while you preserve judgment." },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(184,137,60,0.16),_transparent_35%),linear-gradient(135deg,_#fcfbf8_0%,_#f8f6f1_100%)] px-6 py-8 text-slate-900 transition-colors duration-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(184,137,60,0.16),_transparent_35%),linear-gradient(135deg,_#081018_0%,_#0f172a_100%)] dark:text-slate-100 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between rounded-full border border-black/5 bg-white/70 px-5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)] p-1 text-sm font-semibold text-white">
              <SkillDockLogo className="h-8 w-8" />
            </div>
            <div>
              <div className="font-serif text-lg">SkillDock</div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Hiring beyond resumes</div>
            </div>
          </div>
          <Button onClick={onEnter} className="gap-2 bg-[color:var(--accent)] text-white hover:opacity-90">
            <Sparkles className="h-4 w-4" />
            Enter Studio
          </Button>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/70 px-3 py-1.5 text-sm text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              A new way to discover talent
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">SkillDock</h1>
              <h2 className="max-w-2xl font-serif text-3xl leading-tight text-slate-700 dark:text-slate-200 sm:text-4xl">Curate your next generation.</h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Hiring is one of the most important creative decisions a company makes. SkillDock helps recruiters discover people—not just resumes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={onEnter} size="lg" className="gap-2 bg-[color:var(--accent)] text-white hover:opacity-90">
                Enter Studio <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <PlayCircle className="h-4 w-4" /> Demo Login
              </Button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No password required for the demo. It opens instantly.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }} className="rounded-[2rem] border border-black/5 bg-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
            <div className="rounded-[1.5rem] border border-black/5 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(247,240,223,0.65))] p-6 dark:border-white/10 dark:bg-slate-950/70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Studio note</p>
                  <p className="mt-2 font-serif text-2xl">“The most important hires shape the future.”</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent)]/15 text-[color:var(--accent)]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-8 grid gap-3">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{feature.title}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{feature.copy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </main>

        <section className="rounded-[2rem] border border-black/5 bg-white/70 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">A quote for the room</p>
              <blockquote className="mt-3 font-serif text-2xl leading-relaxed text-slate-800 dark:text-slate-100">“{quote.text}”</blockquote>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">— {quote.author}</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/5 bg-[color:var(--accent-soft)] p-6 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
              <p className="font-medium">Curated by</p>
              <div className="mt-4 flex items-center gap-3 text-2xl font-serif text-slate-900 dark:text-slate-100">
                <span>Suhani Mahajan</span>
                <span className="text-[color:var(--accent)]">×</span>
                <span>Divyam Madan</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
