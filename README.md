# StayPut

> A calm, opinionated focus app for knowledge workers. No gamification. No streaks. Just you and the work.

StayPut is designed to help you focus without the noise. It provides a soothing, distraction-free environment to manage your sessions, thoughts, and reflections — backed by real-time cloud sync so your data follows you across devices.

---

## Features

### Session Modes
- **Open** — No timer. A quiet stopwatch that stays out of your way.
- **Pomodoro** — 25-minute focused sprint with a 5-minute break prompt at the end.
- **Deep Work** — 90-minute flow session with a 20-minute break prompt at the end.
- **Custom** — Set your own duration (hours + minutes). Completion tone plays when time is up.

### Timer & Sound
- **Focus Timer** — Calm SVG countdown ring for timed sessions; quiet stopwatch for open mode.
- **Completion Tones** — An ascending C major melody (~5 s) plays automatically when Pomodoro, Deep Work, or Custom timers complete. No audio files — generated via Web Audio API.
- **30-Minute Ding** — During open sessions, a gentle bell chimes every 30 minutes as a soft nudge to check in with yourself.

### Break Flow
- At the end of every timed session a non-blocking inline prompt asks whether you want a break or want to keep going.
- During open sessions, a dismissable banner appears every 30 minutes offering a 5-minute pause.
- Break countdown is displayed in the timer while you rest. Skip anytime.

### Focus Tools
- **Distraction Logging** — Acknowledge distractions, categorise them, and move on without guilt.
- **Parking Lot** — Park a stray thought mid-session without losing flow. Revisit it after.
- **Session Reflection** — Rate your session (finished / partially / no) and note what made you stop.
- **Micro-Rituals** — Small, calm prompts to ease you into work mode.
- **Tiny Wins** — A brief celebratory message when you complete a session.

### Assist (AI Goal Planner)
- Enter a goal and StayPut generates a step-by-step action plan via **Groq AI** (Llama 3.1 · genuinely free tier).
- Review the plan, deselect steps you don't need, and add the rest as trackable tasks.
- Track each task through **pending → in-progress → done**. Completing a task awards **+10 XP** to the leaderboard.
- Disagree with a plan? Regenerate it, download it as a `.txt`, or start over.
- Existing goals are shown with a live progress bar so you can pick up where you left off.
- Your Groq API key is stored locally (never sent to our servers). A gentle usage nudge reminds you of Groq's free-tier limits (30 req/min, 14 400/day).

### Analytics
- 7-day focus bar chart
- Context breakdown pie chart (writing, coding, designing, …)
- Distraction cause breakdown
- Session count, total focused time, and average session length
- **AI Insight** — "Your week at a glance" card powered by Groq: a strength, a pattern, and a tip derived from your recent sessions. Cached in `localStorage` and auto-refreshed when your data changes; manual refresh button always available.

### Leaderboard
- Global leaderboard showing top 50 users by XP.
- XP is awarded per session based on mode and duration — Open 1 XP/min, Pomodoro 1.5×/min + 15 bonus, Deep Work 2×/min + 50 bonus, Custom 1.5×/min, Assist task +10 XP each.
- Tiers: Bronze → Silver (100 XP) → Gold (500 XP) → Platinum (2 000 XP).
- Leaderboard is backfilled on login from all historical session data, so it populates immediately for returning users.

### Profile Menu
- The header avatar+chevron opens a dropdown replacing the old logout button.
- **User info** — name and email at a glance.
- **Manage API key** — view your masked Groq key or remove it entirely.
- **Clear account data** — deletes all sessions, tasks, and notes from Firestore with an inline confirmation.
- **Delete account** — full data wipe + Firebase Auth account deletion, with a full-screen overlay confirmation dialog.
- **Sign out** — ends the session cleanly.

