<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { calcBatterRates } from '../lib/rates';
  import { runSearch } from '../lib/simRunner';
  import type { Player } from '../lib/models';
  import type { Lineup } from '../lib/models';
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

  // Current lineup order as identity array [0,1,2,...,8] for diff comparison
  const currentOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  /**
   * Check if a candidate's order differs from the current lineup at a given position.
   */
  function isDifferent(order: number[], pos: number): boolean {
    return order[pos] !== currentOrder[pos];
  }

  /**
   * Adopt a candidate's batting order into the lineup store.
   * Reorders the current lineup players according to the candidate's order array.
   */
  function adoptOrder(order: number[]): void {
    const players = lineup as Player[];
    const reordered = order.map((idx) => players[idx]) as Lineup;
    lineupStore.set(reordered);
    // Clear search results since the lineup has changed
    searchResult = null;
  }

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
      <div class="table-wrapper">
        <table class="table table-compact result-table">
          <thead>
            <tr>
              <th class="rank-col">#</th>
              <th>打順</th>
              <th class="num-col">平均得点</th>
              <th class="num-col">標準偏差</th>
              <th class="action-col"></th>
            </tr>
          </thead>
          <tbody>
            {#each searchResult.byMean as candidate, i}
              <tr>
                <td class="rank">{i + 1}</td>
                <td class="order-chips">
                  {#each candidate.order as idx, pos}
                    <span class="chip" class:chip-changed={isDifferent(candidate.order, pos)} class:chip-same={!isDifferent(candidate.order, pos)}>
                      {pos + 1}.{playerNames[idx]}
                    </span>
                  {/each}
                </td>
                <td class="td-numeric">{candidate.mean.toFixed(3)}</td>
                <td class="td-numeric">{Math.sqrt(candidate.variance).toFixed(3)}</td>
                <td class="td-action">
                  <button class="adopt-btn" on:click={() => adoptOrder(candidate.order)}>
                    この打順を採用
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <h4>低分散（安定）上位5打線</h4>
      <div class="table-wrapper">
        <table class="table table-compact result-table">
          <thead>
            <tr>
              <th class="rank-col">#</th>
              <th>打順</th>
              <th class="num-col">平均得点</th>
              <th class="num-col">分散</th>
              <th class="action-col"></th>
            </tr>
          </thead>
          <tbody>
            {#each searchResult.byVariance as candidate, i}
              <tr>
                <td class="rank">{i + 1}</td>
                <td class="order-chips">
                  {#each candidate.order as idx, pos}
                    <span class="chip" class:chip-changed={isDifferent(candidate.order, pos)} class:chip-same={!isDifferent(candidate.order, pos)}>
                      {pos + 1}.{playerNames[idx]}
                    </span>
                  {/each}
                </td>
                <td class="td-numeric">{candidate.mean.toFixed(3)}</td>
                <td class="td-numeric">{candidate.variance.toFixed(3)}</td>
                <td class="td-action">
                  <button class="adopt-btn" on:click={() => adoptOrder(candidate.order)}>
                    この打順を採用
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
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
    margin-bottom: var(--space-sm);
  }

  .config-row label {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-base);
  }

  .config-row input[type='number'],
  .config-row input[type='text'] {
    width: 120px;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-base);
  }

  .hint {
    color: var(--color-text-muted);
    font-size: var(--font-sm);
  }

  .action-row {
    margin: var(--space-md) 0;
  }

  .action-row button {
    padding: var(--space-sm) var(--space-lg);
    font-size: var(--font-base);
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

  .results {
    margin-top: var(--space-md);
  }

  .results h4 {
    margin: var(--space-lg) 0 var(--space-sm) 0;
    font-size: var(--font-base);
    color: var(--color-text);
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .rank-col {
    width: 2rem;
  }

  .num-col {
    width: 5rem;
  }

  .action-col {
    width: 7rem;
  }

  .rank {
    text-align: center;
    font-weight: 600;
  }

  .order-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .chip {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    border-radius: var(--radius-full);
    white-space: nowrap;
    line-height: 1.3;
  }

  .chip-same {
    background: var(--color-neutral-200);
    color: var(--color-text-secondary);
  }

  .chip-changed {
    background: var(--color-primary-100);
    color: var(--color-primary-700);
    font-weight: 600;
  }

  .td-action {
    vertical-align: middle;
  }

  .adopt-btn {
    padding: 0.2rem 0.5rem;
    font-size: var(--font-xs);
    cursor: pointer;
    background: var(--color-accent);
    color: var(--color-primary-700);
    border: 1px solid var(--color-accent-dark);
    border-radius: var(--radius-sm);
    font-weight: 600;
    white-space: nowrap;
    transition: background-color var(--transition-fast);
  }

  .adopt-btn:hover {
    background: var(--color-accent-light);
  }
</style>
