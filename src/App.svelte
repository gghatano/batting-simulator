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

<header class="app-header">
  <h1 class="app-title">⚾ Batting Simulator</h1>
</header>

<nav class="tabs">
  <button
    class="tab"
    class:active={$activeTab === 'lineup'}
    on:click={() => activeTab.set('lineup')}
  >
    ⚾ 打線作成
  </button>
  <button
    class="tab"
    class:active={$activeTab === 'simulation'}
    on:click={() => activeTab.set('simulation')}
  >
    📊 シミュレーション
  </button>
</nav>

<main>
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
    <p class="player-count">{$playersStore.length} players loaded.</p>

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
  .app-header {
    background: var(--color-primary-700);
    color: #ffffff;
    padding: var(--space-md) var(--space-xl);
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--shadow-md);
  }

  .app-title {
    margin: 0;
    font-size: var(--font-2xl);
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .tabs {
    display: flex;
    gap: 0;
    background: var(--color-bg-surface);
    border-bottom: 2px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 99;
    padding: 0 var(--space-xl);
  }

  .tab {
    padding: var(--space-md) var(--space-2xl);
    font-size: var(--font-xl);
    border: none;
    border-bottom: 3px solid transparent;
    background: transparent;
    cursor: pointer;
    color: var(--color-text-secondary);
    transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
    margin-bottom: -2px;
    font-weight: 500;
  }

  .tab:hover {
    background: var(--color-primary-50);
    color: var(--color-primary-500);
  }

  .tab.active {
    background: var(--color-primary-50);
    border-bottom: 3px solid var(--color-primary-500);
    font-weight: 700;
    color: var(--color-primary-700);
  }

  main {
    padding: var(--space-lg) var(--space-xl);
  }

  .player-count {
    color: var(--color-text-muted);
    font-size: var(--font-sm);
    margin-bottom: var(--space-md);
  }

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
</style>
