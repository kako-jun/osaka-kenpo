# アーキテクチャ設計書

## システム全体構成

### 技術スタック（2025年8月時点）
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UI**: React + Tailwind CSS
- **データ**: YAML + Zod検証 (JSON→YAML移行完了)
- **レンダリング**: SSG + CSR (メタデータはクライアントサイド読み込み)
- **型安全性**: Zod による実行時バリデーション

### ディレクトリ構成

```
src/
├── app/
│   ├── api/                    # APIルート
│   │   └── [law_category]/
│   │       ├── route.ts        # カテゴリ内法律一覧API
│   │       └── [law]/
│   │           ├── route.ts    # 法律内条文一覧API  
│   │           └── [article]/
│   │               └── route.ts # 個別条文API
│   ├── components/             # 共通コンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Menu.tsx
│   │   ├── ViewModeToggle.tsx
│   │   └── BackToTopButton.tsx
│   ├── context/               # Reactコンテキスト
│   │   └── ViewModeContext.tsx # 表示モード管理
│   ├── law/                   # 法律閲覧ページ
│   │   └── [law_category]/
│   │       ├── page.tsx       # カテゴリ一覧
│   │       └── [law]/
│   │           ├── page.tsx   # 法律内条文一覧
│   │           └── [article]/
│   │               └── page.tsx # 条文詳細
│   ├── globals.css            # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   └── page.tsx              # トップページ
├── lib/                       # 共通ライブラリ
│   ├── schemas/              # Zodスキーマ定義 (NEW)
│   │   ├── article.ts        # 条文データスキーマ
│   │   ├── law-metadata.ts   # 法律メタデータスキーマ
│   │   ├── famous-articles.ts# 有名条文スキーマ
│   │   ├── chapters.ts       # 章構成スキーマ
│   │   └── laws-metadata.ts  # 法律一覧スキーマ
│   ├── metadata-loader.ts    # メタデータローダー (NEW)
│   ├── article-loader.ts     # 条文ローダー
│   ├── types.ts              # 全体共通の型定義
│   └── utils.ts              # ユーティリティ関数
└── data/
    ├── laws-metadata.yaml    # 全法律一覧 (JSON→YAML)
    └── laws/                 # 法律データ
        ├── jp/              # 日本現行法 (全YAML化)
        ├── jp_old/          # 日本歴史法 (全YAML化)
        ├── foreign/         # 外国現行法 (全YAML化)
        ├── foreign_old/     # 外国歴史法 (全YAML化)
        └── treaty/          # 条約 (全YAML化)
            └── [law]/
                ├── {条文}.yaml
                ├── law-metadata.yaml
                ├── famous-articles.yaml (任意)
                └── chapters.yaml (任意)
```

## データフロー（YAML + Zod移行後）

### 条文データフロー
1. **YAMLファイル**: 条文データを配列形式で格納
2. **API Routes**: サーバーサイドでYAML読み込み + Zod検証
3. **article-loader.ts**: 統一された条文ローディング
4. **表示層**: 検証済みデータを安全に表示

### メタデータフロー  
1. **YAMLメタデータ**: 分散型メタデータファイル
2. **クライアントサイド**: ブラウザからfetch API
3. **metadata-loader.ts**: 統一されたメタデータローディング
4. **Zodバリデーション**: 実行時型安全性保証

### アーキテクチャ特徴（2025年8月版）
- **実行時型安全性**: Zodによるランタイムバリデーション
- **YAMLの可読性**: 設定ファイルの可読性向上
- **配列ベース段落**: `\n\n`分割から配列形式に進化
- **分散メタデータ**: 各法律フォルダに独立したメタデータ

## 動的ルーティング

### URL構造
```
/law/{law_category}/{law}/{article}
```

#### パス例
- `/law/jp/constitution/1` - 日本国憲法第1条
- `/law/jp_old/jushichijo_kenpo/1` - 十七条憲法第1条
- `/law/foreign/german_basic_law/1` - ドイツ基本法第1条

### ルーティングパラメータ
- `law_category`: 法律カテゴリ（jp, jp_old, foreign, foreign_old, treaty）
- `law`: 法律識別子（constitution, jushichijo_kenpo など）
- `article`: 条文番号（1, 2, 3...）

## 表示モード切り替え

### ViewModeContext
- 原文表示モード: `original`
- 大阪弁表示モード: `osaka`
- グローバル状態でユーザーの選択を保持

### コンポーネント連携
1. `ViewModeToggle`: モード切り替えUI
2. `ArticlePage`: 選択されたモードに応じて表示内容を変更

