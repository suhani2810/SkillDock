import React, { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import JobsPage from "@/pages/jobs";
import JobNewPage from "@/pages/jobs-new";
import JobDetailPage from "@/pages/job-detail";
import CandidatesPage from "@/pages/candidates";
import CandidateProfilePage from "@/pages/candidate-profile";
import RankingsNewPage from "@/pages/rankings-new";
import RankingDetailPage from "@/pages/ranking-detail";
import QuickRankPage from "@/pages/quick-rank";
import QuickRankResultsPage from "@/pages/quick-rank-results";
import SettingsPage from "@/pages/settings";
import TalentCanvasPage from "@/pages/talent-canvas";
import CollectionsPage from "@/pages/collections";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  const [location] = useLocation();
  const [enteredStudio, setEnteredStudio] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("skilldock-demo-entered") === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStudioRoute = location.startsWith("/dashboard") || location.startsWith("/jobs") || location.startsWith("/candidates") || location.startsWith("/rankings") || location.startsWith("/quick-rank") || location.startsWith("/settings");
    if (!enteredStudio && location === "/") {
      return;
    }
    if (!enteredStudio && isStudioRoute) {
      window.localStorage.setItem("skilldock-demo-entered", "true");
      setEnteredStudio(true);
    }
  }, [enteredStudio, location]);

  if (!enteredStudio && location === "/") {
    return <LandingPage onEnter={() => { if (typeof window !== "undefined") window.localStorage.setItem("skilldock-demo-entered", "true"); setEnteredStudio(true); }} />;
  }

  return (
    <SidebarLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/jobs/new" component={JobNewPage} />
        <Route path="/jobs/:id" component={JobDetailPage} />
        <Route path="/jobs" component={JobsPage} />
        <Route path="/candidates" component={CandidatesPage} />
        <Route path="/candidates/:id" component={CandidateProfilePage} />
        <Route path="/rankings/new" component={RankingsNewPage} />
        <Route path="/rankings/:id" component={RankingDetailPage} />
        <Route path="/quick-rank/results" component={QuickRankResultsPage} />
        <Route path="/quick-rank" component={QuickRankPage} />
        <Route path="/talent-canvas" component={TalentCanvasPage} />
        <Route path="/collections" component={CollectionsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
