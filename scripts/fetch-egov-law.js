#!/usr/bin/env node

/**
 * e-Gov法令検索APIから法令データを取得してYAMLファイルを生成するスクリプト
 *
 * Usage:
 *   node scripts/fetch-egov-law.js <law_id> <egov_law_num>
 *   例: node scripts/fetch-egov-law.js minpou 129AC0000000089
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { parseString } from 'xml2js';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

console.log(`📚 Fetching law data from e-Gov API...`);
console.log(`   Law ID: ${lawId}`);
console.log(`   e-Gov Law Number: ${egovLawNum}`);
console.log(`   URL: ${lawDataUrl}\n`);

// HTTPSリクエストを送信
https.get(lawDataUrl, (res) => {
  let xmlData = '';

  res.on('data', (chunk) => {
    xmlData += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Data received (${xmlData.length} bytes)`);

    // XMLをパース
    parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error('❌ XML parse error:', err);
        process.exit(1);
      }

      try {
        // 法令データの抽出
        const lawData = result.DataRoot?.ApplData?.LawFullText?.Law;
        if (!lawData) {
          console.error('❌ Law data not found in XML');
          process.exit(1);
        }

        const lawBody = lawData.LawBody;
        const lawName = lawData.LawNum?._; // 法令名

        console.log(`\n📖 Law Name: ${lawName}`);
        console.log(`🔍 Extracting articles...\n`);

        // 条文を抽出
        const articles = extractArticles(lawBody);
        console.log(`✅ Extracted ${articles.length} articles\n`);

        // 進捗YAMLを読み込み
        const progressPath = path.join(__dirname, '..', '.claude', 'roppou-progress.yaml');
        const progressData = yaml.load(fs.readFileSync(progressPath, 'utf8'));

        // 該当する法律を見つける
        const lawInfo = progressData.laws.find(l => l.id === lawId);
        if (!lawInfo) {
          console.error(`❌ Law ID "${lawId}" not found in progress.yaml`);
          process.exit(1);
        }

        const category = lawInfo.category;
        const outputDir = path.join(__dirname, '..', 'src', 'data', 'laws', category, lawId);

        // 出力ディレクトリを作成
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
          console.log(`📁 Created directory: ${outputDir}`);
        }

        // 各条文をYAMLファイルとして保存
        let savedCount = 0;
        articles.forEach((article) => {
          const yamlContent = yaml.dump({
            article: article.number,
            title: article.title || '',
            titleOsaka: '',  // 空で用意
            originalText: article.text,
            osakaText: [],  // Stage 3で埋める
            commentary: [],  // Stage 2で埋める
            commentaryOsaka: []  // Stage 4で埋める
          }, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            quotingType: '"'
          });

          const filename = `${article.number}.yaml`;
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, yamlContent, 'utf8');
          savedCount++;

          if (savedCount % 10 === 0 || savedCount === articles.length) {
            process.stdout.write(`\r💾 Saved ${savedCount}/${articles.length} articles...`);
          }
        });

        console.log(`\n\n✅ All articles saved to: ${outputDir}`);

        // law_metadata.yamlを作成
        const metadataContent = yaml.dump({
          name: lawName || lawInfo.name,
          year: extractYear(egovLawNum),
          source: `e-Gov法令検索`,
          description: '',  // 後で埋める
          links: [
            {
              text: 'e-Gov法令検索',
              url: `https://elaws.e-gov.go.jp/document?lawid=${egovLawNum}`
            }
          ]
        }, { indent: 2, lineWidth: -1, noRefs: true });

        const metadataPath = path.join(outputDir, 'law_metadata.yaml');
        fs.writeFileSync(metadataPath, metadataContent, 'utf8');
        console.log(`📄 Created law_metadata.yaml`);

        // 進捗を更新
        lawInfo.progress.stage1_originalText = articles.length;
        fs.writeFileSync(progressPath, yaml.dump(progressData, { indent: 2 }), 'utf8');
        console.log(`📊 Updated progress: Stage 1 = ${articles.length}/${lawInfo.totalArticles}`);

        console.log(`\n🎉 Done!`);

      } catch (error) {
        console.error('❌ Error processing law data:', error);
        process.exit(1);
      }
    });
  });

}).on('error', (err) => {
  console.error('❌ HTTP request error:', err);
  process.exit(1);
});

/**
 * 法令本文から条文を抽出
 */
function extractArticles(lawBody) {
  const articles = [];

  function traverse(node, currentArticleNum = null) {
    if (!node) return;

    // Article要素を見つけたら処理
    if (node.Article) {
      const articleNodes = Array.isArray(node.Article) ? node.Article : [node.Article];

      articleNodes.forEach((article) => {
        const articleNum = article.$?.Num || currentArticleNum;
        const articleCaption = article.ArticleCaption || '';
        const articleTitle = article.ArticleTitle?._  || '';

        // 条文本文を抽出
        const paragraphs = extractParagraphs(article);

        articles.push({
          number: parseArticleNumber(articleNum),
          title: articleTitle || articleCaption,
          text: paragraphs
        });
      });
    }

    // 再帰的に子要素を探索
    Object.keys(node).forEach((key) => {
      if (typeof node[key] === 'object' && key !== '$') {
        const children = Array.isArray(node[key]) ? node[key] : [node[key]];
        children.forEach(child => traverse(child, currentArticleNum));
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
      return sentences.map(s => extractText(s)).join('');
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
    '1': '明治',
    '2': '大正',
    '3': '昭和',
    '4': '平成',
    '5': '令和'
  };

  return `${eras[eraCode] || ''}${yearNum}年`;
}
