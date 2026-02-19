# TheKotlin.com

A professional knowledge database about Kotlin for software developers and architects.

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript, App Router)
- **Backend**: Spring Boot 3 (Kotlin, Gradle)
- **Database**: PostgreSQL 16

## Getting Started

### Prerequisites

- JDK 17+
- Node.js 18+
- Docker & Docker Compose

### Quick Start

```bash
# Start PostgreSQL
docker compose up -d postgres

# Start backend
cd backend && ./gradlew bootRun

# Start frontend (in another terminal)
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
thekotlin.com/
├── frontend/          # Next.js application
├── backend/           # Spring Boot API
├── docker-compose.yml # Development services
└── README.md
```
