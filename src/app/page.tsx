import Link from 'next/link';

export default function Home() {
  const lawCategories = [
    {
      title: 'ろっぽう',
      laws: [
        { name: '日本国憲法', path: '/law/jp/constitution', status: 'available', year: 1946 },
        { name: '民法', path: '/law/jp/minpou', status: 'available', year: 1896 },
        { name: '商法', path: '/law/jp/shouhou', status: 'available', year: 1890 },
        { name: '刑法', path: '/law/jp/keihou', status: 'available', year: 1907 },
        { name: '民事訴訟法', path: '/law/jp/minji_soshou_hou', status: 'available', year: 1996 },
        { name: '刑事訴訟法', path: '/law/jp/keiji_soshou_hou', status: 'available', year: 1948 },
      ]
    },
    {
      title: 'むかしの法律',
      laws: [
        { name: '十七条の憲法', path: '/law/jp_old/jushichijo_kenpo', status: 'available', year: 604 },
        { name: '大宝律令', path: '/law/jp_old/taiho_ritsuryo', status: 'available', year: 701 },
        { name: '御成敗式目', path: '/law/jp_old/goseibai_shikimoku', status: 'available', year: 1232 },
        { name: '武家諸法度', path: '/law/jp_old/buke_shohatto', status: 'available', year: 1615 },
        { name: '禁中並公家諸法度', path: '/law/jp_old/kinchu_kuge_shohatto', status: 'available', year: 1613 },
        { name: '大日本帝国憲法', path: '/law/jp_old/meiji_kenpo', status: 'available', year: 1889 },
      ]
    },
    {
      title: 'がいこくの法律',
      laws: [
        { name: 'ドイツ基本法', path: '/law/foreign/german_basic_law', status: 'available', year: 1949 },
        { name: 'アメリカ合衆国憲法', path: '/law/foreign/us_constitution', status: 'available', year: 1787 },
        { name: '中華人民共和国憲法', path: '/law/foreign/prc_constitution', status: 'available', year: 1982 },
      ]
    },
    {
      title: 'がいこくのむかしの法律',
      laws: [
        { name: 'ハンムラビ法典', path: '/law/foreign_old/hammurabi_code', status: 'available', year: -1754 },
        { name: 'マグナ・カルタ', path: '/law/foreign_old/magna_carta', status: 'available', year: 1215 },
        { name: 'ナポレオン法典', path: '/law/foreign_old/napoleonic_code', status: 'available', year: 1804 },
      ]
    },
    {
      title: '国際条約',
      laws: [
        { name: '南極条約', path: '/law/treaty/antarctic_treaty', status: 'available', year: 1959 },
        { name: 'ラムサール条約', path: '/law/treaty/ramsar_convention', status: 'available', year: 1971 },
        { name: '国際連合憲章', path: '/law/treaty/un_charter', status: 'available', year: 1945 },
        { name: '核拡散防止条約', path: '/law/treaty/npt', status: 'available', year: 1968 },
        { name: '宇宙条約', path: '/law/treaty/outer_space_treaty', status: 'available', year: 1967 },
        { name: '万国郵便条約', path: '/law/treaty/universal_postal_convention', status: 'available', year: 1874 },
        { name: 'オリンピック憲章', path: '/law/treaty/olympic_charter', status: 'available', year: 1894 },
        { name: '犯罪人引渡し条約', path: '/law/treaty/extradition_treaty', status: 'available', year: 1900 },
      ]
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">知りたい法律を選んでや</h1>
      <div className="space-y-8">
        {lawCategories.map((category) => (
          <div key={category.title}>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#E94E77] pb-2">{category.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.laws.sort((a, b) => a.year - b.year).map((law) => (
                <Link key={law.name} href={law.path} passHref className="block">
                  <div
                    className={`h-full flex flex-col justify-center p-6 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] text-center text-white font-bold text-xl ${
                      law.status === 'available'
                        ? 'bg-[#E94E77] hover:bg-opacity-80 cursor-pointer'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <p>{law.name}</p>
                    {law.year && <p className="text-sm font-normal text-[#FFB6C1]">{law.year}年</p>}
                    {law.status === 'preparing' && <span className="text-sm block mt-1 font-normal">（準備中）</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
