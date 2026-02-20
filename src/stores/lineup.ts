// ---------------------------------------------------------------------------
// lineup.ts — Svelte stores for the 9-batter lineup
// ---------------------------------------------------------------------------

import { writable } from "svelte/store";
import type { Player, Lineup } from "../lib/models";

// --- Lineup store (9 slots, initially all null) ---

const initialLineup: Lineup = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

export const lineupStore = writable<Lineup>([...initialLineup]);

// --- Selected slot store (0–8) ---

export const selectedSlotStore = writable<number>(0);

// --- Operations ---

/** Set a player into the given lineup slot (duplicates allowed). */
export function setSlot(index: number, player: Player): void {
  lineupStore.update((lineup) => {
    const next = [...lineup] as Lineup;
    next[index] = player;
    return next;
  });
}

/** Clear a single lineup slot (set to null). */
export function clearSlot(index: number): void {
  lineupStore.update((lineup) => {
    const next = [...lineup] as Lineup;
    next[index] = null;
    return next;
  });
}

/** Clear all 9 lineup slots. */
export function clearAll(): void {
  lineupStore.set([...initialLineup]);
}

/** Swap the contents of two lineup slots. */
export function swapSlots(i: number, j: number): void {
  lineupStore.update((lineup) => {
    const next = [...lineup] as Lineup;
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    return next;
  });
}
