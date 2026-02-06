#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, '..');

// 3つのコミットで変更されたファイルを取得
const changedFiles = execSync(
  'git diff --name-only 3b1db073^..03cc8434 | grep -E "\\.yaml$" | grep -E "/(minpou|shouhou)/"',
  { encoding: 'utf-8', cwd: baseDir }
).trim().split('\n').filter(f => f);

console.log(`Total files to check: ${changedFiles.length}\n`);

const problematicFiles = {};

for (const filePath of changedFiles) {
  const fullPath = path.join(baseDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    continue;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const data = yaml.load(content);

    // commentaryOsakaが配列であることを確認
    if (Array.isArray(data?.commentaryOsaka) && data.commentaryOsaka.length >= 2) {
      const secondItem = data.commentaryOsaka[1];
      
      // 2番目の項目が非常に短い場合を検出
      const itemText = typeof secondItem === 'string' ? secondItem : secondItem?.text || '';
      
      // 異常に短い定義（10文字以下）または典型的な開き括弧のみなどの場合
      if (itemText.length < 10 || itemText.match(/^[\s\(（「『]*$/)) {
        const law = filePath.includes('minpou') ? '民法' : '商法';
        if (!problematicFiles[law]) {
          problematicFiles[law] = [];
        }
        problematicFiles[law].push({
          file: filePath,
          secondItemLength: itemText.length,
          secondItemPreview: itemText.substring(0, 50)
        });
      }
    }
  } catch (e) {
    // ファイル解析エラーはスキップ
  }
}

// 結果を表示
if (Object.keys(problematicFiles).length === 0) {
  console.log('異常に短い2番目の項目は見つかりませんでした。');
} else {
  for (const law of Object.keys(problematicFiles).sort()) {
    console.log(`${law}:`);
    for (const item of problematicFiles[law]) {
      console.log(`  - ${item.file}`);
      console.log(`    (2番目の項目の長さ: ${item.secondItemLength}文字, プレビュー: "${item.secondItemPreview}")`);
    }
  }
}
