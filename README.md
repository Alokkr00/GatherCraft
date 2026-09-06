# 🍸 GatherCraft — Bring People Together. On Purpose.

> The purpose-first operating system for hosting memorable, intentional gatherings. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, and Neon Serverless PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20-2d3748?logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-00e599?logo=postgresql)](https://neon.tech/)
[![Playwright Tests](https://img.shields.io/badge/Playwright-5%2F5_Passing-45ba4b?logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

GatherCraft is a purpose-first party and gathering planner. Unlike conventional tools that treat hosting as an administrative spreadsheet chore of headcount tallies and budgets, GatherCraft centers every gathering around a clear, dispute-resolving reason for gathering: **Purpose first, logistics second.**

---

## 🧭 The Core Lifecycle

GatherCraft guides hosts through a 6-phase journey inspired by Priya Parker's *The Art of Gathering* and behavioral science:

```
① PURPOSE  ──>  ② PEOPLE  ──>  ③ PLAN  ──>  ④ PREP  ──>  ⑤ HOST  ──>  ⑥ REFLECT
Why are we       Who should     What should   What needs     What happens   Did it accomplish
gathering?       be there?      happen?       to be ready?   right now?     its purpose?
```

1. **Purpose**: Start with the *Why*. Transform vague ideas into clear, focused purpose statements and tangible success criteria.
2. **People (Guest Circle)**: Share warm, emotional invitations via magic links with 1-tap conversational RSVP and dietary summaries.
3. **Plan (Run-of-Show)**: Structure the gathering's rhythm with timed milestones, planned peak moments, and an intentional closing ritual.
4. **Prep (Event Preparation Center)**: Consolidated workspace unifying supplies, host setup tasks, and budget targets without cognitive overload.
5. **Host (Day-of Live Mode)**: Smartphone-optimized execution HUD acting as an external prefrontal cortex—featuring doorway duty check-ins, Now/Next activity countdowns, and timely guidance.
6. **Reflect (Retrospective & Gratitude)**: Purpose fulfillment review and frictionless, personalized thank-you notes to consolidate lasting memories.

---

## 🗄️ Database & Architecture (Prisma ORM + Neon PostgreSQL)

GatherCraft utilizes an enterprise-grade, relational data architecture powered by **Prisma ORM** and **Neon Cloud Serverless PostgreSQL**, replacing earlier client-side LocalStorage and prototype Firebase implementations.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Tier (Browser)                    │
│  - Next.js 14 App Router UI (React Server & Client Components)│
│  - Standalone Mobile PWA (Manifest + iOS cover viewport)    │
│  - Local Offline Sync Queue (localStorage resilience layer) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Application Tier (Next.js App Router)           │
│  - Route Handlers: /api/events, /api/rsvp, /api/invite, etc.│
│  - Zod Runtime Schema Validation & Input Sanitization       │
│  - Privacy Layer: Public Projection DTOs (Zero Guest Leaks) │
│  - Gemini AI Engine (Graceful heuristic offline fallbacks)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma Client (Type-Safe)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Persistence Tier (Authoritative ACID)           │
│  - Neon Serverless PostgreSQL with PgBouncer Connection Pool │
│  - Atomic Multi-Row Transactions (prisma.$transaction)      │
│  - Foreign Key Constraints & Cascade Delete Guarantees       │
└─────────────────────────────────────────────────────────────┘
```

### Relational Schema Models

The relational schema (`prisma/schema.prisma`) models the complete social event domain:

* **`User`**: Account identity supporting event ownership and multiple co-host relationships.
* **`Event`**: Core gathering record containing raw purpose, refined statement, privacy flags, timing, capacity, theme gradient, and venue details.
* **`Guest`**: Relational guest profile with RSVP states (`yes`, `no`, `maybe`, `waitlist`, `pending`), roles (`guest`, `co-host`, `helper`, `vip`), dietary requirements, host-only notes, and timestamped check-in tracking (`checkInAt`).
* **`TimelineItem`**: Run-of-Show schedule entries with minute offsets (`+0m`, `+45m`, `+90m`), estimated duration, assignee, and completion status.
* **`Task` / `BudgetItem` / `ShoppingItem`**: Operational preparation entities linked directly via foreign keys with cascade deletion.
* **`Retrospective`**: Post-event reflection storing success criteria scores, host memories, and gratitude dispatches.

### Dual-Layer Persistence Strategy
1. **Authoritative Cloud Tier (Neon PostgreSQL):** All mutations and data reads flow through `/api/*` endpoints backed by Prisma transactions. Data is ACID-compliant and permanently persisted in PostgreSQL.
2. **Event-Night Resilience Tier (`lib/offlineSync.ts`):** On the night of the event, venue Wi-Fi or cellular connections can be intermittent. GatherCraft captures check-ins optimistically in local state, queues pending mutations in an offline queue, and automatically flushes them to Neon PostgreSQL as soon as connectivity resumes.

### Atomic Concurrency & Capacity Protection
GatherCraft prevents event overbooking using Prisma's transactional isolation (`prisma.$transaction`). When a guest submits an RSVP via their magic link:
1. An atomic read queries the event capacity and sums confirmed guests plus their approved plus-ones.
2. If `currentConfirmed + 1 + requestedPlusOnes > event.capacity`, the RSVP status is automatically assigned to `'waitlist'`.
3. The guest record is written atomically, eliminating race conditions under concurrent submissions.

### Zero Guest Contact Leaks
The public invitation endpoint (`/api/invite/[id]`) returns a strictly pruned `PublicInviteView` projection. It aggregates confirmed headcounts for capacity calculations but completely strips out guest emails, phone numbers, and private notes, guaranteeing complete guest privacy.

---

## ✨ Key Features

### 🎯 Purpose Engine & Intelligent Blueprints
* **Invisible Intelligence**: Conversational assistance (*"Help Me Articulate This"*) powered by Google Gemini 1.5 Flash turns rough thoughts into refined purpose statements without technical jargon.
* **Balanced Blueprints**:
  * **To Spark New Connections** • `Social Mixer` — *High-energy introductions & dynamic conversation*
  * **To Deepen Friendships** • `Intimate Dinner` — *Seated dinner designed for meaningful conversation & toasts*
  * **To Simply Unwind** • `Casual Hangout` — *Low-pressure drop-in format for friends*
  * **To Celebrate a Milestone** • `Celebration` — *Memorable toasts, music & shared photos*
* **Intentional Endings**: Encourages a defined end time and closing ritual so gatherings conclude on a high note before energy declines.

### 💌 Warm, Conversational Invitations
* **Emotional Invitations**: Public invite pages (`/invite/[id]`) feel like personal invitations, not administrative CRM forms.
* **1-Tap RSVP**: Fast responses with conversational options: *"I'll be there! ✨"*, *"Tentative ⏳"*, and *"Can’t make it 💌"*.
* **Custom Dietary & Plus-One Capture**: Captures dietary constraints, accessibility notes, and companion counts directly in the flow.

### 📋 Streamlined 3-Pillar Workspace
Replaced the cluttered 5-tab "Jira for parties" experience with three natural host pillars:
1. **Overview & Guest Circle**: Confirmed friends, dietary restrictions summary, co-hosts, and shareable invite links.
2. **Run-of-Show Timeline**: Visual milestone planner with timed offsets (`+0m`, `+30m`, `+90m`).
3. **Event Prep & Supplies**: A unified preparation hub integrating shopping checklists, host setup tasks, and budget tracking.

### 📱 Smartphone-Optimized Live Mode HUD
* **Doorway Duty**: Instant, glanceable arrival check-in with large thumb-friendly tap targets (`min-h-[48px]`, `touch-manipulation`).
* **Now / Next HUD**: High-contrast phase indicators and countdown timers so hosts never lose track of timing.
* **Host Guidance & Generous Authority**: Timely suggestions factoring in success criteria, doorway greetings, and conversation pacing.
* **Offline Resilience**: Local check-in queue ensures seamless operation even if venue Wi-Fi or cellular signal drops.
* **PWA Home Screen Support**: Standalone web app capability with dark theme styling.

### 🥂 Gratitude & Retrospective
* **Purpose Fulfillment Check**: Direct reflection on whether the gathering met its stated success criteria.
* **Personalized Thank-You Notes**: 1-click personalized gratitude drafting across multiple tones (*Warm*, *Fun*, *Short*).

---

## 🛠️ Tech Stack

* **Framework**: Next.js 14 (App Router, Server & Client Components, Route Handlers)
* **Language**: TypeScript (Strict mode)
* **Styling**: Tailwind CSS + custom glassmorphic design system
* **Database**: Neon Cloud Serverless PostgreSQL (with connection pooling)
* **ORM**: Prisma ORM 5.20
* **Validation**: Zod (Runtime API schema validation)
* **Intelligence**: Google Gemini 1.5 Flash (with built-in heuristic offline fallbacks)
* **Testing**: Playwright End-to-End Suite (Multi-device sync & onboarding funnel)

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.17+
* npm or yarn
* A Neon PostgreSQL account (or any standard PostgreSQL database instance)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Alokkr00/GatherCraft.git
cd GatherCraft
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Cloud PostgreSQL Connection String (with SSL & pooling)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Optional: Google Gemini API Key for AI purpose articulation & coaching
GEMINI_API_KEY="your_gemini_api_key"
```

> **Note**: If `GEMINI_API_KEY` is omitted, GatherCraft automatically falls back to curated built-in prompts without error.

### 3. Initialize Database & Seed

```bash
# Push Prisma schema to your PostgreSQL database
npx prisma db push

# Generate the type-safe Prisma client
npx prisma generate

# Pre-populate sample gatherings and templates
npm run db:seed
```

You can open Prisma Studio at any time to inspect your database records visually:
```bash
npx prisma studio
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

GatherCraft includes comprehensive Playwright end-to-end tests covering the full host and guest lifecycles:

```bash
# Run production build and type-checking
npm run build

# Run automated end-to-end test suite
npx playwright test
```

### Test Coverage (5/5 Passing)
1. **Dashboard & Sample Load:** Verifies dashboard initialization and sample gathering cards.
2. **First-Time Host Funnel:** Brand-new host landing page prompt $\rightarrow$ wizard pre-fill $\rightarrow$ workspace creation.
3. **Multi-Device Creation & RSVP Sync:** 3-step wizard creation, magic-link generation, and cross-browser guest RSVP sync with atomic capacity verification.
4. **Day-of Live Mode HUD:** PWA viewport, doorway arrival check-in mechanics, and live status indicator.
5. **Post-Event Aftermath & Retrospective:** Goal fulfillment checks and personalized thank-you generation.

---

## 📚 Documentation & Field Guides

* [`USER_TESTING_GUIDE.md`](USER_TESTING_GUIDE.md): 5–10 real host testing protocol with unguided scenarios and System Usability Scale (SUS) rubric.
* [`DEMO_STORY.md`](DEMO_STORY.md): Complete 5-act narrative walkthrough script and presentation storyboard.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
