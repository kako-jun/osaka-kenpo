# 機能仕様書

> 最終更新: 2026-04-13
> 対象: ソースコードの実装に基づく実態記録

---

## 1. 大阪弁/原文切替（ViewMode）

### 概要

条文の表示を「大阪弁訳」と「原文」で切り替える機能。サイト全体で状態を共有する。

### 状態管理

**Context**: `ViewModeContext`（`src/app/context/ViewModeContext.tsx`）

```typescript
type ViewMode = 'original' | 'osaka';
```

Context は state と actions を分離して不要な再レンダーを防止している:

- `ViewModeContext`: `{ viewMode }` — 値を読む側（再レンダーあり）
- `ViewModeActionsContext`: `{ setViewMode }` — 値を変更する側（再レンダーなし）

**フック**:
| フック | 用途 |
|---|---|
| `useViewModeValue()` | viewMode の値だけが必要な場合 |
| `useViewModeActions()` | setViewMode だけが必要な場合 |
| `useViewMode()` | 両方が必要な場合（互換性用） |

### 永続化

`localStorage` の `osaka-kenpo.viewMode` に保存。ページリロードしても維持される。

初期化フロー:

1. デフォルト `'osaka'` で state 初期化
2. `useEffect` で `localStorage` から読み込み
3. `'osaka'` または `'original'` の場合のみ反映

### 切替操作

- 条文ページ（`ArticleClient.tsx`）でクリックまたはスペースキーで切替
- `toggleViewMode()` で `'osaka'` ↔ `'original'` をトグル

### 切替の影響範囲

ViewMode は条文ページ内のテキスト表示に影響する:

- `'osaka'`: `osakaText`, `commentaryOsaka`, `titleOsaka` を表示
- `'original'`: `originalText`, `commentary`, `title` を表示

## 2. ええやんシステム

詳細は `docs/eeyan-spec.md` を参照。ここでは概要のみ記載する。

### 概要

「ええやん」は「いいね」に相当する機能。2つの独立したバックエンドに二重登録する方式で動作する。

| バックエンド               | 役割                                 |
| -------------------------- | ------------------------------------ |
| Nostalgic API（外部）      | グローバルカウント（全ユーザー合計） |
| osaka-kenpo D1 API（内部） | ユーザー個人の記録                   |

### EeyanContext

`src/app/context/EeyanContext.tsx`

ええやん操作が発生したことをページ内の他コンポーネントに通知するための Context。

```typescript
interface EeyanContextType {
  revision: number; // ええやん操作のたびにインクリメント
  notifyEeyanChanged: () => void; // 操作後に呼び出す
}
```

フック:
| フック | 用途 |
|---|---|
| `useEeyanRevision()` | revision 値を取得（変更検知用） |
| `useNotifyEeyanChanged()` | notifyEeyanChanged 関数を取得 |

### ページ別動作

| ページ | コンポーネント         | データ取得                                                 |
| ------ | ---------------------- | ---------------------------------------------------------- |
| トップ | `LawCardWithEeyan`     | Nostalgic `sumByPrefix`（法律全体の合計）                  |
| 法律   | `ArticleListWithEeyan` | Nostalgic `batchGet` + D1 GET（条文別カウント + 個人状態） |
| 条文   | `LikeButton`           | Nostalgic `get` + D1 GET（単一カウント + 個人状態）        |
| /eeyan | `EeyanPage`            | D1 GET（全いいね一覧）                                     |

## 3. 閲覧数カウンター

### 概要

条文の閲覧数を複数の粒度で表示する機能。Nostalgic Counter API（Visit API）を使用する。

### 3.1 トップページの合計閲覧数

`TotalViewCounter`（`src/app/components/TotalViewCounter.tsx`）

トップページに「N回も読んでくれてありがとなー」として全条文の閲覧数合計を表示する。

**動作フロー**:

1. `sessionStorage` のキャッシュをチェック（TTL: 5分）
2. キャッシュがあればそれを表示
3. なければ Nostalgic Counter API の `sumByPrefix`（prefix: `osaka-kenpo-`）で全条文の合計を取得
4. 結果を `sessionStorage` にキャッシュ

