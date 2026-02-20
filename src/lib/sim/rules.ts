// ---------------------------------------------------------------------------
// rules.ts — Base runner advancement and scoring rules per event type
// ---------------------------------------------------------------------------

/** Batting event types */
export type BatEvent = 'BB_HBP' | 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'HR' | 'OUT';

/** Base runner state */
export interface Bases {
  first: boolean;
  second: boolean;
  third: boolean;
}

/** Result of applying a batting event */
export interface ApplyEventResult {
  bases: Bases;
  outs: number;
  runsScored: number;
}

/**
 * Apply a batting event to the current game state and return the updated state.
 *
 * Advancement rules (simplified):
 * - BB/HBP: forced advancement only (runners move up if forced by batter)
 * - 1B: runners on 2B/3B score, 1B->2B, batter->1B
 * - 2B: runners on 2B/3B score, 1B->3B, batter->2B
 * - 3B: all runners score, batter->3B
 * - HR:  all runners + batter score, bases cleared
 * - OUT: out count +1, no runner movement
 */
export function applyEvent(
  event: BatEvent,
  bases: Bases,
  outs: number,
): ApplyEventResult {
  switch (event) {
    case 'BB_HBP': {
      // Forced advancement: runners only advance if pushed by the runner behind them.
      // Batter always goes to 1B. Each occupied base forces the runner ahead
      // only if the base behind is also occupied (chain from 1B).
      let runs = 0;
      let newThird = bases.third;
      let newSecond = bases.second;

      if (bases.first) {
        if (bases.second) {
          if (bases.third) {
            runs += 1; // 3B runner forced home
          }
          newThird = true;  // 2B -> 3B
        } else {
          newSecond = true; // 1B -> 2B
        }
      }

      const newBases: Bases = {
        first: true,      // batter -> 1B
        second: newSecond,
        third: newThird,
      };

      return { bases: newBases, outs, runsScored: runs };
    }

    case 'SINGLE': {
      let runs = 0;
      if (bases.third) runs += 1;
      if (bases.second) runs += 1;

      const newBases: Bases = {
        first: true,              // batter -> 1B
        second: bases.first,      // 1B -> 2B
        third: false,
      };

      return { bases: newBases, outs, runsScored: runs };
    }

    case 'DOUBLE': {
      let runs = 0;
      if (bases.third) runs += 1;
      if (bases.second) runs += 1;

      const newBases: Bases = {
        first: false,
        second: true,             // batter -> 2B
        third: bases.first,       // 1B -> 3B
      };

      return { bases: newBases, outs, runsScored: runs };
    }

    case 'TRIPLE': {
      let runs = 0;
      if (bases.first) runs += 1;
      if (bases.second) runs += 1;
      if (bases.third) runs += 1;

      const newBases: Bases = {
        first: false,
        second: false,
        third: true,              // batter -> 3B
      };

      return { bases: newBases, outs, runsScored: runs };
    }

    case 'HR': {
      let runs = 1; // batter scores
      if (bases.first) runs += 1;
      if (bases.second) runs += 1;
      if (bases.third) runs += 1;

      const newBases: Bases = {
        first: false,
        second: false,
        third: false,
      };

      return { bases: newBases, outs, runsScored: runs };
    }

    case 'OUT': {
      return {
        bases: { ...bases },
        outs: outs + 1,
        runsScored: 0,
      };
    }
  }
}
