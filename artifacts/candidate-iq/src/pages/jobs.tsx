import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListJobs, useDeleteJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Briefcase, Trash2, ArrowRight, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function JobsPage() {
  const { data: jobs, isLoading } = useListJobs();
  const deleteJob = useDeleteJob();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId == null) return;
    await deleteJob.mutateAsync({ id: deleteId });
    queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    setDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Descriptions</h1>
          <p className="text-muted-foreground mt-1">Manage and rank against your saved job descriptions.</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4 mr-2" /> New Job
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
      ) : !jobs?.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">No job descriptions yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-6 max-w-xs">
              Paste in a job description and let AI extract the key requirements.
            </p>
            <Button asChild>
              <Link href="/jobs/new"><Plus className="h-4 w-4 mr-2" />Add first job</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Card key={job.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-base truncate">{job.title}</h3>
                      {job.seniorityLevel && (
                        <Badge variant="secondary" className="capitalize shrink-0">{job.seniorityLevel}</Badge>
                      )}
                      {job.domain && (
                        <Badge variant="outline" className="shrink-0 capitalize">{job.domain}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(job.requiredSkills ?? []).slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">{skill}</Badge>
                      ))}
                      {(job.requiredSkills ?? []).length > 5 && (
                        <Badge variant="secondary" className="text-xs">+{(job.requiredSkills ?? []).length - 5} more</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                      {job.minExperience && <span>{job.minExperience}+ yrs exp</span>}
                      {job.educationRequirement && <span>{job.educationRequirement}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost" size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(job.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job description?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this job and all associated rankings.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
