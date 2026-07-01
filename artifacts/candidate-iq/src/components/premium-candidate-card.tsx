import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Download, Users, Briefcase } from "lucide-react";
import { ScoreDimension, MatchPercentage } from "./score-visualizers";

interface PremiumCandidateCardProps {
  name: string;
  title?: string;
  company?: string;
  yearsExperience?: number;
  location?: string;
  matchPercentage: number;
  scores: {
    semantic: number;
    experience: number;
    education: number;
    activity: number;
    trajectory: number;
  };
  matchedSkills?: string[];
  missingSkills?: string[];
  aiReasoning?: string;
  onExpand?: (expanded: boolean) => void;
  expanded?: boolean;
  onDownloadResume?: () => void;
  onCompare?: () => void;
}

export function PremiumCandidateCard({
  name,
  title,
  company,
  yearsExperience,
  location,
  matchPercentage,
  scores,
  matchedSkills = [],
  missingSkills = [],
  aiReasoning,
  onExpand,
  expanded = false,
  onDownloadResume,
  onCompare,
}: PremiumCandidateCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpand?.(newState);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 65) return "text-blue-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-600">
              {title && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {title}
                </span>
              )}
              {company && <span className="text-slate-500">at {company}</span>}
              {location && <span className="text-slate-500">• {location}</span>}
            </div>
            {yearsExperience !== undefined && (
              <div className="text-xs text-slate-500 mt-1">
                {yearsExperience}+ years experience
              </div>
            )}
          </div>
          <MatchPercentage percentage={matchPercentage} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pb-4 border-b border-slate-200">
          <ScoreDimension
            label="Semantic"
            score={scores.semantic}
            weight="35%"
          />
          <ScoreDimension
            label="Experience"
            score={scores.experience}
            weight="25%"
          />
          <ScoreDimension
            label="Education"
            score={scores.education}
            weight="15%"
          />
          <ScoreDimension
            label="Activity"
            score={scores.activity}
            weight="15%"
          />
          <ScoreDimension
            label="Trajectory"
            score={scores.trajectory}
            weight="10%"
          />
        </div>

        {/* Skills Section */}
        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
          <div className="space-y-3">
            {matchedSkills.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-900 mb-2">
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.slice(0, 6).map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-200 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {matchedSkills.length > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{matchedSkills.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {missingSkills.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold text-slate-900 mb-2">
                  Missing Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.slice(0, 4).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-slate-600 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {missingSkills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{missingSkills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expandable Section */}
        {(aiReasoning || onDownloadResume || onCompare) && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="w-full justify-between -mx-2 px-2 text-slate-700 hover:bg-slate-50"
            >
              <span className="text-sm font-medium">
                {isExpanded ? "Hide" : "Show"} Details
              </span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {isExpanded && (
              <div className="space-y-4 pt-2 border-t border-slate-200">
                {aiReasoning && (
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-900 mb-2">
                      AI Reasoning
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {aiReasoning}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {onCompare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCompare}
                      className="flex-1"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Compare
                    </Button>
                  )}
                  {onDownloadResume && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onDownloadResume}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
