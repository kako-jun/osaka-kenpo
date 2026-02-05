#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const laws = [
  { name: 'keiji_soshou_hou', displayName: '刑事訴訟法' },
  { name: 'kaisya_hou', displayName: '会社法' },
  { name: 'shouhou', displayName: '商法' },
  { name: 'minpou', displayName: '民法' },
  { name: 'keihou', displayName: '刑法' },
  { name: 'minji_soshou_hou', displayName: '民事訴訟法' },
];

const basePath = 'src/data/laws/jp';

function isCommentaryEmpty(data) {
  if (!data.commentary) return true;
  if (typeof data.commentary === 'string') {
    return data.commentary.trim() === '';
  }
  return true;
}

function isDeletedArticle(data) {
  return (
    data.isDeleted === true ||
    data.deleted === true ||
    (data.originalText && data.originalText.includes('削除'))
  );
}

for (const law of laws) {
  const lawPath = path.join(basePath, law.name);
  const files = fs
    .readdirSync(lawPath)
    .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

  let emptyCount = 0;
  let deletedCount = 0;
  let totalCount = 0;
  const emptyFiles = [];

  for (const file of files) {
    const filePath = path.join(lawPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(content);

    if (!data) continue;

    totalCount++;

    if (isDeletedArticle(data)) {
      deletedCount++;
      continue;
    }

    if (isCommentaryEmpty(data)) {
      emptyCount++;
      emptyFiles.push(file);
    }
  }

  console.log(`\n【${law.displayName}】`);
  console.log(`  総条文数: ${totalCount}`);
  console.log(`  削除条文: ${deletedCount}`);
  console.log(`  commentary空: ${emptyCount}`);
  if (emptyCount > 0) {
    console.log(
      `  空ファイル例: ${emptyFiles.slice(0, 5).join(', ')}${emptyFiles.length > 5 ? '...' : ''}`
    );
  }
}
