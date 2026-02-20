# Task 012: `rates.ts` イベント率算出

## フェーズ

4. 率計算とシミュレーション（ロジック）

## 依存タスク

* Task 004

## 内容

選手のスタッツからイベント発生確率を算出する関数を実装する。

### やること

* `src/lib/rates.ts` を作成
* `calcBatterRates(player: Player): BatterRates` 関数
  * 入力: Player オブジェクト
  * 出力: `BatterRates`（各イベントの確率）
  * 算出方法（全て分母 PA）:
    * `p1B = single / pa`
    * `p2B = double / pa`
    * `p3B = triple / pa`
    * `pHR = hr / pa`
    * `pBB_HBP = (bb + hbp) / pa`
    * `pK = so / pa`
    * `pOUT = 1 - (p1B + p2B + p3B + pHR + pBB_HBP + pK)`
  * pOUT は「その他アウト」（凡打等）を吸収する残余
* PA = 0 の場合はエラーを投げる

## 完了条件

- [ ] `calcBatterRates` が正しい確率を返す
- [ ] 全確率の合計が 1.0 になる
- [ ] PA = 0 でエラーが発生する
- [ ] pOUT が負にならない（正常なデータの場合）

## テスト

* Vitest:
  * 正常データ → 各率の値が期待通り、合計が 1.0（浮動小数点誤差考慮）
  * PA = 0 → エラー throw
  * 全打席HRの選手 → pHR = 1.0, 他 = 0.0
  * 極端なデータでも pOUT >= 0
