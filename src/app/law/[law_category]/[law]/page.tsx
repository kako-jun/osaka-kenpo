'use client'

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ArticleSummary {
  article: string;
  title: string;
}

const LawArticlesPage = () => {
  const params = useParams<{ law_category: string; law: string }>();
  const { law_category, law } = params;
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const lawName = lawNameMapping[law] || '不明な法律';

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/${law_category}/${law}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ArticleSummary[] = await response.json();
        setArticles(data);
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch articles:", e);
      } finally {
        setLoading(false);
      }
    };

    if (law_category && law) {
      fetchArticles();
    }
  }, [law_category, law]);

  if (loading) {
    return (
      <div className="text-center text-primary text-xl">読み込み中...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-xl">
        エラーが発生しました: {error}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center text-gray-600 text-xl">
        条文が見つかりませんでした。
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">{lawName}</h1>
      <div className="space-y-3">
        {articles.map(article => (
          <Link key={article.article} href={`/law/${law_category}/${law}/${article.article}`}>
            <div className="block p-4 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer">
              <span className="font-bold text-[#E94E77]">{`第${article.article}条`}</span>
              <span className="ml-4 text-gray-800"> {article.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LawArticlesPage;