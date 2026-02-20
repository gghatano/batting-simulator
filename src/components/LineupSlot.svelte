<script lang="ts">
  import { createEventDispatcher, afterUpdate } from 'svelte';
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

  /** Track previous slot to detect when a player is newly set */
  let prevSlot: LineupSlot = slot;
  let pulsing = false;

  afterUpdate(() => {
    if (slot !== null && prevSlot === null) {
      pulsing = true;
      setTimeout(() => { pulsing = false; }, 300);
    }
    prevSlot = slot;
  });
</script>

<div class="lineup-slot-row">
  <button
    class="lineup-slot"
    class:selected
    class:empty-slot={isEmpty}
    class:pulse={pulsing}
    on:click
    type="button"
    aria-pressed={selected}
    aria-label="{index + 1}番打者{slot ? ': ' + slot.name : ': 未設定'}{selected ? ' (選択中)' : ''}"
  >
    {#if selected}<span class="selected-indicator" aria-hidden="true">▶</span>{/if}
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
      aria-label="上に移動"
      disabled={isFirst || isEmpty}
      on:click|stopPropagation={() => dispatch('moveUp', index)}
    >↑</button>
    <button
      class="action-btn move-btn"
      type="button"
      title="下に移動"
      aria-label="下に移動"
      disabled={isLast || isEmpty}
      on:click|stopPropagation={() => dispatch('moveDown', index)}
    >↓</button>
    <button
      class="action-btn clear-btn"
      type="button"
      title="クリア"
      aria-label="クリア"
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
    border-left: 4px solid transparent;
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
    border-left-color: var(--color-primary-300);
  }

  .lineup-slot.selected {
    background: var(--color-primary-100);
    border-color: var(--color-primary-500);
    border-left: 4px solid var(--color-primary-500);
    box-shadow: var(--shadow-sm);
  }

  .lineup-slot.empty-slot {
    border-style: dashed;
    border-left-style: dashed;
    background: var(--color-neutral-50);
  }

  .lineup-slot.empty-slot.selected {
    border-left-style: solid;
    background: var(--color-primary-50);
  }

  .order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-full);
    background: var(--color-primary-500);
    color: var(--color-bg-surface);
    font-weight: bold;
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  .selected .order {
    background: var(--color-primary-700);
    color: var(--color-bg-surface);
  }

  .selected-indicator {
    color: var(--color-primary-500);
    font-size: var(--font-sm);
    flex-shrink: 0;
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
    gap: var(--space-xs);
    flex-shrink: 0;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    min-height: 32px;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-neutral-50);
    cursor: pointer;
    font-size: var(--font-base);
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

  /* Pulse animation when a player is set */
  .lineup-slot.pulse {
    animation: slot-pulse 0.3s ease;
  }

  @keyframes slot-pulse {
    0% {
      background-color: var(--color-primary-300);
    }
    100% {
      background-color: var(--color-bg-surface);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .lineup-slot.pulse {
      animation: none;
    }
  }
</style>
