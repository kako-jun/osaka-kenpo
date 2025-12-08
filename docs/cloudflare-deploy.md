# Cloudflare Pages + D1 デプロイガイド

## 概要

このプロジェクトは Cloudflare Pages（静的サイト）+ D1（データベース）で動作します。

```
┌─────────────────────────────────────────┐
│           Cloudflare Pages              │
│  ┌───────────────┬─────────────────┐   │
│  │  静的ファイル  │ Pages Functions │   │
│  │  (Next.js)    │    (API)        │   │
│  └───────────────┴────────┬────────┘   │
│                           │             │
│                    ┌──────▼──────┐      │
│                    │     D1      │      │
│                    │ (SQLite DB) │      │
│                    └─────────────┘      │
└─────────────────────────────────────────┘
```

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

| 項目 | 値 |
|------|-----|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | `/` |
| Node.js version | 20 |

### 5. D1 バインディング設定

Pages プロジェクトの Settings → Functions → D1 database bindings で：

- Variable name: `DB`
- D1 database: `osaka-kenpo-db`

## デプロイフロー

### 自動デプロイ（GitHub 連携時）

1. `main` ブランチにプッシュ
2. Cloudflare Pages が自動ビルド
3. `npm run build` で静的ファイル生成
4. `out/` ディレクトリがデプロイされる

### D1 データ更新

YAMLファイルを変更した後、D1データを更新する必要があります：

```bash
# 1. シードSQLを生成
node scripts/tools/generate-d1-seed.js > db/seed.sql

# 2. D1に適用（本番）
wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql

# 2'. D1に適用（ローカルテスト）
wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql --local
```

**重要**: 毎回フルリビルド方式なので、YAMLとD1は常に同期されます。

## ローカル開発

### Pages Functions のローカル実行

```bash
# wrangler で開発サーバー起動
wrangler pages dev out --d1=DB

# または npm script を追加した場合
npm run dev:cf
```

### Next.js 開発（API なし）

```bash
npm run dev
```

※ ローカルの Next.js 開発では API（`/api/*`）は動作しません。
Pages Functions は Cloudflare 環境でのみ動作します。

## ファイル構成

```
osaka-kenpo/
├── wrangler.toml           # Cloudflare 設定
├── db/
│   ├── schema.sql          # D1 テーブル定義
│   └── seed.sql            # 生成されるデータ（git 管理外推奨）
├── functions/
│   └── api/                # Pages Functions (API)
│       ├── _middleware.ts  # CORS 設定
│       ├── [law_category]/
│       │   ├── index.ts
│       │   └── [law]/
│       │       ├── index.ts
│       │       └── [article].ts
│       └── metadata/
│           └── ...
├── src/
│   └── data/laws/          # YAML データ（真実の源）
└── out/                    # ビルド出力（git 管理外）
```

## トラブルシューティング

### D1 のデータが反映されない

```bash
# シードを再生成して適用
node scripts/tools/generate-d1-seed.js > db/seed.sql
wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql
```

### Pages Functions が動作しない

1. `wrangler.toml` の `database_id` が正しいか確認
2. Cloudflare Dashboard で D1 バインディングが設定されているか確認

### ビルドエラー

```bash
# キャッシュをクリアしてビルド
rm -rf .next out
npm run build
```

## npm scripts（追加推奨）

`package.json` に以下を追加：

```json
{
  "scripts": {
    "db:seed": "node scripts/tools/generate-d1-seed.js > db/seed.sql",
    "db:push": "wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql",
    "db:push:local": "wrangler d1 execute osaka-kenpo-db --file=./db/seed.sql --local",
    "dev:cf": "wrangler pages dev out --d1=DB"
  }
}
```
