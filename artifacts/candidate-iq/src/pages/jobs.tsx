import React, { useState } from "react";
import { Link } from "wouter";
import { useListJobs, useDeleteJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PremiumJobCard } from "@/components/premium-job-card";

export default function JobsPage() {
  const { data: jobs, isLoading } = useListJobs();
  const deleteJob = useDeleteJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ensure jobs is always an array
  const jobsArray = Array.isArray(jobs) ? jobs : [];

  const handleDelete = async () => {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await deleteJob.mutateAsync({ id: deleteId });
      queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
      toast({ title: "Job deleted successfully" });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: "Failed to delete job",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-light font-serif text-slate-900 tracking-tight mb-2">
            Briefs
          </h1>
          <p className="text-slate-600 font-light">
            Manage your job openings and rank candidates against them.
          </p>
        </div>
        <Link href="/jobs/new">
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" /> New Job
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : jobsArray.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 p-3 bg-white rounded-full">
              <Briefcase className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 text-lg mb-2">
              No briefs yet
            </h3>
            <p className="text-slate-600 text-sm mb-6 max-w-xs">
              Create a new brief to begin curating candidates.
            </p>
            <Link href="/jobs/new">
              <Button variant="outline">Add First Brief</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobsArray.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <PremiumJobCard
                id={job.id}
                title={job.title}
                domain={job.domain}
                seniorityLevel={job.seniorityLevel}
                requiredSkills={job.requiredSkills}
                minExperience={job.minExperience}
                educationRequirement={job.educationRequirement}
                createdAt={job.createdAt}
                onDelete={() => setDeleteId(job.id)}
                isDeleting={isDeleting}
              />
            </Link>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Brief</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this brief?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
