<script lang="ts">
  import { lineupStore, selectedSlotStore, clearAll, clearSlot, swapSlots, lineupComplete } from '../stores/lineup';
  import { activeTab } from '../stores/ui';
  import LineupSlot from './LineupSlot.svelte';

  let errorMessage = '';

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

<section class="lineup-panel">
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

  <button class="start-sim-btn" type="button" on:click={handleStartSimulation}>
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
    gap: 0.5rem;
    min-width: 220px;
  }

  h2 {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
  }

  .slots {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .clear-all-btn {
    margin-top: 0.5rem;
    padding: 0.4rem 0.75rem;
    border: 1px solid #dc2626;
    border-radius: 4px;
    background: #fff;
    color: #dc2626;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.15s, color 0.15s;
  }

  .clear-all-btn:hover {
    background: #dc2626;
    color: #fff;
  }

  .start-sim-btn {
    margin-top: 0.25rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid #2563eb;
    border-radius: 4px;
    background: #2563eb;
    color: #fff;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: bold;
    transition: background-color 0.15s;
  }

  .start-sim-btn:hover {
    background: #1d4ed8;
  }

  .error-message {
    margin: 0.25rem 0 0;
    color: #dc2626;
    font-size: 0.8rem;
  }
</style>
