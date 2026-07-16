# おおさかけんぽう - プロジェクト概要

## 📋 プロジェクト概要

**おおさかけんぽう**は、難解な法律条文を親しみやすい大阪弁（和歌山弁ベース）に翻訳して解説するWebサイトです。『あずまんが大王』の春日歩（大阪さん）が大人になって法律の先生になったという設定で、法律への心理的ハードルを下げ、多くの人が法律に気軽に親しめることを目的としています。

### 🎯 コンセプト

- **春日歩先生**: 『よつばと！』で先生になった春日歩が法律を教える設定
- **親しみやすさ**: 大阪弁での温かみのある解説
- **教育的価値**: 法律の本質を理解しやすく伝える

### 🎨 デザインテーマ

- **カラー**: 柔らかい赤系（#E94E77）をメインカラーに
- **フォント**: 原文は標準フォント、大阪弁は手書き風フォント
- **UI/UX**: モバイルファーストなレスポンシブデザイン

## 📂 ドキュメント構成

### 🛠️ 開発・設計ドキュメント（.claude/）

#### コアガイド (.claude/guides/)

- **[translation-style-guide.md](.claude/guides/translation-style-guide.md)** - 大阪弁翻訳統合スタイルガイド（★最重要）
- **[law-addition-guide.md](.claude/guides/law-addition-guide.md)** - 新しい法律追加の完全手順書

#### 翻訳プロンプト (.claude/prompts/)

- **[translation-prompt-template.md](.claude/prompts/translation-prompt-template.md)** - 基本翻訳プロンプトテンプレート
- 各法律の範囲翻訳プロンプト（民法、商法、会社法、刑法、民訴、刑訴）

#### トラブルシューティング (.claude/troubleshooting/)

- **[animation-troubleshooting.md](.claude/troubleshooting/animation-troubleshooting.md)** - アニメーション関連
- **[ui-consistency-checklist.md](.claude/troubleshooting/ui-consistency-checklist.md)** - UI一貫性チェック

### 📚 ユーザー向けドキュメント

- **[README.md](README.md)** - プロジェクト概要とユーザーガイド
- **[docs/user-guide.md](docs/user-guide.md)** - 詳細な使い方ガイド
- **[docs/cloudflare-deploy.md](docs/cloudflare-deploy.md)** - Cloudflare Pages + D1 デプロイガイド

## 📋 進捗管理ルール（2025-11-21更新）

**原則：単一の真実の源（Single Source of Truth）**

- **ファイルシステム = 唯一の真実**: 実際のYAMLファイルが全て
- **スクリプトで確認**: `uv run --with pyyaml python3 scripts/tools/check-all-laws-real-status.py` および `node scripts/tools/phase-status.js`
- **統合ドキュメント**: [.claude/PROGRESS.md](.claude/PROGRESS.md) に全て集約

**翻訳フェーズ定義（用語は「Phase 1-4」で統一。旧称「Stage」は使わない）:**

| フェーズ | 完了条件                           |
| -------- | ---------------------------------- |
| Phase 1  | `originalText` がある              |
| Phase 2  | + `commentary`（標準日本語の解説） |
| Phase 3  | + `osakaText`（大阪弁訳）          |
| Phase 4  | + `commentaryOsaka`（大阪弁解説）  |

**禁止事項：**

- ❌ 複数ファイルでの重複管理
- ❌ 手動での進捗数字の記載
- ❌ 推測や記憶に基づく情報

**更新手順：**

1. スクリプトを実行: `uv run --with pyyaml python3 scripts/tools/check-all-laws-real-status.py`
2. 結果を `.claude/PROGRESS.md` にコピー
3. 更新日時を明記

## 🔧 スクリプト構成（2025-11-21整理）

**原則：汎用的なツールと使い捨てスクリプトを分離**

### scripts/tools/ - 汎用ツール

繰り返し使用する再利用可能なスクリプト

- **データ取得**: fetch-egov-law.js, fetch-china-constitution.js 等
- **品質チェック**: check-all-laws-real-status.py, check-commentary-quality.cjs 等
- **ユーティリティ**: clean-law-titles.js, restore-osaka-by-content.js 等
- **デプロイ**: generate-d1-seed.js（YAMLからD1用SQLを生成）

