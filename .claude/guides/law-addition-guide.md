# 法律追加手順書（フィールド記入規約の正本）

## 概要

新しい法律をおおさかけんぽうに追加する際の手順書です。**YAML + Zod**形式（2025年8月移行完了）。

このドキュメントは「ソースURLを1つ渡せば法律を追加できる」状態を目指した、**各ファイル・各フィールドの記入規約の正本**です。ファイル名・フィールド名は実データ（`src/data/laws/` 配下）と一致させてあります。

## 翻訳フェーズ定義

| フェーズ | 完了条件                           |
| -------- | ---------------------------------- |
| Phase 1  | `originalText` がある              |
| Phase 2  | + `commentary`（標準日本語の解説） |
| Phase 3  | + `osakaText`（大阪弁訳）          |
| Phase 4  | + `commentaryOsaka`（大阪弁解説）  |

進捗の確認: `node scripts/tools/phase-status.js [category/law_slug]`

## 0. データソースの選択

| ソース           | 対象                 | 手順                                                             |
| ---------------- | -------------------- | ---------------------------------------------------------------- |
| e-Gov法令API     | 日本の現行法         | `node scripts/tools/fetch-egov-law.js <law_id> <egov_law_num>`   |
| 任意のURL        | 歴史法・外国法・条約 | URLから原文を取得してパース（**残りの preparing 法律の主経路**） |
| テキスト貼り付け | 上記で取れないもの   | 貼り付けテキストをパース                                         |

- e-Gov再取得で既存の大阪弁訳を復元する場合: `node scripts/tools/restore-osaka-by-content.js <law_id>`（jp カテゴリのみ）
- e-Gov法令番号の一覧は [CLAUDE.md](../../CLAUDE.md) を参照

### 0.1. 複数版（改訂）がある歴史法の版確認（重要）

歴史法・外国法は同じ法律名で複数の版（改訂）が存在することがある（例: 武家諸法度には元和令1615年・13条、寛文令1663年・21条等の複数版があり、Web検索で最初に見つかる二次資料が目的の版と異なることがある）。

- 原文取得前に、対象法律に複数の版・改訂が存在するか確認する（Wikipedia等に複数版が併記されている場合は特に注意）
- 複数版が存在する場合、どの版を採用するかは自動判断せず、条数・年代等の選択肢を提示してユーザーに確認する（デフォルトルール＝最新版採用・条文数最大版採用等は設けない方針）
- 既存slugに条文数の先例がある場合（backfillモード）は、その条数と一致する版を優先候補として提示する

## 1. データファイルの準備

### 1.0. slug（法律ID）の命名

- ローマ字 + アンダースコア区切り（例: `keihou`, `minji_soshou_hou`, `jushichijo_kenpo`）
- **注意: 会社法は `kaisya_hou`（`kaisha_hou` ではない）**。既存slugは変更しない
- カテゴリ: `jp`（現行日本法）/ `jp_hist`（歴史的日本法）/ `world`（外国現行法）/ `world_hist`（歴史的外国法）/ `treaty`（条約・国際法）

### 1.1. 条文データの作成

各条文につき1つのYAMLファイルを作成します。

**ファイル配置:**

```
src/data/laws/[category]/[law_name]/[article_number].yaml
```

**ファイル命名規則（実データ準拠）:**

| 種類             | ファイル名例   | 備考                                                      |
| ---------------- | -------------- | --------------------------------------------------------- |
| 通常条文         | `1.yaml`       | 条文番号のみ                                              |
| 枝番条文         | `132-2.yaml`   | 「第132条の2」。区切りは `-`（`132_2` ではない）          |
| 附則             | `suppl-1.yaml` | `isSuppl: true` を付ける                                  |
| 削除条文         | `200.yaml`     | 通常の番号ファイルのまま `isDeleted: true` + 各配列を空に |
| 修正条項（米国） | `amend-1.yaml` | us_constitution 等                                        |
| 文字枝番（独国） | `45a.yaml`     | german_basic_law 等、原文の条番号表記に従う               |

詳細は [docs/article-naming-convention.md](../../docs/article-naming-convention.md) を参照。

**YAMLフォーマット（通常条文・配列形式・Zod検証）:**

```yaml
article: 1
title: '原文のタイトル'
titleOsaka: '大阪弁のタイトル（未定なら空文字）'
originalText:
  - '原文の段落1'
  - '原文の段落2'
osakaText: [] # Phase 3 で埋める
commentary: [] # Phase 2 で埋める
commentaryOsaka: [] # Phase 4 で埋める
```

**フィールド記入規約:**

- 全てのテキストフィールドは**配列で段落分割**（Zodバリデーションの前提）
- **通常条文には `isSuppl` / `isDeleted` を入れない**。附則は `isSuppl: true`、削除済みは `isDeleted: true` を追加する
- 削除条文は `originalText: []` のまま `isDeleted: true` を付ける（進捗集計から除外される）
- `title` は原文の公式表記に従う。ただし**1つの法律内では形式を統一する**
- 号を含む長い項は `|-`（ブロックスカラー）で改行を保持してよい（例: `treaty/un_charter/1.yaml`）

