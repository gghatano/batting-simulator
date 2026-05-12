// ---------------------------------------------------------------------------
// seasonStats.ts — Project a 143-game team batting line from lineup + sim result
// ---------------------------------------------------------------------------

import type { Player, SimResult } from './models';

/** Default games per NPB regular season */
export const DEFAULT_SEASON_GAMES = 143;

/** Projected team batting line for a hypothetical full season */
export interface SeasonProjection {
  /** Display label (e.g. "想定シーズン") */
  team: string;
  /** 打率 (BA) — fraction in [0, 1) */
  avg: number;
  /** 試合 */
  games: number;
  /** 打数 (AB) */
  ab: number;
  /** 得点 (R) */
  runs: number;
  /** 安打 (H) */
  hits: number;
  /** 二塁打 (2B) */
  doubles: number;
  /** 三塁打 (3B) */
  triples: number;
  /** 本塁打 (HR) */
  hr: number;
  /** 打点 (RBI) — approximated by team runs */
  rbi: number;
}

const EMPTY: SeasonProjection = {
  team: '想定シーズン',
  avg: 0,
  games: DEFAULT_SEASON_GAMES,
  ab: 0,
  runs: 0,
  hits: 0,
  doubles: 0,
  triples: 0,
  hr: 0,
  rbi: 0,
};

/**
 * Project a 143-game team batting line by averaging the 9 hitters' per-PA
 * rates and combining with the simulation's runs-per-game.
 *
 * Assumptions:
 * - Each lineup spot gets an equal share of plate appearances over the season.
 * - PAs/inning ≈ 3 / p_out where p_out = 1 − (hit + walk + HBP) rates.
 * - 打点 ≈ 得点 at team level (most runs are RBI'd).
 * - Sacrifice flies are ignored (counted into "out").
 */
export function projectSeason(
  lineup: Player[],
  result: SimResult,
  gamesPerSeason: number = DEFAULT_SEASON_GAMES,
): SeasonProjection {
  if (lineup.length === 0) return { ...EMPTY, games: gamesPerSeason };

  // Average per-PA rates across valid players (pa > 0)
  let single = 0;
  let double_ = 0;
  let triple = 0;
  let hr = 0;
  let bb = 0;
  let hbp = 0;
  let valid = 0;

  for (const p of lineup) {
    if (p.pa <= 0) continue;
    single += p.single / p.pa;
    double_ += p.double / p.pa;
    triple += p.triple / p.pa;
    hr += p.hr / p.pa;
    bb += p.bb / p.pa;
    hbp += p.hbp / p.pa;
    valid++;
  }

  if (valid === 0) return { ...EMPTY, games: gamesPerSeason };

  const norm = 1 / valid;
  const r = {
    single: single * norm,
    double: double_ * norm,
    triple: triple * norm,
    hr: hr * norm,
    bb: bb * norm,
    hbp: hbp * norm,
  };

  const onBaseRate = r.single + r.double + r.triple + r.hr + r.bb + r.hbp;
  const outRate = Math.max(1 - onBaseRate, 1e-9); // avoid divide by zero
  const paPerGame = (3 / outRate) * 9;
  const teamPAs = paPerGame * gamesPerSeason;

  const hits1 = teamPAs * r.single;
  const hits2 = teamPAs * r.double;
  const hits3 = teamPAs * r.triple;
  const hitsHR = teamPAs * r.hr;
  const totalHits = hits1 + hits2 + hits3 + hitsHR;

  const bbCount = teamPAs * r.bb;
  const hbpCount = teamPAs * r.hbp;
  const ab = teamPAs - bbCount - hbpCount;
  const avg = ab > 0 ? totalHits / ab : 0;

  const runs = result.mean * gamesPerSeason;

  return {
    team: '想定シーズン',
    avg,
    games: gamesPerSeason,
    ab: Math.round(ab),
    runs: Math.round(runs),
    hits: Math.round(totalHits),
    doubles: Math.round(hits2),
    triples: Math.round(hits3),
    hr: Math.round(hitsHR),
    rbi: Math.round(runs),
  };
}
