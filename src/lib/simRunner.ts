// ---------------------------------------------------------------------------
// simRunner.ts — Main-thread helper to run simulation via Web Worker
// ---------------------------------------------------------------------------

import type { BatterRates, SimResult } from './models';
import type { SimWorkerInput, SimWorkerOutput } from '../workers/sim.worker';

/**
 * Run a Monte Carlo simulation in a Web Worker and return the result as a Promise.
 *
 * A new Worker is created for each call and terminated after the result is received.
 * This keeps the API simple and avoids stale worker state.
 *
 * @param lineup - Array of 9 batter rate profiles
 * @param n - Number of games to simulate
 * @param seed - Optional PRNG seed for reproducibility
 * @returns Promise resolving to the simulation result
 */
export function runSimulation(
  lineup: BatterRates[],
  n: number,
  seed?: number,
): Promise<SimResult> {
  return new Promise<SimResult>((resolve, reject) => {
    const worker = new Worker(
      new URL('../workers/sim.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (event: MessageEvent<SimWorkerOutput>) => {
      resolve(event.data.result);
      worker.terminate();
    };

    worker.onerror = (error: ErrorEvent) => {
      reject(new Error(error.message));
      worker.terminate();
    };

    const message: SimWorkerInput = { lineup, n, seed };
    worker.postMessage(message);
  });
}
