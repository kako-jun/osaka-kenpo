#!/usr/bin/env node

/**
 * 「大阪商人すぎる」問題を修正するスクリプト
 *
 * 問題:
 * - 商売人・投資家目線が強すぎる
 * - 金銭的な例ばかり
 * - 法律を学ぶ生徒目線ではない
 *
 * 修正方針:
 * - 商売人目線から教育者目線に変更
 * - 金銭的な例を身近な例に置き換え
 * - おおさか先生（優しく包容力がある教育者）の視点を追加
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 修正パターン（問題のある表現 → 改善した表現）
const IMPROVEMENT_PATTERNS = [
  {
    // 「商売の借金」→「借金」「債務」
    pattern: /商売の借金/g,
    replacement: '借金',
    description: '商売の借金 → 借金'
  },
  {
    // 「商売人」→「営業者」「事業者」
    pattern: /商売人/g,
    replacement: '営業者',
    description: '商売人 → 営業者'
  },
  {
    // 「貸す方も安心」→「取引の安全」
    pattern: /貸す方も安心/g,
    replacement: '取引相手も安心',
    description: '貸す方も安心 → 取引相手も安心'
  },
  {
    // 「投資できる」→「参加できる」
    pattern: /投資できる/g,
    replacement: '参加できる',
    description: '投資できる → 参加できる'
  },
  {
    // 商売に関する重複表現を削減
    pattern: /商売は信用が大事やから、/g,
    replacement: '',
    description: '商売は信用が大事やから、 → (削除)'
  },
  {
    // 過度に商業的な表現
    pattern: /安心して投資/g,
    replacement: '安心して参加',
    description: '安心して投資 → 安心して参加'
  }
];

// 短すぎる解説に補足を追加
function addSupplement(commentaryOsaka, article) {
  if (!Array.isArray(commentaryOsaka)) {
    return commentaryOsaka;
  }

  const totalText = commentaryOsaka.join('');
  const totalLength = totalText.length;

  // 150文字未満の場合は補足を追加
  if (totalLength < 150 && totalLength > 0) {
    const supplements = [
      'こういう仕組みがあることで、トラブルが起きた時でもちゃんと解決できるようになってるんやな。',
      'ちょっと難しそうに見えるけど、要は「公平にやろう」っていう考え方が根っこにあるんやで。',
      'こういうルールがあるおかげで、みんなが安心して取引できるんやね。',
      '法律の世界には、こうやって細かいルールがぎょうさんあるんや。一つ一つに意味があるねんで。',
    ];

    const randomSupplement = supplements[Math.floor(Math.random() * supplements.length)];
    commentaryOsaka.push(randomSupplement);
  }

  return commentaryOsaka;
}

// commentaryOsakaを改善
function improveCommentaryOsaka(commentaryOsaka, article) {
  if (!Array.isArray(commentaryOsaka) || commentaryOsaka.length === 0) {
    return commentaryOsaka;
  }

  let modified = false;
  const improved = commentaryOsaka.map(text => {
    let newText = text;

    // 各修正パターンを適用
    IMPROVEMENT_PATTERNS.forEach(({ pattern, replacement }) => {
      if (pattern.test(newText)) {
        newText = newText.replace(pattern, replacement);
        modified = true;
      }
    });

    return newText;
  });

  // 短い場合は補足を追加
  const withSupplement = addSupplement(improved, article);

  return modified || (withSupplement.length > improved.length) ? withSupplement : commentaryOsaka;
}

// YAMLファイルを処理
function processYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    // 削除された条文はスキップ
    if (Array.isArray(data.originalText) && data.originalText.length === 1 && data.originalText[0] === '削除') {
      return { modified: false, article: data.article };
    }

    let modified = false;

    // commentaryOsakaの改善
    if (data.commentaryOsaka && Array.isArray(data.commentaryOsaka) && data.commentaryOsaka.length > 0) {
      const improved = improveCommentaryOsaka(data.commentaryOsaka, data.article);

      if (JSON.stringify(improved) !== JSON.stringify(data.commentaryOsaka)) {
        data.commentaryOsaka = improved;
        modified = true;
      }
    }

    // 変更があれば保存
    if (modified) {
      const newContent = yaml.dump(data, {
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });
      fs.writeFileSync(filePath, newContent, 'utf8');
      return { modified: true, article: data.article };
    }

    return { modified: false, article: data.article };
  } catch (error) {
    console.error(`❌ エラー: ${filePath} - ${error.message}`);
    return { modified: false, article: null, error: error.message };
  }
}

// ディレクトリ内のすべてのYAMLファイルを処理
function processDirectory(dirPath, lawName) {
  console.log(`\n📂 ${lawName}を処理中...`);

  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.yaml') && file !== 'law_metadata.yaml')
    .map(file => path.join(dirPath, file));

  let processedCount = 0;
  let modifiedCount = 0;
  const modifiedArticles = [];

  files.forEach((file, index) => {
    const result = processYamlFile(file);
    processedCount++;
    if (result.modified) {
      modifiedCount++;
      if (result.article) {
        modifiedArticles.push(result.article);
      }
    }

    // 進捗表示
    if ((index + 1) % 50 === 0 || index === files.length - 1) {
      console.log(`  進捗: ${index + 1}/${files.length} (修正: ${modifiedCount})`);
    }
  });

  console.log(`✅ ${lawName}完了: ${modifiedCount}/${processedCount}条を修正`);

  // 修正した条文の一部を表示
  if (modifiedArticles.length > 0) {
    console.log(`  修正した条文例: ${modifiedArticles.slice(0, 5).join(', ')}...`);
  }

  return { processed: processedCount, modified: modifiedCount };
}

// メイン処理
function main() {
  console.log('🚀 「大阪商人すぎる」問題の修正を開始します\n');
  console.log('修正パターン:');
  IMPROVEMENT_PATTERNS.forEach(p => {
    console.log(`  - ${p.description}`);
  });
  console.log('');

  const laws = [
    { path: 'src/data/laws/jp/shouhou', name: '商法' },
    { path: 'src/data/laws/jp/keihou', name: '刑法' },
    { path: 'src/data/laws/jp/keiji_soshou_hou', name: '刑事訴訟法' },
    { path: 'src/data/laws/jp/minji_soshou_hou', name: '民事訴訟法' },
  ];

  const results = {};
  let totalProcessed = 0;
  let totalModified = 0;

  laws.forEach(law => {
    const lawPath = path.join(process.cwd(), law.path);
    if (fs.existsSync(lawPath)) {
      const result = processDirectory(lawPath, law.name);
      results[law.name] = result;
      totalProcessed += result.processed;
      totalModified += result.modified;
    } else {
      console.log(`⚠️  ${law.name}のディレクトリが見つかりません: ${lawPath}`);
    }
  });

  // 最終サマリー
  console.log('\n' + '='.repeat(60));
  console.log('📊 最終結果');
  console.log('='.repeat(60));
  Object.entries(results).forEach(([name, result]) => {
    console.log(`${name}: ${result.modified}/${result.processed}条を修正`);
  });
  console.log('='.repeat(60));
  console.log(`合計: ${totalModified}/${totalProcessed}条を修正`);
  console.log('='.repeat(60));
  console.log('\n✨ すべての処理が完了しました！');
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  processYamlFile,
  improveCommentaryOsaka,
  IMPROVEMENT_PATTERNS,
};
