import React, { useState } from "react";
import { useLocation } from "wouter";
import { useCreateJob } from "@workspace/api-client-react";
import { ArrowLeft, Sparkles, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function JobNewPage() {
  const [, navigate] = useLocation();
  const createJob = useCreateJob();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState<null | { id: number; title: string; requiredSkills: string[]; preferredSkills: string[]; minExperience: number | null; educationRequirement: string | null; domain: string | null; seniorityLevel: string | null }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) return;
    try {
      const result = await createJob.mutateAsync({ data: { title, rawText } });
      setParsed(result as any);
    } catch {
      toast({ title: "Failed to create job", variant: "destructive" });
    }
  };

  if (parsed) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")} className="gap-1 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Jobs
          </Button>
        </div>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">Job created and parsed</CardTitle>
            </div>
            <CardDescription className="text-green-700">AI extracted the key requirements from your job description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">{parsed.title}</h2>
              <div className="flex flex-wrap gap-2 mt-1">
                {parsed.seniorityLevel && <Badge variant="secondary" className="capitalize">{parsed.seniorityLevel}</Badge>}
                {parsed.domain && <Badge variant="outline" className="capitalize">{parsed.domain}</Badge>}
                {parsed.minExperience && <Badge variant="outline">{parsed.minExperience}+ years</Badge>}
                {parsed.educationRequirement && <Badge variant="outline">{parsed.educationRequirement}</Badge>}
              </div>
            </div>

            {parsed.requiredSkills?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.requiredSkills.map((s) => (
                    <Badge key={s} className="bg-primary/10 text-primary border-0 text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {parsed.preferredSkills?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Preferred Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.preferredSkills.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(`/jobs/${parsed.id}`)}>View & Edit Job</Button>
          <Button onClick={() => navigate(`/rankings/new?jobId=${parsed.id}`)}>
            <Sparkles className="h-4 w-4 mr-2" />Start Ranking
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/jobs")} className="gap-1 -ml-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Jobs
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Job Description</h1>
        <p className="text-muted-foreground mt-1">Paste a job description and AI will extract skills, experience, and requirements automatically.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            placeholder="e.g. Senior Backend Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rawText">Job Description</Label>
          <Textarea
            id="rawText"
            placeholder="Paste the full job description here — responsibilities, requirements, preferred qualifications..."
            className="min-h-[280px] font-mono text-sm resize-y"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">The more detail you provide, the better the AI parsing and matching quality.</p>
        </div>

        <Button type="submit" disabled={createJob.isPending || !title.trim() || !rawText.trim()} className="w-full">
          {createJob.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Parsing with AI...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />Create and Parse Job</>
          )}
        </Button>
      </form>
    </div>
  );
}
