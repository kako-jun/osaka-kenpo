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

const stats = {
  totalFiles: changedFiles.length,
  filesWithMultipleCommentary: 0,
  filesWithPotentialIssues: []
};

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
      stats.filesWithMultipleCommentary++;
      
      const firstItem = data.commentaryOsaka[0];
      const secondItem = data.commentaryOsaka[1];
      
      const firstText = typeof firstItem === 'string' ? firstItem : firstItem?.text || '';
      const secondText = typeof secondItem === 'string' ? secondItem : secondItem?.text || '';
      
      // 最初と2番目の長さの比率をチェック
      const ratio = firstText.length > 0 ? secondText.length / firstText.length : 0;
      
      // 2番目が異常に短い場合（1番目の20%以下）をフラグ
      if (ratio < 0.2 && secondText.length < 100) {
        stats.filesWithPotentialIssues.push({
          file: filePath,
          firstLength: firstText.length,
          secondLength: secondText.length,
          ratio: (ratio * 100).toFixed(1),
          secondPreview: secondText.substring(0, 60),
          firstPreview: firstText.substring(0, 60)
        });
      }
    }
  } catch (e) {
    // ファイル解析エラーはスキップ
  }
}

console.log(`複数のcommentaryOsakaを持つファイル: ${stats.filesWithMultipleCommentary}`);
console.log(`潜在的な問題ファイル: ${stats.filesWithPotentialIssues.length}\n`);

if (stats.filesWithPotentialIssues.length > 0) {
  console.log('===== 詳細 =====\n');
  
  const byLaw = {};
  for (const issue of stats.filesWithPotentialIssues) {
    const law = issue.file.includes('minpou') ? '民法' : '商法';
    if (!byLaw[law]) byLaw[law] = [];
    byLaw[law].push(issue);
  }
  
  for (const law of Object.keys(byLaw).sort()) {
    console.log(`${law} (${byLaw[law].length}件):`);
    for (const issue of byLaw[law].slice(0, 5)) {
      console.log(`  - ${issue.file}`);
      console.log(`    1番目: ${issue.firstLength}文字 "${issue.firstPreview}..."`);
      console.log(`    2番目: ${issue.secondLength}文字 "${issue.secondPreview}..."`);
      console.log(`    比率: ${issue.ratio}%`);
    }
    if (byLaw[law].length > 5) {
      console.log(`    ... 他${byLaw[law].length - 5}件`);
    }
    console.log();
  }
} else {
  console.log('特別な問題は検出されませんでした。');
}