**エラー時**: `0000` を表示（取得失敗時は初期値のまま）。

### 3.2 条文ページの閲覧数

`ArticleViewCounter`（`src/app/components/ArticleViewCounter.tsx`）

各条文ページに閲覧数を `EyeIcon` 付きで控えめに表示する。

```typescript
interface ArticleViewCounterProps {
  articleId: string;
  lawCategory: string;
  law: string;
}
```

**動作フロー**:

1. **インクリメント**（セッション内1回のみ）:
   - `sessionStorage` の `counter_incremented_{counterId}` をチェック
   - 未インクリメントなら Nostalgic Counter API の `increment` を呼び出し
   - `sessionStorage` にフラグを記録
2. **表示値取得**:
   - インクリメント直後はキャッシュを無視して最新値を取得
   - それ以外は `sessionStorage` のキャッシュをチェック（TTL: 5分）
   - Nostalgic Counter API の `get`（format: json）で取得
   - 結果を `sessionStorage` にキャッシュ

**エラー時**: 非表示（`null` を返す）。

### 3.3 法律ページの条文別閲覧数

法律ページの条文一覧で、各条文の閲覧数を Nostalgic Counter API の `batchGet` で一括取得して表示する。

### 3.4 法律カードの閲覧数合計

トップページの法律カードに、各法律の全条文閲覧数合計を `sumByPrefix` で取得して表示する。

### 3.5 共通基盤

- **Counter API ベースURL**: `NOSTALGIC_COUNTER_API_BASE`（`src/lib/eeyan.ts`）
- **sessionStorage 安全ラッパー**: `safeSessionGet` / `safeSessionSet` / `safeSessionRemove`（`src/lib/storage.ts`）
- **アイコン**: `EyeIcon`（`src/components/icons.tsx`）

## 4. OG 画像生成

### 概要

条文ページの SNS シェア時に表示される OG 画像を動的に生成する。

### API

`GET /api/article-image`（`src/app/api/article-image/route.tsx`）

Edge Runtime で `next/og` の `ImageResponse` を使用。

### パラメータ

| パラメータ | 必須 | 説明                                |
| ---------- | ---- | ----------------------------------- |
| `category` | 必須 | 法律カテゴリ                        |
| `law`      | 必須 | 法律ID                              |
| `article`  | 必須 | 条文番号                            |
| `width`    | 任意 | 画像幅（320〜1920、デフォルト1080） |

### 画像内容

- 背景色: `#FFF8DC`（クリーム色）
- フォント: Google Fonts の Klee One（手書き風日本語フォント）
- レイアウト:
  1. 法律名（茶色、中央寄せ）
  2. 条文タイトル（`#E94E77`、太字）
  3. 大阪弁原文セクション（白背景、ピンクボーダー）
  4. ワンポイント解説セクション（白背景、赤ボーダー）
  5. フッター「おおさかけんぽう - osaka-kenpo.llll-ll.com」
- 高さ: テキスト量から動的計算（最小400px）

### キャッシュ

```
Cache-Control: public, max-age=86400, s-maxage=604800
```

CDN キャッシュ 7日、ブラウザキャッシュ 1日。

### 使用箇所

条文ページの `generateMetadata()` で OG/Twitter メタデータの `images` に設定:

```typescript
const imageUrl = `/api/article-image?category=${law_category}&law=${law}&article=${article}`;
```

## 5. シェアボタン

### 概要

ページの URL や条文画像を SNS にシェアする機能。

### コンポーネント

`ShareButton`（`src/app/components/ShareButton.tsx`）

### シェアモード

条文ページでは2つのモードを選択可能:

1. **URL でシェア**: ページの URL を SNS に投稿
2. **画像でシェア**: 条文の OG 画像を SNS に投稿

条文ページ以外（`articleParams` が未指定）の場合は URL シェアのみ。

### 対応プラットフォーム

