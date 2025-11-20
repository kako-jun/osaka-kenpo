#!/usr/bin/env node

/**
 * 削除条文を完全に正規化するスクリプト
 *
 * ルール（isDeleted: true の条文）:
 * - title: e-Gov APIから取得したタイトルを保持（条文番号）
 * - titleOsaka: ""
 * - originalText: ["削除"]
 * - osakaText: []
 * - commentary: []
 * - commentaryOsaka: []
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
  console.error('Usage: node normalize-deleted-articles-complete.js <law_category> <law_id>');
  console.error('Example: node normalize-deleted-articles-complete.js jp minpou');
  process.exit(1);
}

const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', lawCategory, lawId);

if (!fs.existsSync(lawDir)) {
  console.error(`❌ ディレクトリが見つかりません: ${lawDir}`);
  process.exit(1);
}

console.log('='.repeat(60));
console.log('🧹 削除条文完全正規化スクリプト');
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

  // isDeleted フラグがある、または originalText が "削除" の条文
  const isDeleted =
    content.isDeleted ||
    (Array.isArray(content.originalText) &&
      content.originalText.length > 0 &&
      content.originalText[0].trim() === '削除');

  if (isDeleted) {
    // 削除条文を完全に正規化
    const newContent = {
      article: content.article,
      isSuppl: content.isSuppl || false,
      isDeleted: true,
      title: content.title || '', // タイトルは保持
      titleOsaka: '',
      originalText: [],
      osakaText: [],
      commentary: [],
      commentaryOsaka: [],
    };

    const yamlContent = yaml.dump(newContent, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    });

    fs.writeFileSync(filepath, yamlContent, 'utf8');
    normalizedCount++;
    normalized.push({
      file,
      article: content.article,
      title: content.title || '(タイトルなし)',
      hadData: !!(
        content.osakaText?.length ||
        content.commentary?.length ||
        content.commentaryOsaka?.length
      ),
    });
  }
}

console.log('='.repeat(60));
console.log('📊 処理結果');
console.log('='.repeat(60));
console.log(`   総ファイル数: ${files.length}`);
console.log(`   ✅ 正規化: ${normalizedCount}件`);
console.log('='.repeat(60));

if (normalized.length > 0) {
  console.log('\n🧹 正規化された削除条文:\n');

  const withData = normalized.filter((n) => n.hadData);
  const withoutData = normalized.filter((n) => !n.hadData);

  if (withData.length > 0) {
    console.log(`   ⚠️  中途半端なデータを削除 (${withData.length}件):\n`);
    withData.forEach(({ file, article, title }) => {
      console.log(`      - 第${article}条: ${title}`);
    });
    console.log();
  }

  if (withoutData.length > 0) {
    console.log(`   ✅ 既に正規化済み (${withoutData.length}件)`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('🎉 完了！');
console.log('='.repeat(60));
console.log(`削除条文の構造:`);
console.log(`  - isDeleted: true`);
console.log(`  - title: (条文番号を保持)`);
console.log(`  - titleOsaka: ""`);
console.log(`  - originalText: []`);
console.log(`  - osakaText: []`);
console.log(`  - commentary: []`);
console.log(`  - commentaryOsaka: []`);
console.log('='.repeat(60));
