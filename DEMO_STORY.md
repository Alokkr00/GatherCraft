# GatherCraft — Polished Demo Narrative & Video Script

> **The Story:** *"From an overwhelming idea to an unforgettable evening."*  
> **Host Persona:** Maya, a design lead bringing 6 close friends together for an intimate reconnection dinner after months of drifting apart.  
> **Demo Duration:** ~4.5 minutes.

---

## Story Overview & Arc

Most event tools treat hosting as an administrative chore: tickets, spreadsheets, and endless WhatsApp group chats. GatherCraft treats hosting as **experience design** — starting with *why* you are bringing people together, guiding the evening in real time, and cementing lasting memories.

```
  [1. Purpose Framing] ──> [2. Warm Invitation] ──> [3. 3-Pillar Prep] ──> [4. Mobile Live Mode] ──> [5. Reflection]
   "Why gather?"            Magic RSVP link           Run-of-Show             1-tap check-in          Aftermath notes
```

---

## Act 1: The Spark & Purpose Framing (00:00 – 01:15)

### Visuals
- Desktop browser opening [GatherCraft](http://localhost:3000).
- Screen shows the warm, human onboarding state: *"Bring people together. On purpose."*
- Camera zooms in on the Quick Start input and purpose templates.

### Script & Voiceover
> *"We've all wanted to host friends, but the moment you start, you get bogged down in logistics: group chats with 40 unread messages, split bills, and spreadsheets.  
>  
> GatherCraft begins somewhere different. It begins with intent."*

### Screen Actions
1. Maya types in the prompt: *"An intimate Saturday dinner to reconnect with college friends who haven't seen each other in a year."*
2. She selects **"To Deepen Friendships • Intimate Dinner"**.
3. In the event creation wizard, she reviews the purpose statement:
   - *"To bring our circle back into genuine conversation, celebrate each other's quiet wins, and ensure no one feels rushed."*
4. Notice the **Success Criteria**:
   - Every guest shares one story from their past year.
   - Zero arrival awkwardness in the first 15 minutes.
   - An intentional closing toast before departure.
5. Clicks **"Create Gathering"**. Total time elapsed: **45 seconds**.

---

## Act 2: The Emotional Invitation (01:15 – 02:15)

### Visuals
- Split-screen: Maya copies the invite link on desktop; guest (Alex) receives it via SMS and opens it on an iPhone.

### Script & Voiceover
> *"When your guests open their invitation, it doesn't look like an enterprise calendar invite or an ad-bloated ticketing form. It feels like receiving a thoughtful personal letter."*

### Screen Actions
1. Guest view on smartphone (`/invite/[id]`):
   - Warm dark glass aesthetic with subtle ambient glow.
   - Top banner clearly displays the purpose: *"Why we're gathering: To reconnect and share stories..."*
   - Date, time, and intimate venue details.
2. Alex taps **"I'll Be There"**.
3. Inputs dietary preference: *"Vegetarian"* and a note: *"Can't wait! Bringing a bottle of crisp orange wine."*
4. Submits RSVP in **15 seconds**.
5. **Security & Privacy Note for Presenter:** Point out that no other guest's phone number, email, or personal notes are leaked to the public.

---

## Act 3: Effortless Planning — The 3 Pillars (02:15 – 03:15)

### Visuals
- Maya's Event Hub workspace (`/events/[id]`).

### Script & Voiceover
> *"Back in Maya's workspace, she isn't confronted with 10 confusing dashboard tabs. Everything is organized into 3 clear pillars: Run-of-Show, People & RSVPs, and Prep Checklist."*

### Screen Actions
1. **Run-of-Show (Timeline):**
   - Highlights the psychological anchors:
     - **Arrival & Welcoming Threshold (7:00 PM):** Pour spritz, anchor early guests with cheese board assembly.
     - **Intimate Dinner & Conversation (7:45 PM):** Family-style dining.
     - **Closing Toast & Sweet Ritual (9:30 PM):** Espresso & intentional closing reflection.
2. **People & RSVPs:**
   - Alex's RSVP shows up instantly with the vegetarian badge.
   - Live headcount dynamically updates with zero manual tallying.
3. **Prep Checklist:**
   - Pre-populated ingredients and tasks categorized by timing (Day Before vs. 2 Hours Before).

---

## Act 4: Event-Night Live Mode on Mobile (03:15 – 04:15)

### Visuals
- Mobile video feed (iPhone Safari in Standalone PWA mode).
- Dim ambient party lighting background.

### Script & Voiceover
> *"It's 7:00 PM. The doorbell rings. Maya doesn't want her face buried in a laptop or checking messy notes. She pulls out her phone and taps 'Enter Live Mode'."*

### Screen Actions
1. Mobile Live Mode opens (`/events/[id]/live`):
   - **Tonight's Purpose** stays anchored at the top.
   - **Arrival Pulse:** Large `min-h-[48px]` touch buttons.
   - Maya taps **"Check In"** next to Alex's name. Button instantly flips to emerald *"Arrived"*.
2. **Offline Resilience Demo:**
   - Presenter toggles Airplane Mode on phone.
   - Check-in button is tapped for guest Jordan.
   - Status pill smoothly updates: *"Offline (1 queued)"*.
   - Airplane Mode is toggled back off.
   - The queue flushes instantly: *"Synced"*. Zero lost data.
3. **Conversational Catalyst:**
   - During dessert, Maya glances at her phone.
   - Live Mode suggests a low-stakes psychological icebreaker:  
     *"What is one habit or belief you completely changed your mind about this year?"*
   - Table engages in deep, unforced conversation.

---

## Act 5: Reflection & The Aftermath (04:15 – 05:00)

### Visuals
- Sunday morning coffee scene.
- Maya opens `/events/[id]/aftermath`.

### Script & Voiceover
> *"The Peak-End rule in psychology tells us that what we remember most about an experience is the ending and how it made us feel. The next morning, GatherCraft helps Maya close the loop."*

### Screen Actions
1. Maya reviews her **Success Criteria**:
   - [x] Every guest shared a story.
   - [x] Zero arrival awkwardness.
   - [x] Closing toast completed.
2. She selects **"Reflect & Thank"**:
   - GatherCraft generates personalized, warm thank-you notes referencing each guest's attendance and dietary notes.
3. Maya copies the notes to send via text message.
4. The gathering is archived with its memory imprint.

---

## Presenter Preparation Checklist

Before recording or presenting this live:
- [ ] Ensure local dev server is running on `http://localhost:3000`.
- [ ] Clear browser cache or use an Incognito tab for clean initial state.
- [ ] Have Chrome DevTools open in mobile viewport (or an actual iPhone on the same Wi-Fi).
- [ ] Verify `DATABASE_URL` is active (Neon PostgreSQL).
- [ ] Run `npx playwright test` beforehand to verify end-to-end flow passes without regressions.
