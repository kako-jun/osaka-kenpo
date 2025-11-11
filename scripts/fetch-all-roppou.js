#!/usr/bin/env node

/**
 * 六法（民法・商法・会社法・刑法・民事訴訟法・刑事訴訟法）を一括取得するスクリプト
 *
 * Usage:
 *   node scripts/fetch-all-roppou.js
 *
 * 環境変数:
 *   HTTPS_PROXY - HTTPSプロキシURL（例: http://proxy.example.com:8080）
 *   HTTP_PROXY  - HTTPプロキシURL（HTTPS_PROXYが未設定の場合に使用）
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 六法の定義
const ROPPOU = [
  { id: 'minpou', lawNum: '129AC0000000089', name: '民法', articles: 1050 },
  { id: 'shouhou', lawNum: '132AC0000000048', name: '商法', articles: 851 },
  { id: 'kaisya_hou', lawNum: '417AC0000000086', name: '会社法', articles: 979 },
  { id: 'keihou', lawNum: '140AC0000000045', name: '刑法', articles: 264 },
  { id: 'minji_soshou_hou', lawNum: '408AC0000000109', name: '民事訴訟法', articles: 404 },
  { id: 'keiji_soshou_hou', lawNum: '323AC0000000131', name: '刑事訴訟法', articles: 507 },
];

console.log('='.repeat(60));
console.log('📚 六法一括取得スクリプト');
console.log('='.repeat(60));
console.log(
  `取得対象: ${ROPPOU.length}法律 (計${ROPPOU.reduce((sum, law) => sum + law.articles, 0)}条)`
);
console.log('='.repeat(60));
console.log('');

ROPPOU.forEach((law, index) => {
  console.log(`  ${index + 1}. ${law.name} (${law.articles}条)`);
});

console.log('');
console.log('='.repeat(60));
console.log('⚠️  注意:');
console.log('  - この処理には数分から数十分かかります');
console.log('  - インターネット接続が必要です');
console.log('  - プロキシが必要な場合は環境変数を設定してください');
console.log('='.repeat(60));
console.log('');

/**
 * 単一の法律を取得
 */
function fetchLaw(law) {
  return new Promise((resolve, reject) => {
    console.log('\n' + '='.repeat(60));
    console.log(`📖 ${law.name}を取得中...`);
    console.log('='.repeat(60));

    const scriptPath = path.join(__dirname, 'fetch-egov-law.js');
    const child = spawn('node', [scriptPath, law.id, law.lawNum], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${law.name}の取得が完了しました\n`);
        resolve();
      } else {
        console.error(`\n❌ ${law.name}の取得に失敗しました (終了コード: ${code})\n`);
        reject(new Error(`${law.name}の取得失敗`));
      }
    });

    child.on('error', (error) => {
      console.error(`\n❌ ${law.name}の実行エラー:`, error);
      reject(error);
    });
  });
}

/**
 * スリープ関数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * メイン処理
 */
async function main() {
  const startTime = Date.now();
  const results = {
    success: [],
    failed: [],
  };

  console.log('🚀 取得を開始します...\n');

  for (let i = 0; i < ROPPOU.length; i++) {
    const law = ROPPOU[i];

    try {
      await fetchLaw(law);
      results.success.push(law.name);

      // 次の法律の前に少し待機（API負荷軽減）
      if (i < ROPPOU.length - 1) {
        console.log('⏳ 5秒待機中...\n');
        await sleep(5000);
      }
    } catch (error) {
      results.failed.push(law.name);
      console.error(`\n⚠️  ${law.name}をスキップして続行します\n`);
    }
  }

  // 結果サマリー
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log('\n' + '='.repeat(60));
  console.log('📊 取得完了サマリー');
  console.log('='.repeat(60));
  console.log(`処理時間: ${duration}秒`);
  console.log(`成功: ${results.success.length}/${ROPPOU.length}法律`);

  if (results.success.length > 0) {
    console.log('\n✅ 取得成功:');
    results.success.forEach((name) => console.log(`  - ${name}`));
  }

  if (results.failed.length > 0) {
    console.log('\n❌ 取得失敗:');
    results.failed.forEach((name) => console.log(`  - ${name}`));
  }

  console.log('='.repeat(60));

  if (results.success.length === ROPPOU.length) {
    console.log('\n🎉 全ての法律の取得に成功しました！');
    console.log(`\n📂 データは src/data/laws/jp/ に保存されています`);
    process.exit(0);
  } else {
    console.log('\n⚠️  一部の法律の取得に失敗しました');
    console.log('失敗した法律は個別に再実行してください:');
    results.failed.forEach((name) => {
      const law = ROPPOU.find((l) => l.name === name);
      if (law) {
        console.log(`  node scripts/fetch-egov-law.js ${law.id} ${law.lawNum}`);
      }
    });
    process.exit(1);
  }
}

// 実行
main().catch((error) => {
  console.error('\n❌ 予期しないエラーが発生しました:', error);
  process.exit(1);
});
