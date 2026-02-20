<script lang="ts">
  import { lineupStore, selectedSlotStore, clearAll } from '../stores/lineup';
  import LineupSlot from './LineupSlot.svelte';

  function handleSlotClick(index: number): void {
    selectedSlotStore.set(index);
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
      />
    {/each}
  </div>

  <button class="clear-all-btn" type="button" on:click={clearAll}>
    全クリア
  </button>
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
</style>
