# Task 005: 起動時に `players.json` をfetchしてstoreへ

## フェーズ

2. データ読み込みと一覧

## 依存タスク

* Task 003
* Task 004

## 内容

アプリ起動時に `public/players.json` を fetch し、Svelte store に格納する。

### やること

* `src/stores/players.ts` を作成
  * `playersStore`: writable store（`Player[]`）
  * `loadPlayers()`: fetch → JSON パース → store に set
* `App.svelte`（または起動エントリポイント）の `onMount` で `loadPlayers()` を呼び出す
* ローディング状態の管理（読み込み中 / 完了 / エラー）

## 完了条件

- [ ] `src/stores/players.ts` が存在し、`playersStore` がエクスポートされている
- [ ] アプリ起動時に `players.json` が fetch され、store にデータが格納される
- [ ] `$playersStore` で選手配列にアクセスできる
- [ ] fetch 失敗時にエラーが握りつぶされない（console.error 等）

## テスト

* 手動確認: ブラウザの DevTools > Network で `players.json` が fetch されていること
* 手動確認: DevTools > Console で store の中身をログ出力して確認
