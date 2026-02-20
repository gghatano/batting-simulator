<script lang="ts">
  import type { Player } from '../lib/models';
  import { calcBatterRates } from '../lib/rates';
  import { addPlayerToSelectedSlot } from '../stores/lineup';

  /** The player to display */
  export let player: Player;

  function handleAdd(): void {
    addPlayerToSelectedSlot(player);
  }

  /** Format a rate to 3 decimal places (e.g. ".285") */
  function fmtRate(value: number): string {
    return value.toFixed(3).replace(/^0/, '');
  }

  $: rates = player.pa > 0 ? calcBatterRates(player) : null;
</script>

<div class="player-card">
  <div class="card-header">
    <div class="card-title">
      <span class="player-name">{player.name}</span>
      <span class="player-team">{player.team}</span>
    </div>
    <button class="add-btn" type="button" on:click={handleAdd}>追加</button>
  </div>

  <div class="card-stats">
    <span class="stat-item">
      <span class="stat-label">PA</span>
      <span class="stat-value">{player.pa}</span>
    </span>
    {#if rates}
      <span class="stat-item">
        <span class="stat-label">HR率</span>
        <span class="stat-value mono">{fmtRate(rates.hr)}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">四死率</span>
        <span class="stat-value mono">{fmtRate(rates.bb_hbp)}</span>
      </span>
      <span class="stat-item">
        <span class="stat-label">K率</span>
        <span class="stat-value mono">{fmtRate(rates.k)}</span>
      </span>
    {/if}
  </div>
</div>

<style>
  .player-card {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.4rem 0.5rem;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
  }

  .card-title {
    display: flex;
    align-items: baseline;
    gap: 0.3rem;
    min-width: 0;
  }

  .player-name {
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-team {
    color: #6b7280;
    font-size: 0.7rem;
    white-space: nowrap;
  }

  .card-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem 0.5rem;
    font-size: 0.72rem;
  }

  .stat-item {
    display: flex;
    align-items: baseline;
    gap: 0.2rem;
  }

  .stat-label {
    color: #6b7280;
    font-weight: 600;
  }

  .stat-value {
    color: #111827;
  }

  .stat-value.mono {
    font-family: monospace;
    font-size: 0.72rem;
  }

  .add-btn {
    padding: 0.15rem 0.5rem;
    border: 1px solid #3b82f6;
    border-radius: 4px;
    background: #3b82f6;
    color: #fff;
    cursor: pointer;
    font-size: 0.72rem;
    transition: background-color 0.15s;
    flex-shrink: 0;
  }

  .add-btn:hover {
    background: #2563eb;
  }
</style>
