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
- **スクリプトで確認**: `python3 scripts/tools/check-all-laws-real-status.py`
- **統合ドキュメント**: [.claude/PROGRESS.md](.claude/PROGRESS.md) に全て集約

**禁止事項：**

- ❌ 複数ファイルでの重複管理
- ❌ 手動での進捗数字の記載
- ❌ 推測や記憶に基づく情報

**更新手順：**

1. スクリプトを実行: `python3 scripts/tools/check-all-laws-real-status.py`
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

**最新の進捗情報**: [.claude/PROGRESS.md](.claude/PROGRESS.md)

```bash
# 実際の進捗を確認
python3 scripts/tools/check-all-laws-real-status.py
```

**重要**: 進捗数字は手動で更新しないでください。上記スクリプトの実行結果が唯一の真実です。

### 📊 現在の進捗（2026-02-06時点）

#### 日本現行法（六法＋AI基本法）

| 法律名     | 総条文数    | Stage4完成度            | 状態            |
| ---------- | ----------- | ----------------------- | --------------- |
| 民法       | 1,273条     | 1,195/1,195 (100%)      | ✅ 完全翻訳済み |
| 刑事訴訟法 | 744条       | 740/740 (100%)          | ✅ 完全翻訳済み |
| 民事訴訟法 | 495条       | 495/495 (100%)          | ✅ 完成         |
| 会社法     | 1,116条     | 1,113/1,113 (100%)      | ✅ 完成         |
| 商法       | 889条       | 291/291 (100%)          | ✅ 完成         |
| 刑法       | 327条       | 309/309 (100%)          | ✅ 完成         |
| 日本国憲法 | 103条       | 103/105 (98.1%)         | 🔄 ほぼ完成     |
| AI基本法   | 32条        | 30/32 (93.8%)           | 🔄 ほぼ完成     |
| **合計**   | **4,981条** | **4,276/4,280 (99.9%)** | 🎉 ほぼ完成     |

※削除条文（701条）を除く実質4,280条に対する完成度

#### 条約・外国法・歴史法

- **外国現行法**: ドイツ基本法・アメリカ憲法・中国憲法（375条、100%完成）
- **国際条約**: 国連憲章・WHO憲章・NPT等（266条、99.6%完成）
- **日本歴史法**: 十七条憲法・五箇条の御誓文等（216条、99.5%完成）
- **外国歴史法**: マグナ・カルタ・ナポレオン法典等（2,610条、100%完成）

**全体合計**: 8,448条（実質7,747条）のうち、Stage1完成度99.9%、Stage4完成度63.7%

### 🎯 残りの作業

#### 優先度高

1. **歴史法の解説追加**: 大宝律令29条、御成敗式目50条、明治憲法75条など
2. **外国歴史法の解説追加**: ナポレオン法典2,280条、ハンムラビ法典281条など

#### 将来的な拡張

- 条約・歴史法の翻訳完成により、現行法は**ほぼ完全翻訳達成**
- 今後は品質維持とユーザー体験向上に注力

詳細は [.claude/PROGRESS.md](.claude/PROGRESS.md) を参照。

## 🚨 既知の技術的問題

### ✅ 解決済み: 枝番条文問題（2025-11-20発見 → 2026年1-2月修正完了）

**以前の問題**:

- fetch-egov-law.jsスクリプトが枝番条文（132_2, 132_3など）を正しく処理できず
- 民法・商法・会社法・刑法・民訴・刑訴で大量の条文が欠落

**修正内容**:

- スクリプトを修正し、枝番条文を正しく `132-2.yaml` として保存
- 全六法のデータを再取得し、大阪弁訳を内容ベースで100%復元
- 民法1,273条、刑訴744条など全て正しい条文数を取得完了

**現状**: 全て修正済み。六法の条文数は正確になりました。

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
python3 scripts/tools/check-all-laws-real-status.py
```

### ステップ2: 対象条文の選択

現在の状況:

1. **日本現行法（六法）**: ほぼ完全翻訳達成（99.9%完成）
2. **歴史法**: 原文は完成、解説（commentary/commentaryOsaka）が不足
3. **外国歴史法**: 原文は完成、解説が不足

### ステップ3: 翻訳作業

1. **翻訳ガイドを確認**: [.claude/guides/translation-style-guide.md](.claude/guides/translation-style-guide.md)
2. **対象条文を選択**: 歴史法・外国歴史法から
3. **YAMLファイルを編集**: `src/data/laws/<category>/<law_name>/<article_number>.yaml`
4. **検証**: ローカルサーバーで表示確認

### ステップ4: 進捗確認

```bash
# 再度進捗を確認
python3 scripts/tools/check-all-laws-real-status.py
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
