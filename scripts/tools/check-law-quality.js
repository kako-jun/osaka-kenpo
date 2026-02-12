#!/usr/bin/env node

/**
 * 法律条文の詳細品質チェックスクリプト
 *
 * ハルシネーション、ペルソナ一貫性、文章品質などを包括的にチェック
 *
 * 使い方:
 *   node scripts/tools/check-law-quality.js <category> <law-id>
 *
 * 例:
 *   node scripts/tools/check-law-quality.js jp minpou
 *   node scripts/tools/check-law-quality.js jp constitution
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../src/data/laws');
const REPORT_DIR = path.join(__dirname, '../../reports');

/**
 * 使用方法を表示
 */
function showUsage() {
  console.log(`
使い方:
  node scripts/tools/check-law-quality.js <category> <law-id>

カテゴリ:
  jp          - 日本現行法
  jp_hist     - 日本歴史法
  world       - 外国現行法
  world_hist  - 外国歴史法
  treaty      - 国際条約

例:
  node scripts/tools/check-law-quality.js jp minpou
  node scripts/tools/check-law-quality.js jp constitution
  node scripts/tools/check-law-quality.js world german_basic_law
`);
  process.exit(1);
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    showUsage();
  }

  const [category, lawId] = args;
  const lawDir = path.join(DATA_DIR, category, lawId);

  if (!fs.existsSync(lawDir)) {
    console.error(`❌ エラー: ディレクトリが見つかりません: ${lawDir}`);
    process.exit(1);
  }

  console.log('================================================================================');
  console.log(`📋 法律品質チェック: ${category} / ${lawId}`);
  console.log('================================================================================\n');
  console.log(`📂 対象ディレクトリ: ${lawDir}`);
  console.log(`📝 チェックプロンプト生成中...\n`);

  // レポートディレクトリ作成
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // プロンプトファイル生成
  const promptFile = path.join(REPORT_DIR, `quality-check-prompt-${category}-${lawId}.txt`);
  const resultFile = path.join(REPORT_DIR, `result-${category}-${lawId}.json`);

  const prompt = generateDetailedCheckPrompt(category, lawId, lawDir, resultFile);
  fs.writeFileSync(promptFile, prompt);

  console.log(`✅ プロンプトファイル生成: ${promptFile}`);
  console.log(`📊 結果ファイル: ${resultFile}\n`);
  console.log('================================================================================');
  console.log('🚀 次のステップ');
  console.log('================================================================================\n');
  console.log(`以下のコマンドで、OpenCodeのTask toolを使ってチェックを実行してください:\n`);
  console.log(`  Task tool (subagent_type: "general")`);
  console.log(`  Prompt: 以下のファイルの内容を実行してください\n`);
  console.log(`  ${promptFile}\n`);
  console.log(`結果は ${resultFile} に保存されます。\n`);
}

/**
 * 詳細チェック用プロンプト生成
 */
function generateDetailedCheckPrompt(category, lawId, lawDir, resultFile) {
  return `【タスク】法律条文の詳細品質チェック

以下の法律について、全条文の commentary（標準語解説）と commentaryOsaka（大阪弁解説）を詳細にチェックしてください。

【対象法律】
- カテゴリ: ${category}
- 法律ID: ${lawId}
- ディレクトリ: ${lawDir}

【詳細チェック項目】

## 1. ハルシネーション・事実誤認 ⚠️
- 存在しない条文への言及
- 架空の判例・事例
- 根拠のない数字や統計
- 条文内容と解説の不一致

## 2. 文章の長さの異常 📏
- **極端に短い**: 1-2文、50文字未満
- **極端に長い**: 不必要な繰り返し、冗長
- **重複**: 同じことを二回以上言っている

## 3. 大阪弁ペルソナの一貫性 👩‍🏫
- **春日歩先生らしさ**: 優しい女性教師の口調か
- **和歌山弁ベース**: 「〜やで」「〜やん」「〜けど」
- **禁止表現（高重要度）**: 男性表現（わい、わいら、おんどれ）
- **禁止表現（中重要度）**: 商人表現（利益、儲け、商売、投資）

## 4. 例え話の品質 💬
- **登場人物名**: 
  - ✅ 良い例: 太郎さん、花子さん、A社、B銀行、Aさん、Bさん
  - ❌ 悪い例: HHH、XXX、甲、乙、丙
- **具体性**: 「例えばな、」で始まる具体例があるか
- **妥当性**: 条文内容と例え話が対応しているか

## 5. 統一感 🎨
- **構成**: 他の条文と同じような構成か（2-3段落程度）
- **トーン**: 他の条文と同じような口調か
- **詳細度**: 他の条文と同程度の詳細さか（300文字以上推奨）

## 6. その他の気になる点 🔍
- 誤字脱字
- 不自然な日本語
- 誤解を招く表現
- 差別的表現

【重要度の定義】

- **high（高重要度）**: ハルシネーション、重大な事実誤認、男性表現の使用
- **medium（中重要度）**: 商人表現、変な登場人物名、重大な統一感の欠如
- **low（低重要度）**: 段落不足、和歌山弁らしさ不足、誤字脱字

【出力形式】

最後に、以下のJSON形式でファイルに保存してください：
ファイルパス: ${resultFile}

{
  "lawId": "${lawId}",
  "categoryName": "${category}",
  "totalArticles": (総条文数),
  "checkedArticles": (チェックした条文数),
  "issuesFound": (問題が見つかった条文数),
  "totalIssues": (問題の総数),
  "checkDate": "YYYY-MM-DD",
  "issues": [
    {
      "articleNumber": "条文番号",
      "filePath": "YAMLファイルの絶対パス",
      "type": "factual_error | hallucination | logical_inconsistency | inappropriate_expression | length_issue | persona_inconsistency | character_name_issue | tone_inconsistency | other",
      "severity": "high | medium | low",
      "field": "commentary | commentaryOsaka",
      "description": "問題の詳細説明（具体的に、該当箇所を引用）",
      "suggestion": "修正案（あれば）"
    }
  ]
}

【重要な指示】

1. 全条文を順番にチェックしてください
2. **小さな問題も全て報告してください**（軽微なものも含む）
3. 削除条文（deleted: true）はスキップしてください
4. 問題がない条文は記録不要です
5. チェック完了後、必ず上記JSON形式で結果を保存してください
6. 各問題について、該当箇所を具体的に引用してください
`.trim();
}

main().catch((error) => {
  console.error('❌ エラー:', error);
  process.exit(1);
});
