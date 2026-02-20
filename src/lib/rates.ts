// ---------------------------------------------------------------------------
// rates.ts — Compute per-batter event probabilities from raw stats
// ---------------------------------------------------------------------------

import type { Player, BatterRates } from "./models";

/**
 * Calculate event probabilities for a batter based on their raw stats.
 * All rates sum to 1.0. pOUT is computed as the residual.
 *
 * @throws {Error} if player.pa is 0
 */
export function calcBatterRates(player: Player): BatterRates {
  const { pa, single, double: dbl, triple, hr, bb, hbp, so } = player;

  if (pa === 0) {
    throw new Error("Cannot calculate rates: PA is 0");
  }

  const pSingle = single / pa;
  const pDouble = dbl / pa;
  const pTriple = triple / pa;
  const pHR = hr / pa;
  const pBB_HBP = (bb + hbp) / pa;
  const pK = so / pa;
  const pOUT = 1 - (pSingle + pDouble + pTriple + pHR + pBB_HBP + pK);

  return {
    single: pSingle,
    double: pDouble,
    triple: pTriple,
    hr: pHR,
    bb_hbp: pBB_HBP,
    k: pK,
    out: pOUT,
  };
}
