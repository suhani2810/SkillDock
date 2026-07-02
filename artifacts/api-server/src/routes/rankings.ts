import { Router } from "express";
import { db, jobsTable, candidatesTable, rankingRunsTable, rankingResultsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { scoreCandidate } from "../lib/scorer";
import { generateRationale } from "../lib/openai";
import {
  CreateRankingBody,
  GetRankingParams,
  ListRankedCandidatesParams,
  ExportRankingParams,
  GetRankingStatsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const runs = await db.select().from(rankingRunsTable).orderBy(desc(rankingRunsTable.createdAt));
    const jobs = await db.select({ id: jobsTable.id, title: jobsTable.title }).from(jobsTable);
    const jobMap = new Map(jobs.map((j) => [j.id, j.title]));

    res.json(runs.map((r) => serializeRun(r, jobMap.get(r.jobId) ?? null)));
  } catch (err) {
    req.log.error({ err }, "Failed to list rankings");
    res.status(500).json({ error: "Failed to list rankings" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateRankingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { jobId, topN = 15, minScore = 40 } = parsed.data;

  try {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId));
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }

    const [run] = await db
      .insert(rankingRunsTable)
      .values({ jobId, status: "running", topN, minScore })
      .returning();

    const candidates = await db.select().from(candidatesTable);

    const scored = candidates.map((c) => ({
      candidate: c,
      ...scoreCandidate(job, c),
    }));

    const filtered = scored
      .filter((s) => s.compositeScore >= (minScore ?? 40))
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, topN ?? 15);

    const rationalePromises = filtered.map((s) =>
      generateRationale(
        job.title,
        (job.requiredSkills as string[]) ?? [],
        {
          name: s.candidate.name,
          currentTitle: s.candidate.currentTitle,
          yearsExperience: s.candidate.yearsExperience,
          skills: (s.candidate.skills as string[]) ?? [],
        },
        {
          compositeScore: s.compositeScore,
          matchedSkills: s.matchedSkills,
          missingSkills: s.missingSkills,
        },
      ).catch(() => `${s.candidate.name} scored ${s.compositeScore}/100 for this role.`),
    );

    const rationales = await Promise.all(rationalePromises);

    const resultRows = filtered.map((s, idx) => ({
      rankingId: run.id,
      candidateId: s.candidate.id,
      rank: idx + 1,
      compositeScore: s.compositeScore,
      semanticScore: s.semanticScore,
      experienceScore: s.experienceScore,
      educationScore: s.educationScore,
      activityScore: s.activityScore,
      trajectoryScore: s.trajectoryScore,
      rationale: rationales[idx],
      matchedSkills: s.matchedSkills,
      missingSkills: s.missingSkills,
    }));

    if (resultRows.length > 0) {
      await db.insert(rankingResultsTable).values(resultRows);
    }

    const [updated] = await db
      .update(rankingRunsTable)
      .set({
        status: "completed",
        totalCandidates: candidates.length,
        shortlistedCount: filtered.length,
        completedAt: new Date(),
      })
      .where(eq(rankingRunsTable.id, run.id))
      .returning();

    res.status(201).json(serializeRun(updated, job.title));
  } catch (err) {
    req.log.error({ err }, "Failed to create ranking");
    res.status(500).json({ error: "Failed to create ranking" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetRankingParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [run] = await db.select().from(rankingRunsTable).where(eq(rankingRunsTable.id, params.data.id));
    if (!run) { res.status(404).json({ error: "Ranking not found" }); return; }

    const [job] = await db.select({ title: jobsTable.title }).from(jobsTable).where(eq(jobsTable.id, run.jobId));
    const results = await fetchResultsWithCandidates(run.id);

    res.json({
      ...serializeRun(run, job?.title ?? null),
      results,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get ranking");
    res.status(500).json({ error: "Failed to get ranking" });
  }
});

router.get("/:id/results", async (req, res) => {
  const params = ListRankedCandidatesParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const results = await fetchResultsWithCandidates(params.data.id);
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to get ranking results");
    res.status(500).json({ error: "Failed to get ranking results" });
  }
});

router.get("/:id/export", async (req, res) => {
  const params = ExportRankingParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const results = await fetchResultsWithCandidates(params.data.id);
    const [run] = await db.select().from(rankingRunsTable).where(eq(rankingRunsTable.id, params.data.id));
    const [job] = run
      ? await db.select({ title: jobsTable.title }).from(jobsTable).where(eq(jobsTable.id, run.jobId))
      : [null];

    const headers = ["Rank","Name","Title","Company","Years Exp","Education","Composite Score","Semantic","Experience","Education Score","Activity","Trajectory","Matched Skills","Missing Skills","Rationale"];
    const rows = results.map((r) => [
      r.rank,
      r.candidate.name,
      r.candidate.currentTitle ?? "",
      r.candidate.currentCompany ?? "",
      r.candidate.yearsExperience ?? "",
      r.candidate.educationLevel ?? "",
      r.compositeScore,
      r.semanticScore ?? "",
      r.experienceScore ?? "",
      r.educationScore ?? "",
      r.activityScore ?? "",
      r.trajectoryScore ?? "",
      (r.matchedSkills ?? []).join("; "),
      (r.missingSkills ?? []).join("; "),
      (r.rationale ?? "").replace(/"/g, '""'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${v}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="ranking-${params.data.id}-${job?.title ?? "results"}.csv"`);
    res.send(csv);
  } catch (err) {
    req.log.error({ err }, "Failed to export ranking");
    res.status(500).json({ error: "Failed to export ranking" });
  }
});

router.get("/:id/stats", async (req, res) => {
  const params = GetRankingStatsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const results = await db
      .select()
      .from(rankingResultsTable)
      .where(eq(rankingResultsTable.rankingId, params.data.id));

    const buckets: Record<string, number> = {
      "90-100": 0, "80-89": 0, "70-79": 0, "60-69": 0, "50-59": 0, "40-49": 0,
    };
    let total = 0;
    for (const r of results) {
      total += r.compositeScore;
      const score = r.compositeScore;
      if (score >= 90) buckets["90-100"]++;
      else if (score >= 80) buckets["80-89"]++;
      else if (score >= 70) buckets["70-79"]++;
      else if (score >= 60) buckets["60-69"]++;
      else if (score >= 50) buckets["50-59"]++;
      else buckets["40-49"]++;
    }

    const skillMatchMap: Record<string, number> = {};
    const skillMissingMap: Record<string, number> = {};
    for (const r of results) {
      for (const s of (r.matchedSkills as string[]) ?? []) skillMatchMap[s] = (skillMatchMap[s] ?? 0) + 1;
      for (const s of (r.missingSkills as string[]) ?? []) skillMissingMap[s] = (skillMissingMap[s] ?? 0) + 1;
    }

    res.json({
      scoreDistribution: Object.entries(buckets).map(([range, count]) => ({ range, count })),
      avgCompositeScore: results.length > 0 ? Math.round((total / results.length) * 10) / 10 : 0,
      topMatchedSkills: Object.entries(skillMatchMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, count]) => ({ label, count })),
      topMissingSkills: Object.entries(skillMissingMap)
        .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, count]) => ({ label, count })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get ranking stats");
    res.status(500).json({ error: "Failed to get ranking stats" });
  }
});

