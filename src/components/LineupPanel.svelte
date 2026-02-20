<script lang="ts">
  import { lineupStore, selectedSlotStore, clearAll, clearSlot, swapSlots, lineupComplete } from '../stores/lineup';
  import { activeTab } from '../stores/ui';
  import LineupSlot from './LineupSlot.svelte';

  let errorMessage = '';
  let panelFlash = false;
  let prevComplete = false;

  /** Watch lineupComplete and flash when it becomes true */
  $: {
    const nowComplete = $lineupComplete;
    if (nowComplete && !prevComplete) {
      panelFlash = true;
      setTimeout(() => { panelFlash = false; }, 600);
    }
    prevComplete = nowComplete;
  }

  function handleSlotClick(index: number): void {
    selectedSlotStore.set(index);
  }

  function handleClear(e: CustomEvent<number>): void {
    clearSlot(e.detail);
  }

  function handleMoveUp(e: CustomEvent<number>): void {
    swapSlots(e.detail, e.detail - 1);
  }

  function handleMoveDown(e: CustomEvent<number>): void {
    swapSlots(e.detail, e.detail + 1);
  }

  function handleStartSimulation(): void {
    if (!$lineupComplete) {
      errorMessage = '9人全員を設定してください';
      return;
    }
    errorMessage = '';
    activeTab.set('simulation');
  }
</script>

<section class="lineup-panel" class:panel-flash={panelFlash}>
  <h2>打線</h2>

  <div class="slots">
    {#each $lineupStore as slot, i}
      <LineupSlot
        index={i}
        {slot}
        selected={$selectedSlotStore === i}
        on:click={() => handleSlotClick(i)}
        on:clear={handleClear}
        on:moveUp={handleMoveUp}
        on:moveDown={handleMoveDown}
      />
    {/each}
  </div>

  <button class="clear-all-btn" type="button" on:click={clearAll}>
    全クリア
  </button>

  <button class="start-sim-btn" class:lineup-ready={$lineupComplete} type="button" on:click={handleStartSimulation}>
    シミュレーション開始
  </button>

  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}
</section>

<style>
  .lineup-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    min-width: 220px;
  }

  h2 {
    margin: 0 0 var(--space-xs);
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .slots {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .clear-all-btn {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-danger-600);
    border-radius: var(--radius-md);
    background: var(--color-bg-surface);
    color: var(--color-danger-600);
    cursor: pointer;
    font-size: var(--font-sm);
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .clear-all-btn:hover {
    background: var(--color-danger-600);
    color: var(--color-bg-surface);
  }

  .start-sim-btn {
    margin-top: var(--space-sm);
    padding: var(--space-md) var(--space-lg);
    border: 2px solid var(--color-accent-dark);
    border-radius: var(--radius-md);
    background: var(--color-accent);
    color: var(--color-primary-700);
    cursor: pointer;
    font-size: var(--font-lg);
    font-weight: bold;
    box-shadow: var(--shadow-md);
    transition: background-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  }

  .start-sim-btn:hover {
    background: var(--color-accent-dark);
    color: var(--color-bg-surface);
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }

  .start-sim-btn:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }

  .error-message {
    margin: var(--space-xs) 0 0;
    color: var(--color-danger-600);
    font-size: var(--font-sm);
  }

  /* Panel green flash when all 9 slots are filled */
  .lineup-panel.panel-flash {
    animation: panel-green-flash 0.6s ease;
  }

  @keyframes panel-green-flash {
    0% {
      background-color: rgba(34, 197, 94, 0.25);
    }
    100% {
      background-color: transparent;
    }
  }

  /* Highlight start button when lineup is complete */
  .start-sim-btn.lineup-ready {
    animation: btn-glow 1.5s ease-in-out infinite;
    border-color: var(--color-accent);
  }

  @keyframes btn-glow {
    0%, 100% {
      box-shadow: var(--shadow-md);
    }
    50% {
      box-shadow: 0 0 12px 2px var(--color-accent-light);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lineup-panel.panel-flash {
      animation: none;
    }
    .start-sim-btn.lineup-ready {
      animation: none;
      box-shadow: 0 0 8px 2px var(--color-accent-light);
    }
  }
</style>
