#!/usr/bin/env node
/**
 * D1 REST APIをcurl経由で実行するスクリプト
 * プロキシ環境でも動作
 *
 * 使い方:
 *   node scripts/tools/d1-curl-execute.js db/schema-clean.sql
 *   node scripts/tools/d1-curl-execute.js db/seed.sql
 */

import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 設定
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '2382302b68c88c87f1cfe936739eb574';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
// 並列リクエスト数（コマンドラインで --parallel=N で指定可能）
let CONCURRENT_REQUESTS = 1; // デフォルトは順次実行（スキーマ用）
if (process.argv.includes('--parallel')) {
  const arg = process.argv.find((a) => a.startsWith('--parallel='));
  if (arg) CONCURRENT_REQUESTS = parseInt(arg.split('=')[1]) || 10;
  else CONCURRENT_REQUESTS = 10;
}

// wrangler.tomlからdatabase_idを読み取る
function getDatabaseId() {
  if (process.env.D1_DATABASE_ID) return process.env.D1_DATABASE_ID;
  const wranglerPath = path.join(rootDir, 'wrangler.toml');
  if (fs.existsSync(wranglerPath)) {
    const content = fs.readFileSync(wranglerPath, 'utf-8');
    const match = content.match(/database_id\s*=\s*"([^"]+)"/);
    if (match) return match[1];
  }
  throw new Error('D1_DATABASE_ID not found');
}

// SQLファイルをパース
function parseSQLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const statements = [];
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('--')) continue;
    current += ' ' + trimmed;
    if (trimmed.endsWith(';')) {
      statements.push(current.trim());
      current = '';
    }
  }
  return statements;
}

// curlでD1 APIを呼び出す
async function executeSQL(databaseId, sql) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${databaseId}/query`;

  // JSONをエスケープ
  const jsonBody = JSON.stringify({ sql });
  const escapedBody = jsonBody.replace(/'/g, "'\\''");

  const cmd = `curl -s -X POST '${url}' -H 'Authorization: Bearer ${API_TOKEN}' -H 'Content-Type: application/json' -d '${escapedBody}'`;

  try {
    const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });
    const data = JSON.parse(stdout);
    if (!data.success) {
      throw new Error(JSON.stringify(data.errors));
    }
    return data;
  } catch (error) {
    throw new Error(`curl failed: ${error.message}`);
  }
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node d1-curl-execute.js <sql-file>');
    process.exit(1);
  }

  if (!API_TOKEN) {
    console.error('CLOUDFLARE_API_TOKEN environment variable is required');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const databaseId = getDatabaseId();
  console.log(`Database ID: ${databaseId}`);
  console.log(`Concurrent requests: ${CONCURRENT_REQUESTS}`);
  console.log('');

  const statements = parseSQLFile(filePath);
  console.log(`Total statements: ${statements.length}`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  // 並列実行
  for (let i = 0; i < statements.length; i += CONCURRENT_REQUESTS) {
    const batch = statements.slice(i, i + CONCURRENT_REQUESTS);
    const promises = batch.map((sql, idx) =>
      executeSQL(databaseId, sql)
        .then(() => ({ success: true, idx: i + idx }))
        .catch((err) => ({
          success: false,
          idx: i + idx,
          error: err.message,
          sql: sql.substring(0, 50),
        }))
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        console.error(`\n[${result.idx}] Error: ${result.error}`);
        console.error(`  SQL: ${result.sql}...`);
      }
    }

    const progress = Math.min(i + CONCURRENT_REQUESTS, statements.length);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (successCount / parseFloat(elapsed)).toFixed(1);
    process.stdout.write(
      `\r[${progress}/${statements.length}] ${successCount} OK, ${errorCount} errors, ${elapsed}s, ${rate} stmt/s`
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nDone! ${successCount} OK, ${errorCount} errors in ${totalTime}s`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
