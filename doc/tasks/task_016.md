# Task 016: `sim.worker.ts` Web Worker化

## フェーズ

5. Worker化と画面2

## 依存タスク

* Task 014

## 内容

シミュレーション処理を Web Worker で実行し、UIスレッドのフリーズを防ぐ。

### やること

* `src/workers/sim.worker.ts` を作成
* Worker の入力メッセージ:
  * `lineup`: `BatterRates[]`（9打者分の確率）
  * `n`: 試行回数
  * `seed`: seed値（optional）
* Worker の出力メッセージ:
  * `SimResult`（mean/median/p10/p90/distribution）
* メインスレッド側のヘルパー関数:
  * `runSimulation(lineup, n, seed): Promise<SimResult>`
  * Worker を起動 → 入力送信 → 結果を Promise で受け取る
* Vite の Worker インポート方式（`new Worker(new URL(...), import.meta.url)`）に対応

## 完了条件

- [ ] Worker が入力を受け取り、シミュレーションを実行し、結果を返す
- [ ] メインスレッド側で `Promise<SimResult>` として結果を取得できる
- [ ] N=10000 実行中にUIがフリーズしない
- [ ] Vite の dev / build 両方で Worker が正しく動作する

## テスト

* 手動確認: N=10000 でシミュレーション実行中にUI操作が可能
* 手動確認: Worker からの結果が SimResult 型として正しく受け取れる
* Vitest（Worker なしのロジックテストは Task 014 でカバー済み）
