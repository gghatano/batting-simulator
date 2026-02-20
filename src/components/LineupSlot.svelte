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
    gap: var(--space-xs);
  }

  .lineup-slot {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    flex: 1;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface);
    cursor: pointer;
    font-size: var(--font-base);
    text-align: left;
    transition: background-color var(--transition-fast), border-color var(--transition-fast);
  }

  .lineup-slot:hover {
    background: var(--color-primary-50);
    border-color: var(--color-primary-300);
  }

  .lineup-slot.selected {
    background: var(--color-primary-50);
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 2px rgba(30, 58, 95, 0.25);
  }

  .order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--radius-full);
    background: var(--color-neutral-200);
    font-weight: bold;
    font-size: var(--font-sm);
    flex-shrink: 0;
  }

  .selected .order {
    background: var(--color-primary-500);
    color: #fff;
  }

  .player-name {
    font-weight: 600;
    color: var(--color-text);
  }

  .player-team {
    color: var(--color-text-muted);
    font-size: var(--font-sm);
    margin-left: auto;
  }

  .placeholder {
    color: var(--color-text-muted);
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
    border: 1px solid var(--color-border);
    border-radius: 3px;
    background: var(--color-neutral-50);
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1;
    transition: background-color var(--transition-fast), border-color var(--transition-fast);
  }

  .action-btn:hover:not(:disabled) {
    background: var(--color-neutral-200);
    border-color: var(--color-neutral-400);
  }

  .action-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .clear-btn {
    color: var(--color-danger-600);
    border-color: var(--color-danger-300);
  }

  .clear-btn:hover:not(:disabled) {
    background: var(--color-danger-100);
    border-color: var(--color-danger-600);
  }

  .move-btn {
    color: var(--color-neutral-700);
  }
</style>
