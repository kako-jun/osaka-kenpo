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

const problematicFiles = {
  '民法': [],
  '商法': []
};

let checkedCount = 0;
let issueCount = 0;

for (const filePath of changedFiles) {
  const fullPath = path.join(baseDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    continue;
  }

  checkedCount++;

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const data = yaml.load(content);

    // commentaryOsakaが配列かチェック
    if (!Array.isArray(data?.commentaryOsaka)) {
      continue;
    }

    // コミット前のデータを取得
    let beforeData = null;
    try {
      const beforeContent = execSync(`git show 3b1db073^:${filePath}`, { 
        encoding: 'utf-8', 
        cwd: baseDir,
        stdio: ['pipe', 'pipe', 'ignore']
      });
      beforeData = yaml.load(beforeContent);
    } catch {
      continue;
    }

    if (!Array.isArray(beforeData?.commentaryOsaka)) {
      continue;
    }

    // 2番目以降の項目を比較（最大5項目まで）
    const maxItems = Math.min(
      data.commentaryOsaka.length,
      beforeData.commentaryOsaka.length,
      5
    );

    for (let i = 1; i < maxItems; i++) {
      const afterText = data.commentaryOsaka[i];
      const beforeText = beforeData.commentaryOsaka[i];

      // テキストでない場合はスキップ
      if (typeof afterText !== 'string' || typeof beforeText !== 'string') {
        continue;
      }

      // 先頭5文字を比較
      const beforeFirst5 = beforeText.substring(0, 5);
      const afterFirst5 = afterText.substring(0, 5);

      // 削除の可能性: beforeがこれは/この/第Xで始まり、afterが別の文字で始まる
      const beforeStartsWithPreamble = /^(これは|この|第\d|そ|なん)/.test(beforeText);
      const afterStartsWithSamePattern = /^(これは|この|第\d|そ|なん)/.test(afterText);

      if (beforeStartsWithPreamble && !afterStartsWithSamePattern) {
        // さらに確認：afterがbeforeの先頭から何文字かを削ったパターンと一致するか
        const beforeTrimmed = beforeText.replace(/^(これは|この|第\d+条|その|なんで|なんや|)/, '');
        if (afterText.startsWith(beforeTrimmed.substring(0, Math.min(20, beforeTrimmed.length)))) {
          const law = filePath.includes('minpou') ? '民法' : '商法';
          problematicFiles[law].push(filePath);
          issueCount++;
          break; // このファイルは一度カウント
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

// 結果を表示
console.log('民法:');
for (const file of problematicFiles['民法']) {
  console.log(`- ${file}`);
}

if (problematicFiles['商法'].length > 0) {
  console.log('\n商法:');
  for (const file of problematicFiles['商法']) {
    console.log(`- ${file}`);
  }
}

// サマリー
console.log(`\n=== サマリー ===`);
console.log(`チェック対象ファイル: ${checkedCount}`);
console.log(`民法の問題ファイル: ${problematicFiles['民法'].length}件`);
console.log(`商法の問題ファイル: ${problematicFiles['商法'].length}件`);
console.log(`合計: ${problematicFiles['民法'].length + problematicFiles['商法'].length}件`);
