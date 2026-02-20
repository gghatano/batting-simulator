import { describe, it, expect } from 'vitest';
import { applyEvent, type Bases } from '../rules';

/** Helper: create empty bases */
const empty = (): Bases => ({ first: false, second: false, third: false });

/** Helper: create loaded (full) bases */
const loaded = (): Bases => ({ first: true, second: true, third: true });

describe('applyEvent', () => {
  // -----------------------------------------------------------------------
  // BB/HBP
  // -----------------------------------------------------------------------
  describe('BB_HBP', () => {
    it('no runners + BB -> batter on 1B, 0 runs', () => {
      const result = applyEvent('BB_HBP', empty(), 0);
      expect(result.bases).toEqual({ first: true, second: false, third: false });
      expect(result.runsScored).toBe(0);
      expect(result.outs).toBe(0);
    });

    it('bases loaded + BB -> 1 run, bases still loaded', () => {
      const result = applyEvent('BB_HBP', loaded(), 0);
      expect(result.bases).toEqual({ first: true, second: true, third: true });
      expect(result.runsScored).toBe(1);
      expect(result.outs).toBe(0);
    });

    it('runner on 1B only + BB -> 1B & 2B occupied, 0 runs', () => {
      const result = applyEvent('BB_HBP', { first: true, second: false, third: false }, 0);
      expect(result.bases).toEqual({ first: true, second: true, third: false });
      expect(result.runsScored).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // SINGLE
  // -----------------------------------------------------------------------
  describe('SINGLE', () => {
    it('no runners + 1B -> batter on 1B, 0 runs', () => {
      const result = applyEvent('SINGLE', empty(), 0);
      expect(result.bases).toEqual({ first: true, second: false, third: false });
      expect(result.runsScored).toBe(0);
    });

    it('runner on 3B + 1B -> 1 run, batter on 1B', () => {
      const result = applyEvent('SINGLE', { first: false, second: false, third: true }, 0);
      expect(result.bases).toEqual({ first: true, second: false, third: false });
      expect(result.runsScored).toBe(1);
    });

    it('runners on 1B & 2B + 1B -> 2B scores, 1B->2B, batter->1B', () => {
      // Rules: runners on 2B/3B score, 1B->2B, batter->1B
      // With 1B & 2B occupied: 2B runner scores (1 run), 1B->2B, batter->1B
      const result = applyEvent('SINGLE', { first: true, second: true, third: false }, 0);
      expect(result.bases).toEqual({ first: true, second: true, third: false });
      expect(result.runsScored).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // DOUBLE
  // -----------------------------------------------------------------------
  describe('DOUBLE', () => {
    it('runner on 1B + 2B -> 1B->3B, batter->2B, 0 runs', () => {
      const result = applyEvent('DOUBLE', { first: true, second: false, third: false }, 0);
      expect(result.bases).toEqual({ first: false, second: true, third: true });
      expect(result.runsScored).toBe(0);
    });

    it('1B & 2B + 2B -> 2B scores, 1B->3B, batter->2B', () => {
      const result = applyEvent('DOUBLE', { first: true, second: true, third: false }, 0);
      expect(result.bases).toEqual({ first: false, second: true, third: true });
      expect(result.runsScored).toBe(1);
    });

    it('bases loaded + 2B -> 2 runs (3B & 2B score), 1B->3B, batter->2B', () => {
      const result = applyEvent('DOUBLE', loaded(), 0);
      expect(result.bases).toEqual({ first: false, second: true, third: true });
      expect(result.runsScored).toBe(2);
    });
  });

  // -----------------------------------------------------------------------
  // TRIPLE
  // -----------------------------------------------------------------------
  describe('TRIPLE', () => {
    it('bases loaded + 3B -> 3 runs, batter on 3B', () => {
      const result = applyEvent('TRIPLE', loaded(), 0);
      expect(result.bases).toEqual({ first: false, second: false, third: true });
      expect(result.runsScored).toBe(3);
    });

    it('no runners + 3B -> batter on 3B, 0 runs', () => {
      const result = applyEvent('TRIPLE', empty(), 0);
      expect(result.bases).toEqual({ first: false, second: false, third: true });
      expect(result.runsScored).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // HR
  // -----------------------------------------------------------------------
  describe('HR', () => {
    it('bases loaded + HR -> 4 runs (grand slam), bases cleared', () => {
      const result = applyEvent('HR', loaded(), 0);
      expect(result.bases).toEqual({ first: false, second: false, third: false });
      expect(result.runsScored).toBe(4);
    });

    it('no runners + HR -> 1 run (solo), bases cleared', () => {
      const result = applyEvent('HR', empty(), 0);
      expect(result.bases).toEqual({ first: false, second: false, third: false });
      expect(result.runsScored).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // OUT (K/OUT)
  // -----------------------------------------------------------------------
  describe('OUT', () => {
    it('no runners + OUT -> 0 runs, outs +1', () => {
      const result = applyEvent('OUT', empty(), 0);
      expect(result.bases).toEqual({ first: false, second: false, third: false });
      expect(result.runsScored).toBe(0);
      expect(result.outs).toBe(1);
    });

    it('bases loaded + OUT -> 0 runs, outs +1, runners unchanged', () => {
      const result = applyEvent('OUT', loaded(), 1);
      expect(result.bases).toEqual({ first: true, second: true, third: true });
      expect(result.runsScored).toBe(0);
      expect(result.outs).toBe(2);
    });
  });
});
