#!/usr/bin/env node

/**
 * 全条文のハルシネーション・誤情報チェックスクリプト（Claude 4.5 Sonnet使用）
 *
 * このスクリプトは、Task toolを使ってサブエージェント（explore）で並列チェックを行います。
 *
 * 使い方:
 *   node scripts/tools/check-hallucination.js [category] [law]
 *
 * 例:
 *   node scripts/tools/check-hallucination.js              # 全法律をチェック
 *   node scripts/tools/check-hallucination.js current-jp   # 日本現行法のみ
 *   node scripts/tools/check-hallucination.js current-jp minpou  # 民法のみ
 *
 * 注意:
 *   - このスクリプトはプロンプト生成とディレクトリ情報提供のみを行います
 *   - 実際のチェックはOpenCode上でTask toolを使って並列実行してください
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../src/data/laws');
const REPORT_DIR = path.join(__dirname, '../../reports');
const REPORT_FILE = path.join(REPORT_DIR, 'hallucination-check-report.json');

// カテゴリ定義（実際のディレクトリ構造に基づく）
const CATEGORIES = {
  jp: {
    name: '日本現行法',
    path: 'jp',
  },
  jp_hist: {
    name: '日本歴史法',
    path: 'jp_hist',
  },
  world: {
    name: '外国現行法',
    path: 'world',
  },
  world_hist: {
    name: '外国歴史法',
    path: 'world_hist',
  },
  treaty: {
    name: '国際条約',
    path: 'treaty',
  },
};

/**
 * 全法律のリストを取得
 */
function getAllLaws() {
  const allLaws = [];

  for (const [categoryId, category] of Object.entries(CATEGORIES)) {
    const categoryDir = path.join(DATA_DIR, category.path);
    if (!fs.existsSync(categoryDir)) continue;

    const lawDirs = fs.readdirSync(categoryDir);
    for (const lawId of lawDirs) {
      const lawDir = path.join(categoryDir, lawId);
      const stat = fs.statSync(lawDir);
      if (stat.isDirectory()) {
        allLaws.push({
          categoryId,
          categoryName: category.name,
          lawId,
          lawDir,
        });
      }
    }
  }

  return allLaws;
}

/**
 * 指定された法律の全条文を取得
 */
function getArticles(lawDir) {
  const articles = [];
  const files = fs.readdirSync(lawDir);

  for (const file of files) {
    if (!file.endsWith('.yaml')) continue;

    const filePath = path.join(lawDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // 削除条文はスキップ
      if (data.deleted) continue;

      articles.push({
        file,
        articleNumber: data.articleNumber || file.replace('.yaml', ''),
        text: data.text || '',
        osakaText: data.osakaText || '',
        commentary: data.commentary || [],
        commentaryOsaka: data.commentaryOsaka || [],
        filePath,
      });
    } catch (error) {
      console.error(`❌ エラー: ${file}: ${error.message}`);
    }
  }

  return articles.sort((a, b) => {
    const aNum = parseArticleNumber(a.articleNumber);
    const bNum = parseArticleNumber(b.articleNumber);
    return aNum - bNum;
  });
}

/**
 * 条文番号を数値に変換（ソート用）
 */
