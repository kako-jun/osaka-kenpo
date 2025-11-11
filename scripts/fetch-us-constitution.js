#!/usr/bin/env node

/**
 * アメリカ合衆国憲法を取得してYAMLファイルを生成するスクリプト
 *
 * データソース: National Archives (archives.gov)
 * - 本文7条（Article I-VII）
 * - 修正27条（Amendment 1-27）
 *
 * Usage:
 *   node scripts/fetch-us-constitution.js
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import * as cheerio from 'cheerio';
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
  USER_AGENT:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
};

const LAW_ID = 'us_constitution';
const URLS = {
  articles: 'https://www.archives.gov/founding-docs/constitution-transcript',
  billOfRights: 'https://www.archives.gov/founding-docs/bill-of-rights-transcript',
  amendments: 'https://www.archives.gov/founding-docs/amendments-11-27',
};

// プロキシ設定
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const axiosConfig = {
  timeout: CONFIG.TIMEOUT,
  headers: {
    'User-Agent': CONFIG.USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
};

if (proxyUrl) {
  console.log(`🔐 プロキシを使用: ${proxyUrl}\n`);
  axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
  axiosConfig.proxy = false;
}

console.log('='.repeat(60));
console.log('🇺🇸 アメリカ合衆国憲法 - データ取得');
console.log('='.repeat(60));
console.log(`   本文URL: ${URLS.articles}`);
console.log(`   権利章典URL: ${URLS.billOfRights}`);
console.log(`   修正条項URL: ${URLS.amendments}`);
console.log('='.repeat(60) + '\n');

/**
 * リトライ付きHTTPリクエスト
 */
