import React from "react";
import { Link, useLocation } from "wouter";
import { useGetCandidateStats, useListRankings } from "@workspace/api-client-react";
import { BarChart, Users, ArrowRight, Brain, Activity, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetCandidateStats();
  const { data: rankings, isLoading: rankingsLoading } = useListRankings();

  const recentRankings = rankings?.slice(0, 5) || [];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5"><CheckCircle className="w-3 h-3" /> Completed</Badge>;
      case "running":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1.5 animate-pulse"><Activity className="w-3 h-3" /> Running</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5"><XCircle className="w-3 h-3" /> Failed</Badge>;
      case "pending":
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1.5"><Clock className="w-3 h-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your candidate pool and recent ranking runs.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-3xl font-bold font-mono">{stats?.total?.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-3xl font-bold font-mono">{stats?.avgExperience?.toFixed(1)} <span className="text-lg font-sans text-muted-foreground font-normal">yrs</span></div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {statsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {stats?.topSkills?.slice(0, 3).map(skill => (
                  <Badge key={skill.label} variant="secondary" className="font-mono text-xs">{skill.label}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ranking Runs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {rankingsLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-3xl font-bold font-mono">{rankings?.length || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2 shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
            <div>
              <CardTitle>Recent Ranking Runs</CardTitle>
              <CardDescription>Latest AI-powered candidate searches</CardDescription>
            </div>
            <Link href="/rankings/new">
              <Button size="sm" className="gap-2">
                <BarChart className="h-4 w-4" />
                New Ranking
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {rankingsLoading ? (
               <div className="p-6 space-y-4">
                 {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
               </div>
            ) : recentRankings.length === 0 ? (
               <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                 <AlertCircle className="h-8 w-8 mb-4 text-muted-foreground/50" />
                 <p>No ranking runs yet.</p>
                 <Link href="/rankings/new" className="mt-4 text-primary hover:underline text-sm font-medium">Create your first ranking</Link>
               </div>
            ) : (
              <div className="divide-y">
                {recentRankings.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <Link href={`/rankings/${run.id}`} className="font-semibold text-primary hover:underline">
                        {run.jobTitle || `Ranking #${run.id}`}
                      </Link>
                      <div className="flex items-center text-xs text-muted-foreground gap-3 font-mono">
                        <span>{format(new Date(run.createdAt), "MMM d, yyyy HH:mm")}</span>
                        <span>•</span>
                        <span>Top {run.topN || 10}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {renderStatusBadge(run.status)}
                      <Link href={`/rankings/${run.id}`}>
                        <Button variant="ghost" size="icon">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {recentRankings.length > 0 && (
            <CardFooter className="border-t bg-muted/10 p-4">
              <Link href="/rankings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-full justify-center">
                View all rankings <ArrowRight className="h-3 w-3" />
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
