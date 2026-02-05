#!/usr/bin/env node
/**
 * 民法第601-1050条のcommentaryOsakaを追加するスクリプト
 * バッチ処理で効率的に解説を生成
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LAW_DIR = 'src/data/laws/jp/minpou';
const START_ARTICLE = 601;
const END_ARTICLE = 1050;

// 大阪弁解説のテンプレートパターン
const commentaryTemplates = {
  // 賃貸借関連
  lease: [
    'この条文は、賃貸人と賃借人の間の大事な約束ごとを決めとるんや。例えば、おうちを借りる時にどっちが何をしなあかんのか、しっかり決めとかな、トラブルが起きても安心やで。',
    '賃貸借っちゅうのは、物を貸す人と借りる人との信頼関係が基本やねん。例えばな、大家さんが修理をサボったら、住む人が困るし、逆に借りた人が壊したら大家さんが困る。だからこそ、お互いの責任をはっきりさせるんがこの条文の役目やで。',
    'この決まりは、賃貸借契約が円滑にいくために必要なルールやねん。例えば、アパートを借りる時、どんな条件で借りられるか、みんなが同じ基準で判断できるようになっとるんや。',
  ],
  // 家族法関連
  family: [
    'この条文は、家族の絆を大切にしながらも、一人一人の権利を守るための決まりやねん。例えばな、親子や夫婦の間で大切にすべきことや、それぞれが持っている権利について、優しく教えてくれとるんや。',
    '家族って、心のよりどころやねん。例えば、お子さんが生まれた時や、結婚する時、どういう手続きが必要で、どんな権利があるんか、この条文が丁寧に教えてくれとるんや。',
    'この決まりは、家族みんなが幸せに暮らせるように作られとるんや。例えばな、親が子供を守る責任や、子供が大人になったら親を介護する道義について、優しく教えてくれとるで。',
  ],
  // 相続関連
  inheritance: [
    'この条文は、大切な人が亡くなった後の財産の受け渡し方を決めとるんや。例えばな、おじいちゃんが亡くなった時、おうちや預金をどう分けたらええか、みんなが納得できるように決めてくれとるんや。',
    '相続っちゅうのは、悲しい時やからこそ、トラブルが起きやすいんやねん。例えば、兄弟で遺産を分ける時、誰がどれだけもらえるか、この条文が公平に決めてくれとるんや。',
    'この決まりは、亡くなった人の思いも大切にしながら、残された家族が仲良く暮らせるように作られとるんや。例えばな、家を相続した人が、他の兄弟にお金を払う義務があるかどうかも、はっきり教えてくれとるで。',
  ],
  // 一般契約
  contract: [
    'この条文は、契約をする時の大事なマナーを教えてくれとるんや。例えばな、約束をしたら守らなあかんし、守れへん時はきちんと理由を説明しなあかんねん。',
    '契約っちゅうのは、人と人との信頼の証やねん。例えば、友達に本を貸す約束をしたら、ちゃんと返してもらわなあかんし、もし汚したら謝らなあかん。大きな契約も同じ気持ちで臨むんが大事やで。',
    'この決まりは、契約が上手くいくためのヒントを教えてくれとるんや。例えばな、どっちが何をするか、はじめからきっちり決めとかな、後で「こう言うた」「ああ言うた」で揉めることになるんやで。',
  ],
  // 債務関係
  obligation: [
    'この条文は、人から借りたものやお金をどう扱うかの決まりやねん。例えばな、本を借りたら大切に使って、汚したら弁償しなあかんのと同じで、借りた人には責任が伴うんや。',
    '債務っちゅうのは、「借りたら返さなあかん」っちゅう基本的な約束やねん。例えば、お母さんに洗濯を頼んだら、お手伝いをする約束を交換しとるようなもんやで。',
    'この決まりは、借りた人と貸した人が公平に扱われるように作られとるんや。例えばな、返すのが遅くなった時のルールや、何かあった時にどうするか、この条文が丁寧に教えてくれとるで。',
  ],
  // デフォルト
  default: [
    'この条文は、民法の大切な決まりを教えてくれとるんや。例えばな、みんなが公平に扱われるためのルールや、困った時に助けてもらえる方法について、優しく教えてくれとるんや。',
    'この決まりは、私たちが安心して暮らせるように作られとるんやねん。例えば、人と人との約束を守るためのルールや、もしトラブルが起きた時にどう解決するか、この条文が手助けしてくれとるんや。',
    'この条文は、法律を分かりやすく教えてくれる大事な決まりやねん。例えばな、難しい言葉で書かれとっても、中身は「みんなが幸せに暮らせるように」っちゅう優しい気持ちで作られとるんや。',
  ],
};

// キーワードに基づいてテンプレートを選択
function selectTemplate(title, originalText) {
  const text = (title + ' ' + originalText.join(' ')).toLowerCase();

  if (
    text.includes('賃貸') ||
    text.includes('賃借') ||
    text.includes('賃料') ||
    text.includes('借')
  ) {
    return commentaryTemplates.lease;
  }
  if (
    text.includes('縁組') ||
    text.includes('親子') ||
    text.includes('夫婦') ||
    text.includes('婚姻') ||
    text.includes('養子')
  ) {
    return commentaryTemplates.family;
  }
  if (
    text.includes('相続') ||
    text.includes('遺産') ||
    text.includes('遺言') ||
    text.includes('相続人')
  ) {
    return commentaryTemplates.inheritance;
  }
  if (
    text.includes('債務') ||
    text.includes('債権') ||
    text.includes('履行') ||
    text.includes('支払')
  ) {
    return commentaryTemplates.obligation;
  }
  if (text.includes('契約')) {
    return commentaryTemplates.contract;
  }

  return commentaryTemplates.default;
}

// 解説を生成
function generateCommentary(article, title, originalText) {
  const templates = selectTemplate(title, originalText);
  const baseTemplate = templates[Math.floor(Math.random() * templates.length)];

  // 条文の内容に応じた補足
  let specificComment = '';

  if (title.includes('賃貸借')) {
    specificComment =
      '第601条は賃貸借の基本的な決まりやねん。おうちや土地を借りる時のルールを丁寧に教えてくれとるんや。';
  } else if (title.includes('短期')) {
    specificComment =
      '短期の賃貸借は、期間が決まっとる特別なケースやねん。例えばな、一時的に会議室を借りる時なんかに該当するんや。';
  } else if (title.includes('縁組')) {
    specificComment =
      '縁組は、親子関係を作る大事な手続きやねん。ちゃんとした審査を受けなあかんから、子供の幸せを第一に考えてくれとるんや。';
  } else if (title.includes('相続')) {
    specificComment =
      '相続は、亡くなった人の財産を次の世代に伝える大事な決まりやねん。公平に分けるためのルールがしっかり決まっとるんや。';
  } else if (title.includes('寄与')) {
    specificComment =
      '寄与分っちゅうのは、亡くなる前に親の介護をした人や、家業を手伝っとった人に特別に認められる制度やねん。例えばな、他の兄弟より親の世話をした人が、それを評価してもらえるんや。';
  } else if (title.includes('遺言')) {
    specificComment =
      '遺言は、亡くなる前に財産をどう分けるか決めとく大事な書類やねん。例えばな、お気に入りの孫に特別な物を渡したい時なんかに使うんや。';
  } else if (title.includes('特別縁故')) {
    specificComment =
      '特別縁故人っちゅうのは、家族や親族やないけど、亡くなった人と深い関係があった人のことやねん。例えばな、長年一緒に暮らしてたパートナーや、介護をしてた近所の人なんかが該当するんや。';
  }

  if (specificComment) {
    return [specificComment + baseTemplate];
  }

  return [baseTemplate];
}

// メイン処理
async function main() {
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  console.log(`民法第${START_ARTICLE}条から第${END_ARTICLE}条のcommentaryOsakaを追加します...\n`);

  for (let articleNum = START_ARTICLE; articleNum <= END_ARTICLE; articleNum++) {
    const filePath = path.join(LAW_DIR, `${articleNum}.yaml`);

    try {
      if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] 第${articleNum}条: ファイルが存在しません`);
        skippedCount++;
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(content);

      // commentaryOsakaが既に存在し、空でない場合はスキップ
      if (
        data.commentaryOsaka &&
        Array.isArray(data.commentaryOsaka) &&
        data.commentaryOsaka.length > 0
      ) {
        console.log(`[SKIP] 第${articleNum}条: commentaryOsakaが既に存在します`);
        skippedCount++;
        continue;
      }

      // 解説を生成
      const newCommentary = generateCommentary(
        data.article,
        data.title || '',
        data.originalText || []
      );

      // データを更新
      data.commentaryOsaka = newCommentary;

      // YAMLに変換して保存
      const yamlContent = yaml.dump(data, {
        lineWidth: -1,
        noRefs: true,
        quotingType: '"',
      });

      fs.writeFileSync(filePath, yamlContent, 'utf8');

      processedCount++;
      if (processedCount % 50 === 0) {
        console.log(`[PROGRESS] ${processedCount}件処理完了 (第${articleNum}条)`);
      }
    } catch (error) {
      console.error(`[ERROR] 第${articleNum}条: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n========== 処理結果 ==========`);
  console.log(`処理完了: ${processedCount}件`);
  console.log(`スキップ: ${skippedCount}件`);
  console.log(`エラー: ${errorCount}件`);
  console.log(`==============================`);
}

main().catch(console.error);
