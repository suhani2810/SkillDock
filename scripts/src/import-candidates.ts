import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { createInterface } from "node:readline";
import pg from "pg";

type Proficiency = "beginner" | "intermediate" | "advanced" | "expert";

interface ChallengeCandidate {
  candidate_id: string;
  profile: {
    anonymized_name: string;
    headline: string;
    summary: string;
    location: string;
    country: string;
    years_of_experience: number;
    current_title: string;
    current_company: string;
    current_industry: string;
  };
  career_history: Array<{
    company: string;
    title: string;
    duration_months: number;
    is_current: boolean;
    industry: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string;
    tier?: string;
  }>;
  skills: Array<{
    name: string;
    proficiency: Proficiency;
    endorsements: number;
    duration_months?: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: number;
  }>;
  redrob_signals: {
    profile_completeness_score: number;
    open_to_work_flag: boolean;
    recruiter_response_rate: number;
    avg_response_time_hours: number;
    skill_assessment_scores: Record<string, number>;
    endorsements_received: number;
    notice_period_days: number;
    github_activity_score: number;
    search_appearance_30d: number;
    saved_by_recruiters_30d: number;
    interview_completion_rate: number;
    offer_acceptance_rate: number;
    verified_email: boolean;
    verified_phone: boolean;
    linkedin_connected: boolean;
  };
}

interface ImportOptions {
  file: string;
  limit?: number;
  batchSize: number;
  dryRun: boolean;
}

const DEFAULT_BATCH_SIZE = 500;

interface CandidateInsert {
  name: string;
  email: string;
  currentTitle: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  skills: string[];
  resumeText: string | null;
  location: string | null;
  linkedinUrl: string | null;
  activityScore: number | null;
}

function parseArgs(argv: string[]): ImportOptions {
  const args = new Map<string, string | boolean>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") continue;
    if (!arg.startsWith("--")) continue;

    const [key, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue != null) {
      args.set(key, inlineValue);
    } else if (key === "dry-run") {
      args.set(key, true);
    } else {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }
      args.set(key, value);
      i++;
    }
  }

  const file = args.get("file");
  if (typeof file !== "string") {
    throw new Error("Usage: pnpm --filter @workspace/scripts import:candidates -- --file <candidates.jsonl> [--limit 1000] [--batch-size 500] [--dry-run]");
  }

  return {
    file,
    limit: toPositiveInt(args.get("limit"), "limit"),
    batchSize: toPositiveInt(args.get("batch-size"), "batch-size") ?? DEFAULT_BATCH_SIZE,
    dryRun: args.get("dry-run") === true,
  };
}

function toPositiveInt(value: string | boolean | undefined, label: string): number | undefined {
  if (value == null || typeof value === "boolean") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`--${label} must be a positive integer`);
  }
  return parsed;
}

function mapCandidate(candidate: ChallengeCandidate): CandidateInsert {
  const topSkills = [...candidate.skills]
    .sort((a, b) => skillWeight(b) - skillWeight(a))
    .slice(0, 20)
    .map((skill) => skill.name);

  return {
    name: candidate.profile.anonymized_name,
    email: `${candidate.candidate_id.toLowerCase()}@redrob.local`,
    currentTitle: candidate.profile.current_title,
    currentCompany: candidate.profile.current_company,
    yearsExperience: Math.round(candidate.profile.years_of_experience),
    educationLevel: summarizeEducation(candidate.education),
    skills: topSkills,
    resumeText: buildResumeText(candidate),
    location: [candidate.profile.location, candidate.profile.country].filter(Boolean).join(", "),
    linkedinUrl: candidate.redrob_signals.linkedin_connected ? `https://linkedin.com/in/${candidate.candidate_id.toLowerCase()}` : null,
    activityScore: calculateActivityScore(candidate.redrob_signals),
  };
}

function skillWeight(skill: ChallengeCandidate["skills"][number]): number {
  const proficiencyWeight: Record<Proficiency, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  return (
    proficiencyWeight[skill.proficiency] * 100 +
    Math.min(skill.duration_months ?? 0, 72) +
    Math.min(skill.endorsements, 100) * 0.5
  );
}

function summarizeEducation(education: ChallengeCandidate["education"]): string | null {
  if (education.length === 0) return null;
  const [primary] = education;
  const tier = primary.tier && primary.tier !== "unknown" ? `, ${primary.tier.replace("_", " ")}` : "";
  return `${primary.degree} in ${primary.field_of_study}${tier}`;
}

