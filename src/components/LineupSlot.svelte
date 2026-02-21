<script lang="ts">
  import { createEventDispatcher, afterUpdate } from 'svelte';
  import type { LineupSlot, Position } from '../lib/models';

  /** 0-based slot index */
  export let index: number;
  /** Player in this slot (or null) */
  export let slot: LineupSlot;
  /** Whether this slot is currently selected */
  export let selected: boolean;
  /** Whether a drag is currently over this slot */
  export let dragOver: boolean = false;

  const dispatch = createEventDispatcher<{
    clear: number;
    dragstart: number;
    dragover: number;
    drop: number;
    dragend: void;
  }>();

  $: isEmpty = slot === null;

  /** Batting average = (single + double + triple + hr) / pa */
  $: avg = slot && slot.pa > 0
    ? ((slot.single + slot.double + slot.triple + slot.hr) / slot.pa)
    : 0;

  /** HR rate = hr / pa */
  $: hrRate = slot && slot.pa > 0
    ? (slot.hr / slot.pa)
    : 0;

  /** Format rate as .XXX (3 decimal places, no leading zero) */
  function fmtRate(v: number): string {
    return v.toFixed(3).replace(/^0/, '');
  }

  /** Map a position to its CSS color class name */
  function positionClass(pos: Position): string {
    switch (pos) {
      case '投': return 'pos-pitcher';
      case '捕': return 'pos-catcher';
      case '一': case '二': case '三': case '遊': return 'pos-infield';
      case '左': case '中': case '右': return 'pos-outfield';
      case '指': return 'pos-dh';
      default: return '';
    }
  }

  $: posClass = slot ? positionClass(slot.position) : '';

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

  function handleDragStart(e: DragEvent): void {
    if (isEmpty) return;
    e.dataTransfer?.setData('text/plain', String(index));
    dispatch('dragstart', index);
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    dispatch('dragover', index);
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    dispatch('drop', index);
  }

  function handleDragEnd(): void {
    dispatch('dragend');
  }
</script>

<div class="lineup-slot-row">
  <button
    class="lineup-slot {posClass}"
    class:selected
    class:empty-slot={isEmpty}
    class:pulse={pulsing}
    class:drag-over={dragOver}
    on:click
    type="button"
    aria-pressed={selected}
    aria-label="{index + 1}番打者{slot ? ': ' + slot.name : ': 未設定'}{selected ? ' (選択中)' : ''}"
    draggable={!isEmpty}
    on:dragstart={handleDragStart}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
    on:dragend={handleDragEnd}
  >
    {#if selected}<span class="selected-indicator" aria-hidden="true">▶</span>{/if}
    <span class="order">{index + 1}</span>
    {#if slot}
      <span class="position-badge {posClass}">{slot.position}</span>
      <span class="player-name">{slot.name}</span>
      <span class="player-stats">{fmtRate(avg)} / HR{fmtRate(hrRate)}</span>
    {:else}
      <span class="placeholder">未設定</span>
    {/if}
  </button>

  <div class="slot-actions">
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
    transition: background-color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
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

  /* Position-based colors for filled slots */
  .lineup-slot.pos-pitcher {
    background: var(--color-pos-pitcher-bg);
    border-left-color: var(--color-pos-pitcher-accent);
  }
  .lineup-slot.pos-catcher {
    background: var(--color-pos-catcher-bg);
    border-left-color: var(--color-pos-catcher-accent);
  }
  .lineup-slot.pos-infield {
    background: var(--color-pos-infield-bg);
    border-left-color: var(--color-pos-infield-accent);
  }
  .lineup-slot.pos-outfield {
    background: var(--color-pos-outfield-bg);
    border-left-color: var(--color-pos-outfield-accent);
  }
  .lineup-slot.pos-dh {
    background: var(--color-pos-dh-bg);
    border-left-color: var(--color-pos-dh-accent);
  }

  /* Position-based colors should still show when selected */
  .lineup-slot.selected.pos-pitcher { border-left-color: var(--color-pos-pitcher-accent); }
  .lineup-slot.selected.pos-catcher { border-left-color: var(--color-pos-catcher-accent); }
  .lineup-slot.selected.pos-infield { border-left-color: var(--color-pos-infield-accent); }
  .lineup-slot.selected.pos-outfield { border-left-color: var(--color-pos-outfield-accent); }
  .lineup-slot.selected.pos-dh { border-left-color: var(--color-pos-dh-accent); }

  /* Drag & Drop styles */
  .lineup-slot:global(.dragging) {
    opacity: 0.5;
  }

  .lineup-slot.drag-over {
    border: 2px dashed var(--color-primary-500);
    border-left: 4px dashed var(--color-primary-500);
    background: var(--color-primary-50);
  }

  /* Position badge colors */
  .position-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: var(--radius-sm);
    background: var(--color-neutral-200);
    color: #fff;
    font-size: var(--font-xs);
    font-weight: 700;
    flex-shrink: 0;
    line-height: 1;
  }

  .position-badge.pos-pitcher { background: var(--color-pos-pitcher-accent); }
  .position-badge.pos-catcher { background: var(--color-pos-catcher-accent); }
  .position-badge.pos-infield { background: var(--color-pos-infield-accent); }
  .position-badge.pos-outfield { background: var(--color-pos-outfield-accent); }
  .position-badge.pos-dh { background: var(--color-pos-dh-accent); }

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

  .player-stats {
    color: var(--color-text-muted);
    font-size: var(--font-xs);
    margin-left: auto;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
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
