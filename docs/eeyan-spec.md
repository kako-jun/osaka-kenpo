# ええやん機能 仕様書

> **実装状況**: ✅ 完了（2026-02-09）  
> すべての機能が実装済みです。このドキュメントは仕様の参照用として保持しています。

## 概要

条文の大阪弁訳に対して「ええやん」（いいね）できる機能。
**全ユーザーの人気指標**と**個人の学習ブックマーク**の2つの役割を、異なるバックエンドで実現する。

## アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│                  ブラウザ                         │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │  ええやんボタン (クリック時)               │    │
│  │  ├→ nostalgic API: toggle (全体カウント)  │    │
│  │  └→ osaka-kenpo API: 個人記録の追加/削除  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  localStorage: user_id (UUID)                    │
└──────────┬──────────────────┬────────────────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐
│  nostalgic D1    │  │  osaka-kenpo D1      │
│                  │  │                      │
│  likes テーブル   │  │  user_likes テーブル  │
│  (全体カウント)   │  │  (個人ブックマーク)   │
│                  │  │                      │
│  daily_actions   │  │                      │
│  (重複防止)      │  │                      │
└──────────────────┘  └──────────────────────┘
```

## データの役割分担

| データ                   | 性質           | 保存先         | 用途                           |
| ------------------------ | -------------- | -------------- | ------------------------------ |
| 全ユーザー合計ええやん数 | 公開・人気指標 | nostalgic      | 条文一覧・法律一覧での表示     |
| 個人のええやんリスト     | 私的・学習記録 | osaka-kenpo D1 | ええやん一覧ページ、端末間同期 |
| ユーザーID (UUID)        | 識別子         | localStorage   | 個人データの紐付け             |

## 1. 全体ええやん（nostalgic）

### 既存機能をそのまま利用

nostalgic の like サービスが提供する機能：

- **toggle**: ええやん / 取り消し
- **get**: 条文ごとの合計数 + 自分がええやん済みか
- **batchGet**: 複数条文の合計数を一括取得（最大1000件）

### ID体系

条文ごとに nostalgic の like サービスIDを持つ。

```
フォーマット: osaka-kenpo-{category}-{law_name}-{article}
例: osaka-kenpo-jp-minpou-1
    osaka-kenpo-jp-minpou-132-2
    osaka-kenpo-foreign-german-grundgesetz-1
```

### API呼び出し

```typescript
// 条文ページ: ええやんトグル
GET https://api.nostalgic.llll-ll.com/api/like?action=toggle&id={id}

// 条文ページ: 状態取得（合計 + 自分のliked状態）
GET https://api.nostalgic.llll-ll.com/api/like?action=get&id={id}&format=json

// 条文一覧ページ: 一括取得
POST https://api.nostalgic.llll-ll.com/api/like?action=batchGet
Body: { "ids": ["osaka-kenpo-jp-minpou-1", "osaka-kenpo-jp-minpou-2", ...] }
```

### 注意事項

- nostalgic のユーザー識別は `SHA256(IP + UserAgent + 日付)` で日次リセット
- そのため「自分がええやん済みか」は当日のみ正確
- 個人の永続的な状態管理は osaka-kenpo D1 側で行う

## 2. 個人ええやん（osaka-kenpo D1）

### ユーザー識別

- 初回アクセス時にブラウザで UUID v4 を生成
- `localStorage` の `osaka-kenpo` キー内に `eeyanUserId` として保存
- 別端末で同期する場合は UUID を入力（QRコード等）

### D1 スキーマ

```sql
CREATE TABLE user_likes (
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  law_name TEXT NOT NULL,
  article TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, category, law_name, article)
);

CREATE INDEX idx_user_likes_user ON user_likes(user_id);
CREATE INDEX idx_user_likes_law ON user_likes(user_id, category, law_name);
```

### API ルート

`/api/eeyan` に実装済み。全て Edge Runtime で動作。

#### POST /api/eeyan — ええやんトグル

```typescript
// リクエスト
POST /api/eeyan
Content-Type: application/json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "category": "jp",
  "lawName": "minpou",
  "article": "1"
}

