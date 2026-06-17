import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rawText: text("raw_text").notNull(),
  requiredSkills: jsonb("required_skills").$type<string[]>().default([]),
  preferredSkills: jsonb("preferred_skills").$type<string[]>().default([]),
  minExperience: integer("min_experience"),
  educationRequirement: text("education_requirement"),
  domain: text("domain"),
  seniorityLevel: text("seniority_level"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;
