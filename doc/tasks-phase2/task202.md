# Task 202: グローバルリセット・ベーススタイル

## フェーズ

Phase 2 - UIデザインブラッシュアップ

## 依存タスク

* Task 201（トークンを参照するため）

## 内容

リセットCSS とアプリ全体のベーススタイルを設定する。

### やること

* `src/styles/global.css` を新規作成
* 以下を含める:
  * `*, *::before, *::after { box-sizing: border-box; }`
  * `body` のマージンリセット、背景色（`var(--color-bg)`）、テキスト色（`var(--color-text)`）
  * フォントファミリー: `system-ui, -apple-system, 'Segoe UI', sans-serif`
  * `line-height: 1.7`（日本語テキスト考慮）
  * `button, input, select` のフォント継承: `font: inherit`
  * `button` のカーソル: `cursor: pointer`
  * `img` の `max-width: 100%`
  * スクロールバーの統一スタイル（webkit 用、任意）
  * `-webkit-font-smoothing: antialiased`
* `src/main.ts` で tokens.css → global.css の順にインポート

## 完了条件

- [ ] `src/styles/global.css` が存在する
- [ ] box-sizing が border-box になっている（全要素）
- [ ] body にフォントファミリー・背景色・テキスト色が適用されている
- [ ] ボタン・入力欄がフォントを継承している
- [ ] `npm run build` が成功する

## テスト

* 手動確認: ブラウザで body のスタイルが適用されていること
* 手動確認: ボタンやinputのフォントが body のフォントと一致すること
