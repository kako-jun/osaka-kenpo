#!/usr/bin/env node
/**
 * 会社法（kaisya_hou）の品質チェックプロンプトを範囲分割して生成
 *
 * 会社法は約1,118条文と大規模なため、6つの範囲に分割して並列チェック可能にする
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

// 会社法の範囲定義（約200条文ずつ）
const RANGES = [
  { name: 'range1', start: 1, end: 150, description: '第1-150条（総則・設立等）' },
  { name: 'range2', start: 151, end: 300, description: '第151-300条（株式・新株予約権等）' },
  { name: 'range3', start: 301, end: 450, description: '第301-450条（機関等）' },
  { name: 'range4', start: 451, end: 600, description: '第451-600条（計算・定款変更等）' },
  { name: 'range5', start: 601, end: 750, description: '第601-750条（組織変更・合併等）' },
  { name: 'range6', start: 751, end: 979, description: '第751-979条（社債・雑則等）' },
];

const LAW_DIR = join(projectRoot, 'src', 'data', 'laws', 'jp', 'kaisya_hou');
const OUTPUT_DIR = join(projectRoot, 'reports', 'kaisya_hou');

// チェック基準テンプレート
const CHECK_CRITERIA = `
あなたは法律専門家として、会社法の大阪弁訳の品質を厳密にチェックします。

【最重要】法律的正確性を最優先してください：
- 存在しない判例・制度・法改正への言及 → 即座に指摘
- 歴史的事実の誤り（年号、事件名など） → 即座に指摘
- 条文番号の取り違え（特に枝番条文 XXX-2, XXX-3など）→ 即座に指摘
- 数字の誤り（期間、金額、人数など） → 即座に指摘

【チェック項目】

## 1. 法律的正確性（Critical） ⚖️
- **条文番号**: commentaryOsakaで言及する条文番号が正確か（特に枝番条文）
- **歴史的事実**: 法改正の年号、判例の年、歴史的事件の日付が正確か
- **数字**: 期間（「○ヶ月」「○年」）、金額、人数などが原文と一致しているか
- **制度**: 言及している法律制度が実在するか、架空の制度ではないか
- **判例**: 具体的な判例に言及する場合、その判例が実在するか
- **削除法律**: 改正で削除された条文を現行法として説明していないか

## 2. ハルシネーション（High） 🚨
- **架空の情報**: 存在しない事実、判例、統計を作り出していないか
- **過度な一般化**: 「よくある」「一般的に」等の根拠のない断定
- **誇張**: 「絶対」「必ず」等の強すぎる表現

## 3. ペルソナの一貫性（High/Medium） 👩‍🏫
- **男性表現（High）**: 「わい」「わいら」「おんどれ」「わし」は使用厳禁
  - 一人称は基本的に使わない（使う場合は「わたし」のみ）
- **商人表現（Medium）**: 以下は教育者らしくないため使用禁止
  - ❌ 禁止: 「投資」「利益」「儲け」「商売」「取引」「ビジネス」
  - ✅ 置き換え: 「投資」→「力を注ぐ」、「利益」→「メリット」「良いこと」、「商売」→「仕事」
  - ⚠️ 例外: 法律用語（「時効の利益」「利益相反」「現存利益」）は変更不要
- **トーン**: 春日歩先生（優しい女性教師、和歌山弁ベース）の口調を維持

## 4. 例え話の質 📖
- **登場人物名**: 以下の基準に従っているか
  - ✅ 良い例: 太郎さん、花子さん、A社、B銀行、Aさん、Bさん
  - ❌ 悪い例: HHH、XXX、甲、乙、丙
- **具体性**: 「例えばな、」で始まる具体例があるか
- **妥当性**: 条文内容と例え話が対応しているか

## 5. 統一感 🎨
- **構成**: 他の条文と同じような構成か（2-3段落程度）
- **トーン**: 他の条文と同じような口調か
- **詳細度**: 他の条文と同程度の詳細さか（300文字以上推奨）

## 6. その他の気になる点 🔍
- 誤字脱字
- 不自然な日本語
- 誤解を招く表現
- 差別的表現

【重要度の定義】

- **critical（最重要）**: 条文番号取り違え、歴史的事実誤記、数字の誤り、存在しない制度への言及
- **high（高重要度）**: ハルシネーション、重大な事実誤認、男性表現の使用
- **medium（中重要度）**: 商人表現、変な登場人物名、重大な統一感の欠如、短すぎる解説（300文字未満）
- **low（低重要度）**: 誤字脱字、軽微な表現の不統一

【出力形式】

以下のJSON形式で出力してください：

\`\`\`json
{
  "totalArticles": <チェックした条文数>,
  "issues": [
    {
      "article": "<条文番号（例: 123 または 123-2）>",
      "severity": "critical|high|medium|low",
      "category": "legal_accuracy|hallucination|persona|example|consistency|other",
      "description": "<問題の詳細な説明>",
      "location": "originalText|osakaText|commentary|commentaryOsaka",
      "suggestion": "<修正案（可能な場合）>"
    }
  ]
}
\`\`\`

【注意事項】

1. **法律的正確性を最優先**: 疑わしい情報は必ず指摘してください
2. **条文番号に注意**: 枝番条文（XXX-2, XXX-3など）のcommentaryで「第XXX条」と誤記するパターンに特に注意
3. **循環的取り違えに注意**: 連続する複数条文で解説が循環的に混同するパターンに注意
4. **削除法律に注意**: 改正で削除された条文を現行法として説明していないか確認
5. **「利益」の文脈確認**: 法律用語（「時効の利益」「利益相反」）か商人的表現かを区別
6. **問題がない条文**: issuesに含めず、totalArticlesのみカウント
7. **複数の問題**: 1つの条文に複数の問題がある場合は、それぞれ別のissueとして記載
`;

// YAMLファイルを読み込んで条文データを抽出
function loadArticle(articleNumber) {
  const filePath = join(LAW_DIR, `${articleNumber}.yaml`);
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    return null;
  }
}

// 条文番号が範囲内かチェック（枝番対応）
function isInRange(filename, start, end) {
  const basename = filename.replace('.yaml', '');

  // famous_articlesは除外
  if (basename === 'famous_articles') return false;

  // 枝番条文の場合（例: 123-2）
  const match = basename.match(/^(\d+)(-\d+)?$/);
  if (!match) return false;

  const mainNumber = parseInt(match[1], 10);
  return mainNumber >= start && mainNumber <= end;
}

// 範囲内の条文を収集
function collectArticlesInRange(start, end) {
  const files = readdirSync(LAW_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .filter((f) => isInRange(f, start, end))
    .sort((a, b) => {
      const aMatch = a.match(/^(\d+)(-(\d+))?\.yaml$/);
      const bMatch = b.match(/^(\d+)(-(\d+))?\.yaml$/);
      const aMain = parseInt(aMatch[1], 10);
      const bMain = parseInt(bMatch[1], 10);
      if (aMain !== bMain) return aMain - bMain;
      const aSub = aMatch[3] ? parseInt(aMatch[3], 10) : 0;
      const bSub = bMatch[3] ? parseInt(bMatch[3], 10) : 0;
      return aSub - bSub;
    });

  const articles = [];
  for (const file of files) {
    const articleNumber = file.replace('.yaml', '');
    const content = loadArticle(articleNumber);
    if (content) {
      articles.push({
        number: articleNumber,
        content: content,
      });
    }
  }

  return articles;
}

// プロンプトを生成
function generatePrompt(range) {
  const articles = collectArticlesInRange(range.start, range.end);

  let prompt = `# 会社法品質チェック: ${range.description}\n\n`;
  prompt += CHECK_CRITERIA;
  prompt += `\n\n【対象条文】\n\n`;
  prompt += `範囲: 第${range.start}条から第${range.end}条まで\n`;
  prompt += `条文数: ${articles.length}条\n\n`;
  prompt += `---\n\n`;

  for (const article of articles) {
    prompt += `## 第${article.number}条\n\n`;
    prompt += '```yaml\n';
    prompt += article.content;
    prompt += '\n```\n\n';
    prompt += '---\n\n';
  }

  return prompt;
}

// メイン処理
function main() {
  console.log('📋 会社法（kaisya_hou）品質チェックプロンプト生成');
  console.log('='.repeat(80));

  // 出力ディレクトリ作成
  try {
    writeFileSync(join(OUTPUT_DIR, '.gitkeep'), '');
  } catch (error) {
    // ディレクトリが存在しない場合は作成
  }

  const summary = [];

  for (const range of RANGES) {
    const articles = collectArticlesInRange(range.start, range.end);
    const prompt = generatePrompt(range);

    const promptFile = join(OUTPUT_DIR, `prompt-kaisya_hou-${range.name}.txt`);
    writeFileSync(promptFile, prompt, 'utf-8');

    summary.push({
      range: range.description,
      count: articles.length,
      promptFile: promptFile,
      resultFile: join(OUTPUT_DIR, `result-kaisya_hou-${range.name}.json`),
    });

    console.log(`✅ ${range.description}: ${articles.length}条`);
    console.log(`   プロンプト: ${promptFile}`);
    console.log(`   結果: ${join(OUTPUT_DIR, `result-kaisya_hou-${range.name}.json`)}`);
    console.log();
  }

  // サマリーファイルを生成
  const summaryFile = join(OUTPUT_DIR, 'check-summary.md');
  let summaryContent = '# 会社法品質チェック - サマリー\n\n';
  summaryContent += '## 範囲分割\n\n';

  for (const item of summary) {
    summaryContent += `### ${item.range}\n\n`;
    summaryContent += `- **条文数**: ${item.count}条\n`;
    summaryContent += `- **プロンプト**: \`${item.promptFile}\`\n`;
    summaryContent += `- **結果**: \`${item.resultFile}\`\n\n`;
  }

  summaryContent += '## チェック手順\n\n';
  summaryContent += '各範囲について、以下の手順で並列チェックを実行してください：\n\n';
  summaryContent += '1. Task tool (subagent_type: "general") を使用\n';
  summaryContent += '2. 各プロンプトファイルの内容を実行\n';
  summaryContent += '3. 結果を対応するJSONファイルに保存\n';
  summaryContent += '4. 全範囲完了後、結果を統合して修正を実施\n\n';

  writeFileSync(summaryFile, summaryContent, 'utf-8');

  console.log('='.repeat(80));
  console.log('✅ プロンプト生成完了');
  console.log(`📊 サマリー: ${summaryFile}`);
  console.log();
  console.log('🚀 次のステップ:');
  console.log('   Task toolを使って、6つの範囲を並列チェックしてください');
}

main();
