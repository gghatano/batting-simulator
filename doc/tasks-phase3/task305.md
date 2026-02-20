# Task 305: 外部データ読み込み（Google Spreadsheet）

## フェーズ

Phase 3 - UX改善・機能追加

## 依存タスク

* Task 304（CSVパーサー完成後）

## 背景

CSVファイルに加えて、Google Spreadsheet の公開URLからもデータを取得できるようにする。共有しやすく、チームでの運用に便利。

## 内容

### やること

* **Google Spreadsheet 公開CSV取得**:
  * Google Spreadsheet を「ウェブに公開」→ CSV形式で取得可能
  * URL形式: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv`
  * または「リンクを知っている全員がアクセス可能」に設定したシートの公開CSV URL
* **URL入力UI**:
  * 「データ読み込み」ボタンの近くに「URLから読み込み」オプションを追加
  * テキスト入力フィールド + 「読み込み」ボタン
  * プレースホルダ: `Google Spreadsheet の公開URL`
* **読み込み処理** (`src/lib/spreadsheetLoader.ts`):
  * `loadFromSpreadsheet(url: string): Promise<Player[]>` 関数
  * URLを公開CSV URLに変換（`/edit` → `/export?format=csv`）
  * `fetch` でCSVを取得
  * Task 304 の `parseCSV` を再利用してパース
  * CORS対応: 直接 fetch できない場合のエラーハンドリング
* **ローディング状態**:
  * 読み込み中はスピナーを表示
  * エラー時はわかりやすいメッセージ（「スプレッドシートが公開設定になっているか確認してください」等）
* **フォーマット説明**:
  * UIに「フォーマット」リンクまたはヘルプアイコンを追加
  * クリックで必要な列名（id, name, team, position, pa, single, ...）を表示

## 完了条件

- [ ] Google Spreadsheet の公開URLを入力してデータを読み込める
- [ ] 読み込み中にローディング表示がある
- [ ] CORS等のエラー時に適切なメッセージが表示される
- [ ] CSVとSpreadsheet の両方の読み込みUIが統合されている
- [ ] `npm run build` が成功する

## テスト

* ユニットテスト: URL変換ロジックのテスト
  * `https://docs.google.com/spreadsheets/d/xxx/edit#gid=0` → 公開CSV URL
  * 不正なURL → エラー
* 手動確認: 公開設定のスプレッドシートURLを入力 → 選手データが読み込まれる
* 手動確認: 非公開シート → エラーメッセージが表示される
