import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Trash2, ChevronRight } from "lucide-react";

interface PremiumJobCardProps {
  id: number;
  title: string;
  domain?: string | null;
  seniorityLevel?: string | null;
  requiredSkills?: string[] | null;
  minExperience?: number | null;
  educationRequirement?: string | null;
  createdAt: string;
  onClick?: () => void;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function PremiumJobCard({
  id,
  title,
  domain,
  seniorityLevel,
  requiredSkills = [],
  minExperience,
  educationRequirement,
  createdAt,
  onClick,
  onDelete,
  isDeleting = false,
}: PremiumJobCardProps) {
  const normalizedDomain = domain ?? undefined;
  const normalizedSeniority = seniorityLevel ?? undefined;
  const normalizedSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
  const normalizedMinExperience = minExperience ?? undefined;
  const normalizedEducationRequirement = educationRequirement ?? undefined;
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title with Badges */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <h3 className="font-semibold text-base text-slate-900 truncate">
                  {title}
                </h3>
              </div>
              {normalizedSeniority && (
                <Badge variant="secondary" className="capitalize text-xs">
                  {normalizedSeniority}
                </Badge>
              )}
              {normalizedDomain && (
                <Badge
                  variant="outline"
                  className="capitalize text-xs text-slate-600"
                >
                  {normalizedDomain}
                </Badge>
              )}
            </div>

            {/* Skills */}
            {normalizedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {normalizedSkills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-xs bg-amber-100 text-amber-900 border-amber-200"
                  >
                    {skill}
                  </Badge>
                ))}
                {normalizedSkills.length > 5 && (
                  <Badge
                    variant="secondary"
                    className="text-xs text-slate-600"
                  >
                    +{normalizedSkills.length - 5} more
                  </Badge>
                )}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(createdAt)}
              </span>
              {normalizedMinExperience && <span>{normalizedMinExperience}+ yrs exp</span>}
              {normalizedEducationRequirement && (
                <span className="capitalize">{normalizedEducationRequirement}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
