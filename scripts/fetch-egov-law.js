#!/usr/bin/env node

/**
 * e-Gov法令検索APIから法令データを取得してYAMLファイルを生成するスクリプト（改善版）
 *
 * 改善点:
 * - プロキシ対応（環境変数HTTPS_PROXY/HTTP_PROXYから自動取得）
 * - 適切なUser-Agent設定
 * - リトライ機能（最大3回）
 * - 詳細なエラーハンドリング
 * - レート制限（リクエスト間隔1秒）
 *
 * Usage:
 *   node scripts/fetch-egov-law.js <law_id> <egov_law_num>
 *   例: node scripts/fetch-egov-law.js minpou 129AC0000000089
 *
 * 環境変数:
 *   HTTPS_PROXY - HTTPSプロキシURL（例: http://proxy.example.com:8080）
 *   HTTP_PROXY  - HTTPプロキシURL（HTTPS_PROXYが未設定の場合に使用）
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
  RETRY_DELAY: 2000, // 2秒
  REQUEST_DELAY: 1000, // リクエスト間隔1秒
  TIMEOUT: 30000, // 30秒
  USER_AGENT:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
};

// コマンドライン引数
const lawId = process.argv[2];
const egovLawNum = process.argv[3];

if (!lawId || !egovLawNum) {
  console.error('Usage: node fetch-egov-law.js <law_id> <egov_law_num>');
  console.error('Example: node fetch-egov-law.js minpou 129AC0000000089');
  process.exit(1);
}

// e-Gov API URL
const API_BASE = 'https://elaws.e-gov.go.jp/api/1';
const lawDataUrl = `${API_BASE}/lawdata/${egovLawNum}`;

// プロキシ設定を環境変数から取得
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const axiosConfig = {
  timeout: CONFIG.TIMEOUT,
  headers: {
    'User-Agent': CONFIG.USER_AGENT,
    Accept: 'application/xml, text/xml, */*',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
  },
};

// プロキシが設定されている場合
if (proxyUrl) {
  console.log(`🔐 プロキシを使用: ${proxyUrl}\n`);
  axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
  axiosConfig.proxy = false; // axiosの組み込みプロキシ設定を無効化
}

console.log('='.repeat(60));
console.log('📚 e-Gov法令検索API - 法令データ取得（改善版）');
console.log('='.repeat(60));
console.log(`   Law ID: ${lawId}`);
console.log(`   e-Gov Law Number: ${egovLawNum}`);
console.log(`   URL: ${lawDataUrl}`);
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

/**
 * スリープ関数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 法令本文から条文を抽出
 */
function extractArticles(lawBody) {
  const articles = [];

  function traverse(node, currentArticleNum = null, isSuppl = false) {
    if (!node) return;

    // SupplProvision（附則）要素をチェック
    if (node.SupplProvision) {
      const supplNodes = Array.isArray(node.SupplProvision)
        ? node.SupplProvision
        : [node.SupplProvision];
      supplNodes.forEach((supplNode) => {
        traverse(supplNode, null, true); // 附則フラグをtrueに
      });
    }

    // Article要素を見つけたら処理
    if (node.Article) {
      const articleNodes = Array.isArray(node.Article) ? node.Article : [node.Article];

      articleNodes.forEach((article) => {
        const articleNum = article.$?.Num || currentArticleNum;
        const articleCaption = article.ArticleCaption || '';
        const articleTitle = article.ArticleTitle?._ || '';

        // 条文本文を抽出
        const paragraphs = extractParagraphs(article);

        // 条文番号を保持（"132_2"のような枝番も維持）
        const articleNumStr = String(articleNum || '');
        const parsedNum = parseArticleNumber(articleNumStr);

        articles.push({
          number: parsedNum,
          rawNumber: articleNumStr, // 元の番号を保持（132_2など）
          isSuppl: isSuppl,
          title: articleTitle || articleCaption,
          text: paragraphs,
        });
      });
    }

    // 再帰的に子要素を探索
    Object.keys(node).forEach((key) => {
      if (typeof node[key] === 'object' && key !== '$' && key !== 'SupplProvision') {
        const children = Array.isArray(node[key]) ? node[key] : [node[key]];
        children.forEach((child) => traverse(child, currentArticleNum, isSuppl));
      }
    });
  }

  traverse(lawBody);
  return articles;
}

/**
 * 段落を抽出
 */
function extractParagraphs(article) {
  const paragraphs = [];

  function extractText(node) {
    if (!node) return '';

    if (typeof node === 'string') {
      return node.trim();
    }

    if (node._) {
      return node._.trim();
    }

    if (node.Sentence) {
      const sentences = Array.isArray(node.Sentence) ? node.Sentence : [node.Sentence];
      return sentences.map((s) => extractText(s)).join('');
    }

    return '';
  }

  // ArticleBody内の段落を抽出
  if (article.Paragraph) {
    const paras = Array.isArray(article.Paragraph) ? article.Paragraph : [article.Paragraph];
    paras.forEach((para) => {
      const text = extractText(para.ParagraphSentence);
      if (text) {
        paragraphs.push(text);
      }
    });
  }

  return paragraphs.length > 0 ? paragraphs : [''];
}

