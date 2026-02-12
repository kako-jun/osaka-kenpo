# 品質チェックレポート

このディレクトリには、法律条文の品質チェック結果が保存されます。

## 📋 ファイル構成

### プロンプトファイル（.txt）

- `prompt-{category}-{law-id}.txt`: 各法律のチェック用プロンプト
- サブエージェントで実行する際に使用
- **Git管理対象**

### レポートファイル（.json）

- `result-{category}-{law-id}.json`: チェック結果
- 問題の詳細、重要度、修正案などを含む
- **Git管理対象外**（`*.json`で除外）

### その他

- `detailed-check-instructions.md`: チェック基準書
- `hallucination-check-report.json`: 全体の進捗管理

## 🚀 使い方

### 1. プロンプト生成

全法律のプロンプトを一括生成：

```bash
node scripts/tools/check-hallucination.js
```

特定カテゴリのみ：

```bash
node scripts/tools/check-hallucination.js jp          # 日本現行法
node scripts/tools/check-hallucination.js jp_hist    # 日本歴史法
node scripts/tools/check-hallucination.js world      # 外国現行法
```

### 2. 単一法律のチェック

特定の法律のみチェック：

```bash
node scripts/tools/check-law-quality.js jp minpou
node scripts/tools/check-law-quality.js jp constitution
node scripts/tools/check-law-quality.js world german_basic_law
```

これにより、`reports/quality-check-prompt-{category}-{law-id}.txt` が生成されます。

### 3. サブエージェントで実行

OpenCodeのTask toolを使用：

```
Task tool (subagent_type: "general")
Prompt: 以下のファイルの内容を実行してください

reports/prompt-jp-minpou.txt
```

結果は `reports/result-jp-minpou.json` に保存されます。

### 4. 結果の確認

```bash
# JSONを見やすく表示
cat reports/result-jp-minpou.json | jq '.'

# 問題数の確認
cat reports/result-jp-minpou.json | jq '.issuesFound'

# 高重要度の問題のみ表示
cat reports/result-jp-minpou.json | jq '.issues[] | select(.severity == "high")'
```

## ✅ チェック項目

### 1. ハルシネーション・事実誤認（高重要度）

- 存在しない条文への言及
- 架空の判例・事例
- 条文内容と解説の不一致

### 2. ペルソナの一貫性

- **高重要度**: 男性表現（わい、わいら）
- **中重要度**: 商人表現（利益、儲け）
- **低重要度**: 和歌山弁らしさ不足

### 3. 例え話の品質

- ✅ 良い登場人物名: 太郎さん、花子さん、A社、Bさん
- ❌ 悪い登場人物名: HHH、XXX、甲、乙

### 4. 文章構造

- 段落数（2-3段落推奨）
- 文章長（300文字以上推奨）
- 重複や冗長性

### 5. 統一感

- 他の条文とのトーン一貫性
- 構成の統一性

## 📊 現在の状況（2026-02-12）

| 法律       | 総条文数 | 問題数  | 状態      |
| ---------- | -------- | ------- | --------- |
| 日本国憲法 | 103条    | 0件     | ✅ 完璧   |
| 民法       | 1,275条  | 2,007件 | ⚠️ 要修正 |

### 民法の問題内訳

- 高重要度: 28件（男性表現）
- 中重要度: 549件（商人表現、長さ不足）
- 低重要度: 1,430件（段落不足）

## 🔗 関連

- **GitHub Issue**: [#31 全条文のハルシネーション・誤情報チェック](https://github.com/kako-jun/osaka-kenpo/issues/31)
- **チェック基準**: `detailed-check-instructions.md`