function parseArticleNumber(articleNumber) {
  const match = articleNumber.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * チェック結果を初期化
 */
function initializeReport() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const report = {
    metadata: {
      startedAt: new Date().toISOString(),
      completedAt: null,
      version: '1.0.0',
    },
    summary: {
      totalArticles: 0,
      checkedArticles: 0,
      issuesFound: 0,
      categories: {},
    },
    issues: [],
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  return report;
}

/**
 * チェック結果を保存
 */
function saveReport(report) {
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
}

/**
 * 法律全体のチェック用プロンプトを生成（サブエージェント用）
 */
function generateLawCheckPrompt(lawInfo, articles) {
  const sampleArticles = articles.slice(0, 3); // 最初の3条文をサンプルとして表示

  return `
【タスク】法律条文のハルシネーション・誤情報チェック

以下の法律について、全条文の commentary（標準語解説）と commentaryOsaka（大阪弁解説）にハルシネーションや事実誤認がないかチェックしてください。

【対象法律】
- カテゴリ: ${lawInfo.categoryName}
- 法律ID: ${lawInfo.lawId}
- ディレクトリ: ${lawInfo.lawDir}
- 総条文数: ${articles.length}条

【チェック方法】
1. 各条文のYAMLファイルを読み込む
2. 以下の観点でチェック：
   - 事実関係の正確性（条文内容と解説の対応）
   - ハルシネーション（存在しない条文・判例への言及）
   - 論理的整合性（解説内の矛盾、例え話の妥当性）
   - 表現の適切性（商人表現、誤解を招く表現）
3. 問題がある場合のみ記録

【出力形式】
JSON形式で以下の構造で返してください：

{
  "lawId": "${lawInfo.lawId}",
  "categoryName": "${lawInfo.categoryName}",
  "totalArticles": ${articles.length},
  "checkedArticles": 0,
  "issuesFound": 0,
  "issues": [
    {
      "articleNumber": "条文番号",
      "filePath": "YAMLファイルのパス",
      "type": "factual_error | hallucination | logical_inconsistency | inappropriate_expression",
      "severity": "high | medium | low",
      "field": "commentary | commentaryOsaka",
      "description": "問題の詳細説明",
      "suggestion": "修正案（あれば）"
    }
  ]
}

【サンプル条文】（最初の3条文）
${sampleArticles
  .map(
    (a) => `
第${a.articleNumber}条: ${a.filePath}
原文: ${a.text.substring(0, 100)}...
解説あり: commentary=${a.commentary.length}段落, commentaryOsaka=${a.commentaryOsaka.length}段落
`
  )
  .join('\n')}

【重要】
- 全${articles.length}条を順番にチェックしてください
- 問題がない条文は記録不要です
- 削除条文（deleted: true）はスキップしてください
- チェック完了後、上記JSON形式で結果を返してください
`.trim();
}

/**
 * バッチ情報を生成
 */
function generateBatchInfo(articles, batchSize) {
  const batches = [];
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    batches.push({
      start: i,
      end: Math.min(i + batchSize, articles.length),
      articles: batch,
      total: articles.length,
    });
  }
  return batches;
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const categoryFilter = args[0];
  const lawFilter = args[1];
  const batchSize = parseInt(args[2] || '100', 10);

  console.log('================================================================================');
  console.log('🔍 全条文のハルシネーション・誤情報チェック');
  console.log('================================================================================\n');

  // レポート初期化
  const report = initializeReport();
  console.log(`📝 レポート初期化: ${REPORT_FILE}\n`);

  // 対象法律を取得
  let targetLaws = getAllLaws();

  if (categoryFilter) {
    targetLaws = targetLaws.filter((law) => law.categoryId === categoryFilter);
  }

  if (lawFilter) {
    targetLaws = targetLaws.filter((law) => law.lawId === lawFilter);
  }

  if (targetLaws.length === 0) {
    console.error('❌ 対象の法律が見つかりません');
    process.exit(1);
  }

  console.log(`📚 チェック対象: ${targetLaws.length}法律\n`);

  // 各法律をチェック
  for (const law of targetLaws) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📖 ${law.categoryName} - ${law.lawId}`);
    console.log('='.repeat(80));

    const articles = getArticles(law.lawDir);
    console.log(`  総条文数: ${articles.length}条`);

    if (articles.length === 0) {
      console.log('  ⏭️  条文なし、スキップ');
      continue;
    }

    // バッチ分割
    const batches = generateBatchInfo(articles, batchSize);
    console.log(`  バッチ数: ${batches.length}（1バッチ=${batchSize}条）\n`);

    // カテゴリ統計初期化
    if (!report.summary.categories[law.categoryId]) {
      report.summary.categories[law.categoryId] = {
        name: law.categoryName,
        laws: {},
      };
    }

    report.summary.categories[law.categoryId].laws[law.lawId] = {
      totalArticles: articles.length,
      checkedArticles: 0,
      issuesFound: 0,
      batches: batches.map((b) => ({
        range: `${b.start + 1}-${b.end}`,
        status: 'pending',
      })),
    };

    report.summary.totalArticles += articles.length;
    saveReport(report);

    // プロンプト生成
    const prompt = generateLawCheckPrompt(law, articles);
    const promptFile = path.join(REPORT_DIR, `prompt-${law.categoryId}-${law.lawId}.txt`);
    fs.writeFileSync(promptFile, prompt);

    console.log(`  ✅ プロンプト生成完了: ${promptFile}`);
    console.log(`  📂 対象ディレクトリ: ${law.lawDir}`);
    console.log(`  📝 総条文数: ${articles.length}条\n`);
  }

  report.metadata.completedAt = new Date().toISOString();
  saveReport(report);

  console.log('\n================================================================================');
  console.log('✅ チェック準備完了');
  console.log('================================================================================');
  console.log(`\n📊 サマリー:`);
  console.log(`  総条文数: ${report.summary.totalArticles}条`);
  console.log(`  対象法律数: ${targetLaws.length}法律`);
  console.log(`  プロンプトファイル: ${REPORT_DIR}/prompt-*.txt`);
  console.log(`\n📝 レポート: ${REPORT_FILE}`);
  console.log(`\n💡 OpenCodeでの実行方法:`);
  console.log(`\n  以下の法律について、Task toolでサブエージェントを起動してください：`);
  console.log(`  （複数のTask toolを並列実行することで効率化できます）\n`);

  for (const law of targetLaws) {
    const promptFile = path.join(REPORT_DIR, `prompt-${law.categoryId}-${law.lawId}.txt`);
    console.log(`  ${law.categoryName} - ${law.lawId}:`);
    console.log(`    Task tool (subagent_type: "general")`);
    console.log(`    Prompt: 以下のファイルの内容を実行: ${promptFile}`);
    console.log(`    結果を: reports/result-${law.categoryId}-${law.lawId}.json に保存\n`);
  }

  console.log(`\n📋 完了後の手順:`);
  console.log(`  1. 各結果JSONファイルを統合`);
  console.log(`  2. 問題が見つかった条文を修正`);
  console.log(`  3. GitHub Issue #31 を更新\n`);
}

main().catch((error) => {
  console.error('❌ エラー:', error);
  process.exit(1);
});
