# API 仕様書

> 最終更新: 2026-02-21
> 対象: ソースコードの実装に基づく実態記録

---

## 1. 概要

osaka-kenpo は2種類の API を使用する:

| 区分 | API                 | ホスト                    | 用途                       |
| ---- | ------------------- | ------------------------- | -------------------------- |
| 内部 | /api/eeyan          | osaka-kenpo.llll-ll.com   | ユーザー個人のええやん管理 |
| 内部 | /api/article-image  | osaka-kenpo.llll-ll.com   | OG 画像の動的生成          |
| 外部 | Nostalgic Like API  | api.nostalgic.llll-ll.com | グローバルいいねカウント   |
| 外部 | Nostalgic Visit API | api.nostalgic.llll-ll.com | 訪問カウンター             |

## 2. 内部 API

### 2.1 /api/eeyan — ええやん API

**ソース**: `src/app/api/eeyan/route.ts`
**ランタイム**: Edge
**DB**: Cloudflare D1（`user_likes` テーブル）

#### POST /api/eeyan（ええやんトグル）

ユーザーの個人いいね状態をトグルする。レコードが存在すれば DELETE、存在しなければ INSERT。

**リクエスト**:

```
POST /api/eeyan
Content-Type: application/json

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "jp",
  "lawName": "minpou",
  "article": "1"
}
```

**バリデーション**:

- 4フィールド全て必須（欠けると 400）
- `userId` は UUID 形式: `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`

**レスポンス（いいね追加）**:

```json
{ "success": true, "liked": true }
```

**レスポンス（いいね解除）**:

```json
{ "success": true, "liked": false }
```

**エラーレスポンス**:

| ステータス | ボディ                                                           |
| ---------- | ---------------------------------------------------------------- |
| 400        | `{ "error": "userId, category, lawName, article are required" }` |
| 400        | `{ "error": "Invalid userId format" }`                           |
| 500        | `{ "error": "Internal server error" }`                           |

#### GET /api/eeyan（ええやん一覧取得）

2つのモードがある。`category` と `lawName` の有無で分岐する。

##### モード1: 法律ごとの条文 ID 一覧

**リクエスト**:

```
GET /api/eeyan?userId={uuid}&category={category}&lawName={lawName}
```

**レスポンス**:

```json
{
  "success": true,
  "likes": ["1", "3", "132-2"]
}
```

条文 ID の配列を `article` カラム昇順で返す。

##### モード2: 全法律横断の詳細一覧

**リクエスト**:

```
GET /api/eeyan?userId={uuid}
```

**レスポンス**:

```json
{
  "success": true,
  "likes": [
    {
      "category": "jp",
      "lawName": "minpou",
      "article": "1",
      "createdAt": "2026-02-20 12:34:56",
      "title": "（権利能力）",
      "originalText": "私権の享有は、出生に始まる。"
    }
  ]
}
```

- `user_likes` と `articles` テーブルを LEFT JOIN
- `created_at` 降順（新しい順）
- `originalText` は DB の JSON 配列をパースして最初の要素のみ返す

**エラーレスポンス**:

| ステータス | ボディ                                 |
| ---------- | -------------------------------------- |
| 400        | `{ "error": "userId is required" }`    |
| 400        | `{ "error": "Invalid userId format" }` |
| 500        | `{ "error": "Internal server error" }` |

### 2.2 /api/article-image — OG 画像生成 API

**ソース**: `src/app/api/article-image/route.tsx`
**ランタイム**: Edge
**技術**: `next/og` の `ImageResponse`

#### GET /api/article-image

条文の内容を画像としてレンダリングする。SNS の OG 画像として使用。

**リクエスト**:

```
GET /api/article-image?category={category}&law={law}&article={article}[&width={width}]
```

**パラメータ**:

| パラメータ | 必須 | 型     | デフォルト | 説明                |
| ---------- | ---- | ------ | ---------- | ------------------- |
| `category` | 必須 | string | -          | 法律カテゴリ        |
| `law`      | 必須 | string | -          | 法律 ID             |
| `article`  | 必須 | string | -          | 条文番号            |
| `width`    | 任意 | number | 1080       | 画像幅（320〜1920） |

**レスポンス**: PNG 画像

**レスポンスヘッダ**:

```
Content-Type: image/png
Cache-Control: public, max-age=86400, s-maxage=604800
```

**画像仕様**:

- 背景色: `#FFF8DC`（クリーム色）
- フォント: Klee One（Google Fonts から動的取得）
- フォントサイズ: width < 600 なら 14px、それ以外 16px
- タイトルサイズ: width < 600 なら 20px、それ以外 24px
- 行高: 1.8
- 高さ: テキスト量から自動計算（最小 400px）

**画像構成**:

```
┌─────────────────────────────────────┐
│              法律名                   │ ← 茶色 (#8B4513)
│         第N条（タイトル）              │ ← ピンク (#E94E77)、太字
│ ┌─────────────────────────────────┐ │
│ │ おおさか弁                       │ │ ← ピンクボーダー
│ │ 大阪弁訳テキスト...              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ワンポイント解説                  │ │ ← 赤ボーダー
│ │ 解説テキスト...                  │ │
│ └─────────────────────────────────┘ │
│    おおさかけんぽう - osaka-kenpo... │ ← フッター
└─────────────────────────────────────┘
```

**エラーレスポンス**:

| ステータス | ボディ                                | 条件                       |
| ---------- | ------------------------------------- | -------------------------- |
| 400        | `category, law, article are required` | パラメータ不足             |
| 404        | `Article not found`                   | D1 に該当条文なし          |
| 500        | `Database error`                      | D1 接続エラー              |
| 500        | `Invalid article data`                | テキスト JSON パースエラー |
| 500        | `Font loading failed`                 | Google Fonts 取得失敗      |

