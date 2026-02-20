<script lang="ts">
  import { onDestroy } from 'svelte';
  import { lineupStore } from '../stores/lineup';
  import { activeTab } from '../stores/ui';
  import { calcBatterRates } from '../lib/rates';
  import { runSimulation } from '../lib/simRunner';
  import type { Player, SimResult } from '../lib/models';

  let loading = false;
  let result: SimResult | null = null;
  let lastLineupKey = '';

  /**
   * Create a fingerprint string for the current lineup to detect changes.
   * Returns empty string if lineup is incomplete or has PA=0 players.
   */
  function lineupFingerprint(lineup: (Player | null)[]): string {
    if (lineup.some((s) => s === null)) return '';
    const players = lineup as Player[];
    if (players.some((p) => p.pa === 0)) return '';
    return players.map((p) => p.id).join(',');
  }

  async function runQuickSim(lineup: (Player | null)[]): Promise<void> {
    const key = lineupFingerprint(lineup);
    if (key === '' || key === lastLineupKey) return;

    loading = true;
    result = null;
    lastLineupKey = key;

    try {
      const rates = (lineup as Player[]).map(calcBatterRates);
      const simResult = await runSimulation(rates, 100);
      // Only apply if lineup hasn't changed during execution
      if (lastLineupKey === key) {
        result = simResult;
      }
    } catch (e) {
      console.error('Quick simulation error:', e);
    } finally {
      loading = false;
    }
  }

  // React to tab changes and lineup changes
  $: if ($activeTab === 'simulation') {
    runQuickSim($lineupStore);
  }

  // Reset when leaving simulation tab
  $: if ($activeTab !== 'simulation') {
    lastLineupKey = '';
    result = null;
  }

  // Computed values from result
  $: maxScore = result
    ? result.distribution.length - 1
    : 0;
  $: minScore = result
    ? result.distribution.findIndex((c) => c > 0)
    : 0;
  $: totalTrials = result
    ? result.distribution.reduce((a, b) => a + b, 0)
    : 0;
  $: distributionRows = result
    ? result.distribution.map((count, score) => ({
        score,
        count,
        pct: totalTrials > 0 ? (count / totalTrials) * 100 : 0,
      }))
    : [];
</script>

<div class="summary-panel">
  <h3>クイックサマリ (100試合)</h3>

  {#if loading}
    <div class="loading">
      <span class="spinner"></span>
      <span>100試合を実行中...</span>
    </div>
  {:else if result}
    <table class="table table-compact summary-stats-table">
      <tbody>
        <tr>
          <th>平均得点</th>
          <td class="td-numeric">{result.mean.toFixed(2)}</td>
          <th>中央値</th>
          <td class="td-numeric">{result.median.toFixed(2)}</td>
        </tr>
        <tr>
          <th>P10</th>
          <td class="td-numeric">{result.p10.toFixed(2)}</td>
          <th>P90</th>
          <td class="td-numeric">{result.p90.toFixed(2)}</td>
        </tr>
        <tr>
          <th>最小</th>
          <td class="td-numeric">{minScore}</td>
          <th>最大</th>
          <td class="td-numeric">{maxScore}</td>
        </tr>
      </tbody>
    </table>

    <details>
      <summary>得点分布</summary>
      <table class="table table-compact table-numeric">
        <thead>
          <tr>
            <th>得点</th>
            <th>回数</th>
            <th>割合 (%)</th>
          </tr>
        </thead>
        <tbody>
          {#each distributionRows as row}
            <tr>
              <td>{row.score}</td>
              <td>{row.count}</td>
              <td>{row.pct.toFixed(1)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </details>
  {:else}
    <p class="hint">打線が完成すると自動で100試合を実行します。</p>
  {/if}
</div>

<style>
  .summary-panel {
    background: var(--color-bg-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
  }

  .summary-panel h3 {
    margin: 0 0 var(--space-md) 0;
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .loading {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) 0;
    color: var(--color-text-secondary);
  }

  .summary-stats-table {
    margin-bottom: 0.75rem;
  }

  .summary-stats-table th {
    width: 20%;
    text-align: left;
  }

  .summary-stats-table td {
    width: 30%;
  }

  details {
    margin-top: var(--space-sm);
  }

  details summary {
    cursor: pointer;
    font-size: var(--font-base);
    color: var(--color-text-secondary);
  }

  .hint {
    color: var(--color-text-muted);
    font-size: var(--font-base);
    margin: 0;
  }
</style>
