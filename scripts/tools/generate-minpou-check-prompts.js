#!/usr/bin/env node

/**
 * 民法を範囲分割して品質チェックプロンプトを生成
 *
 * 5つの編に分割して、並列チェック可能にする
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_DIR = path.join(__dirname, '../../reports/minpou');

// 民法の編構成
const sections = [
  {
    name: '第1編-総則',
    id: 'section1',
    start: 1,
    end: 174,
    description: '総則（民法の基本原則、人、法人、物、法律行為等）',
  },
  {
    name: '第2編-物権',
    id: 'section2',
    start: 175,
    end: 398,
    description: '物権（所有権、地上権、抵当権等）',
  },
  {
    name: '第3編-債権',
    id: 'section3',
    start: 399,
    end: 724,
    description: '債権（契約、不法行為、損害賠償等）',
  },
  {
    name: '第4編-親族',
    id: 'section4',
    start: 725,
    end: 881,
    description: '親族（婚姻、親子、親権、後見等）',
  },
  {
    name: '第5編-相続',
    id: 'section5',
    start: 882,
    end: 1050,
    description: '相続（相続人、相続分、遺言、遺留分等）',
  },
];

/**
 * プロンプト生成
 */
function generatePrompt(section) {
  const lawDir = '/home/d131/repos/2025/osaka-kenpo/src/data/laws/jp/minpou';
  const resultFile = path.join(REPORT_DIR, `result-minpou-${section.id}.json`);

  return `【タスク】民法の品質チェック - ${section.name}

以下の範囲の民法条文について、全条文の commentary（標準語解説）と commentaryOsaka（大阪弁解説）を詳細にチェックしてください。

【対象範囲】
- 法律: 民法
- 範囲: ${section.name}（第${section.start}条〜第${section.end}条）
- 説明: ${section.description}
- ディレクトリ: ${lawDir}

【重要】枝番条文について
- 枝番条文（例: 132-2.yaml, 398-22.yaml）も必ずチェックしてください
- ファイル名パターン: \`数字.yaml\` および \`数字-数字.yaml\`

【詳細チェック項目】（Issue #31の教訓を反映）

## 1. ハルシネーション・事実誤認（Critical/High）⚠️

### 1.1 条文の内容
- [ ] 条文の内容を正確に説明しているか
- [ ] **原文の条文番号と解説の条文番号が一致しているか**
- [ ] **解説が別の条文の内容になっていないか**（条文番号取り違え）
- [ ] 条文の解釈が一般的な通説・判例と矛盾していないか
- [ ] 存在しない条文や条項への言及がないか

### 1.2 判例・学説
- [ ] 架空の判例を語っていないか
- [ ] 最高裁判例、重要判例を正確に引用しているか
- [ ] 通説と異なる見解を通説として説明していないか

### 1.3 制度の歴史・経緯
- [ ] **法改正の時期を間違えていないか**
- [ ] **歴史的な年号・日付を正確に記載しているか**
- [ ] **改正の理由や背景を正確に説明しているか**
- [ ] 存在しない法改正を語っていないか

### 1.4 数字・統計
- [ ] 根拠のない数字や統計を使っていないか
- [ ] 時効期間、金額、期間などを正確に説明しているか

## 2. 大阪弁ペルソナの一貫性（High/Medium）👩‍🏫

### 2.1 禁止表現（High - ペルソナ崩壊）
- [ ] **男性表現**: わい、わいら、おんどれ、わし → 使用厳禁
- [ ] **一人称**: 基本的に使わない（使う場合は「わたし」のみ）

### 2.2 禁止表現（Medium - 教育者に不適切）
- [ ] **商人表現**: 投資、利益、儲け、商売、コスト、リターン、採算
  - 置き換え例: 「投資」→「力を注ぐ」、「利益」→「良いこと」「メリット」

### 2.3 口調の一貫性
- [ ] 優しい女性教師の口調か
- [ ] 和歌山弁ベースの関西弁か（「〜やで」「〜やん」「〜けど」）

## 3. 例え話の品質（Medium）💬
- [ ] **登場人物名**: A/B/太郎/花子は良、HHH/XXXなど変な名前はNG
- [ ] **具体性**: 「例えばな、」で始まる具体例があるか
- [ ] **妥当性**: 条文内容と例え話が対応しているか

## 4. 文章の品質（Medium/Low）📏
- [ ] 極端に短い（1-2文、50文字未満）
- [ ] 極端に長い（不必要な繰り返し、冗長）
- [ ] 重複（同じことを二回以上言っている）
- [ ] 誤字脱字

## 5. 統一感（Low）🎨
- [ ] 他の条文と同じような構成か（2-3段落程度）
- [ ] 他の条文と同じような口調か
- [ ] 他の条文と同程度の詳細さか（300文字以上推奨）

【重大度の定義】

- **Critical（最重要）**: 条文番号取り違え、歴史的事実誤記、数字の誤り
- **High（重大）**: ハルシネーション、男性表現（ペルソナ崩壊）
- **Medium（中程度）**: 商人表現、変な登場人物名
- **Low（軽微）**: 誤字脱字、日付表記不統一、統一感の軽微な欠如

【出力形式】

チェック完了後、以下のJSON形式でファイルに保存してください：
ファイルパス: ${resultFile}

\`\`\`json
{
  "lawId": "minpou",
  "section": "${section.id}",
  "sectionName": "${section.name}",
  "range": "${section.start}-${section.end}",
  "totalArticles": (この範囲の総条文数),
  "checkedArticles": (チェックした条文数),
  "issuesFound": (問題が見つかった条文数),
  "totalIssues": (問題の総数),
  "checkDate": "YYYY-MM-DD",
  "issues": [
    {
      "articleNumber": "条文番号",
      "filePath": "YAMLファイルの相対パス（src/data/laws/jp/minpou/から）",
      "type": "factual_error | hallucination | article_number_mismatch | historical_error | number_error | male_expression | merchant_expression | character_name_issue | length_issue | tone_inconsistency | typo | other",
      "severity": "critical | high | medium | low",
      "field": "commentary | commentaryOsaka",
      "description": "問題の詳細説明（具体的に、該当箇所を引用）",
      "suggestion": "修正案（あれば）"
    }
  ]
}
\`\`\`

【重要な指示】

1. **範囲内の全条文**（第${section.start}条〜第${section.end}条）を順番にチェックしてください
2. **枝番条文も必ずチェック**してください（例: 117-2.yaml, 132-2.yaml等）
3. **小さな問題も全て報告**してください（軽微なものも含む）
4. 削除条文（deleted: true）はスキップしてください
5. 問題がない条文は記録不要です
6. チェック完了後、必ず上記JSON形式で結果を${resultFile}に保存してください
7. 各問題について、該当箇所を具体的に引用してください

【チェック手順】

1. 対象範囲の条文ファイル（${section.start}.yaml 〜 ${section.end}.yaml および枝番）を特定
2. 各YAMLファイルを読み込み、commentary と commentaryOsaka をチェック
3. 上記チェック項目に照らして問題を検出
4. 問題を重大度別に分類
5. JSON形式で結果を保存

【成功基準】

- [ ] 範囲内の全条文をチェック完了
- [ ] 枝番条文も漏れなくチェック
- [ ] JSON形式で結果を正しく保存
- [ ] 各問題に具体的な引用と説明がある`;
}

