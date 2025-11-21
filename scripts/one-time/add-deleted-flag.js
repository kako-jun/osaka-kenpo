#!/usr/bin/env node

/**
 * 削除条文に isDeleted フラグを追加するスクリプト
 *
 * ルール:
 * - originalText が ["削除"] の場合、isDeleted: true を追加
 * - タイトルやその他のフィールドはそのまま保持
 * - GUI側で isDeleted === true の条文を非表示にする
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lawCategory = process.argv[2] || 'jp';
const lawId = process.argv[3];

if (!lawId) {
  console.error('Usage: node add-deleted-flag.js <law_category> <law_id>');
  console.error('Example: node add-deleted-flag.js jp minpou');
  process.exit(1);
}

const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', lawCategory, lawId);

if (!fs.existsSync(lawDir)) {
  console.error(`❌ ディレクトリが見つかりません: ${lawDir}`);
  process.exit(1);
}

console.log('='.repeat(60));
console.log('🏷️  削除フラグ追加スクリプト');
console.log('='.repeat(60));
console.log(`   Category: ${lawCategory}`);
console.log(`   Law ID: ${lawId}`);
console.log('='.repeat(60) + '\n');

const files = fs
  .readdirSync(lawDir)
  .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

let addedCount = 0;
const added = [];

for (const file of files) {
  const filepath = path.join(lawDir, file);
  const content = yaml.load(fs.readFileSync(filepath, 'utf8'));

  const originalText = content.originalText || [];
  const isDeleted =
    Array.isArray(originalText) && originalText.length > 0 && originalText[0].trim() === '削除';

  if (isDeleted && !content.isDeleted) {
    // isDeleted フラグを追加（article の次に配置）
    const newContent = {
      article: content.article,
      isSuppl: content.isSuppl,
      isDeleted: true,
      title: content.title,
      titleOsaka: content.titleOsaka,
      originalText: content.originalText,
      osakaText: content.osakaText,
      commentary: content.commentary,
      commentaryOsaka: content.commentaryOsaka,
    };

    const yamlContent = yaml.dump(newContent, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    });

    fs.writeFileSync(filepath, yamlContent, 'utf8');
    addedCount++;
    added.push({ file, article: content.article, title: content.title });
  }
}

console.log('='.repeat(60));
console.log('📊 処理結果');
console.log('='.repeat(60));
console.log(`   総ファイル数: ${files.length}`);
console.log(`   ✅ フラグ追加: ${addedCount}件`);
console.log('='.repeat(60));

if (added.length > 0) {
  console.log('\n🏷️  isDeleted フラグを追加した条文:\n');
  added.forEach(({ file, article, title }) => {
    console.log(`   - 第${article}条: ${title || '(タイトルなし)'}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🎉 完了！');
console.log('='.repeat(60));
console.log(`削除条文に isDeleted: true フラグを追加しました`);
console.log(`GUI側で isDeleted === true の条文を非表示にしてください`);
console.log('='.repeat(60));
