/**
 * Types for POST /api/rank endpoint (ephemeral ranking)
 * Note: This endpoint is not in OpenAPI spec, so types are defined manually
 */

export interface RankRequestPayload {
  jd_text: string;
  top_n?: number;
}

export interface RankedCandidateResult {
  candidate_id: string;
  internal_id: number;
  rank: number;
  name: string;
  current_title: string | null;
  current_company: string | null;
  composite_score: number;
  scores: {
    semantic: number;
    experience: number;
    education: number;
    activity: number;
    trajectory: number;
  };
  rationale: string;
  matched_skills: string[];
  missing_skills: string[];
}

export interface RankResponsePayload {
  job: {
    title: string;
    required_skills: string[];
    preferred_skills: string[];
    min_experience: number | null;
    education_requirement: string | null;
    domain: string | null;
    seniority_level: string | null;
  };
  candidates: RankedCandidateResult[];
}
