import OpenAI from "openai";
import { logger } from "./logger";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn("OPENAI_API_KEY not set — AI features disabled");
    return null;
  }
  if (!_client) {
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export interface ParsedJD {
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number | null;
  educationRequirement: string | null;
  domain: string | null;
  seniorityLevel: string | null;
}

export async function parseJobDescription(rawText: string): Promise<ParsedJD> {
  const client = getOpenAIClient();
  if (!client) {
    return {
      requiredSkills: extractSkillsBasic(rawText),
      preferredSkills: [],
      minExperience: extractExperienceBasic(rawText),
      educationRequirement: extractEducationBasic(rawText),
      domain: null,
      seniorityLevel: extractSeniorityBasic(rawText),
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a recruitment assistant. Extract structured data from job descriptions. 
Return JSON with these fields:
- requiredSkills: string[] (must-have technical skills)
- preferredSkills: string[] (nice-to-have skills)  
- minExperience: number | null (years, e.g. 3)
- educationRequirement: string | null (e.g. "Bachelor's degree", "Master's degree")
- domain: string | null (e.g. "fintech", "healthcare", "e-commerce")
- seniorityLevel: string | null (e.g. "junior", "mid", "senior", "staff", "principal")`,
        },
        {
          role: "user",
          content: rawText.slice(0, 4000),
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as ParsedJD;
    return {
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
      preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
      minExperience: typeof parsed.minExperience === "number" ? parsed.minExperience : null,
      educationRequirement: parsed.educationRequirement ?? null,
      domain: parsed.domain ?? null,
      seniorityLevel: parsed.seniorityLevel ?? null,
    };
  } catch (err) {
    logger.error({ err }, "OpenAI JD parsing failed, falling back to basic extraction");
    return {
      requiredSkills: extractSkillsBasic(rawText),
      preferredSkills: [],
      minExperience: extractExperienceBasic(rawText),
      educationRequirement: extractEducationBasic(rawText),
      domain: null,
      seniorityLevel: extractSeniorityBasic(rawText),
    };
  }
}

export async function generateRationale(
  jobTitle: string,
  jobRequiredSkills: string[],
  candidate: { name: string; currentTitle?: string | null; yearsExperience?: number | null; skills?: string[] | null },
  scores: { compositeScore: number; matchedSkills: string[]; missingSkills: string[] },
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    return generateRationaleBasic(jobTitle, candidate, scores);
  }

  try {
    const prompt = `Write a 2-3 sentence recruiter-facing explanation for why ${candidate.name} (${candidate.currentTitle ?? "candidate"}, ${candidate.yearsExperience ?? "?"} years exp) scored ${scores.compositeScore}/100 for the role "${jobTitle}". 
Matched skills: ${scores.matchedSkills.join(", ") || "none"}.
Missing skills: ${scores.missingSkills.join(", ") || "none"}.
Be specific, professional, and honest. Do not use bullet points.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0]?.message?.content?.trim() ?? generateRationaleBasic(jobTitle, candidate, scores);
  } catch (err) {
    logger.error({ err }, "OpenAI rationale generation failed");
    return generateRationaleBasic(jobTitle, candidate, scores);
  }
}

function generateRationaleBasic(
  jobTitle: string,
  candidate: { name: string; currentTitle?: string | null; yearsExperience?: number | null },
  scores: { compositeScore: number; matchedSkills: string[]; missingSkills: string[] },
): string {
  const matched = scores.matchedSkills.slice(0, 4).join(", ");
  const missing = scores.missingSkills.slice(0, 3).join(", ");
  const exp = candidate.yearsExperience ?? 0;
  const title = candidate.currentTitle ?? "candidate";
  let rationale = `${candidate.name} is a ${title} with ${exp || "unknown"} years of experience and a ${scores.compositeScore}/100 fit for ${jobTitle}.`;
  if (matched) rationale += ` The strongest evidence is ${matched}.`;
  if (missing) rationale += ` Remaining gaps to verify: ${missing}.`;
  return rationale;
}

function extractSkillsBasic(text: string): string[] {
  const commonSkills = [
    "JavaScript","TypeScript","Python","Java","C++","C#","Go","Rust","Ruby","PHP",
    "React","Angular","Vue","Node.js","Express","Django","Flask","Spring","Rails",
    "PostgreSQL","MySQL","MongoDB","Redis","Elasticsearch","GraphQL","REST","gRPC",
    "AWS","GCP","Azure","Docker","Kubernetes","Terraform","CI/CD","Git",
    "Machine Learning","Deep Learning","TensorFlow","PyTorch","SQL","Spark",
    "Kafka","RabbitMQ","Microservices","Agile","Scrum",
  ];
  const lower = text.toLowerCase();
  return commonSkills.filter((s) => lower.includes(s.toLowerCase())).slice(0, 12);
}

function extractExperienceBasic(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  return match ? parseInt(match[1]) : null;
}

function extractEducationBasic(text: string): string | null {
  if (/master|msc|m\.s\./i.test(text)) return "Master's degree";
  if (/bachelor|b\.s\.|b\.a\./i.test(text)) return "Bachelor's degree";
  if (/phd|doctorate/i.test(text)) return "PhD";
  return null;
}

function extractSeniorityBasic(text: string): string | null {
  if (/\bstaff\b|\bprincipal\b|\bdistinguished\b/i.test(text)) return "staff";
  if (/\bsenior\b|\bsr\b/i.test(text)) return "senior";
  if (/\bjunior\b|\bjr\b|\bentry.level\b/i.test(text)) return "junior";
  if (/\blead\b/i.test(text)) return "lead";
  return "mid";
}
