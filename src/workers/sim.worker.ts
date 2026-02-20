// ---------------------------------------------------------------------------
// sim.worker.ts — Web Worker for running Monte Carlo simulation off main thread
// ---------------------------------------------------------------------------

import { simulateN } from '../lib/sim/simulate';
import { searchBestLineups } from '../lib/sim/search';
import type { BatterRates, SimResult } from '../lib/models';
import type { SearchConfig, SearchResult } from '../lib/sim/search';

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

/** Simulate job input */
export interface SimulateJobInput {
  type: 'simulate';
  lineup: BatterRates[];
  n: number;
  seed?: number;
}

/** Search job input */
export interface SearchJobInput {
  type: 'search';
  lineup: BatterRates[];
  config: SearchConfig;
}

/** Union of all worker input messages */
export type WorkerInput = SimulateJobInput | SearchJobInput;

/** Simulate job output */
export interface SimulateJobOutput {
  type: 'simulate';
  result: SimResult;
}

/** Search job output */
export interface SearchJobOutput {
  type: 'search';
  result: SearchResult;
}

/** Union of all worker output messages */
export type WorkerOutput = SimulateJobOutput | SearchJobOutput;

// Legacy types (kept for backward compatibility with existing imports)
export type SimWorkerInput = SimulateJobInput;
export type SimWorkerOutput = SimulateJobOutput;

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const data = event.data;

  switch (data.type) {
    case 'simulate': {
      const { lineup, n, seed } = data;
      const result = simulateN(lineup, n, seed);
      self.postMessage({ type: 'simulate', result } satisfies SimulateJobOutput);
      break;
    }
    case 'search': {
      const { lineup, config } = data;
      const result = searchBestLineups(lineup, config);
      self.postMessage({ type: 'search', result } satisfies SearchJobOutput);
      break;
    }
    default: {
      // Should not happen, but log for debugging
      console.error('sim.worker: unknown message type', data);
    }
  }
};
