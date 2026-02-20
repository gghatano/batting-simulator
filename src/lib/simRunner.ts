// ---------------------------------------------------------------------------
// simRunner.ts — Main-thread helper to run simulation via Web Worker
// ---------------------------------------------------------------------------

import type { BatterRates, SimResult } from './models';
import type { SearchConfig, SearchResult } from './sim/search';
import type {
  SimulateJobInput,
  SimulateJobOutput,
  SearchJobInput,
  SearchJobOutput,
  WorkerOutput,
} from '../workers/sim.worker';

/**
 * Create a new Worker instance pointing to sim.worker.ts.
 */
function createWorker(): Worker {
  return new Worker(
    new URL('../workers/sim.worker.ts', import.meta.url),
    { type: 'module' },
  );
}

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
    const worker = createWorker();

    worker.onmessage = (event: MessageEvent<WorkerOutput>) => {
      if (event.data.type === 'simulate') {
        resolve(event.data.result);
      } else {
        reject(new Error('Unexpected worker response type'));
      }
      worker.terminate();
    };

    worker.onerror = (error: ErrorEvent) => {
      reject(new Error(error.message));
      worker.terminate();
    };

    const message: SimulateJobInput = { type: 'simulate', lineup, n, seed };
    worker.postMessage(message);
  });
}

/**
 * Run a lineup search in a Web Worker and return the result as a Promise.
 *
 * @param lineup - Array of 9 batter rate profiles (original order)
 * @param config - Search configuration
 * @returns Promise resolving to the search result
 */
export function runSearch(
  lineup: BatterRates[],
  config: SearchConfig,
): Promise<SearchResult> {
  return new Promise<SearchResult>((resolve, reject) => {
    const worker = createWorker();

    worker.onmessage = (event: MessageEvent<WorkerOutput>) => {
      if (event.data.type === 'search') {
        resolve(event.data.result);
      } else {
        reject(new Error('Unexpected worker response type'));
      }
      worker.terminate();
    };

    worker.onerror = (error: ErrorEvent) => {
      reject(new Error(error.message));
      worker.terminate();
    };

    const message: SearchJobInput = { type: 'search', lineup, config };
    worker.postMessage(message);
  });
}
