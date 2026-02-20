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
    top: 1rem;
    min-width: 200px;
    max-width: 260px;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #fafafa;
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
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
    font-size: 0.9rem;
    padding: 0.25rem 0.4rem;
    border-radius: 4px;
    background: #fff;
    border: 1px solid #eee;
  }

  .lineup-list li.empty {
    opacity: 0.5;
  }

  .order {
    font-weight: bold;
    min-width: 1.5em;
    text-align: right;
  }

  .player-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-team {
    color: #888;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  .empty-label {
    color: #bbb;
  }

  .back-btn {
    display: block;
    width: 100%;
    margin-top: 1rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #2563eb;
    border-radius: 6px;
    background: #fff;
    color: #2563eb;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
  }

  .back-btn:hover {
    background: #2563eb;
    color: #fff;
  }
</style>
