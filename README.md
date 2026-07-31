# 🍸 GatherCraft — Purpose-First Party Planner

> *Transforming gatherings from generic events into meaningful, purpose-driven experiences.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8e44ad?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

GatherCraft is a modern web application built on principles from Priya Parker's *The Art of Gathering* and Nick Gray's *The 2-Hour Cocktail Party*. Unlike generic party planners that focus solely on logistics, GatherCraft puts **Purpose** as the first-class entity driving every decision — from host prep to day-of execution and post-event gratitude.

---

## ✨ Features Breakdown

### 🎯 v0.1 — Purpose Engine & MVP Core
- **AI Purpose Engine**: Powered by Google Gemini (`gemini-1.5-flash`), transforms raw ideas into disputable purpose statements across 3 distinct tones (*Warm*, *Bold*, *Minimalist*).
- **Starter Blueprints**: 4 pre-built party templates (*2-Hour Cocktail Party*, *Intimate Birthday Dinner*, *Casual Weekend Hangout*, *Milestone Celebration*).
- **Event Core Lock-in**: Define hard end times, soft capacity limits, budget targets, and venue location.
- **Guest Management Hub**: Add individual guests, bulk import via CSV (`Name, Email, Phone, Role`), filter by RSVP status, and view auto-aggregated dietary summaries.
- **1-Click Magic Link RSVP**: Mobile-first public invitation page (`/invite/[id]`) with `canvas-confetti` celebrations and 1-click Google Calendar integration.

### 📋 v0.2 — Planning Depth
- **Run-of-Show Timeline Editor**: Manage agenda offsets (`+0m`, `+30m`, `+90m`), tag assignees, check off steps, and view real-time duration badges.
- **Smart Tasks & Logistics Checklist**: Categorized task tracking (*Setup*, *Food*, *Drinks*, *Decor*, *Cleanup*) with priority tags (*High*, *Medium*, *Low*) and 1-click default task generator.
- **Itemized Budget Tracker**: Track planned vs. actual spend, log vendor receipt URLs, and monitor overall financial health with a dynamic visual status meter (Green / Yellow / Red).
- **Auto-Quantified Shopping List**: Headcount-aware supply calculator (ice, mixers, plates, napkins) based on confirmed RSVPs.

### 📱 v0.3 — Day-of Live Mode & Aftermath Closeout
- **Day-of Live Mode (`/events/[id]/live`)**: Full-screen high-contrast mobile copilot for hosts during the party with a real-time guest arrival check-in ticker, active run-of-show step runner, venue quick reference, and AI host coaching prompts.
- **Aftermath Closeout (`/events/[id]/aftermath`)**: Archive event status, generate personalized AI Thank-You notes (*Warm*, *Fun*, *Short*) with 1-click clipboard copy, and record a 5-star Host Retrospective.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom glassmorphism design system & Google Outfit typography)
- **AI Integration**: [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini 1.5 Flash API)
- **Icons & UI**: [Lucide React](https://lucide.react.dev/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Persistence**: LocalStorage with zero-friction fallback architecture & Firebase/Firestore sync layer readiness.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Alokkr00/GatherCraft.git
   cd GatherCraft
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
   *(Note: If no API key is provided, GatherCraft automatically fallback to pre-structured local purpose suggestions).*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Directory Structure

```
GatherCraft/
├── app/
│   ├── api/
│   │   └── refine-purpose/    # Gemini AI purpose refinement route
│   ├── events/
│   │   ├── create/            # 3-Step Event Creation Wizard
│   │   └── [id]/              # Main Host Event Management Hub
│   │       ├── live/          # Day-of Host Live Mode Copilot
│   │       └── aftermath/     # Post-event Closeout & Thank-You generator
│   ├── invite/[id]/           # Mobile-first Public Guest RSVP Page
│   ├── error.tsx              # Next.js App Router error boundary
│   ├── not-found.tsx          # Custom 404 page
│   ├── layout.tsx             # Root layout with Navbar
│   ├── globals.css            # Glassmorphism utilities & theme styles
│   └── page.tsx               # Host Dashboard & Gathering List
├── components/
│   ├── Navbar.tsx             # Top navigation bar
│   ├── TimelineEditor.tsx     # Run-of-Show timeline component
│   ├── TaskManager.tsx        # Logistics task list component
│   ├── BudgetTracker.tsx      # Line-item budget tracker & health meter
│   └── ShoppingList.tsx       # Headcount-aware shopping calculator
├── lib/
│   ├── types.ts               # Core TypeScript data models
│   ├── storage.ts             # Data persistence & calculation utilities
│   ├── templates.ts           # Pre-built gathering blueprints
│   └── firebase.ts            # Firebase client initialization
└── public/                    # Static assets & icons
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
