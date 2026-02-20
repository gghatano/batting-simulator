<script lang="ts">
  import { onMount } from 'svelte';
  import { playersStore, playersLoading, playersError, loadPlayers } from './stores/players';
  import { activeTab } from './stores/ui';
  import LineupPanel from './components/LineupPanel.svelte';
  import LineupSummary from './components/LineupSummary.svelte';
  import PlayerList from './components/PlayerList.svelte';
  import DataImport from './components/DataImport.svelte';
  import SimulationPanel from './components/SimulationPanel.svelte';

  onMount(() => {
    loadPlayers();
  });

  type TabId = 'lineup' | 'simulation';
  const tabs: { id: TabId; label: string }[] = [
    { id: 'lineup', label: '⚾ 打線作成' },
    { id: 'simulation', label: '📊 シミュレーション' },
  ];

  function handleTabKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const currentIndex = tabs.findIndex(t => t.id === $activeTab);
      let nextIndex: number;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }
      activeTab.set(tabs[nextIndex].id);
      // Focus the newly active tab button
      const tabButtons = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]');
      tabButtons[nextIndex]?.focus();
    }
  }
</script>

<header class="app-header">
  <div class="header-row">
    <h1 class="app-title">⚾ Batting Simulator</h1>
    <DataImport />
  </div>
</header>

<!-- svelte-ignore a11y-interactive-supports-focus a11y-no-noninteractive-element-to-interactive-role -->
<nav class="tabs" role="tablist" aria-label="メインナビゲーション" on:keydown={handleTabKeydown}>
  {#each tabs as tab (tab.id)}
    <button
      class="tab"
      class:active={$activeTab === tab.id}
      on:click={() => activeTab.set(tab.id)}
      role="tab"
      id="tab-{tab.id}"
      aria-selected={$activeTab === tab.id}
      aria-controls="tabpanel-{tab.id}"
      tabindex={$activeTab === tab.id ? 0 : -1}
    >
      {tab.label}
    </button>
  {/each}
</nav>

<main>
  {#if $playersLoading}
    <div class="loading-state">
      <span class="spinner spinner-lg"></span>
      <p>Loading players...</p>
    </div>
  {:else if $playersError}
    <div class="alert-danger" role="alert" aria-live="polite">
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
      <div class="layout tab-fade-in" role="tabpanel" id="tabpanel-lineup" aria-labelledby="tab-lineup">
        <PlayerList />
        <LineupPanel />
      </div>
    {:else}
      <div class="sim-layout tab-fade-in" role="tabpanel" id="tabpanel-simulation" aria-labelledby="tab-simulation">
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

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
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

  /* Tab content fade-in */
  .tab-fade-in {
    animation: tab-fade 0.2s ease;
  }

  @keyframes tab-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tab-fade-in {
      animation: none;
    }
  }

  /* ---- Responsive: 768px and below ---- */
  @media (max-width: 768px) {
    .app-title {
      font-size: var(--font-xl);
    }

    .tabs {
      padding: 0 var(--space-md);
    }

    .tab {
      padding: var(--space-sm) var(--space-lg);
      font-size: var(--font-base);
    }

    main {
      padding: var(--space-md) var(--space-md);
    }

    .layout {
      flex-direction: column;
    }

    .layout > :global(:last-child) {
      flex-shrink: 1;
      width: 100%;
    }

    .sim-layout {
      flex-direction: column;
    }

    .sim-layout > :global(:last-child) {
      flex-shrink: 1;
      width: 100%;
    }
  }
</style>