// レスポンス（追加した場合）
{ "success": true, "liked": true }

// レスポンス（削除した場合）
{ "success": true, "liked": false }
```

存在すれば削除、なければ追加のトグル動作。

#### GET /api/eeyan?userId={}&category={}&lawName={} — 法律ごとの個人ええやん一覧

```typescript
// リクエスト
GET /api/eeyan?userId=550e8400-...&category=jp&lawName=minpou

// レスポンス
{
  "success": true,
  "likes": ["1", "3", "132-2", "709"]
}
```

条文一覧ページで「自分がええやん済みか」を表示するために使用。

#### GET /api/eeyan?userId={} — 全法律横断のええやん一覧

```typescript
// リクエスト
GET /api/eeyan?userId=550e8400-...

// レスポンス
{
  "success": true,
  "likes": [
    { "category": "jp", "lawName": "minpou", "article": "1", "createdAt": "2026-02-09T10:30:00Z" },
    { "category": "jp", "lawName": "minpou", "article": "709", "createdAt": "2026-02-09T10:35:00Z" },
    { "category": "jp", "lawName": "keihou", "article": "199", "createdAt": "2026-02-09T11:00:00Z" }
  ]
}
```

「ええやんした一覧」ページで使用。

## 3. UI

### 条文ページ（既存のええやんボタン改修）

```
┌────────────────────┐
│ ❤ ええやん  42     │  ← 全体カウント（nostalgic）
└────────────────────┘     ボタンの色で個人のええやん状態を表示（osaka-kenpo D1）
```

- クリック時: nostalgic toggle + osaka-kenpo D1 toggle を並行呼び出し
- 初期表示: nostalgic get（全体カウント）+ localStorage の user_id で D1 から個人状態取得

### 条文一覧ページ

各条文カードに表示：

```
┌─────────────────────────────────────┐
│ 第1条  ○○の原則           ❤ 42    │  ← 全体ええやん数（nostalgic batchGet）
│                            ★      │  ← 自分がええやん済み（osaka-kenpo D1）
└─────────────────────────────────────┘
```

- 全体カウント: nostalgic batchGet で法律内の全条文分を一括取得
- 個人状態: osaka-kenpo `/api/eeyan?userId=...&category=...&lawName=...` で一括取得

### 法律一覧ページ（トップ）

各法律カードにトータルええやん数を表示：

```
┌─────────────────────────┐
│ 民法                    │
│ 1273条  ❤ 2,847        │  ← 法律全体のええやんトータル
└─────────────────────────┘
```

- 法律ごとの合計: nostalgic batchGet で全条文のカウントを取得し、合算
- キャッシュ: 毎回全条文を batchGet するのはコストが高いため、合計値のキャッシュ戦略が必要（後述）

### ええやんした一覧ページ（実装済み）

`/eeyan` に個人のええやん一覧 + 端末間同期の UI を実装済み。

```
┌─────────────────────────────────────────────┐
│  わたしのええやん（12件）                     │
├─────────────────────────────────────────────┤
│                                             │
│  ■ 民法                                    │
│  ├ 第1条  私権の享有             2026-02-09 │
│  ├ 第709条 不法行為による損害賠償  2026-02-08 │
│  └ 第132条の2  ○○              2026-02-07 │
│                                             │
│  ■ 刑法                                    │
│  └ 第199条 殺人                  2026-02-06 │
│                                             │
├─────────────────────────────────────────────┤
│  🔗 べつの端末でも使いたいとき               │
│                                             │
│  あんたのID: 550e8400-e29b-41d4-...  [コピー]│
│                                             │
│  ┌─────────┐                               │
│  │ QRコード │  ← 別端末のカメラで読み取り    │
│  │         │                               │
│  └─────────┘                               │
│                                             │
│  べつの端末のIDを入力: [____________] [同期] │
│                                             │
│  ⚠️ 同期すると、今の端末のええやんは          │
│    入力したIDのものに置き換わるで             │
│                                             │
└─────────────────────────────────────────────┘
```

- データソース: osaka-kenpo `/api/eeyan?userId=...`
- 法律名の表示には `lawsMetadata` を使用
- 条文タイトルは D1 articles テーブルから取得
- 端末間同期の UI はページ下部にまとめる（メイン用途はええやん一覧の閲覧）

## 4. 端末間同期

### `/eeyan` ページ内の同期セクション

ええやん一覧ページの下部に同期 UI を配置。専用の設定ページは設けない。

### 同期方法

1. **QRコード表示**: 自分の UUID をQRコード化して表示。別端末のカメラで読み取り
2. **ID コピー**: UUID をクリップボードにコピー。メモやメッセージで別端末に送る
3. **ID 入力**: 別端末の UUID を手動入力して同期

### フロー

```
端末A (UUID生成済み)
  └→ /eeyan ページ下部でQRコード表示 or IDコピー
        │
        ▼
