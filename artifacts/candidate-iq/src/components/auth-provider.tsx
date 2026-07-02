import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { getAuthProviderLabel } from "@/lib/user";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  providerId: string;
  providerLabel: string;
  isEmailVerified: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAuthInstance() {
  return getFirebaseAuth();
}

function toAuthUser(user: FirebaseUser | null | undefined): AuthUser | null {
  if (!user) return null;
  const providerId = user.providerData.find((item) => item?.providerId)?.providerId ?? user.providerId ?? "firebase";
  return {
    id: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? user.email?.split("@")[0] ?? "SkillDock User",
    photoURL: user.photoURL,
    providerId,
    providerLabel: getAuthProviderLabel(providerId),
    isEmailVerified: user.emailVerified,
  };
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("skilldock-auth-user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem("skilldock-auth-user", JSON.stringify(user));
  } else {
    window.localStorage.removeItem("skilldock-auth-user");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const auth = getAuthInstance();

    const applyUser = (nextUser: AuthUser | null) => {
      if (!cancelled) {
        setUser(nextUser);
        writeStoredUser(nextUser);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      applyUser(toAuthUser(firebaseUser));
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const setAuthPersistence = async (rememberMe: boolean) => {
    await setPersistence(getAuthInstance(), rememberMe ? browserLocalPersistence : browserSessionPersistence);
  };

  const signInWithGoogle = async () => {
    const auth = getAuthInstance();
    await setPersistence(auth, browserLocalPersistence);
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const nextUser = toAuthUser(result.user);
    if (nextUser) {
      setUser(nextUser);
      writeStoredUser(nextUser);
    }
  };

  const signInWithEmail = async (email: string, password: string, rememberMe = true) => {
    const auth = getAuthInstance();
    await setAuthPersistence(rememberMe);
    const result = await signInWithEmailAndPassword(auth, email, password);
    const nextUser = toAuthUser(result.user);
    if (nextUser) {
      setUser(nextUser);
      writeStoredUser(nextUser);
    }
  };

  const signUpWithEmail = async (email: string, password: string, rememberMe = true) => {
    const auth = getAuthInstance();
    await setAuthPersistence(rememberMe);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
    const nextUser = toAuthUser(result.user);
    if (nextUser) {
      setUser(nextUser);
      writeStoredUser(nextUser);
    }
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(getAuthInstance(), email);
  };

  const sendVerificationEmail = async () => {
    const auth = getAuthInstance();
    if (!auth.currentUser) {
      throw new Error("No authenticated user is available.");
    }
    await sendEmailVerification(auth.currentUser);
  };

  const logout = async () => {
    await signOut(getAuthInstance());
    setUser(null);
    writeStoredUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      forgotPassword,
      sendVerificationEmail,
      logout,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
