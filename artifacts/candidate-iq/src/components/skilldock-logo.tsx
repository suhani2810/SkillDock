import * as React from "react";
import { cn } from "@/lib/utils";

interface SkillDockLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "mark" | "wordmark";
}

export function SkillDockLogo({ className, variant = "mark", ...props }: SkillDockLogoProps) {
  return (
    <svg
      viewBox="0 0 320 320"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-10 w-10 shrink-0", className)}
      fill="none"
      role="img"
      aria-label="SkillDock"
      {...props}
    >
      <rect x="24" y="24" width="272" height="272" rx="74" fill="url(#skilldockGlow)" />
      <rect x="48" y="48" width="224" height="224" rx="54" stroke="rgba(255,255,255,0.85)" strokeWidth="10" />
      <path d="M103 124C103 96.3858 125.386 74 153 74H220C247.614 74 270 96.3858 270 124V124C270 151.614 247.614 174 220 174H153C125.386 174 103 151.614 103 124V124Z" fill="white" fillOpacity="0.96" />
      <path d="M86 192C86 151.026 117.026 120 158 120H211C251.974 120 283 151.026 283 192V192C283 232.974 251.974 264 211 264H158C117.026 264 86 232.974 86 192V192Z" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="14" />
      <path d="M118 129H194" stroke="#13263F" strokeWidth="14" strokeLinecap="round" />
      <path d="M132 160C132 160 163 186 194 160" stroke="#13263F" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M102 230L144 188" stroke="#13263F" strokeWidth="14" strokeLinecap="round" />
      <path d="M74 84L120 54" stroke="#1F5DFF" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M64 114L104 86" stroke="#1F5DFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M255 226L210 262" stroke="#1F5DFF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M219 214L188 244" stroke="#1F5DFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="skilldockGlow" x1="54" y1="52" x2="270" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8F0E3" />
          <stop offset="0.55" stopColor="#EFCB97" />
          <stop offset="1" stopColor="#7D8EE3" />
        </linearGradient>
      </defs>
      {variant === "wordmark" ? (
        <g transform="translate(24 276)">
          <rect x="0" y="0" width="272" height="36" rx="18" fill="transparent" />
          <text x="0" y="24" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui" fontSize="36" fontWeight="700">SkillDock</text>
        </g>
      ) : null}
    </svg>
  );
}
