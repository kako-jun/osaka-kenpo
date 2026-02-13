# 条文YAMLファイルの作成

法律の原文データを取得し、YAMLファイルとして保存する。

## 引数

$ARGUMENTS

引数が空の場合、以下を対話で確認する：

1. **法律名**（ディレクトリ名）: 例 `minpou`, `magna_carta`
2. **カテゴリ**: `jp`（日本現行法）/ `jp_hist`（日本歴史法）/ `world`（外国現行法）/ `world_hist`（外国歴史法）/ `treaty`（条約）
3. **データソース**: どこから条文を取得するか
   - e-Gov法令API → `node scripts/tools/fetch-egov-law.js <法律名> <法令番号>` を実行
   - URL → WebFetchで取得してパース
   - ユーザーがテキストを貼り付け → 受け取ってパース
   - 既存ファイル → 指定されたファイルを読み込み
4. **条文範囲**: 全条文 or 特定範囲

## YAMLフォーマット

各条文につき1ファイル: `src/data/laws/<category>/<law_name>/<article_number>.yaml`

```yaml
article: 1
isSuppl: false
isDeleted: false
title: '条文タイトル'
titleOsaka: ''
originalText:
  - '原文の段落1'
  - '原文の段落2'
osakaText: []
commentary: []
commentaryOsaka: []
```

## 注意事項

- 枝番条文は `132-2.yaml` のように `-` 区切りで保存
- 削除条文は `isDeleted: true` を設定
- 附則条文は `isSuppl: true` を設定
- 既存のYAMLファイルがある場合、既存の翻訳データ（osakaText, commentary, commentaryOsaka）を保持する
- 取得元がe-Govの場合は `scripts/tools/restore-osaka-by-content.js` で既存翻訳の復元を試みる

## 完了報告

- 作成したファイル数
- ディレクトリパス
- 次のステップの案内（`/translate` で翻訳、`/add-law` でメタデータ追加）
