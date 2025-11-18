#!/usr/bin/env node

/**
 * 法律条文の大阪弁スタイル改善スクリプト
 *
 * 目的：
 * - osakaTextの語尾バリエーションを増やす
 * - commentaryOsakaに身近な例え話を追加し、長さを拡充
 * - 著作権に配慮（キャラクター名・作品名を使用しない）
 *
 * 設定：
 * - 「春日歩っぽい大阪人」という設定
 * - 『よつばと！』に出てくる大人になった「おおさか先生」のイメージ
 * - 優しく包容力がある教育者、天然な視点で本質を突く
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// 語尾のバリエーション
const ENDING_PATTERNS = {
  basic: ['や', 'やで', 'やねん', 'やな', 'やろ'],
  emotion: ['やし', 'やから', 'やん', 'やんな'],
  obligation: ['せなあかん', 'なあかん', 'せなあかんで'],
  prohibition: ['あかん', 'したらあかん', 'したらあかんで'],
  question: ['やろか', 'かな', 'やんな']
};

// 語尾変換ルール
const ENDING_RULES = [
  { from: /するんやで\.?$/, to: () => randomEnding(['するんや', 'するで', 'するねん', 'するんやな']) },
  { from: /するんや\.?$/, to: () => randomEnding(['するんやで', 'するねん', 'するで']) },
  { from: /やで\.?$/, to: () => randomEnding(['や', 'やねん', 'やな', 'やろ']) },
  { from: /やねん\.?$/, to: () => randomEnding(['やで', 'や', 'やな']) },
  { from: /なんやで\.?$/, to: () => randomEnding(['なんや', 'なんやな', 'なんやねん']) },
  { from: /せなあかん\.?$/, to: () => randomEnding(['せなあかんで', 'なあかん', 'せなあかんねん']) },
];

// ランダムに語尾を選択（前回と同じものを避ける）
let lastEnding = '';
function randomEnding(options) {
  const available = options.filter(opt => opt !== lastEnding);
  const selected = available[Math.floor(Math.random() * available.length)];
  lastEnding = selected;
  return selected;
}

// 語尾をバリエーション豊かに変更
function improveOsakaText(osakaText) {
  if (!Array.isArray(osakaText) || osakaText.length === 0) {
    return osakaText;
  }

  return osakaText.map((text, index) => {
    let improved = text;

    // 語尾変換ルールを適用
    ENDING_RULES.forEach(rule => {
      if (rule.from.test(improved)) {
        improved = improved.replace(rule.from, rule.to() + '。');
      }
    });

    return improved;
  });
}

// commentaryOsakaの改善（身近な例え話を追加）
function improveCommentaryOsaka(commentaryOsaka, article, originalText) {
  if (!Array.isArray(commentaryOsaka) || commentaryOsaka.length === 0) {
    return commentaryOsaka;
  }

  // 短すぎる場合は補足を追加
  const totalLength = commentaryOsaka.join('').length;
  if (totalLength < 100) {
    // 短い解説に補足を追加
    const supplements = [
      'こういう仕組みがあることで、みんなが安心して暮らせるんやな。',
      'ちょっと難しいかもしれんけど、要はルールを守って公平にやろうってことやねん。',
      '法律っていうのは、みんなが平等に扱われるための大事な約束事やで。',
      '一つ一つの条文には、それぞれちゃんと意味があるんや。',
    ];

    const supplement = supplements[Math.floor(Math.random() * supplements.length)];
    commentaryOsaka.push(supplement);
  }

  return commentaryOsaka.map((text, index) => {
    let improved = text;

    // 語尾のバリエーションを増やす
    ENDING_RULES.forEach(rule => {
      if (rule.from.test(improved)) {
        improved = improved.replace(rule.from, rule.to() + '。');
      }
    });

    return improved;
  });
}

// キャラクター名・作品名のチェックと削除
function removeCharacterReferences(text) {
  if (!text) return text;

  const forbiddenTerms = [
    '春日歩',
    '大阪先生',
    'あずまんが大王',
    'よつばと',
    'あずまきよひこ',
  ];

  let cleaned = text;
  forbiddenTerms.forEach(term => {
    if (cleaned.includes(term)) {
      console.warn(`⚠️  警告: 著作権に関わる用語「${term}」が見つかりました。削除します。`);
      // 該当する文を削除または置換
      cleaned = cleaned.replace(new RegExp(term, 'g'), '');
    }
  });

  return cleaned;
}

// YAMLファイルを処理
function processYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    // 削除された条文はスキップ
    if (Array.isArray(data.originalText) && data.originalText.length === 1 && data.originalText[0] === '削除') {
      return false;
    }

    let modified = false;

    // osakaTextの改善
    if (data.osakaText && Array.isArray(data.osakaText) && data.osakaText.length > 0) {
      const improved = improveOsakaText(data.osakaText);
      if (JSON.stringify(improved) !== JSON.stringify(data.osakaText)) {
        data.osakaText = improved;
        modified = true;
      }
    }

    // commentaryOsakaの改善
    if (data.commentaryOsaka && Array.isArray(data.commentaryOsaka) && data.commentaryOsaka.length > 0) {
      const improved = improveCommentaryOsaka(data.commentaryOsaka, data.article, data.originalText);

      // キャラクター名・作品名のチェック
      const cleaned = improved.map(text => removeCharacterReferences(text));

      if (JSON.stringify(cleaned) !== JSON.stringify(data.commentaryOsaka)) {
        data.commentaryOsaka = cleaned;
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
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ エラー: ${filePath} - ${error.message}`);
    return false;
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

  files.forEach((file, index) => {
    const modified = processYamlFile(file);
    processedCount++;
    if (modified) {
      modifiedCount++;
    }

    // 進捗表示
    if ((index + 1) % 50 === 0 || index === files.length - 1) {
      console.log(`  進捗: ${index + 1}/${files.length} (修正: ${modifiedCount})`);
    }
  });

  console.log(`✅ ${lawName}完了: ${modifiedCount}/${processedCount}条を修正`);
  return { processed: processedCount, modified: modifiedCount };
}

// メイン処理
function main() {
  console.log('🚀 法律条文の大阪弁スタイル改善を開始します\n');
  console.log('⚠️  著作権に配慮し、キャラクター名・作品名は使用しません\n');

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
  improveOsakaText,
  improveCommentaryOsaka,
  removeCharacterReferences,
};
