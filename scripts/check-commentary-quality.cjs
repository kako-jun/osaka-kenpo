#!/usr/bin/env node

/**
 * commentaryOsakaの品質チェックスクリプト
 *
 * チェック項目：
 * 1. 「大阪商人すぎる」表現（商売、投資、利益、損得など）
 * 2. 短すぎる解説（150文字未満）
 * 3. 例え話の不足（「例えば」「例えばな」がない）
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
    ]
  },
  tooShort: {
    name: '短すぎる解説',
    threshold: 150
  },
  noExamples: {
    name: '例え話の不足',
    patterns: [
      /例えば/,
      /例えばな/,
    ]
  }
};

// 1つのYAMLファイルをチェック
function checkYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    // 削除された条文はスキップ
    if (Array.isArray(data.originalText) && data.originalText.length === 1 && data.originalText[0] === '削除') {
      return null;
    }

    // commentaryOsakaがない or 空の場合
    if (!data.commentaryOsaka || !Array.isArray(data.commentaryOsaka) || data.commentaryOsaka.length === 0) {
      return {
        article: data.article,
        file: path.basename(filePath),
        issues: ['解説なし']
      };
    }

    const fullText = data.commentaryOsaka.join('');
    const issues = [];

    // 1. 大阪商人すぎる表現のチェック
    const merchantMatches = [];
    ISSUE_PATTERNS.merchantTone.patterns.forEach(pattern => {
      const matches = fullText.match(pattern);
      if (matches) {
        merchantMatches.push(...matches);
      }
    });
    if (merchantMatches.length > 0) {
      issues.push(`商人表現: ${[...new Set(merchantMatches)].join(', ')}`);
    }

    // 2. 短すぎる解説のチェック
    if (fullText.length < ISSUE_PATTERNS.tooShort.threshold) {
      issues.push(`短い: ${fullText.length}文字`);
    }

    // 3. 例え話の不足のチェック
    const hasExample = ISSUE_PATTERNS.noExamples.patterns.some(pattern => pattern.test(fullText));
    if (!hasExample && fullText.length > 0) {
      issues.push('例え話なし');
    }

    if (issues.length > 0) {
      return {
        article: data.article,
        file: path.basename(filePath),
        issues: issues,
        length: fullText.length
      };
    }

    return null;
  } catch (error) {
    return {
      article: '不明',
      file: path.basename(filePath),
      issues: [`エラー: ${error.message}`]
    };
  }
}

// ディレクトリ内のすべてのYAMLファイルをチェック
function checkDirectory(dirPath, lawName) {
  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.yaml') && file !== 'law_metadata.yaml')
    .map(file => path.join(dirPath, file));

  const problems = [];

  files.forEach(file => {
    const result = checkYamlFile(file);
    if (result) {
      problems.push(result);
    }
  });

  return problems;
}

// メイン処理
function main() {
  console.log('🔍 commentaryOsakaの品質チェックを開始します\n');

  const laws = [
    { path: 'src/data/laws/jp/shouhou', name: '商法' },
    { path: 'src/data/laws/jp/keihou', name: '刑法' },
    { path: 'src/data/laws/jp/keiji_soshou_hou', name: '刑事訴訟法' },
    { path: 'src/data/laws/jp/minji_soshou_hou', name: '民事訴訟法' },
  ];

  const allResults = {};

  laws.forEach(law => {
    const lawPath = path.join(process.cwd(), law.path);
    if (fs.existsSync(lawPath)) {
      console.log(`\n📂 ${law.name}をチェック中...`);
      const problems = checkDirectory(lawPath, law.name);

      // 問題タイプ別に集計
      const byIssueType = {
        '商人表現': [],
        '短い': [],
        '例え話なし': [],
        '解説なし': []
      };

      problems.forEach(p => {
        p.issues.forEach(issue => {
          if (issue.startsWith('商人表現')) {
            byIssueType['商人表現'].push(p);
          } else if (issue.startsWith('短い')) {
            byIssueType['短い'].push(p);
          } else if (issue === '例え話なし') {
            byIssueType['例え話なし'].push(p);
          } else if (issue === '解説なし') {
            byIssueType['解説なし'].push(p);
          }
        });
      });

      console.log(`  総条文数: ${fs.readdirSync(lawPath).filter(f => f.endsWith('.yaml') && f !== 'law_metadata.yaml').length}`);
      console.log(`  問題のある条文数: ${problems.length}`);
      console.log(`    - 商人表現: ${byIssueType['商人表現'].length}条`);
      console.log(`    - 短い: ${byIssueType['短い'].length}条`);
      console.log(`    - 例え話なし: ${byIssueType['例え話なし'].length}条`);
      console.log(`    - 解説なし: ${byIssueType['解説なし'].length}条`);

      allResults[law.name] = {
        total: problems.length,
        byType: byIssueType,
        problems: problems
      };

      // 商人表現のある条文の例を表示
      if (byIssueType['商人表現'].length > 0) {
        console.log(`\n  商人表現のある条文の例（最初の5条）:`);
        byIssueType['商人表現'].slice(0, 5).forEach(p => {
          console.log(`    - 第${p.article}条: ${p.issues.find(i => i.startsWith('商人表現'))}`);
        });
      }
    }
  });

  // 最終サマリー
  console.log('\n' + '='.repeat(70));
  console.log('📊 最終結果サマリー');
  console.log('='.repeat(70));

  Object.entries(allResults).forEach(([name, result]) => {
    console.log(`\n${name}:`);
    console.log(`  問題のある条文: ${result.total}条`);
    console.log(`    - 商人表現: ${result.byType['商人表現'].length}条`);
    console.log(`    - 短い: ${result.byType['短い'].length}条`);
    console.log(`    - 例え話なし: ${result.byType['例え話なし'].length}条`);
    console.log(`    - 解説なし: ${result.byType['解説なし'].length}条`);
  });

  console.log('\n' + '='.repeat(70));

  // 詳細レポートをファイルに出力
  const reportPath = 'quality-check-report.json';
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
};
