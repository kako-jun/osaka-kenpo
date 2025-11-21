#!/usr/bin/env node

/**
 * 既存YAMLファイルのタイトルから括弧を除去するスクリプト
 *
 * 例: （基本原則） → 基本原則
 *
 * Usage:
 *   node scripts/clean-law-titles.js <law_category> <law_id>
 *   例: node scripts/clean-law-titles.js jp minpou
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// コマンドライン引数
const lawCategory = process.argv[2];
const lawId = process.argv[3];

if (!lawCategory || !lawId) {
  console.error('Usage: node clean-law-titles.js <law_category> <law_id>');
  console.error('Example: node clean-law-titles.js jp minpou');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('🧹 法律タイトルクリーニングスクリプト');
console.log('='.repeat(60));
console.log(`   Category: ${lawCategory}`);
console.log(`   Law ID: ${lawId}`);
console.log('='.repeat(60) + '\n');

/**
 * 構造化タイトル（Rubyタグ付き）を文字列に変換
 */
function extractTitleText(titleValue) {
  if (!titleValue) {
    return '';
  }

  if (typeof titleValue === 'string') {
    return titleValue;
  }

  // オブジェクトの場合（Rubyタグ付きなど）
  if (typeof titleValue === 'object') {
    let text = '';

    // _プロパティ（基本テキスト）
    if (titleValue._) {
      text += titleValue._;
    }

    // Rubyプロパティ（ルビ付きテキスト）
    if (titleValue.Ruby) {
      const ruby = titleValue.Ruby;
      if (ruby._) {
        text += ruby._; // ルビのベーステキスト
      }
    }

    return text;
  }

  return '';
}

/**
 * タイトルから括弧を除去
 */
function cleanTitle(title) {
  // まず構造化データを文字列に変換
  let titleStr = extractTitleText(title);

  if (!titleStr) {
    return '';
  }

  // 全角括弧を除去（前後の括弧のみ）
  let cleaned = titleStr.trim();
  if (cleaned.startsWith('（') && cleaned.endsWith('）')) {
    cleaned = cleaned.slice(1, -1);
  }

  return cleaned;
}

/**
 * YAMLファイルのタイトルをクリーニング
 */
function cleanYamlFile(filepath) {
  try {
    const content = yaml.load(fs.readFileSync(filepath, 'utf8'));
    const originalTitle = content.title || '';
    const cleanedTitle = cleanTitle(originalTitle);

    // 変更があった場合のみ保存
    if (originalTitle !== cleanedTitle) {
      content.title = cleanedTitle;

      const yamlContent = yaml.dump(content, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
      });

      fs.writeFileSync(filepath, yamlContent, 'utf8');
      return {
        changed: true,
        before: originalTitle,
        after: cleanedTitle,
      };
    }

    return { changed: false };
  } catch (error) {
    console.error(`❌ エラー: ${filepath} - ${error.message}`);
    return { changed: false, error: error.message };
  }
}

/**
 * メイン処理
 */
function main() {
  const lawDir = path.join(__dirname, '..', '..', 'src', 'data', 'laws', lawCategory, lawId);

  if (!fs.existsSync(lawDir)) {
    console.error(`❌ ディレクトリが見つかりません: ${lawDir}`);
    process.exit(1);
  }

  console.log(`📂 対象ディレクトリ: ${lawDir}\n`);
  console.log('🔍 YAMLファイルを処理中...\n');

  const files = fs
    .readdirSync(lawDir)
    .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');
  let changedCount = 0;
  let unchangedCount = 0;
  let errorCount = 0;

  const changes = [];

  for (const file of files) {
    const filepath = path.join(lawDir, file);
    const result = cleanYamlFile(filepath);

    if (result.error) {
      errorCount++;
    } else if (result.changed) {
      changedCount++;
      changes.push({
        file,
        before: result.before,
        after: result.after,
      });
    } else {
      unchangedCount++;
    }
  }

  // 結果表示
  console.log('='.repeat(60));
  console.log('📊 処理結果');
  console.log('='.repeat(60));
  console.log(`   総ファイル数: ${files.length}`);
  console.log(`   ✅ 変更: ${changedCount}件`);
  console.log(`   ➖ 変更なし: ${unchangedCount}件`);
  if (errorCount > 0) {
    console.log(`   ❌ エラー: ${errorCount}件`);
  }
  console.log('='.repeat(60));

  // 変更内容を表示（最初の20件）
  if (changes.length > 0) {
    console.log('\n📝 変更されたタイトル（最初の20件）:\n');
    changes.slice(0, 20).forEach(({ file, before, after }) => {
      console.log(`   ${file}:`);
      console.log(`      Before: "${before}"`);
      console.log(`      After:  "${after}"`);
      console.log();
    });

    if (changes.length > 20) {
      console.log(`   ... 他${changes.length - 20}件\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('🎉 完了！');
  console.log('='.repeat(60));
}

// 実行
main();
