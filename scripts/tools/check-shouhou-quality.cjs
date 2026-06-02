#!/usr/bin/env node

/**
 * 商法の全条文品質チェック（Critical・High優先）
 *
 * チェック項目:
 * - Critical: 条文番号取り違え、数字誤記、歴史的事実誤記、ハルシネーション
 * - High: 男性表現、架空の判例・制度
 * - Medium: 商人表現（過度）、変な登場人物名
 * - Low: 誤字脱字、日付表記不統一
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const SHOUHOU_DIR = path.join(__dirname, '../../src/data/laws/jp/shouhou');
const OUTPUT_FILE = path.join(__dirname, '../../reports/result-shouhou.json');

// チェック結果
const results = {
  lawId: 'shouhou',
  totalArticles: 0,
  checkedArticles: 0,
  issuesFound: 0,
  totalIssues: 0,
  checkDate: new Date().toISOString().split('T')[0],
  issues: [],
};

// Critical: 男性表現パターン（春日歩先生は女性）
const MALE_EXPRESSIONS = [
  /わい(?![るれたん])/g, // 「わい」（わいわいは除外）
  /わいら/g, // 「わいら」
  /おんどれ/g, // 「おんどれ」
  /わし(?![ょゃゅ])/g, // 「わし」
  /ワイ(?![ルレタン])/g, // カタカナ「ワイ」
  /ワシ/g, // カタカナ「ワシ」
];

// Medium: 商人表現（教育者に不適切な過度な使用）
const MERCHANT_EXPRESSIONS = [/利益/g, /儲け/g, /投資/g, /コスト/g, /ビジネス/g, /商売/g];

// Critical: 変な登場人物名（HHH、XXX等）
const WEIRD_PERSON_NAMES = [
  /[A-Z]{3,}/g, // XXX、HHH等
  /某[A-Z]/g, // 某X等
];

// Critical: 架空の制度・判例のパターン
const HALLUCINATION_PATTERNS = [/大阪地裁/g, /大阪高裁/g, /判例[A-Z]/g, /最高裁.*平成.*年.*判決/g];

/**
 * 条文番号を抽出（例: "501" -> 501, "501-2" -> 501）
 */
