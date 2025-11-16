#!/usr/bin/env ts-node

/**
 * 民法の大阪弁翻訳スクリプト
 *
 * スタイルガイド (.claude/translation-style-guide.md) に従って、
 * 民法の原文（originalText）を大阪弁（osakaText）に翻訳します。
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface ArticleData {
  article: number;
  isSuppl: boolean;
  title: string;
  titleOsaka: string;
  originalText: string[];
  osakaText: string[];
  commentary: string[];
  commentaryOsaka: string[];
}

/**
 * 大阪弁翻訳クラス
 * スタイルガイドに基づいた翻訳ロジックを実装
 */
class OsakaTranslator {
  private articleCount = 0;
  private sentenceCount = 0;

  // 語尾パターン（バリエーション確保のため複数用意）
  private readonly endingPatterns = {
    assertion: ['や', 'やで', 'やねん', 'やな', 'やろな'],
    obligation: ['せなあかん', 'なあかん', 'せんとあかん'],
    prohibition: ['あかん', 'したらあかん', 'したらあかんで'],
    speculation: ['やろ', 'やろな', 'とちゃうか', 'とちゃうかな'],
    soft: ['やな', 'やで', 'やねんな'],
  };

  /**
   * 文を大阪弁に翻訳
   */
  translate(text: string, articleNum: number, sentenceIdx: number): string {
    this.articleCount = articleNum;
    this.sentenceCount = sentenceIdx;

    let translated = text;

    // 1. 基本的な語彙置き換え
    translated = this.replaceVocabulary(translated);

    // 2. 語尾変換（文脈に応じてパターンを選択）
    translated = this.convertEndings(translated);

    // 3. 法律用語の親しみやすい表現への変換
    translated = this.convertLegalTerms(translated);

    // 4. 最終調整
    translated = this.finalAdjustments(translated);

    return translated;
  }

