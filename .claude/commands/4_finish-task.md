タスク $ARGUMENTS の作業を完了し、develop にマージしてください。

## 手順

1. `doc/tasks/task_$ARGUMENTS.md` を読み、完了条件を確認する
2. worktree 内で完了条件のチェックリストを1つずつ検証する:
   - テストがある場合: `gitworktree/feature-task$ARGUMENTS/` 内で `npx vitest run` を実行
   - `npm run build` でビルドエラーがないことを確認
3. worktree 内で未コミットの変更がないことを確認する（あればコミットする）
4. 完了条件を全て満たしている場合のみ、以下を実行:
   ```
   git checkout develop
   git merge --no-ff feature-task$ARGUMENTS -m "Merge feature-task$ARGUMENTS: <タスク概要>"
   ```
5. worktree を削除する:
   ```
   git worktree remove gitworktree/feature-task$ARGUMENTS
   ```
6. マージ後に develop でテスト・ビルドが通ることを再確認する
7. 結果をユーザに報告する

## 注意

- マージコンフリクトが発生した場合は、内容を報告してユーザに判断を仰ぐ
- テストやビルドが失敗する場合はマージせず、問題を報告する
- 完了条件を満たさない場合はマージせず、未達の項目を報告する
