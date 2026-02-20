<script lang="ts">
  import type { LineupSlot } from '../lib/models';

  /** 0-based slot index */
  export let index: number;
  /** Player in this slot (or null) */
  export let slot: LineupSlot;
  /** Whether this slot is currently selected */
  export let selected: boolean;
</script>

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

<style>
  .lineup-slot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
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
</style>
