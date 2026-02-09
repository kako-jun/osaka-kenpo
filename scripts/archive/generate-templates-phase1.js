import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Phase 1の法律定義
const phase1Laws = [
  {
    id: 'gokajou_no_goseimon',
    name: '五箇条の御誓文',
    category: 'jp',
    totalArticles: 5,
    articlePrefix: '一、',
    titlePattern: (i) => `第${i}条`,
  },
  {
    id: 'meiji_kenpo',
    name: '大日本帝国憲法（明治憲法）',
    category: 'jp_hist',
    totalArticles: 76,
    articlePrefix: '第',
    titlePattern: (i) => `第${i}条`,
  },
  {
    id: 'bill_of_rights',
    name: '権利章典（Bill of Rights 1689）',
    category: 'uk',
    totalArticles: 13,
    articlePrefix: 'Article ',
    titlePattern: (i) => `Article ${i}`,
  },
  {
    id: 'goseibai_shikimoku',
    name: '御成敗式目（貞永式目）',
    category: 'jp_hist',
    totalArticles: 51,
    articlePrefix: '第',
    titlePattern: (i) => `第${i}条`,
  },
];

async function generateTemplates() {
  for (const law of phase1Laws) {
    const lawDir = path.join(__dirname, '..', 'src', 'data', 'laws', law.category, law.id);

    // ディレクトリが存在することを確認
    if (!fs.existsSync(lawDir)) {
      fs.mkdirSync(lawDir, { recursive: true });
    }

    console.log(`\n${law.name} のテンプレート生成中...`);

    for (let i = 1; i <= law.totalArticles; i++) {
      const yamlPath = path.join(lawDir, `${i}.yaml`);

      // 既存ファイルはスキップ
      if (fs.existsSync(yamlPath)) {
        console.log(`  ${i}.yaml は既に存在します（スキップ）`);
        continue;
      }

      const templateData = {
        article: i,
        title: law.titlePattern(i),
        titleOsaka: '',
        originalText: ['【ここに原文を入力してください】'],
        osakaText: [],
        commentary: [],
        commentaryOsaka: [],
      };

      const yamlContent = yaml.dump(templateData, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      });

      fs.writeFileSync(yamlPath, yamlContent, 'utf8');

      if (i % 10 === 0 || i === law.totalArticles) {
        console.log(`  ${i}/${law.totalArticles} 条完了`);
      }
    }

    console.log(`✅ ${law.name} のテンプレート生成完了（${law.totalArticles}条）`);
  }

  console.log('\n🎉 Phase 1 全テンプレート生成完了！');
  console.log(`合計: ${phase1Laws.reduce((sum, law) => sum + law.totalArticles, 0)} 条`);
}

generateTemplates().catch(console.error);
