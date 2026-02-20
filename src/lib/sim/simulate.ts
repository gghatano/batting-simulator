// ---------------------------------------------------------------------------
// simulate.ts — Single-game engine and N-trial Monte Carlo runner
// ---------------------------------------------------------------------------

import type { BatterRates, SimResult } from '../models';
import { applyEvent, type BatEvent, type Bases } from './rules';
import { createRng } from './rng';

/** Maximum plate appearances per inning (safety guard against infinite loops) */
const MAX_PA_PER_INNING = 100;

/**
 * Determine the batting event from a random number using cumulative probability.
 * The order of event regions: single, double, triple, hr, bb_hbp, k, out.
 */
function determineEvent(rates: BatterRates, rand: number): BatEvent {
  let cumulative = 0;

  cumulative += rates.single;
  if (rand < cumulative) return 'SINGLE';

  cumulative += rates.double;
  if (rand < cumulative) return 'DOUBLE';

  cumulative += rates.triple;
  if (rand < cumulative) return 'TRIPLE';

  cumulative += rates.hr;
  if (rand < cumulative) return 'HR';

  cumulative += rates.bb_hbp;
  if (rand < cumulative) return 'BB_HBP';

  cumulative += rates.k;
  if (rand < cumulative) return 'OUT';

  // Remaining probability mass → out
  return 'OUT';
}

/**
 * Simulate a single 9-inning game.
 *
 * @param lineup - Array of 9 batter rate profiles
 * @param rng - Random number generator returning values in [0, 1)
 * @returns Total runs scored in the game
 */
export function simulateGame(lineup: BatterRates[], rng: () => number): number {
  let totalRuns = 0;
  let batterIndex = 0; // batting order persists across innings

  for (let inning = 0; inning < 9; inning++) {
    let outs = 0;
    let bases: Bases = { first: false, second: false, third: false };
    let paCount = 0;

    while (outs < 3 && paCount < MAX_PA_PER_INNING) {
      const batter = lineup[batterIndex % lineup.length];
      const rand = rng();
      const event = determineEvent(batter, rand);
      const result = applyEvent(event, bases, outs);

      bases = result.bases;
      outs = result.outs;
      totalRuns += result.runsScored;

      batterIndex++;
      paCount++;
    }
  }

  return totalRuns;
}

/**
 * Compute a percentile value from a sorted array of numbers.
 * Uses linear interpolation between closest ranks.
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const fraction = index - lower;
  return sorted[lower] + fraction * (sorted[upper] - sorted[lower]);
}

/**
 * Run N game simulations and compute summary statistics.
 *
 * @param lineup - Array of 9 batter rate profiles
 * @param n - Number of games to simulate
 * @param seed - Optional PRNG seed for reproducibility
 * @returns Simulation results with mean, median, percentiles, and distribution
 */
export function simulateN(
  lineup: BatterRates[],
  n: number,
  seed?: number,
): SimResult {
  const rng = createRng(seed);
  const scores: number[] = new Array(n);

  for (let i = 0; i < n; i++) {
    scores[i] = simulateGame(lineup, rng);
  }

  // Sort for percentile calculations
  const sorted = [...scores].sort((a, b) => a - b);

  // Compute mean
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += scores[i];
  }
  const mean = sum / n;

  // Compute percentiles
  const median = percentile(sorted, 50);
  const p10 = percentile(sorted, 10);
  const p90 = percentile(sorted, 90);

  // Build distribution array: index = runs, value = count
  const maxScore = sorted[sorted.length - 1];
  const distribution: number[] = new Array(maxScore + 1).fill(0);
  for (let i = 0; i < n; i++) {
    distribution[scores[i]]++;
  }

  return { mean, median, p10, p90, distribution };
}
