# StreamCore – 7-Day MVP Roadmap (FFmpeg-first)

Timeframe: 7 days from project start
Goal: Daily.co cloud recording → FFmpeg processing → S3 upload → optional AI → basic distribution hooks.

Note: See `Tasks.md` for the live task board and daily progress.

## Day 1 – Foundation + Recording (Daily.co)
- Setup Bun + Express + TypeScript boilerplate
- Add ESLint/Prettier/tsconfig/Vitest
- Prisma setup + initial schema placeholders
- JWT auth (login + middleware)
- Daily.co client wrapper and `POST /recordings/rooms` to create rooms
- Healthcheck `GET /health`, basic `/metrics` if handy

Deliverables:
- `bun run dev` runs HTTP server
- Can create a Daily room via API

## Day 2 – Recording Management + Storage + Worker
- Daily.co webhook handler `POST /webhooks/daily` (recording-completed)
- AWS S3/MinIO setup + upload helper
- DB models: `User`, `Project`, `Recording`, `Asset` and linking
- BullMQ + Redis setup; FFmpeg worker container (installed ffmpeg)
- Basic worker health checks

Deliverables:
- Webhook receives recording payload from Daily
- Recording metadata saved; processing job enqueued
- Worker container runs and can pick jobs

## Day 3 – FFmpeg Processing Pipeline + AI Transcription
- Audio: loudness normalization, silence trim, voice enhancement
- Video: H.264 compress, 1080p/720p/480p variants
- Extract audio track; mp3 at 128/192/320 kbps
- Format conversions (mp4/webm → targets), thumbnails
- Optional: Whisper API integration; GPT-4 for show notes/chapters

Deliverables:
- Given a source URL, worker outputs processed files to S3 and updates DB
- Optional: transcript objects stored when enabled

## Day 4 – Advanced FFmpeg + Distribution Setup
- Multi-track mixing (amix with per-track volume)
- Audio ducking (reduce music under speech)
- Video composition (PiP layouts), waveform visualization
- Clip extraction (short social snippets)
- Distribution: start RSS generator; prep Spotify/Apple wrappers (stubs)

Deliverables:
- At least one advanced FFmpeg job works end-to-end
- RSS skeleton endpoint returns a minimal feed for a project

## Day 5 – YouTube Upload + Processing Dashboard
- Integrate YouTube Data API for auto-upload (auth flow + upload)
- Add simple dashboard UI (or JSON endpoints) to list projects/recordings
- Show processing status: Recording → Downloading → Processing → Optimizing → Uploading → Published
- WebSocket optional; can poll `/jobs/:id/status`

Deliverables:
- Upload a processed video to a test YouTube channel
- Dashboard displays per-recording status and links to outputs

## Day 6 – Analytics + Advanced Processing Jobs
- Webhook receivers for external platform analytics (stubs acceptable)
- DB schema for metrics; basic analytics view/API
- Automated workflows: generate top-3 clips via GPT-4 from transcript
- Batch processing for multiple formats; scheduled optimization jobs
- Chapter markers via audio analysis; quality checks (levels/clarity)

Deliverables:
- Automated clip generation proof (1–3 clips) and stored artifacts
- Basic analytics visible via endpoint or simple UI

## Day 7 – Stabilization, Docs, and Demo
- Add tests for config, routes, and services (unit + minimal integration)
- Load test smoke (k6 or autocannon) for `/health` and a couple routes
- Add dashboards in Grafana (import a Node.js service template; add key metrics)
- Polish README with runbook and demo steps
- Record a short demo flow:
  1) Create project/session
  2) Generate presigned URL and upload sample file
  3) Enqueue ingest -> transcode -> transcription
  4) Verify assets and transcripts in MinIO

Deliverables:
- `docker compose up` runs infra + app + worker
- End-to-end demo: Daily recording → webhook → FFmpeg outputs → S3 → optional AI → YouTube

---

## Success Criteria (End of Week)
- `docker compose up` starts infra (Postgres, Redis, MinIO)
- `bun run dev` starts API; `/health` and optional `/metrics` reachable
- Daily room creation works; webhooks received for recording completion
- BullMQ pipeline processes: ingest → transcode → (optional) transcribe → upload to S3
- Dashboard or endpoints show processing status and links
- Docs clearly explain setup and demo

## Stretch (if time permits)
- OpenAPI (Swagger) spec
- Role-based access control checks on routes
- CI (GitHub Actions): lint, test, typecheck
- CloudFront + signed URLs; Apple/Spotify publishing flows

## Risks & Mitigations
- Whisper rate limiting: flag, backoff/retry, allow offline dev mode
- Redis availability: health checks; degrade gracefully to queued retries
- FFmpeg codecs: pin worker image; include sample media for tests

## Daily Checklists
- Health endpoints OK for API and worker
- Docker services healthy (`compose ps`)
- New env vars documented in `.env.example`
- Tests added/updated for new modules
