# Task 014: `simulate.ts` 1試合シミュレーション×N試行

## フェーズ

4. 率計算とシミュレーション（ロジック）

## 依存タスク

* Task 012
* Task 013
* Task 015

## 内容

1試合（9回）のシミュレーションエンジンと、N回試行して統計量を算出する関数を実装する。

### やること

* `src/lib/sim/simulate.ts` を作成
* `simulateGame(lineup: BatterRates[], rng: () => number): number`
  * 9回（延長なし）を処理
  * 各回: 3アウトまで打者を順番に打席に立たせる
  * 打者は1番から順に、回をまたいで打順を引き継ぐ
  * 乱数（rng）でイベントを決定: 累積確率で区間判定
  * 戻り値: 1試合の総得点
* `simulateN(lineup: BatterRates[], n: number, seed?: number): SimResult`
  * N回 `simulateGame` を実行
  * 得点配列から統計量を算出:
    * mean（平均）
    * median（中央値）
    * p10（10パーセンタイル）
    * p90（90パーセンタイル）
    * distribution: `Map<number, number>`（得点 → 出現回数）

## 完了条件

- [ ] `simulateGame` が9回3アウト制で正しく動作する
- [ ] 打順が回をまたいで引き継がれる
- [ ] `simulateN` が mean/median/p10/p90/distribution を正しく返す
- [ ] seed 指定時に結果が再現する

## テスト

* Vitest:
  * 全打者 pOUT=1.0 の打線 → 全試行0得点
  * 全打者 pHR=1.0 の打線 → 全打席HRで大量得点（計算可能な期待値と一致）
  * seed 固定で2回実行 → 結果が一致
  * N=1000 程度で統計量の妥当性を確認（平均が極端に外れない）
