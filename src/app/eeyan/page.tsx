'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getOrCreateEeyanUserId, setEeyanUserId, getEeyanUserId } from '@/lib/eeyan';
import { lawsMetadata } from '@/data/lawsMetadata';
import { formatArticleNumber, stripHtml, getExcerpt, getArticleSortKey } from '@/lib/utils';

interface LikeEntry {
  category: string;
  lawName: string;
  article: string;
  createdAt: string;
  title?: string;
  originalText?: string;
}

function getLawDisplayName(category: string, lawName: string): string {
  const targetPath = `/law/${category}/${lawName}`;
  for (const cat of lawsMetadata.categories) {
    const law = cat.laws.find((l) => l.path === targetPath);
    if (law) return law.shortName;
  }
  return lawName;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type SortMode = 'date' | 'article';

export default function EeyanPage() {
  const [likes, setLikes] = useState<LikeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserIdState] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [sortModes, setSortModes] = useState<Record<string, SortMode>>({});

  const fetchLikes = useCallback(async (uid: string) => {
    if (!uid) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/eeyan?userId=${uid}`);
      const data = (await res.json()) as { success: boolean; likes: LikeEntry[] };
      if (data.success) {
        setLikes(data.likes);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // URLパラメータによる自動同期
    const params = new URLSearchParams(window.location.search);
    const syncId = params.get('sync');
    if (syncId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(syncId)) {
      setEeyanUserId(syncId);
      setUserIdState(syncId);
      setSyncMessage('同期したで！');
      fetchLikes(syncId);
      // URLからパラメータを消す
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setSyncMessage(''), 3000);
      return;
    }

    const uid = getEeyanUserId();
    setUserIdState(uid);
    if (uid) {
      fetchLikes(uid);
    } else {
      setIsLoading(false);
    }
  }, [fetchLikes]);

  // QRコード生成（URLを埋め込む）
  useEffect(() => {
    if (!userId) return;
    const syncUrl = `${window.location.origin}/eeyan?sync=${userId}`;
    QRCode.toDataURL(syncUrl, {
      errorCorrectionLevel: 'L',
      margin: 2,
      width: 160,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [userId]);

  // 法律別にグループ化
  const grouped = likes.reduce(
    (acc, like) => {
      const key = `${like.category}/${like.lawName}`;
      if (!acc[key]) {
        acc[key] = {
          category: like.category,
          lawName: like.lawName,
          displayName: getLawDisplayName(like.category, like.lawName),
          articles: [],
        };
      }
      acc[key].articles.push(like);
      return acc;
    },
    {} as Record<
      string,
      {
        category: string;
        lawName: string;
        displayName: string;
        articles: LikeEntry[];
      }
    >
  );

  const handleCopy = async () => {
    if (!userId) return;
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateId = () => {
    const uid = getOrCreateEeyanUserId();
    setUserIdState(uid);
  };

  return (
    <div className="relative">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#E94E77] mt-8">わたしのええやん</h1>

      {/* ええやん一覧セクション */}
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 mb-6">
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">読み込み中...</p>
        ) : !userId ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              まだええやんしたことないみたいやな。
              <br />
              条文ページで「ええやん」ボタンを押してみてな！
            </p>
          </div>
        ) : likes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              まだええやんしたことないみたいやな。
              <br />
              条文ページで「ええやん」ボタンを押してみてな！
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">{likes.length}件のええやん</p>
            <div className="space-y-6">
              {Object.values(grouped).map((group) => {
                const groupKey = `${group.category}/${group.lawName}`;
                const sortMode = sortModes[groupKey] || 'date';
                const sortedArticles = [...group.articles].sort((a, b) =>
                  sortMode === 'article'
                    ? getArticleSortKey(a.article) - getArticleSortKey(b.article)
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                return (
                  <div key={groupKey}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[#E94E77]">
                        <Link
                          href={`/law/${group.category}/${group.lawName}`}
                          className="hover:underline"
                        >
                          {group.displayName}
                        </Link>
                      </h3>
                      <button
                        onClick={() =>
                          setSortModes((prev) => ({
                            ...prev,
                            [groupKey]: prev[groupKey] === 'article' ? 'date' : 'article',
                          }))
                        }
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {sortMode === 'date' ? '日時順' : '条文順'}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {sortedArticles.map((like) => {
                        const hasTitle = like.title && like.title.trim() !== '';
                        const excerpt =
                          !hasTitle && like.originalText ? getExcerpt(like.originalText, 40) : '';
                        return (
                          <Link
                            key={like.article}
                            href={`/law/${like.category}/${like.lawName}/${like.article}`}
                            className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-blue-600 font-medium shrink-0">
                                {formatArticleNumber(like.article)}
                              </span>
                              {hasTitle ? (
                                <span
                                  className="text-gray-600 text-sm truncate"
                                  dangerouslySetInnerHTML={{ __html: like.title! }}
                                />
                              ) : excerpt ? (
                                <span className="text-gray-400 text-sm truncate italic">
                                  {excerpt}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                              {formatDate(like.createdAt)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 端末間同期セクション */}
      <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6 mb-16">
        <h2 className="text-lg font-bold text-[#E94E77] mb-4">べつの端末でも使いたいとき</h2>

        {userId ? (
          <>
            <div className="mb-4">
              <label className="text-sm text-gray-600 block mb-1">きみのID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-100 p-2 rounded break-all">{userId}</code>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-sm bg-[#E94E77] text-white rounded hover:bg-[#d63d66] transition-colors whitespace-nowrap"
                >
                  {copied ? 'コピーしたで！' : 'コピー'}
                </button>
              </div>
            </div>

            {qrDataUrl && (
              <div className="mb-4 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-2">
                  べつの端末のカメラでこのQRコードを読み取るだけで同期できるで
                </p>
                <img src={qrDataUrl} alt="QRコード" className="w-40 h-40" />
              </div>
            )}

            {syncMessage && (
              <p className="text-sm text-[#E94E77] mt-2 text-center">{syncMessage}</p>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">
              ええやんボタンを押すとIDが自動で作られるで。
              <br />
              先にIDだけ作りたい場合は↓のボタンを押してな。
            </p>
            <button
              onClick={handleCreateId}
              className="px-4 py-2 text-sm bg-[#E94E77] text-white rounded-full hover:bg-[#d63d66] transition-colors"
            >
              IDを作る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
