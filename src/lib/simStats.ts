// ---------------------------------------------------------------------------
// simStats.ts — Helpers for derived statistics from a SimResult
// ---------------------------------------------------------------------------

import type { SimResult } from './models';

/** A single row in the score distribution table */
export interface DistributionRow {
  score: number;
  count: number;
  pct: number;
}

/** Summarised distribution data computed in one pass */
export interface DistributionSummary {
  /** Per-score rows (length = distribution.length) */
  rows: DistributionRow[];
  /** Total trial count (sum of distribution[]) */
  totalTrials: number;
  /** Highest score with a non-zero count, or 0 when no trials */
  maxScore: number;
  /** Lowest score with a non-zero count, or 0 when no trials */
  minScore: number;
  /** Largest pct across rows, or 0 when no trials */
  maxPct: number;
}

/**
 * Compute distribution rows, totals, and min/max in a single pass over the
 * distribution array. Avoids the O(N²) reduce-per-row pattern previously
 * inlined in SimulationPanel/SimulationSummary.
 */
export function summarizeDistribution(result: SimResult | null): DistributionSummary {
  if (!result || result.distribution.length === 0) {
    return { rows: [], totalTrials: 0, maxScore: 0, minScore: 0, maxPct: 0 };
  }

  const distribution = result.distribution;
  let totalTrials = 0;
  for (let i = 0; i < distribution.length; i++) {
    totalTrials += distribution[i];
  }

  const rows: DistributionRow[] = new Array(distribution.length);
  let maxScore = 0;
  let minScore = 0;
  let foundMin = false;
  let maxPct = 0;

  for (let score = 0; score < distribution.length; score++) {
    const count = distribution[score];
    const pct = totalTrials > 0 ? (count / totalTrials) * 100 : 0;
    rows[score] = { score, count, pct };

    if (count > 0) {
      if (!foundMin) {
        minScore = score;
        foundMin = true;
      }
      maxScore = score;
      if (pct > maxPct) maxPct = pct;
    }
  }

  return { rows, totalTrials, maxScore, minScore, maxPct };
}
