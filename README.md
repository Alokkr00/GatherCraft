# 🍸 GatherCraft

> A purpose-first web app for planning, hosting, and remembering social gatherings.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20-2d3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-00e599?logo=postgresql)](https://neon.tech/)
[![Playwright Tests](https://img.shields.io/badge/Playwright-5%2F5_Passing-45ba4b?logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What is GatherCraft?

Most event tools focus purely on logistics—spreadsheets, budgets, and headcount tallies. They tell you what to buy, but never ask **why** you're gathering.

Inspired by Priya Parker's book *The Art of Gathering*, GatherCraft centers event planning around a clear **purpose statement**. When a host knows *why* they're bringing people together, decisions about who to invite, what to do, and when to end become much simpler.

---

## Features

### 1. Purpose-First Event Creation
- **Intention Prompt**: Start by describing why you want to gather (e.g. *"To celebrate Maya's promotion and bring close friends together"*).
- **Optional AI Polish**: Uses Google Gemini (with an offline fallback) to refine rough ideas into distinct purpose statements and concrete success criteria.
- **Starter Blueprints**: Pre-built templates for common formats (Social Mixer, Intimate Dinner, Casual Hangout, Milestone Celebration).

### 2. Guest Invitations & RSVP (`/invite/[id]`)
- **Magic-Link Invites**: Shareable links where guests can RSVP with no account required.
- **Progressive RSVP**: Selecting "Can't make it" collapses the form to a simple note for the host. Selecting "I'll be there" opens fields for dietary restrictions, plus-ones, and contact info.
- **Calendar Integration**: 1-click download of `.ics` files for Apple Calendar / Outlook, plus a direct Add to Google Calendar link.
- **Photo Privacy Selection**: Guests can choose their photo comfort level (Open, Circle Only, or Ghost Mode).
- **Overbooking Protection**: Uses database row locking (`SELECT FOR UPDATE`) to prevent capacity race conditions during concurrent RSVPs.

### 3. Event Workspace (`/events/[id]`)
- **Guest Circle**: View confirmed guests, pending invites, plus-ones, and an aggregated summary of dietary requirements.
- **Run-of-Show Timeline**: Drag-and-drop schedule with milestone offsets (`+0m`, `+30m`, `+60m`) to plan the flow of the evening and set a clear end time.
- **Prep & Supplies**: Checklists for shopping items, setup tasks, and budget tracking.

### 4. Day-of Live Mode (`/events/[id]/live`)
- **Mobile-Optimized Screen**: Designed for the host's phone during the party.
- **Doorstep Check-In**: 1-tap check-in buttons with unchecked guests sorted to the top. Works offline and syncs when connection returns.
- **Run-of-Show HUD**: Visual indicator showing current phase and time remaining.
- **Host Megaphone & Chat**: Single-thread group chat with a host announcement toggle (`📢 HOST BROADCAST`).
- **Ambient Wall (`/events/[id]/wall`)**: Fullscreen photo slideshow designed for a TV or tablet in the living room.

### 5. Post-Event Aftermath (`/events/[id]/aftermath`)
- **Retrospective**: Reflect on whether the gathering met its purpose (*"What worked well?"*, *"What to improve next time?"*).
- **Thank-You Note Generator**: 1-click personalized thank-you message drafts for each guest based on selected tone (Warm, Fun, Short).
- **Memory Capsule (`/capsule/[token]`)**: A public summary page with the host's reflection quote, photo gallery, and guest circle. Guests can click "Remix Blueprint" to start planning their own gathering using the same format.

### 6. Media Storage & Privacy
- **S3-Compatible Storage**: Supports Supabase Storage, Cloudflare R2, or AWS S3 via presigned upload URLs.
- **Local Fallback**: If cloud storage credentials are not provided, an automatic local mock handler (`/api/mock-upload`) is used so uploads work out of the box in development.
- **Self-Delete**: Guests can soft-delete any photo they appear in with 1 tap.

### 7. SEO & Link Sharing
- **Dynamic OpenGraph Images (`/api/og`)**: Generates custom 1200×630 preview images on the fly with event title, date, and purpose when links are shared on WhatsApp, iMessage, Slack, or Twitter.
- **Sitemap & Robots**: Includes `/sitemap.xml` and `/robots.txt` for search engine indexing.

---

## Tech Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 14.2.5 (App Router, Server & Client Components) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | PostgreSQL (hosted on Neon Serverless) |
| **ORM** | Prisma ORM 5.20 |
| **Storage** | S3-compatible (Supabase S3 / Cloudflare R2 / AWS S3) via `@aws-sdk/client-s3` |
| **Testing** | Playwright (End-to-End browser tests) |
| **Icons** | Lucide React |

---

## Project Structure

```
├── app/
│   ├── api/                   # Route handlers (events, rsvp, chat, media, og)
│   │   ├── events/            # CRUD operations for gatherings
│   │   ├── rsvp/              # Atomic RSVP submission & capacity check
│   │   ├── mock-upload/       # Local development storage fallback
│   │   └── og/                # Dynamic edge OpenGraph image generator
│   ├── events/
│   │   ├── create/            # Event creation wizard
│   │   └── [id]/              # Event workspace (tabs: overview, timeline, prep)
│   │       ├── live/          # Day-of host HUD & check-in
│   │       ├── aftermath/     # Post-event retrospective & thank-you notes
│   │       ├── edit/          # Event settings editor
│   │       └── wall/          # Ambient slideshow for TV displays
│   ├── invite/[id]/           # Public guest invitation & RSVP page
│   ├── capsule/[token]/       # Public post-event memory capsule
│   ├── layout.tsx             # Root layout with SEO metadata
│   ├── robots.ts              # /robots.txt generator
│   └── sitemap.ts             # /sitemap.xml generator
├── components/                # Shared React UI components
├── lib/
│   ├── prisma.ts              # Prisma database client
│   ├── storage.ts             # Local storage caching & helpers
│   ├── templates.ts           # Starter gathering blueprints
│   ├── types.ts               # Core TypeScript data models
│   └── server/
│       ├── store.ts           # Database query functions & transactions
│       ├── guard.ts           # Host & co-host authorization checks
│       ├── s3.ts              # S3 presigned URL generation & verification
│       └── rateLimit.ts       # In-memory IP rate limiter
├── prisma/
│   ├── schema.prisma          # Database schema (User, Event, Guest, etc.)
│   └── seed.ts                # Sample events seed script
└── e2e/
    └── party-lifecycle.spec.ts # Playwright end-to-end test suite
```

---

## Getting Started

### Prerequisites
- Node.js 18.17 or higher
- A PostgreSQL database (e.g. free tier on [Neon](https://neon.tech) or local Postgres)

### 1. Clone the repository

```bash
git clone https://github.com/Alokkr00/GatherCraft.git
cd GatherCraft
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@your-neon-endpoint.neon.tech/neondb?sslmode=require"

# Base URL for metadata and OpenGraph images
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Google Gemini API key (for purpose articulation assistance)
# If omitted, curated fallback suggestions are used automatically.
GEMINI_API_KEY=""

# Optional: S3-compatible storage (Supabase S3 / Cloudflare R2 / AWS S3)
# If omitted, uploads default to local mock storage in development.
S3_ENDPOINT=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
S3_BUCKET_NAME="gathercraft-media"
S3_PUBLIC_DOMAIN=""
```

### 3. Setup the database

```bash
# Push Prisma schema to your database
npx prisma db push

# Generate the Prisma client
npx prisma generate

# Seed sample events
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Tests

GatherCraft uses Playwright for end-to-end testing:

```bash
# Build the application first (Playwright tests run against the production build)
npm run build

# Run all E2E tests
npm test
```

The test suite verifies:
1. Dashboard and sample events load
2. New host onboarding flow (prompt $\rightarrow$ wizard $\rightarrow$ workspace)
3. 3-step wizard creation and cross-browser RSVP synchronization
4. Day-of Live Mode check-in and megaphone chat
5. Post-event retrospective and memory capsule creation

---

## License

[MIT](LICENSE)