/**
 * 条文番号をパース（"第1条" → 1）
 */
function parseArticleNumber(numStr) {
  if (!numStr) return 0;
  const match = numStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * 法令番号から制定年を抽出
 */
function extractYear(egovNum) {
  // 例: 129AC0000000089 → 明治29年
  const eraCode = egovNum.substring(0, 1);
  const yearNum = parseInt(egovNum.substring(1, 3), 10);

  const eras = {
    1: '明治',
    2: '大正',
    3: '昭和',
    4: '平成',
    5: '令和',
  };

  return `${eras[eraCode] || ''}${yearNum}年`;
}

/**
 * メイン処理
 */
async function main() {
  try {
    // XMLデータを取得
    const xmlData = await fetchWithRetry(lawDataUrl, axiosConfig);

    // XMLをパース
    console.log('🔍 XMLをパース中...');
    const result = await new Promise((resolve, reject) => {
      parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    // 法令データの抽出
    const lawData = result.DataRoot?.ApplData?.LawFullText?.Law;
    if (!lawData) {
      throw new Error('法令データがXML内に見つかりません');
    }

    const lawBody = lawData.LawBody;
    const lawName = lawData.LawNum?._;

    console.log(`📖 法令名: ${lawName || '不明'}`);
    console.log('🔍 条文を抽出中...\n');

    // 条文を抽出
    const articles = extractArticles(lawBody);
    console.log(`✅ ${articles.length}条の条文を抽出しました\n`);

    // 進捗YAMLを読み込み
    const progressPath = path.join(__dirname, '..', '.claude', 'all-laws-progress.yaml');
    const progressData = yaml.load(fs.readFileSync(progressPath, 'utf8'));

    // 該当する法律を見つける
    const lawInfo = progressData.laws.find((l) => l.id === lawId);
    if (!lawInfo) {
      throw new Error(`Law ID "${lawId}" が all-laws-progress.yaml 内に見つかりません`);
    }

    const category = lawInfo.category;
    const outputDir = path.join(__dirname, '..', 'src', 'data', 'laws', category, lawId);

    // 出力ディレクトリを作成
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 ディレクトリ作成: ${outputDir}`);
    }

    // 各条文をYAMLファイルとして保存
    console.log('\n💾 条文を保存中...');
    let savedCount = 0;

    for (const article of articles) {
      // 削除された条文の範囲表記（38:84など）を展開
      const articlesToCreate = [];

      if (article.rawNumber.includes(':')) {
        // 範囲表記の場合：開始〜終了まで展開
        const [start, end] = article.rawNumber.split(':').map((n) => parseInt(n, 10));
        console.log(`\n🔄 削除条文範囲を展開: 第${start}条〜第${end}条（${end - start + 1}条）`);

        for (let num = start; num <= end; num++) {
          articlesToCreate.push({
            number: num,
            rawNumber: String(num),
            isSuppl: article.isSuppl,
            title: article.title || '',
            text: article.text, // ["削除"]
          });
        }
      } else {
        // 通常の条文
        articlesToCreate.push({
          number: article.number,
          rawNumber: article.rawNumber,
          isSuppl: article.isSuppl,
          title: article.title || '',
          text: article.text,
        });
      }

      // 各条文をファイルとして保存
      for (const art of articlesToCreate) {
        // ファイル名用の識別子（132_2 → 132-2）
        const fileIdentifier = art.rawNumber.replace('_', '-');

        // 削除された条文かどうか判定
        const isDeleted = art.text.length === 1 && art.text[0] === '削除';

        const yamlContent = yaml.dump(
          {
            article: art.number,
            isSuppl: art.isSuppl || false,
            ...(isDeleted ? { isDeleted: true } : {}),
            title: art.title || '',
            titleOsaka: '',
            originalText: isDeleted ? [] : art.text,
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

        // 附則の場合はファイル名にプレフィックスを付ける
        // 枝番がある場合（132_2など）はハイフン区切りに変換（132-2.yaml）
        const filename = art.isSuppl ? `suppl_${fileIdentifier}.yaml` : `${fileIdentifier}.yaml`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, yamlContent, 'utf8');
        savedCount++;

        if (savedCount % 50 === 0) {
          process.stdout.write(`\r💾 保存済み: ${savedCount}条...`);
        }

        // レート制限
        await sleep(10); // ファイル書き込み間隔
      }
    }

    process.stdout.write(`\r💾 保存済み: ${savedCount}条...完了\n`);

    console.log(`\n\n✅ 全条文を保存しました: ${outputDir}`);

    // law_metadata.yamlを作成
    const metadataContent = yaml.dump(
      {
        name: lawName || lawInfo.name,
        year: extractYear(egovLawNum),
        source: 'e-Gov法令検索',
        description: '', // 後で埋める
        links: [
          {
            text: 'e-Gov法令検索',
            url: `https://elaws.e-gov.go.jp/document?lawid=${egovLawNum}`,
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
    console.error('  - プロキシ設定が必要な場合は環境変数を設定してください:');
    console.error('    export HTTPS_PROXY=http://proxy.example.com:8080');
    console.error('  - e-Gov APIが利用可能か確認してください');
    console.error('='.repeat(60));

    process.exit(1);
  }
}

// 実行
main();
