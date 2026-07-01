import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ScoreVisualizerProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ScoreVisualizer({
  score,
  size = "md",
  showLabel = true,
}: ScoreVisualizerProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "#22c55e"; // green
    if (s >= 65) return "#3b82f6"; // blue
    if (s >= 50) return "#f59e0b"; // amber
    if (s >= 35) return "#ef4444"; // red
    return "#6b7280"; // gray
  };

  const getSizeClasses = (s: string) => {
    switch (s) {
      case "sm":
        return "w-10 h-10";
      case "lg":
        return "w-16 h-16";
      default:
        return "w-12 h-12";
    }
  };

  const color = getColor(score);
  const strokeDasharray = `${(score / 100) * 94.2} 94.2`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${getSizeClasses(size)}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-200"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold font-mono">
            {Math.round(score)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-slate-600 font-medium">
          {score >= 80
            ? "Excellent"
            : score >= 65
              ? "Good"
              : score >= 50
                ? "Fair"
                : "Needs Review"}
        </span>
      )}
    </div>
  );
}

interface ScoreDimensionProps {
  label: string;
  score: number | null | undefined;
  weight: string;
}

export function ScoreDimension({
  label,
  score = 0,
  weight,
}: ScoreDimensionProps) {
  const s = score ?? 0;
  const getColor = (val: number) => {
    if (val >= 80) return "bg-green-500";
    if (val >= 65) return "bg-blue-500";
    if (val >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-900">
          {label}
          <span className="text-xs text-slate-500 ml-1 font-normal">({weight})</span>
        </span>
        <span className="text-sm font-mono font-semibold text-slate-900">
          {s.toFixed(0)}
        </span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getColor(s)}`}
          style={{ width: `${Math.min(s, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface MatchPercentageProps {
  percentage: number;
  label?: string;
}

export function MatchPercentage({
  percentage,
  label = "Match",
}: MatchPercentageProps) {
  const getColorClass = (p: number) => {
    if (p >= 80) return "text-green-600";
    if (p >= 65) return "text-blue-600";
    if (p >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="text-right">
      <div className={`text-2xl font-bold font-mono ${getColorClass(percentage)}`}>
        {percentage.toFixed(0)}%
      </div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  );
}
