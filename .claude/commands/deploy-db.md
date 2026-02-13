# D1データベースのデプロイ

YAMLデータの変更をCloudflare D1データベースに反映する。

## 手順

1. `npm run db:seed` でYAMLからSQLを生成（`db/seed.sql`）
2. `npm run db:schema:push` でスキーマを適用
3. `npm run db:seed:push` でデータを適用

上記は `npm run db:deploy` で一括実行できる。

## 引数

$ARGUMENTS

- 引数なし → 全法律を対象にフルデプロイ（`npm run db:deploy`）
- 法律名を指定 → その法律のみ更新（`node scripts/tools/d1-update-law.js <法律名>`）

## 実行前の確認

- `src/data/laws/` 配下のYAMLファイルに変更があることを確認
- 必要に応じて `npm run db:list-laws` で登録済み法律一覧を確認

## 実行後の確認

- エラーなく完了したことを報告
- エラーが出た場合は内容を表示して対処法を提案
