import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 残りの法律
const remainingLaws = [
  {
    id: 'extradition_treaty',
    name: '日米犯罪人引渡条約',
    category: 'treaty',
    totalArticles: 21,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'olympic_charter',
    name: 'オリンピック憲章',
    category: 'treaty',
    totalArticles: 60,
    titlePattern: (i) => `Rule ${i}`
  },
  {
    id: 'universal_postal_convention',
    name: '万国郵便条約',
    category: 'treaty',
    totalArticles: 40,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'road_signs_convention',
    name: '道路標識及び信号に関する条約',
    category: 'treaty',
    totalArticles: 30,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'itu_constitution',
    name: '国際電気通信連合憲章',
    category: 'treaty',
    totalArticles: 59,
    titlePattern: (i) => `第${i}条`
  },
  {
    id: 'prime_meridian_conference',
    name: '本初子午線国際会議決議',
    category: 'treaty',
    totalArticles: 7,
    titlePattern: (i) => `決議${i}`
  },
  {
    id: 'konden_einen_shizai_hou',
    name: '墾田永年私財法',
    category: 'jp',
    totalArticles: 1,
    titlePattern: (i) => '全文'
  },
  {
    id: 'shourui_awaremi_no_rei',
    name: '生類憐みの令',
    category: 'jp',
    totalArticles: 5, // 主要な5つの令
    titlePattern: (i) => `第${i}令`
  },
  {
    id: 'corpus_iuris_civilis',
    name: 'ローマ法大全',
    category: 'roman',
    totalArticles: 50, // 主要な50条を選択（全体は膨大すぎる）
    titlePattern: (i) => `D. ${i}`
  },
  {
    id: 'taiho_ritsuryo',
    name: '大宝律令',
    category: 'jp_old',
    totalArticles: 30, // 主要な30条を選択（全体は膨大）
    titlePattern: (i) => `第${i}条`
  }
];

async function generateTemplates() {
  let totalGenerated = 0;

  for (const law of remainingLaws) {
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
    }

    console.log(`✅ ${law.name} のテンプレート生成完了（${law.totalArticles}条）`);
  }

  const totalArticles = remainingLaws.reduce((sum, law) => sum + law.totalArticles, 0);
  console.log('\n🎉 残り法律のテンプレート生成完了！');
  console.log(`法律数: ${remainingLaws.length}`);
  console.log(`合計条文数: ${totalArticles} 条`);
  console.log(`新規生成: ${totalGenerated} 条`);
}

generateTemplates().catch(console.error);
