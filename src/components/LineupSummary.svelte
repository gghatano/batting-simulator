<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { activeTab } from '../stores/ui';
  import type { Player, Position } from '../lib/models';

  $: lineup = $lineupStore;

  /** Map a position to its CSS color class name */
  function positionClass(pos: Position): string {
    switch (pos) {
      case '投': return 'pos-pitcher';
      case '捕': return 'pos-catcher';
      case '一': case '二': case '三': case '遊': return 'pos-infield';
      case '左': case '中': case '右': return 'pos-outfield';
      case '指': return 'pos-dh';
      default: return '';
    }
  }

  function goToLineup(): void {
    activeTab.set('lineup');
  }

  /** Format rate as .XXX (3 decimal places, no leading zero) */
  function fmtRate(v: number): string {
    return v.toFixed(3).replace(/^0/, '');
  }

  function avg(p: Player): number {
    return p.pa > 0 ? (p.single + p.double + p.triple + p.hr) / p.pa : 0;
  }

  function hrRate(p: Player): number {
    return p.pa > 0 ? p.hr / p.pa : 0;
  }
</script>

<aside class="lineup-summary">
  <h3>現在の打線</h3>

  <ol class="lineup-list">
    {#each lineup as slot, i}
      <li class:empty={slot === null} class="{slot ? positionClass(slot.position) : ''}">
        <span class="order">{i + 1}.</span>
        {#if slot}
          <span class="position-badge {positionClass(slot.position)}">{slot.position}</span>
          <span class="player-name">{slot.name}</span>
          <span class="player-stats">{fmtRate(avg(slot))} / HR{fmtRate(hrRate(slot))}</span>
        {:else}
          <span class="empty-label">---</span>
        {/if}
      </li>
    {/each}
  </ol>

  <button class="back-btn" type="button" on:click={goToLineup}>
    打線作成へ戻る
  </button>
</aside>

<style>
  .lineup-summary {
    position: sticky;
    top: var(--space-lg);
    width: 320px;
    flex-shrink: 0;
    padding: var(--space-lg);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    background: var(--color-bg-muted);
  }

  h3 {
    margin: 0 0 var(--space-md);
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .lineup-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .lineup-list li {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-base);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-light);
  }

  .lineup-list li.empty {
    opacity: 0.5;
  }

  /* Position-based colors for filled slots */
  .lineup-list li:global(.pos-pitcher) {
    background: var(--color-pos-pitcher-bg);
    border-left: 3px solid var(--color-pos-pitcher-accent);
  }
  .lineup-list li:global(.pos-catcher) {
    background: var(--color-pos-catcher-bg);
    border-left: 3px solid var(--color-pos-catcher-accent);
  }
  .lineup-list li:global(.pos-infield) {
    background: var(--color-pos-infield-bg);
    border-left: 3px solid var(--color-pos-infield-accent);
  }
  .lineup-list li:global(.pos-outfield) {
    background: var(--color-pos-outfield-bg);
    border-left: 3px solid var(--color-pos-outfield-accent);
  }
  .lineup-list li:global(.pos-dh) {
    background: var(--color-pos-dh-bg);
    border-left: 3px solid var(--color-pos-dh-accent);
  }

  .order {
    font-weight: bold;
    min-width: 1.5em;
    text-align: right;
    color: var(--color-primary-500);
  }

  .player-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text);
  }

  .position-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.4rem;
    height: 1.4rem;
    border-radius: var(--radius-sm);
    background: var(--color-neutral-200);
    color: #fff;
    font-size: var(--font-xs);
    font-weight: 700;
    flex-shrink: 0;
    line-height: 1;
  }

  .position-badge:global(.pos-pitcher) { background: var(--color-pos-pitcher-accent); }
  .position-badge:global(.pos-catcher) { background: var(--color-pos-catcher-accent); }
  .position-badge:global(.pos-infield) { background: var(--color-pos-infield-accent); }
  .position-badge:global(.pos-outfield) { background: var(--color-pos-outfield-accent); }
  .position-badge:global(.pos-dh) { background: var(--color-pos-dh-accent); }

  .player-stats {
    color: var(--color-text-muted);
    font-size: var(--font-xs);
    margin-left: auto;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .empty-label {
    color: var(--color-neutral-300);
  }

  .back-btn {
    display: block;
    width: 100%;
    margin-top: var(--space-lg);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-base);
    border: 1px solid var(--color-primary-500);
    border-radius: var(--radius-md);
    background: var(--color-bg-surface);
    color: var(--color-primary-500);
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .back-btn:hover {
    background: var(--color-primary-500);
    color: var(--color-bg-surface);
  }

  @media (max-width: 768px) {
    .lineup-summary {
      width: 100%;
      position: static;
    }
  }
</style>
