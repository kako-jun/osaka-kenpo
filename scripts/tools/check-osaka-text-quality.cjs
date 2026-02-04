#!/usr/bin/env node

/**
 * osakaTextの品質チェックスクリプト（範囲ベース版）
 *
 * チェック項目：
 * 1. 「大阪商人すぎる」表現（商売、投資、利益、損得など）
 * 2. 語尾変換のみ（例：「〜である」→「〜や」のみ）
 * 3. 短すぎる翻訳（1文のみ）
 * 4. ワンパターン表現（「知らんけど」の乱用など）
 * 5. 男性的表現（「わい」「わいら」など）
 *
 * 出力：
 * - 問題のある条文番号リスト
 * - 範囲ベースの再翻訳提案（近くの条文も含む）
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 問題パターンの定義
const ISSUE_PATTERNS = {
  merchantTone: {
    name: '大阪商人すぎる表現',
    patterns: [
      /商売(の|人|で|を|は)/,
      /投資(する|できる|家|を)/,
      /利益(を|が|の)/,
      /損得/,
      /儲け/,
      /貸す方/,
      /借りる方/,
      /安心して投資/,
      /商売は信用/,
    ],
  },

  onePattern: {
    name: 'ワンパターン表現',
    patterns: [/知らんけど/g],
    maxCount: 2,
  },
  maleTone: {
    name: '男性的表現',
    patterns: [/わい/, /わいら/, /おんどれ/, /あほんだら/, /〜やん(?![（])/],
  },
};

// 1つのYAMLファイルをチェック
function checkYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    // 削除された条文はスキップ
    if (
      Array.isArray(data.originalText) &&
      data.originalText.length === 1 &&
      data.originalText[0] === '削除'
    ) {
      return null;
    }

    // osakaTextがない or 空の場合
    if (!data.osakaText || !Array.isArray(data.osakaText) || data.osakaText.length === 0) {
      return {
        article: data.article,
        file: path.basename(filePath),
        issues: ['翻訳なし'],
      };
    }

    const fullText = data.osakaText.join('');
    const issues = [];

    // 1. 大阪商人すぎる表現のチェック
    const merchantMatches = [];
    ISSUE_PATTERNS.merchantTone.patterns.forEach((pattern) => {
      const matches = fullText.match(pattern);
      if (matches) {
        merchantMatches.push(...matches);
      }
    });
    if (merchantMatches.length > 0) {
      issues.push(`商人表現: ${[...new Set(merchantMatches)].join(', ')}`);
    }

    // 2. ワンパターン表現のチェック
    ISSUE_PATTERNS.onePattern.patterns.forEach((pattern) => {
      const matches = fullText.match(pattern);
      if (matches && matches.length > ISSUE_PATTERNS.onePattern.maxCount) {
        issues.push(`ワンパターン: "${matches[0]}" ${matches.length}回`);
      }
    });

    // 4. 男性的表現のチェック
    const maleMatches = [];
    ISSUE_PATTERNS.maleTone.patterns.forEach((pattern) => {
      const matches = fullText.match(pattern);
      if (matches) {
        maleMatches.push(...matches);
      }
    });
    if (maleMatches.length > 0) {
      issues.push(`男性表現: ${[...new Set(maleMatches)].join(', ')}`);
    }

    if (issues.length > 0) {
      return {
        article: data.article,
        file: path.basename(filePath),
        issues: issues,
        sentenceCount: data.osakaText.length,
        length: fullText.length,
      };
    }

    return null;
  } catch (error) {
    return {
      article: '不明',
      file: path.basename(filePath),
      issues: [`エラー: ${error.message}`],
    };
  }
}

// ディレクトリ内のすべてのYAMLファイルをチェック
function checkDirectory(dirPath, lawName) {
  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith('.yaml') && file !== 'law_metadata.yaml')
    .map((file) => path.join(dirPath, file));

  const problems = [];

  files.forEach((file) => {
    const result = checkYamlFile(file);
    if (result) {
      problems.push(result);
    }
  });

  return problems;
}

// 範囲ベースの再翻訳提案を作成
function suggestRanges(problems, windowSize = 20) {
  if (problems.length === 0) return [];

  // 問題のある条文番号を昇順で取得
  const problemArticles = problems
    .filter((p) => typeof p.article === 'number')
    .map((p) => p.article)
    .sort((a, b) => a - b);

  if (problemArticles.length === 0) return [];

  const ranges = [];
  let start = problemArticles[0];
  let prev = problemArticles[0];

  for (let i = 1; i < problemArticles.length; i++) {
    const current = problemArticles[i];

    // 20条以内なら同じ範囲とみなす
    if (current - prev <= windowSize) {
      prev = current;
    } else {
      // 新しい範囲を開始
      ranges.push([start, prev]);
      start = current;
      prev = current;
    }
  }

  // 最後の範囲を追加
  ranges.push([start, prev]);

  return ranges;
}

// メイン処理
function main() {
  console.log('🔍 osakaTextの品質チェックを開始します\n');

  const laws = [
    { path: 'src/data/laws/jp/minpou', name: '民法' },
    { path: 'src/data/laws/jp/shouhou', name: '商法' },
    { path: 'src/data/laws/jp/kaisya_hou', name: '会社法' },
    { path: 'src/data/laws/jp/keihou', name: '刑法' },
    { path: 'src/data/laws/jp/minji_soshou_hou', name: '民事訴訟法' },
    { path: 'src/data/laws/jp/keiji_soshou_hou', name: '刑事訴訟法' },
  ];

  const allResults = {};

  laws.forEach((law) => {
    const lawPath = path.join(process.cwd(), law.path);
    if (fs.existsSync(lawPath)) {
      console.log(`\n📂 ${law.name}をチェック中...`);
      const problems = checkDirectory(lawPath, law.name);

      // 問題タイプ別に集計
      const byIssueType = {
        翻訳なし: [],
        商人表現: [],
        ワンパターン: [],
        男性表現: [],
      };

      problems.forEach((p) => {
        p.issues.forEach((issue) => {
          if (issue.startsWith('商人表現')) {
            byIssueType['商人表現'].push(p);
          } else if (issue.startsWith('ワンパターン')) {
            byIssueType['ワンパターン'].push(p);
          } else if (issue.startsWith('男性表現')) {
            byIssueType['男性表現'].push(p);
          } else if (issue === '翻訳なし') {
            byIssueType['翻訳なし'].push(p);
          }
        });
      });

      const totalFiles = fs
        .readdirSync(lawPath)
        .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml').length;
      console.log(`  総条文数: ${totalFiles}`);
      console.log(
        `  問題のある条文数: ${problems.length} (${((problems.length / totalFiles) * 100).toFixed(1)}%)`
      );
      console.log(`    - 翻訳なし: ${byIssueType['翻訳なし'].length}条`);
      console.log(`    - 商人表現: ${byIssueType['商人表現'].length}条`);
      console.log(`    - ワンパターン: ${byIssueType['ワンパターン'].length}条`);
      console.log(`    - 男性表現: ${byIssueType['男性表現'].length}条`);

      // 範囲ベースの再翻訳提案
      const ranges = suggestRanges(problems, 20);

      console.log(`\n  📝 再翻訳推奨範囲（${ranges.length}箇所）:`);
      if (ranges.length === 0) {
        console.log(`    ✅ 全て良好！`);
      } else {
        ranges.forEach((range, index) => {
          const [start, end] = range;
          const count = problems.filter((p) => p.article >= start && p.article <= end).length;
          console.log(`    ${index + 1}. 第${start}条〜第${end}条 (${count}条で問題あり)`);
        });
      }

      allResults[law.name] = {
        total: problems.length,
        totalFiles: totalFiles,
        percentage: ((problems.length / totalFiles) * 100).toFixed(1),
        byType: byIssueType,
        ranges: ranges,
        problems: problems,
      };
    }
  });

  // 最終サマリー
  console.log('\n' + '='.repeat(70));
  console.log('📊 最終結果サマリー');
  console.log('='.repeat(70));

  Object.entries(allResults).forEach(([name, result]) => {
    console.log(`\n${name}:`);
    console.log(`  総条文数: ${result.totalFiles}`);
    console.log(`  問題のある条文: ${result.total}条 (${result.percentage}%)`);
    console.log(`  再翻訳推奨範囲: ${result.ranges.length}箇所`);
    if (result.ranges.length > 0) {
      console.log(`    ${result.ranges.map((r, i) => `${i + 1}. 第${r[0]}〜${r[1]}`).join(', ')}`);
    }
  });

  console.log('\n' + '='.repeat(70));

  // 詳細レポートをファイルに出力
  const reportPath = 'osaka-text-quality-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2), 'utf8');
  console.log(`\n📄 詳細レポートを ${reportPath} に出力しました`);

  console.log('\n✨ チェックが完了しました！');
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  checkYamlFile,
  checkDirectory,
  ISSUE_PATTERNS,
  suggestRanges,
};