function extractArticleNumber(filename) {
  const match = filename.match(/^(\d+)(-\d+)?\.yaml$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * 枝番条文かどうか（例: "501-2.yaml"）
 */
function isBranchArticle(filename) {
  return /-\d+\.yaml$/.test(filename);
}

/**
 * データフィールドを正規化（配列→文字列）
 */
function normalizeField(field) {
  if (!field) return '';
  if (Array.isArray(field)) return field.join('\n');
  return String(field);
}

/**
 * Critical: 条文番号の取り違えチェック
 */
function checkArticleNumberMismatch(data, filename, articleNum) {
  const issues = [];
  const branchMatch = filename.match(/^(\d+)-(\d+)\.yaml$/);
  const expectedNum = branchMatch ? parseInt(branchMatch[1], 10) : articleNum;
  const branchNum = branchMatch ? branchMatch[2] : null;

  const commentary = normalizeField(data.commentary);

  // commentaryでの誤記チェック
  if (commentary) {
    // 枝番条文の場合: 「第XXX条」と書かれていないか（正しくは「第XXX-Y条」）
    if (branchNum) {
      const wrongPattern = new RegExp(
        `第${expectedNum}条(?!の${branchNum}|[のー－−]${branchNum})`,
        'g'
      );
      if (wrongPattern.test(commentary)) {
        issues.push({
          articleNumber: filename.replace('.yaml', ''),
          filePath: filename,
          type: 'branch_article_number_error',
          severity: 'critical',
          field: 'commentary',
          description: `枝番条文${expectedNum}-${branchNum}のcommentaryで「第${expectedNum}条」と誤記（正: 第${expectedNum}条の${branchNum}）`,
          suggestion: `「第${expectedNum}条」を「第${expectedNum}条の${branchNum}」に修正`,
        });
      }
    }

    // 別の条文番号への言及チェック（循環的取り違え）
    const mentionedArticles = commentary.match(/第(\d+)条/g);
    if (mentionedArticles && mentionedArticles.length > 3) {
      // 同じ条文番号が3回以上言及されている場合（自己言及が少ない）
      const counts = {};
      mentionedArticles.forEach((m) => {
        const num = m.match(/\d+/)[0];
        counts[num] = (counts[num] || 0) + 1;
      });

      const selfMention = counts[expectedNum] || 0;
      const otherMentions = Object.entries(counts).filter(([n]) => n !== expectedNum.toString());

      if (otherMentions.length > 0 && selfMention === 0) {
        issues.push({
          articleNumber: filename.replace('.yaml', ''),
          filePath: filename,
          type: 'possible_article_confusion',
          severity: 'critical',
          field: 'commentary',
          description: `第${expectedNum}条のcommentaryで他の条文（${otherMentions.map(([n, c]) => `第${n}条×${c}`).join(', ')}）のみ言及。内容取り違えの可能性`,
          suggestion: '原文と解説の対応を確認してください',
        });
      }
    }
  }

  return issues;
}

/**
 * Critical: 数字の誤記チェック（金額、期間等）
 */
function checkNumberErrors(data, filename) {
  const issues = [];

  const commentary = normalizeField(data.commentary);
  const commentaryOsaka = normalizeField(data.commentaryOsaka);

  if (commentary && commentaryOsaka) {
    // 金額の不一致（XXX万円、XXX円等）
    const amountsInCommentary = commentary.match(/(\d+(?:,\d+)*(?:万|億|兆)?円)/g) || [];
    const amountsInOsaka = commentaryOsaka.match(/(\d+(?:,\d+)*(?:万|億|兆)?円)/g) || [];

    if (amountsInCommentary.length > 0 && amountsInOsaka.length > 0) {
      const cleanedCommentary = amountsInCommentary.map((a) => a.replace(/,/g, ''));
      const cleanedOsaka = amountsInOsaka.map((a) => a.replace(/,/g, ''));

      cleanedCommentary.forEach((amt) => {
        if (!cleanedOsaka.includes(amt)) {
          issues.push({
            articleNumber: filename.replace('.yaml', ''),
            filePath: filename,
            type: 'amount_mismatch',
            severity: 'critical',
            field: 'both',
            description: `金額の不一致: commentary「${amt}」がcommentaryOsakaに見当たらない`,
            suggestion: '両方の金額表記を確認してください',
          });
        }
      });
    }

    // 期間の不一致（XXヶ月、XX年等）
    const periodsInCommentary = commentary.match(/(\d+(?:年|ヶ月|か月|ヵ月|月|日|週間))/g) || [];
    const periodsInOsaka = commentaryOsaka.match(/(\d+(?:年|ヶ月|か月|ヵ月|月|日|週間))/g) || [];

    // 表記揺れを正規化
    const normalizePeriod = (p) => p.replace(/[ヶかヵ]月/g, 'ヶ月');

    if (periodsInCommentary.length > 0 && periodsInOsaka.length > 0) {
      periodsInCommentary.forEach((period) => {
        const normalized = normalizePeriod(period);
        const hasMatch = periodsInOsaka.some((p) => normalizePeriod(p) === normalized);

        if (!hasMatch) {
          issues.push({
            articleNumber: filename.replace('.yaml', ''),
            filePath: filename,
            type: 'period_mismatch',
            severity: 'critical',
            field: 'both',
            description: `期間の不一致: commentary「${period}」がcommentaryOsakaに見当たらない`,
            suggestion: '両方の期間表記を確認してください',
          });
        }
      });
    }
  }

  return issues;
}

/**
 * High: 男性表現チェック
 */
function checkMaleExpressions(data, filename) {
  const issues = [];

  ['commentary', 'commentaryOsaka'].forEach((field) => {
    const text = normalizeField(data[field]);
    if (!text) return;

    MALE_EXPRESSIONS.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        issues.push({
          articleNumber: filename.replace('.yaml', ''),
          filePath: filename,
          type: 'male_expression',
          severity: 'high',
          field,
          description: `男性表現「${matches[0]}」を使用（春日歩先生は女性）`,
          suggestion: '一人称は原則使わない。使う場合は「わたし」のみ',
        });
      }
    });
  });

  return issues;
}

/**
 * Critical: ハルシネーション（架空の判例・制度）チェック
 */
function checkHallucination(data, filename) {
  const issues = [];

  ['commentary', 'commentaryOsaka'].forEach((field) => {
    const text = normalizeField(data[field]);
    if (!text) return;

    HALLUCINATION_PATTERNS.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        issues.push({
          articleNumber: filename.replace('.yaml', ''),
          filePath: filename,
          type: 'hallucination',
          severity: 'critical',
          field,
          description: `架空の判例・制度の可能性: 「${matches[0]}」`,
          suggestion: '実在する判例・制度か確認してください',
        });
      }
    });

    // 変な登場人物名
    WEIRD_PERSON_NAMES.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches)];
        issues.push({
          articleNumber: filename.replace('.yaml', ''),
          filePath: filename,
          type: 'weird_person_name',
          severity: 'critical',
          field,
          description: `不適切な登場人物名: ${uniqueMatches.join(', ')}`,
          suggestion: 'A/B、太郎/花子等の適切な仮名に変更してください',
        });
      }
    });
  });

  return issues;
}

/**
 * Medium: 商人表現（過度な使用）チェック
 */
