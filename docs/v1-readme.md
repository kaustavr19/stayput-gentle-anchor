# StayPut — v1 (Local-First)

> Archived documentation for StayPut v1. This version used browser `localStorage` for all data storage with no authentication requirement.

---

# StayPut

> A calm, opinionated focus app for knowledge workers. No gamification. No streaks. Just you and the work.

StayPut is designed to help you focus without the noise. It provides a clean, distraction-free environment to manage your sessions, thoughts, and reflections. It's built on a local-first philosophy, ensuring your data stays with you, with optional backend integration ready when you need it.

## Features

- **Focus Timer**: A simple, unobtrusive timer to track your deep work sessions.
- **Distraction Logging**: Acknowledging distractions is the first step to managing them. Log them and move on.
- **Parking Lot**: Have a thought mid-session? Park it in the notes area and stay in the flow.
- **Session History & Reflection**: Review your past sessions and reflections to understand your work patterns better.
- **Micro-Rituals**: Small, calm prompts to help you transition into work mode.
- **Local-First**: Your data lives in your browser's local storage by default. Privacy first.

## Tech Stack

- **[Vite](https://vitejs.dev/)**: Fast frontend build tool.
- **[React](https://reactjs.org/)**: UI library for building the interface.
- **[TypeScript](https://www.typescriptlang.org/)**: For type safety and better developer experience.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS for styling.
- **[shadcn/ui](https://ui.shadcn.com/)**: Beautifully designed, accessible components.
- **[Supabase](https://supabase.com/)**: Database integration set up and ready for future syncing (ran local-first in this version).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## Philosophy

StayPut is "opinionated" software. We believe that:
- **Gamification is noise.** You don't need badges to do your work.
- **Streaks create anxiety.** Missing a day shouldn't feel like a failure.
- **Privacy matters.** Your focus data is personal.

## License

This project is open source.
