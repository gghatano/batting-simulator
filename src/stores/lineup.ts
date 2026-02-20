// ---------------------------------------------------------------------------
// lineup.ts — Svelte stores for the 9-batter lineup
// ---------------------------------------------------------------------------

import { writable, get } from "svelte/store";
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

/**
 * Add a player to the currently selected slot, then advance selectedSlotStore
 * to the next empty slot (wrapping around). If all slots are filled, advance
 * to (current + 1) % 9.
 */
export function addPlayerToSelectedSlot(player: Player): void {
  const currentSlot = get(selectedSlotStore);
  setSlot(currentSlot, player);

  // Read the lineup *after* setting the slot
  const lineup = get(lineupStore);

  // Find the next empty slot, starting from currentSlot + 1 and wrapping
  for (let offset = 1; offset <= 9; offset++) {
    const candidate = (currentSlot + offset) % 9;
    if (lineup[candidate] === null) {
      selectedSlotStore.set(candidate);
      return;
    }
  }

  // All slots filled — move to next slot cyclically
  selectedSlotStore.set((currentSlot + 1) % 9);
}
