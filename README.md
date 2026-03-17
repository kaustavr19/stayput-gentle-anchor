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

### Analytics
- 7-day focus bar chart
- Context breakdown pie chart (writing, coding, designing, …)
- Distraction cause breakdown
- Session count, total focused time, and average session length

### Leaderboard
- Global leaderboard showing top 50 users by XP.
- XP is awarded per session based on mode and duration — Open 1 XP/min, Pomodoro 1.5×/min + 15 bonus, Deep Work 2×/min + 50 bonus, Custom 1.5×/min.
- Tiers: Bronze → Silver (100 XP) → Gold (500 XP) → Platinum (2 000 XP).
- Leaderboard is backfilled on login from all historical session data, so it populates immediately for returning users.

### Platform
- **Auth + Cloud Sync** — Sign in with Google or email/password. Sessions, notes, and leaderboard data sync to Firestore.
- **Mobile Responsive** — Fixed bottom nav on small screens; all layouts adapt down to 375 px.
- **WCAG AA Contrast** — Text colours meet AA contrast ratios across both light and dark modes.
- **Light / Dark Mode** — Light by default, with a toggle for dark.
- **Assist Tab** — Coming soon.

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

3. Create a `.env` file in the project root (Firebase config values are embedded in `src/lib/firebase.ts` as they are client-safe public identifiers):
   ```env
   # No required env vars for the core app.
   # Add Supabase vars below only if you are wiring up the Assist tab AI features in future.
   # VITE_SUPABASE_PROJECT_ID="your-project-id"
   # VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   # VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   ```

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
├── components/       # UI components (ActiveSession, Analytics, FocusTimer, Leaderboard, …)
├── hooks/            # useAuth, useFocusSession, useLeaderboard, useNotes, useAppState
├── lib/              # firebase.ts, sounds.ts
├── pages/            # Index.tsx (main app), Auth.tsx
└── types/            # Shared TypeScript types (SessionMode, FocusSession, Note, …)
firestore.rules       # Firestore security rules
vercel.json           # SPA routing config for Vercel
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
| v3 (current) | Custom timer, Web Audio completion tones, 30-min open-mode ding, break reminders, leaderboard backfill, mobile responsiveness, WCAG AA contrast fixes |
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
