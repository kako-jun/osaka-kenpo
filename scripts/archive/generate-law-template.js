#!/usr/bin/env node

/**
 * 法律のテンプレートYAMLファイルを生成するスクリプト
 * （e-Gov APIが使えない場合の代替手段）
 *
 * Usage:
 *   node scripts/generate-law-template.js <law_id> <total_articles>
 *   例: node scripts/generate-law-template.js keihou 264
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// コマンドライン引数
const lawId = process.argv[2];
const totalArticles = parseInt(process.argv[3], 10);

if (!lawId || !totalArticles || isNaN(totalArticles)) {
  console.error('Usage: node generate-law-template.js <law_id> <total_articles>');
  console.error('Example: node generate-law-template.js keihou 264');
  process.exit(1);
}

console.log(`📝 Generating template YAML files...`);
console.log(`   Law ID: ${lawId}`);
console.log(`   Total Articles: ${totalArticles}\n`);

// 進捗YAMLを読み込み
const progressPath = path.join(__dirname, '..', '.claude', 'roppou-progress.yaml');
const progressData = yaml.load(fs.readFileSync(progressPath, 'utf8'));

// 該当する法律を見つける
const lawInfo = progressData.laws.find((l) => l.id === lawId);
if (!lawInfo) {
  console.error(`❌ Law ID "${lawId}" not found in roppou-progress.yaml`);
  process.exit(1);
}

const category = lawInfo.category;
const outputDir = path.join(__dirname, '..', 'src', 'data', 'laws', category, lawId);

// 出力ディレクトリを作成
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Created directory: ${outputDir}`);
}

// テンプレートYAMLを生成
let savedCount = 0;
for (let i = 1; i <= totalArticles; i++) {
  const yamlContent = yaml.dump(
    {
      article: i,
      title: `第${i}条`,
      titleOsaka: '',
      originalText: ['【ここに原文を入力してください】'],
      osakaText: [], // Stage 3で埋める
      commentary: [], // Stage 2で埋める
      commentaryOsaka: [], // Stage 4で埋める
    },
    {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
    }
  );

  const filename = `${i}.yaml`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, yamlContent, 'utf8');
  savedCount++;

  if (savedCount % 10 === 0 || savedCount === totalArticles) {
    process.stdout.write(`\r💾 Generated ${savedCount}/${totalArticles} templates...`);
  }
}

console.log(`\n\n✅ All template files saved to: ${outputDir}`);

// law_metadata.yamlを作成
const metadataContent = yaml.dump(
  {
    name: lawInfo.name,
    year: '', // 後で埋める
    source: '', // 後で埋める
    description: '', // 後で埋める
    links: [], // 後で埋める
  },
  {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
  }
);

const metadataPath = path.join(outputDir, 'law_metadata.yaml');
fs.writeFileSync(metadataPath, metadataContent, 'utf8');
console.log(`📄 Created law_metadata.yaml (template)`);

console.log(`\n🎉 Done! Now you can fill in the content manually or using e-Gov API script.`);
console.log(`\n📌 Next steps:`);
console.log(`   1. Fill in originalText in each YAML file (Stage 1)`);
console.log(`   2. Run progress update script to track completion`);
