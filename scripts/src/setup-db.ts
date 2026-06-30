import pg from "pg";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  console.error("DATABASE_URL must be set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const statements = [
  `
    CREATE TABLE IF NOT EXISTS jobs (
      id serial PRIMARY KEY,
      title text NOT NULL,
      raw_text text NOT NULL,
      required_skills jsonb DEFAULT '[]'::jsonb,
      preferred_skills jsonb DEFAULT '[]'::jsonb,
      min_experience integer,
      education_requirement text,
      domain text,
      seniority_level text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS candidates (
      id serial PRIMARY KEY,
      name text NOT NULL,
      email text UNIQUE,
      current_title text,
      current_company text,
      years_experience integer,
      education_level text,
      skills jsonb DEFAULT '[]'::jsonb,
      resume_text text,
      location text,
      linkedin_url text,
      activity_score real,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ranking_runs (
      id serial PRIMARY KEY,
      job_id integer NOT NULL REFERENCES jobs(id) ON DELETE cascade,
      status text NOT NULL DEFAULT 'pending',
      top_n integer DEFAULT 15,
      min_score real DEFAULT 40,
      total_candidates integer,
      shortlisted_count integer,
      created_at timestamp NOT NULL DEFAULT now(),
      completed_at timestamp
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ranking_results (
      id serial PRIMARY KEY,
      ranking_id integer NOT NULL REFERENCES ranking_runs(id) ON DELETE cascade,
      candidate_id integer NOT NULL REFERENCES candidates(id) ON DELETE cascade,
      rank integer NOT NULL,
      composite_score real NOT NULL,
      semantic_score real,
      experience_score real,
      education_score real,
      activity_score real,
      trajectory_score real,
      rationale text,
      matched_skills jsonb DEFAULT '[]'::jsonb,
      missing_skills jsonb DEFAULT '[]'::jsonb
    )
  `,
  "CREATE UNIQUE INDEX IF NOT EXISTS candidates_email_unique_idx ON candidates(email)",
  "CREATE INDEX IF NOT EXISTS ranking_runs_job_id_idx ON ranking_runs(job_id)",
  "CREATE INDEX IF NOT EXISTS ranking_results_ranking_id_idx ON ranking_results(ranking_id)",
  "CREATE INDEX IF NOT EXISTS ranking_results_candidate_id_idx ON ranking_results(candidate_id)",
];

async function main(): Promise<void> {
  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log("Database tables are ready.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