**カテゴリ別の追加規約:**

- **world（外国現行法）**: `originalText` に**原語の原文**、`originalTextJapanese` に日本語訳を入れる（例: `world/german_basic_law/1.yaml`）。`osakaText` は日本語訳ベース
- **jp_hist（歴史的日本法）**: 古文は `<ruby>漢字<rt>よみ</rt></ruby>` 形式でルビを付けてよい（例: `jp_hist/jushichijo_kenpo/1.yaml`）
- **world_hist / treaty**: 日本語訳が公定訳・定訳として存在する場合はそれを `originalText` に使う

### 1.2. 法律メタデータの追加

**注意: メタデータのファイル名はアンダースコア区切り**（`law_metadata.yaml`, `laws_metadata.yaml`, `famous_articles.yaml`）。ハイフン区切りは誤り。

#### グローバル法律一覧 (`src/data/laws_metadata.yaml`)

該当カテゴリの `laws:` に追記:

```yaml
categories:
  - id: 'jp'
    title: 'ろっぽう（＋会社法）'
    icon: '⚖️'
    laws:
      - id: 'new_law'
        path: '/law/jp/new_law'
        status: 'available' # または "preparing"
```

- `status: preparing` のうちは一覧に「準備中」で表示され、sitemap からも除外される
- 訳が揃ったら `available` に変えるだけで公開・sitemap 掲載される

#### 個別法律メタデータ (`src/data/laws/[category]/[law]/law_metadata.yaml`)

```yaml
name: '刑法' # 正式名称
shortName: '刑法' # 短い表示名（任意）
badge: '悪いことしたらアカンで？' # カードに出る大阪弁の一言（任意）
year: 1907 # 成立年
source: 'e-Gov法令検索' # 出典の名称
description: '明治40年制定の刑法。犯罪と刑罰を定める基本刑法典。'
links: # 任意
  - text: 'e-Gov法令検索'
    url: 'https://elaws.e-gov.go.jp/document?lawid=140AC0000000045'
```

**links の規約:**

- 古い法律にはe-Gov法令検索のリンクは含めない
- 国立国会図書館デジタルコレクションのリンクは正確なPIDを確認する
- 外国法の場合は原文の公式サイトへのリンクを含める（例: gesetze-im-internet.de）

#### 有名条文データ (`famous_articles.yaml`) - 任意

キー = 条文番号（文字列）、値 = 大阪弁の一言。`#` コメントで章分けしてよい:

```yaml
# 総則
'1': '法律にないと罰せられへん'
'36': 'やられたらやり返してええ？'
```

#### 章構成データ (`chapters.yaml`) - 任意

章構造を持つ法律の場合のみ作成。条文を `articles` 配列で章に割り当てる:

```yaml
chapters:
  - chapter: 1
    title: '天皇'
    titleOsaka: '天皇はん'
    articles: [1, 2, 3, 4, 5, 6, 7, 8]
    description: '天皇の地位と役割について定めた章'
    descriptionOsaka: '天皇はんの立場とお仕事について決めた章やで'
```

## 2. 標準日本語解説（Phase 2: commentary）の品質基準

- **文体は「です・ます」調（敬体）**。「だ・である」調（常体）は禁止。2025-11に民事訴訟法447条を一括変換した経緯があり（`scripts/convert-commentary-style.js`）、これが正準。文体見本は `jp/keihou/1.yaml` を使う（条約系の一部に常体の変換漏れが残っているため、treaty/world のデータを文体見本にしないこと）
- 条文の意味を分かりやすく解説する
- **3段落以上、300文字以上**
- 具体例を含める（「例えば」で始まる段落）
- 歴史的背景や他の条文との関係にも言及する
- 大阪弁解説（commentaryOsaka）の品質基準は [translation-style-guide.md](./translation-style-guide.md) を参照。**commentaryOsaka は commentary の大阪弁化ではない**。大阪らしい観点・たとえ話を軸に、一から独自に解説し直したもの（構成・切り口も commentary と揃えない）

## 3. バッチ分割戦略（大量条文の場合）

条文追加（Phase 1-2）のバッチサイズ:

| 条文数   | 方式                     |
| -------- | ------------------------ |
| 1-10条   | メインコンテキストで直接 |
| 11-20条  | サブエージェント1つ      |
| 21条以上 | 10-15条ずつバッチ分割    |

翻訳（Phase 3-4）はより小さいバッチで行う（[translation-prompt-template.md](../prompts/translation-prompt-template.md) 参照）。

## 4. データ検証とローディング

### 4.1. 自動データ検証

全データはZodスキーマで実行時に検証されます：