詳細: [scripts/tools/README.md](scripts/tools/README.md)

### scripts/one-time/ - 使い捨てスクリプト

特定の問題を修正するために一度だけ実行するスクリプト

- **スタイル改善**: improve-keihou-style.py, improve-keiji-soshou-hou.py 等
- **表現修正**: fix-osaka-merchant-tone.cjs, replace-kobe-with-osaka.cjs 等
- **データ正規化**: normalize-deleted-articles.js, add-deleted-flag.js 等

詳細: [scripts/one-time/README.md](scripts/one-time/README.md)

### scripts/archive/ - 古いスクリプト

もう使わないスクリプトの保管場所

- テンプレート生成系（generate-\*.js）
- データ変換系（convert-\*.js）

詳細: [scripts/archive/README.md](scripts/archive/README.md)

## 📊 進捗管理

**進捗の真実はスクリプト実行結果のみ。** このファイルに固定の進捗表を書かない（過去に陳腐化して誤情報源になったため削除済み）。

```bash
# 実際の進捗を確認（唯一の真実）
uv run --with pyyaml python3 scripts/tools/check-all-laws-real-status.py

# フェーズ別の内訳・残条文リスト（法律別 / 全体サマリ）
node scripts/tools/phase-status.js [category/law_slug]
```

## 🚨 既知の罠（known traps）

過去に実際に踏んだ問題。作業前に必ず目を通すこと。

### 枝番条文の欠落（解決済み・再発注意）

- fetch-egov-law.js が枝番条文（第132条の2 など）を落とす問題があった（2025-11-20発見 → 2026年1-2月修正完了）。枝番は `132-2.yaml` として保存する
- 条文追加後は `node scripts/tools/check-subdivided-articles-all-laws.js` で欠落チェックする

### Cloudflare Error 1102（Worker リソース超過）

- 巨大法ページで「全条文を原文フル込み・LIMITなし」で取得する富豪的クエリが原因で 1102（ユーザーには503）が頻発した。根治済み（`getArticleNavList` + `substr` 化）
- 新しいクエリを書くときは「毎ページで法律まるごとを読む」設計を避ける。原文フルが必要なのはフォールバック抜粋だけ

### デプロイ伝播窓

- push 後、新デプロイが Active になった直後の数分間は**旧コードの isolate が残存**し、503や旧挙動が混在する。デプロイ検証は一拍（〜8分）おいて再測定する

### `pages:build` は npm の prebuild フックをバイパスする

- CF Pages のビルドコマンド `npm run pages:build`（= `npx @cloudflare/next-on-pages`）は `prebuild` を実行しない
- ビルド時に必ず走らせたい生成処理（sitemap 等）は `pages:build` スクリプト自体に前置する

### D1 seed 投入の UNIQUE 制約違反

- `db:seed:push` だけを再実行すると UNIQUE 制約違反で全件失敗する。**途中失敗時は必ず `db:schema:push`（スキーマ再適用＝全消し）から再実行する**

### wrangler 実行時は `NODE_OPTIONS=""`

- NODE_OPTIONS のプロキシ設定が wrangler と干渉する。D1 操作時は `NODE_OPTIONS=""` を付けて実行する

### slug の綴り

- 会社法は **`kaisya_hou`**（`kaisha_hou` ではない）。既存slugは変更しない

### `db/seed.sql` を git add しない

- 自動生成物であり .gitignore 対象。コミットに含めない

### 既存の翻訳データを上書きしない

- 条文追加・再取得の際、既存の osakaText / commentaryOsaka を消さない。e-Gov 再取得時は `restore-osaka-by-content.js` で内容ベース復元する

## 🔗 e-Gov法令番号一覧（参考）

六法のデータ取得に使用する法令番号:

- 民法: `129AC0000000089`
- 商法: `132AC0000000048`
- 会社法: `417AC0000000086`
- 刑法: `140AC0000000045`
- 民事訴訟法: `408AC0000000109`
- 刑事訴訟法: `323AC0000000131`

