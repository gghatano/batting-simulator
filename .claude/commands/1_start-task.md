タスク $ARGUMENTS の作業環境を準備してください。実装は行わず、git操作のみ実行します。

## 手順

1. `doc/tasks/task_$ARGUMENTS.md` を読み、タスクの内容・依存タスクを確認する
2. 依存タスクが未完了でないか確認する（依存先のブランチが develop にマージ済みか）
   - 未マージの依存がある場合は中止し、先に完了すべきタスクを報告する
3. `develop` ブランチから worktree を作成する:
   ```
   git worktree add gitworktree/feature-task$ARGUMENTS -b feature-task$ARGUMENTS develop
   ```
4. 作成された worktree のパスと、タスクの概要・完了条件をユーザに報告する

## 注意

- 既にブランチや worktree が存在する場合は、既存のものを使用する
- このコマンドでは実装を行わない。実装は `/2_impl-task $ARGUMENTS` で行う
