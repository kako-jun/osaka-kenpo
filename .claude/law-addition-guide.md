# 法律追加手順書

## 概要
新しい法律をおおさかけんぽうに追加する際の手順書です。2025年8月時点で**YAML + Zod**形式に移行完了。

## 1. データファイルの準備

### 1.1. 条文データの作成
各条文につき1つのYAMLファイルを作成します。

**ファイル配置:**
```
src/data/laws/[category]/[law_name]/[article_number].yaml
```

**YAMLフォーマット（配列形式・Zod検証）:**
```yaml
article: 1
title: "原文のタイトル"
titleOsaka: "大阪弁のタイトル（任意）"
originalText:
  - "原文の段落1"
  - "原文の段落2"
osakaText:
  - "大阪弁翻訳の段落1" 
  - "大阪弁翻訳の段落2"
commentary:
  - "解説の段落1"
  - "解説の段落2"
commentaryOsaka:  # 任意
  - "大阪弁解説の段落1"
  - "大阪弁解説の段落2"
```

**重要**: 全てのテキストフィールドは配列で段落分割

**カテゴリ例:**
- `jp`: 現行日本法
- `jp_old`: 歴史的日本法
- `foreign`: 外国現行法
- `foreign_old`: 歴史的外国法
- `treaty`: 条約・国際法

### 1.2. 法律メタデータの追加

#### グローバル法律一覧 (`src/data/laws-metadata.yaml`)
```yaml
categories:
  - id: "jp"
    title: "ろっぽう"
    icon: "⚖️"
    laws:
      - id: "new_law"
        path: "/law/jp/new_law"
        status: "available"  # または "preparing"
```

#### 個別法律メタデータ (`src/data/laws/[category]/[law]/law-metadata.yaml`)
```yaml
name: "新しい法律"
year: 2024
source: "官報第xxxx号"
description: "法律の詳細説明"
links:  # 任意
  - text: "e-Gov法令検索"
    url: "https://elaws.e-gov.go.jp/..."
  - text: "参考資料"
    url: "https://example.com"
```

#### 有名条文データ (`famous-articles.yaml`) - 任意
```yaml
"1": "第一条の要点！"
"5": "重要な第五条！"
```

#### 章構成データ (`chapters.yaml`) - 任意
```yaml
chapters:
  - chapter: 1
    title: "第一章"
    titleOsaka: "第一章やで"
    articles: [1, 2, 3]
    description: "章の説明"
    descriptionOsaka: "章の大阪弁説明"
```

**注意点:**
- 古い法律にはe-Gov法令検索のリンクは含めない
- 国立国会図書館デジタルコレクションのリンクは正確なPIDを確認する
- 外国法の場合は原文の公式サイトへのリンクを含める

## 2. データ検証とローディング

### 2.1. 自動データ検証
全データはZodスキーマで実行時に検証されます：
- 条文: `ArticleSchema` (`src/lib/schemas/article.ts`)
- メタデータ: `LawMetadataSchema` (`src/lib/schemas/law-metadata.ts`)
- APIで自動検証され、不正なデータは500エラー

### 2.2. データローディング
- ブラウザ → `metadata-loader.ts` → fetch → API Routes
- YAMLファイル読み込み → Zod検証 → 型安全データ
- エラー時は適切なフォールバック

## 3. APIルートの確認

以下のAPIルートが自動で動作することを確認:
- `/api/[law_category]/[law]` - 条文一覧 
- `/api/[law_category]/[law]/[article]` - 個別条文
- `/api/metadata/[law_category]/[law]/[metadata_type]` - メタデータ
- `/api/metadata/laws-metadata` - 全法律一覧

YAMLファイルが正しく配置されていれば自動で動作します。

## 4. 動的ルーティングの確認

以下のページが自動生成されることを確認:
- `/law/[law_category]` - カテゴリページ
- `/law/[law_category]/[law]` - 法律の条文一覧
- `/law/[law_category]/[law]/[article]` - 個別条文ページ

## 5. 翻訳作業のポイント

### 5.1. 大阪弁翻訳のトーン
- 「春日歩（大阪さん）」風の親しみやすい口調
- 関西弁の特徴：「〜やで」「〜しなはれ」「知らんけど」等
- 法律用語も分かりやすく言い換える

### 5.2. 翻訳例
```
原文: 「和をもって貴しとなす」
大阪弁: 「和を大切にしなはれ」

原文: 「篤く三宝を敬え」  
大阪弁: 「仏法僧をちゃんと敬いなはれや」
```

## 6. テスト項目

新しい法律を追加したら以下を確認:

### 6.1. 表示確認
- [ ] カテゴリページで法律が表示される
- [ ] 法律一覧ページで全条文が表示される
- [ ] 個別条文ページが正常に表示される
- [ ] 原文・大阪弁の切り替えが動作する

### 6.2. アニメーション確認
- [ ] 言語切り替え時にスムーズなフェードアニメーションが動作する
- [ ] スペースキーで切り替えできる
- [ ] ダブルクリック/タップで切り替えできる

### 6.3. UI確認
- [ ] タイトルが正しく表示される（HTMLタグが見えない）
- [ ] ナビゲーション（前の条文・次の条文）が動作する
- [ ] シェアボタンが正常に動作する
- [ ] 出典情報が正しく表示される
- [ ] モバイルでの表示が正常

### 6.4. 全体動作確認
- [ ] npm run dev で開発サーバーが正常起動する
- [ ] ビルドエラーが発生しない
- [ ] TypeScriptエラーが発生しない

## 7. よくある問題と対処法

### 7.1. アニメーション関連
**問題:** 切り替え時にHTMLタグが見える
**対処:** AnimatedContentのpropsを正しく分離する（originalContent/osakaContent）

**問題:** アニメーションが一瞬で切り替わる
**対処:** AnimatedContentコンポーネントのopacityとpositionの設定を確認

### 7.2. データ関連
**問題:** 条文が表示されない
**対処:** YAMLファイルの形式とZodスキーマ準拠を確認

**問題:** 法律名が表示されない
**対処:** `law-metadata.yaml`の`name`フィールドを確認

**問題:** Zodバリデーションエラー
**対処:** 全テキストフィールドが配列形式になっているか確認

### 7.3. リンク関連
**問題:** 参考リンクが不適切
**対処:** 古い法律はe-Govを除外、図書館リンクは正確なPIDを使用

## 8. 追加後のコミット

全ての確認が完了したら、以下のようなコミットメッセージでコミット:

```
feat: [法律名]の追加と大阪弁翻訳

- [法律名]の全[n]条を追加
- 各条文の大阪弁翻訳を実装
- 出典情報と参考リンクを追加
- 動的ルーティングとアニメーション対応

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 9. 今後の改善点

- 翻訳の自動化スクリプトの作成
- バッチ処理での条文データ生成
- 翻訳品質の統一化
- テスト自動化の導入