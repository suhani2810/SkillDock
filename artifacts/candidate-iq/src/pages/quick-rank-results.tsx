import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import type { RankResponsePayload } from "@/lib/types";
import {
  ArrowLeft,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  ArrowUpDown,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type SortKey = "rank" | "composite_score" | "name";
type SortOrder = "asc" | "desc";

export default function QuickRankResultsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const dataStr =
    typeof window !== "undefined"
      ? sessionStorage.getItem("quickRankData")
      : null;
  const data: RankResponsePayload | null = dataStr
    ? JSON.parse(dataStr)
    : null;

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/quick-rank")}
          className="gap-1 -ml-2 text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">
              No ranking data found. Let me create fresh results.
            </p>
            <Button
              onClick={() => navigate("/quick-rank")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Start New Ranking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidatesArray = Array.isArray(data?.candidates)
    ? data.candidates
    : [];
  const filtered = candidatesArray.filter((c) => {
    const matchesSearch =
      search.length === 0 ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.current_title?.toLowerCase().includes(search.toLowerCase()) ||
      c.current_company?.toLowerCase().includes(search.toLowerCase());

    const matchesScore =
      c.composite_score >= scoreRange[0] &&
      c.composite_score <= scoreRange[1];

    return matchesSearch && matchesScore;
  });

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortKey) {
        case "composite_score":
          aVal = a.composite_score;
          bVal = b.composite_score;
          break;
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "rank":
        default:
          aVal = a.rank;
          bVal = b.rank;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return copy;
  }, [filtered, sortKey, sortOrder]);

  const toggleExpand = (id: number) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  const exportToCSV = () => {
    if (sorted.length === 0) {
      toast({ title: "No data to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Rank",
      "Name",
      "Title",
      "Company",
      "Match %",
      "Semantic",
      "Experience",
      "Education",
      "Activity",
      "Trajectory",
      "Matched Skills",
      "Missing Skills",
    ];

    const rows = sorted.map((c) => [
      c.rank,
      c.name,
      c.current_title || "",
      c.current_company || "",
      c.composite_score.toFixed(1),
      c.scores.semantic.toFixed(1),
      c.scores.experience.toFixed(1),
      c.scores.education.toFixed(1),
      c.scores.activity.toFixed(1),
      c.scores.trajectory.toFixed(1),
      c.matched_skills.join("; "),
      c.missing_skills.join("; "),
    ]);

    const csv = [
      headers.join(","),
      ...rows
        .map((row) =>
          row
            .map((cell) => {
              const str = String(cell);
              return str.includes(",") || str.includes('"')
                ? `"${str.replace(/"/g, '""')}"`
                : str;
            })
            .join(",")
        ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.job.title}-ranking-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({ title: "CSV exported successfully" });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50";
    if (score >= 60) return "text-blue-700 bg-blue-50";
    if (score >= 40) return "text-amber-700 bg-amber-50";
    return "text-red-700 bg-red-50";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/quick-rank")}
          className="gap-1 -ml-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-serif font-light text-slate-900 leading-tight">
              {data.job.title}
            </h1>
            <p className="text-lg text-slate-600 font-light mt-2">
              {sorted.length} candidates ranked by AI match score
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Job Requirements Summary */}
      {(data.job.required_skills.length > 0 ||
        data.job.preferred_skills.length > 0) && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Job Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.job.required_skills.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 mb-2">
                  Must Have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.job.required_skills.slice(0, 8).map((skill) => (
                    <Badge
                      key={skill}
                      className="bg-amber-100 text-amber-900 border-0 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {data.job.preferred_skills.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 mb-2">
                  Nice to Have
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {data.job.preferred_skills.slice(0, 6).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs text-slate-600"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, title, or company..."
            className="pl-9 border-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-900 block mb-2">
              Match Score Range
            </label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={scoreRange}
              onValueChange={setScoreRange}
            />
            <div className="text-xs text-slate-500 mt-1 text-center">
              {scoreRange[0]} - {scoreRange[1]}%
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-900 block mb-2">
              Sort By
            </label>
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="composite_score">Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-900 block mb-2">
              Order
            </label>
            <Button
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
              variant="outline"
              className="w-full gap-2 border-slate-300"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-slate-900 block mb-2">
              Results
            </label>
            <div className="h-10 flex items-center justify-center border border-slate-300 rounded-md bg-slate-50 text-sm font-medium text-slate-900">
              {sorted.length}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
        <Card className="border-slate-200 bg-slate-50/50">
          <CardContent className="py-12 text-center">
            <Filter className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 text-sm">
              No candidates match your filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((candidate, idx) => {
            const isExpanded = expandedIds.has(candidate.internal_id);
            const scoreColor = getScoreColor(candidate.composite_score);

            return (
              <Card key={candidate.internal_id} className="border-slate-200 hover:shadow-md transition-all">
                <CardContent className="p-5">
                  {/* Main Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Rank Badge */}
                      <div className="text-center flex-shrink-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-900 font-bold text-sm">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Candidate Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">
                          {candidate.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                          {candidate.current_title && (
                            <span>{candidate.current_title}</span>
                          )}
                          {candidate.current_company && (
                            <span className="text-slate-500">
                              @ {candidate.current_company}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Score & Actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className={`text-right px-3 py-2 rounded-lg ${scoreColor}`}>
                        <div className="text-lg font-bold font-mono">
                          {candidate.composite_score.toFixed(0)}%
                        </div>
                        <p className="text-xs font-medium">Match</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(candidate.internal_id)}
                        className="p-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Semantic
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                            {candidate.scores.semantic.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Experience
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                            {candidate.scores.experience.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Education
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                            {candidate.scores.education.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Activity
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                            {candidate.scores.activity.toFixed(0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">
                            Trajectory
                          </p>
                          <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                            {candidate.scores.trajectory.toFixed(0)}
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      {(candidate.matched_skills.length > 0 ||
                        candidate.missing_skills.length > 0) && (
                        <div className="space-y-2">
                          {candidate.matched_skills.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-900 mb-2">
                                Matched Skills
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {candidate.matched_skills
                                  .slice(0, 8)
                                  .map((skill) => (
                                    <Badge
                                      key={skill}
                                      className="bg-green-100 text-green-900 border-0 text-xs"
                                    >
                                      ✓ {skill}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}

                          {candidate.missing_skills.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-slate-900 mb-2">
                                Missing Skills
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {candidate.missing_skills
                                  .slice(0, 6)
                                  .map((skill) => (
                                    <Badge
                                      key={skill}
                                      variant="outline"
                                      className="text-xs text-slate-600"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                          Shortlist
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
