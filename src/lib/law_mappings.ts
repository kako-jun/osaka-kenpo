// 年度フォーマット用のユーティリティ関数

export function formatLawYear(year: number | null): string {
  if (year === null) return '年不明'
  if (year < 0) return `紀元前${Math.abs(year)}年`
  return `${year}年`
}

// 法律スラッグから法律名を取得する（従来のシンプルな実装）
export function getLawName(slug: string): string {
  // スラッグから一般的な法律名へのマッピング
  const lawNames: { [key: string]: string } = {
    'constitution': '日本国憲法',
    'ai_suishin_hou': 'AI推進法',
    'keihou': '刑法',
    'minpou': '民法',
    'shouhou': '商法',
    'keiji_soshou_hou': '刑事訴訟法',
    'minji_soshou_hou': '民事訴訟法',
    'jushichijo_kenpo': '十七条憲法',
    'meiji_kenpo': '大日本帝国憲法',
    'taiho_ritsuryo': '大宝律令',
    'goseibai_shikimoku': '御成敗式目',
    'buke_shohatto': '武家諸法度',
    'kinchu_kuge_shohatto': '禁中並公家諸法度',
    'us_constitution': 'アメリカ合衆国憲法',
    'german_basic_law': 'ドイツ基本法',
    'prc_constitution': '中華人民共和国憲法',
    'magna_carta': 'マグナ・カルタ',
    'hammurabi_code': 'ハンムラビ法典',
    'napoleonic_code': 'ナポレオン法典',
    'un_charter': '国際連合憲章',
    'antarctic_treaty': '南極条約',
    'npt': '核拡散防止条約',
    'outer_space_treaty': '宇宙条約',
    'olympic_charter': 'オリンピック憲章',
    'ramsar_convention': 'ラムサール条約',
    'universal_postal_convention': '万国郵便条約',
    'extradition_treaty': '犯罪人引渡し条約',
  }

  return lawNames[slug] || slug
}

// 法律スラッグから年度を取得する（従来のシンプルな実装）
export function getLawYear(slug: string): number | null {
  const lawYears: { [key: string]: number | null } = {
    'constitution': 1946,
    'ai_suishin_hou': 2025,
    'keihou': 1907,
    'minpou': 1896,
    'shouhou': 1899,
    'keiji_soshou_hou': 1948,
    'minji_soshou_hou': 1996,
    'jushichijo_kenpo': 604,
    'meiji_kenpo': 1889,
    'taiho_ritsuryo': 701,
    'goseibai_shikimoku': 1232,
    'buke_shohatto': 1615,
    'kinchu_kuge_shohatto': 1613,
    'us_constitution': 1787,
    'german_basic_law': 1949,
    'prc_constitution': 1982,
    'magna_carta': 1215,
    'hammurabi_code': -1754,
    'napoleonic_code': 1804,
    'un_charter': 1945,
    'antarctic_treaty': 1959,
    'npt': 1968,
    'outer_space_treaty': 1967,
    'olympic_charter': 1894,
    'ramsar_convention': 1971,
    'universal_postal_convention': 1874,
    'extradition_treaty': null,
  }

  return lawYears[slug] || null
}