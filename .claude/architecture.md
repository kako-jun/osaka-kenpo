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
│   │       └── [law]/
│   │           ├── [article]/
│   │           │   └── route.ts # 個別条文API
│   │           └── route.ts     # 法律一覧API
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
│   │           ├── page.tsx   # 法律一覧
│   │           └── [article]/
│   │               └── page.tsx # 条文詳細
│   ├── globals.css            # グローバルスタイル
│   ├── layout.tsx            # ルートレイアウト
│   └── page.tsx              # トップページ
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
2. **API層**: Next.js API Routesでデータを配信
3. **表示層**: React コンポーネントで条文を表示
4. **状態管理**: React Contextで表示モード（原文/大阪弁）を管理

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

### 個別条文取得
- **エンドポイント**: `/api/{law_category}/{law}/{article}`
- **メソッド**: GET
- **レスポンス**: 条文JSONデータ
- **エラー**: 404 (条文が存在しない場合)

### 法律一覧取得（将来実装予定）
- **エンドポイント**: `/api/{law_category}/{law}`
- **メソッド**: GET
- **レスポンス**: 法律の全条文リスト

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

1. **ファイル不在**: 404エラーページを表示
2. **API エラー**: 適切なエラーメッセージを表示
3. **ローディング**: ローディング状態を表示

## 拡張性の考慮

### 将来追加予定機能
1. **検索機能**: 法律名・条文内容での検索
2. **比較機能**: 複数法律の条文比較
3. **SNS共有**: 条文画像生成・共有
4. **ナビゲーションUI**: タイムマシン・ワールドツアー

### データ拡張
- 新しい法律カテゴリの追加が容易
- 統一されたJSONフォーマットにより機械的処理が可能