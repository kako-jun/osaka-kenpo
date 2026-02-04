const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const minpouDir = '/home/kako-jun/repos/2025/osaka-kenpo/src/data/laws/jp/minpou';

// Read the empty commentary list
const emptyList = JSON.parse(
  fs.readFileSync('/home/kako-jun/repos/2025/osaka-kenpo/empty_commentary_osaka.json', 'utf8')
);

// Filter out deleted articles
const filesToProcess = [];
for (const file of emptyList) {
  const filePath = path.join(minpouDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const data = yaml.load(content);

  // Skip if deleted
  if (data.isDeleted) {
    continue;
  }

  filesToProcess.push({
    file: file,
    article: data.article,
    title: data.title || '(no title)',
    hasContent: data.originalText && data.originalText.length > 0,
  });
}

console.log(`Files to process (excluding deleted): ${filesToProcess.length}`);
console.log('\n--- First 50 files to process ---');
filesToProcess.slice(0, 50).forEach((item, idx) => {
  console.log(
    `${idx + 1}. ${item.file}: Article ${item.article} - ${item.title} ${item.hasContent ? '' : '[NO CONTENT]'}`
  );
});

// Save filtered list
fs.writeFileSync(
  '/home/kako-jun/repos/2025/osaka-kenpo/files_to_process.json',
  JSON.stringify(filesToProcess, null, 2)
);
console.log(`\nSaved filtered list to files_to_process.json`);