async function fetchWithRetry(url, config, retries = CONFIG.RETRY_COUNT) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 リクエスト試行 ${attempt}/${retries}...`);
      const response = await axios.get(url, config);
      console.log(`✅ データ取得成功 (${response.data.length} bytes)\n`);
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTMLから条文を抽出
 */
function extractArticles(html) {
  const $ = cheerio.load(html);
  const articles = [];

  // Article I-VII（本文）を抽出
  $('h2').each((_, elem) => {
    const heading = $(elem).text().trim();
    const match = heading.match(/Article\.?\s+([IVX]+)/i);

    if (match) {
      const romanNumeral = match[1];
      const articleNumber = romanToInt(romanNumeral);
      const title = heading;

      // この見出しの後にある全てのテキストを取得（次のh2まで）
      let text = '';
      let current = $(elem).next();

      while (current.length && !current.is('h2')) {
        if (current.is('p')) {
          const paragraph = current.text().trim();
          if (paragraph) {
            text += paragraph + '\n\n';
          }
        } else if (current.is('h3')) {
          // Sectionの見出しも含める
          text += current.text().trim() + '\n\n';
        }
        current = current.next();
      }

      articles.push({
        number: articleNumber,
        isAmendment: false,
        title: title,
        text: text
          .trim()
          .split('\n\n')
          .filter((p) => p.length > 0),
      });
    }
  });

  // Amendment 1-27（修正条項）を抽出
  $('h3, h4').each((_, elem) => {
    const heading = $(elem).text().trim();
    const match = heading.match(/Amendment\s+([IVXLCDM]+|[0-9]+)/i);

    if (match) {
      const numStr = match[1];
      const amendmentNumber = /^[0-9]+$/.test(numStr) ? parseInt(numStr, 10) : romanToInt(numStr);
      const title = heading;

      // この見出しの後にある全てのテキストを取得
      let text = '';
      let current = $(elem).next();

      while (current.length && !current.is('h2') && !current.is('h3') && !current.is('h4')) {
        if (current.is('p')) {
          const paragraph = current.text().trim();
          if (paragraph) {
            text += paragraph + '\n\n';
          }
        }
        current = current.next();
      }

      if (text.trim()) {
        articles.push({
          number: amendmentNumber,
          isAmendment: true,
          title: title,
          text: text
            .trim()
            .split('\n\n')
            .filter((p) => p.length > 0),
        });
      }
    }
  });

  return articles;
}

/**
 * 修正条項を抽出（Amendment用）
 */
function extractAmendments(html, startNumber) {
  const $ = cheerio.load(html);
  const amendments = [];

  $('h3, h2').each((_, elem) => {
    const heading = $(elem).text().trim();
    const match = heading.match(/Amendment\s+([IVXLCDM]+|[0-9]+)/i);

    if (match) {
      const numStr = match[1];
      const amendmentNumber = /^[0-9]+$/.test(numStr) ? parseInt(numStr, 10) : romanToInt(numStr);

      // startNumber以上の修正条項のみを抽出
      if (amendmentNumber >= startNumber) {
        const title = heading;

        // この見出しの後にある全てのテキストを取得（次の修正条項見出しまで）
        let text = '';
        let current = $(elem).next();

        while (current.length && !current.is('h2')) {
          if (current.is('h3')) {
            const h3Text = current.text().trim();
            // h3が次の修正条項の見出しなら終了
            if (h3Text.match(/Amendment\s+([IVXLCDM]+|[0-9]+)/i)) {
              break;
            }
            // それ以外のh3（セクション見出し等）はテキストとして含める
            text += h3Text + '\n\n';
          } else if (current.is('p')) {
            const paragraph = current.text().trim();
            // "Passed by Congress"等のメタ情報は除外
            if (
              paragraph &&
              !paragraph.startsWith('Passed by Congress') &&
              !paragraph.startsWith('Ratified')
            ) {
              text += paragraph + '\n\n';
            }
          } else if (current.is('h4')) {
            // Section等の小見出しも含める
            text += current.text().trim() + '\n\n';
          }
          current = current.next();
        }

        if (text.trim()) {
          amendments.push({
            number: amendmentNumber,
            isAmendment: true,
            title: title,
            text: text
              .trim()
              .split('\n\n')
              .filter((p) => p.length > 0),
          });
        }
      }
    }
  });

  return amendments;
}

/**
 * ローマ数字を整数に変換
 */
function romanToInt(roman) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = map[roman[i].toUpperCase()];
    const next = map[roman[i + 1]?.toUpperCase()];
    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

/**
 * メイン処理
 */
async function main() {
  try {
    // 3つのURLからHTMLを取得
    console.log('📥 本文（Article I-VII）を取得中...');
    const articlesHtml = await fetchWithRetry(URLS.articles, axiosConfig);

    console.log('📥 権利章典（Amendment 1-10）を取得中...');
    const billOfRightsHtml = await fetchWithRetry(URLS.billOfRights, axiosConfig);

    console.log('📥 修正条項（Amendment 11-27）を取得中...');
    const amendmentsHtml = await fetchWithRetry(URLS.amendments, axiosConfig);

    // 条文を抽出
    console.log('🔍 条文を抽出中...');
    const articlesData = extractArticles(articlesHtml);
    const billOfRightsData = extractAmendments(billOfRightsHtml, 1);
    const amendmentsData = extractAmendments(amendmentsHtml, 11);

    const allArticles = [...articlesData, ...billOfRightsData, ...amendmentsData];
    console.log(`✅ ${allArticles.length}条の条文を抽出しました\n`);
    console.log(`   - 本文: ${articlesData.length}条`);
    console.log(`   - 権利章典: ${billOfRightsData.length}条`);
    console.log(`   - 修正条項: ${amendmentsData.length}条\n`);

    // 進捗YAMLを読み込み
    const progressPath = path.join(__dirname, '..', '.claude', 'all-laws-progress.yaml');
    const progressData = yaml.load(fs.readFileSync(progressPath, 'utf8'));

    // 該当する法律を見つける
    const lawInfo = progressData.laws.find((l) => l.id === LAW_ID);
    if (!lawInfo) {
      throw new Error(`Law ID "${LAW_ID}" が all-laws-progress.yaml 内に見つかりません`);
    }

    const category = lawInfo.category;
    const outputDir = path.join(__dirname, '..', 'src', 'data', 'laws', category, LAW_ID);

    // 出力ディレクトリを作成
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 ディレクトリ作成: ${outputDir}`);
    }

    // 各条文をYAMLファイルとして保存
    console.log('\n💾 条文を保存中...');
    let savedCount = 0;

    for (const article of allArticles) {
      const yamlContent = yaml.dump(
        {
          article: article.number,
          isAmendment: article.isAmendment,
          title: article.title || '',
          titleOsaka: '',
          originalText: article.text,
          osakaText: [],
          commentary: [],
          commentaryOsaka: [],
        },
        {
          indent: 2,
          lineWidth: -1,
          noRefs: true,
          quotingType: '"',
        }
      );

      // 修正条項の場合はファイル名にプレフィックスを付ける
      const filename = article.isAmendment
        ? `amendment_${article.number}.yaml`
        : `${article.number}.yaml`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, yamlContent, 'utf8');
      savedCount++;

      if (savedCount % 10 === 0 || savedCount === allArticles.length) {
        process.stdout.write(`\r💾 保存済み: ${savedCount}/${allArticles.length}条...`);
      }

      await sleep(10);
    }

    console.log(`\n\n✅ 全条文を保存しました: ${outputDir}`);

    // law_metadata.yamlを作成
    const metadataContent = yaml.dump(
      {
        name: 'Constitution of the United States',
        year: '1787年（修正1791-1992年）',
        source: 'National Archives',
        description: 'アメリカ合衆国憲法。本文7条と修正27条から構成される。',
        links: [
          {
            text: 'National Archives',
            url: 'https://www.archives.gov/founding-docs/constitution',
          },
        ],
      },
      { indent: 2, lineWidth: -1, noRefs: true }
    );

    const metadataPath = path.join(outputDir, 'law_metadata.yaml');
    fs.writeFileSync(metadataPath, metadataContent, 'utf8');
    console.log('📄 law_metadata.yaml を作成しました');

    // 進捗を更新
    lawInfo.progress.stage1_originalText = allArticles.length;

    // サマリーも更新
    progressData.summary.stage1_completed = progressData.laws.reduce(
      (sum, law) => sum + law.progress.stage1_originalText,
      0
    );
    progressData.summary.stage1_percentage = (
      (progressData.summary.stage1_completed / progressData.summary.totalArticles) *
      100
    ).toFixed(1);

    fs.writeFileSync(progressPath, yaml.dump(progressData, { indent: 2 }), 'utf8');
    console.log(`📊 進捗更新: Stage 1 = ${allArticles.length}/${lawInfo.totalArticles}条`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 完了！');
    console.log('='.repeat(60));
    console.log(`✅ ${allArticles.length}条の法令データを取得しました`);
    console.log(`📂 保存先: ${outputDir}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ エラーが発生しました');
    console.error('='.repeat(60));
    console.error(`エラー内容: ${error.message}`);

    if (error.response) {
      console.error(`HTTPステータス: ${error.response.status}`);
      console.error(`レスポンス: ${error.response.statusText}`);
    }

    console.error('\n💡 ヒント:');
    console.error('  - ネットワーク接続を確認してください');
    console.error('  - プロキシ設定が必要な場合は環境変数を設定してください');
    console.error('='.repeat(60));

    process.exit(1);
  }
}

// 実行
main();