**使用例**:

```bash
node scripts/tools/fetch-egov-law.js minpou 129AC0000000089
```

## 🚀 デプロイ手順（重要）

### フロントエンド（Cloudflare Pages）

**`git push` するだけで自動デプロイされる。手動デプロイは不要。**

- `npm run pages:build` や `wrangler pages deploy` を手動で実行しないこと
- GitHub連携により、mainブランチへのpushで自動ビルド＆デプロイが走る

### API（D1データベース）のみ手動デプロイ

YAMLデータ（`src/data/laws/` 配下）を変更した場合のみ、以下を実行する：

```bash
npm run db:seed                    # シードSQL生成
npx wrangler d1 execute osaka-kenpo-db --file=./db/schema-clean.sql --remote  # スキーマ適用
npx wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql --remote          # データ適用
```

### やってはいけないこと

- ❌ `npm run pages:build` → `wrangler pages deploy` の手動デプロイ（git pushで自動）
- ❌ フロントエンドのコード変更だけでD1を再デプロイ（不要）
- ❌ YAMLデータ変更後にD1デプロイを忘れる（データが古いまま）

## 💻 開発環境セットアップ

### 必要な環境

- Node.js 20以上
- npm

### セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/kako-jun/osaka-kenpo.git
cd osaka-kenpo

# 依存関係をインストール
npm install

# 開発サーバーを起動（Next.js）
npm run dev
```

### Cloudflare環境でのローカル開発

```bash
# 1. ビルド
npm run build

# 2. D1シードを生成してローカルDBに適用
npm run db:seed
npm run db:push:local

# 3. Cloudflare Pages開発サーバーを起動
npm run dev:cf
```

詳細は [docs/cloudflare-deploy.md](docs/cloudflare-deploy.md) を参照。

### コミット前の自動チェック

このプロジェクトでは、**husky + lint-staged**を使用してコミット前に自動的にlint/formatを実行します。

#### 仕組み

- **コミット時**: `git commit`を実行すると、変更されたファイルに対して自動的に：
  1. ESLintでコードチェック＆自動修正（`.js, .jsx, .ts, .tsx`）
  2. Prettierでフォーマット（`.js, .jsx, .ts, .tsx, .json, .css, .md`）
  3. 問題があればコミットを中断

#### 手動実行

```bash
# 全ファイルをフォーマット
npm run format

# フォーマットチェックのみ（修正しない）
npm run format:check

# ESLintで自動修正
npm run lint:fix

