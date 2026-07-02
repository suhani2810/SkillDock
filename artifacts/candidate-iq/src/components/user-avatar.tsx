import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/user";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export function UserAvatar({ displayName, email, photoURL, className, fallbackClassName }: UserAvatarProps) {
  return (
    <Avatar className={cn("h-11 w-11 border border-[color:var(--theme-border)] bg-white shadow-sm dark:bg-slate-900", className)}>
      <AvatarImage src={photoURL ?? undefined} alt={displayName ?? email ?? "SkillDock user"} />
      <AvatarFallback className={cn("bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent-text)]", fallbackClassName)}>
        {getUserInitials(displayName, email)}
      </AvatarFallback>
    </Avatar>
  );
}
