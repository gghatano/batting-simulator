import { describe, it, expect } from 'vitest';
import { searchBestLineups } from '../search';
import type { SearchConfig } from '../search';
import type { BatterRates } from '../../models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a 9-batter lineup where every batter has the same rates */
function uniformLineup(rates: BatterRates): BatterRates[] {
  return Array.from({ length: 9 }, () => ({ ...rates }));
}

/** Typical league-average-ish batter rates */
const typicalRates: BatterRates = {
  single: 0.16,
  double: 0.04,
  triple: 0.005,
  hr: 0.03,
  bb_hbp: 0.09,
  k: 0.22,
  out: 0.455,
};

/** Create a varied 9-batter lineup with different batter profiles */
function variedLineup(): BatterRates[] {
  return [
    { single: 0.20, double: 0.05, triple: 0.01, hr: 0.02, bb_hbp: 0.10, k: 0.18, out: 0.44 },
    { single: 0.15, double: 0.06, triple: 0.005, hr: 0.05, bb_hbp: 0.08, k: 0.25, out: 0.405 },
    { single: 0.18, double: 0.04, triple: 0.01, hr: 0.04, bb_hbp: 0.09, k: 0.20, out: 0.44 },
    { single: 0.12, double: 0.03, triple: 0.005, hr: 0.06, bb_hbp: 0.07, k: 0.28, out: 0.435 },
    { single: 0.22, double: 0.04, triple: 0.01, hr: 0.01, bb_hbp: 0.12, k: 0.15, out: 0.45 },
    { single: 0.14, double: 0.05, triple: 0.005, hr: 0.03, bb_hbp: 0.08, k: 0.22, out: 0.475 },
    { single: 0.17, double: 0.03, triple: 0.01, hr: 0.02, bb_hbp: 0.06, k: 0.24, out: 0.47 },
    { single: 0.10, double: 0.02, triple: 0.005, hr: 0.01, bb_hbp: 0.05, k: 0.30, out: 0.505 },
    { single: 0.19, double: 0.04, triple: 0.01, hr: 0.03, bb_hbp: 0.10, k: 0.19, out: 0.44 },
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('searchBestLineups', () => {
  it('seed固定で2回実行 → 結果が完全一致', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 10,
      gamesPerCandidate: 50,
      seed: 42,
      topK: 3,
    };

    const result1 = searchBestLineups(lineup, config);
    const result2 = searchBestLineups(lineup, config);

    // byMean should be identical
    expect(result1.byMean.length).toBe(result2.byMean.length);
    for (let i = 0; i < result1.byMean.length; i++) {
      expect(result1.byMean[i].mean).toBe(result2.byMean[i].mean);
      expect(result1.byMean[i].variance).toBe(result2.byMean[i].variance);
      expect(result1.byMean[i].order).toEqual(result2.byMean[i].order);
    }

    // byVariance should be identical
    expect(result1.byVariance.length).toBe(result2.byVariance.length);
    for (let i = 0; i < result1.byVariance.length; i++) {
      expect(result1.byVariance[i].mean).toBe(result2.byVariance[i].mean);
      expect(result1.byVariance[i].variance).toBe(result2.byVariance[i].variance);
      expect(result1.byVariance[i].order).toEqual(result2.byVariance[i].order);
    }
  });

  it('全打者同一の打線 → 全候補の結果がほぼ同じ', () => {
    const lineup = uniformLineup(typicalRates);
    const config: SearchConfig = {
      numCandidates: 20,
      gamesPerCandidate: 200,
      seed: 123,
      topK: 5,
    };

    const result = searchBestLineups(lineup, config);

    // With identical batters, shuffling should not affect mean significantly.
    // All candidates should have similar means (within a reasonable tolerance).
    const means = result.byMean.map((c) => c.mean);
    const maxMean = Math.max(...means);
    const minMean = Math.min(...means);

    // The difference between best and worst should be small
    // (purely due to simulation variance with different seeds)
    // With 200 games, we expect the difference to be modest
    expect(maxMean - minMean).toBeLessThan(3);
  });

  it('topK=3 → 各リストが3件返る', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 10,
      gamesPerCandidate: 50,
      seed: 999,
      topK: 3,
    };

    const result = searchBestLineups(lineup, config);

    expect(result.byMean).toHaveLength(3);
    expect(result.byVariance).toHaveLength(3);
  });

  it('topKデフォルト → 5件返る', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 10,
      gamesPerCandidate: 50,
      seed: 555,
    };

    const result = searchBestLineups(lineup, config);

    expect(result.byMean).toHaveLength(5);
    expect(result.byVariance).toHaveLength(5);
  });

  it('numCandidates=10, gamesPerCandidate=50 の小規模テストが正常終了', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 10,
      gamesPerCandidate: 50,
      seed: 777,
      topK: 5,
    };

    const result = searchBestLineups(lineup, config);

    // Basic structural checks
    expect(result.byMean.length).toBeGreaterThan(0);
    expect(result.byVariance.length).toBeGreaterThan(0);

    // Each candidate should have valid data
    for (const candidate of result.byMean) {
      expect(candidate.order).toHaveLength(9);
      expect(candidate.lineup).toHaveLength(9);
      expect(candidate.mean).toBeGreaterThanOrEqual(0);
      expect(candidate.variance).toBeGreaterThanOrEqual(0);
      expect(typeof candidate.p10).toBe('number');
      expect(typeof candidate.p90).toBe('number');
    }
  });

  it('byMeanは平均得点の降順で並ぶ', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 20,
      gamesPerCandidate: 100,
      seed: 42,
      topK: 5,
    };

    const result = searchBestLineups(lineup, config);

    for (let i = 1; i < result.byMean.length; i++) {
      expect(result.byMean[i - 1].mean).toBeGreaterThanOrEqual(result.byMean[i].mean);
    }
  });

  it('byVarianceは分散の昇順で並ぶ', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 20,
      gamesPerCandidate: 100,
      seed: 42,
      topK: 5,
    };

    const result = searchBestLineups(lineup, config);

    for (let i = 1; i < result.byVariance.length; i++) {
      expect(result.byVariance[i - 1].variance).toBeLessThanOrEqual(
        result.byVariance[i].variance,
      );
    }
  });

  it('numCandidates < topK → 候補数分だけ返る', () => {
    const lineup = variedLineup();
    const config: SearchConfig = {
      numCandidates: 3,
      gamesPerCandidate: 50,
      seed: 42,
      topK: 10,
    };

    const result = searchBestLineups(lineup, config);

    expect(result.byMean).toHaveLength(3);
    expect(result.byVariance).toHaveLength(3);
  });
});
