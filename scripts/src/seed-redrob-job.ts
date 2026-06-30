import { readFile } from "node:fs/promises";
import pg from "pg";

interface SeedOptions {
  file: string;
  dryRun: boolean;
}

const TITLE = "Senior AI Engineer - Founding Team";

const REQUIRED_SKILLS = [
  "Python",
  "Embeddings-based retrieval",
  "Vector databases",
  "Hybrid search",
  "Ranking systems",
  "Evaluation frameworks",
  "NDCG",
  "MRR",
  "A/B testing",
  "Production ML systems",
  "LLMs",
];

const PREFERRED_SKILLS = [
  "LLM fine-tuning",
  "LoRA",
  "QLoRA",
  "PEFT",
  "Learning-to-rank",
  "XGBoost",
  "HR tech",
  "Marketplace products",
  "Distributed systems",
  "Large-scale inference",
  "Open-source AI/ML contributions",
];

function parseArgs(argv: string[]): SeedOptions {
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
    throw new Error("Usage: pnpm --filter @workspace/scripts run seed:redrob-job -- --file <job_description.txt> [--dry-run]");
  }

  return {
    file,
    dryRun: args.get("dry-run") === true,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const rawText = await readFile(options.file, "utf8");

  const job = {
    title: TITLE,
    rawText,
    requiredSkills: REQUIRED_SKILLS,
    preferredSkills: PREFERRED_SKILLS,
    minExperience: 5,
    educationRequirement: "Computer Science or equivalent production ML engineering experience",
    domain: "AI recruiting intelligence, retrieval, ranking, and matching systems",
    seniorityLevel: "senior founding engineer",
  };

  if (options.dryRun) {
    console.log(JSON.stringify(job, null, 2));
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set.");
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const existing = await pool.query<{ id: number }>("SELECT id FROM jobs WHERE title = $1 LIMIT 1", [job.title]);

    if (existing.rowCount && existing.rows[0]) {
      const id = existing.rows[0].id;
      await pool.query(
        `
          UPDATE jobs SET
            raw_text = $2,
            required_skills = $3::jsonb,
            preferred_skills = $4::jsonb,
            min_experience = $5,
            education_requirement = $6,
            domain = $7,
            seniority_level = $8
          WHERE id = $1
        `,
        [
          id,
          job.rawText,
          JSON.stringify(job.requiredSkills),
          JSON.stringify(job.preferredSkills),
          job.minExperience,
          job.educationRequirement,
          job.domain,
          job.seniorityLevel,
        ],
      );
      console.log(`Updated Redrob challenge JD as job #${id}.`);
    } else {
      const created = await pool.query<{ id: number }>(
        `
          INSERT INTO jobs (
            title,
            raw_text,
            required_skills,
            preferred_skills,
            min_experience,
            education_requirement,
            domain,
            seniority_level
          )
          VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8)
          RETURNING id
        `,
        [
          job.title,
          job.rawText,
          JSON.stringify(job.requiredSkills),
          JSON.stringify(job.preferredSkills),
          job.minExperience,
          job.educationRequirement,
          job.domain,
          job.seniorityLevel,
        ],
      );
      console.log(`Created Redrob challenge JD as job #${created.rows[0].id}.`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
