# Task 002: GitHub Pages デプロイ（Actions）設定

## フェーズ

1. プロジェクト基盤

## 依存タスク

* Task 001

## 内容

GitHub Actions で main ブランチ push 時に自動ビルド・GitHub Pages へデプロイするワークフローを作成する。

### やること

* `vite.config.ts` に `base: '/batting-simulator/'` を設定（リポジトリ名に合わせる）
* `.github/workflows/deploy.yml` を作成
  * Node.js セットアップ → `npm ci` → `npm run build` → GitHub Pages へデプロイ
* GitHub リポジトリの Settings > Pages で Source を GitHub Actions に設定

## 完了条件

- [ ] `.github/workflows/deploy.yml` が存在する
- [ ] `vite.config.ts` に `base` パスが設定されている
- [ ] main へ push 後、Actions が正常に実行される
- [ ] `https://<user>.github.io/batting-simulator/` でページが表示される

## テスト

* 手動確認: GitHub Actions のワークフロー実行ログが緑（成功）
* 手動確認: デプロイ先 URL にアクセスしてページが表示される
