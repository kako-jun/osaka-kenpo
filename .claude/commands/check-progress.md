# 進捗確認

プロジェクト全体の翻訳進捗を確認し、報告する。

## 引数

$ARGUMENTS

- 引数なし → 全法律の進捗を表示
- カテゴリ指定 → そのカテゴリのみ（例: `jp`, `world_hist`）

## 実行するスクリプト

```bash
uv run --with pyyaml python3 scripts/tools/check-all-laws-real-status.py
```

## 報告内容

### 全体サマリ

- 総条文数（削除条文を除く）
- Phase 1（原文あり）の完成度
- Phase 4（commentaryOsakaあり）の完成度

### 法律別の進捗テーブル

| 法律名 | 総条文数 | Phase 1 | Phase 4 | 状態 |
| ------ | -------- | ------- | ------- | ---- |

### 未完了の法律

- Phase 4が100%でない法律をリスト化
- 残りの条文数と推定作業量

## 対になるスキル

PROGRESS.mdを更新するには `/update-progress` を使用。
