# SPMVV EDUBOT

> AI-powered college query assistant for Sri Padmavati Mahila Visvavidyalayam

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+pgvector-336791?logo=postgresql)](https://github.com/pgvector/pgvector)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

SPMVV EDUBOT is a full-stack RAG (Retrieval Augmented Generation) chatbot that answers college queries using ingested PDF documents. It combines semantic vector search with BM25 keyword search and CrossEncoder reranking to deliver accurate, context-grounded answers with streaming responses.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [RAG Pipeline](#rag-pipeline)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| **RAG Chat** | Semantic search (pgvector) + BM25 keyword search + CrossEncoder reranking + streaming LLM generation via SSE |
| **Chat Sessions** | Persistent conversation history with ChatGPT-style sidebar UI |
| **Dynamic RBAC** | 3 default roles (superadmin, faculty, student), 10 permissions; superadmin can create custom roles and modify grants |
| **Admin Dashboard** | System stats, live service health monitoring (Ollama, Reranker, Database) |
| **User Management** | Search, filter, role assignment, activate/deactivate, delete with last-superadmin protection |
| **Document Management** | PDF upload with categorization (knowledge base / subject PDFs), restricted flag, on-demand ingestion with embedding generation |
| **Settings Panel** | 17+ configurable settings stored in DB — Ollama URL, AI models, RAG parameters, system prompt, branding, auth domains — no restart required |
| **Dual AI Provider** | Switch between Ollama (local, mistral) and Z.AI (cloud, GLM-4.7) from the admin settings panel |
| **Subject PDF Search** | Keyword + semantic matching to find and download question papers |
| **Role-Based Filtering** | Restricted documents are hidden from student-role users |
| **Email Domain Control** | Superadmin manages which email domains are allowed to register |
| **Data Migration** | Script to import data from the original Electron desktop app |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Compose Network                  │
│                                                             │
│  ┌──────────────┐    ┌─────────────────┐                   │
│  │  Next.js :3000│───▶│ PostgreSQL :5432│                   │
│  │  (App + API) │    │  + pgvector     │                   │
│  └──────┬───────┘    └─────────────────┘                   │
│         │                                                   │
│         ├──────────▶ ┌─────────────────┐                   │
│         │            │  Ollama :11434   │                   │
│         │            │  nomic-embed-text│                   │
│         │            │  mistral        │                   │
│         │            └─────────────────┘                   │
│         │                                                   │
│         └──────────▶ ┌─────────────────┐                   │
│                      │ Reranker :8000   │                   │
│                      │ Python FastAPI   │                   │
│                      │ CrossEncoder    │                   │
│                      └─────────────────┘                   │
│                                                             │
│  Only port 3000 exposed externally                          │
└─────────────────────────────────────────────────────────────┘
```

```mermaid
graph TD
    A[User Query] --> B{Subject PDF Check}
    B -->|Match found| C[Return PDF download link]
    B -->|No match| D[Semantic Search via pgvector]
    B -->|No match| E[BM25 Keyword Search]
    D --> F[Merge + Deduplicate results]
    E --> F
    F --> G[CrossEncoder Reranking]
    G --> H{AI Provider}
    H -->|Local| I[Ollama / mistral]
    H -->|Cloud| J[Z.AI / GLM-4.7]
    I --> K[Streaming SSE Response]
    J --> K
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Radix UI |
| Auth | NextAuth.js v4 (JWT, Credentials Provider) |
| Database | PostgreSQL 16 + pgvector extension |
| ORM | Prisma 5.22 |
| AI Generation | Ollama (local, mistral) / Z.AI (cloud, GLM-4.7) — admin-switchable |
| Embeddings | Ollama nomic-embed-text (768 dimensions) |
| Reranking | Python FastAPI sidecar — CrossEncoder ms-marco-MiniLM-L-6-v2 |
| Keyword Search | BM25 (custom TypeScript implementation) |
| Containerization | Docker Compose (4 services) |

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ravitejarenangi/spmvv.git
cd spmvv
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
NEXTAUTH_SECRET=<random-32-char-string>
SUPERADMIN_EMAIL=admin@gmail.com
SUPERADMIN_PASSWORD=<strong-password>
```

### 3. Start all services

```bash
docker compose up --build -d
```

This starts four services: `nextjs`, `postgres`, `ollama`, and `reranker`.

### 4. Run database migrations and seed

```bash
docker compose exec nextjs npx prisma db push
docker compose exec nextjs npx prisma db seed
```

The seed creates default roles, permissions, settings, and the superadmin account.

### 5. Pull AI models

```bash
docker compose exec ollama ollama pull nomic-embed-text
docker compose exec ollama ollama pull mistral
```

### 6. Open the app

Navigate to [http://localhost:3000](http://localhost:3000)

**Default superadmin credentials:**
- Email: value of `SUPERADMIN_EMAIL` in `.env` (default: `admin@gmail.com`)
- Password: value of `SUPERADMIN_PASSWORD` in `.env`

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | postgresql://edubot:edubot_password@postgres:5432/spmvv_edubot | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | change-me | Random secret for JWT signing (min 32 chars) |
| `NEXTAUTH_URL` | Yes | http://localhost:3000 | Public URL of the Next.js app |
| `RERANKER_URL` | Yes | http://reranker:8000 | Internal URL of the reranker sidecar |
| `SUPERADMIN_EMAIL` | Yes | admin@gmail.com | Email for the seeded superadmin account |
| `SUPERADMIN_PASSWORD` | Yes | change-me | Password for the seeded superadmin account |
| `SUPERADMIN_NAME` | No | Super Admin | Display name for the seeded superadmin |

---

## Project Structure

```
spmvv-edubot-web/
├── docker-compose.yml          # 4-service orchestration
├── Dockerfile                  # Next.js production image
├── .env.example                # Environment variable template
├── prisma/
│   ├── schema.prisma           # 9 models + pgvector extension
│   └── seed.ts                 # Roles, permissions, settings, superadmin
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page
│   │   ├── about/              # About page
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── chat/               # Chat UI with session sidebar
│   │   ├── admin/              # Admin panel
│   │   │   ├── page.tsx        # Dashboard + service health
│   │   │   ├── users/          # User management
│   │   │   ├── roles/          # Role + permission management
│   │   │   ├── documents/      # Document upload + ingestion
│   │   │   └── settings/       # App settings panel
│   │   └── api/                # REST + SSE API routes
│   │       ├── auth/           # NextAuth endpoints
│   │       ├── chat/           # Chat + session endpoints
│   │       ├── admin/          # Admin CRUD endpoints
│   │       └── documents/      # Upload + ingestion endpoints
│   ├── lib/                    # Core libraries
│   │   ├── rag.ts              # RAG pipeline orchestrator
│   │   ├── generation.ts       # Ollama + Z.AI dual provider
│   │   ├── embeddings.ts       # Ollama nomic-embed-text client
│   │   ├── bm25.ts             # BM25 keyword search
│   │   ├── reranker.ts         # CrossEncoder HTTP client
│   │   ├── ingest.ts           # PDF chunking + embedding
│   │   ├── settings.ts         # DB-backed settings with cache
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── permissions.ts      # RBAC helpers
│   │   └── db.ts               # Prisma client singleton
│   └── components/             # React components
│       ├── chat/               # Chat UI, message renderer, session list
│       ├── admin/              # Admin panel components
│       ├── layout/             # Navigation, sidebar
│       ├── auth/               # Login/register forms
│       └── ui/                 # shadcn/ui base components
├── reranker/                   # Python FastAPI sidecar
│   ├── main.py                 # CrossEncoder reranking endpoint
│   ├── Dockerfile
│   └── requirements.txt
├── scripts/
│   └── migrate-data.ts         # Electron app data migration
└── uploads/                    # PDF file storage (Docker volume)
```

---

## RAG Pipeline

```
User Query
    │
    ▼
Subject PDF Check (keyword + semantic match)
    │
    ├── Match found ──▶ Return PDF download link
    │
    └── No match ──▶ Parallel retrieval
                        ├── Semantic Search (pgvector cosine similarity)
                        └── BM25 Keyword Search
                              │
                              ▼
                        Merge + Deduplicate chunks
                              │
                              ▼
                        CrossEncoder Reranking
                        (ms-marco-MiniLM-L-6-v2)
                              │
                              ▼
                        LLM Generation (streaming SSE)
                        ├── Ollama / mistral  (local)
                        └── Z.AI / GLM-4.7   (cloud)
```

Retrieval parameters (chunk count, similarity threshold, reranking top-k) are configurable via the admin settings panel without restarting the application.

---

## Database Schema

9 Prisma models backed by PostgreSQL 16 with the pgvector extension:

| Model | Description |
|---|---|
| `Role` | Named roles (superadmin, faculty, student, custom) |
| `RolePermission` | Permission grants per role (10 built-in permissions) |
| `User` | Accounts with bcrypt-hashed passwords and role assignment |
| `ChatSession` | Conversation containers per user |
| `ChatMessage` | Individual messages (user / assistant) within sessions |
| `Document` | Uploaded PDFs with category, subject, restricted flag |
| `DocumentChunk` | PDF text chunks with 768-dim pgvector embeddings |
| `Setting` | Key-value app configuration stored as JSONB |
| `AllowedDomain` | Email domains permitted for self-registration |

---

## Screenshots

> Screenshots coming soon. To contribute screenshots, open a pull request adding images to `public/screenshots/` and updating this section.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

Please ensure your changes work with the Docker Compose setup before submitting.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  Made with love for Sri Padmavati Mahila Visvavidyalayam
  <br/>
  <a href="https://github.com/ravitejarenangi/spmvv">github.com/ravitejarenangi/spmvv</a>
</div>
