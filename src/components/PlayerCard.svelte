<script lang="ts">
  import type { Player } from '../lib/models';
  import { addPlayerToSelectedSlot } from '../stores/lineup';
  import PlayerDetailsModal from './PlayerDetailsModal.svelte';

  /** The player to display */
  export let player: Player;

  let showDetails = false;

  function handleAdd(): void {
    addPlayerToSelectedSlot(player);
  }

  function handleShowDetails(): void {
    showDetails = true;
  }

  function handleCloseDetails(): void {
    showDetails = false;
  }

  /** Format a rate to 3 decimal places (e.g. ".285") */
  function fmtRate(value: number): string {
    return value.toFixed(3).replace(/^0/, '');
  }

  $: avg = player.pa > 0
    ? (player.single + player.double + player.triple + player.hr) / player.pa
    : 0;

  $: hrRate = player.pa > 0 ? player.hr / player.pa : 0;
</script>

<div class="player-card">
  <div class="card-header">
    <div class="card-title">
      <span class="player-name">{player.name}</span>
      <span class="player-team">{player.team}</span>
    </div>
    <button class="detail-link" type="button" on:click={handleShowDetails}>詳細</button>
  </div>

  <div class="card-body">
    <div class="card-stats">
      <span class="stat-item">
        <span class="stat-label">打率</span>
        <span class="stat-value mono">{fmtRate(avg)}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">HR率</span>
        <span class="stat-value mono">{fmtRate(hrRate)}</span>
      </span>
    </div>
    <button class="add-btn" type="button" on:click={handleAdd} title="ラインナップに追加">+</button>
  </div>
</div>

{#if showDetails}
  <PlayerDetailsModal {player} onClose={handleCloseDetails} />
{/if}

<style>
  .player-card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-xs) var(--space-sm);
    background: var(--color-bg-surface);
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .player-card:hover {
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs);
  }

  .card-title {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    min-width: 0;
  }

  .player-name {
    font-weight: 700;
    font-size: var(--font-base);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text);
  }

  .player-team {
    color: var(--color-text-muted);
    font-size: var(--font-xs);
    white-space: nowrap;
  }

  .card-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xs);
  }

  .card-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem 0.5rem;
    font-size: var(--font-xs);
  }

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
  }

  .stat-label {
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .stat-value {
    color: var(--color-text);
  }

  .stat-value.mono {
    font-variant-numeric: tabular-nums;
    font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace, system-ui;
    font-size: var(--font-xs);
  }

  .detail-link {
    padding: 0;
    border: none;
    background: none;
    color: var(--color-primary-500);
    cursor: pointer;
    font-size: var(--font-xs);
    text-decoration: underline;
    flex-shrink: 0;
    transition: color var(--transition-fast);
  }

  .detail-link:hover {
    color: var(--color-primary-600);
  }

  .add-btn {
    min-height: 28px;
    min-width: 28px;
    padding: 0;
    border: 1px solid var(--color-primary-500);
    border-radius: var(--radius-sm);
    background: var(--color-primary-500);
    color: #fff;
    cursor: pointer;
    font-size: var(--font-base);
    font-weight: 700;
    line-height: 1;
    transition: background-color var(--transition-fast);
    flex-shrink: 0;
  }

  .add-btn:hover {
    background: var(--color-primary-600);
  }
</style>
