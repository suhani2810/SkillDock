import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const candidates = [
  { id: 1, name: "Ava Patel", title: "Staff ML Engineer", potential: 92, execution: 88, innovation: 91, learning: 90, leadership: 84, color: "from-slate-800 to-slate-600" },
  { id: 2, name: "Noah Kim", title: "Principal Platform Engineer", potential: 86, execution: 91, innovation: 83, learning: 87, leadership: 89, color: "from-amber-700 to-orange-500" },
  { id: 3, name: "Mina Flores", title: "Product Design Lead", potential: 90, execution: 84, innovation: 94, learning: 88, leadership: 82, color: "from-emerald-700 to-teal-500" },
  { id: 4, name: "Leo Grant", title: "Founder’s Engineer", potential: 89, execution: 86, innovation: 90, learning: 92, leadership: 86, color: "from-indigo-700 to-violet-500" },
];

export default function TalentCanvasPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[color:var(--accent-soft)] px-3 py-1 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
              <Compass className="h-4 w-4 text-[color:var(--accent)]" />
              Talent canvas
            </div>
            <h1 className="mt-3 font-serif text-4xl text-slate-900 dark:text-slate-100">A living map of your strongest people.</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Candidates are positioned by potential, execution, innovation, learning, and leadership so the studio feels spatial rather than spreadsheet-like.</p>
          </div>
          <div className="rounded-[1.25rem] border border-black/5 bg-slate-950/95 p-4 text-sm text-slate-300 dark:border-white/10">
            <div className="flex items-center gap-2 text-white"><Sparkles className="h-4 w-4 text-[color:var(--accent)]" /> Live view</div>
            <p className="mt-2">The canvas reacts to your shortlist and the next best conversations.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <div className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] border border-black/5 bg-[radial-gradient(circle_at_top_left,_rgba(184,137,60,0.12),_transparent_28%),linear-gradient(135deg,_#f8f3ea_0%,_#f7f7f1_100%)] p-6 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(184,137,60,0.12),_transparent_28%),linear-gradient(135deg,_#111827_0%,_#0f172a_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:70px_70px] dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
          <div className="absolute left-6 top-1/2 h-[2px] w-[calc(100%-3rem)] -translate-y-1/2 bg-slate-400/30 dark:bg-slate-600/50" />
          <div className="absolute left-1/2 top-6 h-[calc(100%-3rem)] w-[2px] -translate-x-1/2 bg-slate-400/30 dark:bg-slate-600/50" />
          <div className="absolute left-6 top-6 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Potential</div>
          <div className="absolute bottom-6 right-6 text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Execution</div>

          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="relative h-[420px] w-full max-w-4xl">
              {candidates.map((candidate, index) => {
                const left = 12 + index * 18 + (index % 2) * 6;
                const top = 18 + (index % 2) * 24 + index * 6;
                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.45 }}
                    className="absolute"
                    style={{ left: `${left}%`, top: `${top}%`, transform: "translate(-50%, -50%)" }}
                  >
                    <Link href={`/candidates/${candidate.id}`}>
                      <Card className="w-44 border-black/5 bg-white/80 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/80">
                        <CardContent className="p-4">
                          <div className={`mb-3 h-12 rounded-2xl bg-gradient-to-br ${candidate.color}`} />
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{candidate.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.title}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Potential</span>
                            <span className="font-semibold">{candidate.potential}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
