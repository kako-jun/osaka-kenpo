#!/usr/bin/env node
/**
 * 条文カウンター一括作成スクリプト
 *
 * src/data/laws/ 配下のYAMLから全条文IDを収集し、
 * NostalgicCounter の batchCreate API で100件ずつカウンターを作成する。
 *
 * 使い方:
 *   node scripts/tools/create-counters.js --token <TOKEN>
 *   node scripts/tools/create-counters.js --dry-run   # 作成対象のみ表示
 *
 * 環境変数でも指定可:
 *   NOSTALGIC_TOKEN=<TOKEN> node scripts/tools/create-counters.js
 */

const fs = require('fs');
const path = require('path');

const COUNTER_API_BASE = 'https://api.nostalgic.llll-ll.com/visit';
const SITE_BASE = 'https://osaka-kenpo.llll-ll.com';
const BATCH_LIMIT = 100;

function collectArticleIds() {
  const lawsDir = path.resolve(__dirname, '../../src/data/laws');
  const items = [];

  function walk(dir, parts) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...parts, entry.name]);
      } else if (entry.name.endsWith('.yaml') && entry.name !== 'law_metadata.yaml') {
        const article = entry.name.replace('.yaml', '');
        if (parts.length >= 2) {
          const category = parts[0];
          const law = parts[1];
          items.push({ category, law, article });
        }
      }
    }
  }

  walk(lawsDir, []);
  return items;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  let token = process.env.NOSTALGIC_TOKEN;
  const tokenIdx = args.indexOf('--token');
  if (tokenIdx !== -1 && args[tokenIdx + 1]) {
    token = args[tokenIdx + 1];
  }

  if (!dryRun && !token) {
    console.error(
      'エラー: トークンが必要です。--token <TOKEN> または NOSTALGIC_TOKEN 環境変数を指定してください。'
    );
    process.exit(1);
  }

  const articles = collectArticleIds();
  console.log(`条文数: ${articles.length}`);

  // 統計表示
  const byCategory = {};
  for (const { category } of articles) {
    byCategory[category] = (byCategory[category] || 0) + 1;
  }
  console.log('\n【カテゴリ別集計】');
  for (const [cat, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${cat}: ${count}件`);
  }

  // batchCreate 用のアイテムを構築
  const items = articles.map(({ category, law, article }) => ({
    id: `osaka-kenpo-${category}-${law}-${article}`,
    url: `${SITE_BASE}/law/${category}/${law}/${article}`,
  }));

  if (dryRun) {
    console.log(`\n【ドライラン】 ${items.length}件のカウンターを作成予定`);
    console.log('\nサンプル (最初10件):');
    for (const item of items.slice(0, 10)) {
      console.log(`  ${item.id} -> ${item.url}`);
    }
    return;
  }

  // 100件ずつ batchCreate
  let created = 0;
  let errors = 0;

  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const batch = items.slice(i, i + BATCH_LIMIT);
    const batchNum = Math.floor(i / BATCH_LIMIT) + 1;
    const totalBatches = Math.ceil(items.length / BATCH_LIMIT);

    try {
      const response = await fetch(`${COUNTER_API_BASE}?action=batchCreate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, items: batch }),
      });

      const data = await response.json();

      if (data.success) {
        created += batch.length;
        console.log(`  バッチ ${batchNum}/${totalBatches}: ${batch.length}件 OK`);
      } else {
        errors += batch.length;
        console.error(`  バッチ ${batchNum}/${totalBatches}: エラー - ${JSON.stringify(data)}`);
      }
    } catch (err) {
      errors += batch.length;
      console.error(`  バッチ ${batchNum}/${totalBatches}: 通信エラー - ${err.message}`);
    }
  }

  console.log(`\n完了: ${created}件作成, ${errors}件エラー`);
}

main().catch((err) => {
  console.error('予期せぬエラー:', err);
  process.exit(1);
});