### Platform
- **Auth + Cloud Sync** — Sign in with Google or email/password. Sessions, notes, tasks, and leaderboard data sync to Firestore.
- **Mobile Responsive** — Fixed bottom nav on small screens; all layouts adapt down to 375 px.
- **WCAG AA Contrast** — Text colours meet AA contrast ratios across both light and dark modes.
- **Light / Dark Mode** — Light by default, with a toggle for dark.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Fonts | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (body) + [Fraunces](https://fonts.google.com/specimen/Fraunces) (display) |
| Charts | [Recharts](https://recharts.org/) |
| Auth & DB | [Firebase](https://firebase.google.com/) (Auth + Firestore) |
| AI | [Groq](https://groq.com/) (`llama-3.1-8b-instant`) — free tier |
| Sound | Web Audio API (no external audio files) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm
- A [Firebase](https://firebase.google.com/) project with **Authentication** (Google + Email/Password) and **Firestore** enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kaustavr19/stayput-gentle-anchor.git
   cd stayput-gentle-anchor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Firebase config values are embedded in `src/lib/firebase.ts` as they are client-safe public identifiers. No `.env` file is required for the core app.

   > **Groq AI features** (Assist tab + Analytics insight) require a free Groq API key. Get one at [console.groq.com/keys](https://console.groq.com/keys) and enter it in-app via the Assist tab setup screen or the Profile menu. The key is stored in `localStorage` under `stayput_groq_key` — never sent to any server other than Groq.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:8080` in your browser.

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** → Sign-in providers → Google and Email/Password.
3. Enable **Firestore Database** in production mode.
4. Deploy Firestore Security Rules:
   ```bash
   npx firebase-tools login
   npx firebase-tools use <your-project-id>
   npx firebase-tools deploy --only firestore:rules
   ```
   The rules in `firestore.rules` enforce that:
   - Users can only read/write their own data (`/users/{uid}/…`).
   - The leaderboard collection is readable by any authenticated user but only writable by the document owner.
5. Update `src/lib/firebase.ts` with your project's config values.

### Deploying to Vercel

1. Push your branch to GitHub.
2. Create a new project on [Vercel](https://vercel.com/) and import the repository.
3. Deploy — the `vercel.json` in this repo handles SPA routing automatically.

---

## Project Structure

```
src/
├── components/       # UI components
│   ├── ActiveSession.tsx   # Timer UI, sounds, break flow
│   ├── Analytics.tsx       # Charts + AI insight card
│   ├── Assist.tsx          # AI goal planner + task tracker
│   ├── Leaderboard.tsx     # XP rankings + tier guide
│   ├── ProfileMenu.tsx     # Avatar dropdown (API key, clear data, delete account)
│   └── …                  # FocusTimer, DistractionLog, ParkingLot, etc.
├── hooks/
│   ├── useAuth.tsx         # Auth + clearAccountData + deleteAccount
│   ├── useFocusSession.ts  # Session state, break flow, custom timer
│   ├── useLeaderboard.ts   # XP logic, backfill, awardTaskXP
│   ├── useTasks.ts         # Firestore task CRUD, grouped by goal
│   └── …
├── lib/
│   ├── firebase.ts         # Firestore + Auth init
│   ├── gemini.ts           # Groq API client (goal plans + analytics insight + caching)
│   └── sounds.ts           # Web Audio API: playDing, playCompletionTune
├── pages/                  # Index.tsx (main app), Auth.tsx
└── types/                  # SessionMode, FocusSession, Note, Task, …
firestore.rules             # Firestore security rules
vercel.json                 # SPA routing config for Vercel
```

---

## Philosophy

StayPut is opinionated software:

- **Gamification is noise.** You don't need badges to do your work.
- **Streaks create anxiety.** Missing a day shouldn't feel like a failure.
- **Calm > Flat.** The interface should feel warm and considered, not sterile.
- **Privacy matters.** Your focus data belongs to you — stored under your own Firebase project.

---

## Version History

| Version | Description |
|---|---|
| v3 (current) | Groq AI Assist tab (goal planner + task tracking), Analytics AI insight, Profile menu with account management, Task XP (+10 per completed task), Custom timer mode, Web Audio completion tones, 30-min open-mode ding, dynamic break durations, leaderboard backfill |
| v2 | Firebase auth + Firestore sync, Analytics dashboard, Pomodoro + Deep Work modes, Opera Air-inspired UI, leaderboard with XP system |
| v1 | Local-first, `localStorage` only, no auth |

---

## v2 Documentation (archived)

> The following describes the state of StayPut as of v2. It is preserved here for reference.

### What was in v2

- **Session Modes** — Open (stopwatch), Pomodoro (25 min with break flow), Deep Work (90 min).
- **Focus Timer** — A calm countdown ring for Pomodoro/Deep sessions; a quiet stopwatch for open sessions.
- **Pomodoro Break Flow** — When your Pomodoro ends, StayPut prompts a 5-minute break with a countdown. Skip anytime.
- **Distraction Logging** — Acknowledge distractions, log them with a cause, and move on. AI-generated tips help you refocus.
- **Parking Lot** — Park a thought mid-session without losing flow. Revisit it after.
- **Session History & Reflection** — Review past sessions with reflection notes to understand your work patterns.
- **Analytics Dashboard** — 7-day focus chart, context breakdown, distraction analysis, and summary stats.
- **Micro-Rituals** — Small, calm prompts to ease you into work mode.
- **Auth + Cloud Sync** — Sign in with Google or email/password. All sessions and notes sync to Firestore in real time.
- **Leaderboard** — Global XP ranking with tier badges (Bronze → Platinum).
- **Mobile Bottom Nav** — Fixed frosted-glass nav bar on small screens.
- **Light / Dark Mode** — Light by default, with a toggle for dark.
- **Assist Tab** — Marked as coming soon.

### v2 Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Fonts | Plus Jakarta Sans + Fraunces |
| Charts | Recharts |
| Auth & DB | Firebase (Auth + Firestore) |
| Deployment | Vercel |

### Key fixes in v2

- `initializeFirestore` with `ignoreUndefinedProperties: true` — prevented Firestore from silently rejecting session writes when activity fields contained `undefined`.
- `stripUndefined()` helper + explicit field mapping in `toFirestore` — belt-and-suspenders guard against undefined leaking into Firestore documents.
- `setDoc` with `{ merge: true }` replaced `updateDoc` to eliminate `NOT_FOUND` errors on rapid pause/distraction events.
- `endSession` made async and awaited before clearing UI state — ensures `endedAt` is persisted before a hard refresh.
- Favicon cleaned up — removed stale Lovable data-URI and `favicon.ico`.

---

## v1 Documentation (archived)

> v1 was a fully local-first prototype. No auth, no cloud sync. Data was stored in `localStorage` only and did not persist across browsers or devices.

See [docs/v1-readme.md](docs/v1-readme.md) for the original v1 documentation.

---

## License

This project is open source.
