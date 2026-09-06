# GatherCraft — Real User Testing Protocol & Field Guide

> **Objective:** Evaluate GatherCraft with 5–10 real hosts to test if the product genuinely reduces host mental load, keeps purpose front-and-center, and provides an effortless phone-based Live Mode during actual gatherings.

---

## 1. Test Overview & Philosophy

Traditional event software tests for *operational throughput* (can the user enter 50 line items into a budget?). GatherCraft is tested for **host emotional relief and purpose clarity**:
1. Does the host clarify their gathering's *why* in under 90 seconds?
2. Does the 3-pillar workspace feel calm rather than overwhelming?
3. Can the host run Live Mode on their smartphone with zero distraction during conversation?
4. Does the guest invitation evoke warmth rather than a corporate form?

---

## 2. Participant Recruitment (5–10 Cohort)

Recruit a diverse panel of 5 to 10 testers matching these 3 behavioral archetypes:

| Cohort Archetype | Sample Count | Profile Description | Key Question to Test |
| :--- | :--- | :--- | :--- |
| **A. The Hesitant / Anxious Host** | 3 testers | Rarely hosts; experiences decision fatigue and arrival anxiety. | Does GatherCraft give them psychological safety and clear guidance? |
| **B. The Frequent Social Catalyst** | 3 testers | Regularly hosts dinner parties, game nights, or mixers. | Does GatherCraft feel faster and more meaningful than Partiful/WhatsApp? |
| **C. The Milestone Planner** | 2–4 testers | Planning a birthday, housewarming, or farewell. | Does the Run-of-Show and Peak-End memory architecture feel empowering? |

### Pre-requisites
- Tester must bring **two devices**:
  1. Desktop / Laptop / iPad (for initial planning).
  2. Their personal smartphone (iOS Safari or Android Chrome) for Live Mode and Guest RSVP.

---

## 3. Moderator Instructions & Ground Rules

1. **Pure Observation ("Think-Aloud" Protocol):**
   - Instruct the participant: *"Please speak your thoughts aloud as you navigate. Say whatever you are looking for, confused by, or expecting."*
   - **Do NOT prompt or rescue:** If the participant pauses or clicks the wrong element, remain silent for at least 45 seconds. Note the friction.
2. **Device Switching:**
   - Tasks 1 & 2 are completed on desktop.
   - Tasks 3 & 4 MUST be completed on the participant's physical smartphone.
3. **Session Duration:** 35–45 minutes total (25 min task execution + 10–15 min debrief).

---

## 4. Unguided Test Scenarios & Observation Protocol

### Scenario 1: Purpose-First Onboarding & Creation (Desktop)
> **Prompt to User:** *"Imagine you want to bring 6–8 friends together next Friday evening. Set up your gathering."*

- [ ] **Observe:** Does the user pick a purpose template or type into the Quick Start prompt box?
- [ ] **Observe:** Do they read the "Why are you gathering?" section?
- [ ] **Observe:** How do they react to the 3-bullet success criteria?
- [ ] **Metric — Time to First Gathering Created:** _______ seconds (Target: < 90s).
- [ ] **Friction Check:** Did the user get confused by date/time pickers or location inputs?

### Scenario 2: 3-Pillar Event Workspace (Desktop)
> **Prompt to User:** *"You're now on your gathering hub. Prepare what you need for next Friday."*

- [ ] **Observe:** Do they understand the 3 pillars (**Run-of-Show**, **People & RSVPs**, **Prep Checklist**)?
- [ ] **Observe:** Is the top Purpose Banner noticed? Does it anchor their decisions?
- [ ] **Observe:** Do they look at the timeline? Do they notice the "Opening Threshold" and "Closing Ritual" markers?
- [ ] **Observe:** Do they try to add a guest or copy the invite link?
- [ ] **Friction Check:** Did they feel overwhelmed by too many tabs or numbers?

### Scenario 3: Guest Invitation Experience (Smartphone)
> **Prompt to User:** *"Open this invite link on your phone as if you were a guest receiving it in a text message."*

- [ ] **Observe:** Does the guest page feel warm and welcoming or transactional?
- [ ] **Observe:** Does the guest see the host's purpose note and what to bring?
- [ ] **Observe:** Submit RSVP with a dietary restriction and a guest note.
- [ ] **Metric — RSVP Completion Time:** _______ seconds (Target: < 30s).
- [ ] **Privacy Check:** Ensure no other guest's phone/email/personal data is visible to them.

### Scenario 4: Event-Night Live Mode (Smartphone)
> **Prompt to User:** *"It's Friday night, 7:15 PM. Your first guests are ringing the doorbell. Open Live Mode on your phone."*

- [ ] **Observe:** How quickly do they locate and tap "Enter Live Mode"?
- [ ] **Observe:** Does the mobile layout fit their phone screen cleanly without horizontal scroll?
- [ ] **Observe:** Tap to check in a guest upon arrival. Is the touch target large enough (`min-h-[48px]`)?
- [ ] **Observe:** Does the offline status indicator ("Synced" / "Offline") make sense?
- [ ] **Observe:** Does the host read the "Conversational Catalyst" icebreaker prompts?
- [ ] **Friction Check:** Did anything require tiny precision pinching or awkward tapping?

### Scenario 5: Aftermath & Closing the Loop (Desktop or Mobile)
> **Prompt to User:** *"The party was a success and everyone has headed home. Wrap up the event."*

- [ ] **Observe:** Do they navigate to the Aftermath page?
- [ ] **Observe:** Do they review whether their 3 success criteria were met?
- [ ] **Observe:** Do they inspect the gratitude & thank-you note draft?
- [ ] **Emotional Check:** Does the host feel a sense of completion and satisfaction?

---

## 5. Quantitative Scoring & Usability Rubrics

### System Usability Scale (SUS)
Administer the standard 10-item SUS immediately after the session (Score 1 = Strongly Disagree, 5 = Strongly Agree):

1. I think that I would like to use GatherCraft frequently for my gatherings.
2. I found GatherCraft unnecessarily complex.
3. I thought GatherCraft was easy to use.
4. I think that I would need the support of a technical person to use GatherCraft.
5. I found the various functions in GatherCraft were well integrated.
6. I thought there was too much inconsistency in GatherCraft.
7. I would imagine that most people would learn to use GatherCraft very quickly.
8. I found GatherCraft very cumbersome/awkward to use.
9. I felt very confident using GatherCraft.
10. I needed to learn a lot of things before I could get going with GatherCraft.

> **Target SUS Benchmark:** **> 82.5** (Top 10th percentile / Grade A).

### Core Qualitative Perception Questions
Ask the participant at the end of the interview:
1. *"In 1 sentence, what makes GatherCraft different from Partiful, Paperless Post, or Google Calendar?"*
2. *"Did having your 'purpose' visible at the top help you make planning decisions, or did you ignore it?"*
3. *"During Live Mode on your phone, did you feel like you were managing software, or did it feel like a subtle assistant?"*
4. *"What was the single most confusing or frustrating moment in the test?"*

---

## 6. Issue Tracking & Remediation Matrix

Use this table to log observations from the 5–10 sessions:

| Participant ID | Device / OS | Step Where Friction Occurred | Severity (Critical / Major / Minor) | Observed Behavior vs Expected | Recommended Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| P-01 | iPhone 15 / iOS 17 | | | | |
| P-02 | Pixel 8 / Android 14| | | | |
| P-03 | Galaxy S23 / OneUI | | | | |
| P-04 | Mac Chrome / Desktop| | | | |
| P-05 | Windows / Edge | | | | |
