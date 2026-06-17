import React, { useState } from "react";
import { useListCandidates, useGetCandidateStats } from "@workspace/api-client-react";
import { Search, Users, GraduationCap, Briefcase, MapPin, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const { data: candidates, isLoading } = useListCandidates(
    search ? { search } : undefined,
    { query: { enabled: true } }
  );
  const { data: stats } = useGetCandidateStats();

  const activityColor = (score: number | null | undefined) => {
    if (!score) return "text-muted-foreground";
    if (score >= 85) return "text-emerald-600";
    if (score >= 70) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Candidate Pool</h1>
        <p className="text-muted-foreground mt-1">
          {stats?.total ?? 0} candidates available for ranking.
        </p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Education Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={stats.educationBreakdown} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {stats.educationBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Skills in Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {stats.topSkills.map((s, i) => (
                  <Badge key={s.label} variant="secondary" className="text-xs gap-1.5">
                    {s.label}
                    <span className="font-mono text-muted-foreground">{s.count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, title, or company..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : !candidates?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{search ? "No candidates match your search." : "No candidates in the pool yet."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {candidates.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{c.name}</h3>
                      {c.activityScore && (
                        <span className={`flex items-center gap-0.5 text-xs font-medium ${activityColor(c.activityScore)}`}>
                          <Star className="h-3 w-3" />{c.activityScore}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mb-2">
                      {c.currentTitle && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.currentTitle}</span>}
                      {c.currentCompany && <span>at {c.currentCompany}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(c.skills ?? []).slice(0, 6).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {(c.skills ?? []).length > 6 && (
                        <Badge variant="secondary" className="text-xs">+{(c.skills ?? []).length - 6}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 text-sm text-muted-foreground">
                    {c.yearsExperience != null && <div className="font-medium">{c.yearsExperience} yrs</div>}
                    {c.educationLevel && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <GraduationCap className="h-3 w-3" />
                        <span className="text-xs">{c.educationLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
