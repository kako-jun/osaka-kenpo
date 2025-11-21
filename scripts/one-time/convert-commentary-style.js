#!/usr/bin/env node

/**
 * 民事訴訟法のcommentaryフィールドを「だ・である」調から「です・ます」調に変換するスクリプト
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 対象ディレクトリ
const TARGET_DIR = path.join(__dirname, '../src/data/laws/jp/minji_soshou_hou');

/**
 * 「だ・である」調から「です・ます」調に変換する関数
 * @param {string} text - 変換する文字列
 * @returns {string} - 変換後の文字列
 */
function convertToDesuMasu(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let converted = text;

  // 文末の変換パターン（長いものから順に処理）
  const patterns = [
    // 複合パターン
    { from: /されている。/g, to: 'されています。' },
    { from: /定められている。/g, to: '定められています。' },
    { from: /設けられている。/g, to: '設けられています。' },
    { from: /行われている。/g, to: '行われています。' },
    { from: /用いられている。/g, to: '用いられています。' },
    { from: /求められている。/g, to: '求められています。' },
    { from: /認められている。/g, to: '認められています。' },
    { from: /考えられている。/g, to: '考えられています。' },
    { from: /含まれている。/g, to: '含まれています。' },
    { from: /示されている。/g, to: '示されています。' },
    { from: /規定されている。/g, to: '規定されています。' },
    { from: /予定されている。/g, to: '予定されています。' },
    { from: /想定されている。/g, to: '想定されています。' },
    { from: /解されている。/g, to: '解されています。' },
    { from: /みなされている。/g, to: 'みなされています。' },
    { from: /扱われている。/g, to: '扱われています。' },
    { from: /なされている。/g, to: 'なされています。' },
    { from: /課されている。/g, to: '課されています。' },
    { from: /図られている。/g, to: '図られています。' },
    { from: /保障されている。/g, to: '保障されています。' },
    { from: /確保されている。/g, to: '確保されています。' },
    { from: /明らかにされている。/g, to: '明らかにされています。' },

    { from: /定めている。/g, to: '定めています。' },
    { from: /している。/g, to: 'しています。' },
    { from: /保護している。/g, to: '保護しています。' },
    { from: /規定している。/g, to: '規定しています。' },
    { from: /意味している。/g, to: '意味しています。' },
    { from: /示している。/g, to: '示しています。' },
    { from: /要求している。/g, to: '要求しています。' },
    { from: /明らかにしている。/g, to: '明らかにしています。' },
    { from: /確認している。/g, to: '確認しています。' },
    { from: /禁止している。/g, to: '禁止しています。' },
    { from: /許可している。/g, to: '許可しています。' },
    { from: /具体化している。/g, to: '具体化しています。' },
    { from: /強化している。/g, to: '強化しています。' },

    // 可能形
    { from: /することができる。/g, to: 'することができます。' },
    { from: /することが可能である。/g, to: 'することが可能です。' },
    { from: /できる。/g, to: 'できます。' },

    // 受身形
    { from: /される。/g, to: 'されます。' },
    { from: /なる。/g, to: 'なります。' },
    { from: /適用される。/g, to: '適用されます。' },
    { from: /優先される。/g, to: '優先されます。' },
    { from: /認められる。/g, to: '認められます。' },
    { from: /みなされる。/g, to: 'みなされます。' },
    { from: /要求される。/g, to: '要求されます。' },
    { from: /求められる。/g, to: '求められます。' },
    { from: /必要とされる。/g, to: '必要とされます。' },
    { from: /考えられる。/g, to: '考えられます。' },
    { from: /含まれる。/g, to: '含まれます。' },
    { from: /定められる。/g, to: '定められます。' },
    { from: /設けられる。/g, to: '設けられます。' },
    { from: /行われる。/g, to: '行われます。' },
    { from: /用いられる。/g, to: '用いられます。' },
    { from: /なされる。/g, to: 'なされます。' },
    { from: /課される。/g, to: '課されます。' },
    { from: /図られる。/g, to: '図られます。' },
    { from: /保障される。/g, to: '保障されます。' },
    { from: /確保される。/g, to: '確保されます。' },

    // 引用形
    { from: /という。/g, to: 'といいます。' },
    { from: /いう。/g, to: 'いいます。' },

    // 名詞述語
    { from: /である。/g, to: 'です。' },
    { from: /であった。/g, to: 'でした。' },
    { from: /重要である。/g, to: '重要です。' },
    { from: /必要である。/g, to: '必要です。' },
    { from: /可能である。/g, to: '可能です。' },
    { from: /不可能である。/g, to: '不可能です。' },
    { from: /明らかである。/g, to: '明らかです。' },
    { from: /適切である。/g, to: '適切です。' },
    { from: /不適切である。/g, to: '不適切です。' },
    { from: /有効である。/g, to: '有効です。' },
    { from: /無効である。/g, to: '無効です。' },
    { from: /困難である。/g, to: '困難です。' },
    { from: /容易である。/g, to: '容易です。' },
    { from: /十分である。/g, to: '十分です。' },
    { from: /不十分である。/g, to: '不十分です。' },
    { from: /妥当である。/g, to: '妥当です。' },
    { from: /不当である。/g, to: '不当です。' },
    { from: /確実である。/g, to: '確実です。' },
    { from: /不確実である。/g, to: '不確実です。' },

    // その他の動詞
    { from: /ある。/g, to: 'あります。' },
    { from: /ない。/g, to: 'ありません。' },
    { from: /いる。/g, to: 'います。' },
    { from: /いない。/g, to: 'いません。' },
    { from: /得る。/g, to: '得ます。' },
    { from: /与える。/g, to: '与えます。' },
    { from: /受ける。/g, to: '受けます。' },
    { from: /持つ。/g, to: '持ちます。' },
    { from: /有する。/g, to: '有します。' },
    { from: /要する。/g, to: '要します。' },
    { from: /対する。/g, to: '対します。' },
    { from: /関する。/g, to: '関します。' },
    { from: /基づく。/g, to: '基づきます。' },
    { from: /従う。/g, to: '従います。' },
    { from: /応じる。/g, to: '応じます。' },
    { from: /伴う。/g, to: '伴います。' },
    { from: /含む。/g, to: '含みます。' },
    { from: /生じる。/g, to: '生じます。' },
    { from: /防ぐ。/g, to: '防ぎます。' },
    { from: /保つ。/g, to: '保ちます。' },
    { from: /果たす。/g, to: '果たします。' },
    { from: /担う。/g, to: '担います。' },
    { from: /負う。/g, to: '負います。' },
  ];

  // パターンを順次適用
  for (const pattern of patterns) {
    converted = converted.replace(pattern.from, pattern.to);
  }

  return converted;
}

