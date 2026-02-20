<script lang="ts">
  import { setPlayers, loadPlayers } from '../stores/players';
  import { parseCSV } from '../lib/csvParser';

  let fileInput: HTMLInputElement;
  let warnings: string[] = [];
  let importedCount: number | null = null;

  function handleClick(): void {
    fileInput.click();
  }

  async function handleFileChange(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = parseCSV(text);

      warnings = result.warnings;

      if (result.players.length === 0 && result.warnings.length > 0) {
        importedCount = null;
        return;
      }

      setPlayers(result.players);
      importedCount = result.players.length;
    } catch (err) {
      warnings = [`ファイルの読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`];
      importedCount = null;
    }

    // Reset so the same file can be re-selected
    input.value = '';
  }

  function handleReset(): void {
    warnings = [];
    importedCount = null;
    loadPlayers();
  }
</script>

<div class="data-import">
  <div class="data-import-buttons">
    <button class="btn btn-import" on:click={handleClick}>
      データ読み込み
    </button>
    <button class="btn btn-reset" on:click={handleReset}>
      デフォルトに戻す
    </button>
    <input
      bind:this={fileInput}
      type="file"
      accept=".csv"
      class="hidden-input"
      on:change={handleFileChange}
    />
  </div>

  {#if importedCount !== null}
    <p class="import-success">{importedCount}件の選手データを読み込みました。</p>
  {/if}

  {#if warnings.length > 0}
    <div class="import-warnings" role="alert">
      <p class="warnings-title">警告:</p>
      <ul>
        {#each warnings as warning}
          <li>{warning}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .data-import {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .data-import-buttons {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
  }

  .hidden-input {
    display: none;
  }

  .btn {
    padding: var(--space-xs) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    cursor: pointer;
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .btn-import {
    background: var(--color-primary-500);
    color: #ffffff;
    border-color: var(--color-primary-500);
  }

  .btn-import:hover {
    background: var(--color-primary-400);
    border-color: var(--color-primary-400);
  }

  .btn-reset {
    background: var(--color-bg-surface);
    color: var(--color-text-secondary);
  }

  .btn-reset:hover {
    background: var(--color-neutral-100);
  }

  .import-success {
    margin: 0;
    color: #16a34a;
    font-size: var(--font-sm);
  }

  .import-warnings {
    background: var(--color-danger-50);
    border: 1px solid var(--color-danger-200);
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-sm);
  }

  .warnings-title {
    margin: 0 0 var(--space-xs) 0;
    font-weight: 600;
    color: var(--color-danger-700);
  }

  .import-warnings ul {
    margin: 0;
    padding-left: var(--space-lg);
  }

  .import-warnings li {
    color: var(--color-danger-600);
    margin-bottom: var(--space-xs);
  }

  .import-warnings li:last-child {
    margin-bottom: 0;
  }
</style>
