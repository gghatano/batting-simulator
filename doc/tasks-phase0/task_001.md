# Task 001: Vite + Svelte + TS テンプレ生成

## フェーズ

1. プロジェクト基盤

## 依存タスク

なし

## 内容

Vite + Svelte + TypeScript のプロジェクトを初期化する。SvelteKit は使わない。

### やること

* `npm create vite@latest` で Svelte + TypeScript テンプレートを生成（または手動セットアップ）
* 不要なテンプレートコード（デフォルトのカウンターアプリ等）を削除
* Vitest を devDependencies に追加し、`vitest.config.ts` を作成
* `package.json` の scripts に `dev`, `build`, `preview`, `test` を設定
* TypeScript の `strict: true` を確認

## 完了条件

- [ ] `npm run dev` でVite開発サーバが起動し、ブラウザでページが表示される
- [ ] `npm run build` でエラーなくビルドが完了し `dist/` が生成される
- [ ] `npx vitest run` が実行できる（テストファイルが無くてもエラー終了しない）
- [ ] TypeScript strict mode が有効

## テスト

* 手動確認: `npm run dev` → ブラウザアクセス → 画面表示
* 手動確認: `npm run build` → 正常終了
