import React from "react";
import { Link } from "wouter";
import { ArrowLeft, BadgeCheck, Briefcase, GraduationCap, Sparkles, FileText, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CandidateProfilePage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to candidates
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-[rgba(0,0,0,0.06)] bg-white/80 shadow-[0_16px_45px_rgba(27,42,65,0.08)]">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2a41] text-xl font-semibold text-[#f8f6f1]">AC</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-3xl text-[#1b2a41]">Ariana Chen</h1>
                    <BadgeCheck className="h-5 w-5 text-[#b8893c]" />
                  </div>
                  <p className="text-slate-600">Staff Product Engineer • Northstar Labs</p>
                  <p className="text-sm text-slate-500">San Francisco, CA • 9 years experience</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#b8893c]/20 bg-[#f8f6f1] px-4 py-3 text-right">
                <div className="text-3xl font-semibold text-[#b8893c]">94%</div>
                <div className="text-xs uppercase tracking-[0.3em] text-slate-500">match</div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#f8f6f1] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><Briefcase className="h-4 w-4 text-[#b8893c]" />Current role</div>
                <p className="mt-2 text-sm text-slate-600">Leading platform architecture for a B2B SaaS product.</p>
              </div>
              <div className="rounded-2xl bg-[#f8f6f1] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><GraduationCap className="h-4 w-4 text-[#b8893c]" />Education</div>
                <p className="mt-2 text-sm text-slate-600">M.S. Human-Computer Interaction • Stanford</p>
              </div>
              <div className="rounded-2xl bg-[#f8f6f1] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><Sparkles className="h-4 w-4 text-[#b8893c]" />AI summary</div>
                <p className="mt-2 text-sm text-slate-600">Rare blend of systems thinking, product fluency, and calm leadership.</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-2xl text-[#1b2a41]">Signal Notes</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Systems Design', 'Leadership', 'Product Strategy'].map((skill) => (
                  <Badge key={skill} className="rounded-full border-[rgba(0,0,0,0.06)] bg-[#f8f6f1] text-slate-700">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[rgba(0,0,0,0.06)] bg-white/80 shadow-[0_16px_45px_rgba(27,42,65,0.08)]">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-[#1b2a41]">Interview Lens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#f8f6f1] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><MessageCircleHeart className="h-4 w-4 text-[#b8893c]" />Recommendation</div>
              <p className="mt-2 text-sm text-slate-600">Move to final round. Strong evidence of technical depth plus leadership maturity.</p>
            </div>
            <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#f8f6f1] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><FileText className="h-4 w-4 text-[#b8893c]" />Suggested questions</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>• How do you scale design systems across product teams?</li>
                <li>• What would you change in our current hiring process?</li>
                <li>• Tell us about a moment you led through ambiguity.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
