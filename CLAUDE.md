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

#### 計画・ロードマップ (.claude/plans/)

- **[scraping-roadmap.md](.claude/plans/scraping-roadmap.md)** - データ取得・整備のロードマップ

#### トラブルシューティング (.claude/troubleshooting/)

- **[animation-troubleshooting.md](.claude/troubleshooting/animation-troubleshooting.md)** - アニメーション関連
- **[ui-consistency-checklist.md](.claude/troubleshooting/ui-consistency-checklist.md)** - UI一貫性チェック

### 📚 ユーザー・貢献者向けドキュメント

- **[README.md](README.md)** - プロジェクト概要とユーザーガイド
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - 貢献者向けガイドライン
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

### 現在の優先課題

1. **商法の原文取得**（Stage1: 32.7%）← 最優先
2. **商法・刑法の商人表現修正**（197条 + 15条）
3. **訴訟法の例え話追加**（刑訴492条、民訴122条）
4. **歴史法・条約の翻訳**（原文完成済み、翻訳未着手）

詳細は [.claude/PROGRESS.md](.claude/PROGRESS.md) を参照。

## 🚨 既知の技術的問題

### 📌 問題の概要

**旧fetch-egov-law.jsスクリプトに重大なバグが発見されました：**

- **症状**: 枝番条文（132_2, 132_3など）を正しく処理できず、すべて"132"として上書き
- **影響範囲**: 六法全体（民法・商法・会社法・刑法・民訴・刑訴）
- **結果**:
  - 民事訴訟法: 136条が欠落（404条→正しくは540条）
  - 全条文番号がずれ、ファイル名と内容が不一致
  - 例：旧「3.yaml」= 実際は第139条の内容

### 🔍 根本原因

**scripts/tools/fetch-egov-law.js（旧版）の欠陥:**

```javascript
// ❌ 旧コード（バグあり）
const parsedNum = parseArticleNumber(articleNum); // "132_2" → "132"
const filename = `${parsedNum}.yaml`; // すべて"132.yaml"に上書き

// ✅ 修正後（2025-11-20）
const articleNumStr = String(articleNum || '');
const parsedNum = parseArticleNumber(articleNumStr);
const fileIdentifier = article.rawNumber.replace('_', '-'); // "132_2" → "132-2"
const filename = `${fileIdentifier}.yaml`; // "132-2.yaml"として正しく保存
```

### 🎯 修正計画（3段階アプローチ）

#### Phase 1: 調査と影響範囲の特定 ⏳

**目的**: 六法全体でどれくらいの枝番条文が欠落しているか確認

**タスク:**

1. **枝番条文の特定**（法律ごと）

   ```bash
   # 各法律でe-Gov APIから枝番条文を列挙
   node scripts/tools/check-subdivided-articles-all-laws.js
   ```

2. **欠落数の算出**（2025-11-20調査完了）
   - 民法: 現在1,099ファイル / 期待1,360条 → **261条欠落推定**
   - 商法: 現在889ファイル / 期待457条 → 附則含むため調査必要
   - 会社法: 現在1,015ファイル / 期待1,152条 → **137条欠落推定**
   - 刑法: 現在276ファイル / 期待356条 → **80条欠落推定**
   - 民事訴訟法: 現在495ファイル / 期待540条 → **45条欠落**（revert後の混在状態）
   - 刑事訴訟法: 現在542ファイル / 期待815条 → **273条欠落推定**

3. **現状のYAMLファイル数との比較**
   ```bash
   # 各法律のYAMLファイル数をカウント
   for law in minpou shouhou kaisya_hou keihou minji_soshou_hou keiji_soshou_hou
   do
     echo "=== $law ==="
     ls -1 src/data/laws/jp/$law/*.yaml | grep -v law_metadata | wc -l
   done
   ```

**完了条件**: 六法全体の欠落条文リストが完成

---

#### Phase 2: 枝番条文追加の完全手順 ✅確立（2025-11-20）

**重要な発見:**

- 条文番号のズレは**なかった**（旧85.yaml = 第85条、新85.yaml = 第85条）
- 問題は単純に**枝番条文が欠落していた**だけ（132-2, 132-3等）
- 既存の条文番号は正しいため、内容ベースのマッチングで復元可能

**完全な修正手順（各法律で実行）:**

