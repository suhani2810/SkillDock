import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarLayout } from "@/components/layout";
import { AuthProvider, useAuth } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import LandingPage from "@/pages/landing";
import AuthPage from "@/pages/auth";
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user && location !== "/auth") {
      navigate("/auth");
    }
  }, [loading, location, navigate, user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Preparing your workspace…</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const [location, navigate] = useLocation();
  const { user, loading } = useAuth();

  if (!loading && !user && location === "/auth") {
    return <AuthPage />;
  }

  if (!loading && !user && location === "/") {
    return <LandingPage onEnter={() => navigate("/auth")} />;
  }

  return (
    <SidebarLayout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/dashboard">
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        </Route>
        <Route path="/jobs/new">
          <ProtectedRoute><JobNewPage /></ProtectedRoute>
        </Route>
        <Route path="/jobs/:id">
          <ProtectedRoute><JobDetailPage /></ProtectedRoute>
        </Route>
        <Route path="/jobs">
          <ProtectedRoute><JobsPage /></ProtectedRoute>
        </Route>
        <Route path="/candidates">
          <ProtectedRoute><CandidatesPage /></ProtectedRoute>
        </Route>
        <Route path="/candidates/:id">
          <ProtectedRoute><CandidateProfilePage /></ProtectedRoute>
        </Route>
        <Route path="/rankings/new">
          <ProtectedRoute><RankingsNewPage /></ProtectedRoute>
        </Route>
        <Route path="/rankings/:id">
          <ProtectedRoute><RankingDetailPage /></ProtectedRoute>
        </Route>
        <Route path="/quick-rank/results">
          <ProtectedRoute><QuickRankResultsPage /></ProtectedRoute>
        </Route>
        <Route path="/quick-rank">
          <ProtectedRoute><QuickRankPage /></ProtectedRoute>
        </Route>
        <Route path="/talent-canvas">
          <ProtectedRoute><TalentCanvasPage /></ProtectedRoute>
        </Route>
        <Route path="/collections">
          <ProtectedRoute><CollectionsPage /></ProtectedRoute>
        </Route>
        <Route path="/settings">
          <ProtectedRoute><SettingsPage /></ProtectedRoute>
        </Route>
        <Route path="/">
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </SidebarLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
