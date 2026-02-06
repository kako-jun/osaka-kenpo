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

for (const filePath of changedFiles) {
  const fullPath = path.join(baseDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    continue;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const data = yaml.load(content);

    // commentaryOsakaが配列かチェック
    if (!Array.isArray(data?.commentaryOsaka) || data.commentaryOsaka.length < 2) {
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

    if (!Array.isArray(beforeData?.commentaryOsaka) || beforeData.commentaryOsaka.length < 2) {
      continue;
    }

    // 各項目を比較
    let hasIssue = false;
    for (let i = 1; i < Math.min(data.commentaryOsaka.length, beforeData.commentaryOsaka.length); i++) {
      const afterText = String(data.commentaryOsaka[i]);
      const beforeText = String(beforeData.commentaryOsaka[i]);

      if (beforeText === afterText) {
        continue;
      }

      // beforeTextとafterTextを比較
      // beforeTextが「これは」「この」などで始まり、
      // afterTextがそれを削除した形式で始まる場合
      const trimmedBefore = beforeText
        .replace(/^(これは|この|その|なん|第\d+条|)/, '');
      
      // afterTextの最初の100文字がtrimmedBeforeの最初の100文字と一致するか
      const afterStart = afterText.substring(0, 100);
      const beforeStart = trimmedBefore.substring(0, 100);

      if (afterStart.startsWith(beforeStart) && beforeText.length > afterText.length) {
        // 削除の可能性がある
        const deleteCount = beforeText.substring(0, beforeText.length - afterText.length).match(/^(これは|この|その|なん|第\d+条|)/)[0].length;
        
        if (deleteCount > 2) {
          hasIssue = true;
          break;
        }
      }
    }

    if (hasIssue) {
      const law = filePath.includes('minpou') ? '民法' : '商法';
      problematicFiles[law].push(filePath);
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
if (problematicFiles['民法'].length > 0) {
  console.log('民法:');
  for (const file of problematicFiles['民法']) {
    console.log(`- ${file}`);
  }
}

if (problematicFiles['商法'].length > 0) {
  console.log(problematicFiles['民法'].length > 0 ? '\n商法:' : '商法:');
  for (const file of problematicFiles['商法']) {
    console.log(`- ${file}`);
  }
}

// サマリー
const totalIssues = problematicFiles['民法'].length + problematicFiles['商法'].length;
if (totalIssues === 0) {
  console.log('問題のあるファイルは見つかりませんでした。');
} else {
  console.log(`\n=== サマリー ===`);
  console.log(`民法: ${problematicFiles['民法'].length}件`);
  console.log(`商法: ${problematicFiles['商法'].length}件`);
  console.log(`合計: ${totalIssues}件`);
}
