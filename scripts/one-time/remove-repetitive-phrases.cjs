#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LAW_DIR = '/home/user/osaka-kenpo/src/data/laws/jp/keiji_soshou_hou';

// Repetitive phrases to remove
const REPETITIVE_PHRASES = [
  'ほんでな、この条文が定めてるのは具体的にはこういうことやねん。',
  /この第\d+条はな、実務でもよう使われる規定なんや。/,
  'これな、刑事訴訟の手続きで大事な条文やねん。',
  'この規定があることで、被告人の権利が守られてるっていうわけやねん。',
  '実際の裁判では、こういうルールをきっちり守って進めていくんやな。',
  'こういう細かい手続きの積み重ねが、公正な裁判を支えてるんやで。',
  '法律って難しそうに見えるけど、一つ一つ理解していけば、ちゃんと筋が通ってるんや。',
];

function containsRepetitivePhrase(text) {
  // Remove leading "- " for comparison
  const content = text.replace(/^-\s*/, '').trim();

  for (const phrase of REPETITIVE_PHRASES) {
    if (phrase instanceof RegExp) {
      if (phrase.test(content)) {
        return true;
      }
    } else {
      if (content.includes(phrase)) {
        return true;
      }
    }
  }

  return false;
}

function removeRepetitivePhrases(text) {
  // Remove leading "- " for processing
  const content = text.replace(/^-\s*/, '').trim();
  let result = content;

  REPETITIVE_PHRASES.forEach(phrase => {
    if (phrase instanceof RegExp) {
      result = result.replace(phrase, '');
    } else {
      result = result.split(phrase).join('');
    }
  });

  result = result.trim();

  // If nothing is left after removing phrases, return empty
  if (!result) {
    return '';
  }

  // Restore the "- " prefix if there's content
  return '- ' + result;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Find commentaryOsaka section
    const lines = content.split('\n');
    let inCommentaryOsaka = false;
    let modifiedLines = [];
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim() === 'commentaryOsaka:') {
        inCommentaryOsaka = true;
        modifiedLines.push(line);
        continue;
      }

      if (inCommentaryOsaka && line.startsWith('- ')) {
        // Check if this line contains repetitive phrases
        if (containsRepetitivePhrase(line)) {
          const cleaned = removeRepetitivePhrases(line);
          if (cleaned && cleaned.trim() !== '-' && cleaned.trim() !== '') {
            modifiedLines.push(cleaned);
            modified = true;
          } else {
            // Line was entirely repetitive, skip it
            modified = true;
          }
        } else {
          // No repetitive phrases, keep as is
          modifiedLines.push(line);
        }
      } else {
        if (inCommentaryOsaka && line.trim() !== '' && !line.startsWith(' ')) {
          inCommentaryOsaka = false;
        }
        modifiedLines.push(line);
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Process regular articles 351-516
let processed = 0;
let modified = 0;
let errors = [];

console.log('Processing articles 351-516...');
for (let i = 351; i <= 516; i++) {
  // Skip deleted articles
  if (i >= 368 && i <= 370) {
    continue;
  }

  const filePath = path.join(LAW_DIR, `${i}.yaml`);
  if (fs.existsSync(filePath)) {
    processed++;
    if (processFile(filePath)) {
      modified++;
    }
  } else {
    errors.push(`Article ${i}.yaml not found`);
  }
}

// Process supplemental articles
console.log('Processing supplemental articles...');
const supplFiles = fs.readdirSync(LAW_DIR)
  .filter(f => f.match(/^suppl_\d+\.yaml$/))
  .filter(f => {
    const num = parseInt(f.match(/\d+/)[0]);
    return num >= 1 && num <= 26;
  });

supplFiles.forEach(file => {
  const filePath = path.join(LAW_DIR, file);
  processed++;
  if (processFile(filePath)) {
    modified++;
  }
});

console.log('\n=== Summary ===');
console.log(`Total files processed: ${processed}`);
console.log(`Files modified: ${modified}`);
console.log(`Files unchanged: ${processed - modified}`);
if (errors.length > 0) {
  console.log(`\nErrors: ${errors.length}`);
  errors.forEach(err => console.log(`  - ${err}`));
}
