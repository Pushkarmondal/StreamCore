# StreamCore

All-in-one backend powering podcast/video recording with AI-generated show notes, automated editing, and cross-platform distribution.

Status: Week-1 MVP planning and scaffolding

## One-line pitch
All-in-one backend powering podcast/video recording with AI-generated show notes, automated editing, and cross-platform distribution.

## Project Documents
- [ROADMAP.md](./ROADMAP.md) — 1-week execution plan and milestones
- [Tasks.md](./Tasks.md) — Live task board and checklists (Week-1)
- [InShort.md](./InShort.md) — High-level overview of what to build

## Tech Stack
- Runtime: Bun 1.0+
- Framework: Express.js 4.18+ with TypeScript
- Database: PostgreSQL 15+
- Cache/Realtime: Redis 7.0+
- Message Queue: Apache Kafka 3.0+
- Realtime: Socket.IO + WebRTC (signaling)
- Media Processing: FFmpeg, WebAssembly (future)
- AI/ML: OpenAI API, Whisper for transcription
- Storage: AWS S3 (local: MinIO) + CloudFront CDN (future)
- Monitoring: Prometheus + Grafana
- Container: Docker + Docker Compose (local) / Kubernetes (future)
- CDN/Distribution: RSS + YouTube/Spotify/Apple APIs (future)


## Core Services (Week-1 scope)
- API Gateway/Monolith (Express + TS on Bun) with modular service boundaries
- Auth (JWT; stub roles)
- Project/Session models in PostgreSQL (with Prisma ORM)
- Socket.IO signaling for WebRTC (no full SFU this week)
- Upload service to S3/MinIO and pre-signed URLs
- Kafka topics and producer/consumer skeletons
- FFmpeg worker container (transcode demo: normalize, mp3/mp4)
- Whisper transcription call pipeline (stub with real API call behind a flag)
- Basic Prometheus metrics and health endpoints

## Project Workflow (End-to-End)

High-level flow from recording to distribution for the Week-1 MVP:

- Capture: Clients establish WebRTC via Socket.IO signaling (no SFU this week) and record locally.
- Upload: Client requests a presigned URL, uploads raw media to S3/MinIO.
- Ingest: API writes asset metadata to Postgres and enqueues a Kafka `media.ingest` job.
- Process: Worker validates object in S3, produces a `media.transcode` job, and runs FFmpeg to create derivatives (e.g., mp3/mp4), storing results back to S3 and updating DB status.
- Transcribe (optional): If `WHISPER_ENABLED=true`, a `media.transcribe` job calls Whisper; transcripts are stored in S3, and DB is updated.
- Distribute (future): RSS feed generation and platform publishing (Spotify/Apple/YouTube) once assets/transcripts are ready.
- Observe: Prometheus scrapes metrics; Grafana dashboards track health and throughput.

```mermaid
flowchart LR
  subgraph Client
    U[User]
    WRTC[WebRTC Capture]
  end

  subgraph API[Express API]
    PRESIGN[Presigned Upload]
    META[Save Asset Metadata]
    KPROD[Kafka Producer]
  end

  subgraph Infra
    S3[(S3/MinIO)]
    PG[(PostgreSQL)]
    REDIS[(Redis)]
    K[Kafka]
  end

  subgraph Workers
    ING[Ingest Handler]
    FFMPEG[FFmpeg Transcoder]
    WHISP[Whisper Transcriber]
  end

  subgraph Observability
    PROM[Prometheus]
    GRAF[Grafana]
  end

  U -->|Signaling| WRTC -->|Offers/Answers| API
  U -->|Request Presign| PRESIGN --> S3
  U -->|Upload Media| S3

  PRESIGN --> META --> PG
  META --> KPROD --> K

  K --> ING -->|validate object| S3
  ING -->|enqueue| K
  K --> FFMPEG -->|derivatives| S3
  FFMPEG -->|status update| PG

  FFMPEG -->|optional enqueue| K --> WHISP
  WHISP -->|transcripts| S3
  WHISP -->|status update| PG

  API -. metrics .-> PROM
  FFMPEG -. metrics .-> PROM
  WHISP -. metrics .-> PROM
  PROM --> GRAF

  classDef optional fill:#eef,stroke:#88f,stroke-width:1px;
  WHISP:::optional
```

## Repository Structure (proposed)
```
/StreamCore
  ├─ src/
  │  ├─ app.ts
  │  ├─ server.ts
  │  ├─ config/
  │  ├─ routes/
  │  ├─ modules/
  │  │   ├─ auth/
  │  │   ├─ recording/
  │  │   ├─ media/
  │  │   ├─ ai/
  │  │   └─ distribution/
  │  ├─ libs/
  │  └─ metrics/
  ├─ prisma/ 
  ├─ docker/
  │  ├─ ffmpeg-worker.Dockerfile
  │  └─ api.Dockerfile
  ├─ deployments/
  │  └─ docker-compose.yml
  ├─ scripts/
  ├─ tests/
  ├─ README.md
  ├─ ROADMAP.md
  ├─ .env.example
  └─ package.json (managed by Bun)
```

## Getting Started

### Prerequisites
- Bun 1.0+
- Docker + Docker Compose
- FFmpeg (optional locally; worker uses container)
- OpenAI API key (for Whisper/OpenAI features)

### Quickstart
1. Clone repository
2. bun install
3. Copy `.env.example` to `.env` and fill values
4. Start infra services:
   - docker compose -f deployments/docker-compose.yml up -d postgres redis zookeeper kafka minio prometheus grafana
5. Start API locally:
   - bun run dev

### Environment Variables (.env)
```
# Server
PORT=4000
NODE_ENV=development

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=streamcore
POSTGRES_USER=streamcore
POSTGRES_PASSWORD=streamcore
DATABASE_URL=postgresql://streamcore:streamcore@localhost:5432/streamcore

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=streamcore-api

# Storage (MinIO locally)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=streamcore
S3_FORCE_PATH_STYLE=true

# AI
OPENAI_API_KEY=
WHISPER_ENABLED=false

# Monitoring
PROMETHEUS_METRICS=true
```

## Scripts (suggested)
- bun run dev: Start API with ts-node/tsx
- bun run build: Type-check and build
- bun run lint: ESLint
- bun run test: Unit tests (Vitest)
- bun run worker: Start FFmpeg/Kafka worker

## API (initial endpoints)
- GET /health
- GET /metrics (Prometheus)
- POST /auth/login (JWT)
- POST /projects
- POST /sessions
- POST /uploads/presign
- POST /media/transcribe (if WHISPER_ENABLED)

## Development Notes
- ORM: Prisma; keep SQL-friendly migrations
- Error handling: typed error helpers + global middleware
- Config: central config module validates env via zod
- Logging: pino

## Security
- Never commit real credentials
- Use IAM roles in cloud; MinIO creds only for local
- Limit presigned URL lifetime and scope

## Testing Strategy (Week-1)
- Unit tests for config, routes, and services
- Integration tests for DB and S3 with local containers

## Contributing
Solo project for now. PRs welcome later.
