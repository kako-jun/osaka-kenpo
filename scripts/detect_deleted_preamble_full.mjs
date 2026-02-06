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

const problematicFiles = {
  '民法': [],
  '商法': []
};

// パターン: 削除された可能性のある冒頭表現
const deletionPatterns = [
  'この条文は',
  'これは',
  'この規定は',
  '第\\d+条(は|では|につい)',
  'このルール',
  'この仕組み',
  'この決まり',
  'その',
  'その規定',
  'その結果'
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
      // コミット前のデータを取得
      const beforeCmd = `git show 3b1db073^:${filePath}`;
      let beforeData = null;
      try {
        const beforeContent = execSync(beforeCmd, { encoding: 'utf-8', cwd: baseDir });
        beforeData = yaml.load(beforeContent);
      } catch {
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

        // beforeがパターンで始まっているが、afterがそうでない場合
        let beforeStartsWithDeletionPattern = false;
        for (const pattern of deletionPatterns) {
          if (new RegExp(`^\\s*${pattern}`).test(beforeText)) {
            beforeStartsWithDeletionPattern = true;
            break;
          }
        }

        if (beforeStartsWithDeletionPattern && !new RegExp(`^\\s*${deletionPatterns.join('|')}`).test(afterText)) {
          if (afterText.length < beforeText.length) {
            const law = filePath.includes('minpou') ? '民法' : '商法';
            problematicFiles[law].push(filePath);
          }
        }
      }
    }
  } catch (e) {
    // エラーはスキップ
  }
}

// 重複を削除してソート
for (const law of Object.keys(problematicFiles)) {
  problematicFiles[law] = [...new Set(problematicFiles[law])].sort();
}

// 結果を表示（必要な形式）
if (problematicFiles['民法'].length === 0 && problematicFiles['商法'].length === 0) {
  console.log('問題のあるファイルは見つかりませんでした。');
} else {
  if (problematicFiles['民法'].length > 0) {
    console.log('民法:');
    for (const file of problematicFiles['民法']) {
      console.log(`- ${file}`);
    }
    console.log();
  }
  
  if (problematicFiles['商法'].length > 0) {
    console.log('商法:');
    for (const file of problematicFiles['商法']) {
      console.log(`- ${file}`);
    }
  }
}

// サマリー
console.log(`\n=== サマリー ===`);
console.log(`民法: ${problematicFiles['民法'].length}件`);
console.log(`商法: ${problematicFiles['商法'].length}件`);
console.log(`合計: ${problematicFiles['民法'].length + problematicFiles['商法'].length}件`);
