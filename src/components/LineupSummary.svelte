<script lang="ts">
  import { lineupStore } from '../stores/lineup';
  import { activeTab } from '../stores/ui';

  $: lineup = $lineupStore;

  function goToLineup(): void {
    activeTab.set('lineup');
  }
</script>

<aside class="lineup-summary">
  <h3>現在の打線</h3>

  <ol class="lineup-list">
    {#each lineup as slot, i}
      <li class:empty={slot === null}>
        <span class="order">{i + 1}.</span>
        {#if slot}
          <span class="player-name">{slot.name}</span>
          <span class="player-team">{slot.team}</span>
        {:else}
          <span class="empty-label">---</span>
        {/if}
      </li>
    {/each}
  </ol>

  <button class="back-btn" type="button" on:click={goToLineup}>
    打線作成へ戻る
  </button>
</aside>

<style>
  .lineup-summary {
    position: sticky;
    top: var(--space-lg);
    min-width: 200px;
    max-width: 260px;
    padding: var(--space-lg);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    background: var(--color-bg-muted);
  }

  h3 {
    margin: 0 0 var(--space-md);
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  .lineup-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .lineup-list li {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--font-base);
    padding: var(--space-xs) 0.4rem;
    border-radius: var(--radius-sm);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-light);
  }

  .lineup-list li.empty {
    opacity: 0.5;
  }

  .order {
    font-weight: bold;
    min-width: 1.5em;
    text-align: right;
    color: var(--color-primary-500);
  }

  .player-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--color-text);
  }

  .player-team {
    color: var(--color-text-muted);
    font-size: var(--font-sm);
    white-space: nowrap;
  }

  .empty-label {
    color: var(--color-neutral-300);
  }

  .back-btn {
    display: block;
    width: 100%;
    margin-top: var(--space-lg);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-base);
    border: 1px solid var(--color-primary-500);
    border-radius: var(--radius-md);
    background: var(--color-bg-surface);
    color: var(--color-primary-500);
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .back-btn:hover {
    background: var(--color-primary-500);
    color: #fff;
  }
</style>
