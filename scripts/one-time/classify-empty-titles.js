#!/usr/bin/env node

/**
 * 空のタイトルを持つ条文を分類するスクリプト
 * - 削除された条文
 * - 本当に空の条文（再取得が必要）
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lawCategory = process.argv[2] || 'jp';
const lawId = process.argv[3] || 'minpou';

const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', lawCategory, lawId);

if (!fs.existsSync(lawDir)) {
  console.error(`❌ ディレクトリが見つかりません: ${lawDir}`);
  process.exit(1);
}

const files = fs
  .readdirSync(lawDir)
  .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

const deleted = [];
const needsTitle = [];

for (const file of files) {
  const filepath = path.join(lawDir, file);
  const content = yaml.load(fs.readFileSync(filepath, 'utf8'));

  const title = content.title || '';
  const titleStr = typeof title === 'string' ? title.trim() : '';

  if (titleStr === '') {
    const originalText = content.originalText || [];
    const isDeleted =
      Array.isArray(originalText) && originalText.length > 0 && originalText[0].trim() === '削除';

    if (isDeleted) {
      deleted.push({ file, article: content.article });
    } else {
      needsTitle.push({ file, article: content.article, isSuppl: content.isSuppl || false });
    }
  }
}

console.log('='.repeat(60));
console.log('📊 空のタイトル分類結果');
console.log('='.repeat(60));
console.log(`Law: ${lawCategory}/${lawId}\n`);

console.log(`🗑️  削除された条文: ${deleted.length}件`);
if (deleted.length > 0) {
  console.log('   （タイトルが空で正しい）');
  deleted.forEach(({ file, article }) => {
    console.log(`   - 第${article}条 (${file})`);
  });
}

console.log(`\n❌ タイトルが空（再取得が必要）: ${needsTitle.length}件`);
if (needsTitle.length > 0) {
  needsTitle.forEach(({ file, article }) => {
    console.log(`   - 第${article}条 (${file})`);
  });

  // リストをファイルに保存
  const outputFile = path.join(__dirname, 'needs-title-refetch.json');
  fs.writeFileSync(outputFile, JSON.stringify(needsTitle, null, 2), 'utf8');
  console.log(`\n📝 再取得リストを ${path.basename(outputFile)} に保存しました`);
}

console.log('\n' + '='.repeat(60));
console.log('💡 次のステップ:');
console.log('='.repeat(60));
if (needsTitle.length > 0) {
  console.log(`1. ローカル環境でe-Gov APIから再取得:`);
  console.log(`   npm run refetch:titles ${lawId} <egov_law_num>`);
  console.log(`   例: npm run refetch:titles minpou 129AC0000000089`);
} else {
  console.log('✅ すべての条文にタイトルがあります！');
}
console.log('='.repeat(60));
