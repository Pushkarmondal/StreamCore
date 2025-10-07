# StreamCore

All-in-one backend powering podcast/video recording with AI-generated show notes, automated editing, and cross-platform distribution.

Status: Week-1 MVP — Daily.co recording → FFmpeg processing → S3 distribution

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
- Queue: BullMQ (Redis 7.0+) for background jobs
- Recording: Daily.co (cloud recording + webhooks)
- Media Processing: FFmpeg (worker container)
- AI/ML: OpenAI Whisper (ASR), GPT-4 for notes/chapters
- Storage: AWS S3 (local: MinIO) + CloudFront CDN (later)
- Monitoring: Basic health checks (Prometheus/Grafana optional later)
- Container: Docker + Docker Compose (local) / Kubernetes (later)
- Distribution: RSS + YouTube/Spotify/Apple APIs (later)


## Core Services (Week-1 scope)
- API Monolith (Express + TS on Bun)
- Auth (JWT; stub roles)
- PostgreSQL models: `User`, `Project`, `Recording`, `Asset`
- Daily.co wrapper: create/join rooms; recording webhooks handler
- Storage pipeline: download Daily recording → process → upload to S3/MinIO
- Job queue: BullMQ (Redis) for processing jobs
- FFmpeg worker: audio normalize/enhance, multi-resolution video, thumbnails, format conversions
- AI: Whisper transcription (flag), GPT-4 notes/chapters (flag)
- Health endpoints and minimal metrics

## Project Workflow (End-to-End)

High-level flow from recording to distribution for the Week-1 MVP:

- Record: API creates a Daily.co room; users record via Daily's cloud recording.
- Webhook: Daily.co sends a recording-completed webhook with media URL(s).
- Ingest: API stores metadata in Postgres and enqueues BullMQ processing jobs.
- Process: FFmpeg worker downloads the source, normalizes audio, creates multi-res video, extracts audio, generates thumbnails, and writes outputs to S3/MinIO.
- Transcribe/Notes (optional): Whisper produces transcripts; GPT-4 generates show notes/chapters.
- Distribute: Expose processed files and transcripts. Future: RSS + platform uploads (YouTube/Spotify/Apple).
- Monitor: Health checks and basic metrics.

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web App] 
        B[Mobile App]
        C[Desktop App]
    end
    
    subgraph "Load Balancer & Gateway"
        D[Load Balancer]
        E[API Gateway]
    end
    
    subgraph "Core Services"
        F[User Service]
        G[Recording Service]
        H[Media Processing]
        I[Distribution Service]
        J[Analytics Service]
    end
    
    subgraph "Real-time Layer"
        K[WebRTC Server]
        L[Socket.IO Server]
    end
    
    subgraph "Message Queue"
        M[Apache Kafka]
        N[Processing Workers]
    end
    
    subgraph "AI Services"
        O[OpenAI API]
        P[Whisper Transcription]
        Q[Content Generation]
    end
    
    subgraph "Data Layer"
        R[PostgreSQL]
        S[Redis Cache]
        T[AWS S3]
        U[CloudFront CDN]
    end
    
    subgraph "External Platforms"
        V[Spotify API]
        W[Apple Podcasts]
        X[YouTube API]
    end
    
    subgraph "Monitoring"
        Y[Prometheus]
        Z[Grafana]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    E --> J
    
    G --> K
    G --> L
    
    H --> M
    M --> N
    N --> O
    N --> P
    N --> Q
    
    F --> R
    G --> R
    H --> R
    I --> R
    J --> R
    
    F --> S
    G --> S
    
    H --> T
    T --> U
    
    I --> V
    I --> W
    I --> X
    
    F --> Y
    G --> Y
    H --> Y
    Y --> Z
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
 - Daily.co account + API key (for room creation and webhooks)

### Quickstart
1. Clone repository
2. bun install
3. Copy `.env.example` to `.env` and fill values
4. Start infra services:
   - docker compose -f deployments/docker-compose.yml up -d postgres redis minio
5. Start API locally:
   - bun run dev
6. Start worker locally (FFmpeg + BullMQ):
   - bun run worker

### Environment Variables (.env)
```
# Server
PORT=4000
NODE_ENV=development

# Recording (Daily.co)
DAILY_API_KEY=
DAILY_WEBHOOK_SECRET=

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=streamcore
POSTGRES_USER=streamcore
POSTGRES_PASSWORD=streamcore
DATABASE_URL=postgresql://streamcore:streamcore@localhost:5432/streamcore

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

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
GPT_NOTES_ENABLED=false

# YouTube (optional for Day 5)
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=http://localhost:4000/oauth2/callback

# Monitoring
PROMETHEUS_METRICS=true
```

## Scripts (suggested)
- bun run dev: Start API with ts-node/tsx
- bun run build: Type-check and build
- bun run lint: ESLint
- bun run test: Unit tests (Vitest)
- bun run worker: Start FFmpeg worker (BullMQ/Redis)

## API (initial endpoints)
- GET /health
- GET /metrics (Prometheus)
- POST /auth/login (JWT)
- POST /projects
- POST /recordings/rooms (Daily: create room)
- POST /webhooks/daily (Daily: recording-completed handler)
- POST /uploads/presign (optional; if you also support client uploads)
- POST /media/transcribe (flagged)
- GET /jobs/:id/status (processing status)

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
