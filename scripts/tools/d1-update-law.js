#!/usr/bin/env node
/**
 * 特定の法律だけをD1にアップデートするスクリプト
 *
 * 使い方:
 *   node scripts/tools/d1-update-law.js jp minpou
 *   node scripts/tools/d1-update-law.js jp keihou
 *
 * 全法律をリスト表示:
 *   node scripts/tools/d1-update-law.js --list
 *
 * これは以下を実行:
 *   1. 対象法律のデータをDBから削除
 *   2. YAMLから新しいデータを生成
 *   3. D1 APIで挿入
 */

import { execSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const dataDir = path.join(rootDir, 'src/data/laws');

// 設定
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '2382302b68c88c87f1cfe936739eb574';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

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

// SQLエスケープ
function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str !== 'string') str = JSON.stringify(str);
  return `'${str.replace(/'/g, "''")}'`;
}

function arrayToJSON(arr) {
  if (!arr || !Array.isArray(arr)) return null;
  return JSON.stringify(arr);
}

function loadYAML(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content);
  } catch (e) {
    return null;
  }
}

// 利用可能な法律をリスト表示
function listLaws() {
  console.log('利用可能な法律:\n');
  const categories = fs.readdirSync(dataDir).filter((name) => {
    const fullPath = path.join(dataDir, name);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const category of categories) {
    console.log(`[${category}]`);
    const categoryDir = path.join(dataDir, category);
    const laws = fs.readdirSync(categoryDir).filter((name) => {
      const fullPath = path.join(categoryDir, name);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const lawName of laws) {
      const metadataPath = path.join(categoryDir, lawName, 'law_metadata.yaml');
      const metadata = loadYAML(metadataPath);
      const displayName = metadata?.name || lawName;
      console.log(`  ${lawName} - ${displayName}`);
    }
    console.log('');
  }
}

// 特定法律のSQL文を生成
function generateLawSQL(category, lawName) {
  const statements = [];
  const lawDir = path.join(dataDir, category, lawName);

  if (!fs.existsSync(lawDir)) {
    throw new Error(`Law directory not found: ${lawDir}`);
  }

  // 1. 既存データを削除
  statements.push(
    `DELETE FROM articles WHERE category = '${category}' AND law_name = '${lawName}';`
  );
  statements.push(
    `DELETE FROM chapters WHERE category = '${category}' AND law_name = '${lawName}';`
  );
  statements.push(
    `DELETE FROM famous_articles WHERE category = '${category}' AND law_name = '${lawName}';`
  );
  statements.push(`DELETE FROM laws WHERE category = '${category}' AND name = '${lawName}';`);

  // 2. law_metadata.yaml
  const metadataPath = path.join(lawDir, 'law_metadata.yaml');
  const metadata = loadYAML(metadataPath);

  if (metadata) {
    const values = [
      escapeSQL(category),
      escapeSQL(lawName),
      escapeSQL(metadata.name),
      escapeSQL(metadata.shortName || null),
      escapeSQL(metadata.badge || null),
      metadata.year || 'NULL',
      escapeSQL(metadata.source || null),
      escapeSQL(metadata.description || null),
      escapeSQL(arrayToJSON(metadata.links)),
    ].join(', ');
    statements.push(
      `INSERT INTO laws (category, name, display_name, short_name, badge, year, source, description, links) VALUES (${values});`
    );
  }

  // 3. chapters.yaml
  const chaptersPath = path.join(lawDir, 'chapters.yaml');
  const chaptersData = loadYAML(chaptersPath);

  if (chaptersData && chaptersData.chapters) {
    for (const chapter of chaptersData.chapters) {
      const values = [
        escapeSQL(category),
        escapeSQL(lawName),
        chapter.chapter,
        escapeSQL(chapter.title),
        escapeSQL(chapter.titleOsaka || null),
        escapeSQL(chapter.description || null),
        escapeSQL(chapter.descriptionOsaka || null),
        escapeSQL(arrayToJSON(chapter.articles)),
      ].join(', ');
      statements.push(
        `INSERT INTO chapters (category, law_name, chapter, title, title_osaka, description, description_osaka, articles) VALUES (${values});`
      );
    }
  }

  // 4. famous_articles.yaml
  const famousPath = path.join(lawDir, 'famous_articles.yaml');
  const famousData = loadYAML(famousPath);

  if (famousData) {
    for (const [article, badge] of Object.entries(famousData)) {
      const values = [
        escapeSQL(category),
        escapeSQL(lawName),
        escapeSQL(article),
        escapeSQL(badge),
      ].join(', ');
      statements.push(
        `INSERT INTO famous_articles (category, law_name, article, badge) VALUES (${values});`
      );
    }
  }

  // 5. 条文YAML
  const files = fs
    .readdirSync(lawDir)
    .filter(
      (f) =>
        f.endsWith('.yaml') &&
        !['law_metadata.yaml', 'chapters.yaml', 'famous_articles.yaml'].includes(f)
    );

  for (const file of files) {
    const filePath = path.join(lawDir, file);
    const article = loadYAML(filePath);

    if (article && article.article !== undefined) {
      const articleNum = String(article.article);
      const values = [
        escapeSQL(category),
        escapeSQL(lawName),
        escapeSQL(articleNum),
        article.isSuppl ? 1 : 0,
        article.isDeleted ? 1 : 0,
        escapeSQL(article.title || null),
        escapeSQL(article.titleOsaka || null),
        escapeSQL(arrayToJSON(article.originalText)),
        escapeSQL(arrayToJSON(article.osakaText)),
        escapeSQL(arrayToJSON(article.commentary)),
        escapeSQL(arrayToJSON(article.commentaryOsaka)),
      ].join(', ');
      statements.push(
        `INSERT INTO articles (category, law_name, article, is_suppl, is_deleted, title, title_osaka, original_text, osaka_text, commentary, commentary_osaka) VALUES (${values});`
      );
    }
  }

  return statements;
}

// curlでD1 APIを呼び出す
async function executeSQL(databaseId, sql) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${databaseId}/query`;

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
  const args = process.argv.slice(2);

  if (args.includes('--list') || args.includes('-l')) {
    listLaws();
    return;
  }

  if (args.length < 2) {
    console.error('使い方:');
    console.error('  node d1-update-law.js <category> <law_name>');
    console.error('  node d1-update-law.js --list');
    console.error('');
    console.error('例:');
    console.error('  node d1-update-law.js jp minpou');
    console.error('  node d1-update-law.js jp keihou');
    process.exit(1);
  }

  if (!API_TOKEN) {
    console.error('CLOUDFLARE_API_TOKEN environment variable is required');
    process.exit(1);
  }

  const [category, lawName] = args;
  const databaseId = getDatabaseId();

  console.log(`Database ID: ${databaseId}`);
  console.log(`Updating: ${category}/${lawName}`);
  console.log('');

  // SQL生成
  const statements = generateLawSQL(category, lawName);
  console.log(`Total statements: ${statements.length}`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  // 順次実行（DELETEが先に完了する必要があるため）
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    try {
      await executeSQL(databaseId, sql);
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(`\n[${i}] Error: ${err.message}`);
      console.error(`  SQL: ${sql.substring(0, 80)}...`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const rate = (successCount / parseFloat(elapsed)).toFixed(1);
    process.stdout.write(
      `\r[${i + 1}/${statements.length}] ${successCount} OK, ${errorCount} errors, ${elapsed}s, ${rate} stmt/s`
    );
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nDone! ${successCount} OK, ${errorCount} errors in ${totalTime}s`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
