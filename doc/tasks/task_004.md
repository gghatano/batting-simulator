# Task 004: `Player` 型定義

## フェーズ

2. データ読み込みと一覧

## 依存タスク

* Task 003（JSONフォーマット確定のため）

## 内容

`src/lib/models.ts` に Player 型および関連する型を定義する。

### やること

* `src/lib/models.ts` を作成
* `Player` 型: `players.json` のフィールドに対応する型
* 打線関連の型:
  * `LineupSlot`: `Player | null`（9枠）
  * `Lineup`: `LineupSlot[]`（長さ9）
* シミュレーション関連の型:
  * `BatterRates`: 各イベントの確率（1B/2B/3B/HR/BB_HBP/K/OUT）
  * `SimConfig`: N, seed
  * `SimResult`: mean, median, p10, p90, distribution

## 完了条件

- [ ] `src/lib/models.ts` が存在する
- [ ] `Player` 型が `players.json` の全フィールドをカバーしている
- [ ] `BatterRates` の全イベント型が定義されている
- [ ] `SimResult` に mean/median/p10/p90/distribution が含まれる
- [ ] `npm run build` でコンパイルエラーがない

## テスト

* コンパイル時の型チェックで確認（ビルド成功）
