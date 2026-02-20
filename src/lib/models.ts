// ---------------------------------------------------------------------------
// models.ts — Type definitions for the batting lineup simulator
// ---------------------------------------------------------------------------

// --- Player (matches public/players.json) ---

/** Raw player data as stored in players.json */
export interface Player {
  /** Unique player identifier */
  id: number;
  /** Player name */
  name: string;
  /** Team name */
  team: string;
  /** Plate appearances */
  pa: number;
  /** Singles */
  single: number;
  /** Doubles */
  double: number;
  /** Triples */
  triple: number;
  /** Home runs */
  hr: number;
  /** Walks (bases on balls) */
  bb: number;
  /** Hit by pitch */
  hbp: number;
  /** Strikeouts */
  so: number;
}

// --- Lineup ---

/** A single slot in the 9-batter lineup (null = empty) */
export type LineupSlot = Player | null;

/** A full 9-batter lineup */
export type Lineup = [
  LineupSlot,
  LineupSlot,
  LineupSlot,
  LineupSlot,
  LineupSlot,
  LineupSlot,
  LineupSlot,
  LineupSlot,
  LineupSlot,
];

// --- Batter event rates ---

/** Per-batter event probabilities. All values sum to 1.0. */
export interface BatterRates {
  /** Single rate */
  single: number;
  /** Double rate */
  double: number;
  /** Triple rate */
  triple: number;
  /** Home run rate */
  hr: number;
  /** Walk + hit-by-pitch rate */
  bb_hbp: number;
  /** Strikeout rate */
  k: number;
  /** Other out rate (fly out, ground out, etc.) */
  out: number;
}

// --- Simulation config & results ---

/** Configuration for a Monte Carlo simulation run */
export interface SimConfig {
  /** Number of trials (games) to simulate (1,000–100,000) */
  n: number;
  /** Optional PRNG seed for reproducible results */
  seed?: number;
}

/** Results returned from a simulation run */
export interface SimResult {
  /** Arithmetic mean of runs scored across all trials */
  mean: number;
  /** Median (50th percentile) of runs scored */
  median: number;
  /** 10th percentile of runs scored */
  p10: number;
  /** 90th percentile of runs scored */
  p90: number;
  /** Score distribution: index = runs scored, value = count of trials */
  distribution: number[];
}
