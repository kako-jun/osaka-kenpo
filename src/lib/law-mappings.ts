// 法律名マッピングの一元管理

export const LAW_NAME_MAPPING: { [key: string]: string } = {
  // 日本・現行法
  constitution: '日本国憲法',
  minpou: '民法',
  keihou: '刑法',
  shouhou: '商法',
  minji_soshou_hou: '民事訴訟法',
  keiji_soshou_hou: '刑事訴訟法',
  
  // 日本・歴史法
  jushichijo_kenpo: '十七条の憲法',
  meiji_kenpo: '大日本帝国憲法',
  taiho_ritsuryo: '大宝律令',
  goseibai_shikimoku: '御成敗式目',
  buke_shohatto: '武家諸法度',
  kinchu_kuge_shohatto: '禁中並公家諸法度',
  
  // 外国・現行法
  german_basic_law: 'ドイツ基本法',
  us_constitution: 'アメリカ合衆国憲法',
  prc_constitution: '中華人民共和国憲法',
  
  // 外国・歴史法
  hammurabi_code: 'ハンムラビ法典',
  magna_carta: 'マグナ・カルタ',
  napoleonic_code: 'ナポレオン法典',
  
  // 国際条約
  un_charter: '国際連合憲章',
  antarctic_treaty: '南極条約',
  ramsar_convention: 'ラムサール条約',
  npt: '核拡散防止条約',
  outer_space_treaty: '宇宙条約',
  universal_postal_convention: '万国郵便条約',
  olympic_charter: 'オリンピック憲章',
  extradition_treaty: '犯罪人引渡し条約',
} as const

export const LAW_YEAR_MAPPING: { [key: string]: number } = {
  // 日本・現行法
  constitution: 1946,
  minpou: 1896,
  keihou: 1907,
  shouhou: 1890,
  minji_soshou_hou: 1996,
  keiji_soshou_hou: 1948,
  
  // 日本・歴史法
  jushichijo_kenpo: 604,
  taiho_ritsuryo: 701,
  goseibai_shikimoku: 1232,
  buke_shohatto: 1615,
  kinchu_kuge_shohatto: 1613,
  meiji_kenpo: 1889,
  
  // 外国・歴史法
  hammurabi_code: -1754, // 紀元前
  magna_carta: 1215,
  napoleonic_code: 1804,
  
  // 外国・現行法
  german_basic_law: 1949,
  us_constitution: 1787,
  prc_constitution: 1982,
  
  // 国際条約
  antarctic_treaty: 1959,
  ramsar_convention: 1971,
  un_charter: 1945,
  npt: 1968,
  outer_space_treaty: 1967,
  universal_postal_convention: 1874,
  olympic_charter: 1894,
  extradition_treaty: 1900,
} as const

export function getLawName(slug: string): string {
  return LAW_NAME_MAPPING[slug] || slug
}

export function getLawYear(slug: string): number | null {
  return LAW_YEAR_MAPPING[slug] || null
}

export function formatLawYear(year: number | null): string {
  if (year === null) return '年不明'
  if (year < 0) return `紀元前${Math.abs(year)}年`
  return `${year}年`
}