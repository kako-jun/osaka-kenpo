// laws_metadata.yaml から変換した静的データ
export interface LawEntry {
  id: string;
  shortName: string;
  path: string;
  status: 'available' | 'preparing';
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
        },
        { id: 'minpou', shortName: '民法', path: '/law/jp/minpou', status: 'available' },
        { id: 'shouhou', shortName: '商法', path: '/law/jp/shouhou', status: 'available' },
        { id: 'kaisya_hou', shortName: '会社法', path: '/law/jp/kaisya_hou', status: 'available' },
        { id: 'keihou', shortName: '刑法', path: '/law/jp/keihou', status: 'available' },
        {
          id: 'minji_soshou_hou',
          shortName: '民事訴訟法',
          path: '/law/jp/minji_soshou_hou',
          status: 'available',
        },
        {
          id: 'keiji_soshou_hou',
          shortName: '刑事訴訟法',
          path: '/law/jp/keiji_soshou_hou',
          status: 'available',
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
        },
        {
          id: 'konden_einen_shizai_hou',
          shortName: '墾田永年私財法',
          path: '/law/jp_old/konden_einen_shizai_hou',
          status: 'preparing',
        },
        {
          id: 'taiho_ritsuryo',
          shortName: '大宝律令',
          path: '/law/jp_old/taiho_ritsuryo',
          status: 'preparing',
        },
        {
          id: 'goseibai_shikimoku',
          shortName: '御成敗式目',
          path: '/law/jp_old/goseibai_shikimoku',
          status: 'preparing',
        },
        {
          id: 'buke_shohatto',
          shortName: '武家諸法度',
          path: '/law/jp_old/buke_shohatto',
          status: 'preparing',
        },
        {
          id: 'shourui_awaremi_no_rei',
          shortName: '生類憐みの令',
          path: '/law/jp_old/shourui_awaremi_no_rei',
          status: 'preparing',
        },
        {
          id: 'kinchu_kuge_shohatto',
          shortName: '禁中並公家諸法度',
          path: '/law/jp_old/kinchu_kuge_shohatto',
          status: 'preparing',
        },
        {
          id: 'gokajou_no_goseimon',
          shortName: '五箇条の御誓文',
          path: '/law/jp_old/gokajou_no_goseimon',
          status: 'available',
        },
        {
          id: 'meiji_kenpo',
          shortName: '大日本帝国憲法',
          path: '/law/jp_old/meiji_kenpo',
          status: 'preparing',
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
        },
        {
          id: 'us_constitution',
          shortName: 'アメリカ合衆国憲法',
          path: '/law/foreign/us_constitution',
          status: 'available',
        },
        {
          id: 'prc_constitution',
          shortName: '中華人民共和国憲法',
          path: '/law/foreign/prc_constitution',
          status: 'available',
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
        },
        {
          id: 'corpus_iuris_civilis',
          shortName: 'ローマ法大全',
          path: '/law/foreign_old/corpus_iuris_civilis',
          status: 'preparing',
        },
        {
          id: 'magna_carta',
          shortName: 'マグナ・カルタ',
          path: '/law/foreign_old/magna_carta',
          status: 'available',
        },
        {
          id: 'bill_of_rights',
          shortName: '権利章典',
          path: '/law/foreign_old/bill_of_rights',
          status: 'preparing',
        },
        {
          id: 'weimarer_verfassung',
          shortName: 'ワイマール憲法',
          path: '/law/foreign_old/weimarer_verfassung',
          status: 'preparing',
        },
        {
          id: 'napoleonic_code',
          shortName: 'ナポレオン法典',
          path: '/law/foreign_old/napoleonic_code',
          status: 'preparing',
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
        },
        {
          id: 'ramsar_convention',
          shortName: 'ラムサール条約',
          path: '/law/treaty/ramsar_convention',
          status: 'preparing',
        },
        {
          id: 'un_charter',
          shortName: '国連憲章',
          path: '/law/treaty/un_charter',
          status: 'available',
        },
        {
          id: 'npt',
          shortName: '核兵器不拡散条約',
          path: '/law/treaty/npt',
          status: 'available',
        },
        {
          id: 'outer_space_treaty',
          shortName: '宇宙条約',
          path: '/law/treaty/outer_space_treaty',
          status: 'preparing',
        },
        {
          id: 'universal_postal_convention',
          shortName: '万国郵便条約',
          path: '/law/treaty/universal_postal_convention',
          status: 'preparing',
        },
        {
          id: 'olympic_charter',
          shortName: 'オリンピック憲章',
          path: '/law/treaty/olympic_charter',
          status: 'preparing',
        },
        {
          id: 'prime_meridian_conference',
          shortName: '国際子午線会議',
          path: '/law/treaty/prime_meridian_conference',
          status: 'preparing',
        },
        {
          id: 'road_signs_convention',
          shortName: '道路標識条約',
          path: '/law/treaty/road_signs_convention',
          status: 'preparing',
        },
        {
          id: 'metre_convention',
          shortName: 'メートル条約',
          path: '/law/treaty/metre_convention',
          status: 'preparing',
        },
        {
          id: 'itu_constitution',
          shortName: 'ITU憲章',
          path: '/law/treaty/itu_constitution',
          status: 'preparing',
        },
        {
          id: 'unclos',
          shortName: '国連海洋法条約',
          path: '/law/treaty/unclos',
          status: 'preparing',
        },
        {
          id: 'chicago_convention',
          shortName: 'シカゴ条約',
          path: '/law/treaty/chicago_convention',
          status: 'preparing',
        },
        {
          id: 'extradition_treaty',
          shortName: '日米犯罪人引渡条約',
          path: '/law/treaty/extradition_treaty',
          status: 'preparing',
        },
        {
          id: 'who_constitution',
          shortName: 'WHO憲章',
          path: '/law/treaty/who_constitution',
          status: 'available',
        },
      ],
    },
  ],
};
