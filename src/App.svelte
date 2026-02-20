<script lang="ts">
  import { onMount } from 'svelte';
  import { playersStore, playersLoading, playersError, loadPlayers } from './stores/players';
  import { activeTab } from './stores/ui';
  import LineupPanel from './components/LineupPanel.svelte';
  import LineupSummary from './components/LineupSummary.svelte';
  import PlayerList from './components/PlayerList.svelte';
  import SimulationPanel from './components/SimulationPanel.svelte';

  onMount(() => {
    loadPlayers();
  });
</script>

<main>
  <h1>Batting Simulator</h1>

  {#if $playersLoading}
    <div class="loading-state">
      <span class="spinner spinner-lg"></span>
      <p>Loading players...</p>
    </div>
  {:else if $playersError}
    <div class="alert-danger">
      <span class="alert-icon">&#x26A0;&#xFE0F;</span>
      <div class="alert-body">
        <p class="alert-message">Error: {$playersError}</p>
        <div class="alert-action">
          <button on:click={() => loadPlayers()}>再読み込み</button>
        </div>
      </div>
    </div>
  {:else}
    <p>{$playersStore.length} players loaded.</p>

    <nav class="tabs">
      <button
        class="tab"
        class:active={$activeTab === 'lineup'}
        on:click={() => activeTab.set('lineup')}
      >
        打線作成
      </button>
      <button
        class="tab"
        class:active={$activeTab === 'simulation'}
        on:click={() => activeTab.set('simulation')}
      >
        シミュレーション
      </button>
    </nav>

    {#if $activeTab === 'lineup'}
      <div class="layout">
        <PlayerList />
        <LineupPanel />
      </div>
    {:else}
      <div class="sim-layout">
        <SimulationPanel />
        <LineupSummary />
      </div>
    {/if}
  {/if}
</main>

<style>
  .loading-state {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-xl) 0;
  }

  .loading-state p {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: var(--font-lg);
  }

  .layout {
    display: flex;
    gap: var(--space-xl);
    align-items: flex-start;
  }

  .layout > :global(:first-child) {
    flex: 1;
    min-width: 0;
  }

  .layout > :global(:last-child) {
    flex-shrink: 0;
  }

  .sim-layout {
    display: flex;
    gap: var(--space-xl);
    align-items: flex-start;
  }

  .sim-layout > :global(:first-child) {
    flex: 1;
    min-width: 0;
  }

  .sim-layout > :global(:last-child) {
    flex-shrink: 0;
  }

  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: var(--space-lg);
    border-bottom: 2px solid var(--color-border);
  }

  .tab {
    padding: var(--space-sm) var(--space-xl);
    font-size: var(--font-lg);
    border: 2px solid var(--color-border);
    border-bottom: none;
    background: var(--color-bg-muted);
    cursor: pointer;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    margin-bottom: -2px;
    color: var(--color-text-secondary);
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .tab:hover {
    background: var(--color-primary-50);
    color: var(--color-primary-500);
  }

  .tab.active {
    background: var(--color-bg-surface);
    border-color: var(--color-primary-500);
    border-bottom: 2px solid var(--color-bg-surface);
    font-weight: bold;
    color: var(--color-primary-500);
  }
</style>
