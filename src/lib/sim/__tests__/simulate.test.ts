import { describe, it, expect } from 'vitest';
import { simulateGame, simulateN } from '../simulate';
import { createRng } from '../rng';
import type { BatterRates } from '../../models';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a 9-batter lineup where every batter has the same rates */
function uniformLineup(rates: BatterRates): BatterRates[] {
  return Array.from({ length: 9 }, () => ({ ...rates }));
}

/** BatterRates with pOUT = 1.0 (all other events 0) */
const allOut: BatterRates = {
  single: 0,
  double: 0,
  triple: 0,
  hr: 0,
  bb_hbp: 0,
  k: 0,
  out: 1.0,
};

/** BatterRates with pHR = 1.0 (all other events 0) */
const allHR: BatterRates = {
  single: 0,
  double: 0,
  triple: 0,
  hr: 1.0,
  bb_hbp: 0,
  k: 0,
  out: 0,
};

// ---------------------------------------------------------------------------
// simulateGame
// ---------------------------------------------------------------------------

describe('simulateGame', () => {
  it('全打者 pOUT=1.0 → 0得点', () => {
    const lineup = uniformLineup(allOut);
    const rng = createRng(42);
    const runs = simulateGame(lineup, rng);
    expect(runs).toBe(0);
  });

  it('全打者 pHR=1.0 → 全打席HRで大量得点（9回 × 100PA上限 = 900得点）', () => {
    const lineup = uniformLineup(allHR);
    const rng = createRng(42);
    const runs = simulateGame(lineup, rng);
    // With pHR=1.0, no outs ever occur. Each inning hits MAX_PA_PER_INNING (100).
    // Each HR with empty bases = 1 run (solo HR). All HRs clear bases.
    // 9 innings × 100 solo HRs = 900 runs.
    expect(runs).toBe(900);
  });

  it('打順は回をまたいで引き継がれる', () => {
    // Use pOUT=1.0 lineup: each inning uses exactly 3 PAs (3 outs).
    // 9 innings × 3 PAs = 27 total PAs.
    // With 9 batters, batter index after the game should be 27 (= 3 full cycles).
    // This means the order wraps: 1-9, 1-9, 1-9.
    // We verify by using a lineup where batter 1 hits HR and rest are out.
    const lineup: BatterRates[] = Array.from({ length: 9 }, (_, i) => {
      if (i === 0) {
        // Batter 1: HR always
        return { single: 0, double: 0, triple: 0, hr: 1.0, bb_hbp: 0, k: 0, out: 0 };
      }
      // All other batters: always out
      return { single: 0, double: 0, triple: 0, hr: 0, bb_hbp: 0, k: 0, out: 1.0 };
    });

    const rng = createRng(99);
    const runs = simulateGame(lineup, rng);

    // Inning pattern analysis:
    // Inning 1: batter 1 (HR, 1 run), batter 2 (out), batter 3 (out), batter 4 (out) → 1 run, 3 outs
    // Inning 2: batter 5 (out), batter 6 (out), batter 7 (out) → 0 runs, 3 outs
    // Inning 3: batter 8 (out), batter 9 (out), batter 1 (HR, 1 run), batter 2 (out) → 1 run
    // Wait, 3 outs reached at batter 9's out (2 outs), then batter 1 HR doesn't cause an out...
    // Let me trace more carefully:
    //
    // Inning 1: B1=HR(0 outs), B2=OUT(1), B3=OUT(2), B4=OUT(3) → 1 run
    // Inning 2: B5=OUT(1), B6=OUT(2), B7=OUT(3) → 0 runs
    // Inning 3: B8=OUT(1), B9=OUT(2), B1=HR(2 outs still), B2=OUT(3) → 1 run
    // Inning 4: B3=OUT(1), B4=OUT(2), B5=OUT(3) → 0 runs
    // Inning 5: B6=OUT(1), B7=OUT(2), B8=OUT(3) → 0 runs
    // Inning 6: B9=OUT(1), B1=HR(1 out still), B2=OUT(2), B3=OUT(3) → 1 run
    // Inning 7: B4=OUT(1), B5=OUT(2), B6=OUT(3) → 0 runs
    // Inning 8: B7=OUT(1), B8=OUT(2), B9=OUT(3) → 0 runs
    // Inning 9: B1=HR(0 outs), B2=OUT(1), B3=OUT(2), B4=OUT(3) → 1 run
    //
    // Total: 1 + 0 + 1 + 0 + 0 + 1 + 0 + 0 + 1 = 4 runs
    expect(runs).toBe(4);
  });

  it('seed固定で2回実行 → 同じ結果', () => {
    const lineup = uniformLineup({
      single: 0.2,
      double: 0.05,
      triple: 0.01,
      hr: 0.03,
      bb_hbp: 0.08,
      k: 0.2,
      out: 0.43,
    });

    const runs1 = simulateGame(lineup, createRng(12345));
    const runs2 = simulateGame(lineup, createRng(12345));
    expect(runs1).toBe(runs2);
  });
});

