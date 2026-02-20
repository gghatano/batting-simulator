// ---------------------------------------------------------------------------
// players.ts — Svelte store for player data loaded from players.json
// ---------------------------------------------------------------------------

import { writable } from 'svelte/store';
import type { Player } from '../lib/models';

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
