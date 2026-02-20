<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { calcBatterRates } from '../lib/rates';
  import { runSearch } from '../lib/simRunner';
  import type { Player } from '../lib/models';
  import type { SearchResult, CandidateResult } from '../lib/sim/search';

  let numCandidates: number = 1000;
  let gamesPerCandidate: number = 200;
  let seedInput: string = '';
  let searching: boolean = false;
  let searchResult: SearchResult | null = null;

  // Derive lineup validation
  $: lineup = $lineupStore;
  $: lineupComplete = lineup.every((s) => s !== null);
  $: allPaValid = lineup
    .filter((s): s is Player => s !== null)
    .every((p) => p.pa > 0);
  $: canSearch = lineupComplete && allPaValid && !searching;

  // Player names for display (indexed by original lineup position)
  $: playerNames = lineup.map((s) => (s !== null ? s.name : ''));

  function clampCandidates(): void {
    if (numCandidates < 200) numCandidates = 200;
    if (numCandidates > 5000) numCandidates = 5000;
  }

  function clampGames(): void {
    if (gamesPerCandidate < 50) gamesPerCandidate = 50;
    if (gamesPerCandidate > 1000) gamesPerCandidate = 1000;
  }

  async function startSearch(): Promise<void> {
    if (!canSearch) return;

    searching = true;
    searchResult = null;

    try {
      const rates = (lineup as Player[]).map(calcBatterRates);
      const seed =
        seedInput.trim() !== '' ? parseInt(seedInput.trim(), 10) : undefined;

      const result = await runSearch(rates, {
        numCandidates,
        gamesPerCandidate,
        seed,
        topK: 5,
      });

      searchResult = result;
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      searching = false;
    }
  }

  /**
   * Format a candidate's batting order as a numbered list of player names.
   */
  function formatOrder(order: number[]): string {
    return order.map((idx, pos) => `${pos + 1}.${playerNames[idx]}`).join(' / ');
  }
</script>

<div class="search-panel">
  <h3>打順探索</h3>

  <div class="config-row">
    <label>
      探索候補数:
      <input
        type="number"
        bind:value={numCandidates}
        min={200}
        max={5000}
        step={100}
        on:blur={clampCandidates}
      />
      <span class="hint">200 ~ 5,000</span>
    </label>
  </div>

  <div class="config-row">
    <label>
      1候補あたり試合数:
      <input
        type="number"
        bind:value={gamesPerCandidate}
        min={50}
        max={1000}
        step={50}
        on:blur={clampGames}
      />
      <span class="hint">50 ~ 1,000</span>
    </label>
  </div>

  <div class="config-row">
    <label>
      Seed (任意):
      <input
        type="text"
        bind:value={seedInput}
        placeholder="空ならランダム"
      />
    </label>
  </div>

  <div class="action-row">
    <button disabled={!canSearch} on:click={startSearch}>
      {#if searching}
        探索中...
      {:else}
        探索開始
      {/if}
    </button>
  </div>

  {#if searching}
    <div class="loading">
      <span class="spinner"></span>
      <span>探索中... ({numCandidates}候補を評価中)</span>
    </div>
  {/if}

  {#if searchResult}
    <div class="results">
      <h4>平均得点 上位5打線</h4>
      <table class="result-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>打順</th>
            <th class="num-col">平均得点</th>
            <th class="num-col">標準偏差</th>
          </tr>
        </thead>
        <tbody>
          {#each searchResult.byMean as candidate, i}
            <tr>
              <td class="rank">{i + 1}</td>
              <td class="order">{formatOrder(candidate.order)}</td>
              <td class="num">{candidate.mean.toFixed(3)}</td>
              <td class="num">{Math.sqrt(candidate.variance).toFixed(3)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <h4>低分散（安定）上位5打線</h4>
      <table class="result-table">
        <thead>
          <tr>
            <th class="rank-col">#</th>
            <th>打順</th>
            <th class="num-col">平均得点</th>
            <th class="num-col">分散</th>
          </tr>
        </thead>
        <tbody>
          {#each searchResult.byVariance as candidate, i}
            <tr>
              <td class="rank">{i + 1}</td>
              <td class="order">{formatOrder(candidate.order)}</td>
              <td class="num">{candidate.mean.toFixed(3)}</td>
              <td class="num">{candidate.variance.toFixed(3)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .search-panel {
    background: var(--color-bg-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .search-panel h3 {
    margin: 0 0 var(--space-md) 0;
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .config-row {
    margin-bottom: 0.5rem;
  }

  .config-row label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .config-row input[type='number'],
  .config-row input[type='text'] {
    width: 120px;
    padding: 0.25rem 0.5rem;
    font-size: 0.9rem;
  }

  .hint {
    color: var(--color-text-muted);
    font-size: var(--font-sm);
  }

  .action-row {
    margin: 0.75rem 0;
  }

  .action-row button {
    padding: 0.4rem 1.2rem;
    font-size: 0.95rem;
    cursor: pointer;
    background: var(--color-primary-500);
    color: #fff;
    border: 1px solid var(--color-primary-600);
    border-radius: var(--radius-sm);
    font-weight: 600;
    transition: background-color var(--transition-fast);
  }

  .action-row button:hover:not(:disabled) {
    background: var(--color-primary-600);
  }

  .action-row button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
    color: var(--color-text-secondary);
    font-size: var(--font-base);
  }

  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary-500);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .results {
    margin-top: 0.75rem;
  }

  .results h4 {
    margin: var(--space-lg) 0 var(--space-sm) 0;
    font-size: 0.95rem;
    color: var(--color-text);
  }

  .result-table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.85rem;
  }

  .result-table th,
  .result-table td {
    border: 1px solid var(--color-border);
    padding: 0.35rem 0.5rem;
  }

  .result-table thead th {
    background: var(--color-bg-muted);
    text-align: center;
    font-weight: 600;
  }

  .rank-col {
    width: 2rem;
  }

  .num-col {
    width: 5rem;
  }

  .rank {
    text-align: center;
    font-weight: 600;
  }

  .order {
    font-size: 0.8rem;
    word-break: break-all;
  }

  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
</style>