/**
 * メイン処理
 */
function main() {
  console.log('================================================================================');
  console.log('📋 民法品質チェック - プロンプト生成');
  console.log('================================================================================\n');

  // レポートディレクトリ作成
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  console.log(`📂 出力ディレクトリ: ${REPORT_DIR}\n`);
  console.log('🔄 5つの編に分割してプロンプトを生成します...\n');

  const promptFiles = [];

  sections.forEach((section, index) => {
    const promptFile = path.join(REPORT_DIR, `prompt-minpou-${section.id}.txt`);
    const prompt = generatePrompt(section);
    fs.writeFileSync(promptFile, prompt);
    promptFiles.push(promptFile);

    console.log(`✅ [${index + 1}/5] ${section.name}`);
    console.log(`   範囲: 第${section.start}条〜第${section.end}条`);
    console.log(`   プロンプト: ${promptFile}`);
    console.log(`   結果: ${REPORT_DIR}/result-minpou-${section.id}.json\n`);
  });

  console.log('================================================================================');
  console.log('🚀 次のステップ');
  console.log('================================================================================\n');
  console.log('以下の5つのTask toolを**並列実行**してください：\n');

  sections.forEach((section, index) => {
    console.log(`【Task ${index + 1}】${section.name}`);
    console.log(`  subagent_type: "general"`);
    console.log(`  description: "民法${section.name}の品質チェック"`);
    console.log(`  prompt: "${promptFiles[index]}の内容を実行してください"\n`);
  });

  console.log('================================================================================');
  console.log('💡 ヒント');
  console.log('================================================================================\n');
  console.log('- 5つのTask toolを1つのメッセージで同時に呼び出すと並列実行されます');
  console.log('- 各タスクは独立しているため、並列実行が可能です');
  console.log('- 完了後、5つのJSONファイルが生成されます\n');
}

main();