端末B (QRコード読み取り or ID入力)
  └→ localStorage に UUID を保存
  └→ 以降、同じ user_id で API 呼び出し
```

### 注意事項

- UUID を知っていれば誰でもそのユーザーのええやんリストを閲覧可能
- 法律の学習ブックマークという性質上、秘匿性の要件は低い
- 認証は導入しない（シンプルさ優先）

## 5. パフォーマンス考慮

### 法律一覧のトータルええやん数

民法1,273条分を毎回 batchGet するのは非効率。対応策：

- **方針**: 条文一覧ページ表示時に batchGet した結果をクライアント側でキャッシュ（sessionStorage 等）
- **法律一覧ページ**: 初回は nostalgic batchGet を法律ごとに実行し合算。結果を短時間キャッシュ
- **リアルタイム性**: 厳密な即時反映は不要。数分〜数十分の遅延は許容

### nostalgic batchGet の呼び出し回数

- 1回のリクエストで最大1000件
- 民法（1,273条）→ 2回のリクエスト
- その他の法律 → 1回で収まる
- 法律一覧ページでは全法律分 → 8,000条 ÷ 1,000 = 8回程度

### osaka-kenpo D1 の負荷

- 個人ええやんの取得は user_id + law 単位のインデックス付きクエリ
- ユーザー数が限定的なサイトのため、D1 の無料枠内で十分

## 6. nostalgic like サービスの初期登録

✅ **実装完了（2026-02-09）**

8,702条文分の like サービスを nostalgic に登録済み。

```bash
# 一括登録スクリプト
node scripts/tools/register-nostalgic-likes.js --token=YOUR_TOKEN

# ドライラン（登録前の確認）
node scripts/tools/register-nostalgic-likes.js --token=YOUR_TOKEN --dry-run

# 特定カテゴリ・法律のみ登録
node scripts/tools/register-nostalgic-likes.js --token=YOUR_TOKEN --category=jp --law=minpou
```

登録された ID は命名規則 `osaka-kenpo-{category}-{law}-{article}` から算出可能。

## 7. 実装状況

### ✅ 完了した機能（2026-02-09）

1. **✅ osaka-kenpo D1 スキーマ追加**: `user_likes` テーブル
2. **✅ osaka-kenpo API ルート実装**: `/api/eeyan`
3. **✅ nostalgic like サービス一括登録**: 全8,702条文
4. **✅ LikeButton 改修**: nostalgic + osaka-kenpo D1 の二重呼び出し
5. **✅ 条文一覧ページ**: ええやん数表示（ArticleListWithEeyan）
6. **✅ 法律一覧ページ**: トータルええやん数表示（LawCardWithEeyan）
7. **✅ ええやん一覧ページ**: `/eeyan` 実装済み
8. **✅ 端末間同期**: `/eeyan` ページ内にQRコード同期セクション

### 実装ファイル

- **API**: `src/app/api/eeyan/route.ts`
- **ページ**: `src/app/eeyan/page.tsx`
- **コンポーネント**:
  - `src/app/components/LikeButton.tsx`
  - `src/app/components/ArticleListWithEeyan.tsx`
  - `src/app/components/LawCardWithEeyan.tsx`
- **ユーティリティ**: `src/lib/eeyan.ts`
- **スキーマ**: `db/schema.sql`
- **登録スクリプト**: `scripts/tools/register-nostalgic-likes.js`
