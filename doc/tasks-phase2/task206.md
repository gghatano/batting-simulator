# Task 206: 選手カードの改善

## フェーズ

Phase 2 - UIデザインブラッシュアップ

## 依存タスク

* Task 201
* Task 204

## 内容

選手カードのビジュアルを改善し、操作性を向上させる。

### やること

* `PlayerCard.svelte` のスタイル改善:
  * hover 時に軽い影 (`var(--shadow-sm)`) + `transform: translateY(-1px)` を追加
  * transition をスムーズに（`var(--transition-fast)`）
  * カード境界をより明確に（border 色をトークンに統一）
* ボタンの改善:
  * サイズを拡大（最低 height: 32px, padding を広げる）
  * 「追加」ボタンをカード下部の footer エリアに分離
  * 「詳細」ボタンをテキストリンク風に変更（省スペース化）
* ハードコードされた色・サイズをトークンに置換:
  * `#6b7280` → `var(--color-text-secondary)`
  * `#111827` → `var(--color-text)`
  * `#3b82f6` → `var(--color-primary-500)`
  * `#d1d5db` → `var(--color-border)`

## 完了条件

- [ ] カード hover で影 + 浮き上がりエフェクトが出る
- [ ] ボタンが十分な大きさで押しやすい
- [ ] ハードコード色がトークンに置換されている
- [ ] `npm run build` が成功する

## テスト

* 手動確認: カード hover でエフェクトが動作する
* 手動確認: ボタンが以前より大きく押しやすい
