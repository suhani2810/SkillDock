import type { Job, Candidate } from "@workspace/db";

export interface ScoreBreakdown {
  compositeScore: number;
  semanticScore: number;
  experienceScore: number;
  educationScore: number;
  activityScore: number;
  trajectoryScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

const WEIGHTS = {
  semantic: 0.35,
  experience: 0.25,
  education: 0.15,
  activity: 0.15,
  trajectory: 0.10,
};

const EDUCATION_TIERS: Record<string, number> = {
  phd: 5,
  doctorate: 5,
  masters: 4,
  mba: 4,
  bachelors: 3,
  bachelor: 3,
  "b.s.": 3,
  "b.a.": 3,
  associate: 2,
  diploma: 2,
  bootcamp: 1,
  "self-taught": 1,
  none: 0,
};

function normalizeSkill(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function tfidfSimilarity(docA: string, docB: string, boostTerms: string[]): number {
  if (!docA || !docB) return 0;
  const tokensA = new Set(tokenize(docA));
  const tokensB = tokenize(docB);
  const boostSet = new Set(boostTerms.map(normalizeSkill));

  let score = 0;
  let totalWeight = 0;

  const uniqueB = new Set(tokensB);
  uniqueB.forEach((token) => {
    const weight = boostSet.has(token) ? 3 : 1;
    totalWeight += weight;
    if (tokensA.has(token)) score += weight;
  });

  return totalWeight > 0 ? score / totalWeight : 0;
}

function scoreSkillMatch(job: Job, candidate: Candidate): { score: number; matched: string[]; missing: string[] } {
  const required = (job.requiredSkills ?? []).map(normalizeSkill);
  const preferred = (job.preferredSkills ?? []).map(normalizeSkill);
  const candidateSkills = (candidate.skills ?? []).map(normalizeSkill);
  const resumeTokens = new Set(tokenize(candidate.resumeText ?? ""));

  const hasSkill = (skill: string) =>
    candidateSkills.some((cs) => cs.includes(skill) || skill.includes(cs)) ||
    resumeTokens.has(skill) ||
    skill.split(" ").every((word) => resumeTokens.has(word));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of (job.requiredSkills ?? [])) {
    if (hasSkill(normalizeSkill(skill))) matched.push(skill);
    else missing.push(skill);
  }
  for (const skill of (job.preferredSkills ?? [])) {
    if (hasSkill(normalizeSkill(skill)) && !matched.includes(skill)) matched.push(skill);
  }

  const requiredHit = required.length > 0 ? matched.filter((s) => required.includes(normalizeSkill(s))).length / required.length : 0.5;
  const preferredBonus = preferred.length > 0 ? Math.min(matched.filter((s) => preferred.includes(normalizeSkill(s))).length / preferred.length * 0.3, 0.3) : 0;

  // Also factor in resume text similarity
  const resumeSim = tfidfSimilarity(
    [candidate.resumeText ?? "", ...(candidate.skills ?? [])].join(" "),
    [job.rawText, ...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])].join(" "),
    [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])],
  );

  const score = Math.min(1, requiredHit * 0.5 + preferredBonus + resumeSim * 0.5);
  return { score, matched, missing };
}

function scoreExperience(job: Job, candidate: Candidate): number {
  const candidateYears = candidate.yearsExperience ?? 0;
  const required = job.minExperience ?? 0;

  if (required === 0) return 0.75 + Math.min(candidateYears / 20, 0.25);

  if (candidateYears >= required) {
    const excess = candidateYears - required;
    return Math.min(0.7 + excess * 0.03, 1.0);
  } else {
    return Math.max(0, (candidateYears / required) * 0.7);
  }
}

function scoreEducation(job: Job, candidate: Candidate): number {
  const eduReq = (job.educationRequirement ?? "").toLowerCase();
  const candidateEdu = (candidate.educationLevel ?? "").toLowerCase();

  const candidateTier = Object.entries(EDUCATION_TIERS).reduce((best, [key, tier]) => {
    if (candidateEdu.includes(key)) return Math.max(best, tier);
    return best;
  }, 0);

  if (!eduReq) return 0.6 + candidateTier * 0.08;

  const requiredTier = Object.entries(EDUCATION_TIERS).reduce((best, [key, tier]) => {
    if (eduReq.includes(key)) return Math.max(best, tier);
    return best;
  }, 2);

  if (candidateTier >= requiredTier) {
    return Math.min(0.7 + (candidateTier - requiredTier) * 0.1, 1.0);
  } else {
    return Math.max(0.2, candidateTier / (requiredTier + 1));
  }
}

function scoreActivity(candidate: Candidate): number {
  if (candidate.activityScore != null) {
    return Math.min(candidate.activityScore / 100, 1);
  }
  // Infer from profile completeness
  const fields = [candidate.email, candidate.currentTitle, candidate.currentCompany, candidate.skills?.length, candidate.resumeText, candidate.location, candidate.linkedinUrl];
  const filled = fields.filter(Boolean).length;
  return 0.3 + (filled / fields.length) * 0.7;
}

function scoreTrajectory(job: Job, candidate: Candidate): number {
  const title = (candidate.currentTitle ?? "").toLowerCase();
  const domain = (job.domain ?? "").toLowerCase();
  const seniority = (job.seniorityLevel ?? "").toLowerCase();

  let score = 0.5;

  const seniorTerms = ["senior", "staff", "principal", "lead", "director", "vp", "head"];
  const juniorTerms = ["junior", "associate", "entry", "intern"];

  if (seniority.includes("senior") || seniority.includes("staff") || seniority.includes("lead")) {
    if (seniorTerms.some((t) => title.includes(t))) score += 0.3;
    else if (juniorTerms.some((t) => title.includes(t))) score -= 0.2;
  } else if (seniority.includes("junior") || seniority.includes("entry")) {
    if (juniorTerms.some((t) => title.includes(t))) score += 0.3;
    else if (seniorTerms.some((t) => title.includes(t))) score += 0.1;
  } else {
    score += 0.1;
  }

  if (domain && (title.includes(domain) || (candidate.resumeText ?? "").toLowerCase().includes(domain))) {
    score += 0.2;
  }

  return Math.max(0, Math.min(1, score));
}

export function scoreCandidate(job: Job, candidate: Candidate): ScoreBreakdown {
  const { score: semanticRaw, matched, missing } = scoreSkillMatch(job, candidate);
  const experienceRaw = scoreExperience(job, candidate);
  const educationRaw = scoreEducation(job, candidate);
  const activityRaw = scoreActivity(candidate);
  const trajectoryRaw = scoreTrajectory(job, candidate);

  const composite =
    semanticRaw * WEIGHTS.semantic +
    experienceRaw * WEIGHTS.experience +
    educationRaw * WEIGHTS.education +
    activityRaw * WEIGHTS.activity +
    trajectoryRaw * WEIGHTS.trajectory;

  return {
    compositeScore: Math.round(composite * 100 * 10) / 10,
    semanticScore: Math.round(semanticRaw * 100 * 10) / 10,
    experienceScore: Math.round(experienceRaw * 100 * 10) / 10,
    educationScore: Math.round(educationRaw * 100 * 10) / 10,
    activityScore: Math.round(activityRaw * 100 * 10) / 10,
    trajectoryScore: Math.round(trajectoryRaw * 100 * 10) / 10,
    matchedSkills: matched,
    missingSkills: missing,
  };
}
