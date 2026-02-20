// ---------------------------------------------------------------------------
// ui.ts — UI state stores (tab, simulation config, simulation results)
// ---------------------------------------------------------------------------

import { writable } from 'svelte/store';
import type { SimConfig, SimResult } from '../lib/models';

// --- Active tab ---

export type ActiveTab = 'lineup' | 'simulation';

export const activeTab = writable<ActiveTab>('lineup');

// --- Simulation config ---

export const simConfigStore = writable<SimConfig>({
  n: 10_000,
  seed: undefined,
});

// --- Simulation result ---

export const simResultStore = writable<SimResult | null>(null);