function checkMerchantExpressions(data, filename) {
  const issues = [];
  let totalCount = 0;

  ['commentary', 'commentaryOsaka'].forEach((field) => {
    const text = normalizeField(data[field]);
    if (!text) return;

    const counts = {};
    MERCHANT_EXPRESSIONS.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        const word = pattern.source;
        counts[word] = matches.length;
        totalCount += matches.length;
      }
    });

    // 商法では商人表現がある程度使われるのは自然だが、過度な場合は問題
    if (totalCount > 8) {
      // 閾値: 8回以上
      issues.push({
        articleNumber: filename.replace('.yaml', ''),
        filePath: filename,
        type: 'excessive_merchant_expression',
        severity: 'medium',
        field,
        description: `商人表現が過度に使用（計${totalCount}回: ${Object.entries(counts)
          .map(([w, c]) => `${w}×${c}`)
          .join(', ')}）`,
        suggestion: '教育者らしい表現に置き換えてください',
      });
    }
  });

  return issues;
}

/**
 * Medium: 短い解説チェック
 */
function checkShortCommentary(data, filename) {
  const issues = [];

  const commentaryOsaka = normalizeField(data.commentaryOsaka);
  if (commentaryOsaka && commentaryOsaka.length < 300) {
    issues.push({
      articleNumber: filename.replace('.yaml', ''),
      filePath: filename,
      type: 'short_commentary',
      severity: 'medium',
      field: 'commentaryOsaka',
      description: `解説が短い（${commentaryOsaka.length}文字）`,
      suggestion: '具体例を追加し、300文字以上の詳細な解説にしてください',
    });
  }

  return issues;
}

/**
 * 1つの条文をチェック
 */
function checkArticle(filename) {
  const filePath = path.join(SHOUHOU_DIR, filename);
  const issues = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(content);

    if (!data) {
      console.error(`⚠️  ${filename}: YAML解析失敗`);
      return [];
    }

    const articleNum = extractArticleNumber(filename);

    // Critical checks
    issues.push(...checkArticleNumberMismatch(data, filename, articleNum));
    issues.push(...checkNumberErrors(data, filename));
    issues.push(...checkHallucination(data, filename));

    // High checks
    issues.push(...checkMaleExpressions(data, filename));

    // Medium checks (Critical・High優先だが、ついでにチェック)
    issues.push(...checkMerchantExpressions(data, filename));
    issues.push(...checkShortCommentary(data, filename));
  } catch (error) {
    console.error(`⚠️  ${filename}: ${error.message}`);
  }

  return issues;
}

/**
 * メイン処理
 */
function main() {
  console.log('🔍 商法の全条文品質チェック開始（Critical・High優先）\n');

  const files = fs
    .readdirSync(SHOUHOU_DIR)
    .filter((f) => f.endsWith('.yaml'))
    .sort((a, b) => {
      const numA = extractArticleNumber(a);
      const numB = extractArticleNumber(b);
      return (numA || 0) - (numB || 0);
    });

  results.totalArticles = files.length;

  files.forEach((filename, index) => {
    const issues = checkArticle(filename);

    if (issues.length > 0) {
      results.issues.push(...issues);
      results.issuesFound++;
      results.totalIssues += issues.length;

      // Critical・High問題のみ即座に表示
      const criticalHighIssues = issues.filter(
        (i) => i.severity === 'critical' || i.severity === 'high'
      );
      if (criticalHighIssues.length > 0) {
        console.log(`❌ ${filename}: ${criticalHighIssues.length}件の重大問題`);
        criticalHighIssues.forEach((issue) => {
          console.log(`   [${issue.severity.toUpperCase()}] ${issue.description}`);
        });
      }
    }

    results.checkedArticles++;

    // 進捗表示（100条ごと）
    if ((index + 1) % 100 === 0) {
      console.log(`\n進捗: ${index + 1}/${files.length}条チェック完了`);
      console.log(`問題発見: ${results.issuesFound}条（計${results.totalIssues}件）\n`);
    }
  });

  // 結果をJSON出力
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

  // サマリー表示
  console.log('\n' + '='.repeat(60));
  console.log('📊 チェック完了サマリー');
  console.log('='.repeat(60));
  console.log(`総条文数: ${results.totalArticles}条`);
  console.log(`チェック完了: ${results.checkedArticles}条`);
  console.log(`問題のある条文: ${results.issuesFound}条`);
  console.log(`問題の総数: ${results.totalIssues}件`);
  console.log('');

  // 重大度別集計
  const bySeverity = {
    critical: results.issues.filter((i) => i.severity === 'critical').length,
    high: results.issues.filter((i) => i.severity === 'high').length,
    medium: results.issues.filter((i) => i.severity === 'medium').length,
    low: results.issues.filter((i) => i.severity === 'low').length,
  };

  console.log('重大度別:');
  console.log(`  Critical: ${bySeverity.critical}件 ⚠️`);
  console.log(`  High:     ${bySeverity.high}件`);
  console.log(`  Medium:   ${bySeverity.medium}件`);
  console.log(`  Low:      ${bySeverity.low}件`);
  console.log('');

  // 問題タイプ別集計
  const byType = {};
  results.issues.forEach((issue) => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });

  console.log('問題タイプ別:');
  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}件`);
    });

  console.log('');
  console.log(`結果を保存: ${OUTPUT_FILE}`);
  console.log('='.repeat(60));
}

main();
