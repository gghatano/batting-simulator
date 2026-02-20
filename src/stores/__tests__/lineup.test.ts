import { describe, it, expect, beforeEach } from "vitest";
import { get } from "svelte/store";
import type { Player } from "../../lib/models";
import {
  lineupStore,
  selectedSlotStore,
  setSlot,
  clearSlot,
  clearAll,
  swapSlots,
} from "../lineup";

// --- Test fixtures ---

const playerA: Player = {
  id: 1,
  name: "Player A",
  team: "Team X",
  pa: 500,
  single: 100,
  double: 30,
  triple: 5,
  hr: 20,
  bb: 50,
  hbp: 5,
  so: 80,
};

const playerB: Player = {
  id: 2,
  name: "Player B",
  team: "Team Y",
  pa: 450,
  single: 90,
  double: 25,
  triple: 3,
  hr: 15,
  bb: 40,
  hbp: 3,
  so: 70,
};

// --- Tests ---

describe("lineupStore", () => {
  beforeEach(() => {
    clearAll();
    selectedSlotStore.set(0);
  });

  it("initializes with 9 null slots", () => {
    const lineup = get(lineupStore);
    expect(lineup).toHaveLength(9);
    expect(lineup.every((slot) => slot === null)).toBe(true);
  });

  it("setSlot sets a player in the specified slot", () => {
    setSlot(0, playerA);
    const lineup = get(lineupStore);
    expect(lineup[0]).toEqual(playerA);
  });

  it("allows duplicate players (same player in multiple slots)", () => {
    setSlot(0, playerA);
    setSlot(1, playerA);
    const lineup = get(lineupStore);
    expect(lineup[0]).toEqual(playerA);
    expect(lineup[1]).toEqual(playerA);
  });

  it("clearSlot clears only the specified slot", () => {
    setSlot(0, playerA);
    setSlot(1, playerB);
    clearSlot(0);
    const lineup = get(lineupStore);
    expect(lineup[0]).toBeNull();
    expect(lineup[1]).toEqual(playerB);
  });

  it("clearAll resets all slots to null", () => {
    setSlot(0, playerA);
    setSlot(3, playerB);
    setSlot(8, playerA);
    clearAll();
    const lineup = get(lineupStore);
    expect(lineup).toHaveLength(9);
    expect(lineup.every((slot) => slot === null)).toBe(true);
  });

  it("swapSlots swaps the contents of two slots", () => {
    setSlot(0, playerA);
    setSlot(1, playerB);
    swapSlots(0, 1);
    const lineup = get(lineupStore);
    expect(lineup[0]).toEqual(playerB);
    expect(lineup[1]).toEqual(playerA);
  });

  it("swapSlots works with a null slot", () => {
    setSlot(0, playerA);
    swapSlots(0, 1);
    const lineup = get(lineupStore);
    expect(lineup[0]).toBeNull();
    expect(lineup[1]).toEqual(playerA);
  });
});

describe("selectedSlotStore", () => {
  beforeEach(() => {
    selectedSlotStore.set(0);
  });

  it("initializes with 0", () => {
    expect(get(selectedSlotStore)).toBe(0);
  });

  it("can be updated to any slot index", () => {
    selectedSlotStore.set(5);
    expect(get(selectedSlotStore)).toBe(5);
  });
});
