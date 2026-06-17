import { Router } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { parseJobDescription } from "../lib/openai";
import { logger } from "../lib/logger";
import {
  CreateJobBody,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
  GetJobParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const jobs = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
    res.json(jobs.map(serializeJob));
  } catch (err) {
    req.log.error({ err }, "Failed to list jobs");
    res.status(500).json({ error: "Failed to list jobs" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { title, rawText } = parsed.data;
  try {
    req.log.info({ title }, "Parsing JD with AI");
    const parsedJD = await parseJobDescription(rawText);
    const [job] = await db
      .insert(jobsTable)
      .values({
        title,
        rawText,
        requiredSkills: parsedJD.requiredSkills,
        preferredSkills: parsedJD.preferredSkills,
        minExperience: parsedJD.minExperience ?? undefined,
        educationRequirement: parsedJD.educationRequirement ?? undefined,
        domain: parsedJD.domain ?? undefined,
        seniorityLevel: parsedJD.seniorityLevel ?? undefined,
      })
      .returning();
    res.status(201).json(serializeJob(job));
  } catch (err) {
    req.log.error({ err }, "Failed to create job");
    res.status(500).json({ error: "Failed to create job" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json(serializeJob(job));
  } catch (err) {
    req.log.error({ err }, "Failed to get job");
    res.status(500).json({ error: "Failed to get job" });
  }
});

router.patch("/:id", async (req, res) => {
  const params = UpdateJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const body = UpdateJobBody.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: body.error.message }); return; }

  try {
    const [job] = await db
      .update(jobsTable)
      .set({
        ...(body.data.title !== undefined && { title: body.data.title }),
        ...(body.data.requiredSkills !== undefined && { requiredSkills: body.data.requiredSkills }),
        ...(body.data.preferredSkills !== undefined && { preferredSkills: body.data.preferredSkills }),
        ...(body.data.minExperience !== undefined && { minExperience: body.data.minExperience }),
        ...(body.data.educationRequirement !== undefined && { educationRequirement: body.data.educationRequirement }),
        ...(body.data.domain !== undefined && { domain: body.data.domain }),
        ...(body.data.seniorityLevel !== undefined && { seniorityLevel: body.data.seniorityLevel }),
      })
      .where(eq(jobsTable.id, params.data.id))
      .returning();
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json(serializeJob(job));
  } catch (err) {
    req.log.error({ err }, "Failed to update job");
    res.status(500).json({ error: "Failed to update job" });
  }
});

router.delete("/:id", async (req, res) => {
  const params = DeleteJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }

  try {
    await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete job");
    res.status(500).json({ error: "Failed to delete job" });
  }
});

function serializeJob(job: typeof jobsTable.$inferSelect) {
  return {
    ...job,
    requiredSkills: (job.requiredSkills as string[]) ?? [],
    preferredSkills: (job.preferredSkills as string[]) ?? [],
    createdAt: job.createdAt.toISOString(),
  };
}

export default router;
