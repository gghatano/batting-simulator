# Task 212: レスポンシブ対応の強化

## フェーズ

Phase 2 - UIデザインブラッシュアップ

## 依存タスク

* Task 201
* Task 205（ヘッダー完成後）
* Task 206（カード完成後）
* Task 207（打線パネル完成後）

## 内容

モバイル・タブレット幅でのレイアウト崩れを修正し、全画面幅で使えるようにする。

### やること

* `src/styles/global.css` にブレークポイントを定義（トークンとして）:
  * `--breakpoint-sm`: 640px
  * `--breakpoint-md`: 768px
  * `--breakpoint-lg`: 1024px
* `App.svelte`:
  * 768px 以下: 2カラム → シングルカラム（flex-direction: column）
  * 打線パネルを下に配置
  * sim-layout も同様にシングルカラム化
* `PlayerList.svelte`:
  * カードグリッドの minmax をメディアクエリで調整（小画面: minmax(140px, 1fr)）
* `LineupPanel.svelte` / `LineupSummary.svelte`:
  * min-width を小画面で解除
* タブ:
  * 小画面でフォントサイズを縮小
* テーブル:
  * 横幅が足りない場合は `overflow-x: auto` のラッパーで横スクロール

## 完了条件

- [ ] 768px 以下でシングルカラムレイアウトに切り替わる
- [ ] 小画面で横スクロールが発生しない（テーブル内は除く）
- [ ] カードグリッドが小画面でも適切に表示される
- [ ] タブが小画面でも操作可能
- [ ] `npm run build` が成功する

## テスト

* 手動確認: Chrome DevTools でモバイル幅（375px, 414px）に変更して全画面確認
* 手動確認: タブレット幅（768px）でレイアウトが切り替わる
* 手動確認: テーブルが横スクロールで閲覧可能