async function fetchResultsWithCandidates(rankingId: number) {
  const results = await db
    .select()
    .from(rankingResultsTable)
    .where(eq(rankingResultsTable.rankingId, rankingId))
    .orderBy(rankingResultsTable.rank);

  const candidateIds = [...new Set(results.map((r) => r.candidateId))];
  if (candidateIds.length === 0) return [];

  const candidates = await db
    .select()
    .from(candidatesTable)
    .where(eq(candidatesTable.id, candidateIds[0]));

  for (let i = 1; i < candidateIds.length; i++) {
    const more = await db.select().from(candidatesTable).where(eq(candidatesTable.id, candidateIds[i]));
    candidates.push(...more);
  }

  const candMap = new Map(
    candidates.map((c) => [
      c.id,
      {
        ...c,
        skills: (c.skills as string[]) ?? [],
        createdAt: c.createdAt.toISOString(),
      },
    ]),
  );

  return results
    .filter((r) => candMap.has(r.candidateId))
    .map((r) => ({
      id: r.id,
      rankingId: r.rankingId,
      candidateId: r.candidateId,
      rank: r.rank,
      compositeScore: r.compositeScore,
      semanticScore: r.semanticScore,
      experienceScore: r.experienceScore,
      educationScore: r.educationScore,
      activityScore: r.activityScore,
      trajectoryScore: r.trajectoryScore,
      rationale: r.rationale,
      matchedSkills: (r.matchedSkills as string[]) ?? [],
      missingSkills: (r.missingSkills as string[]) ?? [],
      candidate: candMap.get(r.candidateId)!,
    }));
}

function serializeRun(run: typeof rankingRunsTable.$inferSelect, jobTitle: string | null) {
  return {
    ...run,
    jobTitle,
    createdAt: run.createdAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
  };
}

export default router;
