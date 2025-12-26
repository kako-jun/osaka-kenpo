# Cloudflare Pages + D1 デプロイガイド

## 概要

このプロジェクトは **@cloudflare/next-on-pages** を使用し、Next.js App Router のSSRをCloudflare Workers上で動作させています。

```
┌─────────────────────────────────────────┐
│           Cloudflare Pages              │
│  ┌───────────────────────────────────┐  │
│  │  Next.js (SSR on Workers)         │  │
│  │  @cloudflare/next-on-pages        │  │
│  └──────────────────┬────────────────┘  │
│                     │                    │
│              ┌──────▼──────┐             │
│              │     D1      │             │
│              │ (SQLite DB) │             │
│              └─────────────┘             │
└─────────────────────────────────────────┘
```

## アーキテクチャ

- **SSRページ**: トップ、法律カテゴリ、法律一覧、条文詳細
- **データソース**: D1（SQLite）- YAMLから生成
- **切り替え機能**: 条文詳細ページのみでクライアントサイド実装

## 初回セットアップ（人間が行う作業）

### 1. Cloudflare アカウント準備

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. Workers & Pages を選択

### 2. D1 データベース作成

```bash
# wrangler をインストール
npm install -g wrangler

# Cloudflare にログイン
wrangler login

# D1 データベースを作成
wrangler d1 create osaka-kenpo-db
```

**重要**: 出力された `database_id` を `wrangler.toml` に設定してください：

```toml
[[d1_databases]]
binding = "DB"
database_name = "osaka-kenpo-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← ここを置き換え
```

### 3. D1 スキーマ適用

```bash
wrangler d1 execute osaka-kenpo-db --file=./db/schema.sql
```

### 4. Cloudflare Pages プロジェクト作成

1. Cloudflare Dashboard → Workers & Pages → Create application
2. Pages タブを選択
3. Connect to Git で GitHub リポジトリを接続

**ビルド設定**:

| 項目                   | 値                      |
| ---------------------- | ----------------------- |
| Framework preset       | None                    |
| Build command          | `npm run pages:build`   |
| Build output directory | `.vercel/output/static` |
| Root directory         | `/`                     |
| Node.js version        | 20                      |

### 5. D1 バインディング設定

Pages プロジェクトの Settings → Functions → D1 database bindings で：

- Variable name: `DB`
- D1 database: `osaka-kenpo-db`

## デプロイフロー

### 自動デプロイ（GitHub 連携時）

1. `main` ブランチにプッシュ
2. Cloudflare Pages が自動ビルド
3. `npm run pages:build` で @cloudflare/next-on-pages が実行
4. `.vercel/output/static/` がデプロイされる

### D1 データ更新

YAMLファイルを変更した後、D1データを更新する必要があります：

```bash
# 1. シードSQLを生成
npm run db:seed

# 2. D1に適用（本番）
npm run db:push

# 2'. D1に適用（ローカルテスト）
npm run db:push:local
```

**重要**: 毎回フルリビルド方式なので、YAMLとD1は常に同期されます。

## ローカル開発

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

### Next.js 開発（D1なし）

```bash
npm run dev
```

※ ローカルの Next.js 開発ではD1にアクセスできないため、データ取得は失敗します。
Cloudflare環境でテストする場合は `npm run dev:cf` を使用してください。

## ファイル構成

```
osaka-kenpo/
├── wrangler.toml           # Cloudflare 設定
├── env.d.ts                # CloudflareEnv型定義
├── db/
│   ├── schema.sql          # D1 テーブル定義
│   └── seed.sql            # 生成されるデータ（git 管理外推奨）
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # トップ（SSR）
│   │   └── law/
│   │       └── [law_category]/
│   │           ├── page.tsx              # カテゴリ（SSR）
│   │           └── [law]/
│   │               ├── page.tsx          # 法律一覧（SSR）
│   │               └── [article]/
│   │                   ├── page.tsx      # 条文（SSR）
│   │                   └── ArticleClient.tsx  # 切り替え機能
│   ├── lib/
│   │   └── db.ts           # D1アクセス関数
│   └── data/
│       ├── laws/           # YAML データ（真実の源）
│       └── lawsMetadata.ts # 静的メタデータ
└── .vercel/output/static/  # ビルド出力（git 管理外）
```

## npm scripts

```json
{
  "scripts": {
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages",
    "db:seed": "node scripts/tools/generate-d1-seed.js > db/seed.sql",
    "db:push": "wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql",
    "db:push:local": "wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql --local",
    "dev:cf": "wrangler pages dev .vercel/output/static --d1=DB"
  }
}
```

## トラブルシューティング

### D1 のデータが反映されない

```bash
# シードを再生成して適用
npm run db:seed
npm run db:push
```

### ビルドエラー

```bash
# キャッシュをクリアしてビルド
rm -rf .next .vercel
npm run build
npm run pages:build
```

### CloudflareEnv型エラー

`env.d.ts` が存在し、以下の内容であることを確認：

```typescript
interface CloudflareEnv {
  DB: D1Database;
}
```
