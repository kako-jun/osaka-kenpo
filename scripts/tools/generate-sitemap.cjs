#!/usr/bin/env node

/**
 * public/sitemap.xml を YAML から静的生成するスクリプト
 *
 * 背景:
 *   以前は src/app/sitemap.ts が runtime='edge' で D1 から条文を引いて
 *   動的生成していたが、ビルド時には D1 バインディングが存在しないため
 *   ビルド時フォールバックが49件しか生成されず、Google にはスカスカの
 *   サイトマップが送られていた（GSC で「送信されたサイトマップ0件」状態）。
 *
 *   データは src/data/laws/ 配下の YAML に全件揃っているので、D1 に頼らず
 *   ビルド時に YAML を直接読んで完全な sitemap.xml を public/ に出力する。
 *
 * 真実の源:
 *   - src/data/laws_metadata.yaml: カテゴリ構造と各法律の status
 *   - src/data/laws/<category>/<law>/<article>.yaml: 各条文
 *
 * 生成先:
 *   - public/sitemap.xml
 *
 * 除外ルール:
 *   - status が 'available' でない法律（preparing 等）は丸ごと除外
 *   - isDeleted: true の条文は除外（実ページは noindex のため）
 *   - osakaText が空の条文は除外（このサイトの独自価値は大阪弁訳。原文だけだと
 *     e-Gov の重複コンテンツになり、インデックスの足を引っ張る）
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BASE_URL = 'https://osaka-kenpo.llll-ll.com';
const ROOT = path.join(__dirname, '../..');
const LAWS_METADATA_YAML = path.join(ROOT, 'src/data/laws_metadata.yaml');
const LAWS_DIR = path.join(ROOT, 'src/data/laws');
const OUTPUT_FILE = path.join(ROOT, 'public/sitemap.xml');

/** osakaText が実質的に空でないか判定する */
function hasOsakaText(article) {
  const osaka = article.osakaText;
  if (!Array.isArray(osaka)) return false;
  return osaka.some((line) => typeof line === 'string' && line.trim().length > 0);
}

/** 1法律ディレクトリから、sitemap に載せる条文番号の配列を返す */
function collectArticles(category, lawId) {
  const dir = path.join(LAWS_DIR, category, lawId);
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  law dir not found: ${dir}`);
    return [];
  }

  const articles = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.yaml') || file === 'law_metadata.yaml') continue;
    try {
      const data = yaml.load(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (!data || data.isDeleted === true) continue;
      if (!hasOsakaText(data)) continue;
      articles.push(String(data.article));
    } catch (error) {
      console.warn(`⚠️  failed to parse ${file}: ${error.message}`);
    }
  }

  // 条文番号で数値ソート（"10" が "2" より後に来るように）
  articles.sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
    return na - nb;
  });
  return articles;
}

function urlEntry(loc, changefreq, priority, lastmod) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function main() {
  console.log('🗺️  public/sitemap.xml を生成中...\n');

  const lastmod = new Date().toISOString();
  const meta = yaml.load(fs.readFileSync(LAWS_METADATA_YAML, 'utf8'));

  const entries = [];

  // 基本ページ
  entries.push(urlEntry(BASE_URL, 'weekly', '1.0', lastmod));
  entries.push(urlEntry(`${BASE_URL}/about`, 'monthly', '0.8', lastmod));

  let lawCount = 0;
  let articleCount = 0;

  for (const category of meta.categories) {
    for (const law of category.laws) {
      if (law.status !== 'available') continue;

      // 法律ページ（条文一覧）
      entries.push(urlEntry(`${BASE_URL}${law.path}`, 'monthly', '0.8', lastmod));
      lawCount++;

      // path: "/law/jp/minpou" -> category="jp", lawId="minpou"
      const parts = law.path.split('/').filter(Boolean);
      const categoryId = parts[1];
      const lawId = parts[2];
      if (!categoryId || !lawId) continue;

      for (const article of collectArticles(categoryId, lawId)) {
        entries.push(
          urlEntry(`${BASE_URL}/law/${categoryId}/${lawId}/${article}`, 'monthly', '0.6', lastmod)
        );
        articleCount++;
      }
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') +
    '\n</urlset>\n';

  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

  console.log(`✅ ${OUTPUT_FILE}`);
  console.log(`   法律ページ: ${lawCount}`);
  console.log(`   条文ページ: ${articleCount}`);
  console.log(`   合計 URL : ${entries.length}`);
}

if (require.main === module) {
  main();
}
