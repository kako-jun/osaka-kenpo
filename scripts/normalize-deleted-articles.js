#!/usr/bin/env node

/**
 * 削除条文を正規化するスクリプト
 *
 * ルール:
 * - originalText が ["削除"] の場合、title を "削除" に統一
 * - titleOsaka, osakaText, commentary, commentaryOsaka は空配列/空文字列
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
  console.error('Usage: node normalize-deleted-articles.js <law_category> <law_id>');
  console.error('Example: node normalize-deleted-articles.js jp minpou');
  process.exit(1);
}

const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', lawCategory, lawId);

if (!fs.existsSync(lawDir)) {
  console.error(`❌ ディレクトリが見つかりません: ${lawDir}`);
  process.exit(1);
}

console.log('='.repeat(60));
console.log('🗑️  削除条文正規化スクリプト');
console.log('='.repeat(60));
console.log(`   Category: ${lawCategory}`);
console.log(`   Law ID: ${lawId}`);
console.log('='.repeat(60) + '\n');

const files = fs
  .readdirSync(lawDir)
  .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

let normalizedCount = 0;
const normalized = [];

for (const file of files) {
  const filepath = path.join(lawDir, file);
  const content = yaml.load(fs.readFileSync(filepath, 'utf8'));

  const originalText = content.originalText || [];
  const isDeleted =
    Array.isArray(originalText) && originalText.length > 0 && originalText[0].trim() === '削除';

  if (isDeleted) {
    // 削除条文を正規化
    content.title = '削除';
    content.titleOsaka = '';
    content.osakaText = [];
    content.commentary = [];
    content.commentaryOsaka = [];

    const yamlContent = yaml.dump(content, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    });

    fs.writeFileSync(filepath, yamlContent, 'utf8');
    normalizedCount++;
    normalized.push({ file, article: content.article });
  }
}

console.log('='.repeat(60));
console.log('📊 処理結果');
console.log('='.repeat(60));
console.log(`   総ファイル数: ${files.length}`);
console.log(`   ✅ 正規化: ${normalizedCount}件`);
console.log('='.repeat(60));

if (normalized.length > 0) {
  console.log('\n🗑️  正規化された削除条文:\n');
  normalized.forEach(({ file, article }) => {
    console.log(`   - 第${article}条 (${file})`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🎉 完了！');
console.log('='.repeat(60));
console.log(`削除条文は title="削除" に統一されました`);
console.log('='.repeat(60));
