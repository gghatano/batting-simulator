# Task 209: テーブル共通スタイル・スピナー共通化

## フェーズ

Phase 2 - UIデザインブラッシュアップ

## 依存タスク

* Task 201

## 内容

複数コンポーネントで重複しているテーブルスタイルとスピナーアニメーションを共通化する。

### やること

* `src/styles/components.css` を新規作成
* **テーブル共通クラス**:
  * `.table`: border-collapse, width 100%, font-size `var(--font-base)`
  * `.table th`: 背景 `var(--color-bg-muted)`, font-weight 600, text-align center, padding `var(--space-sm)` `var(--space-md)`
  * `.table td`: padding `var(--space-sm)` `var(--space-md)`, border-bottom 1px solid `var(--color-border-light)`
  * `.table-zebra tr:nth-child(even) td`: 背景 `var(--color-bg-muted)` の薄い版
  * `.table-numeric` / `.td-numeric`: text-align right, font-variant-numeric tabular-nums
  * `.table-compact th, .table-compact td`: padding を縮小版
* **スピナー共通**:
  * `.spinner`: width/height 1rem, border 2px solid, border-radius 50%, アニメーション
  * `@keyframes spin` を1回だけ定義
  * `.spinner-sm`, `.spinner-lg` のサイズバリエーション
* 適用対象（各コンポーネントの重複スタイルを削除して共通クラスに置換）:
  * SimulationPanel.svelte
  * SimulationSummary.svelte
  * StatsTable.svelte
  * LineupSearchPanel.svelte
  * PlayerDetailsModal.svelte

## 完了条件

- [ ] `src/styles/components.css` が存在する
- [ ] テーブルスタイルが共通クラスで統一されている
- [ ] スピナーアニメーションが1箇所で定義されている
- [ ] 各コンポーネントの重複スタイルが削除されている
- [ ] テーブルの見た目が全コンポーネントで一貫している
- [ ] `npm run build` が成功する

## テスト

* 手動確認: 全テーブル（StatsTable, SimulationPanel, SimulationSummary, LineupSearchPanel, モーダル）の見た目が統一されている
* 手動確認: スピナーが SimulationSummary と LineupSearchPanel で同一の見た目
