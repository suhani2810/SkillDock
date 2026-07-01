import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "minimal" | "accent";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const variantStyles = {
    default: "bg-white border border-slate-200",
    minimal: "bg-slate-50 border-none",
    accent: "bg-amber-50 border border-amber-200",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {icon && <div className="mb-4 text-slate-300">{icon}</div>}
        <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
        {description && (
          <p className="text-slate-600 text-sm mb-6 max-w-xs">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex items-start gap-4 py-4 px-6">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-900 mb-1">{title}</h4>
          <p className="text-sm text-red-800 mb-3">{message}</p>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="gap-2"
            >
              <RotateCcw className="h-3 w-3" /> Try again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
