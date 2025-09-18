# StreamCore – 1-Week Execution Roadmap (MVP)

Timeframe: 7 days from project start
Goal: Ship a runnable backend MVP with local infrastructure via Docker, basic recording signaling, media pipeline skeleton, and a demo transcription flow using Whisper (flagged).

Note: See [Tasks.md](./Tasks.md) for the live Week-1 task board with checklists and daily progress tracking.

## Day 1 – Repo Scaffolding & Core Config
- Initialize Bun + TypeScript + Express app skeleton
- Add project tooling: ESLint, Prettier, tsconfig, vitest
- Define folder structure: `src/app.ts`, `src/server.ts`, `src/modules/*`, `src/routes/*`, `src/config/*`, `src/metrics/*`
- Create `.env.example` using values from `README.md`
- Add logger (pino), config validation (zod)
- Add healthcheck route `GET /health`
- Add Prometheus `/metrics` endpoint (basic process metrics)

Deliverables:
- `bun run dev` runs an HTTP server
- Lint/test scripts run successfully

## Day 2 – DB + Cache + Storage (Local)
- Add Docker Compose for: Postgres, Redis, MinIO, Prometheus, Grafana
- Choose ORM (Prisma or Drizzle). Create base models: `User`, `Project`, `Session`, `Asset`
- Run initial migration and seed script (optional)
- Implement basic repositories/services for `Project` and `Session`
- Implement S3/MinIO client and `POST /uploads/presign` route

Deliverables:
- `POST /projects` creates a project row
- `POST /sessions` creates a session linked to project
- `POST /uploads/presign` returns a presigned PUT URL for MinIO bucket

## Day 3 – Auth + Socket.IO Signaling
- Implement JWT auth (login + middleware). Stub `User` with password hash
- Add role placeholders: `owner`, `collaborator`
- Integrate Socket.IO server and auth handshake
- Define signaling events: `offer`, `answer`, `ice-candidate`, `join-session`, `leave-session`
- Document simple client flow in README for testing signaling

Deliverables:
- `POST /auth/login` returns JWT
- Socket.IO accepts authenticated connections and relays signaling events within session rooms

## Day 4 – Kafka + Worker Skeleton
- Add Kafka/Zookeeper in Docker Compose
- Define topics: `media.ingest`, `media.transcode`, `media.transcribed`
- Implement Kafka producer in API for enqueueing ingest jobs after successful upload metadata write
- Create a separate worker (Node/Bun or plain Docker-based script) that subscribes to `media.ingest`
- Worker validates object presence in S3 and emits `media.transcode` jobs

Deliverables:
- Local Kafka up; API can produce; worker consumes and logs events

## Day 5 – FFmpeg Pipeline (Minimal)
- Add FFmpeg worker container image
- Implement minimal transcode pipeline: normalize audio levels, output `mp3` for audio and `mp4` for video
- Write results to `S3/MinIO` and update `Asset` status in DB
- Emit `media.transcribed` event after success (for next day)

Deliverables:
- Given an input asset in MinIO, worker produces a normalized mp3/mp4 derivative and updates DB

## Day 6 – Whisper Transcription (Flagged)
- Add Whisper/OpenAI integration behind `WHISPER_ENABLED` flag
- Implement `POST /media/transcribe` that enqueues to Kafka; worker fetches and calls Whisper; store transcript JSON and plain text in S3
- Update `Asset` with transcription status and URL(s)
- Basic error/retry strategy for transient failures

Deliverables:
- With `WHISPER_ENABLED=true`, a sample audio asset produces stored transcript

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
- Green tests, updated docs, and a repeatable demo scenario

---

## Success Criteria (End of Week)
- `docker compose up` starts infra (Postgres, Redis, MinIO, Kafka, Prometheus, Grafana)
- `bun run dev` starts API; `/health` and `/metrics` are reachable
- Can create project/session, presign upload, store object in MinIO
- Kafka pipeline moves an uploaded asset through ingest -> transcode -> (optional) transcribe
- Minimal Socket.IO signaling works for session rooms
- Docs clearly explain setup and demo

## Stretch (if time permits)
- Basic OpenAPI (Swagger) spec
- Role-based access control checks on routes
- Simple analytics events table and `/analytics` seed endpoint
- CI (GitHub Actions) running lint, test, typecheck

## Risks & Mitigations
- Whisper rate limiting: use flag, add backoff/retry, allow offline dev without calling API
- Kafka local flakiness: add retry on connect and health checks; provide fallback dev script using in-memory queue (feature flag)
- FFmpeg codec availability: pin image with known codecs; provide sample media for tests

## Daily Checklists
- Health endpoints OK for API and worker
- Docker services healthy (compose ps)
- New env vars documented in `.env.example`
- Tests added/updated for new modules
