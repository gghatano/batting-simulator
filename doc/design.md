# Design

## 技術スタック

* Svelte + TypeScript（SvelteKitは使わず、Vite + SvelteでSPA）
* ルーティング：初期は**タブ切替**で十分（拡張性を考えると `svelte-routing` 等も可）
* 重い計算：**Web Worker**（`sim.worker.ts`）で実行しUIフリーズを避ける
* テスト：Vitest（ロジックのみ）
* デプロイ：GitHub Pages（静的SPA）

## ディレクトリ構成

```
src/
├── lib/
│   ├── models.ts          # 型定義
│   ├── rates.ts           # 率計算
│   └── sim/
│       ├── rules.ts       # 進塁・得点ルール
│       ├── simulate.ts    # 1試合・N試行
│       └── rng.ts         # seed対応RNG
├── workers/
│   └── sim.worker.ts      # シミュレーション用Web Worker
├── components/
│   ├── PlayerCard.svelte
│   ├── PlayerList.svelte
│   ├── LineupSlot.svelte
│   ├── LineupPanel.svelte
│   ├── SimulationPanel.svelte
│   └── StatsTable.svelte
└── stores/
    ├── players.ts         # 選手データ
    ├── lineup.ts          # 打線状態
    └── ui.ts              # 画面切替、投入先枠など
public/
└── players.json           # 静的配信する選手データ
```

## 状態管理（Svelte store）

| Store | 内容 |
|---|---|
| `playersStore` | 読み込んだ選手配列 |
| `filtersStore` | team / query / sort |
| `lineupStore` | 9枠（player_id or null）、重複可 |
| `selectedSlotStore` | 現在投入先の枠番号 |
| `simConfigStore` | 試行回数N / seed |
| `simResultStore` | 結果（平均、分位、分布） |

## データフロー

```
public/players.json
  → fetch at startup → playersStore
  → filtersStore でフィルタ/ソート → PlayerList UI
  → ユーザが打線組み → lineupStore
  → rates.ts でイベント率算出
  → sim.worker.ts (Web Worker) でN試行シミュレーション
  → simResultStore → SimulationPanel / StatsTable で表示
```

## GitHub Pages デプロイ

* Vite config で `base` に `/repo-name/` を設定
* GitHub Actions でビルド・デプロイ
