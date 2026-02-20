// ---------------------------------------------------------------------------
// search.ts — Lineup search: shuffle batting order and evaluate candidates
// ---------------------------------------------------------------------------

import type { BatterRates, SimResult } from '../models';
import { simulateN } from './simulate';
import { createRng } from './rng';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for the lineup search */
export interface SearchConfig {
  /** Number of shuffled lineup candidates to evaluate (200–5,000) */
  numCandidates: number;
  /** Number of games to simulate per candidate (e.g. 200) */
  gamesPerCandidate: number;
  /** PRNG seed for reproducible shuffling */
  seed?: number;
  /** Number of top results to return per ranking (default: 5) */
  topK?: number;
}

/** A single candidate result with its lineup order and statistics */
export interface CandidateResult {
  /** The batting order (indices into the original lineup) */
  order: number[];
  /** The shuffled lineup */
  lineup: BatterRates[];
  /** Mean runs scored */
  mean: number;
  /** Variance of runs scored */
  variance: number;
  /** 10th percentile */
  p10: number;
  /** 90th percentile */
  p90: number;
}

/** Results of the lineup search */
export interface SearchResult {
  /** Top K candidates ranked by mean runs (descending) */
  byMean: CandidateResult[];
  /** Top K candidates ranked by variance (ascending — lower variance = more consistent) */
  byVariance: CandidateResult[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute variance from a SimResult's distribution array.
 * distribution[i] = number of games that scored i runs.
 */
function computeVariance(distribution: number[], mean: number): number {
  let totalGames = 0;
  let sumSquaredDiff = 0;

  for (let runs = 0; runs < distribution.length; runs++) {
    const count = distribution[runs];
    if (count > 0) {
      totalGames += count;
      sumSquaredDiff += count * (runs - mean) ** 2;
    }
  }

  return totalGames > 0 ? sumSquaredDiff / totalGames : 0;
}

/**
 * Fisher-Yates shuffle (in-place) using the provided RNG.
 * Returns the shuffled array for convenience.
 */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// Main search function
// ---------------------------------------------------------------------------

/**
 * Search for the best batting lineup order by randomly shuffling and
 * evaluating candidates via Monte Carlo simulation.
 *
 * @param lineup - Array of 9 batter rate profiles (original order)
 * @param config - Search configuration
 * @returns Top K lineups ranked by mean runs and by variance
 */
export function searchBestLineups(
  lineup: BatterRates[],
  config: SearchConfig,
): SearchResult {
  const { numCandidates, gamesPerCandidate, seed } = config;
  const topK = config.topK ?? 5;

  // RNG for shuffling lineup orders
  const shuffleRng = createRng(seed);

  const candidates: CandidateResult[] = [];

  for (let c = 0; c < numCandidates; c++) {
    // Create index array and shuffle it
    const order = Array.from({ length: lineup.length }, (_, i) => i);
    shuffle(order, shuffleRng);

    // Build the shuffled lineup
    const shuffledLineup = order.map((i) => lineup[i]);

    // Derive a deterministic seed for this candidate's simulation
    // Use the shuffle RNG to produce a unique seed per candidate
    const simSeed = (shuffleRng() * 0xffffffff) >>> 0;

    // Run simulation
    const simResult: SimResult = simulateN(shuffledLineup, gamesPerCandidate, simSeed);

    // Compute variance from distribution
    const variance = computeVariance(simResult.distribution, simResult.mean);

    candidates.push({
      order: [...order],
      lineup: shuffledLineup,
      mean: simResult.mean,
      variance,
      p10: simResult.p10,
      p90: simResult.p90,
    });
  }

  // Sort by mean descending, take top K
  const byMean = [...candidates]
    .sort((a, b) => b.mean - a.mean)
    .slice(0, topK);

  // Sort by variance ascending (lower = more consistent), take top K
  const byVariance = [...candidates]
    .sort((a, b) => a.variance - b.variance)
    .slice(0, topK);

  return { byMean, byVariance };
}
