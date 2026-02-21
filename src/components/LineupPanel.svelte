<script lang="ts">
  import { lineupStore, selectedSlotStore, clearAll, clearSlot, swapSlots, lineupComplete } from '../stores/lineup';
  import { activeTab } from '../stores/ui';
  import LineupSlot from './LineupSlot.svelte';
  import FieldDiagram from './FieldDiagram.svelte';

  let errorMessage = '';
  let panelFlash = false;
  let prevComplete = false;

  /** Drag & drop state */
  let dragIndex: number | null = null;
  let dragOverIndex: number | null = null;

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

  function handleDragStart(e: CustomEvent<number>): void {
    dragIndex = e.detail;
  }

  function handleDragOver(e: CustomEvent<number>): void {
    if (dragIndex !== null && e.detail !== dragIndex) {
      dragOverIndex = e.detail;
    }
  }

  function handleDrop(e: CustomEvent<number>): void {
    if (dragIndex !== null && e.detail !== dragIndex) {
      swapSlots(dragIndex, e.detail);
    }
    dragIndex = null;
    dragOverIndex = null;
  }

  function handleDragEnd(): void {
    dragIndex = null;
    dragOverIndex = null;
  }

  function handleStartSimulation(): void {
    if (!$lineupComplete) {
      errorMessage = '9人全員を設定してください';
      return;
    }
    errorMessage = '';
    activeTab.set('simulation');
  }

  /** Keyboard navigation for lineup slots (arrow keys) */
  function handleSlotsKeydown(e: KeyboardEvent): void {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!keys.includes(e.key)) return;

    e.preventDefault();
    const current = $selectedSlotStore;
    let next: number;

    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      next = current <= 0 ? 8 : current - 1;
    } else {
      next = current >= 8 ? 0 : current + 1;
    }

    selectedSlotStore.set(next);

    // Focus the newly selected slot button
    const container = e.currentTarget as HTMLElement;
    const slotButtons = container.querySelectorAll<HTMLElement>('.lineup-slot');
    slotButtons[next]?.focus();
  }
</script>

<section class="lineup-panel" class:panel-flash={panelFlash}>
  <h2>打線</h2>

  <!-- svelte-ignore a11y-interactive-supports-focus -->
  <div class="slots" role="listbox" aria-label="打順リスト" on:keydown={handleSlotsKeydown}>
    {#each $lineupStore as slot, i}
      <LineupSlot
        index={i}
        {slot}
        selected={$selectedSlotStore === i}
        dragOver={dragOverIndex === i}
        on:click={() => handleSlotClick(i)}
        on:clear={handleClear}
        on:dragstart={handleDragStart}
        on:dragover={handleDragOver}
        on:drop={handleDrop}
        on:dragend={handleDragEnd}
      />
    {/each}
  </div>

  <FieldDiagram />

  <button class="clear-all-btn" type="button" on:click={clearAll}>
    全クリア
  </button>

  <button class="start-sim-btn" class:lineup-ready={$lineupComplete} type="button" on:click={handleStartSimulation}>
    シミュレーション開始
  </button>

  {#if errorMessage}
    <p class="error-message" role="alert" aria-live="polite">
      <span class="error-icon" aria-hidden="true">&#x26A0;&#xFE0F;</span>
      {errorMessage}
    </p>
  {/if}
</section>

<style>
  .lineup-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    width: 320px;
    flex-shrink: 0;
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
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .error-icon {
    flex-shrink: 0;
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

  @media (max-width: 768px) {
    .lineup-panel {
      width: 100%;
    }
  }
</style>
