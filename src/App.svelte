<script lang="ts">
  import { onMount } from 'svelte';
  import { playersStore, playersLoading, playersError, loadPlayers } from './stores/players';
  import { activeTab } from './stores/ui';
  import LineupPanel from './components/LineupPanel.svelte';
  import PlayerList from './components/PlayerList.svelte';
  import SimulationPanel from './components/SimulationPanel.svelte';

  onMount(() => {
    loadPlayers();
  });
</script>

<main>
  <h1>Batting Simulator</h1>

  {#if $playersLoading}
    <p>Loading players...</p>
  {:else if $playersError}
    <p class="error">Error: {$playersError}</p>
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
      <SimulationPanel />
    {/if}
  {/if}
</main>

<style>
  .error {
    color: red;
  }

  .layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .layout > :global(:first-child) {
    flex: 1;
    min-width: 0;
  }

  .layout > :global(:last-child) {
    flex-shrink: 0;
  }

  .tabs {
    display: flex;
    gap: 0;
    margin-bottom: 1rem;
    border-bottom: 2px solid #ccc;
  }

  .tab {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    border: 2px solid #ccc;
    border-bottom: none;
    background: #f0f0f0;
    cursor: pointer;
    border-radius: 6px 6px 0 0;
    margin-bottom: -2px;
  }

  .tab.active {
    background: #fff;
    border-bottom: 2px solid #fff;
    font-weight: bold;
  }
</style>
