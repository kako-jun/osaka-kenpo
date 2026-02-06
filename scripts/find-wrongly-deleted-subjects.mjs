#!/usr/bin/env node

import { readFileSync } from 'fs';
import { globSync } from 'glob';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

// de75d401とHEADで変更されたファイルを取得
const changedFiles = execSync('git diff de75d401..HEAD --name-only', { encoding: 'utf-8' })
  .split('\n')
  .filter((f) => f.match(/src\/data\/laws\/jp\/.*\.yaml$/) && !f.includes('law_metadata'));

console.log(`チェック対象: ${changedFiles.length}ファイル\n`);

const issues = [];

for (const file of changedFiles) {
  if (!file) continue;

  try {
    // de75d401時点の内容
    const beforeContent = execSync(`git show de75d401:${file}`, { encoding: 'utf-8' });
    const beforeData = yaml.load(beforeContent);

    // 現在（HEAD）の内容
    const afterContent = readFileSync(file, 'utf-8');
    const afterData = yaml.load(afterContent);

    if (!beforeData?.commentaryOsaka || !afterData?.commentaryOsaka) continue;

    const beforeItems = beforeData.commentaryOsaka
      .split('\n')
      .filter((l) => l.trim().startsWith('- '));
    const afterItems = afterData.commentaryOsaka
      .split('\n')
      .filter((l) => l.trim().startsWith('- '));

    // 2段落目以降で主語削除されているかチェック
    for (let i = 1; i < beforeItems.length && i < afterItems.length; i++) {
      const before = beforeItems[i].trim();
      const after = afterItems[i].trim();

      // 2段落目以降で「これは、」「この条文は、」などが削除されているか
      if (
        before !== after &&
        (before.includes('これは、') ||
          before.includes('この条文は、') ||
          before.includes('この規定は、') ||
          before.includes('ここは、'))
      ) {
        const removed = before.replace(after, '').trim();
        if (removed.length > 0 && removed.length < 20) {
          issues.push({
            file,
            paragraph: i + 1,
            before: before.substring(0, 60),
            after: after.substring(0, 60),
            removed,
          });
          break; // 1ファイル1つ見つけたら次へ
        }
      }
    }
  } catch (e) {
    // skip
  }
}

console.log(`\n問題発見: ${issues.length}件\n`);

for (const issue of issues) {
  console.log(`${issue.file} (第${issue.paragraph}段落)`);
  console.log(`  削除: "${issue.removed}"`);
}

console.log(`\n修復対象ファイル一覧:\n`);
for (const issue of issues) {
  console.log(issue.file);
}
