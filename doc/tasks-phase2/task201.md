# Task 201: デザイントークンの定義（CSS Custom Properties）

## フェーズ

Phase 2 - UIデザインブラッシュアップ

## 依存タスク

なし

## 内容

全コンポーネントで共有するデザイントークン（色・サイズ・余白・角丸・影・トランジション）を CSS Custom Properties として一元定義する。

### やること

* `src/styles/tokens.css` を新規作成
* 以下のトークンを定義:
  * **カラー**:
    * `--color-primary-50` 〜 `--color-primary-700`（メインカラー系列）
    * `--color-danger-50` 〜 `--color-danger-700`（赤系）
    * `--color-neutral-50` 〜 `--color-neutral-900`（灰色系）
    * `--color-bg`, `--color-bg-surface`, `--color-bg-muted`
    * `--color-text`, `--color-text-secondary`, `--color-text-muted`
    * `--color-border`, `--color-border-light`
  * **フォントサイズ**: `--font-xs`(0.72rem), `--font-sm`(0.8rem), `--font-base`(0.9rem), `--font-lg`(1rem), `--font-xl`(1.25rem), `--font-2xl`(1.5rem)
  * **余白**: `--space-xs`(0.25rem), `--space-sm`(0.5rem), `--space-md`(0.75rem), `--space-lg`(1rem), `--space-xl`(1.5rem), `--space-2xl`(2rem)
  * **角丸**: `--radius-sm`(4px), `--radius-md`(6px), `--radius-lg`(8px), `--radius-full`(9999px)
  * **影**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  * **トランジション**: `--transition-fast`(0.15s), `--transition-normal`(0.25s)
* `index.html` または `src/main.ts` でインポート

### 注意

* この段階では定義のみ。既存コンポーネントへの適用は後続タスクで行う
* 色の具体値は Task 204（カラースキーム）で確定するが、暫定値で先に構造を作る

## 完了条件

- [ ] `src/styles/tokens.css` が存在する
- [ ] 上記カテゴリのトークンがすべて定義されている
- [ ] アプリ起動時にトークンが `:root` に読み込まれている（DevTools で確認可能）
- [ ] `npm run build` が成功する

## テスト

* 手動確認: DevTools > Elements > `:root` で Custom Properties が表示される
