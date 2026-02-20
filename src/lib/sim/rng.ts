/**
 * Seeded PRNG using the mulberry32 algorithm.
 * Produces reproducible sequences of pseudo-random numbers in [0, 1).
 */

/**
 * Creates a seeded pseudo-random number generator using mulberry32.
 * If no seed is provided, a random seed is generated from Math.random().
 *
 * @param seed - Integer seed for the PRNG
 * @returns A function that returns a pseudo-random number in [0, 1) on each call
 */
export function createRng(seed?: number): () => number {
  if (seed === undefined) {
    seed = (Math.random() * 0xffffffff) >>> 0;
  }

  let state = seed | 0;

  return (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}
