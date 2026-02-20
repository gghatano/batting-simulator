<script lang="ts">
  import type { Player } from '../lib/models';
  import { calcBatterRates } from '../lib/rates';

  /** The player whose details to show */
  export let player: Player;
  /** Callback to close the modal */
  export let onClose: () => void;

  /** Format a rate to 3 decimal places (e.g. ".285") */
  function fmtRate(value: number): string {
    return value.toFixed(3).replace(/^0/, '');
  }

  $: rates = player.pa > 0 ? calcBatterRates(player) : null;

  /** Compute raw OUT count (PA minus all known event counts) */
  $: rawOut = player.pa - (player.single + player.double + player.triple + player.hr + player.bb + player.hbp + player.so);

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  function handleBackdropClick(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-interactive-supports-focus -->
<div class="modal-backdrop" on:click={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1" aria-label="{player.name} の詳細">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">{player.name}</h2>
      <button class="close-btn" type="button" on:click={onClose} aria-label="閉じる">&times;</button>
    </div>

    <div class="modal-body">
      <div class="info-row">
        <span class="info-label">チーム</span>
        <span class="info-value">{player.team}</span>
      </div>
      <div class="info-row">
        <span class="info-label">打席数 (PA)</span>
        <span class="info-value">{player.pa}</span>
      </div>

      {#if rates}
        <h3 class="section-title">安打率</h3>
        <table class="rates-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>率</th>
              <th>生値</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>単打 (1B)</td>
              <td class="mono">{fmtRate(rates.single)}</td>
              <td class="mono">{player.single}</td>
            </tr>
            <tr>
              <td>二塁打 (2B)</td>
              <td class="mono">{fmtRate(rates.double)}</td>
              <td class="mono">{player.double}</td>
            </tr>
            <tr>
              <td>三塁打 (3B)</td>
              <td class="mono">{fmtRate(rates.triple)}</td>
              <td class="mono">{player.triple}</td>
            </tr>
            <tr>
              <td>本塁打 (HR)</td>
              <td class="mono">{fmtRate(rates.hr)}</td>
              <td class="mono">{player.hr}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="section-title">その他</h3>
        <table class="rates-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>率</th>
              <th>生値</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>三振 (K)</td>
              <td class="mono">{fmtRate(rates.k)}</td>
              <td class="mono">{player.so}</td>
            </tr>
            <tr>
              <td>四死球 (BB+HBP)</td>
              <td class="mono">{fmtRate(rates.bb_hbp)}</td>
              <td class="mono">{player.bb + player.hbp}</td>
            </tr>
            <tr>
              <td>アウト (OUT)</td>
              <td class="mono">{fmtRate(rates.out)}</td>
              <td class="mono">{rawOut}</td>
            </tr>
          </tbody>
        </table>
      {:else}
        <p class="no-data">打席データがありません</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: #fff;
    border-radius: 8px;
    width: 90%;
    max-width: 420px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: #6b7280;
    padding: 0 0.25rem;
  }

  .close-btn:hover {
    color: #111827;
  }

  .modal-body {
    padding: 0.75rem 1rem 1rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
    font-size: 0.85rem;
  }

  .info-label {
    color: #6b7280;
    font-weight: 600;
  }

  .info-value {
    color: #111827;
  }

  .section-title {
    margin: 0.75rem 0 0.3rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.2rem;
  }

  .rates-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }

  .rates-table th {
    text-align: left;
    color: #6b7280;
    font-weight: 600;
    padding: 0.2rem 0.4rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .rates-table td {
    padding: 0.25rem 0.4rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .rates-table .mono {
    font-family: monospace;
    text-align: right;
  }

  .rates-table th:nth-child(2),
  .rates-table th:nth-child(3) {
    text-align: right;
  }

  .no-data {
    color: #6b7280;
    font-size: 0.85rem;
    text-align: center;
    padding: 1rem 0;
  }
</style>