// ---------------------------------------------------------------------------
// simulateN
// ---------------------------------------------------------------------------

describe('simulateN', () => {
  it('全打者 pOUT=1.0 → 全試行0得点、mean=0, median=0', () => {
    const lineup = uniformLineup(allOut);
    const result = simulateN(lineup, 100, 42);

    expect(result.mean).toBe(0);
    expect(result.median).toBe(0);
    expect(result.p10).toBe(0);
    expect(result.p90).toBe(0);
    expect(result.distribution).toEqual([100]); // 100 games, all 0 runs
  });

  it('全打者 pHR=1.0 → 確定的に900得点', () => {
    const lineup = uniformLineup(allHR);
    const result = simulateN(lineup, 10, 42);

    expect(result.mean).toBe(900);
    expect(result.median).toBe(900);
    expect(result.p10).toBe(900);
    expect(result.p90).toBe(900);
    // distribution[900] should be 10
    expect(result.distribution[900]).toBe(10);
  });

  it('seed固定で2回実行 → 結果が完全一致', () => {
    const lineup = uniformLineup({
      single: 0.18,
      double: 0.04,
      triple: 0.005,
      hr: 0.025,
      bb_hbp: 0.08,
      k: 0.22,
      out: 0.45,
    });

    const r1 = simulateN(lineup, 500, 777);
    const r2 = simulateN(lineup, 500, 777);

    expect(r1.mean).toBe(r2.mean);
    expect(r1.median).toBe(r2.median);
    expect(r1.p10).toBe(r2.p10);
    expect(r1.p90).toBe(r2.p90);
    expect(r1.distribution).toEqual(r2.distribution);
  });

  it('seedを変える → 結果が異なる（高確率で）', () => {
    const lineup = uniformLineup({
      single: 0.18,
      double: 0.04,
      triple: 0.005,
      hr: 0.025,
      bb_hbp: 0.08,
      k: 0.22,
      out: 0.45,
    });

    const r1 = simulateN(lineup, 1000, 111);
    const r2 = simulateN(lineup, 1000, 222);

    // It's extremely unlikely that two different seeds produce identical means
    const isDifferent =
      r1.mean !== r2.mean ||
      r1.median !== r2.median ||
      r1.p10 !== r2.p10 ||
      r1.p90 !== r2.p90;
    expect(isDifferent).toBe(true);
  });

  it('N=1 → クラッシュしない、結果が返る', () => {
    const lineup = uniformLineup({
      single: 0.2,
      double: 0.05,
      triple: 0.01,
      hr: 0.03,
      bb_hbp: 0.08,
      k: 0.2,
      out: 0.43,
    });

    const result = simulateN(lineup, 1, 42);
    expect(typeof result.mean).toBe('number');
    expect(typeof result.median).toBe('number');
    expect(typeof result.p10).toBe('number');
    expect(typeof result.p90).toBe('number');
    expect(result.distribution.length).toBeGreaterThan(0);
  });

  it('N=1000で統計量が妥当な範囲', () => {
    // Typical batter rates (roughly league average)
    const lineup = uniformLineup({
      single: 0.16,
      double: 0.04,
      triple: 0.005,
      hr: 0.03,
      bb_hbp: 0.09,
      k: 0.22,
      out: 0.455,
    });

    const result = simulateN(lineup, 1000, 42);

    // Average MLB team scores ~4-5 runs per game.
    // With these rates, expect something in a reasonable range (1-15).
    expect(result.mean).toBeGreaterThan(0);
    expect(result.mean).toBeLessThan(20);
    expect(result.median).toBeGreaterThanOrEqual(0);
    expect(result.p10).toBeLessThanOrEqual(result.median);
    expect(result.median).toBeLessThanOrEqual(result.p90);
  });
});
