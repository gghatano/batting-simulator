import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import type { Player } from '../../lib/models';
import {
  playersStore,
  filtersStore,
  filteredPlayersStore,
  teamsStore,
  computeOPS,
} from '../players';
import type { Filters } from '../players';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const mkPlayer = (overrides: Partial<Player> & { id: number; name: string; team: string }): Player => ({
  pa: 500,
  single: 100,
  double: 20,
  triple: 3,
  hr: 15,
  bb: 50,
  hbp: 5,
  so: 80,
  position: '遊',
  ...overrides,
});

const playerA = mkPlayer({ id: 1, name: '田中 太郎', team: 'チームA', pa: 550, hr: 20 });
const playerB = mkPlayer({ id: 2, name: '鈴木 一郎', team: 'チームA', pa: 600, hr: 10 });
const playerC = mkPlayer({ id: 3, name: '佐藤 健太', team: 'チームB', pa: 400, hr: 25 });
const playerD = mkPlayer({ id: 4, name: '山田 次郎', team: 'チームB', pa: 500, hr: 30 });
const playerE = mkPlayer({ id: 5, name: '中村 太一', team: 'チームC', pa: 450, hr: 5 });

const allPlayers: Player[] = [playerA, playerB, playerC, playerD, playerE];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetStores(): void {
  playersStore.set(allPlayers);
  filtersStore.set({ team: '', position: '', query: '', sort: 'pa' });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('teamsStore', () => {
  beforeEach(resetStores);

  it('extracts unique team names sorted alphabetically', () => {
    const teams = get(teamsStore);
    expect(teams).toEqual(['チームA', 'チームB', 'チームC']);
  });

  it('returns empty array when no players loaded', () => {
    playersStore.set([]);
    expect(get(teamsStore)).toEqual([]);
  });
});

describe('computeOPS', () => {
  it('computes OPS = OBP + SLG', () => {
    // Player with known stats:
    // H = 100+20+3+15 = 138, OBP = (138+50+5)/500 = 193/500 = 0.386
    // AB = 500-50-5 = 445, TB = 100+40+9+60 = 209, SLG = 209/445 ≈ 0.4697
    // OPS ≈ 0.8557
    const p = mkPlayer({ id: 99, name: 'Test', team: 'T' });
    const ops = computeOPS(p);
    expect(ops).toBeCloseTo(0.386 + 209 / 445, 4);
  });

  it('returns 0 for player with 0 PA', () => {
    const p = mkPlayer({ id: 99, name: 'Test', team: 'T', pa: 0 });
    expect(computeOPS(p)).toBe(0);
  });
});

describe('filteredPlayersStore', () => {
  beforeEach(resetStores);

  // --- Team filter ---

  describe('team filter', () => {
    it('returns all players when team is empty string', () => {
      const result = get(filteredPlayersStore);
      expect(result).toHaveLength(5);
    });

    it('filters to only matching team', () => {
      filtersStore.update((f) => ({ ...f, team: 'チームA' }));
      const result = get(filteredPlayersStore);
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.team === 'チームA')).toBe(true);
    });

    it('returns empty when team has no players', () => {
      filtersStore.update((f) => ({ ...f, team: 'チームZ' }));
      expect(get(filteredPlayersStore)).toHaveLength(0);
    });
  });

  // --- Name search ---

  describe('name search (query)', () => {
    it('filters by partial name match', () => {
      filtersStore.update((f) => ({ ...f, query: '太' }));
      const result = get(filteredPlayersStore);
      // 田中 太郎, 佐藤 健太, 中村 太一
      expect(result).toHaveLength(3);
      expect(result.map((p) => p.id).sort()).toEqual([1, 3, 5]);
    });

    it('is case-insensitive for ASCII names', () => {
      const asciiPlayer = mkPlayer({ id: 10, name: 'John Smith', team: 'チームA', pa: 300 });
      playersStore.set([...allPlayers, asciiPlayer]);
      filtersStore.update((f) => ({ ...f, query: 'john' }));
      const result = get(filteredPlayersStore);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Smith');
    });

    it('returns all when query is empty', () => {
      filtersStore.update((f) => ({ ...f, query: '' }));
      expect(get(filteredPlayersStore)).toHaveLength(5);
    });
  });

  // --- Sort ---

  describe('sort', () => {
    it('sorts by PA descending (default)', () => {
      const result = get(filteredPlayersStore);
      const pas = result.map((p) => p.pa);
      expect(pas).toEqual([600, 550, 500, 450, 400]);
    });

    it('sorts by HR/PA descending', () => {
      filtersStore.update((f) => ({ ...f, sort: 'hr_per_pa' }));
      const result = get(filteredPlayersStore);
      const hrPerPa = result.map((p) => p.hr / p.pa);
      for (let i = 0; i < hrPerPa.length - 1; i++) {
        expect(hrPerPa[i]).toBeGreaterThanOrEqual(hrPerPa[i + 1]);
      }
      // playerC (25/400=0.0625) and playerD (30/500=0.06) should be top two
      expect(result[0].id).toBe(3); // 0.0625
      expect(result[1].id).toBe(4); // 0.06
    });

    it('sorts by OPS descending', () => {
      filtersStore.update((f) => ({ ...f, sort: 'ops' }));
      const result = get(filteredPlayersStore);
      const opsValues = result.map(computeOPS);
      for (let i = 0; i < opsValues.length - 1; i++) {
        expect(opsValues[i]).toBeGreaterThanOrEqual(opsValues[i + 1]);
      }
    });
  });

  // --- Combined conditions ---

  describe('combined filters', () => {
    it('applies team + query + sort together', () => {
      // Filter to チームA, search for 田, sort by PA desc
      filtersStore.set({ team: 'チームA', position: '', query: '田', sort: 'pa' });
      const result = get(filteredPlayersStore);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1); // 田中 太郎
    });

    it('team + sort: filters team then sorts', () => {
      filtersStore.set({ team: 'チームB', position: '', query: '', sort: 'hr_per_pa' });
      const result = get(filteredPlayersStore);
      expect(result).toHaveLength(2);
      // playerC: 25/400=0.0625, playerD: 30/500=0.06
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(4);
    });

    it('query + sort: searches then sorts', () => {
      filtersStore.set({ team: '', position: '', query: '太', sort: 'pa' });
      const result = get(filteredPlayersStore);
      // 田中 太郎 (pa=550), 中村 太一 (pa=450), 佐藤 健太 (pa=400)
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);  // pa=550
      expect(result[1].id).toBe(5);  // pa=450
      expect(result[2].id).toBe(3);  // pa=400
    });
  });
});
