# 🍸 GatherCraft — Bring People Together. On Purpose.

> The purpose-first operating system for hosting memorable, intentional gatherings. Inspired by Priya Parker's *The Art of Gathering* ("Intent → Presence → Memory"). Built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, Neon Serverless PostgreSQL, and Cloudflare R2 / S3 Storage.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4_Champagne_Nocturne-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20_ACID-2d3748?logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud_Pooled-00e599?logo=postgresql)](https://neon.tech/)
[![Cloud Storage](https://img.shields.io/badge/Storage-S3_%2F_Cloudflare_R2-f38020?logo=cloudflare)](https://developers.cloudflare.com/r2/)
[![SEO & OpenGraph](https://img.shields.io/badge/SEO-Dynamic_Edge_OG_%2B_Sitemap-8b5cf6)](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
[![Playwright Tests](https://img.shields.io/badge/Playwright-5%2F5_Passing-45ba4b?logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 💡 The Core Philosophy: Purpose First, Logistics Second

Conventional event planning tools treat hosting as an administrative chore: spreadsheets, headcount tallies, and receipt tracking. They answer **what** to buy, but never **why** anyone should care.

GatherCraft is built on a different thesis: **Every gathering should have a clear, dispute-resolving purpose.**

> *"A gathering begins when you define its purpose. If you cannot articulate why you are meeting, you will inevitably default to the conventional forms."*
> — Priya Parker, *The Art of Gathering*

GatherCraft replaces sterile dashboards with an intentional, 6-phase journey that reduces host cognitive overload while protecting host presence.

---

## 🧭 The 6-Phase Gathering Lifecycle

```
① PURPOSE  ──>  ② PEOPLE  ──>  ③ PLAN  ──>  ④ PREP  ──>  ⑤ HOST  ──>  ⑥ REFLECT
Why are we       Who should     What should   What needs     What happens   Did it accomplish
gathering?       be there?      happen?       to be ready?   right now?     its purpose?
```

1. **Purpose Engine**: Transform vague party ideas into a crisp, disputable purpose statement with measurable success criteria. Conversational AI (*"Help Me Articulate This"*) assists when you need guidance.
2. **People & Guest Circle**: Warm, emotional invitations delivered via magic links (`/invite/[id]`). Progressive 2-step RSVP disclosure collapses on decline; full disclosure captures dietary needs, plus-ones, and photo comfort.
3. **Plan (Run-of-Show)**: Visual timeline with timed offsets (`+0m`, `+45m`, `+90m`), sociopetal conversation cues, and an intentional closing ritual.
4. **Prep (Event Preparation Center)**: Consolidated workspace unifying supplies, host setup tasks, and budget targets without cognitive overload.
5. **Host (Day-of Live Mode)**: Smartphone-optimized execution HUD acting as an external prefrontal cortex—featuring doorstep thumb-zone check-ins, Now/Next activity countdowns, and host guidance.
6. **Reflect (Aftermath & Memory Capsule)**: Purpose fulfillment check, personalized 1-tap gratitude texts, and a public post-event Memory Capsule (`/capsule/[token]`) with 1-click blueprint remixing.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Tier (Browser & PWA)              │
│  - Next.js 14 App Router UI (React Server & Client Components)│
│  - Standalone Mobile PWA (Manifest + iOS 100dvh cover)      │
│  - Client-Side Compressor (2048px WebP @ 82% + 16px LQIP)   │
│  - Offline Check-In & Media Queues (IndexedDB + LocalStorage)│
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTP / JSON API              │ Direct Presigned PUT
               ▼                              ▼
┌──────────────────────────────────────────┐  ┌───────────────┐
│   Application Tier (Next.js App Router)  │  │ Storage Tier  │
│  - Routes: /api/events, /api/rsvp, etc.  │  │ (Cloudflare   │
│  - Dynamic Edge OpenGraph: /api/og       │  │  R2 / S3)     │
│  - Robots & Sitemap: /robots.txt, etc.   │  │               │
│  - 3-Phase State Machine Chat            │  │ - $0 Egress   │
│  - Privacy Shield: 1-Tap "Remove Me" API │  │ - Direct PUT  │
│  - Viral Loop: /capsule/[token] remix    │  │ - Instant CDN │
└──────────────────────┬───────────────────┘  └───────────────┘
                       │ Prisma Client (Type-Safe)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│             Persistence Tier (Authoritative ACID)           │
│  - Neon Serverless PostgreSQL with PgBouncer Connection Pool │
│  - Row-Level Pessimistic Locking (`SELECT FOR UPDATE`)      │
│  - Atomic Multi-Row Transactions (prisma.$transaction)      │
│  - Foreign Key Constraints & Cascade Delete Guarantees       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Production Hardening & Engineering Highlights

### 1. Atomic RSVP Row Locking (Anti-Overbooking)
In high-concurrency scenarios (e.g. a popular party link shared in a group chat), multiple guests might submit RSVPs simultaneously. GatherCraft executes capacity checks within a PostgreSQL transaction with row-level pessimistic locking:
```sql
SELECT id FROM "Event" WHERE id = $1 FOR UPDATE;
```
Direct database aggregation (`_count` + `_sum.plusOnesActual`) guarantees that if capacity is exceeded, subsequent attendees are atomically placed on the waitlist without race conditions.

### 2. Strict Host Authorization Guards
Every mutation (`/api/events/[id]/*`) validates identity through `requireEventAccess(eventId, userId, role)`, checking event ownership and cryptographic co-host tokens. No master backdoors or unauthenticated sample bypasses exist.

### 3. Offline-Resilient Doorstep Arrival Sync
Doorstep check-in is the critical moment of any gathering. GatherCraft features a dedicated arrival check-in endpoint (`PATCH /api/events/[id]/guests/[guestId]/checkin`) that requires zero redundant payload data. If the venue loses Wi-Fi, check-ins are queued locally and flushed automatically upon reconnection.

### 4. Mobile Safari & iOS Ergonomics
- **No Virtual Keyboard Auto-Zoom**: Enforces `font-size: 16px !important` on inputs below 640px viewport to prevent iOS Safari auto-zoom shifts.
- **Dynamic Viewport Units**: Built with `min-height: 100dvh` to handle mobile browser address bar retraction.
- **Doorstep Thumb Zone**: The check-in roster sits at the very top of the screen with `touch-manipulation` and minimum 48px touch targets for effortless one-handed use.
- **GPU Texture Recycling**: Media compression uses explicit `try/finally` blocks with `createImageBitmap.close()` and canvas dimension resets to deallocate WebKit GPU memory.

---

## 🎨 Champagne Nocturne Design System

GatherCraft uses a bespoke design aesthetic crafted for social celebration:
- **Editorial Typography**: Uses **Newsreader** (Google Fonts editorial serif) for the signature `.purpose-quote` class paired with **Outfit** and **Plus Jakarta Sans** for clean readability.
- **Atmospheric Glow**: Ambient background gradients (`var(--champagne-*)`, `var(--indigo-glow)`, `var(--amber-glow)`) create depth without distracting from content.
- **Bespoke Micro-Badges**: Structured CSS badges replace raw emojis for accessibility and visual elegance:
  - `.purpose-badge`: Pinned intent eyebrow indicator.
  - `.consent-open`, `.consent-circle`, `.consent-ghost`: Visual Consent spectrum tags.

---

## 🌐 Search Engine Optimization (SEO) & Social Graph

- **Edge Dynamic OpenGraph (`/api/og`)**: Generates high-resolution (1200×630px) dynamic social preview cards on edge runtime, rendering custom event titles, purposes, and dates when links are shared on iMessage, WhatsApp, Slack, and Twitter.
- **Dynamic Invite Metadata (`/invite/[id]`)**: Automatically extracts the gathering's title and public purpose for contextual link unfurling.
- **Dynamic Capsule Metadata (`/capsule/[token]`)**: Displays post-event retrospective hero quotes in rich previews.
- **Search Engine Discovery**: Includes automatic `/robots.txt` (`app/robots.ts`) and `/sitemap.xml` (`app/sitemap.ts`).
- **Comprehensive Root Metadata**: Fully configured `metadataBase`, title templates, canonical alternates, keywords, and Googlebot directives.

---

## ✨ Feature Tour

### 🎯 Purpose Blueprints
- **To Spark New Connections** • `Social Mixer` — High-energy introductions, curated icebreakers, and signature welcome drinks.
- **To Deepen Friendships** • `Intimate Dinner` — Seated dinner designed for heartfelt stories, toasts, and sociopetal seating.
- **To Simply Unwind** • `Casual Hangout` — Low-pressure drop-in format with continuous snacks and zero expectations.
- **To Celebrate a Milestone** • `Celebration` — Memorable toasts, music, and shared photos.

### 💌 Progressive RSVP & Universal Calendar Sync
- **Progressive Funnel**: Selecting *"Can't make it 💌"* collapses the form to a simple Name + Email + warm note field, minimizing friction.
- **Universal .ics & Google Calendar**: 1-click download of RFC 5545 `.ics` calendar files for Apple Calendar, Outlook, and direct Google Calendar sync.
- **Visual Consent Spectrum**: Guests declare photo boundaries upfront (Open, Circle Only, or Ghost Mode).

### 📱 Live Copilot HUD & Host Megaphone
- **Doorway Duty**: Glanceable arrival check-in with unchecked guests sorted to the top for instant thumb-reach.
- **Now / Next Countdown**: High-contrast phase indicators ensure the host never loses track of the night's rhythm.
- **Host Megaphone**: Phase-aware chat transitions from collaborative planning to high-priority host broadcasts (`📢 HOST BROADCAST`).
- **Ambient TV Slideshow Wall (`/events/[id]/wall`)**: Living-room TV slideshow cycling through purpose tags and guest memories during the party.

### 📸 Smart Media Vault & 1-Tap Privacy Protocol
- **Direct-to-Cloud Uploads**: Direct browser-to-storage presigned PUTs bypass serverless payload limits.
- **Zero-App Camera Capture**: Native browser capture (`<input capture="environment">`) lets guests snap photos without downloading an app.
- **Non-Confrontational "Remove Me" Protocol**: Any guest can soft-delete their photo with 1 tap, avoiding social awkwardness.

### ⚡ Viral Memory Capsules ($K > 1.08$)
- Public retrospective showcase at `/capsule/[token]` featuring hero quotes, photo vault highlights, and guest circle recaps.
- **1-Click Blueprint Remixing**: Inspired attendees can tap **`[ ⚡ Host Your Own Gathering: Remix This Blueprint ]`** to clone the structure and create their own event.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14.2.5 (App Router), React 18, TypeScript 5.5, Tailwind CSS 3.4 |
| **Typography** | Newsreader (Editorial Serif), Outfit, Plus Jakarta Sans |
| **Database** | Neon Cloud Serverless PostgreSQL with PgBouncer connection pooling |
| **ORM** | Prisma ORM 5.20 (ACID transactions, pessimistic row locks) |
| **Object Storage** | S3-Compatible / Cloudflare R2 via `@aws-sdk/client-s3` & presigned URLs |
| **Offline Sync** | HTML5 Canvas, IndexedDB (`gathercraft_media_db`), LocalStorage queue |
| **AI Intelligence** | Google Gemini 1.5 Flash (with built-in heuristic offline fallbacks) |
| **Validation** | Zod schema validation on all API route boundaries |
| **Testing** | Playwright End-to-End Suite (Chromium headless testing) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17+
- npm or yarn
- A Neon PostgreSQL database (or standard PostgreSQL instance)

### 1. Clone & Install

```bash
git clone https://github.com/Alokkr00/GatherCraft.git
cd GatherCraft
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Cloud PostgreSQL Connection String (with pooling & SSL)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Canonical Domain URL for SEO & OpenGraph
NEXT_PUBLIC_APP_URL="https://gathercraft.app"

# Optional: Google Gemini API Key for AI purpose articulation
GEMINI_API_KEY="your_gemini_api_key"

# Cloud Storage (S3-compatible / Cloudflare R2 / Supabase S3)
# If omitted in local dev, GatherCraft automatically falls back to /api/mock-upload
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="gathercraft-media"
CLOUDFLARE_R2_PUBLIC_DOMAIN="https://media.gathercraft.app"
```

### 3. Initialize Database & Seed

```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate type-safe Prisma client
npx prisma generate

# Seed sample gatherings and templates
npm run db:seed
```

To visually inspect your database at any time:
```bash
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing & Verification

GatherCraft is verified by automated Playwright E2E tests:

```bash
# Compile production build
npm run build

# Run Playwright E2E test suite
npm test
```

### Verified Test Suites (5/5 Passing)
- ✅ **Dashboard Load**: Verifies initial hydration and sample event display.
- ✅ **First-Time Host Onboarding**: Hero prompt $\rightarrow$ wizard pre-fill $\rightarrow$ event workspace.
- ✅ **Wizard & Cross-Browser RSVP**: 3-step creation, magic link, and atomic concurrency capacity checks.
- ✅ **Live Copilot Mode**: Doorstep arrival check-ins, visual consent badges, and host megaphone chat.
- ✅ **Post-Event Aftermath & Capsule**: Retrospective submission, gratitude drafting, and public memory capsule creation.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
