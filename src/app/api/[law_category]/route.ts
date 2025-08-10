import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: Request,
  { params }: { params: { law_category: string } }
) {
  const { law_category } = params;

  if (!law_category) {
    return NextResponse.json({ error: 'Missing law category' }, { status: 400 });
  }

  const lawsDirectory = path.join(process.cwd(), 'src', 'data', 'laws', law_category);

  try {
    const dirents = await fs.readdir(lawsDirectory, { withFileTypes: true });
    const lawFolders = dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    const lawNameMapping: { [key: string]: string } = {
      constitution: '日本国憲法',
      minpou: '民法',
      keihou: '刑法',
      shouhou: '商法',
      minji_soshou_hou: '民事訴訟法',
      keiji_soshou_hou: '刑事訴訟法',
      taiho_ritsuryo: '大宝律令',
      goseibai_shikimoku: '御成敗式目',
      buke_shohatto: '武家諸法度',
      kinchu_kuge_shohatto: '禁中並公家諸法度',
      jushichijo_kenpo: '十七条の憲法',
      meiji_kenpo: '大日本帝国憲法',
      hammurabi_code: 'ハンムラビ法典',
      magna_carta: 'マグナ・カルタ',
      german_basic_law: 'ドイツ基本法',
      napoleonic_code: 'ナポレオン法典',
      us_constitution: 'アメリカ合衆国憲法',
      prc_constitution: '中華人民共和国憲法',
      antarctic_treaty: '南極条約',
      ramsar_convention: 'ラムサール条約',
      un_charter: '国際連合憲章',
      npt: '核拡散防止条約',
      outer_space_treaty: '宇宙条約',
      universal_postal_convention: '万国郵便条約',
      olympic_charter: 'オリンピック憲章',
      extradition_treaty: '犯罪人引渡し条約',
    };

    const lawYearMapping: { [key: string]: number } = {
      constitution: 1946,
      minpou: 1896,
      keihou: 1907,
      shouhou: 1890,
      minji_soshou_hou: 1996,
      keiji_soshou_hou: 1948,
      jushichijo_kenpo: 604,
      taiho_ritsuryo: 701,
      goseibai_shikimoku: 1232,
      buke_shohatto: 1615,
      kinchu_kuge_shohatto: 1613,
      meiji_kenpo: 1889,
      hammurabi_code: -1754,
      magna_carta: 1215,
      german_basic_law: 1949,
      napoleonic_code: 1804,
      us_constitution: 1787,
      prc_constitution: 1982,
      antarctic_treaty: 1959,
      ramsar_convention: 1971,
      un_charter: 1945,
      npt: 1968,
      outer_space_treaty: 1967,
      universal_postal_convention: 1874,
      olympic_charter: 1894,
      extradition_treaty: 1900,
    };

    const foreignOldLawNameMapping: { [key: string]: string } = {
      hammurabi_code: 'ハンムラビ法典',
      magna_carta: 'マグナ・カルタ',
      napoleonic_code: 'ナポレオン法典',
    };
      antarctic_treaty: '南極条約',
      ramsar_convention: 'ラムサール条約',
      un_charter: '国際連合憲章',
      npt: '核拡散防止条約',
      outer_space_treaty: '宇宙条約',
      universal_postal_convention: '万国郵便条約',
      olympic_charter: 'オリンピック憲章',
      extradition_treaty: '犯罪人引渡し条約',
    };

    const lawsData = lawFolders.map(slug => ({
      slug: slug,
      name: lawNameMapping[slug] || slug,
      year: lawYearMapping[slug] || null, // 年情報を追加
    }));

    // 年情報でソート
    lawsData.sort((a, b) => {
      if (a.year === null || b.year === null) return 0; // 年情報がない場合はソートしない
      return a.year - b.year;
    });

    return NextResponse.json(lawsData);
  } catch (error) {
    console.error(`Error reading laws for category ${law_category}:`, error);
    return NextResponse.json(
      { error: `Could not load laws for category ${law_category}` },
      { status: 500 }
    );
  }
}
