#!/usr/bin/env node

/**
 * 商法の条文で「神戸」を「大阪」に置き換えるスクリプト
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 神戸が含まれるファイルリスト（Grepで見つかった13ファイル）
const filesWithKobe = [
  684, 688, 689, 692, 694, 704, 705, 706, 708, 737, 763, 769, 822
];

const shouhouDir = path.join(__dirname, '../src/data/laws/jp/shouhou');

let totalFixed = 0;

filesWithKobe.forEach(articleNum => {
  const filePath = path.join(shouhouDir, `${articleNum}.yaml`);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ファイルが見つかりません: ${articleNum}.yaml`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);

  if (!data.commentaryOsaka || data.commentaryOsaka.length === 0) {
    return;
  }

  let modified = false;
  const originalCommentary = JSON.stringify(data.commentaryOsaka);

  // 各段落で「神戸」を「大阪」に置き換え
  data.commentaryOsaka = data.commentaryOsaka.map(paragraph => {
    let fixed = paragraph;

    if (fixed.includes('神戸')) {
      // 「神戸港」→「大阪港」
      fixed = fixed.replace(/神戸港/g, '大阪港');
      // 「神戸から」→「大阪から」
      fixed = fixed.replace(/神戸から/g, '大阪から');
      // 残りの「神戸」→「大阪」
      fixed = fixed.replace(/神戸/g, '大阪');

      modified = true;
    }

    return fixed;
  });

  // 変更があれば保存
  if (modified && JSON.stringify(data.commentaryOsaka) !== originalCommentary) {
    const newContent = yaml.dump(data, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false
    });

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ 修正: 第${articleNum}条`);
    totalFixed++;
  }
});

console.log(`\n🎉 完了: ${totalFixed}ファイルを修正しました`);
