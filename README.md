# StayPut

> A calm, opinionated focus app for knowledge workers. No gamification. No streaks. Just you and the work.

StayPut is designed to help you focus without the noise. It provides a soothing, distraction-free environment to manage your sessions, thoughts, and reflections — backed by real-time cloud sync so your data follows you across devices.

---

## Features

- **Session Modes** — Choose how you work: Open (stopwatch), Pomodoro (25 min with break flow), or Deep Work (90 min).
- **Focus Timer** — A calm countdown ring for Pomodoro/Deep sessions; a quiet stopwatch for open sessions.
- **Pomodoro Break Flow** — When your Pomodoro ends, StayPut prompts a 5-minute break with a countdown. Skip anytime.
- **Distraction Logging** — Acknowledge distractions, log them with a cause, and move on. AI-generated tips help you refocus.
- **Parking Lot** — Park a thought mid-session without losing flow. Revisit it after.
- **Session History & Reflection** — Review past sessions with reflection notes to understand your work patterns.
- **Analytics Dashboard** — 7-day focus chart, context breakdown, distraction analysis, and summary stats.
- **Micro-Rituals** — Small, calm prompts to ease you into work mode.
- **Auth + Cloud Sync** — Sign in with Google or email/password. All sessions and notes sync to Firestore in real time.
- **Light / Dark Mode** — Light by default, with a toggle for dark.

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Fonts | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (body) + [Fraunces](https://fonts.google.com/specimen/Fraunces) (headings) |
| Charts | [Recharts](https://recharts.org/) |
| Auth & DB | [Firebase](https://firebase.google.com/) (Auth + Firestore) |
| AI Features | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (distraction tips, task assist) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or bun
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

3. Create a `.env` file in the project root:
   ```env
   # Firebase — auth + data storage
   # Config is embedded in src/lib/firebase.ts (client-safe public values)

   # Supabase — kept only for AI edge functions (Assist tab, distraction tips)
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   ```

   > Firebase config values are embedded directly in `src/lib/firebase.ts` as they are client-safe public identifiers.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser.

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** → Sign-in providers → Google and Email/Password.
3. Enable **Firestore Database** in production mode.
4. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
   The rules in `firestore.rules` enforce that users can only access their own data.
5. Update `src/lib/firebase.ts` with your project's config values.

### Deploying to Vercel

1. Push your branch to GitHub.
2. Create a new project on [Vercel](https://vercel.com/) and import the repository.
3. Add your Supabase environment variables in the Vercel project settings.
4. Deploy — the `vercel.json` in this repo handles SPA routing automatically.

## Project Structure

```
src/
├── components/       # UI components (ActiveSession, Analytics, FocusTimer, …)
├── hooks/            # useAuth, useFocusSession, useNotes
├── lib/              # firebase.ts, supabase.ts
├── pages/            # Index.tsx (main app), Auth.tsx
└── types/            # Shared TypeScript types
firestore.rules       # Firestore security rules
vercel.json           # SPA routing config for Vercel
```

## Philosophy

StayPut is opinionated software:

- **Gamification is noise.** You don't need badges to do your work.
- **Streaks create anxiety.** Missing a day shouldn't feel like a failure.
- **Calm > Flat.** The interface should feel warm and considered, not sterile.
- **Privacy matters.** Your focus data belongs to you — stored under your own Firebase project.

## Version History

| Version | Description |
|---|---|
| v2 (current) | Firebase auth + Firestore sync, Analytics dashboard, Pomodoro + Deep Work modes, Opera Air-inspired UI |
| v1 | Local-first, `localStorage` only, no auth — [archived docs](docs/v1-readme.md) |

## License

This project is open source.