- 条文: `ArticleSchema` (`src/lib/schemas/article.ts`)
- メタデータ: `LawMetadataSchema` (`src/lib/schemas/law-metadata.ts`)
- APIで自動検証され、不正なデータは500エラー

### 4.2. データローディング

- ブラウザ → `metadata-loader.ts` → fetch → API Routes
- YAMLファイル読み込み → Zod検証 → 型安全データ
- エラー時は適切なフォールバック

## 5. APIルート・ルーティングの確認

以下が自動で動作することを確認（YAMLが正しく配置されていれば追加実装は不要）:

- `/api/[law_category]/[law]` - 条文一覧
- `/api/[law_category]/[law]/[article]` - 個別条文
- `/api/metadata/[law_category]/[law]/[metadata_type]` - メタデータ
- `/law/[law_category]` / `/law/[law_category]/[law]` / `/law/[law_category]/[law]/[article]` - ページ

## 6. 翻訳作業のポイント

### 6.1. 大阪弁翻訳のトーン

- 「春日歩（大阪さん）」風の親しみやすい口調（キャラクター名は本文に出さない）
- 詳細は [translation-style-guide.md](./translation-style-guide.md) が正本

### 6.2. 大阪弁翻訳の読みやすさ向上

長い複文の場合は、原文は変更せずに大阪弁のみ適切に分割して読みやすくする：

**基本方針:**

- 原文は法的正確性を保つため変更しない
- 大阪弁翻訳のみ複文を程よく分割する
- 1文ずつにする必要はないが、適度に区切って理解しやすくする
- カッコ内の定義も大阪弁に統一する

**分割例:**

```yaml
# 修正前（読みにくい長文）
osakaText:
  - 'AI関連技術がちゃんと効果的に活用されることで行政の仕事と民間の事業活動をめっちゃ効率化して高度化させて新しい産業を作る技術やっちゅうことや。'

# 修正後（読みやすく分割）
osakaText:
  - 'AI関連技術がちゃんと効果的に活用されることで、行政の仕事と民間の事業活動をめっちゃ効率化して高度化させるんや。'
  - '新しい産業も作れる技術やから、経済社会の発展の基盤になるんやで。'
```

**カッコ内の定義も大阪弁化:**

```yaml
# 修正前
- 'データセット（特定の目的で集めた情報の集まりをいう。）'

# 修正後
- 'データセット（特定の目的で集めた情報の集まりのことやな。）'
```

## 7. テスト項目

新しい法律を追加したら以下を確認:

### 7.1. 表示確認

- [ ] カテゴリページで法律が表示される
- [ ] 法律一覧ページで全条文が表示される
- [ ] 個別条文ページが正常に表示される
- [ ] 原文・大阪弁の切り替えが動作する

### 7.2. アニメーション確認

- [ ] 言語切り替え時にスムーズなフェードアニメーションが動作する
- [ ] スペースキーで切り替えできる
- [ ] ダブルクリック/タップで切り替えできる

### 7.3. UI確認

- [ ] タイトルが正しく表示される（HTMLタグが見えない）
- [ ] ナビゲーション（前の条文・次の条文）が動作する
- [ ] シェアボタンが正常に動作する
- [ ] 出典情報が正しく表示される
- [ ] モバイルでの表示が正常

### 7.4. 全体動作確認

- [ ] npm run dev で開発サーバーが正常起動する
- [ ] ビルドエラーが発生しない
- [ ] TypeScriptエラーが発生しない
- [ ] `node scripts/tools/phase-status.js <category>/<law>` で条文数・フェーズが期待通り

## 8. よくある問題と対処法

### 8.1. アニメーション関連

**問題:** 切り替え時にHTMLタグが見える
**対処:** AnimatedContentのpropsを正しく分離する（originalContent/osakaContent）

**問題:** アニメーションが一瞬で切り替わる
**対処:** AnimatedContentコンポーネントのopacityとpositionの設定を確認

### 8.2. データ関連

**問題:** 条文が表示されない
**対処:** YAMLファイルの形式とZodスキーマ準拠を確認

**問題:** 法律名が表示されない
**対処:** `law_metadata.yaml`の`name`フィールドを確認

**問題:** Zodバリデーションエラー
**対処:** 全テキストフィールドが配列形式になっているか確認

**問題:** 枝番条文が欠落する
**対処:** 過去に fetch-egov-law.js が枝番を落とす問題があった（修正済み）。追加後に `node scripts/tools/check-subdivided-articles-all-laws.js` で確認

### 8.3. リンク関連

**問題:** 参考リンクが不適切
**対処:** 古い法律はe-Govを除外、図書館リンクは正確なPIDを使用

## 9. 追加後のコミット

- 既存の翻訳データを上書きしない
- `db/seed.sql` を git add しない（.gitignore対象）
- コミットメッセージ例:

```
feat(new_law): 原文と解説を追加（n条、Phase 2完了）
```

D1への反映（データ変更時のみ必要）は [CLAUDE.md](../../CLAUDE.md) のデプロイ手順を参照。
