#!/usr/bin/env node

/**
 * ArticleTitleとArticleCaptionの関係を確認
 */

import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { parseString } from 'xml2js';

const egovLawNum = '408AC0000000109';
const checkArticles = [124, 125, 126, 131, 132, 133, 196, 197, 198];

const API_BASE = 'https://elaws.e-gov.go.jp/api/1';
const lawDataUrl = `${API_BASE}/lawdata/${egovLawNum}`;

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const axiosConfig = {
  timeout: 30000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    Accept: 'application/xml, text/xml, */*',
  },
};

if (proxyUrl) {
  axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl);
  axiosConfig.proxy = false;
}

const response = await axios.get(lawDataUrl, axiosConfig);
const result = await new Promise((resolve, reject) => {
  parseString(response.data, { explicitArray: false }, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

const lawBody = result.DataRoot?.ApplData?.LawFullText?.Law?.LawBody;

function findArticles(node, articles = []) {
  if (!node) return articles;
  if (node.Article) {
    const articleNodes = Array.isArray(node.Article) ? node.Article : [node.Article];
    articles.push(...articleNodes);
  }
  Object.keys(node).forEach((key) => {
    if (typeof node[key] === 'object' && key !== '$' && key !== 'Article') {
      const children = Array.isArray(node[key]) ? node[key] : [node[key]];
      children.forEach((child) => findArticles(child, articles));
    }
  });
  return articles;
}

const allArticles = findArticles(lawBody);

console.log('条文番号 | ArticleCaption | ArticleTitle');
console.log('-'.repeat(80));

for (const targetNum of checkArticles) {
  const article = allArticles.find((a) => {
    const num = a.$?.Num || '';
    const match = num.match(/(\d+)/);
    return match && parseInt(match[1], 10) === targetNum;
  });

  if (article) {
    const caption = article.ArticleCaption || '(なし)';
    const title = article.ArticleTitle || '(なし)';
    console.log(`第${targetNum}条 | ${caption} | ${title}`);
  }
}
