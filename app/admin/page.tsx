// app/admin/page.tsx
'use client';
import { useEffect, useState } from 'react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  itemType?: string;
  likes?: number;
  createdAt?: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [count, setCount] = useState(30);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGalleryItems = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.error('Gallery fetch error:', err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setCodes([]);
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, count })
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setCodes(data.codes);
      }
    } catch (err) {
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGalleryItem = async (item: GalleryItem) => {
    if (!password.trim()) {
      alert('先に上の「合言葉（パスワード）」欄にパスワードを入力してください。');
      return;
    }

    const ok = window.confirm(`「${item.title || '無題'}」をギャラリーから完全に削除しますか？`);
    if (!ok) return;

    setDeletingId(item.id);
    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          id: item.id,
          imageUrl: item.imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || '削除に失敗しました');
        return;
      }
      setGalleryItems((prev) => prev.filter((it) => it.id !== item.id));
    } catch (err) {
      alert('通信エラーが発生しました');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
          <h1 className="text-2xl font-black text-zinc-900 mb-6">プレミアムコード発行所（管理者専用）</h1>
          
          <div className="space-y-4 mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">合言葉（パスワード）</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="パスワードを入力（ギャラリー削除にも共通で使用します）"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-1">一度に発行する枚数（MakeShopの在庫追加分）</label>
              <input 
                type="number" 
                value={count} 
                onChange={e => setCount(Number(e.target.value))} 
                className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full mt-4 bg-zinc-900 text-white px-4 py-3 font-bold rounded hover:bg-zinc-800 transition-colors"
            >
              {loading ? 'データベースに登録中...' : `${count}枚のプレミアムコード（50回用）を発行する`}
            </button>
          </div>

          {codes.length > 0 && (
            <div className="animate-fade-in">
              <h2 className="text-lg font-bold text-indigo-700 mb-2">発行完了！以下のコードをMakeShopの在庫にコピペしてください</h2>
              <p className="text-xs text-zinc-500 mb-2">※すでにデータベース（Vercel KV）には「50回使えるコード」として登録済みです。</p>
              <textarea
                readOnly
                value={codes.join('\n')}
                className="w-full h-64 p-4 border border-indigo-300 bg-indigo-50 text-indigo-900 font-mono rounded"
              />
            </div>
          )}
        </div>

        {/* ギャラリー掲載作品の管理・削除 */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-black text-zinc-900">ギャラリー掲載作品の管理（{galleryItems.length}件）</h2>
              <p className="text-xs text-zinc-500 mt-1">
                上の「合言葉（パスワード）」を入力した状態で「削除」を押すと、ギャラリーから即座に削除できます。
              </p>
            </div>
            <button
              type="button"
              onClick={fetchGalleryItems}
              disabled={galleryLoading}
              className="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 rounded transition-colors"
            >
              {galleryLoading ? '読み込み中...' : '一覧を再読み込み'}
            </button>
          </div>

          {galleryLoading ? (
            <div className="py-12 text-center text-xs text-zinc-400">読み込み中...</div>
          ) : galleryItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 rounded">
              現在ギャラリーに掲載されている作品はありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="border border-zinc-200 rounded overflow-hidden bg-zinc-50 flex flex-col">
                  <div className="aspect-square bg-white overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 truncate" title={item.title}>
                        {item.title || '無題'}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        作者: {item.author || '名無しさん'}
                      </p>
                      {item.createdAt && (
                        <p className="text-[9.5px] text-zinc-400 font-mono mt-0.5">
                          {new Date(item.createdAt).toLocaleString('ja-JP')}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item)}
                      disabled={deletingId === item.id}
                      className="w-full py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-300 text-white text-xs font-bold rounded transition-colors"
                    >
                      {deletingId === item.id ? '削除中...' : '削除する'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
