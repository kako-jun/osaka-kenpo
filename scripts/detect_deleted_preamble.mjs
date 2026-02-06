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

// パターン: 削除された可能性のある冒頭表現
const deletionPatterns = [
  'この条文は',
  'これは',
  'この規定は',
  '第\\d+条(は|では|につい)',
  'このルール',
  'この仕組み',
  'この決まり'
];

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
      // コミット前のデータを取得（HEAD^という表記で前のバージョン）
      const beforeCmd = `git show 3b1db073^:${filePath}`;
      let beforeData = null;
      try {
        const beforeContent = execSync(beforeCmd, { encoding: 'utf-8', cwd: baseDir });
        beforeData = yaml.load(beforeContent);
      } catch {
        // コミット前に存在しない場合はスキップ
        continue;
      }

      if (!Array.isArray(beforeData?.commentaryOsaka) || beforeData.commentaryOsaka.length < 2) {
        continue;
      }

      // 2番目以降の項目について比較
      for (let i = 1; i < data.commentaryOsaka.length && i < beforeData.commentaryOsaka.length; i++) {
        const afterText = data.commentaryOsaka[i];
        const beforeText = beforeData.commentaryOsaka[i];

        if (typeof afterText !== 'string' || typeof beforeText !== 'string') {
          continue;
        }

        // beforeがbookmarkや削除パターンで始まっているが、afterがそうでない場合
        let beforeStartsWithDeletionPattern = false;
        for (const pattern of deletionPatterns) {
          if (new RegExp(`^\\s*${pattern}`).test(beforeText)) {
            beforeStartsWithDeletionPattern = true;
            break;
          }
        }

        if (beforeStartsWithDeletionPattern && !new RegExp(`^\\s*${deletionPatterns.join('|')}`).test(afterText)) {
          // 確認: afterTextが前のバージョンより短いか
          if (afterText.length < beforeText.length) {
            const law = filePath.includes('minpou') ? '民法' : '商法';
            if (!problematicFiles[law]) {
              problematicFiles[law] = [];
            }
            
            problematicFiles[law].push({
              file: filePath,
              itemIndex: i + 1,  // 1-based indexing
              beforePreview: beforeText.substring(0, 80),
              afterPreview: afterText.substring(0, 80),
              lengthDiff: beforeText.length - afterText.length
            });
          }
        }
      }
    }
  } catch (e) {
    // エラーはスキップ
  }
}

// 結果を表示
if (Object.keys(problematicFiles).length === 0) {
  console.log('冒頭が削除されたと思われる項目は見つかりませんでした。');
} else {
  console.log('=== 冒頭削除の可能性があるファイル ===\n');
  for (const law of Object.keys(problematicFiles).sort()) {
    console.log(`${law}: (${problematicFiles[law].length}件)`);
    for (const item of problematicFiles[law].slice(0, 10)) {
      console.log(`  - ${item.file} (${item.itemIndex}番目の項目)`);
      console.log(`    削除前: "${item.beforePreview}..."`);
      console.log(`    削除後: "${item.afterPreview}..."`);
      console.log(`    差分: ${item.lengthDiff}文字削除`);
    }
    if (problematicFiles[law].length > 10) {
      console.log(`    ... 他${problematicFiles[law].length - 10}件`);
    }
    console.log();
  }
}

// サマリー
let totalIssues = 0;
for (const law of Object.keys(problematicFiles)) {
  totalIssues += problematicFiles[law].length;
}
console.log(`\n=== 総計 ===`);
console.log(`問題ファイル: ${Object.keys(problematicFiles).reduce((sum, law) => sum + problematicFiles[law].length, 0)}件`);
