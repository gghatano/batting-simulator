<script lang="ts">
  import { onMount } from 'svelte';
  import { playersStore, playersLoading, playersError, loadPlayers } from './stores/players';
  import LineupPanel from './components/LineupPanel.svelte';
  import PlayerList from './components/PlayerList.svelte';

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
    <div class="layout">
      <PlayerList />
      <LineupPanel />
    </div>
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
</style>