## 3. 外部 API

### 3.1 Nostalgic Like API

**ベース URL**: `https://api.nostalgic.llll-ll.com/like`
**定数**: `NOSTALGIC_API_BASE`（`src/lib/eeyan.ts`）

#### ID 体系

```
osaka-kenpo-{category}-{lawName}-{article}
```

生成関数: `getNostalgicId(category, lawName, article)`（`src/lib/eeyan.ts`）

#### 3.1.1 toggle — いいねトグル

**リクエスト**:

```
GET {BASE}?action=toggle&id={nostalgicId}
```

**使用箇所**: `LikeButton.handleLike`
**備考**: レスポンスは `.catch(() => {})` で無視される

#### 3.1.2 get — 単一 ID のカウント取得

**リクエスト**:

```
GET {BASE}?action=get&id={nostalgicId}&format=json
```

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "total": 42
  }
}
```

**使用箇所**: `LikeButton` マウント時の初期取得

#### 3.1.3 batchGet — 複数 ID のカウント一括取得

**リクエスト**:

```
POST {BASE}?action=batchGet
Content-Type: application/json

{
  "ids": ["osaka-kenpo-jp-minpou-1", "osaka-kenpo-jp-minpou-2", ...]
}
```

**制限**: 1回あたり最大 100 件（`NOSTALGIC_BATCH_LIMIT = 100`）。超過で 500 エラー。

**レスポンス**:

```json
{
  "success": true,
  "data": {
    "osaka-kenpo-jp-minpou-1": { "total": 5 },
    "osaka-kenpo-jp-minpou-2": { "total": 12 }
  }
}
```

**使用箇所**: `ArticleListWithEeyan`（法律ページの条文一覧）
**分割**: 100件超の法律は自動的に100件ずつ分割リクエスト

#### 3.1.4 sumByPrefix — プレフィックスで合計取得

**リクエスト**:

```
GET {BASE}?action=sumByPrefix&prefix={prefix}
```

プレフィックス例: `osaka-kenpo-jp-minpou-`

**レスポンス**:

```json
{
  "success": true,
  "total": 256
}
```

**使用箇所**: `LawCardWithEeyan`（トップページの法律カード）

### 3.2 Nostalgic Visit API

**ベース URL**: `https://api.nostalgic.llll-ll.com/visit`

#### 3.2.1 increment — 訪問カウントのインクリメント

**リクエスト**:

```
GET {BASE}?action=increment&id={counterId}
```

**使用箇所**: `NostalgicCounter`（トップページ）
**備考**: セッション内で1回のみ実行（`sessionStorage` でフラグ管理）

#### 3.2.2 get — 訪問カウントの取得

**リクエスト**:

```
GET {BASE}?action=get&id={counterId}&type={type}&format=text&digits={digits}
```

**パラメータ**:

| パラメータ | 値                                             | 説明               |
| ---------- | ---------------------------------------------- | ------------------ |
| `id`       | `osaka-kenpo-49a3907a`                         | カウンター ID      |
| `type`     | `total`, `today`, `yesterday`, `week`, `month` | 集計期間           |
| `format`   | `text`                                         | テキスト形式で返す |
| `digits`   | `4`                                            | 表示桁数           |

**レスポンス**: プレーンテキスト（例: `1234`）

**使用箇所**: `NostalgicCounter`（トップページ）
**キャッシュ**: `sessionStorage` で5分間キャッシュ

## 4. API 呼び出しパターン

### 4.1 エラーハンドリング

- **LikeButton トグル**: Nostalgic/D1 の成否を個別追跡し、失敗した側のみ1回リトライ。リトライ後も失敗すればUIロールバック + 成功側の再toggleでバックエンド整合性を保つ。詳細は `docs/eeyan-spec.md` セクション8を参照
- **その他の取得系呼び出し**: `.catch(() => {})` でエラーを無視する。ユーザーへのエラー通知は行われない

### 4.2 並行呼び出し

| 場面                          | 並行呼び出し内容                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| LikeButton トグル             | Nostalgic toggle + D1 POST（`Promise.all`）                                             |
| LikeButton マウント           | Nostalgic get + D1 GET（`Promise.all`）                                                 |
| ArticleListWithEeyan マウント | Nostalgic batchGet (N回) + D1 GET（`Promise.all`）                                      |
| 法律ページ サーバー           | `getArticles` + `getLawMetadata` + `getChapters` + `getFamousArticles`（`Promise.all`） |
| 条文ページ サーバー           | `getArticle` + `getArticles` + `getLawMetadata`（`Promise.all`）                        |

### 4.3 キャッシュ戦略まとめ

| コンポーネント                       | キャッシュ先        | TTL            | 無効化                             |
| ------------------------------------ | ------------------- | -------------- | ---------------------------------- |
| `LawCardWithEeyan`                   | sessionStorage      | 5分            | `visibilitychange` で削除 + 再取得 |
| `NostalgicCounter`（値）             | sessionStorage      | 5分            | なし                               |
| `NostalgicCounter`（インクリメント） | sessionStorage      | セッション中   | なし                               |
| `LikeButton`                         | なし                | -              | マウント時に毎回取得               |
| `ArticleListWithEeyan`               | なし                | -              | `visibilitychange` で再取得        |
| `EeyanPage`                          | なし                | -              | マウント時に1回取得                |
| `/api/article-image`                 | CDN (Cache-Control) | 7日 (s-maxage) | なし                               |
