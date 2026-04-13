# 条文番号命名規則

**更新日**: 2026-02-09

## 📋 概要

おおさかけんぽうプロジェクトでは、全8,704条文のファイル名・URL・Nostalgic IDを統一的な命名規則で管理しています。この規則は各国の公式法令サイトの表記に準拠しており、国際的な互換性とSEO最適化を両立しています。

---

## 🎯 統一命名規則

| 種類               | 形式              | 例             | URL例                                | 根拠                                                             |
| ------------------ | ----------------- | -------------- | ------------------------------------ | ---------------------------------------------------------------- |
| **通常条文**       | `数字.yaml`       | `123.yaml`     | `/law/jp/minpou/123`                 | 全法律共通                                                       |
| **日本枝番**       | `数字-数字.yaml`  | `121-2.yaml`   | `/law/jp/minpou/121-2`               | [e-Gov法令検索](https://elaws.e-gov.go.jp/)                      |
| **附則**           | `suppl-数字.yaml` | `suppl-1.yaml` | `/law/jp/minpou/suppl-1`             | supplementary（略称）                                            |
| **米修正条項**     | `amend-数字.yaml` | `amend-1.yaml` | `/law/world/us_constitution/amend-1` | amendment（略称）                                                |
| **独アルファ条文** | `数字英字.yaml`   | `12a.yaml`     | `/law/world/german_basic_law/12a`    | [gesetze-im-internet.de](https://www.gesetze-im-internet.de/gg/) |

---

## 🌍 各国の公式表記との対応

### 1. 日本の枝番条文

**表記**: 第121条の2  
**e-Gov URL**: `art_121-2.html`  
**ファイル名**: `121-2.yaml`  
**意味**: 第121条の追加条文（枝番）

**例**:

- 民法第121条の2 → `src/data/laws/jp/minpou/121-2.yaml`
- 会社法第102条の2 → `src/data/laws/jp/kaisya_hou/102-2.yaml`

---

### 2. 日本の附則

**表記**: 附則第1条  
**旧形式**: `suppl_1.yaml`（アンダースコア）  
**新形式**: `suppl-1.yaml`（ハイフン）★統一済  
**意味**: supplementary provisions（補足規定）の略称

**統一理由**:

- URLではハイフンが推奨（SEO最適化）
- アンダースコアはリンク下線と重なり視認性が低い
- 枝番条文の `-` と区切り文字を統一

**例**:

- 民法附則第1条 → `src/data/laws/jp/minpou/suppl-1.yaml`
- 刑法附則第20条 → `src/data/laws/jp/keihou/suppl-20.yaml`

---

### 3. アメリカ憲法の修正条項

**表記**: Amendment I（修正第1条）  
**公式URL**: 通常 `amendment-1` 形式  
**旧形式**: `amendment_1.yaml`（アンダースコア、フルスペル）  
**新形式**: `amend-1.yaml`（ハイフン、略称）★統一済

**統一理由**:

- amendmentは9文字と長いため、5文字の略称に統一
- 国際的に通用する一般的略称
- 他の条文種別（suppl, amend）と長さを揃える

**例**:

- 修正第1条（言論の自由） → `src/data/laws/world/us_constitution/amend-1.yaml`
- 修正第14条（適正手続） → `src/data/laws/world/us_constitution/amend-14.yaml`

---

### 4. ドイツ基本法のアルファベット条文

**表記**: Art 12a（第12a条）  
**公式URL**: [art_12a.html](https://www.gesetze-im-internet.de/gg/art_12a.html)  
**旧形式**: `sub_12a.yaml`（`sub-`接頭辞付き）  
**新形式**: `12a.yaml`（接頭辞なし）★重要修正

**重要な発見**:
ドイツ基本法の「Art 12a」は「12条の副条項a」ではなく、**「第12a条」という独立した条文番号**です。

**公式確認**:

```
Art 12   (第12条 - 職業選択の自由)
Art 12a  (第12a条 - 兵役義務) ← 独立した条文番号
Art 13   (第13条 - 住居の不可侵)
```

**統一理由**:

- ドイツ公式サイトが `art_12a.html` と表記
- `sub-` 接頭辞は不要（独立した条文番号であるため）
- 日本の枝番（`121-2`）と同様、数字+記号の形式

**例**:

- 第12a条（兵役義務） → `src/data/laws/world/german_basic_law/12a.yaml`
- 第16a条（政治亡命権） → `src/data/laws/world/german_basic_law/16a.yaml`
- 第115a条（防衛事態） → `src/data/laws/world/german_basic_law/115a.yaml`

---

## 🔄 統一作業の履歴

### 第1回統一（2026-02-09）: ハイブリッド統一

**対象**: 293件

- `fusoku_1` → `suppl-1`（AI基本法 2件）
- `suppl_1` → `suppl-1`（六法 210件）
- `amendment_1` → `amend-1`（アメリカ憲法 27件）
- `sub_12a` → `sub-12a`（ドイツ基本法 54件）← 一旦この形に

### 第2回統一（2026-02-09）: ドイツ公式表記に準拠

**対象**: 54件

- `sub-12a` → `12a`（ドイツ基本法 54件）★重要修正

**根拠**: [gesetze-im-internet.de](https://www.gesetze-im-internet.de/gg/) の公式URL確認により、`sub-` 接頭辞が不要と判明。

**合計**: 347件のファイルをリネーム

---

## 🎨 命名原則

### 1. 公式ソース準拠

各国の法令公式サイトの表記を最優先します。

| 国       | 公式サイト             | 参照                                |
| -------- | ---------------------- | ----------------------------------- |
| 日本     | e-Gov法令検索          | https://elaws.e-gov.go.jp/          |
| アメリカ | National Archives      | https://www.archives.gov/           |
| ドイツ   | gesetze-im-internet.de | https://www.gesetze-im-internet.de/ |

### 2. 区切り文字統一

**ハイフン（`-`）のみ使用**

- ✅ `suppl-1.yaml`
- ✅ `amend-1.yaml`
- ✅ `121-2.yaml`
- ❌ `suppl_1.yaml`（旧形式、非推奨）

**理由**:

- URLではハイフンが推奨（[RFC 3986](https://www.rfc-editor.org/rfc/rfc3986)）
- SEO: Googleはハイフンを単語区切りと認識
- 視認性: リンク下線と重ならない

### 3. 略称の一貫性

| 種類   | フルスペル    | 略称     | 文字数 |
| ------ | ------------- | -------- | ------ |
| 附則   | supplementary | suppl    | 5文字  |
| 修正   | amendment     | amend    | 5文字  |
| 副条項 | sub-article   | （なし） | -      |

**統一理由**: 3-5文字の略称で短く、意味も推測可能

---

## 🔗 Nostalgic ID生成規則

全条文のNostalgic ID（ええやんカウント用）は以下の形式で生成されます。

### ID形式

```
osaka-kenpo-{category}-{law}-{article}
```

### 実例

| 条文           | Nostalgic ID                                |
| -------------- | ------------------------------------------- |
| 民法第123条    | `osaka-kenpo-jp-minpou-123`                 |
| 民法第121条の2 | `osaka-kenpo-jp-minpou-121-2`               |
| 民法附則第1条  | `osaka-kenpo-jp-minpou-suppl-1`             |
| 米修正第1条    | `osaka-kenpo-world-us_constitution-amend-1` |
| 独第12a条      | `osaka-kenpo-world-german_basic_law-12a`    |

### 生成スクリプト

```bash
python3 scripts/tools/generate-nostalgic-batch.py
```

**出力**:

- `nostalgic-batch-ids.json` - 8,704件のID（JSON配列）
- `nostalgic-batch-ids.txt` - 8,704件のID（1行1ID）

---

## 📚 関連ドキュメント

- **[CLAUDE.md](../CLAUDE.md)** - プロジェクト全体概要
- **[law-addition-guide.md](../.claude/guides/law-addition-guide.md)** - 新法律追加手順
- **[translation-style-guide.md](../.claude/guides/translation-style-guide.md)** - 翻訳スタイルガイド

---

## 🛠️ 開発者向け情報

### ファイル構造

```
src/data/laws/
├── jp/                  # 日本現行法
│   ├── minpou/
│   │   ├── 1.yaml       # 通常条文
│   │   ├── 121-2.yaml   # 枝番条文
│   │   └── suppl-1.yaml # 附則
│   └── ...
├── world/               # 外国現行法
│   ├── us_constitution/
│   │   ├── 1.yaml
│   │   └── amend-1.yaml # 修正条項
│   └── german_basic_law/
│       ├── 12.yaml
│       └── 12a.yaml     # アルファ条文
└── ...
```

### コード内での処理

**utils.ts** - 条文番号のフォーマット処理:

```typescript
export function formatArticleNumber(article: number | string): string {
  if (typeof article === 'number') return `第${article}条`;
  const s = String(article);
  // 附則（suppl / fusoku、ハイフン・アンダースコア両対応）
  const supplMatch = s.match(/^(?:suppl|fusoku)[_-](.+)$/);
  if (supplMatch) return `附則第${supplMatch[1]}条`;
  // 修正条項（amend / amendment、同上）
  const amendMatch = s.match(/^(?:amend|amendment)[_-](.+)$/);
  if (amendMatch) return `修正第${amendMatch[1]}条`;
  return `第${article}条`;
}
```

### 統一スクリプト

**実行済み**（再実行不要）:

```bash
# 第1回統一（ハイブリッド統一）
python3 scripts/tools/unify-article-naming-full.py --execute

# 第2回統一（ドイツ公式表記）
python3 scripts/tools/fix-german-articles.py --execute
```

---

## ✅ チェックリスト

新しい法律を追加する際の命名確認:

- [ ] 公式サイトのURL形式を確認
- [ ] 通常条文: `数字.yaml`
- [ ] 特殊条文: 該当する形式（枝番、附則、修正等）を確認
- [ ] 区切り文字: ハイフン（`-`）を使用
- [ ] ファイル名 = URL = Nostalgic ID の一貫性
- [ ] `formatArticleNumber()` 関数で正しく表示されることを確認

---

## 📞 質問・問題報告

この命名規則に関する質問や、新しい条文種別が発見された場合は、GitHubのIssueで報告してください。

**参考**: [law-addition-guide.md](../.claude/guides/law-addition-guide.md)
