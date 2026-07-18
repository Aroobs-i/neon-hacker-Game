# NEON HACKER

A fully client-side cyberpunk arcade puzzle game. Connect glowing network nodes in
ascending order before the countdown hits zero — dodge firewalls, grab bonus-time
nodes, chain combos, and survive an endlessly escalating procedural grid.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion +
HTML Canvas**. No backend, no database, no auth — everything runs in the browser.
Progress is saved to `localStorage`.

---

## 1. Project structure

```
neon-hacker/
├─ app/
│  ├─ layout.tsx          # Root layout, fonts (Orbitron/Rajdhani/JetBrains Mono), metadata
│  ├─ page.tsx             # Entry point — mounts GameProvider + GameShell
│  └─ globals.css          # Design tokens, glassmorphism, glow utilities, grid bg
├─ components/
│  ├─ GameShell.tsx        # Screen router (menu / playing / paused / gameover / panels)
│  ├─ GameCanvas.tsx       # Canvas renderer: nodes, connections, particles, shake, input
│  ├─ HUD.tsx               # Timer bar, score, combo pop, pause button
│  ├─ MainMenu.tsx          # Title screen, mode select, quick nav
│  ├─ PauseMenu.tsx         # Resume / restart / settings / quit
│  ├─ GameOverScreen.tsx    # Run summary, new-high-score celebration
│  ├─ VictoryPulse.tsx      # "Breach complete" pulse between levels
│  ├─ SettingsPanel.tsx     # Sound / music / shake / particle toggles
│  ├─ StatsPanel.tsx        # Lifetime statistics
│  ├─ AchievementsPanel.tsx # Achievement list with lock state
│  ├─ ThemeSelector.tsx     # Unlockable neon color palettes
│  ├─ HowToPlay.tsx         # Rules explainer
│  ├─ AchievementToast.tsx  # Toast notification stack
│  ├─ ParticleBackground.tsx# Ambient CSS particle/grid backdrop for menus
│  └─ ui/
│     ├─ NeonButton.tsx     # Reusable glowing button (variants, hover/tap sound+motion)
│     └─ Panel.tsx          # Reusable glassmorphic panel wrapper
├─ contexts/
│  └─ GameProvider.tsx      # React context: wires reducer ↔ persistence ↔ audio ↔ achievements
├─ lib/
│  ├─ types.ts              # All shared TypeScript types
│  ├─ gameReducer.ts        # Pure reducer: the entire run/session state machine
│  ├─ levelGenerator.ts     # Seeded procedural level generation + difficulty curve
│  ├─ rng.ts                # mulberry32 PRNG, string hashing, daily-seed derivation
│  ├─ particles.ts          # Imperative canvas particle system (bursts + ambient)
│  ├─ audio.ts               # Procedural Web Audio API sound engine (zero audio files)
│  ├─ storage.ts             # localStorage load/save helpers
│  ├─ themes.ts              # Theme palette defs + unlock conditions
│  └─ achievements.ts        # Achievement defs + evaluation
├─ hooks/
│  ├─ useRafLoop.ts          # requestAnimationFrame loop with delta time, pause-aware
│  └─ useKeyboardShortcuts.ts# Esc / Space / P shortcuts
├─ public/favicon.svg
├─ tailwind.config.ts        # Neon color tokens, glow shadows, keyframe animations
├─ next.config.js
├─ tsconfig.json
├─ postcss.config.js
└─ package.json
```

---

## 2. How the game works

- **Objective**: click the numbered "sequence" nodes in ascending order (1 → N) to
  draw a glowing connection path across the grid before the timer runs out.
- **Firewalls** (red, ✕): clicking one costs you time and breaks your combo. They
  don't end the run — just punish you — so a single misclick isn't fatal.
- **Bonus nodes** (amber, +): optional, safe to click anytime, add time and score.
- **Combo**: consecutive correct clicks within ~3.2s of each other build a
  multiplier that boosts score. Stalling too long resets it.
- **Difficulty**: every level adds more sequence nodes, more firewalls, and less
  time — procedurally, forever. There's no ceiling.
- **Endless mode**: random seed each run, cumulative score, runs until you fail a
  countdown.
- **Daily Challenge**: the seed is derived deterministically from today's date
  (`mulberry32(hash("neon-hacker-daily-YYYY-MM-DD"))`), so every player gets the
  *exact same level sequence* on a given day, and your best score for that date is
  tracked separately in `localStorage`.

---

## 3. Installation

Requires **Node.js 18.18+** (Node 20 LTS recommended) and npm.

```bash
# 1. Unzip / clone the project, then from the project root:
npm install

# 2. Run the dev server
npm run dev

# 3. Open the game
# -> http://localhost:3000
```

### All npm commands

| Command         | What it does                                      |
|------------------|----------------------------------------------------|
| `npm run dev`    | Start the local dev server with hot reload          |
| `npm run build`  | Production build (`.next/`)                         |
| `npm run start`  | Serve the production build locally (after `build`)  |
| `npm run lint`   | Run ESLint                                           |

No environment variables, API keys, or `.env` file are required — the game has
zero external dependencies at runtime.

---

## 4. Deploying to Vercel (free tier)