`src/app/components/share/sharePlatforms.ts` に定義:

| ID         | プラットフォーム   | URL テンプレート                                                    |
| ---------- | ------------------ | ------------------------------------------------------------------- |
| `x`        | X (Twitter)        | `https://x.com/intent/tweet?text={text}&url={url}`                  |
| `note`     | note               | `https://note.com/intent/post?url={url}&text={text}`                |
| `hatena`   | はてなブックマーク | `https://b.hatena.ne.jp/entry/panel/?url={url}&title={text}`        |
| `line`     | LINE               | `https://social-plugins.line.me/lineit/share?url={url}&text={text}` |
| `facebook` | Facebook           | `https://www.facebook.com/sharer/sharer.php?u={url}&quote={text}`   |
| `mypace`   | MY PACE            | `https://mypace.llll-ll.com/intent/post?text={text} {url}`          |

### 画像シェアの追加操作

- 「画像を別タブで開く」: `/api/article-image` URL を別タブで開く
- 「画像を保存」: `fetch` → `blob` → `<a download>` で PNG ダウンロード

### 表示位置

全ページの右上（`fixed top-20 right-4 z-10`）に「広めたる」ボタンとして配置。

## 6. QRコード同期（デバイス間同期）

詳細は `docs/eeyan-spec.md` のセクション9を参照。

### 概要

ログイン機構なしでデバイス間のええやん履歴を同期する仕組み。

### 同期方法

1. QRコード: `{origin}/eeyan?sync={userId}` を QRコード化して表示
2. ID コピー: UUID を `navigator.clipboard.writeText` でコピー

### 表示条件

`/eeyan` ページの下部に、`userId` が存在し `likes.length > 0` の場合のみ表示。

## 7. 条文一覧のページネーション

### 概要

100条を超える法律（民法1,273条等）で条文一覧を分割表示する。

### ロジック

`src/app/law/[law_category]/[law]/page.tsx` に実装。

1. 全条文を「通常条文」と「附則」に分類
2. 通常条文の最大条文番号から100条ごとのページ範囲を計算
3. `?page=N` でページを切り替え
4. `?page=suppl` で附則ページを表示

### ページ表示パターン

| 条件                            | 表示                             |
| ------------------------------- | -------------------------------- |
| 条文数 ≤ 100 & 章構成あり       | 章でグループ化して全条文表示     |
| 条文数 ≤ 100 & 章構成なし       | 全条文を一列で表示               |
| 条文数 > 100                    | 100条ごとにページネーション      |
| 附則あり & ページネーションなし | 通常条文の後に附則セクション表示 |
| 附則あり & ページネーションあり | 附則は `?page=suppl` で別ページ  |

### Pagination コンポーネント

`<Pagination>` コンポーネントがページ上下に表示される。

## 8. 条文ナビゲーション

### 概要

条文ページで前後の条文に移動する機能。

### 実装

`ArticleClient.tsx` + `useArticleNavigation` フック

- サーバーコンポーネントが全条文リスト `allArticles` を props で渡す
- クライアントコンポーネントが現在の条文のインデックスを計算し、前後の条文を特定
- `ArticleNavigationButtons` で左右の矢印ボタンを表示

### ナビゲーション手段

- 左右の矢印ボタン
- `ScrollAwareBackLink` で条文一覧への戻りリンク

## 9. 音声読み上げ

About ページに記載されている機能:

> 各条文には音声読み上げ機能が付いてるんや。原文は男性の声、大阪弁訳は女性の声。

推測: ブラウザの SpeechSynthesis API を使用していると考えられるが、今回読み込んだファイル群では該当コードを確認していない。

## 10. エラーバウンダリ

### 概要

`ErrorBoundary`（`src/components/ErrorBoundary.tsx`）がルートレイアウトで全体を囲み、ランタイムエラーをキャッチする。

### 配置

```tsx
// layout.tsx
<ErrorBoundary>
  <Header />
  <main>{children}</main>
  <Footer />
  <BackToTopButton />
</ErrorBoundary>
```
