# Task 020: 率計算のテスト

## フェーズ

6. テスト

## 依存タスク

* Task 012

## 内容

`rates.ts` の `calcBatterRates` 関数のユニットテストを作成する。

### やること

* `src/lib/__tests__/rates.test.ts`（または `rates.spec.ts`）を作成
* テストケース:
  1. **正常データ**: 各率が期待値と一致し、合計が 1.0
  2. **PA=0**: エラーが throw される
  3. **全打席HR**: pHR=1.0、他全て0
  4. **全打席三振**: pK=1.0（pOUT=0）
  5. **全打席四球**: pBB_HBP=1.0
  6. **pOUT が正**: 通常のスタッツで pOUT > 0
  7. **浮動小数点**: 合計が 1.0 に十分近い（`toBeCloseTo`）

## 完了条件

- [ ] テストファイルが存在する
- [ ] 上記テストケースが全て PASS する
- [ ] `npx vitest run` でテストが正常に実行される

## テスト

* `npx vitest run src/lib/__tests__/rates.test.ts`
