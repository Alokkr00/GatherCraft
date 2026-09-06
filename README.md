# 🍸 GatherCraft — Bring People Together. On Purpose.

> The purpose-first operating system for hosting memorable, intentional gatherings. Built with Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, Neon Serverless PostgreSQL, and Cloudflare R2 Direct-to-Cloud Media Storage.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.20-2d3748?logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-00e599?logo=postgresql)](https://neon.tech/)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare_R2-Zero_Egress_Storage-f38020?logo=cloudflare)](https://developers.cloudflare.com/r2/)
[![Playwright Tests](https://img.shields.io/badge/Playwright-5%2F5_Passing-45ba4b?logo=playwright)](https://playwright.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

GatherCraft is a purpose-first party and gathering planner. Unlike conventional tools that treat hosting as an administrative spreadsheet chore of headcount tallies and budgets, GatherCraft centers every gathering around a clear, dispute-resolving reason for gathering: **Purpose first, logistics second.**

Equipped with a zero-app **Smart Media Vault (Cloudflare R2 direct ingestion)**, **Visual Consent Protection (Ghost Mode & 1-tap removal)**, a **Purpose-Anchored Chat with Host Megaphone**, and **Viral Memory Capsules (`/capsule/[token]`)**, GatherCraft transforms transient gatherings into enduring connection.

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
│  - Client-Side Compressor (2048px WebP @ 82% + 16px LQIP)   │
│  - Offline Ingestion Queues (IndexedDB media + LocalStorage)│
└──────────────┬──────────────────────────────┬───────────────┘
               │ HTTP / JSON API              │ Direct Presigned PUT
               ▼                              ▼
┌──────────────────────────────────────────┐  ┌───────────────┐
│   Application Tier (Next.js App Router)  │  │ Storage Tier  │
│  - Routes: /api/events, /api/rsvp, etc.  │  │ (Cloudflare   │
│  - Media Vault: /media/presign, complete │  │  R2 / S3)     │
│  - Real-Time Chat: 3-Phase State Machine │  │               │
│  - Privacy Shield: 1-Tap "Remove Me" API │  │ - $0 Egress   │
│  - Viral Funnel: /capsule/[token] remix  │  │ - Direct PUT  │
│  - Heuristic Offline & Gemini AI Co-pilot│  │ - Instant CDN │
└──────────────────────┬───────────────────┘  └───────────────┘
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
* **`Guest`**: Relational guest profile with RSVP states (`yes`, `no`, `maybe`, `waitlist`), roles, dietary requirements, host-only notes, timestamped check-in tracking (`checkInAt`), and **Visual Consent Tier** (`OPEN`, `CIRCLE_ONLY`, `GHOST_MODE`).
* **`TimelineItem`**: Run-of-Show schedule entries with minute offsets (`+0m`, `+45m`, `+90m`), duration, assignee, and completion status.
* **`MediaAsset`**: Smart Media Vault assets with direct Cloudflare R2 storage keys, CDN URLs, Base64 LQIP micro-thumbnails, purpose tags (`✨ Quiet Win`, `🥂 The Toast`), moderation status, and soft self-deletion flags.
* **`ChatMessage`**: Purpose-anchored single-stream messages with 3-phase state tags (`PLANNING`, `LIVE`, `GRATITUDE`, `ARCHIVED`), host broadcast megaphone flag, and abuse-protection IP hash.
* **`MemoryCapsule`**: Post-event storytelling showcase model with tokenized URLs, hero quote, aggregated guest circle, view counter, and viral remix analytics (`cloneCount`).
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

### 💌 Warm, Conversational Invitations & Visual Consent
* **Emotional Invitations**: Public invite pages (`/invite/[id]`) feel like personal invitations, not administrative CRM forms.
* **1-Tap RSVP**: Fast responses with conversational options: *"I'll be there! ✨"*, *"Tentative ⏳"*, and *"Can’t make it 💌"*.
* **Visual Consent Spectrum**: Guests declare their photo privacy level upfront:
  * 🟢 **Open**: *Happy to be in shared party photos and memories.*
  * 🟡 **Circle-Only**: *Keep photos strictly within tonight's guest circle.*
  * 🔴 **Ghost Mode**: *Do not photograph or record me tonight.*
* **Custom Dietary & Plus-One Capture**: Captures dietary constraints, accessibility notes, and companion counts directly in the flow.

### 📋 Streamlined 3-Pillar Workspace
Replaced the cluttered 5-tab "Jira for parties" experience with three natural host pillars:
1. **Overview & Guest Circle**: Confirmed friends, dietary restrictions summary, co-hosts, and shareable invite links.
2. **Run-of-Show Timeline**: Visual milestone planner with timed offsets (`+0m`, `+30m`, `+90m`).
3. **Event Prep & Supplies**: A unified preparation hub integrating shopping checklists, host setup tasks, and budget tracking.

### 📱 Smartphone-Optimized Live Mode HUD
* **Doorway Duty**: Instant, glanceable arrival check-in with large thumb-friendly tap targets (`min-h-[48px]`, `touch-manipulation`).
* **Visual Consent Badges**: Explicit indicators (`🔴 No Photos`, `🟡 Circle Only`, `🟢 Open`) right next to guest names so hosts immediately know arrival boundaries.
* **Now / Next HUD**: High-contrast phase indicators and countdown timers so hosts never lose track of timing.
* **Host Guidance & Generous Authority**: Timely suggestions factoring in success criteria, doorway greetings, and conversation pacing.
* **Offline Resilience**: Local check-in queue ensures seamless operation even if venue Wi-Fi or cellular signal drops.
* **PWA Home Screen Support**: Standalone web app capability with dark theme styling.

### 📢 Host Megaphone & 3-Phase State Machine Chat
* **Purpose-Anchored Room**: Pinned purpose banner remains visible at all times, keeping conversation oriented around the gathering's core intent.
* **3-Phase Lifecycle Transitions**:
  * **Planning Mode**: Collaborative coordination thread for guests and hosts.
  * **Live Megaphone Mode**: Host broadcast toggle delivers high-visibility alerts (`📢 HOST BROADCAST`) while regular noise is throttled.
  * **72-Hour Gratitude Mode**: Post-event appreciation wall that automatically sunsets into an immutable read-only memory archive.
* **Abuse Protection**: Sliding-window IP rate limiter (max 20 messages/min) protects against spam.

### 📸 Smart Media Vault & Zero-App QR Camera Uploads
* **Direct-to-Cloud Ingestion (Cloudflare R2)**: Presigned PUT URLs bypass the Vercel 4.5MB serverless payload limit while incurring **$0 egress fees**.
* **Zero-App Mobile Capture**: `<input capture="environment">` gives mobile guests direct camera access without needing to install an app.
* **Client-Side Compression**: Native `createImageBitmap` downscales photos to 2048px @ 82% WebP in ~150ms and computes 16px Base64 micro-thumbnail LQIPs.
* **Offline IndexedDB Queue**: Photos captured in Wi-Fi dead zones are held in `gathercraft_media_db` and auto-flushed upon reconnection.
* **Purpose Intent Tags**: Photos are categorized by emotional moment (`✨ Quiet Win`, `🥂 The Toast`, `😂 Pure Joy`, `🍕 Food & Feast`, `🤫 Behind the Scenes`).

### 🛡️ Non-Confrontational Privacy: 1-Tap "Remove Me" Protocol
* Every shared photo in the gallery features a discreet `[ 🛡️ Remove Me ]` button.
* Guests can instantly soft-delete their photo without notifying the uploader or asking the host, guaranteeing psychological safety and preventing social tension.

### ⚡ Post-Event Memory Capsule & Viral Blueprint Remixing ($K > 1.08$)
* **Storytelling Capsule (`/capsule/[token]`)**: Public post-event showcase displaying the host's hero retrospective quote, purpose statement, gathered guest circle, and approved memory reel.
* **1-Click Blueprint Remixing**: An attendee inspired by the gathering can tap **`[ ⚡ Host Your Own Gathering: Remix This Blueprint ]`** to clone the purpose, schedule structure, and format into a new event—powering sustainable organic host acquisition.

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
* **Media Storage**: Cloudflare R2 Object Storage (S3-compatible, $0 egress fees) via `@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner`
* **Client Media & Offline**: HTML5 Canvas / `createImageBitmap` WebP downscaler, IndexedDB (`gathercraft_media_db`), and LocalStorage sync queues
* **Validation**: Zod (Runtime API schema validation)
* **Intelligence**: Google Gemini 1.5 Flash (with built-in heuristic offline fallbacks)
* **Testing**: Playwright End-to-End Suite (Multi-device sync, megaphone, media vault & capsule funnels)

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

# Cloudflare R2 Object Storage (Optional for production media; defaults to local /api/mock-upload in dev)
CLOUDFLARE_R2_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_r2_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="gathercraft-media"
CLOUDFLARE_R2_PUBLIC_DOMAIN="https://media.gathercraft.app"
```

> **Note**: If `GEMINI_API_KEY` is omitted, GatherCraft automatically falls back to curated built-in prompts without error. If Cloudflare R2 credentials are omitted in local development, GatherCraft seamlessly routes direct uploads to a built-in local mock endpoint (`/api/mock-upload`).

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
4. **Day-of Live Mode HUD & Media Vault:** PWA viewport, doorway arrival check-in mechanics with visual consent badges (`🔴 No Photos`, `🟡 Circle Only`, `🟢 Open`), host megaphone broadcast controls, and shared photo gallery.
5. **Post-Event Aftermath & Memory Capsule:** Goal fulfillment checks, personalized thank-you generation, 72-hour gratitude chat sunset, and public Memory Capsule creation (`/capsule/[token]`) with 1-click blueprint remixing.

---

## 📚 Documentation & Field Guides

* [`USER_TESTING_GUIDE.md`](USER_TESTING_GUIDE.md): 5–10 real host testing protocol with unguided scenarios and System Usability Scale (SUS) rubric.
* [`DEMO_STORY.md`](DEMO_STORY.md): Complete 5-act narrative walkthrough script and presentation storyboard.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
