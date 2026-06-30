import { pgTable, serial, text, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  currentTitle: text("current_title"),
  currentCompany: text("current_company"),
  yearsExperience: integer("years_experience"),
  educationLevel: text("education_level"),
  skills: jsonb("skills").$type<string[]>().default([]),
  resumeText: text("resume_text"),
  location: text("location"),
  linkedinUrl: text("linkedin_url"),
  activityScore: real("activity_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;
