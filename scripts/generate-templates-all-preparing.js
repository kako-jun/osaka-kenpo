import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 確実に条文数が分かっている法律のみ
const preparingLaws = [
  // 外国現行法
  {
    id: 'german_basic_law',
    name: 'ドイツ連邦共和国基本法',
    category: 'foreign',
    totalArticles: 146,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'us_constitution',
    name: 'アメリカ合衆国憲法',
    category: 'foreign',
    totalArticles: 34, // 本文7条 + 修正27条
    titlePattern: (i) => i <= 7 ? `Article ${i}` : `Amendment ${i - 7}`
  },
  {
    id: 'prc_constitution',
    name: '中華人民共和国憲法',
    category: 'foreign',
    totalArticles: 138,
    titlePattern: (i) => `第${i}条`
  },

  // 外国歴史法
  {
    id: 'hammurabi_code',
    name: 'ハンムラビ法典',
    category: 'foreign_old',
    totalArticles: 282,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'weimarer_verfassung',
    name: 'ワイマール憲法',
    category: 'de',
    totalArticles: 181,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'napoleonic_code',
    name: 'ナポレオン法典（フランス民法典）',
    category: 'foreign_old',
    totalArticles: 2281,
    titlePattern: (i) => `第${i}条`
  },

  // 国際条約
  {
    id: 'ramsar_convention',
    name: 'ラムサール条約',
    category: 'treaty',
    totalArticles: 12,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'un_charter',
    name: '国際連合憲章',
    category: 'treaty',
    totalArticles: 111,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'npt',
    name: '核兵器不拡散条約',
    category: 'treaty',
    totalArticles: 11,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'outer_space_treaty',
    name: '宇宙条約',
    category: 'treaty',
    totalArticles: 17,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'metre_convention',
    name: 'メートル条約',
    category: 'treaty',
    totalArticles: 18,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'unclos',
    name: '国連海洋法条約',
    category: 'treaty',
    totalArticles: 320,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'chicago_convention',
    name: '国際民間航空条約（シカゴ条約）',
    category: 'treaty',
    totalArticles: 96,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'who_constitution',
    name: '世界保健機関憲章',
    category: 'treaty',
    totalArticles: 82,
    titlePattern: (i) => `第${i}条`
  },

  // 日本歴史法（簡単なもの）
  {
    id: 'kinchu_kuge_shohatto',
    name: '禁中並公家諸法度',
    category: 'jp_old',
    totalArticles: 17,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'buke_shohatto',
    name: '武家諸法度',
    category: 'jp_old',
    totalArticles: 13, // 元和令（1615年版）
    titlePattern: (i) => `第${i}条`
  },
];

async function generateTemplates() {
  let totalGenerated = 0;

  for (const law of preparingLaws) {
    const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', law.category, law.id);

    // ディレクトリ作成
    if (!fs.existsSync(lawDir)) {
      fs.mkdirSync(lawDir, { recursive: true });
    }

    console.log(`\n${law.name} のテンプレート生成中...`);

    for (let i = 1; i <= law.totalArticles; i++) {
      const yamlPath = path.join(lawDir, `${i}.yaml`);

      // 既存ファイルはスキップ
      if (fs.existsSync(yamlPath)) {
        continue;
      }

      const templateData = {
        article: i,
        title: law.titlePattern(i),
        titleOsaka: '',
        originalText: ['【ここに原文を入力してください】'],
        osakaText: [],
        commentary: [],
        commentaryOsaka: []
      };

      const yamlContent = yaml.dump(templateData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true
      });

      fs.writeFileSync(yamlPath, yamlContent, 'utf8');
      totalGenerated++;

      if (i % 50 === 0 || i === law.totalArticles) {
        console.log(`  ${i}/${law.totalArticles} 条完了`);
      }
    }

    console.log(`✅ ${law.name} のテンプレート生成完了（${law.totalArticles}条）`);
  }

  const totalArticles = preparingLaws.reduce((sum, law) => sum + law.totalArticles, 0);
  console.log('\n🎉 全テンプレート生成完了！');
  console.log(`法律数: ${preparingLaws.length}`);
  console.log(`合計条文数: ${totalArticles} 条`);
  console.log(`新規生成: ${totalGenerated} 条`);
}

generateTemplates().catch(console.error);
