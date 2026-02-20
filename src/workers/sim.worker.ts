// ---------------------------------------------------------------------------
// sim.worker.ts — Web Worker for running Monte Carlo simulation off main thread
// ---------------------------------------------------------------------------

import { simulateN } from '../lib/sim/simulate';
import type { BatterRates, SimResult } from '../lib/models';

/** Message sent from the main thread to the worker */
export interface SimWorkerInput {
  lineup: BatterRates[];
  n: number;
  seed?: number;
}

/** Message sent from the worker back to the main thread */
export interface SimWorkerOutput {
  result: SimResult;
}

self.onmessage = (event: MessageEvent<SimWorkerInput>) => {
  const { lineup, n, seed } = event.data;
  const result = simulateN(lineup, n, seed);
  self.postMessage({ result } satisfies SimWorkerOutput);
};
