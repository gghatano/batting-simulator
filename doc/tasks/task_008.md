# Task 008: `lineupStore`（9枠、重複可）実装

## フェーズ

3. 打線作成UI

## 依存タスク

* Task 004

## 内容

打線の状態管理を行う Svelte store を実装する。

### やること

* `src/stores/lineup.ts` を作成
* `lineupStore`: writable store（`(Player | null)[]`、長さ9、初期値は全て null）
* `selectedSlotStore`: writable store（`number`、0〜8、現在選択中の枠番号）
* ストア操作関数:
  * `setSlot(index, player)`: 指定枠に選手をセット（重複可）
  * `clearSlot(index)`: 指定枠をクリア
  * `clearAll()`: 全枠クリア
  * `swapSlots(i, j)`: 2枠を入れ替え

## 完了条件

- [ ] `lineupStore` が9枠の配列として初期化される
- [ ] `setSlot` で同一選手を複数枠にセットできる（重複可）
- [ ] `clearSlot` で指定枠が null に戻る
- [ ] `clearAll` で全枠が null に戻る
- [ ] `swapSlots` で2枠の中身が入れ替わる
- [ ] `selectedSlotStore` で選択中の枠番号を管理できる

## テスト

* Vitest:
  * 初期状態が9枠すべて null
  * `setSlot(0, playerA)` → 0番枠が playerA
  * `setSlot(1, playerA)` → 重複OK、0番と1番が同じ選手
  * `clearSlot(0)` → 0番が null、1番はそのまま
  * `clearAll()` → 全枠 null
  * `swapSlots(0, 1)` → 中身が入れ替わる
