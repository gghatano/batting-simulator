<script lang="ts">
  import { onMount } from 'svelte';
  import { playersStore, playersLoading, playersError, loadPlayers } from './stores/players';

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
  {/if}
</main>

<style>
  .error {
    color: red;
  }
</style>
