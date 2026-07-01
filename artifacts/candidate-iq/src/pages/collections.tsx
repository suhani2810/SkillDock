import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const collections = [
  {
    title: "AI Researchers",
    description: "People who build systems that feel inevitable.",
    count: 24,
    accent: "from-slate-800 to-slate-600",
  },
  {
    title: "Future Leaders",
    description: "Calm operators with a rare sense of momentum.",
    count: 18,
    accent: "from-amber-700 to-orange-500",
  },
  {
    title: "Backend Masters",
    description: "The architects of resilient, useful products.",
    count: 31,
    accent: "from-emerald-700 to-teal-500",
  },
  {
    title: "Product Thinkers",
    description: "Operators who connect insight, craft, and execution.",
    count: 14,
    accent: "from-indigo-700 to-violet-500",
  },
];

export default function CollectionsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-[color:var(--accent-soft)] px-3 py-1 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              Curated collections
            </div>
            <h1 className="mt-3 font-serif text-4xl text-slate-900 dark:text-slate-100">Collections that feel like magazine covers.</h1>
            <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Group promising talent into thoughtful themes and revisit each as a gallery of opportunity.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {collections.map((collection, index) => (
          <motion.div key={collection.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index, duration: 0.45 }}>
            <Card className="group overflow-hidden border-black/5 bg-white/80 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className={`h-36 bg-gradient-to-br ${collection.accent}`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{collection.title}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{collection.description}</p>
                  </div>
                  <div className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-sm text-slate-700 dark:bg-slate-950/60 dark:text-slate-200">{collection.count}</div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map((avatar) => (
                      <div key={avatar} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-700 dark:border-slate-900 dark:bg-slate-700 dark:text-slate-200">{avatar + 1}</div>
                    ))}
                  </div>
                  <button className="flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-[color:var(--accent)] dark:text-slate-200">
                    <Users className="h-4 w-4" /> View <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
