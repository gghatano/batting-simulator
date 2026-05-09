import { describe, it, expect } from 'vitest';
import { projectSeason } from '../seasonStats';
import type { Player, SimResult } from '../models';

function p(overrides: Partial<Player>): Player {
  return {
    id: 1,
    name: 'X',
    team: 'T',
    position: '一',
    pa: 600,
    single: 90,
    double: 25,
    triple: 2,
    hr: 20,
    bb: 50,
    hbp: 5,
    so: 110,
    ...overrides,
  };
}

function sim(mean: number): SimResult {
  return { mean, median: mean, p10: mean, p90: mean, distribution: [], truncatedGames: 0 };
}

describe('projectSeason', () => {
  it('returns zeros for empty lineup', () => {
    const proj = projectSeason([], sim(0));
    expect(proj.ab).toBe(0);
    expect(proj.hits).toBe(0);
    expect(proj.runs).toBe(0);
  });

  it('returns zeros when all players have pa=0', () => {
    const lineup = Array.from({ length: 9 }, () => p({ pa: 0 }));
    const proj = projectSeason(lineup, sim(4));
    expect(proj.ab).toBe(0);
    expect(proj.hits).toBe(0);
  });

  it('produces sensible values for a typical lineup', () => {
    const lineup = Array.from({ length: 9 }, () => p({}));
    const proj = projectSeason(lineup, sim(4.5));

    // Realistic NPB-ish bounds for 143-game team batting
    expect(proj.games).toBe(143);
    expect(proj.runs).toBe(Math.round(4.5 * 143)); // 644
    expect(proj.ab).toBeGreaterThan(4500);
    expect(proj.ab).toBeLessThan(5500);
    expect(proj.hits).toBeGreaterThan(1100);
    expect(proj.hits).toBeLessThan(1700);
    expect(proj.avg).toBeGreaterThan(0.22);
    expect(proj.avg).toBeLessThan(0.32);
    expect(proj.hr).toBeGreaterThan(80);
    expect(proj.hr).toBeLessThan(250);
    expect(proj.rbi).toBe(proj.runs);
  });

  it('scales counts roughly linearly with games per season', () => {
    const lineup = Array.from({ length: 9 }, () => p({}));
    const a = projectSeason(lineup, sim(4.5), 100);
    const b = projectSeason(lineup, sim(4.5), 200);
    // 200 games should have roughly 2x the AB/H/HR
    expect(b.ab / a.ab).toBeGreaterThan(1.9);
    expect(b.ab / a.ab).toBeLessThan(2.1);
    expect(b.runs).toBe(2 * a.runs);
  });

  it('higher HR rate → more projected HRs', () => {
    const slugger = Array.from({ length: 9 }, () =>
      p({ pa: 600, hr: 60, single: 50, double: 25, triple: 2, bb: 50, hbp: 5, so: 100 }),
    );
    const contact = Array.from({ length: 9 }, () =>
      p({ pa: 600, hr: 5, single: 150, double: 25, triple: 2, bb: 50, hbp: 5, so: 100 }),
    );
    const projSlugger = projectSeason(slugger, sim(5));
    const projContact = projectSeason(contact, sim(5));
    expect(projSlugger.hr).toBeGreaterThan(projContact.hr);
  });

  it('skips players with pa=0 in the average', () => {
    const lineup: Player[] = [
      ...Array.from({ length: 8 }, () => p({})),
      p({ pa: 0, single: 0, double: 0, triple: 0, hr: 0, bb: 0, hbp: 0, so: 0 }),
    ];
    const proj = projectSeason(lineup, sim(4));
    // Should still produce a normal-looking line because 8 valid players are averaged
    expect(proj.ab).toBeGreaterThan(4500);
    expect(proj.hits).toBeGreaterThan(1100);
  });
});
