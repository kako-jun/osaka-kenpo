#!/usr/bin/env node

import { readFileSync } from 'fs';
import { globSync } from 'glob';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

// 対象のコミット範囲
const COMMITS = [
  '97b6c8c38869c0a828d451224b24d13802a0074a',
  '31c6d664595dc46ea83908386ea6393d299136dd',
  '3b1db073cf842c630826958535efc7c531e4bd21',
  'b4ff4e8156aa3907a724d4bc54b93a77eed75cd1',
  '03cc84345f9b5ff9b426f64541b4bc161b0662b2',
];

console.log('🔍 2段落目以降が誤削除された条文を検出中...\n');

const issues = [];

// 各コミットで変更されたファイルをチェック
for (const commit of COMMITS) {
  console.log(`📝 チェック中: ${commit.substring(0, 8)}`);
  
  try {
    // このコミットで変更されたYAMLファイルを取得
    const changedFiles = execSync(`git diff --name-only ${commit}^..${commit}`, { encoding: 'utf-8' })
      .split('\n')
      .filter(f => f.match(/src\/data\/laws\/jp\/.*\.yaml$/) && !f.includes('law_metadata'));
    
    console.log(`   ${changedFiles.length}ファイルをチェック`);
    
    for (const file of changedFiles) {
      if (!file) continue;
      
      try {
        // コミット前の内容を取得
        const beforeContent = execSync(`git show ${commit}^:${file}`, { encoding: 'utf-8' });
        const beforeData = yaml.load(beforeContent);
        
        // コミット後の内容を取得
        const afterContent = execSync(`git show ${commit}:${file}`, { encoding: 'utf-8' });
        const afterData = yaml.load(afterContent);
        
        if (!beforeData?.commentaryOsaka || !afterData?.commentaryOsaka) continue;
        
        const beforeCommentary = beforeData.commentaryOsaka;
        const afterCommentary = afterData.commentaryOsaka;
        
        // 段落数をチェック（\n\nで分割）
        const beforeParagraphs = beforeCommentary.split('\n\n').filter(p => p.trim());
        const afterParagraphs = afterCommentary.split('\n\n').filter(p => p.trim());
        
        // 2段落以上あったのに段落が減った場合は問題の可能性
        if (beforeParagraphs.length >= 2 && afterParagraphs.length < beforeParagraphs.length) {
          issues.push({
            file,
            commit: commit.substring(0, 8),
            beforeParagraphs: beforeParagraphs.length,
            afterParagraphs: afterParagraphs.length,
            articleNumber: beforeData.articleNumber || afterData.articleNumber,
            lawName: file.split('/')[4],
            beforeFirst50: beforeParagraphs[1].substring(0, 50),
          });
        }
      } catch (error) {
        // ファイルが存在しない場合はスキップ
      }
    }
  } catch (error) {
    console.log(`   ⚠️ コミット ${commit.substring(0, 8)} の処理中にエラー: ${error.message}`);
  }
}
    } catch (error) {
      // ファイルが存在しない場合はスキップ
    }
  }
}

console.log('\n📊 検出結果:\n');

if (issues.length === 0) {
  console.log('✅ 問題は検出されませんでした');
} else {
  console.log(`⚠️  ${issues.length}件の問題を検出しました:\n`);

  // 法律ごとにグループ化
  const grouped = {};
  for (const issue of issues) {
    if (!grouped[issue.lawName]) grouped[issue.lawName] = [];
    grouped[issue.lawName].push(issue);
  }

  for (const [lawName, items] of Object.entries(grouped)) {
    console.log(`\n【${lawName}】 ${items.length}件`);
    for (const item of items) {
      console.log(`  - 第${item.articleNumber}条 (${item.file})`);
      console.log(
        `    ${item.beforeParagraphs}段落 → ${item.afterParagraphs}段落 (コミット: ${item.commit})`
      );
    }
  }

  // 修復用の情報を出力
  console.log('\n\n📋 修復対象ファイル一覧:');
  for (const issue of issues) {
    console.log(issue.file);
  }
}
