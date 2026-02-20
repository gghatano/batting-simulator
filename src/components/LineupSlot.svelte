<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { LineupSlot } from '../lib/models';

  /** 0-based slot index */
  export let index: number;
  /** Player in this slot (or null) */
  export let slot: LineupSlot;
  /** Whether this slot is currently selected */
  export let selected: boolean;

  const dispatch = createEventDispatcher<{
    clear: number;
    moveUp: number;
    moveDown: number;
  }>();

  $: isEmpty = slot === null;
  $: isFirst = index === 0;
  $: isLast = index === 8;
</script>

<div class="lineup-slot-row">
  <button
    class="lineup-slot"
    class:selected
    on:click
    type="button"
    aria-pressed={selected}
  >
    <span class="order">{index + 1}</span>
    {#if slot}
      <span class="player-name">{slot.name}</span>
      <span class="player-team">{slot.team}</span>
    {:else}
      <span class="placeholder">未設定</span>
    {/if}
  </button>

  <div class="slot-actions">
    <button
      class="action-btn move-btn"
      type="button"
      title="上に移動"
      disabled={isFirst || isEmpty}
      on:click|stopPropagation={() => dispatch('moveUp', index)}
    >↑</button>
    <button
      class="action-btn move-btn"
      type="button"
      title="下に移動"
      disabled={isLast || isEmpty}
      on:click|stopPropagation={() => dispatch('moveDown', index)}
    >↓</button>
    <button
      class="action-btn clear-btn"
      type="button"
      title="クリア"
      disabled={isEmpty}
      on:click|stopPropagation={() => dispatch('clear', index)}
    >×</button>
  </div>
</div>

<style>
  .lineup-slot-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .lineup-slot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
    text-align: left;
    transition: background-color 0.15s, border-color 0.15s;
  }

  .lineup-slot:hover {
    background: #f0f4ff;
    border-color: #99b;
  }

  .lineup-slot.selected {
    background: #dbeafe;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }

  .order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: #e5e7eb;
    font-weight: bold;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .selected .order {
    background: #3b82f6;
    color: #fff;
  }

  .player-name {
    font-weight: 600;
  }

  .player-team {
    color: #666;
    font-size: 0.8rem;
    margin-left: auto;
  }

  .placeholder {
    color: #999;
    font-style: italic;
  }

  .slot-actions {
    display: flex;
    gap: 0.15rem;
    flex-shrink: 0;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 3px;
    background: #f9fafb;
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1;
    transition: background-color 0.15s, border-color 0.15s;
  }

  .action-btn:hover:not(:disabled) {
    background: #e5e7eb;
    border-color: #999;
  }

  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .clear-btn {
    color: #dc2626;
    border-color: #fca5a5;
  }

  .clear-btn:hover:not(:disabled) {
    background: #fee2e2;
    border-color: #dc2626;
  }

  .move-btn {
    color: #374151;
  }
</style>
