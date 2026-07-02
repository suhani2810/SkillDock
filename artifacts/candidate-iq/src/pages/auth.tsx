import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Loader2, Mail, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, forgotPassword } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, navigate, user]);

  const title = useMemo(() => {
    if (mode === "signup") return "Create your SkillDock account";
    if (mode === "forgot") return "Reset your password";
    return "Welcome back";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "signup") return "Start curating with a calm, premium recruiting workspace.";
    if (mode === "forgot") return "We’ll send a reset link to the email you use for SkillDock.";
    return "Sign in to continue exploring candidates and ranking signals.";
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }
    if (mode !== "forgot" && !password.trim()) {
      setFormError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "forgot") {
        await forgotPassword(email.trim());
        toast({ title: "Reset email sent", description: "Please check your inbox for the password reset link." });
      } else if (mode === "signup") {
        await signUpWithEmail(email.trim(), password, rememberMe);
        toast({ title: "Account created", description: "A verification email has been sent to your inbox." });
      } else {
        await signInWithEmail(email.trim(), password, rememberMe);
        toast({ title: "Signed in", description: "Welcome back to SkillDock." });
      }
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setFormError(message);
      toast({ title: "Authentication failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      toast({ title: "Signed in with Google", description: "Welcome to SkillDock." });
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setFormError(message);
      toast({ title: "Google sign-in failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(184,137,60,0.16),_transparent_35%),linear-gradient(135deg,_#fcfbf8_0%,_#f8f6f1_100%)] px-4 py-10 text-slate-900 transition-colors duration-700 dark:bg-[radial-gradient(circle_at_top,_rgba(184,137,60,0.16),_transparent_35%),linear-gradient(135deg,_#081018_0%,_#0f172a_100%)] dark:text-slate-100">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden flex-col justify-between bg-[linear-gradient(135deg,rgba(184,137,60,0.16),rgba(90,107,232,0.16))] p-10 lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-sm text-slate-700 backdrop-blur">
                <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
                Premium recruiting workspace
              </div>
              <h1 className="mt-6 font-serif text-4xl leading-tight">Bring clarity to every hiring decision.</h1>
              <p className="mt-4 max-w-md text-base text-slate-700">Join SkillDock to review candidates, compare ranking signals, and collaborate with calm focus.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/50 bg-white/70 p-5 text-sm text-slate-700 shadow-sm backdrop-blur">
              <p className="font-medium">Why teams choose SkillDock</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Semantic ranking with explainable insight</li>
                <li>• Editorial, distraction-free workflows</li>
                <li>• Secure access for every recruiter</li>
              </ul>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <Card className="border-0 bg-transparent shadow-none">
              <CardHeader className="px-0 pb-6">
                <CardTitle className="font-serif text-3xl text-slate-900 dark:text-slate-100">{title}</CardTitle>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
              </CardHeader>
              <CardContent className="px-0">
                <Button onClick={handleGoogle} variant="outline" className="w-full justify-center gap-2 rounded-full border-[color:var(--theme-border)] bg-white/70 text-slate-700 hover:bg-[color:var(--accent-soft)] dark:bg-slate-950/50 dark:text-slate-200" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Continue with Google
                </Button>

                <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-slate-700 dark:text-slate-200">Email</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(formError)} placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-full border-slate-200 pl-10 dark:border-slate-700" />
                    </div>
                    {formError && mode === "forgot" ? <p className="text-sm text-red-600 dark:text-red-400">{formError}</p> : null}
                  </div>

                  {mode !== "forgot" && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm text-slate-700 dark:text-slate-200">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input id="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-full border-slate-200 pl-10 pr-10 dark:border-slate-700" />
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {formError && mode !== "forgot" ? <p className="text-sm text-red-600 dark:text-red-400">{formError}</p> : null}
                    </div>
                  )}

                  {mode !== "forgot" && (
                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Checkbox checked={rememberMe} onCheckedChange={(value) => setRememberMe(Boolean(value))} />
                        Remember me
                      </label>
                      <button type="button" onClick={() => setMode("forgot")} className="text-[color:var(--accent)] hover:opacity-80">Forgot password?</button>
                    </div>
                  )}

                  <Button type="submit" className="w-full rounded-full bg-[color:var(--accent)] text-white hover:opacity-90" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
                  </Button>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
                  {mode === "forgot" ? (
                    <button type="button" onClick={() => setMode("login")} className="text-[color:var(--accent)] hover:opacity-80">Back to sign in</button>
                  ) : (
                    <>
                      <span>{mode === "signup" ? "Already have an account?" : "New to SkillDock?"}</span>
                      <button type="button" onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="text-[color:var(--accent)] hover:opacity-80">
                        {mode === "signup" ? "Sign in" : "Create account"}
                      </button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
