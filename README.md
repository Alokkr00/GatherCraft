# 🍸 GatherCraft — Purpose-First Party Planner

> Transforming gatherings from generic events into meaningful, purpose-driven experiences.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8e44ad?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

GatherCraft is a modern web application designed for purpose-first event planning, transforming generic gatherings into meaningful, intentional experiences.  

Unlike generic party planners that focus only on logistics, GatherCraft treats **Purpose** as a first-class entity that drives every decision — from planning to day-of execution to post-event gratitude.

---

## Current Status

**Active Production Release (v0.1 + v0.2 + v0.3 Completed)**

| Phase | Status | Description |
|-------|--------|-------------|
| **v0.1** – Purpose & Core | 🟢 Completed | Purpose engine (Gemini AI), event basics, guest list, magic-link RSVP, dietary summary |
| **v0.2** – Planning Depth | 🟢 Completed | Run-of-Show timeline, smart task checklist, budget tracker, headcount shopping list |
| **v0.3** – Live & Aftermath | 🟢 Completed | Full-screen Day-of Live Mode, guest arrival check-in ticker, post-event closeout, AI thank-you generator |

The project currently uses **LocalStorage** as the primary fast data store, with Firebase/Firestore integration prepared for cloud sync across devices.

---

## Core Philosophy

1. **Purpose first** — Every gathering starts with a clear, specific reason for existing.
2. **Guided but flexible** — The app guides hosts through a proven workflow while allowing power users to jump around.
3. **Host + Guest experience** — Beautiful planning tools for hosts and frictionless RSVP for guests.
4. **Day-of reality** — Planning is only half the job. The app helps hosts when the party is actually happening.

---

## Features Roadmap

### v0.1 — Purpose Engine & MVP Core
- [x] AI Purpose refinement (Google Gemini 1.5 Flash)
- [x] Starter templates (Cocktail Party, Birthday Dinner, Casual Hang, Milestone)
- [x] Event basics (date, hard end time, location, capacity, budget)
- [x] Guest list + CSV import (`Name, Email, Phone, Role`)
- [x] Magic-link public RSVP page (`/invite/[id]`) with confetti celebrations
- [x] Dietary summary aggregation
- [x] Google Calendar 1-click invitation generation

### v0.2 — Planning Depth
- [x] Run-of-show Timeline editor with timed offsets (`+0m`, `+30m`, `+90m`)
- [x] Task manager with categories (*Setup*, *Food*, *Drinks*, *Decor*, *Cleanup*) & priorities
- [x] Itemized budget tracker (planned vs actual spend with visual health meter)
- [x] Headcount-aware auto-quantified shopping list
- [x] Tabbed event management dashboard

### v0.3 — Live Mode & Aftermath
- [x] Full-screen Day-of Live Mode mobile copilot (`/events/[id]/live`)
- [x] Live guest arrival check-in ticker
- [x] Active timeline step runner
- [x] AI host coaching prompts & emergency venue reference
- [x] Aftermath closeout (`/events/[id]/aftermath`) + AI thank-you generator (*Warm*, *Fun*, *Short*)
- [x] 5-Star Host retrospective

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom glassmorphism system
- **AI**: Google Gemini 1.5 Flash (`@google/generative-ai`)
- **Persistence**: LocalStorage (client-fast) + Firebase/Firestore (prepared)
- **UI**: Lucide React + canvas-confetti

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Google Gemini API key

### Installation

```bash
git clone https://github.com/Alokkr00/GatherCraft.git
cd GatherCraft
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

> If no API key is provided, the app falls back to local purpose suggestions automatically.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
├── api/refine-purpose/     # Gemini purpose refinement API
├── events/
│   ├── create/             # 3-Step Event creation wizard
│   └── [id]/
│       ├── live/           # Day-of host live mode copilot
│       └── aftermath/      # Post-event closeout & AI thank-you generator
├── invite/[id]/            # Mobile-first public guest RSVP page
├── error.tsx               # Next.js App Router error boundary
├── not-found.tsx           # Custom 404 page
└── page.tsx                # Host dashboard

components/
├── TimelineEditor.tsx      # Run-of-Show timeline component
├── TaskManager.tsx         # Logistics checklist component
├── BudgetTracker.tsx       # Line-item budget tracker & health meter
└── ShoppingList.tsx        # Headcount-aware shopping calculator

lib/
├── types.ts                # Core data models
├── storage.ts              # Persistence layer
├── templates.ts            # Starter blueprints
└── firebase.ts             # Firebase cloud readiness
```

---

## Contributing

We welcome contributions! Please read the issue templates before opening new issues.

**Good first issues** are labeled `good first issue`.

---

## License

MIT License — see [LICENSE](LICENSE)
