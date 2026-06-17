import { Router } from "express";
import { db, candidatesTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  GetCandidateParams,
  CreateCandidateBody,
  ListCandidatesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const allCandidates = await db.select().from(candidatesTable);
    const total = allCandidates.length;
    const avgExperience =
      total > 0
        ? allCandidates.reduce((sum, c) => sum + (c.yearsExperience ?? 0), 0) / total
        : 0;

    const eduMap: Record<string, number> = {};
    for (const c of allCandidates) {
      const edu = c.educationLevel ?? "Unknown";
      eduMap[edu] = (eduMap[edu] ?? 0) + 1;
    }

    const skillMap: Record<string, number> = {};
    for (const c of allCandidates) {
      for (const skill of (c.skills as string[]) ?? []) {
        skillMap[skill] = (skillMap[skill] ?? 0) + 1;
      }
    }

    const educationBreakdown = Object.entries(eduMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));

    const topSkills = Object.entries(skillMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));

    res.json({ total, avgExperience: Math.round(avgExperience * 10) / 10, educationBreakdown, topSkills });
  } catch (err) {
    req.log.error({ err }, "Failed to get candidate stats");
    res.status(500).json({ error: "Failed to get candidate stats" });
  }
});

router.get("/", async (req, res) => {
  const query = ListCandidatesQueryParams.safeParse(req.query);
  try {
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
        );
    } else {
      candidates = await db.select().from(candidatesTable);
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
