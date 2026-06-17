import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetJob, useUpdateJob, getGetJobQueryKey, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Save, X, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const jobId = Number(id);

  const { data: job, isLoading } = useGetJob(jobId, { query: { enabled: !!jobId } });
  const updateJob = useUpdateJob();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editReqSkills, setEditReqSkills] = useState<string[]>([]);
  const [editPrefSkills, setEditPrefSkills] = useState<string[]>([]);
  const [newReqSkill, setNewReqSkill] = useState("");
  const [newPrefSkill, setNewPrefSkill] = useState("");

  const startEdit = () => {
    if (!job) return;
    setEditTitle(job.title);
    setEditReqSkills([...(job.requiredSkills ?? [])]);
    setEditPrefSkills([...(job.preferredSkills ?? [])]);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNewReqSkill("");
    setNewPrefSkill("");
  };

  const saveEdit = async () => {
    try {
      await updateJob.mutateAsync({ id: jobId, data: { title: editTitle, requiredSkills: editReqSkills, preferredSkills: editPrefSkills } });
      queryClient.invalidateQueries({ queryKey: getGetJobQueryKey(jobId) });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      setEditing(false);
      toast({ title: "Job updated" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const addSkill = (type: "req" | "pref") => {
    if (type === "req" && newReqSkill.trim()) {
      setEditReqSkills((p) => [...p, newReqSkill.trim()]);
      setNewReqSkill("");
    }
    if (type === "pref" && newPrefSkill.trim()) {
      setEditPrefSkills((p) => [...p, newPrefSkill.trim()]);
      setNewPrefSkill("");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Job not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")} className="gap-1 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Jobs
        </Button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-4 w-4 mr-1" />Cancel</Button>
              <Button size="sm" onClick={saveEdit} disabled={updateJob.isPending}><Save className="h-4 w-4 mr-1" />Save</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}><Edit2 className="h-4 w-4 mr-1" />Edit</Button>
              <Button size="sm" onClick={() => navigate(`/rankings/new?jobId=${job.id}`)}>
                <Sparkles className="h-4 w-4 mr-1" />Start Ranking
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        {editing ? (
          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-2xl font-bold h-12 text-lg" />
        ) : (
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {job.seniorityLevel && <Badge variant="secondary" className="capitalize">{job.seniorityLevel}</Badge>}
          {job.domain && <Badge variant="outline" className="capitalize">{job.domain}</Badge>}
          {job.minExperience && <Badge variant="outline">{job.minExperience}+ years experience</Badge>}
          {job.educationRequirement && <Badge variant="outline">{job.educationRequirement}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Added {format(new Date(job.createdAt), "MMMM d, yyyy")}</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Required Skills</CardTitle></CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {editReqSkills.map((s, i) => (
                  <Badge key={i} className="bg-primary/10 text-primary border-0 gap-1 pr-1">
                    {s}
                    <button onClick={() => setEditReqSkills((p) => p.filter((_, j) => j !== i))} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add skill..." value={newReqSkill} onChange={(e) => setNewReqSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("req"))} className="h-8 text-sm" />
                <Button size="sm" variant="outline" onClick={() => addSkill("req")} className="h-8"><Plus className="h-3 w-3" /></Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {(job.requiredSkills ?? []).length > 0 ? (
                (job.requiredSkills ?? []).map((s) => <Badge key={s} className="bg-primary/10 text-primary border-0 text-xs">{s}</Badge>)
              ) : <span className="text-sm text-muted-foreground">None extracted</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Preferred Skills</CardTitle></CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {editPrefSkills.map((s, i) => (
                  <Badge key={i} variant="outline" className="gap-1 pr-1">
                    {s}
                    <button onClick={() => setEditPrefSkills((p) => p.filter((_, j) => j !== i))} className="hover:bg-muted rounded-full p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add skill..." value={newPrefSkill} onChange={(e) => setNewPrefSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("pref"))} className="h-8 text-sm" />
                <Button size="sm" variant="outline" onClick={() => addSkill("pref")} className="h-8"><Plus className="h-3 w-3" /></Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {(job.preferredSkills ?? []).length > 0 ? (
                (job.preferredSkills ?? []).map((s) => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)
              ) : <span className="text-sm text-muted-foreground">None extracted</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Raw Job Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{job.rawText}</p>
        </CardContent>
      </Card>
    </div>
  );
}