  /**
   * 基本的な語彙置き換え
   */
  private replaceVocabulary(text: string): string {
    const replacements: [RegExp, string][] = [
      [/とても/g, 'めっちゃ'],
      [/非常に/g, 'えらい'],
      [/だから/g, 'やから'],
      [/そうです/g, 'そうや'],
      [/そうである/g, 'そうや'],
      [/違う/g, 'ちゃう'],
      [/本当に/g, 'ほんまに'],
      [/たくさん/g, 'ぎょうさん'],
      [/早く/g, 'はよう'],
      [/すべて/g, 'ぜんぶ'],
      [/全て/g, 'ぜんぶ'],
    ];

    let result = text;
    for (const [pattern, replacement] of replacements) {
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  /**
   * 語尾変換（バリエーション豊かに）
   */
  private convertEndings(text: string): string {
    let result = text;

    // 「〜しなければならない」→「〜せなあかん」系（義務）
    if (result.includes('なければならない') || result.includes('ねばならない')) {
      const pattern = this.selectPattern('obligation');
      result = result.replace(/([^\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf])なければならない/g, `$1${pattern}`);
      result = result.replace(/([ぁ-ん])なければならない/g, (_, char) => this.conjugateNegative(char) + pattern);
      result = result.replace(/ねばならない/g, pattern);
    }

    // 「〜してはならない」→「〜したらあかん」系（禁止）
    if (result.includes('てはならない') || result.includes('ではならない')) {
      const pattern = this.selectPattern('prohibition');
      result = result.replace(/てはならない/g, `たら${pattern}`);
      result = result.replace(/ではならない/g, `たら${pattern}`);
    }

    // 「〜である」→「〜や」系（断定）
    if (result.match(/である[。、]?$/)) {
      const pattern = this.selectPattern('assertion');
      result = result.replace(/である([。、]?)$/, `${pattern}$1`);
    }

    // 「〜する」→「〜するんや」系
    if (result.match(/する[。、]?$/)) {
      const pattern = this.selectPattern('assertion');
      result = result.replace(/する([。、]?)$/, `するんや$1`);
    }

    // 「〜できる」→「〜できるんや」系
    if (result.match(/できる[。、]?$/)) {
      const pattern = this.selectPattern('assertion');
      result = result.replace(/できる([。、]?)$/, `できるんや$1`);
    }

    // 「〜ものとする」→「〜もんや」「〜もんとする」
    result = result.replace(/ものとする/g, 'もんや');

    // 「〜とする」→「〜とするんや」
    result = result.replace(/とする([。、]?)$/g, 'とするんや$1');

    // 「〜ない」→「〜へん」「〜あらへん」
    if (result.match(/ない[。、]?$/)) {
      result = result.replace(/([ぁ-ん])ない([。、]?)$/g, (_, char, punctuation) => {
        return this.conjugateNegative(char) + 'へん' + punctuation;
      });
    }

    // 「〜される」→「〜されるんや」
    if (result.match(/される[。、]?$/)) {
      result = result.replace(/される([。、]?)$/, 'されるんや$1');
    }

    return result;
  }

  /**
   * 法律用語を親しみやすい表現に変換
   */
  private convertLegalTerms(text: string): string {
    let result = text;

    // 基本的には法律用語はそのまま（重要概念のため）
    // ただし、一部を親しみやすくする
    const termReplacements: [RegExp, string][] = [
      [/規定/g, '決まり'],
      [/遵守/g, 'ちゃんと守る'],
      [/準用する/g, '準用するんや'],
    ];

    for (const [pattern, replacement] of termReplacements) {
      result = result.replace(pattern, replacement);
    }

    return result;
  }

  /**
   * 最終調整（自然な関西弁に）
   */
  private finalAdjustments(text: string): string {
    let result = text;

    // 二重否定の調整
    result = result.replace(/ないことはない/g, 'ないことはあらへん');

    // 「〜において」→「〜で」（カジュアル化）
    result = result.replace(/において/g, 'で');

    // 「〜に関して」→「〜について」
    result = result.replace(/に関して/g, 'について');

    // 「〜に基づく」→「〜に基づく」（法律用語はそのまま）
    // result = result.replace(/に基づく/g, 'に基づいとる');

    // 「〜に対して」→「〜に対して」（そのまま）

    // 「〜により」→「〜で」
    // result = result.replace(/により/g, 'で');

    return result;
  }

  /**
   * 否定形の活用（「ない」→「へん」系への変換）
   */
  private conjugateNegative(char: string): string {
    const conjugationMap: { [key: string]: string } = {
      'わ': 'わ',
      'か': 'か',
      'が': 'が',
      'さ': 'さ',
      'ざ': 'ざ',
      'た': 'た',
      'だ': 'だ',
      'な': 'な',
      'ば': 'ば',
      'ぱ': 'ぱ',
      'ま': 'ま',
      'ら': 'ら',
    };

    return conjugationMap[char] || char;
  }

  /**
   * パターン選択（バリエーション確保のため）
   */
  private selectPattern(type: keyof typeof this.endingPatterns): string {
    const patterns = this.endingPatterns[type];
    // 条文番号と文番号を組み合わせて、パターンを決定的に選択
    const index = (this.articleCount + this.sentenceCount) % patterns.length;
    return patterns[index];
  }
}

/**
 * メイン処理
 */
async function main() {
  const minpouDir = path.join(__dirname, '../src/data/laws/jp/minpou');
  const translator = new OsakaTranslator();

  console.log('🌸 民法の大阪弁翻訳を開始します...');
  console.log(`📂 対象ディレクトリ: ${minpouDir}`);

  // すべてのYAMLファイルを取得
  const files = fs.readdirSync(minpouDir)
    .filter(file => file.endsWith('.yaml'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('.yaml', ''), 10);
      const numB = parseInt(b.replace('.yaml', ''), 10);
      return numA - numB;
    });

  console.log(`📝 対象ファイル数: ${files.length}条`);

  let processedCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(minpouDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(fileContent) as ArticleData;

      // originalTextが空の場合はスキップ
      if (!data.originalText || data.originalText.length === 0) {
        console.log(`⏭️  第${data.article}条: originalTextが空のためスキップ`);
        continue;
      }

      // osakaTextが既に入っている場合はスキップ
      if (data.osakaText && data.osakaText.length > 0 && data.osakaText.some(text => text.trim() !== '')) {
        console.log(`⏭️  第${data.article}条: osakaTextが既に存在するためスキップ`);
        processedCount++;
        continue;
      }

      // 各文を翻訳
      const osakaTexts: string[] = [];
      for (let i = 0; i < data.originalText.length; i++) {
        const originalSentence = data.originalText[i];
        const osakaSentence = translator.translate(originalSentence, data.article, i);
        osakaTexts.push(osakaSentence);
      }

      // osakaTextを更新
      data.osakaText = osakaTexts;

      // YAMLファイルに書き戻し
      const yamlContent = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });

      fs.writeFileSync(filePath, yamlContent, 'utf-8');

      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`✅ 進捗: ${processedCount}/${files.length}条 完了`);
      }
    } catch (error) {
      console.error(`❌ 第${file}の処理中にエラー:`, error);
      errorCount++;
    }
  }

  console.log('\n🎉 翻訳処理が完了しました！');
  console.log(`✅ 処理済み: ${processedCount}条`);
  console.log(`❌ エラー: ${errorCount}条`);
}

// スクリプト実行
main().catch(error => {
  console.error('❌ スクリプト実行エラー:', error);
  process.exit(1);
});
