# Task 106: 打順探索ロジック（ランダムシャッフル + 評価）

## フェーズ

Phase 1 - UI改善

## 依存タスク

なし（ロジックのみ、UIは Task 107）

## 内容

入力打線の打順をランダムにシャッフルし、各候補をシミュレーション評価して上位を返すロジックを実装する。

### やること

* `src/lib/sim/search.ts` を新規作成
* `SearchConfig` 型:
  * `numCandidates`: 探索候補数（200〜5,000）
  * `gamesPerCandidate`: 1候補あたりのシミュレーション試合数（例: 200）
  * `seed`: seed（任意）
  * `topK`: 上位何件を返すか（デフォルト: 5）
* `SearchResult` 型:
  * `byMean`: 平均得点上位K件（打順 + mean + variance + p10 + p90）
  * `byVariance`: 分散上位K件（同上）
* `searchBestLineups(lineup: BatterRates[], config: SearchConfig): SearchResult`
  * 入力打線の打順をランダムにシャッフルして `numCandidates` 個の候補を生成
  * 各候補に対して `simulateN(candidate, gamesPerCandidate, ...)` を実行
  * 結果を平均得点順・分散順でソートし、上位K件ずつ返す
* 分散の算出: `simulateN` の結果から算出（SimResult に variance を追加、または search 内で算出）

## 完了条件

- [ ] `searchBestLineups` が正しく動作する
- [ ] 平均得点上位K件と分散上位K件がそれぞれ返る
- [ ] seed 固定で結果が再現する
- [ ] `npm run build` が成功する

## テスト

* Vitest:
  * seed 固定で2回実行 → 結果が一致
  * 全打者同一の打線 → 全候補の結果がほぼ同じ（打順の差がない）
  * topK=3 → 各リストが3件返る
  * numCandidates=10, gamesPerCandidate=50 の小規模テストが正常終了
