import { useMutation } from "@tanstack/react-query";
import type { RankRequestPayload, RankResponsePayload } from "@/lib/types";

export function useQuickRank() {
  return useMutation<
    RankResponsePayload,
    Error,
    RankRequestPayload
  >({
    mutationFn: async (payload: RankRequestPayload) => {
      const response = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Failed to rank candidates (${response.status})`);
      }

      return response.json();
    },
  });
}
