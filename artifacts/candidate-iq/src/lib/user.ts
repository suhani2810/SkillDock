export function getUserInitials(displayName?: string | null, email?: string | null) {
  const source = (displayName?.trim() || email?.split("@")[0] || "SkillDock").replace(/[^a-z0-9\s]/gi, " ");
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "SD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

export function getAuthProviderLabel(providerId?: string | null) {
  switch (providerId) {
    case "google.com":
      return "Google";
    case "password":
      return "Email + Password";
    case "github.com":
      return "GitHub";
    default:
      return providerId ? providerId.replace(/\./g, " ") : "Firebase";
  }
}

export function canResetPassword(providerId?: string | null) {
  return providerId === "password";
}