/**
 * YAMLファイルを処理する関数
 * @param {string} filePath - YAMLファイルのパス
 * @returns {Object} - 処理結果 { success: boolean, modified: boolean, sentenceCount: number, error?: string }
 */
function processYamlFile(filePath) {
  try {
    // ファイルを読み込む
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.load(content);

    // commentaryフィールドが存在し、配列であることを確認
    if (!data || !Array.isArray(data.commentary)) {
      return { success: true, modified: false, sentenceCount: 0 };
    }

    let modified = false;
    let sentenceCount = 0;

    // commentaryの各要素を変換
    const newCommentary = data.commentary.map((text) => {
      if (typeof text === 'string' && text.trim() !== '') {
        const converted = convertToDesuMasu(text);
        if (converted !== text) {
          modified = true;
          sentenceCount++;
        }
        return converted;
      }
      return text;
    });

    // 変更があった場合のみファイルを書き込む
    if (modified) {
      data.commentary = newCommentary;
      const newContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });
      fs.writeFileSync(filePath, newContent, 'utf8');
      return { success: true, modified: true, sentenceCount };
    }

    return { success: true, modified: false, sentenceCount: 0 };
  } catch (error) {
    return {
      success: false,
      modified: false,
      sentenceCount: 0,
      error: error.message,
    };
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('民事訴訟法のcommentaryフィールドを「です・ます」調に変換します...\n');
  console.log(`対象ディレクトリ: ${TARGET_DIR}\n`);

  // ディレクトリ内のYAMLファイルを取得（law_metadata.yamlは除外）
  const files = fs
    .readdirSync(TARGET_DIR)
    .filter((file) => file.endsWith('.yaml') && file !== 'law_metadata.yaml')
    .sort((a, b) => {
      const numA = parseInt(a.replace('.yaml', ''));
      const numB = parseInt(b.replace('.yaml', ''));
      return numA - numB;
    });

  console.log(`対象ファイル数: ${files.length}件\n`);

  let processedCount = 0;
  let modifiedCount = 0;
  let totalSentenceCount = 0;
  let errorCount = 0;
  const errors = [];

  // 各ファイルを処理
  for (const file of files) {
    const filePath = path.join(TARGET_DIR, file);
    const result = processYamlFile(filePath);

    processedCount++;

    if (result.success) {
      if (result.modified) {
        modifiedCount++;
        totalSentenceCount += result.sentenceCount;
        console.log(`✓ ${file}: ${result.sentenceCount}文を変換しました`);
      }
    } else {
      errorCount++;
      errors.push({ file, error: result.error });
      console.error(`✗ ${file}: エラー - ${result.error}`);
    }

    // 進捗表示（50件ごと）
    if (processedCount % 50 === 0) {
      console.log(`\n処理済み: ${processedCount}/${files.length}件\n`);
    }
  }

  // 結果サマリー
  console.log('\n' + '='.repeat(60));
  console.log('処理完了\n');
  console.log(`処理したファイル数: ${processedCount}件`);
  console.log(`変更したファイル数: ${modifiedCount}件`);
  console.log(`変換した文の総数: ${totalSentenceCount}文`);
  console.log(`エラー件数: ${errorCount}件`);

  if (errors.length > 0) {
    console.log('\nエラー詳細:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('='.repeat(60));
}

// スクリプト実行
main().catch((error) => {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1);
});
