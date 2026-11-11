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
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700 ease-out"></div>
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
            className="absolute top-8 right-8 text-xs tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors uppercase z-10"
          >
            Close
          </button>

          <div 
            className="max-w-6xl w-full flex flex-col lg:flex-row gap-12 lg:gap-24 items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full lg:w-3/5 aspect-square bg-zinc-50 overflow-hidden shadow-2xl">
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title} 
                className="w-full h-full object-cover" 
              />
            </div>

            <div className="w-full lg:w-2/5 flex flex-col justify-center text-left">
              <h2 className="text-2xl sm:text-4xl font-light tracking-wider text-zinc-900 mb-4 leading-snug">
                {selectedItem.title}
              </h2>
              {selectedItem.author && selectedItem.author !== '名無しさん' && (
                <p className="text-xs text-zinc-400 tracking-widest uppercase mb-12">
                  by {selectedItem.author}
                </p>
              )}
              
              <div className="flex flex-col gap-4 w-full sm:w-2/3 lg:w-full">
                <button 
                  onClick={() => handleShareX(selectedItem)}
                  className="w-full py-4 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white text-xs tracking-widest uppercase transition-colors duration-300"
                >
                  Share on X
                </button>
                
                <div className="mt-8 pt-8 border-t border-zinc-200">
                  <a 
                    href={`mailto:info@gofukuyasan.com?subject=ギャラリー画像の削除依頼&body=以下の画像の削除をお願いします。%0D%0AID: ${selectedItem.id}%0D%0Aタイトル: ${selectedItem.title}`}
                    className="text-[10px] text-zinc-400 hover:text-zinc-900 tracking-wider transition-colors underline"
                  >
                    投稿の削除を依頼する
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
