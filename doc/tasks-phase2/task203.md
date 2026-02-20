# Task 203: タイポグラフィの体系化

## フェーズ

Phase 2 - UIデザインブラッシュアップ

## 依存タスク

* Task 201
* Task 202

## 内容

見出し・本文・数値のフォントサイズとウェイトを整理し、一貫したタイポグラフィを適用する。

### やること

* `src/styles/global.css` に見出しスタイルを追加:
  * `h1`: `var(--font-2xl)`, font-weight 700
  * `h2`: `var(--font-xl)`, font-weight 700
  * `h3`: `var(--font-lg)`, font-weight 600
  * `h4`: `var(--font-base)`, font-weight 600
* 数値表示用のユーティリティクラスを追加:
  * `.numeric`: `font-variant-numeric: tabular-nums; font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace, system-ui`
* 各コンポーネントの見出しをトークンのフォントサイズに置換:
  * SimulationSummary, LineupSearchPanel の h3 → `var(--font-lg)`
  * LineupSearchPanel の h4 → `var(--font-base)`
* テーブル内の数値セルに `.numeric` クラスを適用（または全テーブルに `font-variant-numeric: tabular-nums` をベース適用）

## 完了条件

- [ ] 見出し (h1〜h4) のサイズが一貫している
- [ ] 数値表示がすべて tabular-nums で等幅揃えされている
- [ ] フォントサイズのハードコード値がトークンに置換されている（主要コンポーネント）
- [ ] `npm run build` が成功する

## テスト

* 手動確認: 各画面の見出しサイズが階層的に統一されている
* 手動確認: テーブルの数値列が桁揃えされている