```bash
# ===== 準備 =====
LAW_NAME="minji_soshou_hou"  # 対象法律
LAW_ID="408AC0000000109"      # e-Gov法令番号

# ===== Step 1: 旧データを全削除 =====
find src/data/laws/jp/${LAW_NAME} -name "*.yaml" ! -name "law_metadata.yaml" -type f -delete

# ===== Step 2: e-Gov APIから再取得 =====
node scripts/tools/fetch-egov-law.js ${LAW_NAME} ${LAW_ID}

# ===== Step 3: 大阪弁訳を内容ベースで復元 =====
node scripts/tools/restore-osaka-by-content.js ${LAW_NAME}
# → 既存の大阪弁訳を100%復元
# → 新規の枝番条文は大阪弁訳なし（後日追加）

# ===== Step 4: タイトルクリーンアップ（カッコ削除） =====
node scripts/tools/clean-law-titles.js jp ${LAW_NAME}

# ===== Step 5: law_metadata.yamlの復元 =====
git checkout HEAD -- src/data/laws/jp/${LAW_NAME}/law_metadata.yaml
# → fetch-egov-law.jsが有用情報（badge, description）を削除するため復元

# ===== Step 6: コミット =====
git add src/data/laws/jp/${LAW_NAME}/
git commit -m "fix(${LAW_NAME}): 枝番条文を追加し、大阪弁訳を復元

- e-Gov APIから正しく全条文を再取得
- 内容ベースのマッチングで大阪弁訳を復元（復元率100%）
- 枝番条文を新規追加
- タイトルから括弧を削除

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**重要な注意点:**

1. **law_metadata.yamlの保護**: fetch後に必ず`git checkout`で復元
2. **タイトルクリーンアップ**: 必ず`clean-law-titles.js`を実行
3. **復元率の確認**: restore-osaka-by-content.jsの出力で100%を確認
4. **削除条文のチェック**: 該当法律に削除条文がある場合は追加処理が必要

**完了条件**: 民事訴訟法で成功し、手順が確立済み ✅

---

#### Phase 3: 六法の段階的再取得と復元 ⏳

**目的**: 六法全体を正しいデータに置き換え、大阪弁訳を復元

**実行順序:**

```bash
# 0. 現状をコミット（重要！）
git add -A
git commit -m "backup: 六法再取得前の状態（枝番問題修正前）"

# 1. 民事訴訟法（テストケース）
git checkout HEAD -- src/data/laws/jp/minji_soshou_hou/  # 一旦元に戻す
node scripts/tools/fetch-egov-law.js minji_soshou_hou 408AC0000000109
node scripts/tools/restore-osaka-by-content.js minji_soshou_hou

# 2. 復元結果を確認
git diff src/data/laws/jp/minji_soshou_hou/ | less

# 3. 問題なければコミット
git add src/data/laws/jp/minji_soshou_hou/
git commit -m "fix(民訴): 枝番条文を含む540条を正しく取得し、大阪弁訳を復元"

# 4. 残りの六法を順番に実施
for law in minpou shouhou kaisya_hou keihou keiji_soshou_hou
do
  echo "=== $law ==="

  # 法令番号を取得（別途リスト化）
  LAW_ID=$(get_law_id $law)

  # バックアップ
  git checkout HEAD -- src/data/laws/jp/$law/

  # 再取得
  node scripts/tools/fetch-egov-law.js $law $LAW_ID

  # 復元
  node scripts/tools/restore-osaka-by-content.js $law

  # 確認
  git diff src/data/laws/jp/$law/ | head -100

  # 問題なければコミット
  git add src/data/laws/jp/$law/
  git commit -m "fix($law): 枝番条文を正しく取得し、大阪弁訳を復元"

  echo ""
