# Batting Simulator

打順を組んでモンテカルロ・シミュレーションで得点を試算する静的 SPA。

公開先: https://gghatano.github.io/batting-simulator/

## セットアップ

初回のみ依存をインストール。

```bash
npm install
```

## 開発・ビルド・テスト

```bash
npm run dev       # Vite dev server
npm run build     # 本番ビルド (出力: dist/)
npm run preview   # 本番ビルドのプレビュー
npm test          # vitest run（全テスト一括実行）
```

単一テストファイルだけ流したいときは:

```bash
npx vitest src/lib/__tests__/rates.test.ts
```

## ドキュメント

- 詳細仕様: `doc/spec.md`
- 設計: `doc/design.md`
- タスク: `doc/tasks-phase*/`
- 開発フロー / アーキテクチャ概要: `CLAUDE.md`

## デプロイ

`main` への push で `.github/workflows/deploy.yml` が走り、GitHub Pages へ自動デプロイされる。
