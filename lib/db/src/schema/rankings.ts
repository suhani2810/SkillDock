import { pgTable, serial, integer, timestamp, text, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { jobsTable } from "./jobs";
import { candidatesTable } from "./candidates";

export const rankingRunsTable = pgTable("ranking_runs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  topN: integer("top_n").default(15),
  minScore: real("min_score").default(40),
  totalCandidates: integer("total_candidates"),
  shortlistedCount: integer("shortlisted_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const rankingResultsTable = pgTable("ranking_results", {
  id: serial("id").primaryKey(),
  rankingId: integer("ranking_id").notNull().references(() => rankingRunsTable.id, { onDelete: "cascade" }),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id, { onDelete: "cascade" }),
  rank: integer("rank").notNull(),
  compositeScore: real("composite_score").notNull(),
  semanticScore: real("semantic_score"),
  experienceScore: real("experience_score"),
  educationScore: real("education_score"),
  activityScore: real("activity_score"),
  trajectoryScore: real("trajectory_score"),
  rationale: text("rationale"),
  matchedSkills: jsonb("matched_skills").$type<string[]>().default([]),
  missingSkills: jsonb("missing_skills").$type<string[]>().default([]),
});

export const insertRankingRunSchema = createInsertSchema(rankingRunsTable).omit({ id: true, createdAt: true });
export const insertRankingResultSchema = createInsertSchema(rankingResultsTable).omit({ id: true });
export type InsertRankingRun = z.infer<typeof insertRankingRunSchema>;
export type InsertRankingResult = z.infer<typeof insertRankingResultSchema>;
export type RankingRun = typeof rankingRunsTable.$inferSelect;
export type RankingResult = typeof rankingResultsTable.$inferSelect;
