#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

/**
 * テキストを段落配列に分割する
 * \n\nで分割し、空の段落を除去
 */
function splitIntoParagraphs(text) {
  if (!text) return [''];
  return text
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/**
 * JSONデータを新しいYAML形式に変換する
 * - キー名の統一化
 * - 全テキストフィールドを段落配列に変換
 * - 不要フィールドの削除
 * - YAMLフォーマット適用
 */
async function convertJsonToYaml(jsonFilePath) {
  try {
    // JSONファイルを読み込み
    const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonContent);

    // 新しいデータ構造に変換（配列形式）
    const converted = {
      article: data.article,
      title: data.title || '',
      ...(data.titleOsaka && { titleOsaka: data.titleOsaka }),
      originalText: splitIntoParagraphs(data.original),
      osakaText: splitIntoParagraphs(data.osaka),
      commentary: splitIntoParagraphs(data.commentary),
      ...(data.commentaryOsaka && {
        commentaryOsaka: splitIntoParagraphs(data.commentaryOsaka),
      }),
    };

    // YAMLに変換
    const yamlContent = yaml.dump(converted, {
      defaultFlowStyle: false,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });

    // YAMLファイルに書き出し
    const yamlFilePath = jsonFilePath.replace('.json', '.yaml');
    await fs.writeFile(yamlFilePath, yamlContent, 'utf8');

    console.log(`✅ Converted: ${path.basename(jsonFilePath)} → ${path.basename(yamlFilePath)}`);
    return yamlFilePath;
  } catch (error) {
    console.error(`❌ Error converting ${jsonFilePath}:`, error.message);
    throw error;
  }
}

/**
 * ディレクトリ内の全JSONファイルを変換
 */
async function convertDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // サブディレクトリを再帰的に処理
        await convertDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        // メタデータファイルはスキップ
        if (
          !entry.name.includes('metadata') &&
          !entry.name.includes('famous-articles') &&
          !entry.name.includes('chapters')
        ) {
          await convertJsonToYaml(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const lawsDir = path.join(__dirname, '..', 'src', 'data', 'laws');

  console.log('🚀 Starting JSON to YAML conversion...');
  console.log(`📁 Processing directory: ${lawsDir}`);

  try {
    await convertDirectory(lawsDir);
    console.log('✅ Conversion completed successfully!');
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = { convertJsonToYaml, convertDirectory };
