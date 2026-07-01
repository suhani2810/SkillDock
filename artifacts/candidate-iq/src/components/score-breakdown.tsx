import React from "react";

const DIM_CONFIG = {
  semantic: { label: "Semantic Match", color: "#6366f1", weight: "35%" },
  experience: { label: "Experience", color: "#3b82f6", weight: "25%" },
  education: { label: "Education", color: "#22c55e", weight: "15%" },
  activity: { label: "Activity", color: "#f97316", weight: "15%" },
  trajectory: { label: "Trajectory", color: "#14b8a6", weight: "10%" },
} as const;

interface ScoreDimension {
  semantic: number;
  experience: number;
  education: number;
  activity: number;
  trajectory: number;
}

export function ScoreBreakdown({ scores }: { scores: ScoreDimension }) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-muted-foreground">Score Breakdown (Total: {Math.round(scores.semantic * 0.35 + scores.experience * 0.25 + scores.education * 0.15 + scores.activity * 0.15 + scores.trajectory * 0.10)})</div>
      {(Object.entries(DIM_CONFIG) as Array<[keyof typeof DIM_CONFIG, typeof DIM_CONFIG[keyof typeof DIM_CONFIG]]>).map(([key, config]) => {
        const value = scores[key];
        const percentage = (value / 100) * 100;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-foreground">{config.label}</label>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground">{Math.round(value)}</span>
                <span className="text-muted-foreground text-xs">({config.weight})</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, percentage)}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
