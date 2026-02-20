# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baseball batting lineup simulator — a static SPA that lets users build a 9-batter lineup from real player data and run Monte Carlo simulations to estimate run production. No server; runs entirely in the browser. Deployed to GitHub Pages.

## Tech Stack

- **Svelte + TypeScript** (plain Vite SPA, not SvelteKit)
- **Vite** for build/dev
- **Vitest** for testing (logic only)
- **Web Worker** (`sim.worker.ts`) for simulation to avoid UI freeze
- Data served as static JSON (`public/players.json`)

## Build & Dev Commands

```bash
npm install
npm run dev          # Vite dev server
npm run build        # Production build (output: dist/)
npm run preview      # Preview production build
npx vitest           # Run all tests
npx vitest run       # Run tests once (CI mode)
npx vitest <file>    # Run a single test file
```

## Architecture

### Data Flow

`public/players.json` → fetch at startup → `playersStore` → filtered/sorted in UI → user builds lineup in `lineupStore` → event rates computed (`rates.ts`) → passed to Web Worker for simulation → results back to `simResultStore`

### Key Modules (under `src/lib/`)

- **`models.ts`** — Type definitions (`Player`, lineup types, simulation results)
- **`rates.ts`** — Computes per-batter event probabilities (1B/2B/3B/HR/BB+HBP/K/OUT) from raw stats; all rates sum to 1.0 per batter
- **`sim/rules.ts`** — Base runner advancement and scoring rules per event type
- **`sim/simulate.ts`** — Single-game engine (9 innings, 3 outs/inning) and N-trial runner
- **`sim/rng.ts`** — Seeded PRNG (e.g., mulberry32) for reproducible results

### Svelte Stores (`src/stores/`)

- `playersStore` — loaded player data
- `filtersStore` — team / name search / sort criteria
- `lineupStore` — 9 slots (player or null), duplicates allowed
- `selectedSlotStore` — which lineup slot is active for insertion
- `simConfigStore` — trial count N (1,000–100,000, default 10,000) and optional seed
- `simResultStore` — mean, median, P10, P90, score distribution

### UI (two tabs in single SPA page)

1. **Lineup Builder** — left: player card list with team/name/sort filters; right: 9 lineup slots with add/clear/swap controls
2. **Simulation Results** — per-batter rate table, run button, stats summary, score distribution

### Simulation Rules (initial/simplified)

- BB/HBP: forced advancement (bases loaded → run scores)
- 1B: runners on 2B/3B score, 1B→2B, batter→1B
- 2B: runners on 2B/3B score, 1B→3B, batter→2B
- 3B: all runners score, batter→3B
- HR: everyone scores
- K/OUT: out count +1, no runner movement

### GitHub Pages Deployment

Build requires correct `base` path (`/repo-name/`) in Vite config for GitHub Pages routing.

## Git Workflow

**必ず以下のワークフローに従うこと。直接 `develop` や `main` にコミットしてはいけない。**

### ブランチ構成

- `main` — リリース用。develop からのマージのみ
- `develop` — 開発統合ブランチ。feature ブランチからのマージのみ
- `feature-taskNNN` — 各タスクの作業ブランチ（例: `feature-task001`）

### 作業手順

1. **タスク開始**: `/1_start-task NNN` で worktree + ブランチを作成
2. **実装**: `/2_impl-task NNN` でサブエージェントに実装を委譲。`gitworktree/feature-taskNNN/` 内で作業
3. **レビュー**: `/3_review-task NNN` でサブエージェントにコードレビューを委譲。NG なら 2 に戻る
4. **タスク完了**: `/4_finish-task NNN` で develop にマージし worktree を削除

### ルール

- 1タスク = 1ブランチ。複数タスクを1ブランチにまとめない
- worktree のパスは `gitworktree/feature-taskNNN/`（リポジトリルート直下）
- `gitworktree/` は `.gitignore` に登録済み
- タスク番号は `doc/tasks/task_NNN.md` に対応する（3桁ゼロ埋め）
- マージ前にテストが通ることを確認する
