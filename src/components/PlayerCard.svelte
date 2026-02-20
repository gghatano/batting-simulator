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
    <span class="player-name">{player.name}</span>
    <span class="player-team">{player.team}</span>
  </div>

  <div class="card-stats">
    <table>
      <thead>
        <tr>
          <th>PA</th>
          <th>1B</th>
          <th>2B</th>
          <th>3B</th>
          <th>HR</th>
          <th>BB+HBP</th>
          <th>SO</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{player.pa}</td>
          <td>{player.single}</td>
          <td>{player.double}</td>
          <td>{player.triple}</td>
          <td>{player.hr}</td>
          <td>{player.bb + player.hbp}</td>
          <td>{player.so}</td>
        </tr>
      </tbody>
    </table>
  </div>

  {#if rates}
    <div class="card-rates">
      <table>
        <thead>
          <tr>
            <th>1B率</th>
            <th>2B率</th>
            <th>3B率</th>
            <th>HR率</th>
            <th>四死率</th>
            <th>K率</th>
            <th>OUT率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{fmtRate(rates.single)}</td>
            <td>{fmtRate(rates.double)}</td>
            <td>{fmtRate(rates.triple)}</td>
            <td>{fmtRate(rates.hr)}</td>
            <td>{fmtRate(rates.bb_hbp)}</td>
            <td>{fmtRate(rates.k)}</td>
            <td>{fmtRate(rates.out)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  {/if}

  <div class="card-actions">
    <button class="add-btn" type="button" on:click={handleAdd}>追加</button>
  </div>
</div>

<style>
  .player-card {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.75rem;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .player-name {
    font-weight: 700;
    font-size: 1rem;
  }

  .player-team {
    color: #6b7280;
    font-size: 0.8rem;
  }

  .card-stats table,
  .card-rates table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
    text-align: center;
  }

  .card-stats th,
  .card-rates th {
    background: #f3f4f6;
    padding: 0.2rem 0.3rem;
    font-weight: 600;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-stats td,
  .card-rates td {
    padding: 0.2rem 0.3rem;
  }

  .card-rates td {
    font-family: monospace;
    font-size: 0.78rem;
  }

  .card-actions {
    display: flex;
    justify-content: flex-end;
  }

  .add-btn {
    padding: 0.3rem 0.75rem;
    border: 1px solid #3b82f6;
    border-radius: 4px;
    background: #3b82f6;
    color: #fff;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.15s;
  }

  .add-btn:hover {
    background: #2563eb;
  }
</style>
