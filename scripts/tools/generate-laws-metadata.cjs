#!/usr/bin/env node

/**
 * lawsMetadata.ts を自動生成するスクリプト
 * 
 * 真実の源:
 * - src/data/laws_metadata.yaml: カテゴリ構造とパス
 * - src/data/laws/category/law_id/law_metadata.yaml: 各法律の詳細情報（shortName, year, badge等）
 * 
 * 生成先:
 * - src/data/lawsMetadata.ts
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const LAWS_METADATA_YAML = path.join(__dirname, '../../src/data/laws_metadata.yaml');
const OUTPUT_FILE = path.join(__dirname, '../../src/data/lawsMetadata.ts');
const LAWS_DIR = path.join(__dirname, '../../src/data/laws');

/**
 * 指定された法律のlaw_metadata.yamlを読み込む
 */
function readLawMetadata(lawPath) {
  try {
    // pathから category と law_id を抽出
    // 例: "/law/jp/constitution" -> category="jp", lawId="constitution"
    const pathParts = lawPath.split('/').filter(Boolean);
    if (pathParts.length < 3) return null;
    
    const category = pathParts[1];
    const lawId = pathParts[2];
    
    const metadataPath = path.join(LAWS_DIR, category, lawId, 'law_metadata.yaml');
    
    if (!fs.existsSync(metadataPath)) {
      console.warn(`⚠️  law_metadata.yaml not found: ${metadataPath}`);
      return null;
    }
    
    const content = fs.readFileSync(metadataPath, 'utf8');
    const data = yaml.load(content);
    
    return {
      shortName: data.shortName || data.name || lawId,
      year: data.year || null,
      badge: data.badge || null,
    };
  } catch (error) {
    console.error(`Error reading law metadata for ${lawPath}:`, error.message);
    return null;
  }
}

/**
 * TypeScriptコードを生成
 */
function generateTypeScriptCode(data) {
  const categories = data.categories.map(category => {
    const laws = category.laws.map(law => {
      const metadata = readLawMetadata(law.path);
      
      return {
        id: law.id,
        shortName: metadata?.shortName || law.id,
        path: law.path,
        status: law.status,
        year: metadata?.year,
        badge: metadata?.badge,
      };
    });
    
    return {
      ...category,
      laws,
    };
  });
  
  const tsCode = `// このファイルは自動生成されます
// 手動で編集しないでください
// 生成コマンド: node scripts/tools/generate-laws-metadata.js

export interface LawEntry {
  id: string;
  shortName: string;
  path: string;
  status: 'available' | 'preparing';
  year?: number | null;
  badge?: string | null;
}

export interface CategoryEntry {
  id: string;
  title: string;
  icon: string;
  laws: LawEntry[];
}

export interface LawsMetadata {
  categories: CategoryEntry[];
}

export const lawsMetadata: LawsMetadata = ${JSON.stringify({ categories }, null, 2)
  .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
  .replace(/: "available"/g, ": 'available'")
  .replace(/: "preparing"/g, ": 'preparing'")
};
`;
  
  return tsCode;
}

/**
 * メイン処理
 */
function main() {
  console.log('🔧 lawsMetadata.ts を自動生成中...\n');
  
  // 1. laws_metadata.yaml を読み込む
  console.log(`📖 読み込み: ${LAWS_METADATA_YAML}`);
  const content = fs.readFileSync(LAWS_METADATA_YAML, 'utf8');
  const data = yaml.load(content);
  
  // 2. 各法律のlaw_metadata.yamlを読み込んでマージ
  console.log('📖 各法律のメタデータを読み込み中...');
  const tsCode = generateTypeScriptCode(data);
  
  // 3. TypeScriptファイルを出力
  console.log(`✍️  書き込み: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, tsCode, 'utf8');
  
  console.log('\n✅ lawsMetadata.ts の生成が完了しました！');
  console.log('\n📝 真実の源:');
  console.log('  - src/data/laws_metadata.yaml');
  console.log('  - src/data/laws/category/law_id/law_metadata.yaml');
}

if (require.main === module) {
  main();
}
