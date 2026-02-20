<script lang="ts">
  import { setPlayers, loadPlayers } from '../stores/players';
  import { parseCSV } from '../lib/csvParser';
  import { loadFromSpreadsheet } from '../lib/spreadsheetLoader';

  let fileInput: HTMLInputElement;
  let warnings: string[] = [];
  let importedCount: number | null = null;

  // Spreadsheet URL input state
  let spreadsheetUrl: string = '';
  let isLoading: boolean = false;
  let showFormatHelp: boolean = false;

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

  async function handleLoadFromUrl(): Promise<void> {
    if (!spreadsheetUrl.trim() || isLoading) return;

    isLoading = true;
    warnings = [];
    importedCount = null;

    try {
      const result = await loadFromSpreadsheet(spreadsheetUrl);

      warnings = result.warnings;

      if (result.players.length === 0 && result.warnings.length > 0) {
        return;
      }

      setPlayers(result.players);
      importedCount = result.players.length;
    } catch (err) {
      warnings = [err instanceof Error ? err.message : String(err)];
    } finally {
      isLoading = false;
    }
  }

  function handleReset(): void {
    warnings = [];
    importedCount = null;
    spreadsheetUrl = '';
    loadPlayers();
  }

  function toggleFormatHelp(): void {
    showFormatHelp = !showFormatHelp;
  }
</script>

<div class="data-import">
  <div class="data-import-buttons">
    <button class="btn btn-import" on:click={handleClick}>
      CSVファイル読み込み
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

  <div class="url-import-section">
    <div class="url-input-row">
      <input
        type="text"
        class="url-input"
        placeholder="Google Spreadsheet の公開URL"
        bind:value={spreadsheetUrl}
        disabled={isLoading}
        on:keydown={(e) => { if (e.key === 'Enter') handleLoadFromUrl(); }}
      />
      <button
        class="btn btn-import"
        on:click={handleLoadFromUrl}
        disabled={isLoading || !spreadsheetUrl.trim()}
      >
        {#if isLoading}
          <span class="spinner spinner-sm"></span>
          読み込み中...
        {:else}
          URLから読み込み
        {/if}
      </button>
    </div>
    <button class="format-help-toggle" on:click={toggleFormatHelp}>
      {showFormatHelp ? '▼' : '▶'} フォーマット説明
    </button>
    {#if showFormatHelp}
      <div class="format-help">
        <p class="format-help-desc">
          スプレッドシートを「ウェブに公開」するか、「リンクを知っている全員がアクセス可能」に設定してください。
        </p>
        <p class="format-help-desc">CSVヘッダー（1行目）に以下の列が必要です:</p>
        <code class="format-help-columns">id, name, team, position, pa, single, double, triple, hr, bb, hbp, so</code>
      </div>
    {/if}
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

  .btn-import:hover:not(:disabled) {
    background: var(--color-primary-400);
    border-color: var(--color-primary-400);
  }

  .btn-import:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-reset {
    background: var(--color-bg-surface);
    color: var(--color-text-secondary);
  }

  .btn-reset:hover {
    background: var(--color-neutral-100);
  }

  /* URL import section */
  .url-import-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .url-input-row {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
  }

  .url-input {
    flex: 1;
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    color: var(--color-text);
    background: var(--color-bg-surface);
  }

  .url-input:focus {
    outline: none;
    border-color: var(--color-primary-400);
    box-shadow: 0 0 0 2px var(--color-primary-50);
  }

  .url-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Format help */
  .format-help-toggle {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    cursor: pointer;
    text-align: left;
  }

  .format-help-toggle:hover {
    color: var(--color-text);
  }

  .format-help {
    background: var(--color-bg-muted);
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-sm);
  }

  .format-help-desc {
    margin: 0 0 var(--space-xs) 0;
    color: var(--color-text-secondary);
  }

  .format-help-columns {
    display: block;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-sm);
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-xs);
    color: var(--color-text);
    word-break: break-all;
  }

  /* Spinner inline (from components.css keyframes) */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border: 1.5px solid rgba(255, 255, 255, 0.4);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle;
    margin-right: var(--space-xs);
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
