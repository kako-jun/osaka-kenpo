#!/usr/bin/env node

/**
 * 統合品質チェックスクリプト
 *
 * osakaTextとcommentaryOsaka両方の品質を統合してチェック
 * 真の完成条文を特定
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const osakaTextReport = JSON.parse(fs.readFileSync('osaka-text-quality-report.json', 'utf8'));
const commentaryOsakaReport = JSON.parse(
  fs.readFileSync('commentary-osaka-quality-report.json', 'utf8')
);

function main() {
  console.log('🔍 統合品質チェックを開始します\n');

  const laws = ['民法', '商法', '会社法', '刑法', '民事訴訟法', '刑事訴訟法'];

  const summary = {};

  laws.forEach((lawName) => {
    const osakaText = osakaTextReport[lawName] || { problems: [], totalFiles: 0 };
    const commentaryOsaka = commentaryOsakaReport[lawName] || { problems: [], totalFiles: 0 };

    // osakaTextとcommentaryOsaka両方で問題のある条文番号を収集
    const osakaTextProblems = new Set(
      osakaText.problems.filter((p) => typeof p.article === 'number').map((p) => p.article)
    );
    const commentaryOsakaProblems = new Set(
      commentaryOsaka.problems.filter((p) => typeof p.article === 'number').map((p) => p.article)
    );

    // どちらかで問題がある条文
    const allProblems = new Set([...osakaTextProblems, ...commentaryOsakaProblems]);

    // 両方とも良好な条文（真の完成）
    const perfectArticles = [];
    const totalFiles = Math.max(osakaText.totalFiles, commentaryOsaka.totalFiles);

    // 実際のファイルから条文番号を取得
    const lawPath = path.join(process.cwd(), 'src/data/laws/jp', getLawDir(lawName));
    if (fs.existsSync(lawPath)) {
      const files = fs
        .readdirSync(lawPath)
        .filter((file) => file.endsWith('.yaml') && file !== 'law_metadata.yaml')
        .sort();

      files.forEach((file) => {
        const match = file.match(/^(\d+)(?:-[0-9]+)?\.yaml$/);
        if (match) {
          const article = parseInt(match[1], 10);
          // 削除条文は除外
          const content = fs.readFileSync(path.join(lawPath, file), 'utf8');
          const data = yaml.load(content);
          if (
            !(
              Array.isArray(data.originalText) &&
              data.originalText.length === 1 &&
              data.originalText[0] === '削除'
            )
          ) {
            if (!allProblems.has(article)) {
              perfectArticles.push(article);
            }
          }
        }
      });
    }

    // 範囲をマージ
    const osakaTextRanges = osakaText.ranges || [];
    const commentaryOsakaRanges = commentaryOsaka.ranges || [];
    const allRanges = mergeRanges([...osakaTextRanges, ...commentaryOsakaRanges]);

    summary[lawName] = {
      totalFiles: totalFiles,
      osakaTextProblems: osakaTextProblems.size,
      commentaryOsakaProblems: commentaryOsakaProblems.size,
      allProblems: allProblems.size,
      perfectArticles: perfectArticles.length,
      perfectPercentage: ((perfectArticles.length / totalFiles) * 100).toFixed(1),
      ranges: allRanges,
    };
  });

  // サマリー表示
  console.log('\n' + '='.repeat(80));
  console.log('📊 統合品質サマリー（真の完成度）');
  console.log('='.repeat(80));

  laws.forEach((lawName) => {
    const s = summary[lawName];
    console.log(`\n${lawName}:`);
    console.log(`  総条文数: ${s.totalFiles}`);
    console.log(`  osakaText問題: ${s.osakaTextProblems}条`);
    console.log(`  commentaryOsaka問題: ${s.commentaryOsakaProblems}条`);
    console.log(`  真の完成条文: ${s.perfectArticles}条 (${s.perfectPercentage}%)`);
    console.log(`  再翻訳推奨範囲: ${s.ranges.length}箇所`);
    if (s.ranges.length > 0 && s.ranges.length <= 5) {
      console.log(`    ${s.ranges.map((r, i) => `${i + 1}. 第${r[0]}〜${r[1]}`).join(', ')}`);
    } else if (s.ranges.length > 5) {
      console.log(
        `    ${s.ranges
          .slice(0, 5)
          .map((r, i) => `${i + 1}. 第${r[0]}〜${r[1]}`)
          .join(', ')}`
      );
      console.log(`    ... 他${s.ranges.length - 5}箇所`);
    }
  });

  // 全体サマリー
  const totalFiles = Object.values(summary).reduce((sum, s) => sum + s.totalFiles, 0);
  const perfectArticles = Object.values(summary).reduce((sum, s) => sum + s.perfectArticles, 0);

  console.log('\n' + '='.repeat(80));
  console.log('📊 全体サマリー');
  console.log('='.repeat(80));
  console.log(`  総条文数: ${totalFiles}`);
  console.log(
    `  真の完成条文: ${perfectArticles}条 (${((perfectArticles / totalFiles) * 100).toFixed(1)}%)`
  );
  console.log(`  未完了条文: ${totalFiles - perfectArticles}条`);

  // 詳細レポート出力
  fs.writeFileSync('combined-quality-report.json', JSON.stringify(summary, null, 2), 'utf8');
  console.log('\n📄 詳細レポートを combined-quality-report.json に出力しました');

  console.log('\n✨ 統合品質チェックが完了しました！');
}

// 範囲をマージする関数
function mergeRanges(ranges) {
  if (ranges.length === 0) return [];

  // 昇順にソート
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);

  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];

    // 重複または隣接している場合、マージ
    if (current[0] <= last[1] + 20) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}

// 法律名からディレクトリ名を取得
function getLawDir(lawName) {
  const mapping = {
    民法: 'minpou',
    商法: 'shouhou',
    会社法: 'kaisya_hou',
    刑法: 'keihou',
    民事訴訟法: 'minji_soshou_hou',
    刑事訴訟法: 'keiji_soshou_hou',
  };
  return mapping[lawName] || '';
}

if (require.main === module) {
  main();
}

module.exports = {
  mergeRanges,
  getLawDir,
};
