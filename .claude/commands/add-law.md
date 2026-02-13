# 新しい法律のメタデータ追加

新しい法律をプロジェクトに登録する。条文データの作成（`/create-articles`）とは別に、メタデータ一式を整備する。

## 引数

$ARGUMENTS

引数が空の場合、以下を対話で確認する：

1. **法律名（日本語）**: 例「民法」「マグナ・カルタ」
2. **法律ID（ディレクトリ名）**: 例 `minpou`, `magna_carta`
3. **カテゴリ**: `jp` / `jp_hist` / `world` / `world_hist` / `treaty`
4. **成立年**: 例 1896, 1215
5. **出典**: 例「官報第xxxx号」「British Library」
6. **説明文**: 法律の概要
7. **参考リンク**: URL（任意、複数可）
8. **status**: `available`（公開）or `preparing`（準備中）

## 作成するファイル

### 1. 法律メタデータ

`src/data/laws/<category>/<law_id>/law-metadata.yaml`

```yaml
name: '法律名'
year: 成立年
source: '出典'
description: '説明文'
links:
  - text: 'リンクテキスト'
    url: 'URL'
```

### 2. グローバル法律一覧への登録

`src/data/laws-metadata.yaml` の該当カテゴリに追加：

```yaml
- id: 'law_id'
  path: '/law/<category>/<law_id>'
  status: 'available'
```

### 3. 章構成（任意）

`src/data/laws/<category>/<law_id>/chapters.yaml`

- 章構成が分かっている場合のみ作成

### 4. 有名条文（任意）

`src/data/laws/<category>/<law_id>/famous-articles.yaml`

- 有名な条文が分かっている場合のみ作成

## 注意事項

- `.claude/guides/law-addition-guide.md` の手順に準拠
- 古い法律にはe-Gov法令検索のリンクを含めない
- 外国法の場合は原文の公式サイトへのリンクを含める
- 条文データがまだない場合は「`/create-articles` で条文を作成してください」と案内

## 完了報告

- 作成・更新したファイルの一覧
- 次のステップの案内