# 型チェック
npm run typecheck
```

#### 設定ファイル

- `.husky/pre-commit`: コミット前に実行されるフック
- `.prettierrc`: Prettierの設定
- `.prettierignore`: フォーマット対象外ファイル
- `package.json`の`lint-staged`: コミット時の実行内容

**更新（2026-02-06）**: YAMLファイル（法律データ）も自動フォーマット対象になりました。

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 (App Router, SSR on Edge)
- **言語**: TypeScript
- **UI**: React + Tailwind CSS
- **データ**: YAMLファイル → D1 (SQLite)
- **翻訳**: LLM API（将来的に）
- **ホスティング**: Cloudflare Pages + D1
- **SSR**: @cloudflare/next-on-pages（Workers上でSSR）
- **品質管理**: ESLint + Prettier + husky + lint-staged
- **デプロイ**: GitHub連携で自動デプロイ

## 🎓 教育的価値

### ターゲットユーザー

- 法律に苦手意識を持つ一般の人々
- 法律を学び始めた学生
- 大阪弁・関西弁が好きな人
- 歴史や国際比較に興味がある人

### 学習効果

- **理解促進**: 親しみやすい翻訳で法的概念を理解
- **興味喚起**: 歴史・国際比較で法律への関心を高める
- **継続学習**: 楽しいUI/UXでの学習継続支援

---

## 🎯 翻訳再開ガイド（2026-02-06更新）

### ステップ1: 現状確認

```bash
# 実際の進捗を確認
uv run --with pyyaml python3 scripts/tools/check-all-laws-real-status.py
```

### ステップ2: 対象条文の選択

`node scripts/tools/phase-status.js` の全体サマリから、Phase 4 未完了の法律と残条文リストを確認して対象を選ぶ（このファイルに固定の状況説明を書かない）。

### ステップ3: 翻訳作業

1. **翻訳ガイドを確認**: [.claude/guides/translation-style-guide.md](.claude/guides/translation-style-guide.md)
2. **対象条文を選択**: 歴史法・外国歴史法から
3. **YAMLファイルを編集**: `src/data/laws/<category>/<law_name>/<article_number>.yaml`
4. **検証**: ローカルサーバーで表示確認

### ステップ4: 進捗確認

```bash
# 再度進捗を確認
uv run --with pyyaml python3 scripts/tools/check-all-laws-real-status.py
```

### 重要な注意事項

- **スクリプトパス**（2025-11-21整理済み）
  - 汎用ツール: `scripts/tools/`
  - 使い捨て: `scripts/one-time/`
  - 古いもの: `scripts/archive/`

- **翻訳スタイル**
  - 商人表現（儲け、利益等）は避ける
  - 教育者としての優しい説明を心がける
  - 具体的な例え話を追加（最低3-4文）
  - 3段落以上の構成、300文字以上の詳細な解説

---

詳細な技術仕様・開発手順・貢献方法については、上記ドキュメントを参照してください。

---

## 📖 品質チェックから得た教訓（2026-02-12）

### Issue #31: 全条文の品質チェック完了

**対象**: 六法以外の`status: 'available'`法律11法（約600条）  
**発見**: 84件の問題を発見・修正完了  
**期間**: 2026-02-06 〜 2026-02-12

### 🔍 主要な発見と対策

#### 1. 条文番号の取り違え（Critical）

**問題**: マグナ・カルタ第29-31条で、原文と解説が完全に別の条文内容になっていた

**対策**:

- チェック項目に追加: 「原文の条文番号と解説の条文番号が一致しているか」
- 翻訳時に条文番号を二重確認する手順を追加

#### 2. 歴史的事実の誤記（Critical）

**問題**: ドイツ基本法で東西統一年を「1990年」ではなく「1986年」「2000年」等と10箇所も誤記

**対策**:

- 歴史的年号は必ず信頼できるソースで確認
- チェック項目に追加: 「歴史的な年号・日付を正確に記載しているか」

#### 3. 商人表現の多用（Medium）

**問題**: ドイツ基本法で「投資」18件、「利益」14件など、教育者らしくない商人表現が41件

**対策**:

- 商人表現の厳格な排除を翻訳ガイドに明記
- 置き換え例: 「投資」→「力を注ぐ」、「利益」→「良いこと」

#### 4. ペルソナ崩壊（High）

**問題**: 国連憲章第102条で「わし」使用（春日歩先生は女性）

**対策**:

- 男性表現（わい、わいら、おんどれ）の厳格な排除
- 一人称は基本的に使わない（使う場合は「わたし」のみ）

### 📊 統計データ

| 重大度   | 件数 | 主な内容                         |
| -------- | ---- | -------------------------------- |
| Critical | 64件 | 条文番号取り違え、歴史的事実誤記 |
| High     | 6件  | 男性表現、ハルシネーション       |
| Medium   | 8件  | 商人表現、変な登場人物名         |
| Low      | 6件  | 誤字、日付表記の不統一           |

### 🎯 改善されたドキュメント

1. **`reports/detailed-check-instructions.md`**: チェック基準を4段階に細分化
2. **`.claude/guides/translation-style-guide.md`**: 商人表現の禁止を明記
3. **スクリプト**: `scripts/tools/check-hallucination.js`で一括チェック可能に

### 💡 今後の運用

- **六法の品質チェック**: 民法（1,273条）等の大規模チェックは別タスク
- **定期見直し**: 新規翻訳時に上記の教訓を必ず適用
- **継続改善**: ユーザーフィードバックからさらなる改善点を抽出

## デザインシステム

UIの生成・修正時は `DESIGN.md` に定義されたデザインシステムに従うこと。定義外の色・フォント・スペーシングを勝手に使わない。