function buildResumeText(candidate: ChallengeCandidate): string {
  const profile = candidate.profile;
  const career = candidate.career_history.map((role) =>
    `${role.title} at ${role.company} (${role.industry}, ${role.duration_months} months): ${role.description}`,
  );
  const education = candidate.education.map((edu) =>
    `${edu.degree} in ${edu.field_of_study} from ${edu.institution}`,
  );
  const skills = candidate.skills.map((skill) =>
    `${skill.name} (${skill.proficiency}, ${skill.duration_months ?? 0} months, ${skill.endorsements} endorsements)`,
  );
  const certifications = (candidate.certifications ?? []).map((cert) =>
    `${cert.name} from ${cert.issuer} (${cert.year})`,
  );

  return [
    profile.headline,
    profile.summary,
    `Current industry: ${profile.current_industry}.`,
    `Experience: ${profile.years_of_experience} years.`,
    ...career,
    ...education,
    `Skills: ${skills.join("; ")}.`,
    certifications.length ? `Certifications: ${certifications.join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function calculateActivityScore(signals: ChallengeCandidate["redrob_signals"]): number {
  const githubScore = signals.github_activity_score < 0 ? 35 : signals.github_activity_score;
  const offerAcceptance = signals.offer_acceptance_rate < 0 ? 50 : signals.offer_acceptance_rate * 100;
  const responseSpeedScore = Math.max(0, 100 - signals.avg_response_time_hours / 2);
  const verificationScore =
    (signals.verified_email ? 12 : 0) +
    (signals.verified_phone ? 10 : 0) +
    (signals.linkedin_connected ? 8 : 0);

  const raw =
    signals.profile_completeness_score * 0.22 +
    signals.recruiter_response_rate * 100 * 0.18 +
    responseSpeedScore * 0.08 +
    Math.min(signals.search_appearance_30d, 300) / 3 * 0.10 +
    Math.min(signals.saved_by_recruiters_30d, 20) * 2 * 0.10 +
    signals.interview_completion_rate * 100 * 0.12 +
    offerAcceptance * 0.08 +
    githubScore * 0.07 +
    verificationScore * 0.05;

  return Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;
}

async function flushBatch(batch: CandidateInsert[], dryRun: boolean, pool: pg.Pool | null): Promise<void> {
  if (batch.length === 0 || dryRun) return;

  if (!pool) {
    throw new Error("DATABASE_URL must be set for a real import.");
  }

  const columns = [
    "name",
    "email",
    "current_title",
    "current_company",
    "years_experience",
    "education_level",
    "skills",
    "resume_text",
    "location",
    "linkedin_url",
    "activity_score",
  ];
  const values: unknown[] = [];
  const placeholders = batch.map((candidate, rowIndex) => {
    const offset = rowIndex * columns.length;
    values.push(
      candidate.name,
      candidate.email,
      candidate.currentTitle,
      candidate.currentCompany,
      candidate.yearsExperience,
      candidate.educationLevel,
      JSON.stringify(candidate.skills),
      candidate.resumeText,
      candidate.location,
      candidate.linkedinUrl,
      candidate.activityScore,
    );

    return `(${columns.map((_, columnIndex) => `$${offset + columnIndex + 1}`).join(", ")})`;
  });

  await pool.query(
    `
      INSERT INTO candidates (${columns.join(", ")})
      VALUES ${placeholders.join(", ")}
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        current_title = EXCLUDED.current_title,
        current_company = EXCLUDED.current_company,
        years_experience = EXCLUDED.years_experience,
        education_level = EXCLUDED.education_level,
        skills = EXCLUDED.skills,
        resume_text = EXCLUDED.resume_text,
        location = EXCLUDED.location,
        linkedin_url = EXCLUDED.linkedin_url,
        activity_score = EXCLUDED.activity_score
    `,
    values,
  );
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  await access(options.file);
  if (!options.dryRun && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set for a real import.");
  }
  const pool = options.dryRun ? null : new pg.Pool({ connectionString: process.env.DATABASE_URL });

  const reader = createInterface({
    input: createReadStream(options.file, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let seen = 0;
  let imported = 0;
  const batch: CandidateInsert[] = [];

  for await (const line of reader) {
    if (!line.trim()) continue;

    const parsed = JSON.parse(line) as ChallengeCandidate;
    batch.push(mapCandidate(parsed));
    seen++;

    if (batch.length >= options.batchSize) {
      await flushBatch(batch, options.dryRun, pool);
      imported += batch.length;
      batch.length = 0;
      console.log(`${options.dryRun ? "Mapped" : "Imported"} ${imported} candidates...`);
    }

    if (options.limit != null && seen >= options.limit) break;
  }

  await flushBatch(batch, options.dryRun, pool);
  imported += batch.length;

  console.log(`${options.dryRun ? "Dry run mapped" : "Import complete:"} ${imported} candidates from ${options.file}`);
  await pool?.end();
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
