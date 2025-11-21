#!/usr/bin/env node

/**
 * 原文の内容をキーにして、大阪弁訳を復元するスクリプト
 *
 * 使用タイミング: 再取得後、旧データから大阪弁訳を復元したい時
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('使用法: node restore-osaka-by-content.js <法律名>');
  console.error('例: node restore-osaka-by-content.js minji_soshou_hou');
  process.exit(1);
}

const lawName = args[0];
const lawDir = path.join('src', 'data', 'laws', 'jp', lawName);

if (!fs.existsSync(lawDir)) {
  console.error(`❌ ディレクトリが存在しません: ${lawDir}`);
  process.exit(1);
}

console.log('='.repeat(70));
console.log('原文内容ベースで大阪弁訳を復元');
console.log('='.repeat(70));
console.log(`法律: ${lawName}\n`);

// 1. git HEADから旧データを読み込み、原文→訳のマップを作成
console.log('📦 Step 1: 旧データ（git HEAD）から翻訳マップを作成中...\n');

const oldFiles = execSync(`git ls-files ${lawDir}/*.yaml`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter((f) => !f.includes('law_metadata'));

const translationMap = new Map();
let oldFilesProcessed = 0;
let oldFilesWithTranslations = 0;

for (const file of oldFiles) {
  try {
    const content = execSync(`git show HEAD:${file}`, { encoding: 'utf8' });
    const data = yaml.load(content);

    if (!data || !data.originalText || data.originalText.length === 0) {
      continue;
    }

    // 原文を正規化してキーにする
    const key = normalizeText(data.originalText.join('\n'));

    // 大阪弁訳がある場合のみマップに追加
    const hasTranslations =
      (data.osakaText && data.osakaText.length > 0) ||
      (data.commentary && data.commentary.length > 0) ||
      (data.commentaryOsaka && data.commentaryOsaka.length > 0);

    if (hasTranslations) {
      translationMap.set(key, {
        title: data.title || '',
        titleOsaka: data.titleOsaka || '',
        osakaText: data.osakaText || [],
        commentary: data.commentary || [],
        commentaryOsaka: data.commentaryOsaka || [],
        sourceFile: path.basename(file),
        article: data.article,
      });
      oldFilesWithTranslations++;
    }

    oldFilesProcessed++;
  } catch (error) {
    // ファイルが新規の場合はスキップ
    if (!error.message.includes('does not exist')) {
      console.warn(`⚠️  ${path.basename(file)}: ${error.message}`);
    }
  }
}

console.log(`  読み込み完了: ${oldFilesProcessed}ファイル`);
console.log(`  大阪弁訳あり: ${oldFilesWithTranslations}ファイル\n`);

// 2. 新データの各ファイルに対して復元
console.log('🔄 Step 2: 新データに大阪弁訳を復元中...\n');

const newFiles = fs
  .readdirSync(lawDir)
  .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml')
  .map((f) => path.join(lawDir, f));

let restoredCount = 0;
let notFoundCount = 0;
let skippedCount = 0;

for (const file of newFiles) {
  try {
    const data = yaml.load(fs.readFileSync(file, 'utf8'));

    if (!data || !data.originalText || data.originalText.length === 0) {
      skippedCount++;
      continue;
    }

    // 原文を正規化してマップを検索
    const key = normalizeText(data.originalText.join('\n'));

    if (translationMap.has(key)) {
      const translations = translationMap.get(key);

      // タイトルと大阪弁訳を復元
      data.title = translations.title;
      data.titleOsaka = translations.titleOsaka;
      data.osakaText = translations.osakaText;
      data.commentary = translations.commentary;
      data.commentaryOsaka = translations.commentaryOsaka;

      // YAML形式で保存
      const yamlContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
      });

      fs.writeFileSync(file, yamlContent, 'utf8');

      console.log(
        `✅ ${path.basename(file)} ← ${translations.sourceFile} (第${translations.article}条)`
      );
      restoredCount++;
    } else {
      console.log(`⚠️  ${path.basename(file)}: 原文マッチなし`);
      notFoundCount++;
    }
  } catch (error) {
    console.error(`❌ ${path.basename(file)}: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('復元結果');
console.log('='.repeat(70));
console.log(`復元成功: ${restoredCount}ファイル`);
console.log(`マッチなし: ${notFoundCount}ファイル（新規条文または原文が変更）`);
console.log(`スキップ: ${skippedCount}ファイル（原文なし）`);
console.log('='.repeat(70));

const restoreRate =
  oldFilesWithTranslations > 0 ? ((restoredCount / oldFilesWithTranslations) * 100).toFixed(1) : 0;

console.log(`\n復元率: ${restoreRate}% (${restoredCount}/${oldFilesWithTranslations})`);

if (restoredCount > 0) {
  console.log('\n✅ 大阪弁訳の復元が完了しました！');
}

/**
 * テキストを正規化（句読点・空白の違いを吸収）
 */
function normalizeText(text) {
  return text
    .replace(/\s+/g, '') // すべての空白を削除
    .replace(/[。、]/g, '') // 句読点を削除
    .toLowerCase()
    .trim();
}
