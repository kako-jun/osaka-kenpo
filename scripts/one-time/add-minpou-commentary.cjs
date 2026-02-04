const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const BASE_PATH = 'src/data/laws/jp/minpou';

function generateCommentary(articleNum, title, originalText) {
  const lines = [];

  // タイトルがあれば使用
  if (title) {
    lines.push(`本条（第${articleNum}条）は「${title}」について定めた規定です。`);
  } else {
    lines.push(`本条（第${articleNum}条）は民法の重要な規定です。`);
  }

  // 条文内容に基づいた解説
  const text = originalText.join('');

  if (text.includes('債権') || text.includes('債務')) {
    lines.push(
      '本条は債権債務関係について定め、当事者間の権利義務関係を明確にしています。債権者と債務者の関係性を整備し、法的安定性を確保することを目的としています。'
    );
  }

  if (text.includes('遺贈') || text.includes('相続')) {
    lines.push(
      '本条は相続・遺贈に関する規定で、被相続人の財産が適切に承継されることを保障します。相続人や受遺者の権利保護と財産の適正な承継を両立させています。'
    );
  }

  if (text.includes('契約')) {
    lines.push(
      '本条は契約関係に関する規定で、契約当事者の権利義務を明確にしています。契約の成立、効力、履行などに関する基本ルールを定めています。'
    );
  }

  if (text.includes('所有権') || text.includes('所有')) {
    lines.push(
      '本条は所有権に関する規定で、権利者が物を支配する法的基盤を保障します。所有権の内容や範囲、保護の仕組みを定めています。'
    );
  }

  if (text.includes('親権') || text.includes('後見') || text.includes('監護')) {
    lines.push(
      '本条は親権や監護・後見に関する規定で、未成年者や被後見人の利益保護を目的としています。法的保護を必要とする者の権利を保障する重要な規定です。'
    );
  }

  if (text.includes('賃貸借') || text.includes('賃貸')) {
    lines.push(
      '本条は賃貸借関係に関する規定で、賃貸人と賃借人の権利義務をバランスよく整備しています。賃料、修繕義務、明渡しなどの重要事項を定めています。'
    );
  }

  if (text.includes('売買')) {
    lines.push(
      '本条は売買契約に関する規定で、売主と買主の権利義務を明確にしています。代金支払義務や引渡し義務など、売買の基本的事項を定めています。'
    );
  }

  if (text.includes('不法行為') || text.includes('損害賠償')) {
    lines.push(
      '本条は不法行為による損害賠償に関する規定で、被害者の救済と加害者の責任を明確にしています。権利侵害があった場合の法的責任の所在を定めています。'
    );
  }

  if (text.includes('物権')) {
    lines.push(
      '本条は物権に関する規定で、物の帰属と利用に関する法的ルールを定めています。所有権や制限物権など、物権の基本的事項を規定しています。'
    );
  }

  if (text.includes('時効')) {
    lines.push(
      '本条は時効に関する規定で、権利行使の期限や時効期間を定めています。法的関係の早期確定と証拠保全を目的としています。'
    );
  }

  if (text.includes('会社') || text.includes('法人')) {
    lines.push(
      '本条は法人に関する規定で、法人の能力や行為、責任について定めています。法人格の確立と活動の法的枠組みを整備しています。'
    );
  }

  // デフォルトの解説
  if (lines.length < 2) {
    lines.push(
      '本条は民法上の権利義務関係を整備する重要な規定です。当事者間の法的関係を明確にし、紛争の防止と解決に寄与します。'
    );
  }

  lines.push(
    '本条は実務上、民事紛争の解決において重要な役割を果たし、当事者の権利保護に寄与しています。'
  );

  return lines;
}

function processFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const data = yaml.load(content);

  // 削除条文はスキップ
  if (data.isDeleted === true) {
    return null;
  }

  // commentaryがすでに存在する場合はスキップ
  if (data.commentary && data.commentary.length > 0) {
    return null;
  }

  // originalTextが空の場合はスキップ
  if (!data.originalText || data.originalText.length === 0) {
    return null;
  }

  const articleNum = data.article;
  const title = data.title || '';

  // commentaryを生成
  const commentary = generateCommentary(articleNum, title, data.originalText);

  if (commentary && commentary.length > 0) {
    data.commentary = commentary;

    // YAMLファイルに書き戻す
    const newContent = yaml.dump(data, {
      allowUnicode: true,
      sortKeys: false,
      lineWidth: -1,
      noRefs: true,
    });

    fs.writeFileSync(filepath, newContent, 'utf8');
    return articleNum;
  }

  return null;
}

function main() {
  const files = fs
    .readdirSync(BASE_PATH)
    .filter((f) => f.endsWith('.yaml') && f !== 'law_metadata.yaml')
    .sort((a, b) => {
      const numA = parseInt(a.replace('.yaml', ''));
      const numB = parseInt(b.replace('.yaml', ''));
      return numA - numB;
    });

  let processedCount = 0;

  for (const file of files) {
    const filepath = path.join(BASE_PATH, file);
    const result = processFile(filepath);

    if (result) {
      processedCount++;
      if (processedCount % 50 === 0) {
        console.log(`✓ 進捗: ${processedCount}件処理完了（第${result}条）`);
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`処理完了: 合計${processedCount}件の条文にcommentaryを追加しました`);
  console.log(`${'='.repeat(50)}`);
}

main();
