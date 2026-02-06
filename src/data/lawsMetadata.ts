// このファイルは自動生成されます
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

export const lawsMetadata: LawsMetadata = {
  categories: [
    {
      id: 'shinchaku',
      title: 'できたてホカホカやで',
      icon: '🍚',
      laws: [
        {
          id: 'ai_suishin_hou',
          shortName: 'AI推進法',
          path: '/law/jp/ai_suishin_hou',
          status: 'available',
          year: 2025,
          badge: 'AIとなかよし！',
        },
      ],
    },
    {
      id: 'roppou',
      title: 'ろっぽう（＋会社法）',
      icon: '⚖️',
      laws: [
        {
          id: 'constitution',
          shortName: '日本国憲法',
          path: '/law/jp/constitution',
          status: 'available',
          year: 1946,
          badge: 'ここに来るまで長かったやん',
        },
        {
          id: 'minpou',
          shortName: '民法',
          path: '/law/jp/minpou',
          status: 'available',
          year: 1896,
          badge: '民のルールの土台や！',
        },
        {
          id: 'shouhou',
          shortName: '商法',
          path: '/law/jp/shouhou',
          status: 'available',
          year: 1899,
          badge: '商売人のバイブルや！',
        },
        {
          id: 'kaisya_hou',
          shortName: '会社法',
          path: '/law/jp/kaisya_hou',
          status: 'available',
          year: 2005,
          badge: '会社の教科書や！',
        },
        {
          id: 'keihou',
          shortName: '刑法',
          path: '/law/jp/keihou',
          status: 'available',
          year: 1907,
          badge: '悪いことしたらアカンで？',
        },
        {
          id: 'minji_soshou_hou',
          shortName: '民事訴訟法',
          path: '/law/jp/minji_soshou_hou',
          status: 'available',
          year: 1996,
          badge: '民事で困ったらここや！',
        },
        {
          id: 'keiji_soshou_hou',
          shortName: '刑事訴訟法',
          path: '/law/jp/keiji_soshou_hou',
          status: 'available',
          year: 1948,
          badge: '刑事の流れはここやで！',
        },
      ],
    },
    {
      id: 'mukashi',
      title: 'むかしの法律',
      icon: '📜',
      laws: [
        {
          id: 'jushichijo_kenpo',
          shortName: '十七条憲法',
          path: '/law/jp_old/jushichijo_kenpo',
          status: 'available',
          year: 604,
          badge: '和がだいじ！',
        },
        {
          id: 'konden_einen_shizai_hou',
          shortName: '墾田永年私財法',
          path: '/law/jp_old/konden_einen_shizai_hou',
          status: 'preparing',
          year: 743,
          badge: '土地がもらえる！',
        },
        {
          id: 'taiho_ritsuryo',
          shortName: '大宝律令',
          path: '/law/jp_old/taiho_ritsuryo',
          status: 'preparing',
          year: 701,
          badge: '日本初の法律！',
        },
        {
          id: 'goseibai_shikimoku',
          shortName: '御成敗式目',
          path: '/law/jp_old/goseibai_shikimoku',
          status: 'preparing',
          year: 1232,
          badge: '武士初の法律！',
        },
        {
          id: 'buke_shohatto',
          shortName: '武家諸法度',
          path: '/law/jp_old/buke_shohatto',
          status: 'preparing',
          year: 1615,
          badge: '大名をしばるで！',
        },
        {
          id: 'shourui_awaremi_no_rei',
          shortName: '生類憐みの令',
          path: '/law/jp_old/shourui_awaremi_no_rei',
          status: 'preparing',
          year: 1687,
          badge: '犬さん大事！',
        },
        {
          id: 'kinchu_kuge_shohatto',
          shortName: '禁中並公家諸法度',
          path: '/law/jp_old/kinchu_kuge_shohatto',
          status: 'preparing',
          year: 1615,
          badge: '朝廷さんも約束！',
        },
        {
          id: 'gokajou_no_goseimon',
          shortName: '五箇条の御誓文',
          path: '/law/jp_old/gokajou_no_goseimon',
          status: 'preparing',
          year: 1868,
          badge: '広く会議をおこすで！',
        },
        {
          id: 'meiji_kenpo',
          shortName: '大日本帝国憲法',
          path: '/law/jp_old/meiji_kenpo',
          status: 'preparing',
          year: 1889,
          badge: '日本の夜明け？',
        },
      ],
    },
    {
      id: 'gaikoku',
      title: 'がいこくの法律',
      icon: '🌍',
      laws: [
        {
          id: 'german_basic_law',
          shortName: 'ドイツ基本法',
          path: '/law/foreign/german_basic_law',
          status: 'available',
          year: 1949,
          badge: '基本法やけど憲法やで！',
        },
        {
          id: 'us_constitution',
          shortName: 'アメリカ合衆国憲法',
          path: '/law/foreign/us_constitution',
          status: 'available',
          year: 1787,
          badge: '自由の重さがわかるで！',
        },
        {
          id: 'prc_constitution',
          shortName: '中華人民共和国憲法',
          path: '/law/foreign/prc_constitution',
          status: 'available',
          year: 1982,
          badge: '社会主義の中華トッピングや！',
        },
      ],
    },
    {
      id: 'gaikoku_mukashi',
      title: 'がいこくのむかしの法律',
      icon: '🏛️',
      laws: [
        {
          id: 'hammurabi_code',
          shortName: 'ハンムラビ法典',
          path: '/law/foreign_old/hammurabi_code',
          status: 'preparing',
          year: -1750,
          badge: '目には目？',
        },
        {
          id: 'magna_carta',
          shortName: 'マグナ・カルタ',
          path: '/law/foreign_old/magna_carta',
          status: 'available',
          year: 1215,
          badge: '王権をしばるで！',
        },
        {
          id: 'corpus_iuris_civilis',
          shortName: 'ローマ法大全',
          path: '/law/foreign_old/corpus_iuris_civilis',
          status: 'preparing',
          year: 534,
          badge: '法律のおかあさん！',
        },
        {
          id: 'bill_of_rights',
          shortName: '権利章典',
          path: '/law/foreign_old/bill_of_rights',
          status: 'preparing',
          year: 1689,
          badge: '議会が一番！',
        },
        {
          id: 'weimarer_verfassung',
          shortName: 'ワイマール憲法',
          path: '/law/foreign_old/weimarer_verfassung',
          status: 'preparing',
          year: 1919,
          badge: '生活保障や！',
        },
        {
          id: 'napoleonic_code',
          shortName: 'ナポレオン法典',
          path: '/law/foreign_old/napoleonic_code',
          status: 'preparing',
          year: 1804,
          badge: '民法のおとうさん！',
        },
      ],
    },
    {
      id: 'treaty',
      title: '国際じょうやく',
      icon: '🤝',
      laws: [
        {
          id: 'antarctic_treaty',
          shortName: '南極条約',
          path: '/law/treaty/antarctic_treaty',
          status: 'available',
          year: 1959,
          badge: 'ガンダムなんー？',
        },
        {
          id: 'ramsar_convention',
          shortName: 'ラムサール条約',
          path: '/law/treaty/ramsar_convention',
          status: 'preparing',
          year: 1971,
          badge: '鳥さん守る！',
        },
        {
          id: 'un_charter',
          shortName: '国連憲章',
          path: '/law/treaty/un_charter',
          status: 'preparing',
          year: 1945,
          badge: '地球人の集まりや！',
        },
        {
          id: 'npt',
          shortName: '核兵器不拡散条約',
          path: '/law/treaty/npt',
          status: 'preparing',
          year: 1968,
          badge: '核はあかん！',
        },
        {
          id: 'outer_space_treaty',
          shortName: '宇宙条約',
          path: '/law/treaty/outer_space_treaty',
          status: 'preparing',
          year: 1967,
          badge: '宇宙はみんなの！',
        },
        {
          id: 'universal_postal_convention',
          shortName: '万国郵便条約',
          path: '/law/treaty/universal_postal_convention',
          status: 'preparing',
          year: 1874,
          badge: '手紙が届く！',
        },
        {
          id: 'olympic_charter',
          shortName: 'オリンピック憲章',
          path: '/law/treaty/olympic_charter',
          status: 'preparing',
          year: 1894,
          badge: 'みんなで走ろー！',
        },
        {
          id: 'prime_meridian_conference',
          shortName: '国際子午線会議',
          path: '/law/treaty/prime_meridian_conference',
          status: 'preparing',
          year: 1884,
          badge: '時間のルール！',
        },
        {
          id: 'road_signs_convention',
          shortName: '道路標識条約',
          path: '/law/treaty/road_signs_convention',
          status: 'preparing',
          year: 1968,
          badge: '世界共通！旅OK！',
        },
        {
          id: 'metre_convention',
          shortName: 'メートル条約',
          path: '/law/treaty/metre_convention',
          status: 'preparing',
          year: 1875,
          badge: 'メートルが同じ！',
        },
        {
          id: 'itu_constitution',
          shortName: 'ITU憲章',
          path: '/law/treaty/itu_constitution',
          status: 'preparing',
          year: 1865,
          badge: 'スマホつながる！',
        },
        {
          id: 'unclos',
          shortName: '国連海洋法条約',
          path: '/law/treaty/unclos',
          status: 'preparing',
          year: 1982,
          badge: '海のルール！',
        },
        {
          id: 'chicago_convention',
          shortName: 'シカゴ条約',
          path: '/law/treaty/chicago_convention',
          status: 'preparing',
          year: 1944,
          badge: '飛行機のルール！',
        },
        {
          id: 'extradition_treaty',
          shortName: '日米犯罪人引渡条約',
          path: '/law/treaty/extradition_treaty',
          status: 'preparing',
          year: 1978,
          badge: '悪いひと返して！',
        },
        {
          id: 'who_constitution',
          shortName: 'WHO憲章',
          path: '/law/treaty/who_constitution',
          status: 'preparing',
          year: 1946,
          badge: '手を洗おー！',
        },
      ],
    },
  ],
};
