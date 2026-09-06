# 🍸 GatherCraft — Bring People Together. On Purpose.

> The purpose-first operating system for hosting memorable, intentional gatherings.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2d3748?logo=prisma)](https://www.prisma.io/)
[![Neon PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-00e599?logo=postgresql)](https://neon.tech/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

GatherCraft is a purpose-first party and gathering planner. Unlike conventional tools that treat hosting as a spreadsheet chore of guest counts and logistics, GatherCraft centers every gathering around a clear, dispute-resolving reason for gathering: **Purpose first, logistics second.**

---

## 🧭 The Core Architecture

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

## ✨ Key Features

### 🎯 Purpose Engine & Intelligent Blueprints
* **Invisible Intelligence**: Conversational assistance (*"Help Me Articulate This"*) turns rough thoughts into three refined purpose statements without tech jargon.
* **Balanced Blueprints**:
  * **To Spark New Connections** • `Social Mixer` — *High-energy introductions & dynamic conversation*
  * **To Deepen Friendships** • `Intimate Dinner` — *Seated dinner designed for meaningful conversation & toasts*
  * **To Simply Unwind** • `Casual Hangout` — *Low-pressure drop-in format for friends*
  * **To Celebrate a Milestone** • `Celebration` — *Memorable toasts, music & shared photos*
* **Intentional Endings**: Encourages clear end times so gatherings finish on a high note while energy is high.

### 💌 Warm, Conversational Invitations
* **Emotional Invitations**: Public invite pages (`/invite/[id]`) feel like personal invitations, not administrative CRM forms.
* **1-Tap RSVP**: Fast responses with conversational options: *"I'll be there! ✨"*, *"Tentative ⏳"*, and *"Can’t make it 💌"*.
* **Atomic Headcount Protection**: Server-side Prisma transactions ensure zero-race-condition overbooking against event capacity.

### 📋 Streamlined 3-Pillar Workspace
Replaced the cluttered 5-tab "Jira for parties" experience with three natural host pillars:
1. **Overview & Guest Circle**: Confirmed friends, dietary restrictions summary, co-hosts, and shareable invite links.
2. **Run-of-Show Timeline**: Visual milestone planner with timed offsets (`+0m`, `+30m`, `+90m`).
3. **Event Prep & Supplies**: A unified preparation hub integrating shopping checklists, host setup tasks, and budget tracking.

### 📱 Smartphone-Optimized Live Mode HUD
* **Doorway Duty**: Instant, glanceable arrival check-in with large thumb-friendly tap targets.
* **Now / Next HUD**: High-contrast phase indicators and countdown timers so hosts never lose track of timing.
* **Host Guidance & Generous Authority**: Timely suggestions factoring in success criteria, doorway greetings, and conversation pacing.
* **Offline Resilience**: Local check-in queue ensures seamless operation even if venue Wi-Fi or cellular signal drops.

### 🥂 Gratitude & Retrospective
* **Purpose Fulfillment Check**: Direct reflection on whether the gathering met its stated success criteria.
* **Personalized Thank-You Notes**: 1-click personalized gratitude drafting across multiple tones (*Warm*, *Fun*, *Short*).

---

## 🛠️ Tech Stack

* **Framework**: Next.js 14 (App Router, Server Actions, API Route Handlers)
* **Language**: TypeScript (Strict mode)
* **Styling**: Tailwind CSS + custom glassmorphic design system
* **Database & ORM**: Neon Cloud Serverless PostgreSQL + Prisma ORM
* **Intelligence**: Google Gemini 1.5 Flash (graceful offline fallback)
* **Testing**: Playwright End-to-End Suite (Multi-device sync & onboarding funnel)

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.17+
* npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/Alokkr00/GatherCraft.git
cd GatherCraft
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Neon Cloud PostgreSQL Connection String
DATABASE_URL="postgresql://username:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Optional: Google Gemini API Key for purpose articulation and coaching
GEMINI_API_KEY="your_gemini_api_key"
```

> **Note**: If `GEMINI_API_KEY` is omitted, GatherCraft automatically falls back to curated built-in prompts.

### 3. Initialize Database & Seed

```bash
# Push schema to database
npx prisma db push

# Pre-populate sample gatherings
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Verification

GatherCraft includes comprehensive Playwright end-to-end tests covering the full host and guest lifecycles:

```bash
# Run production build
npm run build

# Run end-to-end test suite
npx playwright test
```

Test coverage includes:
1. Dashboard loading and sample gatherings display.
2. First-time host onboarding funnel (Landing page purpose prompt $\rightarrow$ wizard $\rightarrow$ workspace).
3. 3-step creation wizard & cross-browser guest magic-link RSVP synchronization.
4. Day-of Live Mode HUD & check-in mechanics.
5. Post-event aftermath & gratitude note generation.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
