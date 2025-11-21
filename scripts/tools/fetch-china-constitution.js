#!/usr/bin/env node

/**
 * 中華人民共和国憲法を取得してYAMLファイルを生成するスクリプト
 *
 * データソース: gov.cn (中国政府公式サイト)
 * - 全143条（序言を含む2018年改正版）
 *
 * Usage:
 *   node scripts/fetch-china-constitution.js
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

const LAW_ID = 'prc_constitution';
const URL = 'https://www.gov.cn/guoqing/2018-03/22/content_5276318.htm';

// プロキシ設定
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const axiosConfig = {
  timeout: CONFIG.TIMEOUT,
  headers: {
    'User-Agent': CONFIG.USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate',
  },
};

if (proxyUrl) {
  console.log(`🔐 プロキシを使用: ${proxyUrl}\n`);
  axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
  axiosConfig.proxy = false;
}

console.log('='.repeat(60));
console.log('🇨🇳 中華人民共和国憲法 - データ取得');
console.log('='.repeat(60));
console.log(`   URL: ${URL}`);
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
 * 中国語数字をアラビア数字に変換
 */
function chineseToArabic(chinese) {
  const map = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
    十: 10,
    百: 100,
    千: 1000,
  };

  // "一百四十三" のような複雑な数字を変換
  let result = 0;
  let temp = 0;

  for (let i = 0; i < chinese.length; i++) {
    const char = chinese[i];
    const value = map[char];

    if (value >= 10) {
      if (temp === 0) temp = 1;
      if (value === 10) {
        result += temp * 10;
        temp = 0;
      } else if (value === 100) {
        result += temp * 100;
        temp = 0;
      } else if (value === 1000) {
        result += temp * 1000;
        temp = 0;
      }
    } else {
      temp = temp * 10 + value;
    }
  }

  result += temp;
  return result;
}

/**
 * HTMLから条文を抽出
 */
function extractArticles(html) {
  const $ = cheerio.load(html);
  const articles = [];

  // ページ全体のテキストを取得
  const fullText = $('.pages_content, #UCAP-CONTENT, .TRS_Editor').text();

  // "第X条" パターンで分割
  const articlePattern = /第([一二三四五六七八九十百]+)条\s*/g;
  const matches = [...fullText.matchAll(articlePattern)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const chineseNum = match[1];
    const articleNumber = chineseToArabic(chineseNum);
    const startPos = match.index + match[0].length;

    // 次の条文までのテキストを抽出
    let endPos;
    if (i < matches.length - 1) {
      endPos = matches[i + 1].index;
    } else {
      // 最後の条文は第四章の終わりまで
      endPos = fullText.length;
    }

    let text = fullText.substring(startPos, endPos).trim();

    // 余分な空白や改行をクリーンアップ
    text = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();

    // テキストを段落に分割（必要に応じて）
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0);

    if (paragraphs.length > 0) {
      articles.push({
        number: articleNumber,
        title: `第${chineseNum}条`,
        text: paragraphs,
      });
    }
  }

  return articles;
}

/**
 * メイン処理
 */
async function main() {
  try {
    // HTMLを取得
    console.log('📥 憲法全文を取得中...');
    const html = await fetchWithRetry(URL, axiosConfig);

    // 条文を抽出
    console.log('🔍 条文を抽出中...');
    const articles = extractArticles(html);
    console.log(`✅ ${articles.length}条の条文を抽出しました\n`);

    if (articles.length === 0) {
      throw new Error('条文が抽出できませんでした。HTMLの構造を確認してください。');
    }

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
      console.log(`📁 ディレクトリ作成: ${outputDir}\n`);
    }

    // 各条文をYAMLファイルとして保存
    console.log('💾 条文を保存中...');
    let savedCount = 0;

    for (const article of articles) {
      const yamlContent = yaml.dump(
        {
          article: article.number,
          title: article.title,
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

      const filename = `${article.number}.yaml`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, yamlContent, 'utf8');
      savedCount++;

      if (savedCount % 10 === 0 || savedCount === articles.length) {
        process.stdout.write(`\r💾 保存済み: ${savedCount}/${articles.length}条...`);
      }
    }

    console.log(`\n\n✅ 全条文を保存しました: ${outputDir}`);

    // law_metadata.yamlを作成
    const metadataContent = yaml.dump(
      {
        name: '中华人民共和国宪法',
        nameOsaka: '中華人民共和国憲法',
        year: '1982年（最終改正2018年）',
        source: 'gov.cn',
        description: '中華人民共和国の現行憲法。1982年制定、2018年改正。',
        links: [
          {
            text: '中国政府网',
            url: 'https://www.gov.cn/guoqing/2018-03/22/content_5276318.htm',
          },
        ],
      },
      { indent: 2, lineWidth: -1, noRefs: true }
    );

    const metadataPath = path.join(outputDir, 'law_metadata.yaml');
    fs.writeFileSync(metadataPath, metadataContent, 'utf8');
    console.log('📄 law_metadata.yaml を作成しました');

    // 進捗を更新
    lawInfo.progress.stage1_originalText = articles.length;

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
    console.log(`📊 進捗更新: Stage 1 = ${articles.length}/${lawInfo.totalArticles}条`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 完了！');
    console.log('='.repeat(60));
    console.log(`✅ ${articles.length}条の法令データを取得しました`);
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
    console.error('  - サイトの構造が変わった可能性があります');
    console.error('='.repeat(60));

    process.exit(1);
  }
}

// 実行
main();
