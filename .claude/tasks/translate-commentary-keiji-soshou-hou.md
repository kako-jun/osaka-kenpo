# 刑事訴訟法 commentaryOsaka 追加タスク

## タスク概要

刑事訴訟法のcommentaryOsakaが空の条文に解説を追加してください。

## 対象範囲

- **法律**: 刑事訴訟法
- **ファイルパス**: `src/data/laws/jp/keiji_soshou_hou/`
- **対象条文**: commentaryOsakaが空の条文（192条）

## 翻訳スタイル

詳細は `.claude/guides/translation-style-guide.md` を参照。

### 基本原則

1. **原文忠実性**: 法的意味を変更しない
2. **口調**: 女性的な関西弁（優しい教師風）
3. **禁止事項**:
   - 「わい」「わいら」「おんどれ」などの男性口調
   - 「知らんけど」の乱用
   - キャラクター名・作品名の言及

### 解説の構成

commentaryOsakaは以下の構成で3〜5文程度：

1. **導入**: 「これは〜〜についての決まりやねん」
2. **詳細**: 具体的な内容を大阪弁で説明
3. **例え**: 身近な例を使って補足説明
4. **結び**: なぜこの規定が必要か、どんな意味があるか

### 文字数

**150文字以上**が必要（品質基準）。

## 作業手順

### Step 1: 対象ファイルを特定

以下のコマンドでcommentaryOsakaが空のファイルを確認：

```bash
node -e "
const fs = require('fs');
const yaml = require('js-yaml');
const path = 'src/data/laws/jp/keiji_soshou_hou';
const files = fs.readdirSync(path).filter(f => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

const empty = [];
files.forEach(file => {
  const content = fs.readFileSync(path + '/' + file, 'utf8');
  const data = yaml.load(content);
  if (!data.commentaryOsaka || data.commentaryOsaka.length === 0) {
    if (!data.isDeleted) {
      empty.push(file);
    }
  }
});
console.log('空のファイル数:', empty.length);
console.log(empty.slice(0, 20).join('\\n'));
"
```

### Step 2: 翻訳の実行

各YAMLファイルの `commentaryOsaka` フィールドに解説を追加：

```yaml
commentaryOsaka:
  - （解説文1）
  - （解説文2）
  - （解説文3）
```

### Step 3: 品質チェック

翻訳完了後、以下を確認：

```bash
node scripts/tools/check-commentary-quality.cjs
```

エラーが出た場合は修正して再チェック。

### Step 4: コミット

進捗に応じてコミット：

```bash
git add src/data/laws/jp/keiji_soshou_hou/
git commit -m "feat: 刑事訴訟法のcommentaryOsakaを追加（XX条）"
```

## 注意事項

1. **原文の確認**: 必ず `originalText` を読んでから翻訳
2. **osakaText参照**: 既存の `osakaText` と矛盾しないように
3. **commentary参照**: `commentary` の内容を大阪弁に翻訳＋α
4. **削除条文**: `isDeleted: true` のものはスキップ

## 例（参考）

**原文（第110条）**:

```
差押状、記録命令付差押状又は捜索状は、処分を受ける者にこれを示さなければならない。
```

**commentaryOsaka**:

```yaml
commentaryOsaka:
  - これ重要やで。警察が「家宅捜索や！」って入ってくるとき、必ず書類を見せなあかんねん。これを「令状」っていうんや。裁判官が「証拠隠滅の恐れがあるから捜索してええで」って許可した書類や。
  - 見せへんと違法やから、その証拠は裁判で使えへんくなるで。「いきなり家に入ってきて勝手に物持って行った」って言われたら、警察も困るやろ。だからちゃんと「これ見て、裁判官が許可してるんで」って見せるんや。
  - 家宅捜索って人権に関わる大事な問題やから、きちんと手続きを守らなあかん。令状見せへんかったら、容疑者も弁護士さんも「違法や！その証拠使うな！」って言えるんや。これが個人の権利を守る仕組みになってるんやで。
```

## 進捗報告

完了したら、以下を報告してください：

1. 翻訳した条文数
2. 残りの条文数
3. 品質チェックの結果
4. 特記すべき問題点（あれば）

---

では、作業を開始してください。
