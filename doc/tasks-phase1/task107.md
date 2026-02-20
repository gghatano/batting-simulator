# Task 107: 打順探索のWorker化 + UI（LineupSearchPanel）

## フェーズ

Phase 1 - UI改善

## 依存タスク

* Task 104（2カラムレイアウト内に配置）
* Task 105（即時サマリの下に配置）
* Task 106（探索ロジック）

## 内容

打順探索を Web Worker で非同期実行し、探索パラメータ入力と結果表示のUIを実装する。

### やること

* `src/workers/sim.worker.ts` を拡張:
  * 既存の `runFixed` ジョブに加え、`searchBest` ジョブを追加
  * メッセージタイプで分岐: `{ type: 'simulate', ... }` と `{ type: 'search', ... }`
* `src/lib/simRunner.ts` を拡張:
  * `runSearch(lineup, config): Promise<SearchResult>` を追加
* `src/components/LineupSearchPanel.svelte` を新規作成:
  * 入力パラメータ:
    * 探索候補数（デフォルト: 1000、範囲: 200〜5,000）
    * 1候補あたりの試合数（デフォルト: 200）
    * seed（任意）
  * 「探索開始」ボタン
  * 計算中: スピナー + 「探索中... (N候補を評価中)」表示
  * 結果表示:
    * 「平均得点 上位5打線」テーブル: 打順（1〜9番の名前）、平均得点、分散/標準偏差
    * 「分散 上位5打線」テーブル: 同上
* `SimulationPanel.svelte` の `SimulationSummary` の下に `LineupSearchPanel` を配置

## 完了条件

- [ ] 探索パラメータの入力UIが存在する
- [ ] 「探索開始」ボタンで Worker 経由で探索が実行される
- [ ] 探索中にローディング表示が出る
- [ ] 探索中にUIがフリーズしない
- [ ] 平均得点上位5打線と分散上位5打線が表示される
- [ ] 各候補に打順（選手名）、平均得点、分散が表示される
- [ ] `npm run build` が成功する

## テスト

* 手動確認: 探索パラメータ入力 → 「探索開始」→ ローディング → 結果表示
* 手動確認: 探索中にUI操作（タブ切替等）が可能
* 手動確認: 結果テーブルに5件ずつ表示され、打順・平均得点・分散がある
