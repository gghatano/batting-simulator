import { describe, it, expect } from 'vitest';
import { summarizeDistribution } from '../simStats';
import type { SimResult } from '../models';

function makeResult(distribution: number[]): SimResult {
  return { mean: 0, median: 0, p10: 0, p90: 0, distribution, truncatedGames: 0 };
}

describe('summarizeDistribution', () => {
  it('returns zeroed summary for null result', () => {
    const summary = summarizeDistribution(null);
    expect(summary.rows).toEqual([]);
    expect(summary.totalTrials).toBe(0);
    expect(summary.maxScore).toBe(0);
    expect(summary.minScore).toBe(0);
    expect(summary.maxPct).toBe(0);
  });

  it('returns zeroed summary for empty distribution', () => {
    const summary = summarizeDistribution(makeResult([]));
    expect(summary.rows).toEqual([]);
    expect(summary.totalTrials).toBe(0);
  });

  it('computes totals, pct, min/max from a normal distribution', () => {
    // distribution[0]=1, [1]=0, [2]=2, [3]=1 → total=4
    const summary = summarizeDistribution(makeResult([1, 0, 2, 1]));
    expect(summary.totalTrials).toBe(4);
    expect(summary.rows).toHaveLength(4);
    expect(summary.rows[0].pct).toBeCloseTo(25);
    expect(summary.rows[1].pct).toBe(0);
    expect(summary.rows[2].pct).toBeCloseTo(50);
    expect(summary.rows[3].pct).toBeCloseTo(25);
    expect(summary.minScore).toBe(0);
    expect(summary.maxScore).toBe(3);
    expect(summary.maxPct).toBeCloseTo(50);
  });

  it('skips leading zeros for minScore', () => {
    // distribution[0]=0, [1]=0, [2]=5 → minScore=2
    const summary = summarizeDistribution(makeResult([0, 0, 5]));
    expect(summary.minScore).toBe(2);
    expect(summary.maxScore).toBe(2);
    expect(summary.maxPct).toBe(100);
    expect(summary.totalTrials).toBe(5);
  });

  it('handles all-zero distribution', () => {
    // Edge case: distribution exists but no trials counted
    const summary = summarizeDistribution(makeResult([0, 0, 0]));
    expect(summary.totalTrials).toBe(0);
    expect(summary.rows).toHaveLength(3);
    expect(summary.rows.every((r) => r.pct === 0)).toBe(true);
    expect(summary.maxPct).toBe(0);
  });
});