done
```

**検証ポイント:**

1. **条文数の確認**
   - 新ファイル数 = e-Gov API取得数
   - 枝番ファイル（XXX-2.yaml等）が存在

2. **大阪弁訳の保持**
   - 復元率: 目標95%以上
   - 未復元ファイルのリスト化

3. **内容の正確性**
   - ランダムに10-20条をサンプリング
   - originalTextとosakaTextの内容が一致

**完了条件**: 六法全体の再取得・復元が完了し、コミット済み

---

### 📊 進捗トラッキング

| 法律   | Phase 1<br>調査 | Phase 2<br>スクリプト | Phase 3<br>再取得 |   現在/期待 | 欠落数 | 復元率 |
| ------ | :-------------: | :-------------------: | :---------------: | ----------: | -----: | -----: |
| 憲法   |       ✅        |           -           |         -         |     103/103 |      0 |      - |
| 民法   |       ✅        |           -           |         -         | 1,099/1,360 |    261 |      - |
| 商法   |       ✅        |           -           |         -         |    889/457※ |      ? |      - |
| 会社法 |       ✅        |           -           |         -         | 1,015/1,152 |    137 |      - |
| 刑法   |       ✅        |           -           |         -         |     276/356 |     80 |      - |
| 民訴   |       ✅        |          ⏳           |        ⏳         |     495/540 |     45 |      - |
| 刑訴   |       ✅        |           -           |         -         |     542/815 |    273 |      - |

※商法は附則含むため期待値より多い可能性

**凡例**: ⏳ 未着手 / 🔄 進行中 / ✅ 完了

---

### 🛠️ 関連スクリプト

| スクリプト                                            | 用途                           |    状態     |
| ----------------------------------------------------- | ------------------------------ | :---------: |
| `scripts/tools/fetch-egov-law.js`                     | e-Gov APIから法令取得          | ✅ 修正済み |
| `scripts/tools/check-subdivided-articles-all-laws.js` | 枝番条文の特定                 | ✅ 作成済み |
| `scripts/tools/restore-osaka-by-content.js`           | 内容ベースで大阪弁訳を復元     |  ⏳ 未作成  |
| `scripts/verify-article-alignment.js`                 | 条文番号と内容の整合性チェック |  ⏳ 未作成  |

---

### 📝 備考

- **この問題の発見経緯**: 民事訴訟法の第3条で原文と大阪弁訳が不一致（2025-11-20）
- **旧データのバックアップ**: git履歴に保存済み（コミット前の状態）
- **復元不可能な場合**: 新規作成として扱い、後日翻訳を追加

---

### 🎯 次にやるべきこと

**Phase 3: 国際条約の原文取得**

1. **WHO憲章**: 82条
2. **国連憲章**: 111条
3. **国連海洋法条約**: 320条
4. **その他の条約・歴史法**: 約3,000条

**課題**: ネットワークアクセス不安定、PDF解析ツール導入検討中

詳細は → `.claude/scraping-roadmap.md` を参照

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

**注意**: YAMLファイル（法律データ）は人間が手で編集するため、Prettierの対象外としています。

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

## 🎯 翻訳再開ガイド（2025-11-21更新）

### ステップ1: 現状確認

```bash
# 実際の進捗を確認
python3 scripts/tools/check-all-laws-real-status.py
```

### ステップ2: 優先順位の決定

現状の問題（CLAUDE.md内の「要修正条文リスト」参照）:

1. **商法**: 商人表現が強い（197条）← 最優先
2. **刑事訴訟法**: 例え話不足（492条）
3. **民事訴訟法**: 例え話不足（122条）
4. **刑法**: 商人表現が強い（15条）

### ステップ3: 品質チェック

```bash
# 大阪弁解説の品質をチェック
node scripts/tools/check-commentary-quality.cjs

# 結果は quality-check-report.json に保存
```

### ステップ4: 翻訳作業

1. **翻訳ガイドを確認**: [.claude/guides/translation-style-guide.md](.claude/guides/translation-style-guide.md)
2. **対象条文を選択**: 品質チェック結果から
3. **YAMLファイルを編集**: `src/data/laws/jp/<law_name>/<article_number>.yaml`
4. **検証**: ローカルサーバーで表示確認

### ステップ5: 進捗確認

```bash
# 再度進捗を確認
python3 scripts/tools/check-all-laws-real-status.py
```

### 重要な注意事項

- **スクリプトパスが変更されました**（2025-11-21整理）
  - 汎用ツール: `scripts/tools/`
  - 使い捨て: `scripts/one-time/`
  - 古いもの: `scripts/archive/`

- **翻訳スタイル**
  - 商人表現（儲け、利益等）は避ける
  - 教育者としての優しい説明を心がける
  - 具体的な例え話を追加（最低3-4文）

---

詳細な技術仕様・開発手順・貢献方法については、上記ドキュメントを参照してください。
