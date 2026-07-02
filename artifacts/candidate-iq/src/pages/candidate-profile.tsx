import React from "react";
import { Link, useRoute } from "wouter";
import { useGetCandidate } from "@workspace/api-client-react";
import { ArrowLeft, BadgeCheck, Briefcase, GraduationCap, Sparkles, FileText, MessageCircleHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidateProfilePage() {
  const [, params] = useRoute("/candidates/:id");
  const candidateId = Number(params?.id);
  const { data: candidate, isLoading, isError } = useGetCandidate(Number.isFinite(candidateId) ? candidateId : 0);

  const initials = candidate?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
  const skills = candidate?.skills ?? [];
  const resumePreview = candidate?.resumeText?.slice(0, 360);

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

      {isLoading ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      ) : isError || !candidate ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/60">
          <CardContent className="py-12 text-center text-sm text-slate-600">
            Candidate not found in the loaded dataset.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-[rgba(0,0,0,0.06)] bg-white/80 shadow-[0_16px_45px_rgba(27,42,65,0.08)]">
            <CardContent className="p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2a41] text-xl font-semibold text-[#f8f6f1]">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="font-serif text-3xl text-[#1b2a41]">{candidate.name}</h1>
                      <BadgeCheck className="h-5 w-5 text-[#b8893c]" />
                    </div>
                    <p className="text-slate-600">
                      {[candidate.currentTitle, candidate.currentCompany].filter(Boolean).join(" at ") || "Candidate profile"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {[candidate.location, candidate.yearsExperience != null ? `${candidate.yearsExperience} years experience` : null]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#b8893c]/20 bg-[#f8f6f1] px-4 py-3 text-right">
                  <div className="text-3xl font-semibold text-[#b8893c]">{candidate.activityScore ?? 0}</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">activity</div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f8f6f1] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><Briefcase className="h-4 w-4 text-[#b8893c]" />Current role</div>
                  <p className="mt-2 text-sm text-slate-600">{candidate.currentTitle || "Role not specified"}</p>
                </div>
                <div className="rounded-2xl bg-[#f8f6f1] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><GraduationCap className="h-4 w-4 text-[#b8893c]" />Education</div>
                  <p className="mt-2 text-sm text-slate-600">{candidate.educationLevel || "Not specified"}</p>
                </div>
                <div className="rounded-2xl bg-[#f8f6f1] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><Sparkles className="h-4 w-4 text-[#b8893c]" />Profile signal</div>
                  <p className="mt-2 text-sm text-slate-600">{skills.length} skills captured from the imported dataset.</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="font-serif text-2xl text-[#1b2a41]">Dataset Skills</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <Badge key={skill} className="rounded-full border-[rgba(0,0,0,0.06)] bg-[#f8f6f1] text-slate-700">{skill}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No skills listed for this candidate.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgba(0,0,0,0.06)] bg-white/80 shadow-[0_16px_45px_rgba(27,42,65,0.08)]">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-[#1b2a41]">Candidate Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#f8f6f1] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><MessageCircleHeart className="h-4 w-4 text-[#b8893c]" />Source</div>
                <p className="mt-2 text-sm text-slate-600">Loaded from the imported candidate test dataset in Neon.</p>
              </div>
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#f8f6f1] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-[#1b2a41]"><FileText className="h-4 w-4 text-[#b8893c]" />Resume text</div>
                <p className="mt-2 text-sm text-slate-600">
                  {resumePreview ? `${resumePreview}${candidate.resumeText && candidate.resumeText.length > resumePreview.length ? "..." : ""}` : "No resume text available."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
