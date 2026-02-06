// laws_metadata.yaml から変換した静的データ
export interface LawEntry {
  id: string;
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
      laws: [{ id: 'ai_suishin_hou', path: '/law/jp/ai_suishin_hou', status: 'available' }],
    },
    {
      id: 'roppou',
      title: 'ろっぽう（＋会社法）',
      icon: '⚖️',
      laws: [
        { id: 'constitution', path: '/law/jp/constitution', status: 'available' },
        { id: 'minpou', path: '/law/jp/minpou', status: 'available' },
        { id: 'shouhou', path: '/law/jp/shouhou', status: 'available' },
        { id: 'kaisya_hou', path: '/law/jp/kaisya_hou', status: 'available' },
        { id: 'keihou', path: '/law/jp/keihou', status: 'available' },
        { id: 'minji_soshou_hou', path: '/law/jp/minji_soshou_hou', status: 'available' },
        { id: 'keiji_soshou_hou', path: '/law/jp/keiji_soshou_hou', status: 'available' },
      ],
    },
    {
      id: 'mukashi',
      title: 'むかしの法律',
      icon: '📜',
      laws: [
        { id: 'jushichijo_kenpo', path: '/law/jp_old/jushichijo_kenpo', status: 'available' },
        {
          id: 'konden_einen_shizai_hou',
          path: '/law/jp_old/konden_einen_shizai_hou',
          status: 'preparing',
        },
        { id: 'taiho_ritsuryo', path: '/law/jp_old/taiho_ritsuryo', status: 'preparing' },
        { id: 'goseibai_shikimoku', path: '/law/jp_old/goseibai_shikimoku', status: 'preparing' },
        { id: 'buke_shohatto', path: '/law/jp_old/buke_shohatto', status: 'preparing' },
        {
          id: 'shourui_awaremi_no_rei',
          path: '/law/jp_old/shourui_awaremi_no_rei',
          status: 'preparing',
        },
        {
          id: 'kinchu_kuge_shohatto',
          path: '/law/jp_old/kinchu_kuge_shohatto',
          status: 'preparing',
        },
        { id: 'gokajou_no_goseimon', path: '/law/jp_old/gokajou_no_goseimon', status: 'available' },
        { id: 'meiji_kenpo', path: '/law/jp_old/meiji_kenpo', status: 'preparing' },
      ],
    },
    {
      id: 'gaikoku',
      title: 'がいこくの法律',
      icon: '🌍',
      laws: [
        { id: 'german_basic_law', path: '/law/foreign/german_basic_law', status: 'available' },
        { id: 'us_constitution', path: '/law/foreign/us_constitution', status: 'available' },
        { id: 'prc_constitution', path: '/law/foreign/prc_constitution', status: 'available' },
      ],
    },
    {
      id: 'gaikoku_mukashi',
      title: 'がいこくのむかしの法律',
      icon: '🏛️',
      laws: [
        { id: 'hammurabi_code', path: '/law/foreign_old/hammurabi_code', status: 'preparing' },
        {
          id: 'corpus_iuris_civilis',
          path: '/law/roman/corpus_iuris_civilis',
          status: 'preparing',
        },
        { id: 'magna_carta', path: '/law/foreign_old/magna_carta', status: 'available' },
        { id: 'bill_of_rights', path: '/law/uk/bill_of_rights', status: 'preparing' },
        { id: 'weimarer_verfassung', path: '/law/de/weimarer_verfassung', status: 'preparing' },
        { id: 'napoleonic_code', path: '/law/foreign_old/napoleonic_code', status: 'preparing' },
      ],
    },
    {
      id: 'treaty',
      title: '国際じょうやく',
      icon: '🤝',
      laws: [
        { id: 'antarctic_treaty', path: '/law/treaty/antarctic_treaty', status: 'available' },
        { id: 'ramsar_convention', path: '/law/treaty/ramsar_convention', status: 'preparing' },
        { id: 'un_charter', path: '/law/treaty/un_charter', status: 'available' },
        { id: 'npt', path: '/law/treaty/npt', status: 'available' },
        { id: 'outer_space_treaty', path: '/law/treaty/outer_space_treaty', status: 'preparing' },
        {
          id: 'universal_postal_convention',
          path: '/law/treaty/universal_postal_convention',
          status: 'preparing',
        },
        { id: 'olympic_charter', path: '/law/treaty/olympic_charter', status: 'preparing' },
        {
          id: 'prime_meridian_conference',
          path: '/law/treaty/prime_meridian_conference',
          status: 'preparing',
        },
        {
          id: 'road_signs_convention',
          path: '/law/treaty/road_signs_convention',
          status: 'preparing',
        },
        { id: 'metre_convention', path: '/law/treaty/metre_convention', status: 'preparing' },
        { id: 'itu_constitution', path: '/law/treaty/itu_constitution', status: 'preparing' },
        { id: 'unclos', path: '/law/treaty/unclos', status: 'preparing' },
        { id: 'chicago_convention', path: '/law/treaty/chicago_convention', status: 'preparing' },
        { id: 'extradition_treaty', path: '/law/treaty/extradition_treaty', status: 'preparing' },
        { id: 'who_constitution', path: '/law/treaty/who_constitution', status: 'available' },
      ],
    },
  ],
};
