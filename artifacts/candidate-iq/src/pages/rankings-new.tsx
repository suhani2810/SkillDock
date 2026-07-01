import React, { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useListJobs, useCreateRanking, getListRankingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function RankingsNewPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: jobs, isLoading: jobsLoading } = useListJobs();
  const createRanking = useCreateRanking();

  const params = new URLSearchParams(search);
  const preselectedJobId = params.get("jobId");

  const [jobId, setJobId] = useState<string>(preselectedJobId ?? "");
  const [topN, setTopN] = useState(15);
  const [minScore, setMinScore] = useState(40);

  useEffect(() => {
    if (preselectedJobId) setJobId(preselectedJobId);
  }, [preselectedJobId]);

  const selectedJob = jobs?.find((j) => String(j.id) === jobId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    try {
      const result = await createRanking.mutateAsync({ data: { jobId: Number(jobId), topN, minScore } });
      queryClient.invalidateQueries({ queryKey: getListRankingsQueryKey() });
      navigate(`/rankings/${(result as any).id}`);
    } catch {
      toast({ title: "Ranking failed", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 -ml-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Ranking Run</h1>
        <p className="text-muted-foreground mt-1">Score and refine your talent pool against a brief.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardContent className="pt-5 space-y-5">
            <div className="space-y-2">
              <Label>Brief</Label>
              {jobsLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              ) : (
                <Select value={jobId} onValueChange={setJobId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a brief..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((j) => (
                      <SelectItem key={j.id} value={String(j.id)}>
                        <div className="flex items-center gap-2">
                          <span>{j.title}</span>
                          {j.seniorityLevel && <Badge variant="secondary" className="text-xs capitalize ml-1">{j.seniorityLevel}</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedJob && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {(selectedJob.requiredSkills ?? []).slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{s}</Badge>
                  ))}
                  {(selectedJob.requiredSkills ?? []).length > 4 && (
                    <Badge variant="secondary" className="text-xs">+{(selectedJob.requiredSkills ?? []).length - 4}</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Shortlist Size</Label>
                <span className="text-sm font-mono font-medium text-primary">{topN}</span>
              </div>
              <Slider min={5} max={50} step={5} value={[topN]} onValueChange={([v]) => setTopN(v)} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 (focused)</span>
                <span>50 (broad)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Minimum Score Threshold</Label>
                <span className="text-sm font-mono font-medium text-primary">{minScore}</span>
              </div>
              <Slider min={0} max={80} step={5} value={[minScore]} onValueChange={([v]) => setMinScore(v)} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 (include all)</span>
                <span>80 (strict)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/40 border-dashed">
          <CardContent className="py-4 px-5">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div><div className="font-semibold text-lg text-primary">{topN}</div><div className="text-muted-foreground">max results</div></div>
              <div><div className="font-semibold text-lg text-primary">{minScore}+</div><div className="text-muted-foreground">min score</div></div>
              <div><div className="font-semibold text-lg text-primary">5</div><div className="text-muted-foreground">dimensions</div></div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={!jobId || createRanking.isPending} className="w-full" size="lg">
          {createRanking.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ranking candidates...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />Run Ranking</>
          )}
        </Button>

        {!jobs?.length && !jobsLoading && (
          <p className="text-center text-sm text-muted-foreground">
            No jobs yet.{" "}
            <button type="button" onClick={() => navigate("/jobs/new")} className="text-primary underline underline-offset-2">Create one first</button>
          </p>
        )}
      </form>
    </div>
  );
}
