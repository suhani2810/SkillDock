import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import JobsPage from "@/pages/jobs";
import JobNewPage from "@/pages/jobs-new";
import JobDetailPage from "@/pages/job-detail";
import CandidatesPage from "@/pages/candidates";
import RankingsNewPage from "@/pages/rankings-new";
import RankingDetailPage from "@/pages/ranking-detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <SidebarLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jobs/new" component={JobNewPage} />
        <Route path="/jobs/:id" component={JobDetailPage} />
        <Route path="/jobs" component={JobsPage} />
        <Route path="/candidates" component={CandidatesPage} />
        <Route path="/rankings/new" component={RankingsNewPage} />
        <Route path="/rankings/:id" component={RankingDetailPage} />
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