**Option A — Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel            # first deploy, follow prompts (Next.js is auto-detected)
vercel --prod     # promote to production
```

**Option B — Git + Vercel dashboard**
1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset: **Next.js** (auto-detected, no config needed).
4. Build command: `next build` (default). Output: `.next` (default).
5. Click **Deploy**. No environment variables needed.

Because the game is 100% client-side (no database, no auth, no server actions),
it fits comfortably in Vercel's free Hobby tier.

---

## 5. Design notes

- **Palette**: void black (`#05060a`) base with a cyan/magenta duotone signature,
  plus unlockable secondary palettes (Matrix green, Blood red, Gold, Violet) tied
  to achievement milestones.
- **Type**: Orbitron (display, headlines/numerals) + Rajdhani (UI body copy) +
  JetBrains Mono (data, timers, labels) — all loaded via `next/font/google` (self-
  hosted at build time, no runtime font-fetch flicker).
- **Glassmorphism**: `.glass-panel` utility (blurred translucent panels) used for
  every menu/HUD surface, layered over an animated gradient + CSS grid backdrop.
- **Motion**: Framer Motion for all UI transitions (menu entrances, combo pop,
  toasts, panel open/close); raw Canvas 2D (not React/DOM) for the actual node
  graph, particles, and screen shake, since that layer needs to sustain 60fps
  without React re-render overhead.
- **Audio**: every sound (node connect, firewall hit, bonus pickup, combo,
  level-complete fanfare, game-over stinger, achievement chime, UI clicks, ambient
  drone pad) is synthesized at runtime with the Web Audio API — no `.mp3`/`.wav`
  assets, so there's nothing to host or license.

---

## 6. Performance notes

- The node graph, particle system, and screen shake all run on a single
  `<canvas>` driven by one `requestAnimationFrame` loop (`useRafLoop`), decoupled
  from React's render cycle — React only re-renders on discrete game events (a
  click, a level transition, a pause), not every frame.
- The canvas is sized to `devicePixelRatio` (capped at 2x) via `ResizeObserver`
  for crisp rendering without over-drawing on high-DPI displays.
- Particle count is capped (500) and ambient particle spawn is probabilistic
  per-frame rather than fixed-rate, keeping it cheap on low-end devices; players
  can also disable particles and screen shake entirely in Settings.
- All state transitions (level generation, scoring, combo math, achievement
  checks) are pure functions in `lib/`, so they're trivially testable in
  isolation from rendering.

---

## 7. Testing checklist

### Core loop
- [ ] Starting **Endless** generates a fresh random level 1 with 5 sequence nodes.
- [ ] Clicking sequence nodes out of order applies the mistake penalty (time
      loss + combo reset) without ending the run.
- [ ] Clicking a firewall node applies a larger time penalty and resets combo.
- [ ] Clicking a bonus node adds time and score, and does not affect combo/sequence.
- [ ] Completing a level's full sequence triggers the "Breach Complete" pulse,
      awards a time bonus, and generates level 2 with more nodes / less time.
- [ ] Timer reaching 0 transitions to Game Over (not before).
- [ ] Difficulty visibly increases every ~5-10 levels (node count, firewall count).

### Daily Challenge
- [ ] Two separate browser sessions (or incognito windows) started on the same
      calendar day produce **identical** level layouts in Daily mode.
- [ ] Daily best score persists independently from Endless high score.
- [ ] Reloading the page the next calendar day generates a different daily seed.

### Combo & scoring
- [ ] Combo counter increments on consecutive correct clicks and displays the
      "Nx COMBO" popup.
- [ ] Combo resets to 0 after ~3.2s of inactivity mid-level.
- [ ] Score increases faster at higher combo multipliers.

### Achievements (verify each unlocks exactly once, with a toast + sound)
- [ ] Finish 10 levels (cumulative across runs) -> "Script Kiddie"
- [ ] Reach a x10 combo -> "Chain Reaction"
- [ ] Finish any single level in under 10 seconds -> "Zero Latency"
- [ ] Play 50 games (i.e., 50 completed runs, win or lose) -> "Night Owl"
- [ ] Reach level 100 in a single run -> "Ghost in the Machine"

### Themes
- [ ] Locked themes show a lock icon and cannot be selected.
- [ ] Each theme unlocks automatically the moment its stat condition is met.
- [ ] Selecting an unlocked theme re-colors the HUD, canvas nodes, and menu glow.

### Persistence
- [ ] High score, stats, unlocked themes, and achievements survive a full page
      reload (`localStorage`).
- [ ] Clearing site data resets progress cleanly with no console errors.

### UI/UX
- [ ] Pause (Esc, P, or pause button) freezes the timer and node interaction.
- [ ] Settings toggles (sound, music, shake, particles) take effect immediately.
- [ ] Sound toggle off silences all SFX; music toggle is independent of it.
- [ ] Game is fully playable via touch on a mobile viewport (nodes are large
      enough to tap, no accidental double-fires).
- [ ] Keyboard: Esc pauses/resumes/backs out of panels; Space/Enter starts a run
      from the main menu.
- [ ] All interactive elements have a visible focus ring when tabbed to.
- [ ] `prefers-reduced-motion` is respected (animations shorten to ~0).

### Performance
- [ ] No visible frame drops during heavy particle bursts (DevTools FPS meter
      stays close to 60 during normal play on desktop).
- [ ] No memory growth over a long endless run (particle system caps at 500).

---

## 8. Known simplifications

- Firewalls are point obstacles you must avoid *clicking*, not line-of-sight
  blockers for the connection path (kept intentionally readable/fair for a fast
  arcade loop rather than requiring pathfinding UI).
- There's no server-side leaderboard — "daily challenge" fairness comes from the
  deterministic seed, not from comparing against other players' runs.
