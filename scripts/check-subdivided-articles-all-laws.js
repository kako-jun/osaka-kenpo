#!/usr/bin/env node

/**
 * 六法全体で枝番（_付き）条文がいくつあるかチェック
 */

import https from 'https';
import xml2js from 'xml2js';

const LAWS = {
  憲法: '321CONSTITUTION',
  民法: '129AC0000000089',
  商法: '132AC0000000048',
  会社法: '417AC0000000086',
  刑法: '140AC0000000045',
  民事訴訟法: '408AC0000000109',
  刑事訴訟法: '323AC0000000131',
};

async function fetchLawXML(lawId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'elaws.e-gov.go.jp',
      path: `/api/1/lawdata/${lawId}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; osaka-kenpo-fetcher/1.0)',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

function findAllArticles(node, articles = [], isSuppl = false) {
  if (!node) return articles;

  // 附則の処理
  if (node.SupplProvision) {
    const supplNodes = Array.isArray(node.SupplProvision)
      ? node.SupplProvision
      : [node.SupplProvision];
    supplNodes.forEach((supplNode) => findAllArticles(supplNode, articles, true));
  }

  // Article要素を探す
  if (node.Article) {
    const articleNodes = Array.isArray(node.Article) ? node.Article : [node.Article];
    articleNodes.forEach((article) => {
      if (article.$?.Num) {
        articles.push({
          num: article.$.Num,
          isSuppl: isSuppl,
        });
      }
    });
  }

  // 子ノードを再帰的に探索
  const childKeys = ['Chapter', 'Section', 'Subsection', 'Division', 'Part', 'Paragraph'];
  for (const key of childKeys) {
    if (node[key]) {
      const children = Array.isArray(node[key]) ? node[key] : [node[key]];
      children.forEach((child) => findAllArticles(child, articles, isSuppl));
    }
  }

  return articles;
}

async function checkLaw(lawName, lawId) {
  try {
    console.log(`\n【${lawName}】`);
    console.log('  取得中...');

    const xmlData = await fetchLawXML(lawId);

    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    const lawBody = result?.ApplData?.LawFullText?.[0]?.Law?.[0]?.LawBody?.[0];
    if (!lawBody) {
      console.log('  ❌ LawBodyが見つかりません');
      return { total: 0, subdivided: 0, list: [] };
    }

    const articles = [];

    // 本則
    if (lawBody.MainProvision?.[0]) {
      findAllArticles(lawBody.MainProvision[0], articles, false);
    }

    // 附則
    if (lawBody.SupplProvision) {
      const supplNodes = Array.isArray(lawBody.SupplProvision)
        ? lawBody.SupplProvision
        : [lawBody.SupplProvision];
      supplNodes.forEach((supplNode) => findAllArticles(supplNode, articles, true));
    }

    const totalCount = articles.length;
    const subdivided = articles.filter((a) => a.num.includes('_'));
    const subdividedCount = subdivided.length;

    console.log(`  総条文数: ${totalCount}条`);
    console.log(`  枝番条文: ${subdividedCount}条`);

    if (subdividedCount > 0) {
      const examples = subdivided
        .slice(0, 10)
        .map((a) => a.num)
        .join(', ');
      console.log(`  枝番の例: ${examples}${subdividedCount > 10 ? '...' : ''}`);

      if (subdividedCount >= 10) {
        const allSubdivided = subdivided.map((a) => a.num).sort();
        console.log(`  すべての枝番:`);
        // 10個ずつ改行
        for (let i = 0; i < allSubdivided.length; i += 10) {
          const chunk = allSubdivided.slice(i, i + 10);
          console.log(`    ${chunk.join(', ')}`);
        }
      }
    }

    return {
      total: totalCount,
      subdivided: subdividedCount,
      list: subdivided.map((a) => a.num),
    };
  } catch (error) {
    console.log(`  ❌ エラー: ${error.message}`);
    return { total: 0, subdivided: 0, list: [] };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('六法の枝番条文チェック');
  console.log('='.repeat(70));

  let grandTotal = 0;
  let grandSubdivided = 0;

  for (const [lawName, lawId] of Object.entries(LAWS)) {
    const result = await checkLaw(lawName, lawId);
    grandTotal += result.total;
    grandSubdivided += result.subdivided;

    // レート制限対策
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log(`合計: ${grandTotal}条（うち枝番: ${grandSubdivided}条）`);
  console.log('='.repeat(70));
}

main().catch((error) => {
  console.error('致命的エラー:', error);
  process.exit(1);
});
