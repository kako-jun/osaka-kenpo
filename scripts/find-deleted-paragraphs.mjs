#!/usr/bin/env node

import yaml from 'js-yaml';
import { execSync } from 'child_process';

const COMMITS = [
  '97b6c8c38869c0a828d451224b24d13802a0074a',
  '31c6d664595dc46ea83908386ea6393d299136dd',
  '3b1db073cf842c630826958535efc7c531e4bd21',
  'b4ff4e8156aa3907a724d4bc54b93a77eed75cd1',
  '03cc84345f9b5ff9b426f64541b4bc161b0662b2',
];

console.log('🔍 2段落目以降が誤削除された条文を検出中...\n');

const issues = [];

for (const commit of COMMITS) {
  console.log(`チェック中: ${commit.substring(0, 8)}`);

  const changedFiles = execSync(`git diff --name-only ${commit}^..${commit}`, { encoding: 'utf-8' })
    .split('\n')
    .filter((f) => f.match(/src\/data\/laws\/jp\/.*\.yaml$/) && !f.includes('law_metadata'));

  for (const file of changedFiles) {
    if (!file) continue;

    try {
      const beforeContent = execSync(`git show ${commit}^:${file}`, { encoding: 'utf-8' });
      const beforeData = yaml.load(beforeContent);

      const afterContent = execSync(`git show ${commit}:${file}`, { encoding: 'utf-8' });
      const afterData = yaml.load(afterContent);

      if (!beforeData?.commentaryOsaka || !afterData?.commentaryOsaka) continue;

      const beforeParagraphs = beforeData.commentaryOsaka.split('\n\n').filter((p) => p.trim());
      const afterParagraphs = afterData.commentaryOsaka.split('\n\n').filter((p) => p.trim());

      if (beforeParagraphs.length >= 2 && afterParagraphs.length < beforeParagraphs.length) {
        issues.push({
          file,
          commit: commit.substring(0, 8),
          before: beforeParagraphs.length,
          after: afterParagraphs.length,
          article: beforeData.articleNumber || afterData.articleNumber,
        });
      }
    } catch (e) {
      // skip
    }
  }
}

console.log(`\n見つかった問題: ${issues.length}件\n`);

for (const issue of issues) {
  console.log(`${issue.file} (第${issue.article}条)`);
  console.log(`  ${issue.before}段落 → ${issue.after}段落 [${issue.commit}]`);
}
