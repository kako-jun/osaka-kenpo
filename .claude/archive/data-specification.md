# データ仕様書

## YAML + Zodによる型安全データ構造

### 個別条文ファイル (`{条文番号}.yaml`)

**重要**: 2025年8月時点で全てYAML形式 + Zod検証に移行完了

各条文は以下の構造を持つ：

```yaml
article: 1
title: '第一条 和を以て貴しとなす'
titleOsaka: '第一条 みんな仲良うしよな' # optional
originalText:
  - '和を以て貴しとなし、忤ふること無きを宗とせよ'
  - '人皆党あり、また達れる者少し'
osakaText:
  - '和を一番大切にして、喧嘩はせんとこな'
  - 'みんな仲間うちの考えに固まってしまって、物分かりのええ人は少ないんや'
commentary:
  - '十七条憲法の最も有名な条文で、聖徳太子の政治哲学の根幹を表しています'
  - '「和」の精神は現代日本社会の基盤となる価値観として受け継がれています'
commentaryOsaka: # optional
  - '十七条憲法で一番有名な条文やで'
  - '「和」の考え方は今の日本人の心にも残ってるんやな'
```

#### Zodスキーマによる検証

```typescript
export const ArticleSchema = z.object({
  article: z.number().int().positive(),
  title: z.string(),
  titleOsaka: z.string().optional(),
  originalText: z.array(z.string().min(1)).min(1, '原文は必須です'),
  osakaText: z.array(z.string().min(1)).min(1, '大阪弁翻訳は必須です'),
  commentary: z.array(z.string().min(1)).min(1, '解説は必須です'),
  commentaryOsaka: z.array(z.string().min(1)).optional(),
});
```

### メタデータファイル構造

#### 法律メタデータ (`law-metadata.yaml`)

```yaml
name: '日本国憲法'
year: 1946
source: '官報'
description: '昭和21年（1946年）11月3日公布、昭和22年（1947年）5月3日施行'
links: # optional
  - text: 'e-Gov法令検索 - 日本国憲法'
    url: 'https://elaws.e-gov.go.jp/document?lawid=321CONSTITUTION'
```

#### 有名条文データ (`famous-articles.yaml`)

```yaml
'1': '天皇の地位！'
'9': '平和主義！'
'13': '個人の尊重！'
```

#### 章構成データ (`chapters.yaml`)

```yaml
chapters:
  - chapter: 1
    title: '天皇'
    titleOsaka: '天皇はん'
    articles: [1, 2, 3, 4, 5, 6, 7, 8]
    description: '天皇の地位と役割について定めた章'
    descriptionOsaka: '天皇はんの立場とお仕事について決めた章やで'
```

## ディレクトリ構造

```
src/data/laws/
├── jp/                    # 日本・現行法
│   ├── constitution/      # 日本国憲法
│   ├── minpou/           # 民法
│   └── ...
├── jp_old/               # 日本・歴史法
│   ├── jushichijo_kenpo/ # 十七条憲法
│   ├── meiji_kenpo/      # 大日本帝国憲法
│   └── ...
├── foreign/              # 外国・現行法
│   ├── german_basic_law/ # ドイツ基本法
│   └── ...
├── foreign_old/          # 外国・歴史法
│   ├── hammurabi_code/   # ハンムラビ法典
│   └── ...
└── treaty/               # 条約
    ├── un_charter/       # 国連憲章
    └── ...
```

## 条文追加時の必須要件

1. **個別条文ファイル**: `{条文番号}.yaml`を作成
2. **Zodスキーマ準拠**: ArticleSchemaに従った構造
3. **配列形式**: 全てのテキストフィールドは配列で段落分け
4. **大阪弁翻訳**: 春日歩（大阪さん）風の親しみやすい口調
5. **解説追加**: 法的背景や意義を標準語で説明（大阪弁版は任意）
6. **ファイル命名**: 条文番号は数値のみ（例：`1.yaml`, `17.yaml`）
7. **型安全性**: 全データはZodスキーマによる実行時検証

## 品質基準

### 大阪弁翻訳

- 関西弁特有の語尾（「やで」「やろ」「せやから」など）を適切に使用
- 敬語は簡潔で親しみやすい形に
- 法律用語は理解しやすい言葉に置き換え

### 解説文

- 歴史的背景や制定理由を含む
- 現代との関連性を説明
- 読者の興味を引く表現を心がける

## APIエンドポイント対応

### 条文API

- URL: `/api/{law_category}/{law}/{article}`
- データソース: YAMLファイル + Zod検証
- レスポンス: 検証済みArticleDataを返却

### メタデータAPI

- URL: `/api/metadata/{law_category}/{law}/{metadata_type}`
- metadata_type: `law-metadata`, `famous-articles`, `chapters`
- 全体法律一覧: `/api/metadata/laws-metadata`
- データローダー: `src/lib/metadata-loader.ts`でクライアント側から利用

### データ読み込みフロー

1. ブラウザ → クライアントサイドloader
2. loader → fetch() → API Routes
3. API Routes → fs.readFileSync() → YAML読み込み
4. yaml.load() → Zodバリデーション → レスポンス
