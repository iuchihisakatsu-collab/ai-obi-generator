// app/gallery/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  note?: string;
  likes?: number;
  itemType: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // ダブルタップ判定用のタイマー
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.items) {
          // KVにlikesがない古いデータのために初期値0を補完
          const formattedItems = data.items.map((it: any) => ({ ...it, likes: it.likes || 0 }));
          setItems(formattedItems);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, []);

  const handleShareX = (item: GalleryItem) => {
    const authorText = item.author && item.author !== '名無しさん' ? ` / by ${item.author}` : '';
    const shareText = `「${item.title}」${authorText}\n\n#妄想きもの図案帳\n`;
    const shareUrl = 'https://design.gofukuyasan.com/gallery';
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  // いいね処理（KVへ非同期で＋1を送信し、画面上は即座に反映）
  const handleLike = async (itemId: string) => {
    // 画面上のハート演出
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 1000);

    // 画面の数字を即座に増やす（サクサク感）
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, likes: (it.likes || 0) + 1 } : it));
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
    }

    // 裏側でAPIを叩く
    try {
      await fetch('/api/gallery/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId }),
      });
    } catch (e) {
      console.warn('Like API error:', e);
    }
  };

  // スマホ・PC両対応のダブルタップ（ダブルクリック）検知
  const handleImageInteraction = () => {
    if (!selectedItem) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleLike(selectedItem.id);
    }
    lastTapRef.current = now;
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-6 sm:px-12 border-b border-zinc-100">
        <a href="/" className="text-xs tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors uppercase">
          Back to Generator
        </a>
        <div className="text-xs tracking-[0.3em] font-light">GOFUKUYASAN</div>
        <div className="w-24"></div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 sm:px-12 pb-32">
        <div className="py-24 sm:py-32 text-center">
          <h1 className="text-3xl sm:text-5xl tracking-[0.2em] font-light text-zinc-900 mb-6">
            GALLERY
          </h1>
          <p className="text-xs text-zinc-400 tracking-widest uppercase">
            Archive of Imagined Designs
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-px h-12 bg-zinc-200 animate-pulse"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 text-zinc-400 text-xs tracking-widest uppercase">
            No works found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 animate-fade-in">
            {items.map((item, index) => (
              <div 
                key={item.id || index} 
                className="group cursor-pointer flex flex-col gap-4"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative aspect-square overflow-hidden bg-zinc-50">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105" 
                    loading="lazy" 
                  />
                  {/* ポートフォリオ風：ホバー時のいいね数表示 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 ease-out flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white text-lg font-light tracking-widest flex items-center gap-2">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" className="mb-0.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      {item.likes || 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-zinc-900 tracking-wider truncate">
                    {item.title}
                  </h3>
                  {item.author && item.author !== '名無しさん' && (
                    <p className="text-[10px] text-zinc-400 tracking-widest uppercase">
                      by {item.author}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 sm:p-12 transition-opacity duration-500 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-8 right-8 text-xs tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors uppercase z-20"
          >
            Close
          </button>

          <div 
            className="max-w-6xl w-full max-h-[90vh] overflow-y-auto sm:overflow-hidden flex flex-col lg:flex-row gap-8 lg:gap-24 items-start sm:items-center no-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            {/* 左側：画像（ダブルタップでいいね） */}
            <div 
              className="w-full lg:w-3/5 aspect-square bg-zinc-50 overflow-hidden shadow-2xl relative cursor-pointer select-none"
              onClick={handleImageInteraction}
            >
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                className="w-full h-full object-cover" 
              />
              
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" className="text-zinc-900"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span className="text-[10px] font-bold text-zinc-900 tracking-widest">{selectedItem.likes || 0}</span>
              </div>

              <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
                <span className="text-[10px] text-white/70 bg-black/30 px-3 py-1 rounded-full tracking-widest uppercase">
                  Double Tap to Like
                </span>
              </div>

              {/* いいねの波紋・ハートアニメーション */}
              {showHeartAnim && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-heart-burst">
                  <svg viewBox="0 0 24 24" width="120" height="120" fill="white" className="drop-shadow-2xl opacity-90"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </div>
              )}
            </div>

            {/* 右側：情報＆スレッド */}
            <div className="w-full lg:w-2/5 flex flex-col justify-start text-left h-full pb-8 sm:pb-0">
              <h2 className="text-2xl sm:text-4xl font-light tracking-wider text-zinc-900 mb-3 leading-snug">
                {selectedItem.title}
              </h2>
              {selectedItem.author && selectedItem.author !== '名無しさん' && (
                <p className="text-[11px] text-zinc-500 tracking-widest uppercase mb-8">
                  by {selectedItem.author}
                </p>
              )}

              {/* クリエイターのひとこと（Quoteスタイル） */}
              {selectedItem.note && (
                <div className="mb-10 relative">
                  <span className="absolute -top-4 -left-3 text-4xl text-zinc-200 font-serif leading-none select-none">"</span>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium relative z-10 pl-2 border-l-2 border-zinc-200">
                    {selectedItem.note}
                  </p>
                </div>
              )}

              {/* 将来のレビュー機能・コメント枠（準備中） */}
              
              <div className="flex flex-col gap-4 w-full sm:w-2/3 lg:w-full mt-auto">
                <button 
                  onClick={() => handleShareX(selectedItem)}
                  className="w-full py-4 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-colors duration-300"
                >
                  Share on X
                </button>
                
                <div className="mt-6 pt-6 border-t border-zinc-100 flex justify-between items-center">
                  <span className="text-[9px] text-zinc-400 tracking-widest">
                    ID: {selectedItem.id.substring(0, 8)}...
                  </span>
                  <a 
                    href={`mailto:info@gofukuyasan.com?subject=ギャラリー画像の削除依頼&body=以下の画像の削除をお願いします。%0D%0AID: ${selectedItem.id}%0D%0Aタイトル: ${selectedItem.title}`}
                    className="text-[9px] text-zinc-400 hover:text-zinc-900 tracking-wider transition-colors underline"
                  >
                    DELETE REQUEST
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ハートのエフェクト用CSSを追加（Tailwindの設定外なのでここに直接記述） */}
      <style jsx global>{`
        @keyframes heart-burst {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          40% { transform: scale(1); opacity: 0.9; }
          80% { transform: scale(1); opacity: 0.9; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-heart-burst {
          animation: heart-burst 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
