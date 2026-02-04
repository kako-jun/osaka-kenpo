const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const lawDir = 'src/data/laws/jp/minji_soshou_hou';

// Get all yaml files excluding law_metadata.yaml
const files = fs
  .readdirSync(lawDir)
  .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml')
  .sort((a, b) => {
    const numA = parseInt(a.replace('.yaml', '').split('-')[0]);
    const numB = parseInt(b.replace('.yaml', '').split('-')[0]);
    return numA - numB || a.localeCompare(b);
  });

const emptyCommentaryFiles = [];
const filledCommentaryFiles = [];

files.forEach((file) => {
  const filePath = path.join(lawDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);

  // Skip deleted articles
  if (data.isDeleted) {
    return;
  }

  // Check if commentary is empty or not
  if (
    !data.commentary ||
    data.commentary.length === 0 ||
    (data.commentary.length === 1 && data.commentary[0] === '') ||
    data.commentary.every((c) => !c || c.trim() === '')
  ) {
    emptyCommentaryFiles.push({
      file,
      article: data.article,
      title: data.title,
    });
  } else {
    filledCommentaryFiles.push(file);
  }
});

console.log(`総ファイル数: ${files.length}`);
console.log(`commentaryあり: ${filledCommentaryFiles.length}`);
console.log(`commentary空欄: ${emptyCommentaryFiles.length}`);
console.log('\n--- commentaryが空のファイル ---');
emptyCommentaryFiles.forEach((item) => {
  console.log(`${item.file} (第${item.article}条: ${item.title})`);
});

// Save to file for processing
fs.writeFileSync('empty_commentary_list.json', JSON.stringify(emptyCommentaryFiles, null, 2));
console.log(`\nリストを empty_commentary_list.json に保存しました`);
