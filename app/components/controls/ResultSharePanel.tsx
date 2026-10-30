// components/controls/ResultSharePanel.tsx
'use client';

import { MouseEvent } from 'react';
import { PlatformType } from '../../lib/orders';

interface ResultSharePanelProps {
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: (val: string) => void;
  loading: boolean;
  platform: PlatformType;
  designFee: number;
  setDesignFee: (fee: number) => void;
  primaryMotif: string;
  handleDownloadOriginal: () => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function ResultSharePanel({
  imageUrl,
  patternTitle,
  setPatternTitle,
  loading,
  platform,
  designFee,
  setDesignFee,
  primaryMotif,
  handleDownloadOriginal,
  handleOrderClick,
}: ResultSharePanelProps) {
  const shareText = `【妄想小紋図案帖】でオリジナルの図案をデザインしました！\n作品名：${patternTitle || '無題'}\n#着物 #帯 #テキスタイルデザイン #AI画像生成`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareToX = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  const shareToThreads = () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`, '_blank');
  const shareToInstagram = () => {
    navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
    alert('Instagram用のテキストをクリップボードにコピーしました！投稿画面に貼り付けてお使いください。');
    window.open('https://www.instagram.com/', '_blank');
  };
  const shareToPinterest = () => window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`, '_blank');
  const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');

  const makeshopSearchUrl = `https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(primaryMotif)}`;

  return (
    <div className="pt-8 mt-8 border-t-2 border-zinc-950 space-y-6 relative z-10 animate-fade-in bg-zinc-50 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 pb-8">
      <h3 className="text-center font-bold text-sm tracking-widest text-zinc-800 pt-6">あなただけの作品が完成しました</h3>
      
      {/* 作品名入力 */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-xs font-bold text-zinc-700 tracking-wider">
          作品名 <span className="font-normal text-[10px] text-zinc-400">（お好みの名前に変更できます）</span>
        </label>
        <input
          type="text"
          className="w-full border-b-2 border-zinc-300 p-3 bg-transparent text-sm font-bold focus:outline-none focus:border-zinc-950 transition-colors"
          placeholder="例：深緋の小紋"
          value={patternTitle}
          onChange={(e) => setPatternTitle(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Shopify査察モード専用：クリエイター還元フィー設定 */}
      {platform === 'shopify' && (
        <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-950 tracking-wider">【Shopify連携】クリエイター還元フィー設定</span>
            <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">補助事業査察対応</span>
          </div>
          <p className="text-[10px] text-amber-800 leading-relaxed">製品1点販売ごとにクリエイターへ還元されるデザイン収益フィーを設定します。</p>
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[0, 1000, 2000, 3000].map((fee) => (
              <button
                key={fee}
                type="button"
                onClick={() => setDesignFee(fee)}
                className={`py-1.5 text-xs font-black border rounded transition-all ${
                  designFee === fee ? 'bg-amber-900 text-white border-amber-900' : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                ¥{fee.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <button type="button" onClick={handleDownloadOriginal} className="w-full py-3 text-center border border-zinc-300 bg-white hover:border-zinc-950 hover:bg-zinc-100 text-zinc-800 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          この作品の画像データを手元に残す
        </button>

        {/* SNSシェア */}
        <div className="pt-3 pb-1 border-t border-zinc-200">
          <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-2 text-center">この作品をSNSでお披露目する</p>
          <div className="grid grid-cols-5 gap-1.5">
            <button type="button" onClick={shareToX} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white transition-all shadow-sm">
              <span className="text-[10px] font-black">X</span>
            </button>
            <button type="button" onClick={shareToThreads} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white transition-all shadow-sm">
              <span className="text-[10px] font-black">Threads</span>
            </button>
            <button type="button" onClick={shareToInstagram} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white transition-all shadow-sm">
              <span className="text-[10px] font-black">Insta</span>
            </button>
            <button type="button" onClick={shareToPinterest} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white transition-all shadow-sm">
              <span className="text-[10px] font-black">Pin</span>
            </button>
            <button type="button" onClick={shareToFacebook} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white transition-all shadow-sm">
              <span className="text-[10px] font-black">FB</span>
            </button>
          </div>
        </div>

        {/* 注文・出品ボタン */}
        {platform === 'shopify' ? (
          <a href="#" onClick={handleOrderClick} className="block w-full py-4 mt-2 text-center bg-amber-900 text-white text-[15px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] border-2 border-amber-900 rounded-sm">
            Shopifyに下書き出品・登録する<br/>
            <span className="text-[10px] font-medium tracking-wider opacity-90 mt-1 block">（7種の素材展開・クリエイター還元付き下書きを作成）</span>
          </a>
        ) : (
          <a href="#" onClick={handleOrderClick} className="block w-full py-4 mt-2 text-center bg-zinc-950 text-white text-[15px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] border-2 border-zinc-950 rounded-sm">
            妄想を現実に<br/>
            <span className="text-[10px] font-medium tracking-wider opacity-90 mt-1 block">（この作品を現実の着物・帯として仕立てる）</span>
          </a>
        )}

        {primaryMotif && platform === 'makeshop' && (
          <div className="mt-6 p-4 bg-zinc-100 border border-zinc-200 shadow-inner rounded-sm text-center animate-fade-in">
            <p className="text-[11px] font-bold text-zinc-700 mb-2 leading-relaxed">
              <span className="text-[9px] text-zinc-500 block mb-1">【 寄り道のご案内 】</span>
              お客様、もしかして『<span className="text-zinc-950 font-black text-sm">{primaryMotif}</span>』に<br/>目がありませんね？
            </p>
            <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed px-2">
              妄想図案もいいですが……実はゴフクヤサンにも、<br/>自慢の『{primaryMotif}』アイテムがたくさんスタンバイしています。
            </p>
            <a href={makeshopSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full py-3 bg-white border border-zinc-300 text-zinc-800 text-[10px] font-bold tracking-widest hover:bg-zinc-950 hover:text-white transition-colors shadow-sm rounded-sm">
              ゴフクヤサンの「{primaryMotif}」コレクションを覗く（無料） →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
