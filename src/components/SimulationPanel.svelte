<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { simConfigStore, simResultStore } from '../stores/ui';
  import { calcBatterRates } from '../lib/rates';
  import { simulateN } from '../lib/sim/simulate';
  import type { Player, BatterRates } from '../lib/models';
  import StatsTable from './StatsTable.svelte';
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
  <StatsTable />

  <h2>シミュレーション設定</h2>

  <div class="config-row">
    <label>
      試行回数 (N):
      <input
        type="number"
        bind:value={n}
        min={1000}
        max={100000}
        step={1000}
        on:blur={clampN}
      />
      <span class="hint">1,000 ~ 100,000</span>
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
    <button disabled={!canRun} on:click={runSimulation}>
      {#if running}
        実行中...
      {:else}
        シミュレーション実行
      {/if}
    </button>
    {#if validationMessage}
      <p class="validation-msg">{validationMessage}</p>
    {/if}
  </div>

  {#if running}
    <div class="loading">
      <p>シミュレーション実行中... しばらくお待ちください</p>
    </div>
  {/if}

  {#if result}
    <div class="results">
      <h2>結果サマリ</h2>
      <table>
        <tbody>
          <tr>
            <th>平均得点 (Mean)</th>
            <td>{result.mean.toFixed(2)}</td>
          </tr>
          <tr>
            <th>中央値 (Median)</th>
            <td>{result.median.toFixed(2)}</td>
          </tr>
          <tr>
            <th>P10</th>
            <td>{result.p10.toFixed(2)}</td>
          </tr>
          <tr>
            <th>P90</th>
            <td>{result.p90.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <h2>得点分布</h2>
      <table class="distribution-table">
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
              <td class="num">{row.score}</td>
              <td class="num">{row.count}</td>
              <td class="num">{row.pct.toFixed(2)}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr>
            <th>合計</th>
            <td class="num">{totalTrials}</td>
            <td class="num">{distributionRows.reduce((a, r) => a + r.pct, 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  {/if}
</div>

<style>
  .simulation-panel {
    max-width: 700px;
  }

  .config-row {
    margin-bottom: 0.75rem;
  }

  .config-row label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .config-row input[type='number'],
  .config-row input[type='text'] {
    width: 140px;
    padding: 0.25rem 0.5rem;
    font-size: 1rem;
  }

  .hint {
    color: #888;
    font-size: 0.85rem;
  }

  .action-row {
    margin: 1rem 0;
  }

  .action-row button {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
  }

  .action-row button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .validation-msg {
    color: #c00;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .loading {
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .results {
    margin-top: 1rem;
  }

  .results table {
    border-collapse: collapse;
    width: 100%;
  }

  .results th,
  .results td {
    border: 1px solid #ccc;
    padding: 0.5rem 1rem;
    text-align: left;
  }

  .results th {
    background: #f8f8f8;
    width: 50%;
  }

  .distribution-table {
    margin-top: 0.5rem;
  }

  .distribution-table th,
  .distribution-table td {
    border: 1px solid #ccc;
    padding: 0.35rem 0.75rem;
  }

  .distribution-table thead th {
    background: #f8f8f8;
    text-align: center;
  }

  .distribution-table tfoot th,
  .distribution-table tfoot td {
    background: #f0f0f0;
    font-weight: bold;
  }

  .distribution-table .num {
    text-align: right;
  }
</style>
