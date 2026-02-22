<script lang="ts">
  import { onDestroy } from 'svelte';
  import { lineupStore } from '../stores/lineup';
  import { activeTab, quickSimMsStore } from '../stores/ui';
  import { calcBatterRates } from '../lib/rates';
  import { runSimulation } from '../lib/simRunner';
  import type { Player, SimResult } from '../lib/models';
  import { findBracketTeams } from '../lib/npbReference';

  let loading = false;
  let result: SimResult | null = null;
  let lastLineupKey = '';

  /**
   * Create a fingerprint string for the current lineup to detect changes.
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
      const t0 = performance.now();
      const simResult = await runSimulation(rates, 100);
      const elapsed = performance.now() - t0;
      // Only apply if lineup hasn't changed during execution
      if (lastLineupKey === key) {
        result = simResult;
        quickSimMsStore.set(elapsed);
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
  $: maxPct = distributionRows.length > 0
    ? Math.max(...distributionRows.map((r) => r.pct))
    : 0;

  $: bracket = result ? findBracketTeams(result.mean) : null;
</script>

<div class="summary-panel">
  <h3>クイックサマリ (100試合)</h3>

  {#if loading}
    <div class="loading">
      <span class="spinner"></span>
      <span>100試合を実行中...</span>
    </div>
  {:else if result}
    <!-- Key metrics cards -->
    <div class="key-metrics">
      <div class="metric-card">
        <span class="metric-label">平均得点</span>
        <span class="metric-value">{result.mean.toFixed(2)}</span>
      </div>
      <div class="metric-card">
        <span class="metric-label">中央値</span>
        <span class="metric-value">{result.median.toFixed(2)}</span>
      </div>
    </div>

    <!-- NPB comparison (bracket display) -->
    {#if bracket}
      <div class="npb-comparison">
        {#if bracket.lower && bracket.upper && bracket.lower.rpg !== bracket.upper.rpg}
          <span class="npb-label">
            {bracket.lower.year}年{bracket.lower.team}（{bracket.lower.rpg.toFixed(2)}）以上、{bracket.upper.year}年{bracket.upper.team}（{bracket.upper.rpg.toFixed(2)}）以下
          </span>
        {:else if bracket.lower && !bracket.upper}
          <span class="npb-label">
            {bracket.lower.year}年{bracket.lower.team}（{bracket.lower.rpg.toFixed(2)}）以上
          </span>
        {:else if !bracket.lower && bracket.upper}
          <span class="npb-label">
            {bracket.upper.year}年{bracket.upper.team}（{bracket.upper.rpg.toFixed(2)}）以下
          </span>
        {:else if bracket.lower}
          <span class="npb-label">
            {bracket.lower.year}年{bracket.lower.team}（{bracket.lower.rpg.toFixed(2)}）と同等
          </span>
        {/if}
      </div>
    {/if}

    <!-- Sub-metrics -->
    <div class="sub-metrics">
      <span class="sub-metric">P10: {result.p10.toFixed(2)}</span>
      <span class="sub-metric-sep">/</span>
      <span class="sub-metric">P90: {result.p90.toFixed(2)}</span>
      <span class="sub-metric-sep">|</span>
      <span class="sub-metric">最小: {minScore}</span>
      <span class="sub-metric-sep">/</span>
      <span class="sub-metric">最大: {maxScore}</span>
    </div>

    <!-- Score distribution bar chart (collapsed by default) -->
    <details>
      <summary>得点分布</summary>
      <div class="bar-chart">
        {#each distributionRows as row}
          {#if row.count > 0}
            <div class="bar-row">
              <span class="bar-label">{row.score}点</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  style="width: {maxPct > 0 ? (row.pct / maxPct) * 100 : 0}%"
                ></div>
              </div>
              <span class="bar-pct">{row.pct.toFixed(1)}%</span>
            </div>
          {/if}
        {/each}
      </div>
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

  /* --- Key metrics cards --- */
  .key-metrics {
    display: flex;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .metric-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    box-shadow: var(--shadow-sm);
  }

  .metric-label {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-xs);
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary-500);
    line-height: 1.2;
  }

  /* --- NPB comparison --- */
  .npb-comparison {
    text-align: center;
    margin-bottom: var(--space-md);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-primary-50);
    border: 1px solid var(--color-primary-200);
    border-radius: var(--radius-sm);
  }

  .npb-label {
    font-size: var(--font-sm);
    color: var(--color-primary-700);
  }

  /* --- Sub-metrics --- */
  .sub-metrics {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    margin-bottom: var(--space-md);
    flex-wrap: wrap;
  }

  .sub-metric {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }

  .sub-metric-sep {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  /* --- Distribution bar chart --- */
  details {
    margin-top: var(--space-sm);
  }

  details summary {
    cursor: pointer;
    font-size: var(--font-base);
    color: var(--color-text-secondary);
  }

  .bar-chart {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    margin-top: var(--space-sm);
  }

  .bar-row {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .bar-label {
    flex-shrink: 0;
    width: 3rem;
    text-align: right;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  .bar-track {
    flex: 1;
    height: 1.2rem;
    background: var(--color-neutral-100);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--color-primary-400);
    border-radius: var(--radius-sm);
    transition: width var(--transition-normal);
    min-width: 2px;
  }

  .bar-pct {
    flex-shrink: 0;
    width: 3.5rem;
    text-align: right;
    font-size: var(--font-sm);
    color: var(--color-text-muted);
  }

  .hint {
    color: var(--color-text-muted);
    font-size: var(--font-base);
    margin: 0;
  }
</style>
