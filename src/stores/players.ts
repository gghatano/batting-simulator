// ---------------------------------------------------------------------------
// players.ts — Svelte store for player data loaded from players.json
// ---------------------------------------------------------------------------

import { writable, derived } from 'svelte/store';
import type { Player } from '../lib/models';

// ---------------------------------------------------------------------------
// Sort key type
// ---------------------------------------------------------------------------

/** Available sort keys for the player list */
export type SortKey = 'pa' | 'hr_per_pa' | 'ops';

// ---------------------------------------------------------------------------
// Filters store
// ---------------------------------------------------------------------------

/** Filter/sort criteria for the player list */
export interface Filters {
  /** Team name to filter by, or '' for all teams */
  team: string;
  /** Name search query (partial match) */
  query: string;
  /** Sort key */
  sort: SortKey;
}

/** Store holding the current filter/sort state */
export const filtersStore = writable<Filters>({
  team: '',
  query: '',
  sort: 'pa',
});

/** Store holding the loaded player array */
export const playersStore = writable<Player[]>([]);

/** Whether player data is currently being fetched */
export const playersLoading = writable<boolean>(false);

/** Error message if the fetch failed, or null if OK */
export const playersError = writable<string | null>(null);

/**
 * Fetch `players.json` and populate `playersStore`.
 *
 * The JSON file is served from `public/` so Vite resolves it relative to
 * `base`.  We use `import.meta.env.BASE_URL` so the path works both in
 * dev and in production (GitHub Pages with a sub-path).
 */
export async function loadPlayers(): Promise<void> {
  playersLoading.set(true);
  playersError.set(null);

  try {
    const url = `${import.meta.env.BASE_URL}players.json`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch players.json: ${res.status} ${res.statusText}`);
    }

    const data: Player[] = await res.json();
    playersStore.set(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[playersStore] loadPlayers failed:', message);
    playersError.set(message);
  } finally {
    playersLoading.set(false);
  }
}

// ---------------------------------------------------------------------------
// Derived stores
// ---------------------------------------------------------------------------

/** Dynamically extracted list of unique team names from playersStore */
export const teamsStore = derived(playersStore, ($players) => {
  const teamSet = new Set($players.map((p) => p.team));
  return [...teamSet].sort();
});

/**
 * Compute OPS (On-base Plus Slugging) for a player.
 *
 * OBP = (H + BB + HBP) / PA
 * SLG = TB / AB   where AB = PA - BB - HBP, TB = 1B + 2*2B + 3*3B + 4*HR
 *
 * If PA or AB is 0, returns 0.
 */
export function computeOPS(p: Player): number {
  if (p.pa === 0) return 0;
  const hits = p.single + p.double + p.triple + p.hr;
  const obp = (hits + p.bb + p.hbp) / p.pa;
  const ab = p.pa - p.bb - p.hbp;
  if (ab === 0) return obp; // SLG undefined, treat as OBP only
  const tb = p.single + 2 * p.double + 3 * p.triple + 4 * p.hr;
  const slg = tb / ab;
  return obp + slg;
}

/** Filtered and sorted player list derived from playersStore + filtersStore */
export const filteredPlayersStore = derived(
  [playersStore, filtersStore],
  ([$players, $filters]) => {
    let result = $players;

    // --- Team filter ---
    if ($filters.team !== '') {
      result = result.filter((p) => p.team === $filters.team);
    }

    // --- Name search (case-insensitive partial match) ---
    if ($filters.query !== '') {
      const q = $filters.query.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // --- Sort (all descending) ---
    result = [...result].sort((a, b) => {
      switch ($filters.sort) {
        case 'pa':
          return b.pa - a.pa;
        case 'hr_per_pa':
          return (b.pa === 0 ? 0 : b.hr / b.pa) - (a.pa === 0 ? 0 : a.hr / a.pa);
        case 'ops':
          return computeOPS(b) - computeOPS(a);
        default:
          return 0;
      }
    });

    return result;
  },
);
