了解。では仕様書を **Svelte + TypeScript + Vite + GitHub Pages（静的）** 前提に更新します。Claude Code がそのままタスク生成できる粒度まで落とします。

---

## Requirements（更新版・静的フロント前提）

### 0. 前提

* 実行環境：ブラウザ（サーバ無し）
* データ：`public/players.json`（静的配信）。初期は1シーズン固定でも可
* 画面：2画面（SPA内でタブ/ルート切替）

### 1. 機能0：選手一覧（カード）

* 左カラムに選手カード一覧
* フィルタ

  * チーム選択（必須）
  * 名前検索（任意、部分一致）
  * ソート（任意：PA降順、HR/PA降順、OPS降順など）
* カード表示（最低限）

  * 名前、チーム
  * PA、1B/2B/3B/HR、BB+HBP、SO
  * 派生率（表示用）：各イベント/PA（小数3桁程度）

### 2. 機能1（画面1）：打線作成

* レイアウト：左＝選手一覧、右＝打線（1〜9番）
* 打順枠を選択 → 選手カードの「追加」で枠に投入
* 重複可（同一選手を複数枠に置ける）
* 枠操作

  * 枠クリア
  * 全クリア
  * 上下入れ替え（↑↓）

### 3. 機能2（画面2）：評価（確率計算＋シミュレーション）

* 打者ごとに以下率を計算（分母 PA）

  * 1B/2B/3B/HR/K/BB+HBP/OUT
* シミュレーション

  * 9回、延長なし
  * 試行回数N：デフォルト10,000（UIで変更：1,000〜100,000）
  * seed指定（任意、未指定ならランダム）
  * 出力：平均得点、中央値、P10/P90、得点分布（0点〜上限は動的）
* 進塁ルール（初期・簡易）

  * BB/HBP：強制進塁（満塁なら得点）
  * 1B：3塁走者得点、2塁走者得点、1塁走者2塁、打者1塁
  * 2B：3塁/2塁走者得点、1塁走者3塁、打者2塁
  * 3B：走者全員得点、打者3塁
  * HR：全員得点
  * K/OUT：アウト加算、走者変化なし
* バリデーション

  * 打線に未設定枠がある場合：シミュレーション実行不可（理由表示）
  * PA=0：実行不可

---

## Design（Svelte + Vite + 静的SPA）

### 技術スタック

* Svelte + TypeScript（SvelteKitは使わず、Vite + SvelteでSPA）
* ルーティング：軽量に「画面切替state」でも良いが、拡張性を考えると `svelte-routing` 等も可
  → 初期は **タブ切替**で十分（/ は一枚にまとめる）
* 重い計算：**Web Worker**（`sim.worker.ts`）で実行しUIフリーズを避ける
* テスト：Vitest（ロジックのみ）

### ディレクトリ案

* `src/`

  * `lib/`

    * `models.ts`（型定義）
    * `rates.ts`（率計算）
    * `sim/`

      * `rules.ts`（進塁・得点ルール）
      * `simulate.ts`（1試合、N試行）
      * `rng.ts`（seed RNG）
    * `workers/`

      * `sim.worker.ts`
  * `components/`

    * `PlayerCard.svelte`
    * `PlayerList.svelte`
    * `LineupSlot.svelte`
    * `LineupPanel.svelte`
    * `SimulationPanel.svelte`
    * `StatsTable.svelte`
  * `stores/`

    * `players.ts`（選手データ）
    * `lineup.ts`（打線状態）
    * `ui.ts`（画面切替、投入先枠など）
* `public/players.json`

### 状態管理（Svelte store）

* `playersStore`: 読み込んだ選手配列
* `filtersStore`: team / query / sort
* `lineupStore`: 9枠（player_id or null）
* `selectedSlotStore`: 現在投入先の枠番号
* `simConfigStore`: N / seed
* `simResultStore`: 結果（平均、分位、分布）

---

## Tasks（Claude Code 向け：実装手順）

### 1. プロジェクト基盤

1. Vite + Svelte + TS テンプレ生成
2. GitHub Pages デプロイ（Actions）設定

   * base path（`/repo-name/`）対応
3. `public/players.json` の仮データ作成（最低10選手×2チーム）

### 2. データ読み込みと一覧

4. `Player` 型定義（必要フィールド）
5. 起動時に `players.json` をfetchしてstoreへ
6. teamフィルタ＋name検索＋ソート
7. `PlayerCard` と `PlayerList` 実装（カード表示）

### 3. 打線作成UI

8. `lineupStore`（9枠、重複可）実装
9. `LineupPanel`（1〜9枠）と投入先選択
10. PlayerCardの「追加」→選択枠にセット
11. 枠クリア／全クリア／上下入れ替え

### 4. 率計算とシミュレーション（ロジック）

12. `rates.ts`：イベント率算出（OUT含む）
13. `rules.ts`：走者状態（1B/2B/3B占有）更新＋得点加算
14. `simulate.ts`：1試合（9回、3アウトで回終了）×N
15. `rng.ts`：seed対応RNG（例：mulberry32）

### 5. Worker化と画面2

16. `sim.worker.ts`：入力（打線の率、N、seed）→結果返却
17. `SimulationPanel`：実行ボタン、進捗表示（簡易で良い）
18. `StatsTable`：打者別率、打線合計結果（mean/median/p10/p90）
19. 得点分布の表示（表でOK。チャートは後回し）

### 6. テスト

20. 率計算のテスト（合計が1になる、PA=0で落ちる等）
21. 進塁ルールのテスト（満塁BBで1点等）
22. seed固定で結果が再現するテスト（小Nで）

---

## 仕様書に追記しておきたい「重要な決め」

* **データの出典・整形は別タスク**（まずはフォーマット固定で進める）
* イベント率に「その他アウト」を含める（pOUTで吸収）
* 初期は「K」と「OUT」を同一扱いにしても良いが、表示上は分ける（K率は見たい）

