import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8">
      <div>
        <h1 className="text-4xl font-light font-serif text-slate-900 tracking-tight mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-600 text-base font-light">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex-1">
        <h2 className="text-2xl font-light font-serif text-slate-900 tracking-tight mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-slate-600 text-sm font-light">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

interface MetricProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function Metric({ label, value, subtitle, icon }: MetricProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon && <div className="text-slate-400">{icon}</div>}
        <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
          {label}
        </p>
      </div>
      <p className="text-2xl font-light text-slate-900 font-serif">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 font-light">{subtitle}</p>
      )}
    </div>
  );
}
