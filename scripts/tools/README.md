# 汎用ツール

このディレクトリには、プロジェクト全体で再利用可能な汎用スクリプトが含まれています。

## データ取得系

### fetch-egov-law.js

e-Gov法令検索APIから日本の法律を取得する汎用ツール。

**使い方:**

```bash
node scripts/tools/fetch-egov-law.js <law_name> <law_id>

# 例: 民法を取得
node scripts/tools/fetch-egov-law.js minpou 129AC0000000089
```

**機能:**

- e-Gov APIから法令XMLを取得
- 条文をパースしてYAML形式で保存
- 枝番条文（132-2等）を正しく処理
- law_metadata.yamlを自動生成

**重要度**: ★★★★★

### fetch-china-constitution.js

中国憲法を取得（公式サイトからのスクレイピング）。

**重要度**: ★★★☆☆

### fetch-german-basic-law.js

ドイツ基本法を取得（公式サイトからのスクレイピング）。

**重要度**: ★★★☆☆

### fetch-us-constitution.js

アメリカ憲法を取得（公式サイトからのスクレイピング）。

**重要度**: ★★★☆☆

### fetch-all-roppou.js

六法全体を一括取得するバッチスクリプト。

**使い方:**

```bash
node scripts/tools/fetch-all-roppou.js
```

**重要度**: ★★★★☆

## 品質チェック系

### check-all-laws-real-status.py

**全法律の実際の進捗状況をチェック**

ファイルシステムを走査して、各法律の実際の完成度を確認。

**使い方:**

```bash
python3 scripts/tools/check-all-laws-real-status.py
```

**出力:**

- Stage1（原文）の完成率
- Stage3（大阪弁訳）の完成率
- Stage4（大阪弁解説）の完成率
- カテゴリ別サマリー

**重要度**: ★★★★★（進捗確認の唯一の真実の源）

### check-subdivided-articles-all-laws.js

枝番条文（132-2, 132-3等）の欠落をチェック。

**使い方:**

```bash
node scripts/tools/check-subdivided-articles-all-laws.js
```

**重要度**: ★★★★☆

### check-commentary-quality.cjs

大阪弁解説の品質をチェック（商人表現、例え話不足等）。

**使い方:**

```bash
node scripts/tools/check-commentary-quality.cjs
```

**出力:**

- 商人表現が強い条文リスト
- 例え話が不足している条文リスト
- 短すぎる解説のリスト
- quality-check-report.json（詳細レポート）

**重要度**: ★★★★☆

## ユーティリティ系

### clean-law-titles.js

条文タイトルから不要なカッコ書きを削除。

**使い方:**

```bash
node scripts/tools/clean-law-titles.js <country> <law_name>

# 例: 民法のタイトルをクリーンアップ
node scripts/tools/clean-law-titles.js jp minpou
```

**重要度**: ★★★★☆

### restore-osaka-by-content.js

内容ベースのマッチングで大阪弁訳を復元。

**使い方:**

```bash
node scripts/tools/restore-osaka-by-content.js <law_name>

# 例: 民事訴訟法の大阪弁訳を復元
node scripts/tools/restore-osaka-by-content.js minji_soshou_hou
```

**機能:**

- 旧YAMLファイルから原文を抽出
- 新YAMLファイルの原文と完全一致でマッチング
- 大阪弁訳・解説を復元
- 復元率を出力

**重要度**: ★★★★★（データ再取得時の必須ツール）

## メンテナンス

これらのスクリプトは定期的に使用される汎用ツールです。
不要になったスクリプトは `scripts/archive/` に移動してください。

## 更新履歴

- 2025-11-21: ディレクトリ整理により tools/ に集約