## APIエンドポイント（YAML + Zod版）

### 条文取得API
- **エンドポイント**: `/api/{law_category}/{law}`
- **メソッド**: GET  
- **データソース**: YAMLファイル + Zodバリデーション
- **レスポンス**: `{ data: ArticleListItem[] }` - 法律内の条文一覧

- **エンドポイント**: `/api/{law_category}/{law}/{article}`
- **メソッド**: GET
- **データソース**: YAMLファイル + Zodバリデーション
- **レスポンス**: `{ data: ArticleData }` - 条文詳細データ

### メタデータ取得API（NEW）
- **エンドポイント**: `/api/metadata/laws-metadata`
- **メソッド**: GET
- **レスポンス**: 全法律一覧（カテゴリ・法律・ステータス）

- **エンドポイント**: `/api/metadata/{law_category}/{law}/{metadata_type}`
- **メソッド**: GET
- **metadata_type**: `law-metadata`, `famous-articles`, `chapters`
- **レスポンス**: 各種メタデータ（Zod検証済み）

### エラーハンドリング
```typescript
// 成功レスポンス（条文API）
{ data: ArticleData, message?: string }

// 成功レスポンス（メタデータAPI）
LawMetadata | FamousArticles | ChaptersData

// エラーレスポンス
{ error: string, details?: string }
```

## スタイリング

### カラーパレット
- プライマリ: `#E94E77` (柔らかい赤系)
- バックグラウンド: クリーム色
- テキスト: グレー系統

### フォント
- 原文: 標準フォント
- 大阪弁: 手書き風・丸ゴシック系（CSSクラス `.osaka-text`）

### レスポンシブデザイン
- モバイルファースト設計
- Tailwind CSSのユーティリティクラスを使用

## エラーハンドリング

### バックエンド（API Routes）
1. **統一されたエラーレスポンス**: `createErrorResponse()` で一貫したエラー形式
2. **適切なHTTPステータス**: 400(Bad Request), 404(Not Found), 500(Internal Server Error)
3. **データ検証**: `validateArticleData()` での入力データ検証
4. **安全なJSON解析**: `safeJsonParse()` でのエラーハンドリング

### フロントエンド  
1. **ローディング状態**: 各ページでのローディング表示
2. **エラー表示**: ユーザーフレンドリーなエラーメッセージ
3. **フォールバック**: 新旧APIレスポンス形式の両対応
4. **型安全性**: TypeScriptによる実行時エラーの予防

## 拡張性の考慮

### 将来追加予定機能
1. **検索機能**: 法律名・条文内容での検索
2. **比較機能**: 複数法律の条文比較
3. **SNS共有**: 条文画像生成・共有
4. **ナビゲーションUI**: タイムマシン・ワールドツアー

### データ拡張
- **新しい法律カテゴリ**: `LAW_CATEGORIES` での簡単な追加
- **法律名マッピング**: `law-mappings.ts` での一元管理
- **統一されたJSONフォーマット**: 機械的処理が可能
- **型安全性**: TypeScript型定義による開発時エラー検出

## 技術的改善点（2025年8月実装済み）

### データアーキテクチャの革新
1. **JSON → YAML移行**: 205個の条文ファイル + 34個のメタデータファイル
2. **Zod実行時検証**: 全データの型安全性を実行時に保証
3. **配列ベース段落**: `\n\n`文字列分割から配列構造に進化
4. **分散メタデータ**: 各法律フォルダに独立したメタデータ配置

### APIアーキテクチャ強化
1. **メタデータAPI新設**: `/api/metadata/*` エンドポイント群
2. **クライアントサイドローダー**: `metadata-loader.ts` でブラウザ側処理
3. **統一されたエラーハンドリング**: Zodバリデーション失敗の適切な処理
4. **型安全なデータフロー**: TypeScript + Zod による二重の型保護

### 開発体験の向上  
1. **変換スクリプト**: JSON→YAML自動変換ツール (`convert-*.js`)
2. **スキーマ駆動開発**: Zodスキーマがデータ構造の単一情報源
3. **実行時デバッグ**: 詳細なバリデーションエラーメッセージ
4. **後方互換性**: レガシーJSONとの併存サポート（YAML優先）

### データ品質の担保
1. **構造統一**: 全条文で一貫した配列ベースフォーマット
2. **必須フィールド**: Zodによる必須データの強制
3. **型制約**: 文字列長・数値範囲・URL形式の検証
4. **一貫性チェック**: プロジェクト全体でのデータ整合性確保