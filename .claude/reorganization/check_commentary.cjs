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

const basePath = '/home/kako-jun/repos/2025/osaka-kenpo/src/data/laws/jp';

for (const law of laws) {
  console.log(`\n=== ${law.displayName} (${law.name}) ===`);
  const lawPath = path.join(basePath, law.name);

  let emptyCommentary = [];
  let hasCommentary = [];
  let missingFiles = [];

  for (let i = 1; i <= 50; i++) {
    const fileName = `${i}.yaml`;
    const filePath = path.join(lawPath, fileName);

    if (!fs.existsSync(filePath)) {
      missingFiles.push(i);
      continue;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      const commentary = data.commentary;
      if (
        !commentary ||
        (Array.isArray(commentary) && commentary.length === 0) ||
        (typeof commentary === 'string' && commentary.trim() === '')
      ) {
        emptyCommentary.push(i);
      } else {
        hasCommentary.push(i);
      }
    } catch (e) {
      console.log(`  エラー: ${fileName} - ${e.message}`);
    }
  }

  console.log(`  commentaryあり: ${hasCommentary.length}条`);
  console.log(`  commentary空: ${emptyCommentary.length}条`);
  if (missingFiles.length > 0) {
    console.log(
      `  ファイルなし: ${missingFiles.length}条 (${missingFiles.slice(0, 10).join(', ')}${missingFiles.length > 10 ? '...' : ''})`
    );
  }

  if (emptyCommentary.length > 0) {
    console.log(`  空のcommentaryリスト: ${emptyCommentary.join(', ')}`);
  }
}
