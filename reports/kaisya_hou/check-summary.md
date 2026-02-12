# 会社法品質チェック - サマリー

## 範囲分割

### 第1-150条（総則・設立等）

- **条文数**: 153条
- **プロンプト**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/prompt-kaisya_hou-range1.txt`
- **結果**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range1.json`

### 第151-300条（株式・新株予約権等）

- **条文数**: 176条
- **プロンプト**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/prompt-kaisya_hou-range2.txt`
- **結果**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range2.json`

### 第301-450条（機関等）

- **条文数**: 176条
- **プロンプト**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/prompt-kaisya_hou-range3.txt`
- **結果**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range3.json`

### 第451-600条（計算・定款変更等）

- **条文数**: 151条
- **プロンプト**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/prompt-kaisya_hou-range4.txt`
- **結果**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range4.json`

### 第601-750条（組織変更・合併等）

- **条文数**: 158条
- **プロンプト**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/prompt-kaisya_hou-range5.txt`
- **結果**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range5.json`

### 第751-979条（社債・雑則等）

- **条文数**: 266条
- **プロンプト**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/prompt-kaisya_hou-range6.txt`
- **結果**: `/home/d131/repos/2025/osaka-kenpo/reports/kaisya_hou/result-kaisya_hou-range6.json`

## チェック手順

各範囲について、以下の手順で並列チェックを実行してください：

1. Task tool (subagent_type: "general") を使用
2. 各プロンプトファイルの内容を実行
3. 結果を対応するJSONファイルに保存
4. 全範囲完了後、結果を統合して修正を実施
