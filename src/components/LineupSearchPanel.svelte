<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { quickSimMsStore } from '../stores/ui';
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

  /** Check if a candidate's order differs from the current lineup at a given position. */
  function isDifferent(order: number[], pos: number): boolean {
    return order[pos] !== currentOrder[pos];
  }

  /** Adopt a candidate's batting order into the lineup store. */
  function adoptOrder(order: number[]): void {
    const players = lineup as Player[];
    const reordered = order.map((idx) => players[idx]) as Lineup;
    lineupStore.set(reordered);
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

  /** Estimated processing time based on quick sim timing */
  $: estimatedTimeSec = (() => {
    const msFor100 = $quickSimMsStore;
    if (msFor100 === null) return null;
    const totalGames = numCandidates * gamesPerCandidate;
    return (msFor100 / 100) * totalGames / 1000;
  })();

  function formatTime(sec: number): string {
    if (sec < 60) return `${Math.round(sec)}秒`;
    const min = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return s > 0 ? `${min}分${s}秒` : `${min}分`;
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
        topK: 3,
      });

      searchResult = result;
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      searching = false;
    }
  }

  /** Truncate player name for 3x3 grid display */
  function truncName(name: string): string {
    return name.length > 3 ? name.slice(0, 3) : name;
  }
</script>

<div class="search-panel">
  <h3>最適打順探索</h3>

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

  {#if estimatedTimeSec !== null}
    <p class="time-estimate">推定処理時間: 約{formatTime(estimatedTimeSec)}</p>
  {/if}

  <div class="action-row">
    <button disabled={!canSearch} on:click={startSearch}>
      {#if searching}
        <span class="spinner spinner-sm"></span>
        探索中...
      {:else}
        探索開始
      {/if}
    </button>
  </div>

  {#if searching}
    <div class="loading">
      <div class="progress-bar-indeterminate"></div>
      <div class="loading-text">
        <span class="spinner"></span>
        <span>探索中... ({numCandidates}候補を評価中)</span>
      </div>
    </div>
  {/if}

  {#if searchResult}
    <div class="results">
      <h4>平均得点 上位3打線</h4>
      {#each searchResult.byMean as candidate, i}
        <div class="candidate-card">
          <div class="candidate-rank">#{i + 1}</div>
          <div class="candidate-body">
            <div class="lineup-grid">
              {#each candidate.order as idx, pos}
                <div class="grid-cell" class:cell-changed={isDifferent(candidate.order, pos)}>
                  <span class="grid-order">{pos + 1}</span>
                  <span class="grid-name">{truncName(playerNames[idx])}</span>
                </div>
              {/each}
            </div>
            <div class="candidate-stats">
              <span class="stat-main">{candidate.mean.toFixed(2)}点</span>
              <span class="stat-sub">143試合: {Math.round(candidate.mean * 143)}打点</span>
            </div>
          </div>
          <button class="adopt-btn" on:click={() => adoptOrder(candidate.order)}>
            <span class="adopt-text">採用</span>
          </button>
        </div>
      {/each}
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

  .time-estimate {
    margin: var(--space-sm) 0;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  .action-row {
    margin: var(--space-md) 0;
  }

  .action-row button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
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
    padding: var(--space-sm) 0;
    color: var(--color-text-secondary);
    font-size: var(--font-base);
  }

  .loading-text {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .results {
    margin-top: var(--space-md);
  }

  .results h4 {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--font-base);
    color: var(--color-text);
  }

  /* --- Candidate card --- */
  .candidate-card {
    display: flex;
    align-items: stretch;
    gap: var(--space-sm);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--space-sm);
    margin-bottom: var(--space-sm);
  }

  .candidate-rank {
    display: flex;
    align-items: center;
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-primary-500);
    min-width: 2rem;
    justify-content: center;
  }

  .candidate-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  /* --- 3x3 lineup grid --- */
  .lineup-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }

  .grid-cell {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.7rem;
    line-height: 1.3;
    background: var(--color-neutral-100);
  }

  .grid-cell.cell-changed {
    background: var(--color-primary-100);
  }

  .grid-order {
    font-weight: 700;
    color: var(--color-text-secondary);
    font-size: 0.65rem;
  }

  .grid-name {
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cell-changed .grid-name {
    color: var(--color-primary-700);
    font-weight: 600;
  }

  /* --- Stats --- */
  .candidate-stats {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
  }

  .stat-main {
    font-size: var(--font-base);
    font-weight: 700;
    color: var(--color-text);
  }

  .stat-sub {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  /* --- Adopt button (vertical text) --- */
  .adopt-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-xs) 6px;
    cursor: pointer;
    background: var(--color-accent);
    color: var(--color-primary-700);
    border: 1px solid var(--color-accent-dark);
    border-radius: var(--radius-sm);
    font-weight: 700;
    font-size: var(--font-sm);
    transition: background-color var(--transition-fast);
    writing-mode: vertical-rl;
    letter-spacing: 0.2em;
    min-height: 3rem;
  }

  .adopt-btn:hover {
    background: var(--color-accent-light);
  }
</style>
