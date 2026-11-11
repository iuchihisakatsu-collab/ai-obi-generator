// app/gallery/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  itemType: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // ページを開いた時に、Vercel KV（データベース）から画像一覧を取得
  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.items) {
          setItems(data.items);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('ギャラリー取得エラー:', err);
        setLoading(false);
      });
  }, []);

  // X（Twitter）へのシェア機能
  const handleShareX = (item: GalleryItem) => {
    const authorText = item.author && item.author !== '名無しさん' ? `\n👤 by ${item.author}` : '';
    const shareText = `🎨 『${item.title}』${authorText}\n\nあなたもAIでオリジナルの着物図案を作ってみませんか？👇\n#妄想きもの図案帳 #ゴフクヤサン`;
    const shareUrl = 'https://design.gofukuyasan.com/gallery'; // シェア時の飛び先はギャラリー
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 font-sans pb-12">
      
      {/* 🌟 ヘッダー */}
      <div className="w-full bg-zinc-900 text-white p-4 text-center shadow-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">
        <a href="/" className="text-zinc-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1">
          <span>←</span> <span className="hidden sm:inline">作成画面に戻る</span>
        </a>
        <h1 className="text-sm sm:text-base font-black tracking-widest">みんなの図案ギャラリー</h1>
        <div className="w-20"></div> {/* 中央揃え用のスペーサー */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 mb-3 tracking-wider">
            みんなの妄想が、ここに。
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium">
            AIを使って生み出された、世界に一つだけの着物・帯図案コレクション。
          </p>
        </div>

        {/* 🌟 ローディング表示 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 text-zinc-500 text-sm font-bold bg-white border border-zinc-200 rounded-sm shadow-sm">
            <span className="text-3xl block mb-4">🖼️</span>
            まだ作品がありません。最初の図案を飾ってみませんか？
          </div>
        ) : (
          /* 🌟 グリッドレイアウト（画像を隙間なく並べる） */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in">
            {items.map((item, index) => (
              <div 
                key={item.id || index} 
                className="relative group cursor-pointer aspect-square bg-zinc-100 rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-all"
                onClick={() => setSelectedItem(item)}
              >
                {/* 40cm角の元画像をトリミングして配置 */}
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  loading="lazy" 
                />
                
                {/* マウスホバー時のキャプション演出（スマホではタップで拡大表示へ） */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4 text-center">
                  <p className="text-sm font-black mb-1.5 line-clamp-2 leading-snug tracking-wider">
                    『{item.title}』
                  </p>
                  {item.author && item.author !== '名無しさん' && (
                    <p className="text-[10px] text-zinc-300 font-medium">by {item.author}</p>
                  )}
                  <span className="mt-4 px-3 py-1.5 bg-white text-zinc-900 text-[10px] font-bold rounded-full shadow-lg">
                    拡大して見る 🔍
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🌟 拡大表示＆シェア用モーダル */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="max-w-xl w-full bg-white rounded-sm overflow-hidden shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>

            {/* 大画像 */}
            <div className="relative aspect-square bg-zinc-100">
              <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
            </div>

            {/* 作品情報とシェアボタン */}
            <div className="p-5 sm:p-7 text-center space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 mb-1.5 tracking-widest">
                  『{selectedItem.title}』
                </h3>
                {selectedItem.author && selectedItem.author !== '名無しさん' && (
                  <p className="text-xs text-zinc-500 font-bold">👤 {selectedItem.author}</p>
                )}
              </div>
              
              <div className="pt-4 border-t border-zinc-100 flex flex-col items-center justify-center gap-2">
                <button 
                  onClick={() => handleShareX(selectedItem)}
                  className="w-full sm:w-auto px-8 py-3 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  この作品を 𝕏（Twitter）で自慢する
                </button>
                <p className="text-[10px] text-zinc-400 mt-1">
                  ※URLとハッシュタグが自動でセットされます
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
