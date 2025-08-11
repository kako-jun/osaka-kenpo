# 条文追加作業手順書

## 事前準備

1. **プロジェクト確認**
   ```bash
   cd /path/to/osaka-kenpo
   git status  # 作業前の状態確認
   ```

2. **開発サーバー起動**
   ```bash
   npm run dev
   ```

## 既存条文の見直し手順

**優先実施**: 既存条文のガイドライン準拠チェックを最初に行ってください。

### 見直し対象の確認
1. 原文が信頼できる原典から取得されているか（`.claude/source-guidelines.md`参照）
2. 大阪弁翻訳が春日歩先生の口調になっているか（`.claude/kasuga-ayumu-style.md`参照）
3. 解説が教育的で親しみやすい内容になっているか

### 見直し手順
1. 既存JSONファイルを開く
2. 各フィールドをガイドラインと照合
3. 必要に応じて原典調査からやり直し
4. 大阪弁翻訳・解説を大阪先生風に修正
5. 品質チェック後にファイル更新

## 新しい条文追加手順

### Step 1: データファイルの作成

#### 1.1 対象法律の確認
- `src/data/laws/` 以下の適切なカテゴリを確認
- 既存の法律フォルダが存在するか確認

#### 1.2 条文JSONファイル作成
```bash
# 例：十七条憲法の第2条を追加する場合
touch src/data/laws/jp_old/jushichijo_kenpo/2.json

# 既存条文の見直し・修正の場合
# ファイルは既に存在するため、内容を直接編集
```

#### 1.3 JSONデータの記述
テンプレート：
```json
{
  "article": 2,
  "title": "第二条 [タイトル]",
  "original": "[原文をここに記述]",
  "osaka": "[大阪弁翻訳をここに記述]",
  "commentary": "[解説をここに記述]"
}
```

**記述時の注意点**：
- `article`: 条文番号（数値）
- `title`: 条文のタイトル
- `original`: 改行は `\\n` でエスケープ。`.claude/source-guidelines.md` に従って信頼できる原典から取得
- `osaka`: `.claude/kasuga-ayumu-style.md` に従った大阪先生風翻訳
- `commentary`: 歴史的背景や意義を大阪弁で解説

**ガイドライン遵守チェック**：
1. 原文が `.claude/source-guidelines.md` の原典取得基準を満たしているか
2. 大阪弁翻訳が `.claude/kasuga-ayumu-style.md` の春日歩先生の口調になっているか
3. 解説が教育的で親しみやすい内容になっているか

### Step 2: UI対応確認

#### 2.1 法律名マッピング確認
`src/app/law/[law_category]/[law]/[article]/page.tsx` の `lawNameMapping` に法律が登録されているか確認：

```typescript
const lawNameMapping: { [key: string]: string } = {
  // ...
  jushichijo_kenpo: '十七条の憲法',
  // ...
};
```

#### 2.2 URL動作確認
ブラウザで以下のURLにアクセス：
```
http://localhost:3000/law/{law_category}/{law}/{article}
```

例：`http://localhost:3000/law/jp_old/jushichijo_kenpo/2`

### Step 3: 品質チェック

#### 3.1 表示確認
- [ ] 原文が正しく表示される
- [ ] 大阪弁翻訳が正しく表示される
- [ ] 解説が表示される
- [ ] 表示モード切り替えが動作する

#### 3.2 内容品質チェック
- [ ] 大阪弁翻訳が自然で親しみやすい
- [ ] 解説が分かりやすく興味深い
- [ ] 歴史的背景が含まれている
- [ ] 誤字脱字がない

#### 3.3 技術的チェック
- [ ] JSONフォーマットが正しい
- [ ] APIエンドポイントが正常に動作
- [ ] ファイル名と条文番号が一致
- [ ] 既存機能に影響がない

### Step 4: 複数条文の一括追加

#### 4.1 作業効率化のためのスクリプト例
```bash
#!/bin/bash
# 十七条憲法の条文2-17を一括作成

for i in {2..17}; do
    touch "src/data/laws/jp_old/jushichijo_kenpo/${i}.json"
    echo "Created ${i}.json"
done
```

#### 4.2 テンプレートファイル作成
```json
{
  "article": 0,
  "title": "第X条 [要記入]",
  "original": "[要記入]",
  "osaka": "[要記入]", 
  "commentary": "[要記入]"
}
```

### Step 5: 完成確認とコミット

#### 5.1 全体動作確認
```bash
npm run build  # ビルドエラーがないか確認
npm run dev    # 開発サーバーでの動作確認
```

#### 5.2 Git管理
```bash
git add .
git status
git commit -m "feat: add [法律名] article [条文番号]"
```

## トラブルシューティング

### よくあるエラー

#### 1. JSONフォーマットエラー
**症状**: APIエラーまたは表示されない
**原因**: JSON記法の間違い
**解決**: JSONバリデーターでチェック

#### 2. 404エラー
**症状**: 条文ページが表示されない
**原因**: ファイルパスまたは名前の間違い
**解決**: ファイル名と条文番号の確認

#### 3. 表示モード切り替えが動作しない
**症状**: 原文と大阪弁の切り替えができない
**原因**: ViewModeContextの問題
**解決**: ブラウザの再読み込み

### 緊急時の対応

1. **作業中のファイルをバックアップ**
2. **Git stashで変更を退避**
   ```bash
   git stash
   ```
3. **直前のコミットに戻る**
   ```bash
   git reset --hard HEAD
   ```

## 効率化のコツ

1. **テンプレートの活用**: 同じ法律の条文は共通部分をコピペ
2. **バッチ処理**: 複数条文の一括作成スクリプト活用  
3. **翻訳の統一**: 用語集を作成して表現の一貫性を保つ
4. **段階的追加**: 1つずつ確認しながら追加して問題の早期発見

## 参考資料

- データ仕様書: `.claude/data-specification.md`
- アーキテクチャ設計: `.claude/architecture.md`
- プロジェクト要件: `CLAUDE.md`