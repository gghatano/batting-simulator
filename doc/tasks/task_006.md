# Task 006: teamフィルタ＋name検索＋ソート

## フェーズ

2. データ読み込みと一覧

## 依存タスク

* Task 005

## 内容

選手一覧のフィルタリング・検索・ソート機能を実装する。

### やること

* `src/stores/players.ts`（または別ファイル）に `filtersStore` を作成
  * `team`: 選択中のチーム名（必須）
  * `query`: 名前検索文字列（部分一致）
  * `sort`: ソートキー（`pa`, `hr_per_pa`, `ops` など）
* `filteredPlayersStore`: derived store で `playersStore` + `filtersStore` から絞り込み・ソート済み配列を算出
* チーム一覧は `playersStore` から動的に抽出

### ソート種別（初期）

* PA降順
* HR/PA降順
* OPS降順（OPS = OBP + SLG。データから算出）

## 完了条件

- [ ] チーム選択で該当チームの選手のみ表示される
- [ ] 名前検索で部分一致フィルタが動作する
- [ ] 各ソート種別で正しい順序になる
- [ ] フィルタ・ソートの組み合わせが正しく動作する

## テスト

* Vitest: `filteredPlayersStore` の derived ロジックをユニットテスト
  * チームフィルタのみ適用 → 該当チームのみ返る
  * 名前検索適用 → 部分一致で絞られる
  * ソート適用 → 正しい順序で返る
  * 複合条件 → 全条件が AND で適用される
