import { Router } from "express";
import { db, candidatesTable, pool } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  GetCandidateParams,
  CreateCandidateBody,
  ListCandidatesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [summary, education, skills] = await Promise.all([
      pool.query<{ total: number; avg_experience: number | null }>(
        "select count(*)::int as total, avg(years_experience)::float as avg_experience from candidates",
      ),
      pool.query<{ label: string; count: number }>(
        `
          select coalesce(education_level, 'Unknown') as label, count(*)::int as count
          from candidates
          group by coalesce(education_level, 'Unknown')
          order by count desc
          limit 6
        `,
      ),
      pool.query<{ label: string; count: number }>(
        `
          select skill.value as label, count(*)::int as count
          from candidates
          cross join lateral jsonb_array_elements_text(coalesce(skills, '[]'::jsonb)) as skill(value)
          group by skill.value
          order by count desc
          limit 10
        `,
      ),
    ]);

    const total = Number(summary.rows[0]?.total ?? 0);
    const avgExperience = Number(summary.rows[0]?.avg_experience ?? 0);
    const educationBreakdown = education.rows;
    const topSkills = skills.rows;

    res.json({ total, avgExperience: Math.round(avgExperience * 10) / 10, educationBreakdown, topSkills });
  } catch (err) {
    req.log.error({ err }, "Failed to get candidate stats");
    res.status(500).json({ error: "Failed to get candidate stats" });
  }
});

router.get("/", async (req, res) => {
  const query = ListCandidatesQueryParams.safeParse(req.query);
  try {
    const listLimit = 50;
    let candidates;
    if (query.success && query.data.search) {
      const search = `%${query.data.search}%`;
      candidates = await db
        .select()
        .from(candidatesTable)
        .where(
          or(
            ilike(candidatesTable.name, search),
            ilike(sql`coalesce(${candidatesTable.currentTitle}, '')`, search),
            ilike(sql`coalesce(${candidatesTable.currentCompany}, '')`, search),
          ),
        )
        .limit(listLimit);
    } else {
      candidates = await db.select().from(candidatesTable).limit(listLimit);
    }
    res.json(candidates.map(serializeCandidate));
  } catch (err) {
    req.log.error({ err }, "Failed to list candidates");
    res.status(500).json({ error: "Failed to list candidates" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  try {
    const [candidate] = await db
      .insert(candidatesTable)
      .values({
        ...parsed.data,
        skills: parsed.data.skills ?? [],
      })
      .returning();
    res.status(201).json(serializeCandidate(candidate));
  } catch (err) {
    req.log.error({ err }, "Failed to create candidate");
    res.status(500).json({ error: "Failed to create candidate" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetCandidateParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
    if (!candidate) { res.status(404).json({ error: "Candidate not found" }); return; }
    res.json(serializeCandidate(candidate));
  } catch (err) {
    req.log.error({ err }, "Failed to get candidate");
    res.status(500).json({ error: "Failed to get candidate" });
  }
});

function serializeCandidate(c: typeof candidatesTable.$inferSelect) {
  return {
    ...c,
    skills: (c.skills as string[]) ?? [],
    createdAt: c.createdAt.toISOString(),
  };
}

export default router;
