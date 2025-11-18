#!/usr/bin/env node

/**
 * 商法の船舶関連条文から「北前船」などの古い例え話を修正するスクリプト
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 修正対象のファイルリスト（Grepで見つかった43ファイル）
const filesWithKitamaebune = [
  684, 685, 689, 692, 693, 697, 699, 704, 708, 709, 710, 711, 712, 714,
  737, 738, 739, 740, 741, 743, 745, 746, 748, 749, 750, 751, 753, 754,
  755, 756, 800, 803, 808, 809, 810, 811, 812, 815, 816, 817, 818, 819, 820
];

const shouhouDir = path.join(__dirname, '../src/data/laws/jp/shouhou');

let totalFixed = 0;

filesWithKitamaebune.forEach(articleNum => {
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

  // 各段落を修正
  data.commentaryOsaka = data.commentaryOsaka.map(paragraph => {
    let fixed = paragraph;

    // 「北前船」を含む文を修正
    if (fixed.includes('北前船')) {
      // パターン1: 「昔の北前船」を「コンテナ船」「貨物船」などに置き換え
      fixed = fixed.replace(/昔の北前船/g, '今のコンテナ船');
      fixed = fixed.replace(/北前船/g, '貨物船');

      // パターン2: 「船頭さん」を「船長さん」に
      fixed = fixed.replace(/船頭さん/g, '船長さん');

      modified = true;
    }

    // 「昔の〜」パターンをチェック（船関連）
    if (fixed.match(/昔の.*?船/)) {
      fixed = fixed.replace(/昔の/g, '今の');
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
