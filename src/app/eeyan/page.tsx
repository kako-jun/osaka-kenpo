'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getOrCreateUserId, setUserId, getUserId } from '@/lib/eeyan';
import { lawsMetadata } from '@/data/lawsMetadata';
import { ShareButton } from '@/app/components/ShareButton';

interface LikeEntry {
  category: string;
  lawName: string;
  article: string;
  createdAt: string;
}

function getLawDisplayName(category: string, lawName: string): string {
  for (const cat of lawsMetadata.categories) {
    if (cat.id === category) {
      const law = cat.laws.find((l) => l.id === lawName);
      if (law) return law.shortName;
    }
  }
  return lawName;
}

export default function EeyanPage() {
  const [likes, setLikes] = useState<LikeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserIdState] = useState('');
  const [syncInput, setSyncInput] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

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
    const uid = getUserId();
    setUserIdState(uid);
    if (uid) {
      fetchLikes(uid);
    } else {
      setIsLoading(false);
    }
  }, [fetchLikes]);

  // QRコード生成
  useEffect(() => {
    if (!userId) return;
    QRCode.toDataURL(userId, {
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

  const handleSync = () => {
    const trimmed = syncInput.trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      setSyncMessage('IDの形式がちゃうで。UUIDを入力してな。');
      return;
    }
    setUserId(trimmed);
    setUserIdState(trimmed);
    setSyncMessage('同期したで！ページを更新するわ...');
    setIsLoading(true);
    fetchLikes(trimmed);
    setSyncInput('');
    setTimeout(() => setSyncMessage(''), 3000);
  };

  const handleCreateId = () => {
    const uid = getOrCreateUserId();
    setUserIdState(uid);
  };

  return (
    <div className="relative">
      <div className="fixed top-20 right-4 z-10">
        <ShareButton />
      </div>

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
              {Object.values(grouped).map((group) => (
                <div key={`${group.category}/${group.lawName}`}>
                  <h3 className="font-bold text-[#E94E77] mb-2 flex items-center gap-1">
                    <span>■</span>
                    <Link
                      href={`/law/${group.category}/${group.lawName}`}
                      className="hover:underline"
                    >
                      {group.displayName}
                    </Link>
                  </h3>
                  <div className="space-y-1 pl-4 border-l-2 border-[#E94E77]/20">
                    {group.articles.map((like) => (
                      <Link
                        key={like.article}
                        href={`/law/${like.category}/${like.lawName}/${like.article}`}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-800">第{like.article}条</span>
                        <span className="text-xs text-gray-400">
                          {new Date(like.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
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
              <label className="text-sm text-gray-600 block mb-1">あんたのID</label>
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
                <p className="text-sm text-gray-600 mb-2">べつの端末のカメラで読み取ってな</p>
                <img src={qrDataUrl} alt="QRコード" className="w-40 h-40" />
              </div>
            )}

            <div className="border-t pt-4">
              <label className="text-sm text-gray-600 block mb-1">べつの端末のIDを入力</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={syncInput}
                  onChange={(e) => setSyncInput(e.target.value)}
                  placeholder="UUID を入力してな"
                  className="flex-1 text-sm border rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#E94E77]"
                />
                <button
                  onClick={handleSync}
                  className="px-3 py-2 text-sm bg-[#E94E77] text-white rounded hover:bg-[#d63d66] transition-colors whitespace-nowrap"
                >
                  同期
                </button>
              </div>
              {syncMessage && <p className="text-sm text-[#E94E77] mt-2">{syncMessage}</p>}
              <p className="text-xs text-gray-400 mt-2">
                同期すると、今の端末のええやんは入力したIDのものに置き換わるで
              </p>
            </div>
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
