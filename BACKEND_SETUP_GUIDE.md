# SkillDock Backend Setup Guide

Use this when setting up the project on a teammate's machine.

## 1. Install Requirements

- Node.js 22+ recommended
- pnpm
- A Neon Postgres connection string

If `pnpm` is not available:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

## 2. Install Dependencies

```powershell
cd C:\project\SkillDock
pnpm install
```

## 3. Create Local Env File

Create `load-env.ps1` in the repo root:

```powershell
$env:DATABASE_URL = "PASTE_NEON_DIRECT_CONNECTION_STRING_HERE"
$env:PORT = "8080"
$env:NODE_ENV = "development"
```

Important:

- Use Neon **Direct connection** for setup/import.
- Keep the URL inside double quotes because it contains `&`.
- Do not commit `load-env.ps1`.

## 3B. Create Frontend Firebase Env File

Copy the example file:

```powershell
Copy-Item artifacts\candidate-iq\.env.example artifacts\candidate-iq\.env.local
```

Then edit:

```text
artifacts/candidate-iq/.env.local
```

Fill it with the Firebase web app values:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Do not commit `.env.local`.

## 4. Create Tables

```powershell
cd C:\project\SkillDock
.\load-env.ps1
pnpm --filter @workspace/scripts run db:setup
```

## 5. Import Candidate Dataset

```powershell
pnpm --filter @workspace/scripts run import:candidates --file "FULL_PATH_TO_candidates.jsonl"
```

For the hackathon guidelines, import the full dataset, not a limited subset.

## 6. Seed Challenge Job

```powershell
pnpm --filter @workspace/scripts run seed:redrob-job --file "FULL_PATH_TO_job_description.txt"
```

## 7. Verify Database Counts

```powershell
pnpm --filter @workspace/scripts exec node -e "const pg=require('pg'); const pool=new pg.Pool({connectionString:process.env.DATABASE_URL}); Promise.all([pool.query('select count(*) from candidates'),pool.query('select count(*) from jobs'),pool.query('select count(*) from ranking_runs')]).then(([c,j,r])=>{console.log('candidates:',c.rows[0].count);console.log('jobs:',j.rows[0].count);console.log('ranking_runs:',r.rows[0].count);}).catch(e=>{console.error(e.message); process.exit(1)}).finally(()=>pool.end())"
```

Expected after fresh setup:

```text
candidates: 100000
jobs: 1
ranking_runs: 0
```

## 8. Run Backend

Terminal 1:

```powershell
cd C:\project\SkillDock
.\load-env.ps1
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

Backend runs on:

```text
http://localhost:8080
```

Check:

```text
http://localhost:8080/api/candidates/stats
```

## 9. Run Frontend

Terminal 2:

```powershell
cd C:\project\SkillDock
.\load-env.ps1
$env:PORT = "25401"
pnpm --filter @workspace/candidate-iq run dev
```

Frontend runs on:

```text
http://localhost:25401
```

## Common Problems

### `pnpm` not recognized

Run:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
```

### `EADDRINUSE: address already in use :::8080`

Port 8080 is already used. Find and kill the old process:

```powershell
netstat -ano | findstr :8080
taskkill /PID YOUR_PID /F
```

### Frontend opens on `localhost:8080`

The frontend accidentally used backend's port. Restart frontend with:

```powershell
$env:PORT = "25401"
pnpm --filter @workspace/candidate-iq run dev
```

### `getaddrinfo ENOTFOUND ...neon.tech`

The Neon hostname is not resolving.

Try:

```powershell
nslookup YOUR_NEON_HOST
ipconfig /flushdns
```

Also open Neon SQL Editor and run:

```sql
select now();
```

This wakes the Neon compute.

### PDF/DOCX Upload

Quick Rank supports PDF and DOCX upload through:

```text
POST /api/documents/extract
```

PDF upload works for text PDFs. Scanned image PDFs need OCR and may fail.
