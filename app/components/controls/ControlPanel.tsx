// components/controls/ControlPanel.tsx
'use client';

import { MouseEvent } from 'react';
import { TRADITIONAL_COLORS, TAG_CATEGORIES, CategoryItem, LOADING_STEPS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: (mode: 'ai' | 'geometric') => void;
  motif: string;
  setMotif: (val: string) => void;
  showTags: boolean;
  setShowTags: (val: boolean) => void;
  handleTagClick: (item: CategoryItem) => void;
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: (val: typeof TRADITIONAL_COLORS | ((prev: typeof TRADITIONAL_COLORS) => typeof TRADITIONAL_COLORS)) => void;
  handleColorToggle: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: (val: boolean) => void;
  density: string;
  setDensity: (val: string) => void;
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: (val: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir: 'vertical' | 'horizontal' | 'diagonal';
  setStripeDir: (val: 'vertical' | 'horizontal' | 'diagonal') => void;
  dotLayout: 'staggered' | 'grid';
  setDotLayout: (val: 'staggered' | 'grid') => void;
  dotRadius: number;
  setDotRadius: (val: number) => void;
  gapWidth: number;
  setGapWidth: (val: number) => void;
  lineWidth: number;
  setLineWidth: (val: number) => void;
  geoBgColor: string;
  setGeoBgColor: (val: string) => void;
  geoPatternColor: string;
  setGeoPatternColor: (val: string) => void;
  showGeoPaletteFor: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor: (val: 'bg' | 'pattern' | null) => void;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  obiLiningColor: string;
  setObiLiningColor: (val: string) => void;
  showLiningPalette: boolean;
  setShowLiningPalette: (val: boolean) => void;
  kimonoObiColor: string;
  setKimonoObiColor: (val: string) => void;
  customObiUrl: string | null;
  setCustomObiUrl: (val: string | null) => void;
  showObiColorPalette: boolean;
  setShowObiColorPalette: (val: boolean) => void;
  kimonoHaneriColor: string;
  setKimonoHaneriColor: (val: string) => void;
  showHaneriColorPalette: boolean;
  setShowHaneriColorPalette: (val: boolean) => void;
  kimonoObiageColor: string;
  setKimonoObiageColor: (val: string) => void;
  showObiageColorPalette: boolean;
  setShowObiageColorPalette: (val: boolean) => void;
  handleCustomObiUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  errorMsg: string;
  loading: boolean;
  remainingCount: number | null;
  loadingStep: number;
  handleGenerate: () => void;
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: (val: string) => void;
  setIsTitleManual?: (val: boolean) => void;
  handleDownloadOriginal: () => void;
  handleNativeShare: () => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function ControlPanel({
  creationMode, setCreationMode, motif, setMotif, showTags, setShowTags, handleTagClick,
  selectedColors, setSelectedColors, handleColorToggle, showColorPalette, setShowColorPalette,
  density, setDensity, geoPatternType, setGeoPatternType, stripeDir, setStripeDir,
  dotLayout, setDotLayout, dotRadius, setDotRadius, gapWidth, setGapWidth, lineWidth, setLineWidth,
  geoBgColor, setGeoBgColor, geoPatternColor, setGeoPatternColor, showGeoPaletteFor, setShowGeoPaletteFor,
  itemType, obiLiningColor, setObiLiningColor, showLiningPalette, setShowLiningPalette,
  kimonoObiColor, setKimonoObiColor, customObiUrl, setCustomObiUrl, showObiColorPalette, setShowObiColorPalette,
  kimonoHaneriColor, setKimonoHaneriColor, showHaneriColorPalette, setShowHaneriColorPalette,
  kimonoObiageColor, setKimonoObiageColor, showObiageColorPalette, setShowObiageColorPalette,
  handleCustomObiUpload, agreed, setAgreed, errorMsg, loading, remainingCount, loadingStep, handleGenerate,
  imageUrl, patternTitle, setPatternTitle, setIsTitleManual, handleDownloadOriginal, handleOrderClick
}: ControlPanelProps) {

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map((c) => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = `「妄想小紋図案帖」で柄のアイデアを試してみました。\n作品名：『${finalTitle}』\n配色：${colorSummary}\n#妄想きもの図案帳 #ゴフクヤサン`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://store.gofukuyasan.com/';
  const mediaUrl = imageUrl || '';

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const shareToThreads = () => {
    const textWithUrl = `${shareText}\n${currentUrl}`;
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(textWithUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  const shareToPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=750,height=600');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const shareToInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('作品名とテキストをコピーしました！\nInstagramの投稿作成画面に貼り付けてお使いください。');
    } catch {}
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10 relative">
      <div className="flex bg-zinc-50 border border-zinc-200 p-1 mb-6 shadow-sm">
        <button type="button" onClick={() => setCreationMode('geometric')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
          格子・水玉製作所
        </button>
        <button type="button" onClick={() => setCreationMode('ai')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
          AI妄想モード
        </button>
      </div>

      <div className="space-y-6">
        {creationMode === 'ai' ? (
          <>
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">01. 図案のイメージ・プロンプト</label>
                {motif && <button onClick={() => setMotif('')} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 tracking-widest uppercase transition-colors">Clear</button>}
              </div>
              <textarea className="w-full border border-zinc-300 p-3 sm:p-4 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium shadow-sm" rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} disabled={loading} />
              <div className="mt-2 text-right">
                <button type="button" onClick={() => setShowTags(!showTags)} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors py-1">
                  <span>{showTags ? 'ヒントを閉じる' : '図案のヒント・キーワードを探す'}</span>
                  <span className="text-[9px] transform transition-transform duration-200">{showTags ? '▲' : '▼'}</span>
                </button>
              </div>
              {showTags && (
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 animate-fade-in shadow-inner relative z-20">
                  {TAG_CATEGORIES.map((cat) => (
                    <div key={cat.title}>
                      <p className="text-[10px] font-bold text-zinc-400 tracking-wider mb-1">{cat.title}</p>
                      <div className="flex flex-wrap gap-1">
                        {cat.items.map((item) => ( 
                          <button key={item.label} type="button" onClick={() => handleTagClick(item)} className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-medium text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                            {item.label}
                          </button> 
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-100 relative">
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">02. 配色・地色</label>
                <button type="button" onClick={() => setShowColorPalette(!showColorPalette)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
                  <span>{showColorPalette ? '閉じる' : '色見本から選ぶ (102色)'}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                {selectedColors.length === 0 ? ( 
                  <span className="text-xs text-zinc-400 italic">指定なし（AIにおまかせ）</span> 
                ) : (
                  <>
                    {selectedColors.map((col) => (
                      <span key={col.name} onClick={() => handleColorToggle(col)} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border cursor-pointer shadow-sm relative z-10" style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}>
                        {col.name.split(' ')[0]}<span className="text-[9px] opacity-70">✕</span>
                      </span>
                    ))}
                    <button type="button" onClick={() => setSelectedColors([])} className="text-[10px] text-zinc-400 hover:text-zinc-700 underline ml-1 relative z-10">リセット</button>
                  </>
                )}
              </div>
              {showColorPalette && (
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => {
                      const isSelected = selectedColors.some((c) => c.name === col.name);
                      return (
                        <button key={col.name} type="button" onClick={() => handleColorToggle(col)} className={`relative min-h-[44px] p-1.5 flex flex-col justify-end text-left transition-all ${isSelected ? 'ring-2 ring-zinc-950 scale-95 font-black' : 'border border-zinc-200/50 shadow-sm hover:scale-[1.02]'}`} style={{ backgroundColor: col.hex }}>
                          <span className={`text-[9px] font-bold truncate leading-tight flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {col.name.split(' ')[0]}
                            {isSelected && <span>✓</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">03. 柄の配置</label>
              <div className="flex flex-col gap-1.5">
                {['四方柄（上下なし）', '飛び柄（余白あり）', 'お太鼓柄（ワンポイント/1枚絵）'].map((id) => (
                  <button key={id} type="button" onClick={() => setDensity(id)} className={`py-2 px-2.5 text-[11px] font-bold tracking-wider transition-all text-left border ${density === id ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-sm'} relative z-10`}>
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">柄の種類</label>
                <select value={geoPatternType} onChange={(e) => setGeoPatternType(e.target.value as any)} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10 font-bold">
                  <option value="plain">無地</option>
                  <option value="stripe">縞（ストライプ）</option>
                  <option value="dot">水玉（ドット）</option>
                  <option value="grid">格子（ラインチェック）</option>
                  <option value="gingham">ギンガムチェック</option>
                  <option value="checker">市松（チェッカー）</option>
                </select>
              </div>
              {geoPatternType === 'stripe' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">縞の向き</label>
                  <select value={stripeDir} onChange={(e) => setStripeDir(e.target.value as 'vertical' | 'horizontal' | 'diagonal')} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10">
                    <option value="vertical">縦縞（滝縞）</option>
                    <option value="horizontal">横縞（ボーダー）</option>
                    <option value="diagonal">斜め（右上がり）</option>
                  </select>
                </div>
              )}
              {geoPatternType === 'dot' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">配置</label>
                  <select value={dotLayout} onChange={(e) => setDotLayout(e.target.value as 'staggered' | 'grid')} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10">
                    <option value="staggered">千鳥（互い違い）</option>
                    <option value="grid">正方格子</option>
                  </select>
                </div>
              )}
            </div>

            {geoPatternType !== 'plain' && (
              <div className="space-y-5 pt-4 border-t border-zinc-100 relative z-10">
                <label className="block text-xs font-bold text-zinc-900 mb-2">サイズ調整（mm実寸連動）</label>
                
                {geoPatternType === 'dot' && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">水玉の大きさ（直径）</span>
                        <span className="text-xs font-black text-zinc-900">{dotRadius * 2}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                        <span className="text-xs font-black text-zinc-900">{gapWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="0" max="100" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                  </>
                )}

                {geoPatternType === 'checker' && (
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">市松の大きさ（1マス）</span>
                      <span className="text-xs font-black text-zinc-900">{lineWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                    </div>
                    <input type="range" min="1" max="200" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                  </div>
                )}

                {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham') && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">線の太さ</span>
                        <span className="text-xs font-black text-zinc-900">{lineWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                        <span className="text-xs font-black text-zinc-900">{gapWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="0" max="200" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-zinc-100 space-y-3 relative">
              <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">{geoPatternType === 'plain' ? '無地の色' : '地色'}</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoBgColor }} />
                    <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>伝統色</button>
                  </div>
                </div>
                {geoPatternType !== 'plain' && (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">柄色</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoPatternColor }} />
                      <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>伝統色</button>
                    </div>
                  </div>
                )}
              </div>

              {showGeoPaletteFor && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-zinc-500 font-bold">{showGeoPaletteFor === 'bg' ? (geoPatternType === 'plain' ? '無地の色' : '地色') : '柄色'}を選択：</p>
                    <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {TRADITIONAL_COLORS.map((col) => (
                        <button key={col.name} type="button" onClick={() => { if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex); if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex); setShowGeoPaletteFor(null); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                          <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6 mt-6">
          {(itemType === 'hanhaba' || itemType === 'kyobukuro') && (
            <div className="pt-4 border-t border-zinc-200 relative">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-zinc-700 whitespace-nowrap">裏地の色：</label>
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="w-8 h-8 shrink-0 border border-zinc-300 p-0.5 shadow-inner" style={{ backgroundColor: obiLiningColor }} />
                  <button type="button" onClick={() => setShowLiningPalette(!showLiningPalette)} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm ${showLiningPalette ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'} relative z-10`}>伝統色から選ぶ</button>
                </div>
              </div>
              {showLiningPalette && (
                <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-zinc-500 font-bold">裏地の色を選択：</p>
                    <button type="button" onClick={() => setShowLiningPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => (
                      <button key={col.name} type="button" onClick={() => { setObiLiningColor(col.hex); setShowLiningPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                        <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {itemType === 'kimono' && (
            <div className="pt-4 border-t border-zinc-200 space-y-4 relative z-30">
              <label className="block text-[11px] font-bold text-zinc-800 tracking-wider">着物のコーディネート</label>
              
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-zinc-700 w-10">帯：</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: 'cover' }} />
                  <button type="button" onClick={() => { setShowObiColorPalette(!showObiColorPalette); setShowHaneriColorPalette(false); setShowObiageColorPalette(false); }} className="flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative z-10">色を選ぶ</button>
                </div>
                <label className="flex-1 cursor-pointer text-center text-[10px] h-8 font-bold transition-all border shadow-sm bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 relative z-10">
                  画像から帯を乗せる
                  <input type="file" accept="image/*" className="hidden" onChange={handleCustomObiUpload} />
                </label>
                {customObiUrl && ( <button type="button" onClick={() => setCustomObiUrl(null)} className="text-[10px] text-zinc-500 hover:text-zinc-800 underline ml-1 relative z-10">解除</button> )}
              </div>
              
              {showObiColorPalette && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 shadow-inner relative z-50">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-zinc-500 font-bold">帯の色を選択：</p>
                    <button type="button" onClick={() => setShowObiColorPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => (
                      <button key={`obi-${col.name}`} type="button" onClick={() => { setKimonoObiColor(col.hex); setCustomObiUrl(null); setShowObiColorPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                        <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-zinc-100/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-700 w-10">半衿：</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoHaneriColor }} />
                      <button type="button" onClick={() => { setShowHaneriColorPalette(!showHaneriColorPalette); setShowObiColorPalette(false); setShowObiageColorPalette(false); }} className="flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative z-10">色を選ぶ</button>
                    </div>
                  </div>
                  {showHaneriColorPalette && (
                    <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 shadow-inner relative z-50">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-zinc-500 font-bold">半衿の色を選択：</p>
                        <button type="button" onClick={() => setShowHaneriColorPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 gap-1.5">
                        {TRADITIONAL_COLORS.map((col) => (
                          <button key={`haneri-${col.name}`} type="button" onClick={() => { setKimonoHaneriColor(col.hex); setShowHaneriColorPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                            <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-700 w-10">帯揚げ：</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoObiageColor }} />
                      <button type="button" onClick={() => { setShowObiageColorPalette(!showObiageColorPalette); setShowObiColorPalette(false); setShowHaneriColorPalette(false); }} className="flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative z-10">色を選ぶ</button>
                    </div>
                  </div>
                  {showObiageColorPalette && (
                    <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 shadow-inner relative z-50">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-zinc-500 font-bold">帯揚げの色を選択：</p>
                        <button type="button" onClick={() => setShowObiageColorPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 gap-1.5">
                        {TRADITIONAL_COLORS.map((col) => (
                          <button key={`obiage-${col.name}`} type="button" onClick={() => { setKimonoObiageColor(col.hex); setShowObiageColorPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                            <span className={`text-[8px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {creationMode === 'ai' && (
            <div className="pt-6 border-t border-zinc-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none mb-4 group relative z-10">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer" />
                <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800 transition-colors">生成図案はAIによるアイデアであり、実際の生地制作時は職人の手でデータ調整が行われることに同意します。</span>
              </label>
              {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">{errorMsg}</div>}
              <button type="button" onClick={handleGenerate} disabled={loading || remainingCount === 0} className={`w-full py-4 font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md relative z-10 ${remainingCount === 0 ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-lg disabled:opacity-50'}`}>
                {loading ? ( 
                  <div className="flex flex-col items-center gap-1">
                    <span>{LOADING_STEPS[loadingStep]}</span>
                    <span className="text-[8px] text-zinc-400">PROCESSING...</span>
                  </div> 
                ) : ( 
                  <span>{remainingCount === 0 ? '本日の上限に達しました (3/3)' : `図案を描き出す (残り ${remainingCount ?? 3} 回)`}</span> 
                )}
              </button>
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="pt-8 mt-8 border-t-2 border-zinc-950 space-y-6 relative z-10 animate-fade-in bg-zinc-50 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 pb-8">
            <h3 className="text-center font-bold text-sm tracking-widest text-zinc-800 pt-6">あなただけの作品が完成しました</h3>
            
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline">
                <label className="block text-xs font-bold text-zinc-700 tracking-wider">
                  作品名 <span className="font-normal text-[10px] text-zinc-400">（お好みの名前に変更できます）</span>
                </label>
                {patternTitle && (
                  <button
                    type="button"
                    onClick={() => {
                      setPatternTitle('');
                      if (setIsTitleManual) setIsTitleManual(false);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-zinc-700 underline"
                  >
                    リセット
                  </button>
                )}
              </div>
              <input
                type="text"
                className="w-full border-b-2 border-zinc-300 p-3 bg-transparent text-sm font-bold focus:outline-none focus:border-zinc-950 transition-colors"
                placeholder="例：深緋の色無地"
                value={patternTitle}
                onChange={(e) => {
                  setPatternTitle(e.target.value);
                  if (setIsTitleManual) setIsTitleManual(true);
                }}
                disabled={loading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <button type="button" onClick={handleDownloadOriginal} className="w-full py-3 text-center border border-zinc-300 bg-white hover:border-zinc-950 hover:bg-zinc-100 text-zinc-800 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                この作品の画像データを手元に残す
              </button>

              <div className="pt-3 pb-1 border-t border-zinc-200">
                <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-2 text-center">この作品をSNSでお披露目する</p>
                
                <div className="grid grid-cols-5 gap-1.5">
                  <button type="button" onClick={shareToX} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Xでポスト">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">X</span>
                  </button>

                  <button type="button" onClick={shareToThreads} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Threadsでポスト">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.72 0 12.186 5.094 12.186 11.814 0 2.253-.615 4.417-1.78 6.257l-1.92-1.22c.905-1.43 1.38-3.11 1.38-4.863 0-5.467-4.44-9.5-9.866-9.5-5.426 0-9.866 4.44-9.866 9.866 0 5.427 4.44 9.867 9.866 9.867 3.52 0 6.64-1.854 8.36-4.96l1.986 1.1c-2.226 4.013-6.24 6.406-10.74 6.406z"/>
                      <path d="M12.186 17.5c-3.14 0-5.694-2.553-5.694-5.693 0-3.14 2.554-5.694 5.694-5.694 3.14 0 5.693 2.554 5.693 5.694 0 .693-.56 1.253-1.253 1.253-.694 0-1.254-.56-1.254-1.253 0-1.76-1.433-3.194-3.193-3.194-1.76 0-3.194 1.434-3.194 3.194 0 1.76 1.434 3.193 3.194 3.193 1.053 0 1.986-.52 2.56-1.306.493.533 1.2 1.306 2.066 1.306 1.96 0 3.547-1.587 3.547-3.547 0-4.32-3.507-7.827-7.827-7.827-4.32 0-7.827 3.507-7.827 7.827 0 4.32 3.507 7.827 7.827 7.827 2.373 0 4.547-1.067 6.013-2.773l1.84 1.333C20.693 20.307 17.973 21.667 15 21.667c-.933 0-1.88-.134-2.814-.414z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Threads</span>
                  </button>

                  <button type="button" onClick={shareToInstagram} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Instagram用テキストをコピーして開く">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Instagram</span>
                  </button>

                  <button type="button" onClick={shareToPinterest} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Pinterestにピン留め">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.987C24.02 5.367 18.644 0 12.017 0z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Pinterest</span>
                  </button>

                  <button type="button" onClick={shareToFacebook} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Facebookでシェア">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Facebook</span>
                  </button>
                </div>
              </div>

              <a href="#" onClick={handleOrderClick} className="block w-full py-4 mt-2 text-center bg-zinc-950 text-white text-[15px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] border-2 border-zinc-950 rounded-sm">
                妄想を現実に<br/><span className="text-[10px] font-medium tracking-wider opacity-90 mt-1 block">（この作品を現実の着物・帯として仕立てる）</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
