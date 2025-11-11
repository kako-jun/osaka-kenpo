#!/usr/bin/env node

/**
 * ドイツ基本法を取得してYAMLファイルを生成するスクリプト
 *
 * データソース: gesetze-im-internet.de (Federal Ministry of Justice)
 * - 全146条（Artikel 1-146）
 * - XMLファイル（BJNR000010949.xml）からパース
 *
 * Usage:
 *   node scripts/fetch-german-basic-law.js
 */

import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LAW_ID = 'german_basic_law';
const XML_PATH = path.join(__dirname, '..', '.claude', 'BJNR000010949.xml');

console.log('='.repeat(60));
console.log('🇩🇪 ドイツ基本法 - データ取得');
console.log('='.repeat(60));
console.log(`   XMLファイル: ${XML_PATH}`);
console.log('='.repeat(60) + '\n');

/**
 * XMLから条文を抽出
 */
function extractArticles(xmlData) {
  const articles = [];

  // XML内の全<norm>タグを探索
  if (xmlData.dokumente && xmlData.dokumente.norm) {
    for (const norm of xmlData.dokumente.norm) {
      // metadatenにenbez（条文番号）があるか確認
      if (norm.metadaten && norm.metadaten[0] && norm.metadaten[0].enbez) {
        const enbez = norm.metadaten[0].enbez[0];

        // "Art 1", "Art 2"などのパターンにマッチ
        const match = enbez.match(/^Art\s+(\d+[a-z]?)/i);

        if (match) {
          const articleNumber = match[1];
          const title = enbez;

          // 本文を抽出
          const textParts = [];

          if (norm.textdaten && norm.textdaten[0] && norm.textdaten[0].text) {
            const textData = norm.textdaten[0].text[0];
            if (textData.Content && textData.Content[0] && textData.Content[0].P) {
              // 各<P>タグの内容を抽出
              for (const p of textData.Content[0].P) {
                // <P>タグの中身を取得（文字列または複雑な構造）
                let text = '';
                if (typeof p === 'string') {
                  text = p.trim();
                } else if (typeof p === 'object' && p._) {
                  text = p._.trim();
                } else if (typeof p === 'object') {
                  // 複雑な構造の場合、再帰的にテキストを抽出
                  text = extractTextFromNode(p);
                }

                // BR, SP等を除去してクリーンなテキストに
                text = text
                  .replace(/<BR\/>/g, '\n')
                  .replace(/<SP>/g, '')
                  .replace(/<\/SP>/g, '')
                  .trim();

                if (text.length > 0) {
                  textParts.push(text);
                }
              }
            }
          }

          if (textParts.length > 0) {
            articles.push({
              number: articleNumber,
              title: title,
              text: textParts,
            });
          }
        }
      }
    }
  }

  return articles;
}

/**
 * ノードから再帰的にテキストを抽出
 */
function extractTextFromNode(node) {
  if (typeof node === 'string') {
    return node;
  }

  if (typeof node !== 'object') {
    return '';
  }

  let text = '';

  // _プロパティ（テキストノード）
  if (node._) {
    text += node._;
  }

  // その他のプロパティを再帰的に探索
  for (const key of Object.keys(node)) {
    if (key === '_' || key === '$') continue;

    const value = node[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        text += ' ' + extractTextFromNode(item);
      }
    } else if (typeof value === 'object') {
      text += ' ' + extractTextFromNode(value);
    } else if (typeof value === 'string') {
      text += ' ' + value;
    }
  }

  return text.trim();
}

/**
 * メイン処理
 */
async function main() {
  try {
    // XMLファイルを読み込み
    console.log('📥 XMLファイルを読み込み中...');
    const xmlContent = fs.readFileSync(XML_PATH, 'utf8');
    console.log(`✅ 読み込み完了 (${xmlContent.length} bytes)\n`);

    // XMLをパース
    console.log('🔍 XMLをパース中...');
    let xmlData;
    parseString(xmlContent, { explicitArray: true }, (err, result) => {
      if (err) {
        throw new Error(`XMLパースエラー: ${err.message}`);
      }
      xmlData = result;
    });
    console.log('✅ パース完了\n');

    // 条文を抽出
    console.log('📖 条文を抽出中...');
    const articles = extractArticles(xmlData);
    console.log(`✅ ${articles.length}条の条文を抽出しました\n`);

    if (articles.length === 0) {
      throw new Error('条文が抽出できませんでした。XMLの構造を確認してください。');
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

      // サブ条文（104a等）の場合はプレフィックスを付ける
      const filename = /[a-z]/.test(article.number)
        ? `sub_${article.number}.yaml`
        : `${article.number}.yaml`;
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
        name: 'Grundgesetz für die Bundesrepublik Deutschland',
        nameOsaka: 'ドイツ基本法',
        year: '1949年（最終改正2025年）',
        source: 'gesetze-im-internet.de',
        description: 'ドイツ連邦共和国の基本法（憲法）。全146条から構成される。',
        links: [
          {
            text: 'gesetze-im-internet.de',
            url: 'https://www.gesetze-im-internet.de/gg/',
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

    // XMLファイルを削除
    console.log('\n🗑️  XMLファイルを削除中...');
    fs.unlinkSync(XML_PATH);
    console.log('✅ XMLファイルを削除しました');

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
    console.error(`スタック: ${error.stack}`);
    console.error('='.repeat(60));

    process.exit(1);
  }
}

// 実行
main();
