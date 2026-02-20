import { describe, it, expect } from "vitest";
import { calcBatterRates } from "../rates";
import type { Player } from "../models";

/** Helper to create a Player with defaults for non-stat fields */
function makePlayer(stats: Partial<Player> & { pa: number }): Player {
  return {
    id: 1,
    name: "Test Player",
    team: "Test Team",
    position: "投",
    single: 0,
    double: 0,
    triple: 0,
    hr: 0,
    bb: 0,
    hbp: 0,
    so: 0,
    ...stats,
  };
}

describe("calcBatterRates", () => {
  it("returns correct rates for normal stats and sums to 1.0", () => {
    const player = makePlayer({
      pa: 500,
      single: 100,
      double: 30,
      triple: 5,
      hr: 20,
      bb: 50,
      hbp: 5,
      so: 100,
    });

    const rates = calcBatterRates(player);

    expect(rates.single).toBeCloseTo(100 / 500, 10);
    expect(rates.double).toBeCloseTo(30 / 500, 10);
    expect(rates.triple).toBeCloseTo(5 / 500, 10);
    expect(rates.hr).toBeCloseTo(20 / 500, 10);
    expect(rates.bb_hbp).toBeCloseTo(55 / 500, 10);
    expect(rates.k).toBeCloseTo(100 / 500, 10);
    expect(rates.out).toBeCloseTo(190 / 500, 10);

    const sum =
      rates.single +
      rates.double +
      rates.triple +
      rates.hr +
      rates.bb_hbp +
      rates.k +
      rates.out;
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("throws an error when PA is 0", () => {
    const player = makePlayer({ pa: 0 });
    expect(() => calcBatterRates(player)).toThrow("PA is 0");
  });

  it("returns pHR=1.0 and all others 0 when all PA are HR", () => {
    const player = makePlayer({ pa: 100, hr: 100 });
    const rates = calcBatterRates(player);

    expect(rates.hr).toBeCloseTo(1.0, 10);
    expect(rates.single).toBeCloseTo(0, 10);
    expect(rates.double).toBeCloseTo(0, 10);
    expect(rates.triple).toBeCloseTo(0, 10);
    expect(rates.bb_hbp).toBeCloseTo(0, 10);
    expect(rates.k).toBeCloseTo(0, 10);
    expect(rates.out).toBeCloseTo(0, 10);
  });

  it("returns pK=1.0 when all PA are strikeouts (pOUT=0)", () => {
    const player = makePlayer({ pa: 100, so: 100 });
    const rates = calcBatterRates(player);

    expect(rates.k).toBeCloseTo(1.0, 10);
    expect(rates.out).toBeCloseTo(0, 10);
  });

  it("returns pBB_HBP=1.0 when all PA are walks", () => {
    const player = makePlayer({ pa: 100, bb: 80, hbp: 20 });
    const rates = calcBatterRates(player);

    expect(rates.bb_hbp).toBeCloseTo(1.0, 10);
    expect(rates.out).toBeCloseTo(0, 10);
  });

  it("produces pOUT > 0 for typical stats", () => {
    const player = makePlayer({
      pa: 600,
      single: 120,
      double: 25,
      triple: 3,
      hr: 15,
      bb: 40,
      hbp: 5,
      so: 80,
    });
    const rates = calcBatterRates(player);

    expect(rates.out).toBeGreaterThan(0);
  });

  it("has all rates summing to 1.0 (floating-point precision)", () => {
    // Use values that could cause floating-point issues
    const player = makePlayer({
      pa: 333,
      single: 77,
      double: 22,
      triple: 3,
      hr: 11,
      bb: 33,
      hbp: 7,
      so: 66,
    });
    const rates = calcBatterRates(player);

    const sum =
      rates.single +
      rates.double +
      rates.triple +
      rates.hr +
      rates.bb_hbp +
      rates.k +
      rates.out;
    expect(sum).toBeCloseTo(1.0, 10);
  });
});
