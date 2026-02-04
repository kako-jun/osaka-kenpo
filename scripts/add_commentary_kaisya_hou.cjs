#!/usr/bin/env node
/**
 * 会社法のcommentaryOsakaを追加するスクリプト
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// 語尾パターン（バリエーション用）
const ENDINGS = [
  'やねん',
  'やで',
  'や',
  'やな',
  'やろ',
  'で',
  'やから',
  'せやから',
  'やし',
  'なあかん',
  'せなあかん',
  'あかん',
  'とちゃうか',
  'やろな',
  'ていうことやねん',
  'やでな',
  'しとる',
  'しよる',
  'へん',
];

// 接続詞・前置きパターン
const INTROS = ['この条文は', 'ここでは', 'これは', 'この規定は', 'ここで決まっとるのは'];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCommentary(articleNum, title, originalText, osakaText) {
  const commentary = [];
  const intro = getRandom(INTROS);
  const ending1 = getRandom(['やねん', 'やで', 'ていうことやねん', 'やな']);

  const textToAnalyze = (originalText || []).join(' ');
  const titleHint = title || (originalText && originalText[0] ? originalText[0].slice(0, 30) : '');

  // 1つ目のポイント：条文の概要
  if (titleHint.includes('設立') || textToAnalyze.includes('設立')) {
    commentary.push(
      `${intro}、会社を設立するときのルールについて決めとるん${ending1}。どうやって会社を作るんか、その手続きや条件について定めてるで。`
    );
  } else if (titleHint.includes('株式') || textToAnalyze.includes('株式')) {
    commentary.push(
      `${intro}、株式に関することを決めとるん${ending1}。株主の権利や、株式の扱い方について定めてるで。`
    );
  } else if (titleHint.includes('取締役') || textToAnalyze.includes('取締役')) {
    commentary.push(
      `${intro}、会社のお偉いさんである取締役に関することを決めとるん${ending1}。誰がどうやって会社を経営するんかについて定めてるで。`
    );
  } else if (titleHint.includes('監査') || textToAnalyze.includes('監査')) {
    commentary.push(
      `${intro}、会社のカンニングをチェックする監査に関することを決めとるん${ending1}。ちゃんと正しい仕事をしとるか見張る仕組みやで。`
    );
  } else if (
    titleHint.includes('決算') ||
    textToAnalyze.includes('決算') ||
    textToAnalyze.includes('計算')
  ) {
    commentary.push(
      `${intro}、会社のお金の計算に関することを決めとるん${ending1}。一年間どうやって稼いで、どうやって使うんかを決める大切なルールやで。`
    );
  } else if (titleHint.includes('株主') || textToAnalyze.includes('株主')) {
    commentary.push(
      `${intro}、会社の持ち主である株主の権利や義務について決めとるん${ending1}。株主がどういうことをできるんか、定めてるで。`
    );
  } else if (
    titleHint.includes('合併') ||
    textToAnalyze.includes('合併') ||
    textToAnalyze.includes('分割')
  ) {
    commentary.push(
      `${intro}、会社同士がくっついたり分かれたりするときのルールを決めとるん${ending1}。大きな変化の時にどうするんかを定めてるで。`
    );
  } else if (
    titleHint.includes('解散') ||
    textToAnalyze.includes('解散') ||
    textToAnalyze.includes('清算')
  ) {
    commentary.push(
      `${intro}、会社を終わらせるときのルールを決めとるん${ending1}。会社をなくすときもちゃんと決まりに従わなあかんから、大切な規定やで。`
    );
  } else if (
    titleHint.includes('債権') ||
    textToAnalyze.includes('債権') ||
    textToAnalyze.includes('債務')
  ) {
    commentary.push(
      `${intro}、会社の借金や貸し借りに関することを決めとるん${ending1}。お金の貸し借りはしっかりルールを決めんと後でめんどくさなるからな。`
    );
  } else if (titleHint.includes('定款') || textToAnalyze.includes('定款')) {
    commentary.push(
      `${intro}、会社のルールブックである定款について決めとるん${ending1}。定款は会社の憲法みたいなもんやから、大事にせなあかんで。`
    );
  } else if (
    titleHint.includes('総会') ||
    textToAnalyze.includes('総会') ||
    textToAnalyze.includes('招集')
  ) {
    commentary.push(
      `${intro}、株主総会の開き方や決め方について決めとるん${ending1}。会社の大きな決定をするときのルールを定めてるで。`
    );
  } else if (
    titleHint.includes('計算') ||
    textToAnalyze.includes('計算') ||
    textToAnalyze.includes('財産')
  ) {
    commentary.push(
      `${intro}、会社のお金や財産の計算に関することを決めとるん${ending1}。正確に計算しんと、株主や債権者に迷惑かかるからな。`
    );
  } else if (titleHint.includes('支店') || textToAnalyze.includes('支店')) {
    commentary.push(
      `${intro}、本店以外の場所に作る支店に関することを決めとるん${ending1}。支店を作る時もちゃんと決まりを守らなあかんで。`
    );
  } else {
    commentary.push(
      `${intro}、会社の仕組みやルールについて決めとるん${ending1}。会社を正しく動かすために必要な決まり事やで。`
    );
  }

  // 2つ目のポイント：具体的な内容
  if (originalText && originalText.length > 0) {
    const ending2 = getRandom(['やで', 'な', 'やねん', 'とちゃうか']);

    if (textToAnalyze.includes('請求')) {
      commentary.push(
        `具体的には、何かをお願いする権利や、請求の仕方について定めとるん${ending2}。手続きをきちんとしんと、請求は認められへんこともあるで。`
      );
    } else if (textToAnalyze.includes('義務') || textToAnalyze.includes('しなければならない')) {
      commentary.push(
        `これはせなあかんこと、つまり義務について定めとるん${ending2}。会社の関係者みんなが守らなあかんルールを決めてるで。`
      );
    } else if (textToAnalyze.includes('権利')) {
      commentary.push(
        `これはできること、つまり権利について定めとるん${ending2}。誰が何ができるんかをはっきりさせてるで。`
      );
    } else if (textToAnalyze.includes('禁止') || textToAnalyze.includes('できない')) {
      commentary.push(
        `ここでは、してはいけないこと、禁止することを定めとるん${ending2}。こういうことはあかんてことやから、注意しなあかんで。`
      );
    } else if (
      textToAnalyze.includes('手続') ||
      textToAnalyze.includes('届出') ||
      textToAnalyze.includes('登記')
    ) {
      commentary.push(
        `手続きの仕方や、届け出の方法について定めとるん${ending2}。決まった手順でちゃんとしんと、法律上認められへんことになるで。`
      );
    } else if (textToAnalyze.includes('登録')) {
      commentary.push(
        `登録の仕方や手続きについて定めとるん${ending2}。ちゃんと登録しんと、法律上の効果が生じへんこともあるから気ぃつけなあかんで。`
      );
    } else {
      commentary.push(
        `細かいことやけど、会社を動かす上でめっちゃ大切なルールや${ending2}。見落としやすいけど、ちゃんと理解しとかなあかんで。`
      );
    }
  }

  // 3つ目のポイント：意義や注意点
  const ending3 = getRandom(['やで', 'やねん', 'な', 'や', 'せやから']);
  const purposes = [
    `これは会社の関係者みんなが公平に扱われるために必要なルール${ending3}。`,
    `会社の仕事を円滑に進めるために、こういう決まりがあるん${ending3}。`,
    `トラブルを防ぐためにも、こういう規定をしっかり決めとくんは大事なこと${ending3}。`,
    `会社法の中でも重要な部分やから、覚えといて損はないで${ending3}。`,
  ];
  commentary.push(getRandom(purposes));

  return commentary;
}

async function processFiles() {
  const baseDir = path.join('src', 'data', 'laws', 'jp', 'kaisya_hou');

  // ファイル一覧を取得
  const files = fs
    .readdirSync(baseDir)
    .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml');

  // 空のcommentaryOsakaを持つファイルを収集
  const emptyFiles = [];

  for (const file of files) {
    const filePath = path.join(baseDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = yaml.parse(content);

    if (data && Array.isArray(data.commentaryOsaka) && data.commentaryOsaka.length === 0) {
      emptyFiles.push({
        path: filePath,
        data: data,
        filename: file,
      });
    }
  }

  console.log(`空のcommentaryOsakaを持つファイル数: ${emptyFiles.length}`);

  // 処理
  let processed = 0;
  for (const item of emptyFiles) {
    try {
      const data = item.data;
      const articleNum = data.article || '';
      const title = data.title || '';
      const originalText = data.originalText || [];
      const osakaText = data.osakaText || [];

      // commentaryOsakaを生成
      const newCommentary = generateCommentary(articleNum, title, originalText, osakaText);
      data.commentaryOsaka = newCommentary;

      // ファイルに書き込み
      const yamlContent = yaml.stringify(data, {
        lineWidth: -1,
        doubleQuotedAsJSON: true,
      });
      fs.writeFileSync(item.path, yamlContent, 'utf8');

      processed++;
      if (processed % 100 === 0) {
        console.log(`処理済み: ${processed}/${emptyFiles.length}`);
      }
    } catch (e) {
      console.error(`Error processing ${item.filename}: ${e.message}`);
    }
  }

  console.log(`完了: ${processed}個のファイルにcommentaryOsakaを追加しました`);
  return processed;
}

processFiles().catch(console.error);
