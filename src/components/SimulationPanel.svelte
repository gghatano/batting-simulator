<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { simConfigStore, simResultStore } from '../stores/ui';
  import { calcBatterRates } from '../lib/rates';
  import { simulateN } from '../lib/sim/simulate';
  import type { Player, BatterRates } from '../lib/models';
  import SimulationSummary from './SimulationSummary.svelte';
  import LineupSearchPanel from './LineupSearchPanel.svelte';

  let n: number = 10_000;
  let seedInput: string = '';
  let running: boolean = false;

  // Derive lineup validation
  $: lineup = $lineupStore;
  $: emptySlots = lineup.filter((s) => s === null).length;
  $: filledPlayers = lineup.filter((s): s is Player => s !== null);
  $: pa0Players = filledPlayers.filter((p) => p.pa === 0);
  $: lineupComplete = emptySlots === 0;
  $: allPaValid = pa0Players.length === 0;
  $: canRun = lineupComplete && allPaValid && !running;

  $: validationMessage = !lineupComplete
    ? `打線が未完成です（空き枠: ${emptySlots}）`
    : !allPaValid
      ? `PA=0 の選手がいます: ${pa0Players.map((p) => p.name).join(', ')}`
      : '';

  // Clamp N to valid range
  function clampN(): void {
    if (n < 1_000) n = 1_000;
    if (n > 100_000) n = 100_000;
  }

  async function runSimulation(): Promise<void> {
    if (!canRun) return;

    running = true;
    simResultStore.set(null);

    // Small delay to allow UI to update (show loading)
    await new Promise((resolve) => setTimeout(resolve, 10));

    try {
      const rates: BatterRates[] = (lineup as Player[]).map(calcBatterRates);
      const seed = seedInput.trim() !== '' ? parseInt(seedInput.trim(), 10) : undefined;
      const result = simulateN(rates, n, seed);
      simResultStore.set(result);
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      running = false;
    }
  }

  $: result = $simResultStore;

  // Derive distribution rows from result
  $: distributionRows = result
    ? result.distribution.map((count, score) => ({
        score,
        count,
        pct: result!.distribution.reduce((a, b) => a + b, 0) > 0
          ? (count / result!.distribution.reduce((a, b) => a + b, 0)) * 100
          : 0,
      }))
    : [];

  $: totalTrials = result
    ? result.distribution.reduce((a, b) => a + b, 0)
    : 0;
</script>

<div class="simulation-panel">
  <SimulationSummary />
  <LineupSearchPanel />

  <div class="config-card">
    <h3>シミュレーション設定</h3>

    <div class="config-row">
      <label>
        <span class="config-label">試行回数 (N)</span>
        <div class="config-input-group">
          <input
            type="number"
            bind:value={n}
            min={1000}
            max={100000}
            step={1000}
            on:blur={clampN}
          />
          <span class="hint">1,000 ~ 100,000</span>
        </div>
      </label>
    </div>

    <div class="config-row">
      <label>
        <span class="config-label">Seed (任意)</span>
        <input
          type="text"
          bind:value={seedInput}
          placeholder="空ならランダム"
        />
      </label>
    </div>

    <div class="action-row">
      <button class="run-btn" disabled={!canRun} on:click={runSimulation}>
        {#if running}
          <span class="spinner spinner-sm"></span>
          実行中...
        {:else}
          シミュレーション実行
        {/if}
      </button>
      {#if validationMessage}
        <p class="validation-msg">{validationMessage}</p>
      {/if}
    </div>
  </div>

  {#if running}
    <div class="loading">
      <div class="progress-bar-indeterminate"></div>
      <p>シミュレーション実行中... しばらくお待ちください</p>
    </div>
  {/if}

  {#if result}
    <div class="results">
      <h3>結果サマリ</h3>
      <div class="result-cards">
        <div class="result-card">
          <span class="result-label">平均得点</span>
          <span class="result-value">{result.mean.toFixed(2)}</span>
        </div>
        <div class="result-card">
          <span class="result-label">中央値</span>
          <span class="result-value">{result.median.toFixed(2)}</span>
        </div>
        <div class="result-card">
          <span class="result-label">P10</span>
          <span class="result-value">{result.p10.toFixed(2)}</span>
        </div>
        <div class="result-card">
          <span class="result-label">P90</span>
          <span class="result-value">{result.p90.toFixed(2)}</span>
        </div>
      </div>

      <details>
        <summary>得点分布</summary>
        <div class="table-scroll-wrapper">
        <table class="table table-compact table-numeric distribution-table">
          <thead>
            <tr>
              <th>得点</th>
              <th>出現回数</th>
              <th>出現率 (%)</th>
            </tr>
          </thead>
          <tbody>
            {#each distributionRows as row}
              <tr>
                <td>{row.score}</td>
                <td>{row.count}</td>
                <td>{row.pct.toFixed(2)}</td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr>
              <th>合計</th>
              <td>{totalTrials}</td>
              <td>{distributionRows.reduce((a, r) => a + r.pct, 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        </div>
      </details>
    </div>
  {/if}
</div>

<style>
  .simulation-panel {
    max-width: 700px;
  }

  /* --- Config card --- */
  .config-card {
    background: var(--color-bg-muted);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .config-card h3 {
    margin: 0 0 var(--space-md) 0;
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .config-row {
    margin-bottom: var(--space-md);
  }

  .config-row label {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-base);
  }

  .config-label {
    min-width: 8em;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .config-input-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .config-row input[type='number'],
  .config-row input[type='text'] {
    width: 130px;
  }

  .hint {
    color: var(--color-text-muted);
    font-size: var(--font-xs);
  }

  .action-row {
    margin-top: var(--space-md);
  }

  .run-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-xl);
    font-size: var(--font-base);
    cursor: pointer;
    background: var(--color-accent);
    color: var(--color-primary-700);
    border: 1px solid var(--color-accent-dark);
    border-radius: var(--radius-md);
    font-weight: 700;
    box-shadow: var(--shadow-sm);
    transition: background-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .run-btn:hover:not(:disabled) {
    background: var(--color-accent-dark);
    color: #fff;
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  .run-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }

  .run-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .validation-msg {
    color: var(--color-danger-600);
    margin-top: var(--space-sm);
    font-size: var(--font-sm);
  }

  .loading {
    padding: var(--space-lg);
    background: var(--color-bg-muted);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    margin: var(--space-lg) 0;
  }

  /* --- Results --- */
  .results {
    margin-top: var(--space-lg);
  }

  .results h3 {
    margin: 0 0 var(--space-md) 0;
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .result-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .result-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-sm);
    box-shadow: var(--shadow-card);
  }

  .result-label {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    margin-bottom: var(--space-xs);
  }

  .result-value {
    font-size: var(--font-xl);
    font-weight: 700;
    color: var(--color-primary-500);
    font-variant-numeric: tabular-nums;
  }

  details {
    margin-top: var(--space-sm);
  }

  details summary {
    cursor: pointer;
    font-size: var(--font-base);
    color: var(--color-text-secondary);
    padding: var(--space-xs) 0;
  }

  .distribution-table {
    margin-top: var(--space-sm);
  }

  .distribution-table tfoot th,
  .distribution-table tfoot td {
    background: var(--color-bg-muted);
    font-weight: bold;
  }

  .table-scroll-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 768px) {
    .simulation-panel {
      max-width: 100%;
    }

    .config-row label {
      flex-wrap: wrap;
    }

    .result-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
