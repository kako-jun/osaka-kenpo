# 翻訳品質チェック

指定された法律（または全法律）の翻訳品質をチェックし、問題を報告する。

## 引数

$ARGUMENTS

- 引数なし → 全法律を対象
- 法律名を指定 → その法律のみ（例: `minpou`, `keihou`）

## 実行するチェック

### 1. osakaText品質チェック

```bash
node scripts/tools/check-osaka-text-quality.cjs
```

検出する問題：

- 翻訳なし（空）
- 商人表現（投資、利益、儲け、商売、コスト等）
- 短すぎる（1文のみ、50文字未満）
- ワンパターン表現（「知らんけど」の乱用等）
- 男性表現（わい、わいら、おんどれ等）

### 2. commentaryOsaka品質チェック

```bash
node scripts/tools/check-commentary-quality.cjs
```

検出する問題：

- 解説なし（空）
- 商人表現
- 短すぎる（150文字未満）
- 例え話なし（「例えば」がない）

### 3. 統合品質チェック

```bash
node scripts/tools/check-combined-quality.cjs
```

### 4. ハルシネーションチェック（ある場合）

```bash
node scripts/tools/check-hallucination.js
```

## 報告フォーマット

法律ごとに以下を報告：

| 項目                | 結果                                          |
| ------------------- | --------------------------------------------- |
| 総条文数            | X条                                           |
| 高品質条文          | X条 (X%)                                      |
| osakaText問題       | X条（内訳：翻訳なしX、商人表現X、短すぎX...） |
| commentaryOsaka問題 | X条（内訳：解説なしX、商人表現X、短すぎX...） |

問題のある条文番号を重大度順にリスト化する。

## 対になるスキル

問題を修正するには `/fix-quality` を使用。
