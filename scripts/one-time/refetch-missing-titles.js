#!/usr/bin/env node

/**
 * 空のタイトルを持つ条文だけをe-Gov APIから再取得して更新するスクリプト
 *
 * Usage:
 *   node scripts/refetch-missing-titles.js <law_id> <egov_law_num>
 *   例: node scripts/refetch-missing-titles.js minpou 129AC0000000089
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { parseString } from 'xml2js';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 設定
const CONFIG = {
  RETRY_COUNT: 3,
  RETRY_DELAY: 2000,
  TIMEOUT: 30000,
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

// コマンドライン引数
const lawId = process.argv[2];
const egovLawNum = process.argv[3];

if (!lawId || !egovLawNum) {
  console.error('Usage: node refetch-missing-titles.js <law_id> <egov_law_num>');
  console.error('Example: node refetch-missing-titles.js minpou 129AC0000000089');
  process.exit(1);
}

// e-Gov API URL
const API_BASE = 'https://elaws.e-gov.go.jp/api/1';
const lawDataUrl = `${API_BASE}/lawdata/${egovLawNum}`;

// プロキシ設定
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const axiosConfig = {
  timeout: CONFIG.TIMEOUT,
  headers: {
    'User-Agent': CONFIG.USER_AGENT,
    Accept: 'application/xml, text/xml, */*',
  },
};

if (proxyUrl) {
  console.log(`🔐 プロキシを使用: ${proxyUrl}\n`);
  axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
  axiosConfig.proxy = false;
}

console.log('='.repeat(60));
console.log('📚 空のタイトル再取得スクリプト');
console.log('='.repeat(60));
console.log(`   Law ID: ${lawId}`);
console.log(`   e-Gov Law Number: ${egovLawNum}`);
console.log('='.repeat(60) + '\n');

/**
 * スリープ関数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * リトライ付きHTTPリクエスト
 */
async function fetchWithRetry(url, config, retries = CONFIG.RETRY_COUNT) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 リクエスト試行 ${attempt}/${retries}...`);
      const response = await axios.get(url, config);
      console.log(`✅ データ取得成功\n`);
      return response.data;
    } catch (error) {
      console.error(`❌ エラー (試行 ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        console.log(`⏳ ${CONFIG.RETRY_DELAY / 1000}秒後にリトライします...\n`);
        await sleep(CONFIG.RETRY_DELAY);
      } else {
        throw error;
      }
    }
  }
}

/**
 * 法令本文から条文タイトルを抽出（タイトルのみ）
 */
function extractArticleTitles(lawBody) {
  const titles = new Map(); // article number -> title

  function traverse(node, isSuppl = false) {
    if (!node) return;

    // 附則を処理
    if (node.SupplProvision) {
      const supplNodes = Array.isArray(node.SupplProvision)
        ? node.SupplProvision
        : [node.SupplProvision];
      supplNodes.forEach((supplNode) => traverse(supplNode, true));
    }

    // Article要素を処理
    if (node.Article) {
      const articleNodes = Array.isArray(node.Article) ? node.Article : [node.Article];

      articleNodes.forEach((article) => {
        const articleNum = article.$?.Num || '';
        const articleCaption = article.ArticleCaption || '';
        const articleTitle = article.ArticleTitle || '';

        // タイトル取得（構造化データ→文字列変換）
        let title = '';
        if (articleTitle) {
          // ArticleTitleは { _: "text" } 形式の場合がある
          if (typeof articleTitle === 'string') {
            title = articleTitle;
          } else if (articleTitle._) {
            title = articleTitle._;
          }
        }
        if (!title && articleCaption) {
          title = articleCaption;
        }

        // 括弧を除去
        if (typeof title === 'string') {
          title = title.replace(/^（/, '').replace(/）$/, '');
        }

        const parsedNum = parseArticleNumber(articleNum);
        if (parsedNum > 0) {
          const key = isSuppl ? `suppl_${parsedNum}` : parsedNum.toString();
          titles.set(key, title);
        }
      });
    }

    // 再帰的に探索
    Object.keys(node).forEach((key) => {
      if (typeof node[key] === 'object' && key !== '$' && key !== 'SupplProvision') {
        const children = Array.isArray(node[key]) ? node[key] : [node[key]];
        children.forEach((child) => traverse(child, isSuppl));
      }
    });
  }

  traverse(lawBody);
  return titles;
}

