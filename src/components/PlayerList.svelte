<script lang="ts">
  import { filtersStore, filteredPlayersStore, teamsStore } from '../stores/players';
  import type { SortKey } from '../stores/players';
  import PlayerCard from './PlayerCard.svelte';

  function setTeam(e: Event): void {
    const target = e.target as HTMLSelectElement;
    filtersStore.update((f) => ({ ...f, team: target.value }));
  }

  function setQuery(e: Event): void {
    const target = e.target as HTMLInputElement;
    filtersStore.update((f) => ({ ...f, query: target.value }));
  }

  function setSort(e: Event): void {
    const target = e.target as HTMLSelectElement;
    filtersStore.update((f) => ({ ...f, sort: target.value as SortKey }));
  }
</script>

<section class="player-list">
  <h2>選手一覧</h2>

  <div class="filters">
    <label class="filter-item">
      <span class="filter-label">チーム</span>
      <select value={$filtersStore.team} on:change={setTeam}>
        <option value="">すべて</option>
        {#each $teamsStore as team}
          <option value={team}>{team}</option>
        {/each}
      </select>
    </label>

    <label class="filter-item">
      <span class="filter-label">名前検索</span>
      <input
        type="text"
        placeholder="選手名..."
        value={$filtersStore.query}
        on:input={setQuery}
      />
    </label>

    <label class="filter-item">
      <span class="filter-label">ソート</span>
      <select value={$filtersStore.sort} on:change={setSort}>
        <option value="pa">打席数</option>
        <option value="hr_per_pa">HR率</option>
        <option value="ops">OPS</option>
      </select>
    </label>
  </div>

  <div class="cards">
    {#each $filteredPlayersStore as player (player.id)}
      <PlayerCard {player} />
    {/each}

    {#if $filteredPlayersStore.length === 0}
      <p class="no-results">該当する選手が見つかりません</p>
    {/if}
  </div>
</section>

<style>
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  h2 {
    margin: 0 0 0.25rem;
    font-size: 1.1rem;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .filter-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .filters select,
  .filters input {
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
  }

  .filters input {
    min-width: 160px;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.5rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .no-results {
    color: var(--color-text-muted);
    font-style: italic;
    text-align: center;
    padding: var(--space-lg);
  }
</style>
