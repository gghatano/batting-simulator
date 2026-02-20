<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, scale } from 'svelte/transition';
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

  /** Reference to the modal backdrop element for focus management */
  let backdropEl: HTMLDivElement;

  /** The element that had focus before the modal opened */
  let previouslyFocusedEl: HTMLElement | null = null;

  onMount(() => {
    // Remember the element that had focus before modal opened
    previouslyFocusedEl = document.activeElement as HTMLElement | null;
    // Focus the close button inside the modal
    requestAnimationFrame(() => {
      const closeBtn = backdropEl?.querySelector<HTMLElement>('.close-btn');
      closeBtn?.focus();
    });
  });

  onDestroy(() => {
    // Restore focus to the previously focused element
    previouslyFocusedEl?.focus();
  });

  /** Get all focusable elements within the modal */
  function getFocusableElements(): HTMLElement[] {
    if (!backdropEl) return [];
    return Array.from(
      backdropEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // Focus trap: cycle Tab within the modal
    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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
<div
  class="modal-backdrop"
  bind:this={backdropEl}
  on:click={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  tabindex="-1"
  aria-labelledby="modal-title"
  transition:fade={{ duration: 200 }}
>
  <div class="modal-content" transition:scale={{ duration: 200, start: 0.95 }}>
    <div class="modal-header">
      <h2 class="modal-title" id="modal-title">{player.name}</h2>
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
        <table class="table table-zebra rates-table">
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
              <td class="td-numeric">{fmtRate(rates.single)}</td>
              <td class="td-numeric">{player.single}</td>
            </tr>
            <tr>
              <td>二塁打 (2B)</td>
              <td class="td-numeric">{fmtRate(rates.double)}</td>
              <td class="td-numeric">{player.double}</td>
            </tr>
            <tr>
              <td>三塁打 (3B)</td>
              <td class="td-numeric">{fmtRate(rates.triple)}</td>
              <td class="td-numeric">{player.triple}</td>
            </tr>
            <tr>
              <td>本塁打 (HR)</td>
              <td class="td-numeric">{fmtRate(rates.hr)}</td>
              <td class="td-numeric">{player.hr}</td>
            </tr>
          </tbody>
        </table>

        <h3 class="section-title">その他</h3>
        <table class="table table-zebra rates-table">
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
              <td class="td-numeric">{fmtRate(rates.k)}</td>
              <td class="td-numeric">{player.so}</td>
            </tr>
            <tr>
              <td>四死球 (BB+HBP)</td>
              <td class="td-numeric">{fmtRate(rates.bb_hbp)}</td>
              <td class="td-numeric">{player.bb + player.hbp}</td>
            </tr>
            <tr>
              <td>アウト (OUT)</td>
              <td class="td-numeric">{fmtRate(rates.out)}</td>
              <td class="td-numeric">{rawOut}</td>
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
    background: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    width: 90%;
    max-width: 420px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    border-bottom: 1px solid var(--color-border-light);
    border-left: 4px solid var(--color-primary-500);
    background: var(--color-primary-50);
  }

  .modal-title {
    margin: 0;
    color: var(--color-primary-700);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: var(--font-2xl);
    line-height: 1;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0 var(--space-xs);
  }

  .close-btn:hover {
    color: var(--color-text);
  }

  .modal-body {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    padding: var(--space-xs) 0;
    font-size: var(--font-sm);
  }

  .info-label {
    color: var(--color-text-secondary);
    font-weight: 600;
  }

  .info-value {
    color: var(--color-text);
  }

  .section-title {
    margin: var(--space-md) 0 var(--space-xs);
    font-size: var(--font-sm);
    font-weight: 700;
    color: var(--color-primary-600);
    border-bottom: 1px solid var(--color-border-light);
    padding-bottom: var(--space-xs);
  }

  .rates-table th {
    text-align: left;
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-secondary);
  }

  .rates-table th:nth-child(2),
  .rates-table th:nth-child(3) {
    text-align: right;
  }

  .rates-table td {
    padding: var(--space-sm) var(--space-md);
  }

  .no-data {
    color: var(--color-text-muted);
    font-size: var(--font-sm);
    text-align: center;
    padding: var(--space-lg) 0;
  }
</style>
