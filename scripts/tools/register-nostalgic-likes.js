#!/usr/bin/env node

/**
 * nostalgic like サービス一括登録スクリプト
 * 全条文に対して nostalgic の like サービスを batchCreate で登録する
 *
 * 使い方:
 *   node scripts/tools/register-nostalgic-likes.js --token=YOUR_TOKEN [--dry-run] [--api-url=URL]
 */

const fs = require('fs');
const path = require('path');

const OSAKA_KENPO_BASE = 'https://osaka-kenpo.llll-ll.com';
const DEFAULT_API_URL = 'https://api.nostalgic.llll-ll.com/api/like';
const BATCH_SIZE = 100;

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      args[key] = valueParts.length > 0 ? valueParts.join('=') : true;
    }
  }
  return args;
}

function collectArticles(lawsDir) {
  const items = [];

  const categories = fs
    .readdirSync(lawsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const category of categories) {
    const categoryDir = path.join(lawsDir, category);
    const laws = fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const law of laws) {
      const lawDir = path.join(categoryDir, law);
      const files = fs
        .readdirSync(lawDir)
        .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
        .filter((f) => f !== 'metadata.yaml' && f !== 'chapters.yaml' && f !== 'famous.yaml');

      for (const file of files) {
        const article = file.replace(/\.ya?ml$/, '');
        const id = `osaka-kenpo-${category}-${law}-${article}`;
        const url = `${OSAKA_KENPO_BASE}/law/${category}/${law}/${article}`;
        items.push({ id, url });
      }
    }
  }

  return items;
}

async function batchCreate(apiUrl, token, items) {
  const response = await fetch(`${apiUrl}?action=batchCreate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, items }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function main() {
  const args = parseArgs();

  if (!args.token) {
    console.error(
      'Usage: node register-nostalgic-likes.js --token=YOUR_TOKEN [--dry-run] [--api-url=URL]'
    );
    process.exit(1);
  }

  const apiUrl = args['api-url'] || DEFAULT_API_URL;
  const dryRun = !!args['dry-run'];
  const lawsDir = path.join(__dirname, '../../src/data/laws');

  console.log(`Laws directory: ${lawsDir}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`Dry run: ${dryRun}`);
  console.log('');

  const items = collectArticles(lawsDir);
  console.log(`Found ${items.length} articles to register`);
  console.log('');

  if (dryRun) {
    console.log('First 10 items:');
    items.slice(0, 10).forEach((item) => console.log(`  ${item.id} → ${item.url}`));
    console.log('...');
    console.log(
      `\nDry run complete. Would register ${items.length} items in ${Math.ceil(items.length / BATCH_SIZE)} batches.`
    );
    return;
  }

  let totalCreated = 0;
  let totalSkipped = 0;
  const totalBatches = Math.ceil(items.length / BATCH_SIZE);

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} items)... `);

    try {
      const result = await batchCreate(apiUrl, args.token, batch);
      totalCreated += result.created || 0;
      totalSkipped += result.skipped || 0;
      console.log(`created: ${result.created}, skipped: ${result.skipped}`);
    } catch (error) {
      console.error(`ERROR: ${error.message}`);
      console.log('Retrying in 2 seconds...');
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const result = await batchCreate(apiUrl, args.token, batch);
        totalCreated += result.created || 0;
        totalSkipped += result.skipped || 0;
        console.log(`  Retry succeeded: created: ${result.created}, skipped: ${result.skipped}`);
      } catch (retryError) {
        console.error(`  Retry failed: ${retryError.message}`);
      }
    }

    // Rate limiting
    if (i + BATCH_SIZE < items.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Total articles: ${items.length}`);
  console.log(`Created: ${totalCreated}`);
  console.log(`Skipped: ${totalSkipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
