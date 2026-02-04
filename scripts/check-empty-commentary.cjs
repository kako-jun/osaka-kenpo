const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const minpouDir = '/home/kako-jun/repos/2025/osaka-kenpo/src/data/laws/jp/minpou';

// Get all yaml files except law_metadata.yaml
const files = fs
  .readdirSync(minpouDir)
  .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml')
  .sort((a, b) => {
    const numA = parseInt(a.replace('.yaml', '').replace('-', '.'));
    const numB = parseInt(b.replace('.yaml', '').replace('-', '.'));
    return numA - numB;
  });

console.log(`Total files: ${files.length}`);

const emptyCommentaryOsaka = [];
const withCommentaryOsaka = [];

for (const file of files) {
  const filePath = path.join(minpouDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);

  // Check if commentaryOsaka is empty (null, undefined, empty array, or empty string)
  const isEmpty =
    !data.commentaryOsaka ||
    (Array.isArray(data.commentaryOsaka) && data.commentaryOsaka.length === 0) ||
    (Array.isArray(data.commentaryOsaka) &&
      data.commentaryOsaka.every((item) => !item || item === ''));

  if (isEmpty) {
    emptyCommentaryOsaka.push({
      file: file,
      article: data.article,
      title: data.title || '(no title)',
    });
  } else {
    withCommentaryOsaka.push({
      file: file,
      article: data.article,
      title: data.title || '(no title)',
    });
  }
}

console.log(`\nFiles WITH commentaryOsaka: ${withCommentaryOsaka.length}`);
console.log(`Files WITHOUT commentaryOsaka: ${emptyCommentaryOsaka.length}`);

console.log(`\n--- First 20 files WITHOUT commentaryOsaka ---`);
emptyCommentaryOsaka.slice(0, 20).forEach((item) => {
  console.log(`  ${item.file}: Article ${item.article} - ${item.title}`);
});

if (emptyCommentaryOsaka.length > 20) {
  console.log(`  ... and ${emptyCommentaryOsaka.length - 20} more`);
}

// Save the list for later use
const emptyList = emptyCommentaryOsaka.map((item) => item.file);
fs.writeFileSync(
  '/home/kako-jun/repos/2025/osaka-kenpo/empty_commentary_osaka.json',
  JSON.stringify(emptyList, null, 2)
);
console.log(`\nSaved list to empty_commentary_osaka.json`);