/**
 * 条文番号をパース
 */
function parseArticleNumber(numStr) {
  if (!numStr) return 0;
  const match = numStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 構造化タイトル（Rubyタグ付き）を文字列に変換
 */
function extractTitleText(titleValue) {
  if (!titleValue) {
    return '';
  }

  if (typeof titleValue === 'string') {
    return titleValue;
  }

  // オブジェクトの場合（Rubyタグ付きなど）
  if (typeof titleValue === 'object') {
    let text = '';

    // _プロパティ（基本テキスト）
    if (titleValue._) {
      text += titleValue._;
    }

    // Rubyプロパティ（ルビ付きテキスト）
    if (titleValue.Ruby) {
      const ruby = titleValue.Ruby;
      if (ruby._) {
        text += ruby._; // ルビのベーステキスト
      }
    }

    return text;
  }

  return '';
}

/**
 * 既存YAMLファイルから空のタイトルを持つ条文を検出
 */
function findMissingTitles(lawDir) {
  const missingFiles = [];

  if (!fs.existsSync(lawDir)) {
    console.error(`❌ ディレクトリが見つかりません: ${lawDir}`);
    return missingFiles;
  }

  const files = fs
    .readdirSync(lawDir)
    .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

  for (const file of files) {
    const filepath = path.join(lawDir, file);
    const content = yaml.load(fs.readFileSync(filepath, 'utf8'));

    const title = extractTitleText(content.title || '');
    if (title.trim() === '') {
      missingFiles.push({
        file,
        article: content.article,
        isSuppl: content.isSuppl || false,
      });
    }
  }

  return missingFiles;
}

/**
 * メイン処理
 */
async function main() {
  try {
    // 法律ディレクトリのパスを取得
    const progressPath = path.join(__dirname, '..', '.claude', 'all-laws-progress.yaml');
    const progressData = yaml.load(fs.readFileSync(progressPath, 'utf8'));

    const lawInfo = progressData.laws.find((l) => l.id === lawId);
    if (!lawInfo) {
      throw new Error(`Law ID "${lawId}" が見つかりません`);
    }

    const category = lawInfo.category;
    const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', category, lawId);

    // 空のタイトルを持つ条文を検出
    console.log('🔍 空のタイトルを検出中...');
    const missingFiles = findMissingTitles(lawDir);

    if (missingFiles.length === 0) {
      console.log('✅ すべての条文にタイトルがあります！');
      return;
    }

    console.log(`\n📋 空のタイトル: ${missingFiles.length}件`);
    missingFiles.forEach(({ file, article }) => {
      console.log(`   - ${file} (第${article}条)`);
    });

    // e-Gov APIからタイトルを取得
    console.log('\n🌐 e-Gov APIからタイトルを取得中...');
    const xmlData = await fetchWithRetry(lawDataUrl, axiosConfig);

    console.log('🔍 XMLをパース中...');
    const result = await new Promise((resolve, reject) => {
      parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const lawData = result.DataRoot?.ApplData?.LawFullText?.Law;
    if (!lawData) {
      throw new Error('法令データがXML内に見つかりません');
    }

    const lawBody = lawData.LawBody;
    const titles = extractArticleTitles(lawBody);

    console.log(`✅ ${titles.size}件のタイトルを取得しました\n`);

    // 空のタイトルを更新
    console.log('💾 タイトルを更新中...');
    let updatedCount = 0;

    for (const { file, article, isSuppl } of missingFiles) {
      const filepath = path.join(lawDir, file);
      const content = yaml.load(fs.readFileSync(filepath, 'utf8'));

      const key = isSuppl ? `suppl_${article}` : article.toString();
      const newTitle = titles.get(key) || '';

      if (newTitle) {
        content.title = newTitle;

        const yamlContent = yaml.dump(content, {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
          quotingType: '"',
        });

        fs.writeFileSync(filepath, yamlContent, 'utf8');
        updatedCount++;
        console.log(`   ✅ ${file}: "${newTitle}"`);
      } else {
        console.log(`   ⚠️ ${file}: タイトルが見つかりませんでした`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 完了！');
    console.log('='.repeat(60));
    console.log(`✅ ${updatedCount}/${missingFiles.length}件のタイトルを更新しました`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);
    process.exit(1);
  }
}

// 実行
main();
