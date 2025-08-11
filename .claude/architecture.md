# アーキテクチャ設計書

## システム全体構成

### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **UI**: React + Tailwind CSS
- **データ**: 静的JSONファイル
- **レンダリング**: SSG (Static Site Generation)

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
├── lib/                       # 共通ライブラリ (NEW)
│   ├── types.ts              # 全体共通の型定義
│   ├── law-mappings.ts       # 法律名・年代マッピング
│   └── utils.ts              # ユーティリティ関数
└── data/
    └── laws/                 # 法律データ
        ├── jp/              # 日本現行法
        ├── jp_old/          # 日本歴史法
        ├── foreign/         # 外国現行法
        ├── foreign_old/     # 外国歴史法
        └── treaty/          # 条約
```

## データフロー

1. **静的データ**: JSONファイルから法律データを読み込み
2. **共通ライブラリ**: `src/lib/`の型定義・ユーティリティを活用
3. **API層**: Next.js API Routesで統一されたレスポンス形式でデータを配信
4. **表示層**: React コンポーネントで条文を表示
5. **状態管理**: React Contextで表示モード（原文/大阪弁）を管理

### 新しいアーキテクチャの特徴
- **型安全性**: 全体で共通の型定義（`@/lib/types`）を使用
- **コード再利用**: ユーティリティ関数・マッピングの一元管理
- **統一API**: standardized response format `{ data: T, message?, timestamp }`
- **絶対パスimport**: `@/lib/...` での統一されたimport

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

## APIエンドポイント

### 法律カテゴリ一覧取得
- **エンドポイント**: `/api/{law_category}`
- **メソッド**: GET  
- **レスポンス**: `{ data: LawInfo[] }` - カテゴリ内の法律一覧
- **エラー**: 400/500 - 統一されたエラーレスポンス

### 条文一覧取得
- **エンドポイント**: `/api/{law_category}/{law}`
- **メソッド**: GET
- **レスポンス**: `{ data: ArticleListItem[] }` - 法律内の条文一覧
- **エラー**: 400/500 - 統一されたエラーレスポンス

### 個別条文取得
- **エンドポイント**: `/api/{law_category}/{law}/{article}`
- **メソッド**: GET
- **レスポンス**: `{ data: ArticleData }` - 条文詳細データ
- **エラー**: 400/404/500 - 統一されたエラーレスポンス

### API レスポンス形式
```typescript
// 成功レスポンス
{
  data: T,
  message?: string,
  timestamp: string
}

// エラーレスポンス
{
  error: string,
  status: number,
  timestamp: string
}
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

## 技術的改善点（実装済み）

### コードアーキテクチャ
1. **src/lib/ディレクトリ新設**: 共通機能の整理・再利用性向上
2. **絶対パスimport**: `@/lib/...` での統一されたimport
3. **型定義統一**: 全コンポーネント・APIでの型安全性確保
4. **重複コード削除**: マッピング・ユーティリティの一元管理

### API設計
1. **統一レスポンス形式**: 成功・エラー両方で一貫した形式
2. **エラーハンドリング強化**: 適切なHTTPステータスとメッセージ
3. **バリデーション機能**: データ検証による安全性向上
4. **後方互換性**: 新旧レスポンス形式の両対応

### 開発体験
1. **TypeScript活用**: 型安全性による開発時エラー検出
2. **標準化されたワークフロー**: 条文追加の明確な手順
3. **包括的ドキュメント**: 設計・開発・貢献ガイド完備