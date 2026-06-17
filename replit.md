# CandidateIQ

AI-powered candidate ranking and discovery platform for technical recruiters — ingests job descriptions, scores candidates across 5 dimensions, and produces ranked shortlists with rationale and skill gap analysis.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/candidate-iq run dev` — run the React frontend (port 25401, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `OPENAI_API_KEY` — enables AI-powered JD parsing and rationale generation (falls back to regex/heuristics if absent)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + shadcn/ui + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API contract: OpenAPI spec at `lib/api-spec/openapi.yaml`, codegen via Orval
- Generated hooks: `@workspace/api-client-react`, Zod schemas: `@workspace/api-zod`
- Build: esbuild (CJS bundle for API server)

## Where things live

- `lib/db/src/schema/` — DB schema (jobs, candidates, ranking_runs, ranking_results)
- `lib/api-spec/openapi.yaml` — single source of truth for API contract
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/` — Express route handlers (jobs, candidates, rankings)
- `artifacts/api-server/src/lib/scorer.ts` — 5-dimension hybrid scoring engine
- `artifacts/api-server/src/lib/openai.ts` — JD parsing + rationale generation (with heuristic fallback)
- `artifacts/candidate-iq/src/pages/` — all UI pages
- `artifacts/candidate-iq/src/components/layout.tsx` — sidebar layout

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React Query hooks. Never hand-write API fetch calls.
- **Scoring is server-side only**: 5 dimension weights (semantic 35%, experience 25%, education 15%, activity 15%, trajectory 10%). No embeddings — uses TF-IDF + skill matching for semantic score.
- **OpenAI optional**: All AI features (JD parsing, rationale) fall back to regex heuristics if `OPENAI_API_KEY` is absent. App is fully functional without it.
- **Orval naming collision fix**: Endpoints with BOTH path params AND query params cause `<OperationId>Params` barrel collision. Fixed by removing query params from `listRankedCandidates` — filtering is done client-side.
- **Route ordering**: `/candidates/stats` must be registered BEFORE `/candidates/:id` in Express to avoid the id param intercepting the stats route.

## Product

- **Dashboard**: overview of candidate pool stats and recent ranking runs
- **Jobs**: create/edit job descriptions; AI extracts required skills, experience, education, seniority, domain
- **Candidates**: browse the full pool with education breakdown and top skills charts; full-text search
- **New Ranking**: select a job, configure shortlist size and minimum score threshold; runs in <1s
- **Ranking Results**: ranked shortlist with composite score rings, expandable detail rows showing 5-dimension score bars, AI rationale, matched/missing skills; filter and sort; CSV export

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after changing DB schema
- Do not run `pnpm dev` at workspace root (no root dev script by design)
- Verify artifacts with `pnpm --filter @workspace/<slug> run typecheck`, not `build`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
