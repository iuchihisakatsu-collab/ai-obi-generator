// components/preview/PreviewArea.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, RefObject } from 'react';

// 定番裏地カラー（昨日の洗練されたコンパクトパレット）
const COMPACT_LININGS = [
  { name: '白磁', hex: '#f8fbf8', border: '#d4d4d8' },
  { name: '灰桜', hex: '#e8d3d1', border: '#d4d4d8' },
  { name: '漆黒', hex: '#161616', border: '#161616' },
  { name: '紺青', hex: '#192f60', border: '#192f60' },
  { name: '臙脂', hex: '#9e2a2b', border: '#9e2a2b' },
  { name: '利休鼠', hex: '#888e7e', border: '#888e7e' },
];

interface PreviewAreaProps {
  imageUrl?: string;
  blobUrl?: string;
  rotatedPatternUrl?: string;
  serialNumber?: string;
  itemType?: 'hanhaba' | 'kyobukuro' | 'kimono';
  displayMode?: 'mockup' | 'trim' | 'data';
  creationMode?: 'ai' | 'geometric';
  bgSizeMm?: number;
  geoBgColor?: string;
  obiLiningColor?: string;
  setObiLiningColor?: (color: string) => void;
  kimonoHaneriColor?: string;
  setKimonoHaneriColor?: (color: string) => void;
  kimonoObiageColor?: string;
  setKimonoObiageColor?: (color: string) => void;
  kimonoObiColor?: string;
  setKimonoObiColor?: (color: string) => void;
  customObiUrl?: string | null;
  mockupSubmitting?: boolean;
  previewRef?: RefObject<HTMLDivElement>;
  previewContainerRef?: RefObject<HTMLDivElement>;
  handleItemTypeChange?: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  setDisplayMode?: (mode: 'mockup' | 'trim' | 'data') => void;
  handleDownloadMapping?: () => void;
  UNIVERSAL_SCALE_FACTOR?: number;
}

export default function PreviewArea(props: PreviewAreaProps) {
  const {
    imageUrl = '',
    blobUrl = '',
    rotatedPatternUrl = '',
    serialNumber = '',
    itemType = 'hanhaba',
    displayMode = 'mockup',
    creationMode = 'ai',
    bgSizeMm = 100,
    geoBgColor = '#ffffff',
    obiLiningColor = '#262626',
    setObiLiningColor = () => {},
    kimonoHaneriColor = '#ffffff',
    kimonoObiageColor = '#c82a36',
    kimonoObiColor = '#1a1a1a',
    customObiUrl = null,
    mockupSubmitting = false,
    previewRef,
    previewContainerRef,
    handleItemTypeChange = () => {},
    setDisplayMode = () => {},
    handleDownloadMapping = () => {},
    UNIVERSAL_SCALE_FACTOR = 3 / 22
  } = props;

  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const top = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (window.innerWidth < 1024) {
        setIsCompact(top > 160);
      } else {
        setIsCompact(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
  const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}\% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
  const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}\% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;

  const renderMockup = () => {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {itemType === 'hanhaba' && (
          <div className="relative w-full h-full overflow-hidden aspect-square">
            {[ 
              { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2, bgX: '12%', bgY: '34%' }, 
              { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 1, bgX: '45%', bgY: '67%' }, 
              { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 8, bgX: '78%', bgY: '12%' }, 
              { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: -1, bgX: '23%', bgY: '89%' }, 
              { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -10, bgX: '56%', bgY: '45%' }, 
              { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -93, bgX: '89%', bgY: '23%' }
            ].map((layer) => (
              <div 
                key={layer.id} 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  zIndex: layer.z, 
                  maskImage: `url('/${layer.file}?v=21')`, WebkitMaskImage: `url('/${layer.file}?v=21')`, 
                  maskSize: 'contain', 
                  WebkitMaskSize: 'contain', 
                  maskRepeat: 'no-repeat', 
                  WebkitMaskRepeat: 'no-repeat', 
                  maskPosition: 'center', 
                  WebkitMaskPosition: 'center' 
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '-25%', 
                  left: '-25%', 
                  width: '150%', 
                  height: '150%', 
                  backgroundImage: effectivePatternUrl ? `url(${effectivePatternUrl})` : 'none', backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: effectivePatternUrl ? (creationMode === 'geometric' ? geoBgColor : 'transparent') : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 65, 
                maskImage: `url('/hanhaba_Layer07.png?v=21')`, 
                WebkitMaskImage: `url('/hanhaba_Layer07.png?v=21')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundColor: obiLiningColor }} />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 70, 
                backgroundImage: `url('/hanhaba_Layer_kage.png?v=21')`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                mixBlendMode: 'multiply', 
                opacity: 0.5 
              }} 
            />
          </div>
        )}

        {itemType === 'kyobukuro' && (
          <div className="relative w-full h-full overflow-hidden aspect-square">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <img src={`/kyoubukurogrand.png?v=21`} alt="" className="w-full h-full object-contain" />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 20, 
                maskImage: `url('/kyoubukurouraji.png?v=21')`, 
                WebkitMaskImage: `url('/kyoubukurouraji.png?v=21')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div className="w-full h-full" style={{ backgroundColor: obiLiningColor }} />
            </div>
            {[ 
              { id: 'hara', file: 'kyoubukurohara.png', z: 30, rot: 271, bgX: '50%', bgY: '50%' }, 
              { id: 'tare', file: 'kyoubukurotare.png', z: 40, rot: -1, bgX: '50%', bgY: '50%' }, 
              { id: 'taiko', file: 'kyoubukurotakio.png', z: 50, rot: 2, bgX: '50%', bgY: '50%' }
            ].map((layer) => (
              <div 
                key={layer.id} 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  zIndex: layer.z, 
                  maskImage: `url('/${layer.file}?v=21')`, WebkitMaskImage: `url('/${layer.file}?v=21')`, 
                  maskSize: 'contain', 
                  WebkitMaskSize: 'contain', 
                  maskRepeat: 'no-repeat', 
                  WebkitMaskRepeat: 'no-repeat', 
                  maskPosition: 'center', 
                  WebkitMaskPosition: 'center' 
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '-25%', 
                  left: '-25%', 
                  width: '150%', 
                  height: '150%', 
                  backgroundImage: effectivePatternUrl ? `url(${effectivePatternUrl})` : 'none', backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: effectivePatternUrl ? (creationMode === 'geometric' ? geoBgColor : 'transparent') : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 60, 
                backgroundImage: `url('/kyoubukuromask.png?v=21')`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                mixBlendMode: 'multiply', 
                opacity: 0.5 
              }} 
            />
          </div>
        )}

        {itemType === 'kimono' && (
          <div className="relative w-full h-full overflow-hidden aspect-square bg-white">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              <img src={`/haikei.png?v=30`} alt="" className="w-full h-full object-contain" />
            </div>
            {[ 
              { id: 'usiromigoro', file: 'usiromigoro_75.png', z: 10, angle: 75, bgX: '50%', bgY: '50%' },
              { id: 'migisode', file: 'migisode_165.png', z: 15, angle: 165, bgX: '20%', bgY: '30%' },
              { id: 'hidarisode', file: 'hidarisode_150.png', z: 20, angle: 150, bgX: '80%', bgY: '40%' },
              { id: 'hidarisode2', file: 'hidarisode2_175.png', z: 25, angle: 175, bgX: '80%', bgY: '70%' },
              { id: 'maemigoro', file: 'maemigoro_105.png', z: 30, angle: 105, bgX: '45%', bgY: '60%' },
              { id: 'maemigoro2', file: 'maemigoro2_140.png', z: 35, angle: 140, bgX: '45%', bgY: '20%' },
              { id: 'maeokumi', file: 'maeokumi_110.png', z: 40, angle: 110, bgX: '55%', bgY: '50%' },
              { id: 'migieri', file: 'migieri_65.png', z: 50, angle: 65, bgX: '30%', bgY: '10%' },
              { id: 'hidarieri', file: 'hidarieri_117.png', z: 55, angle: 117, bgX: '70%', bgY: '10%' },
            ].map((layer) => (
              <div 
                key={layer.id} 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  zIndex: layer.z, 
                  maskImage: `url('/${layer.file}?v=30')`, WebkitMaskImage: `url('/${layer.file}?v=30')`, 
                  maskSize: 'contain', 
                  WebkitMaskSize: 'contain', 
                  maskRepeat: 'no-repeat', 
                  WebkitMaskRepeat: 'no-repeat', 
                  maskPosition: 'center', 
                  WebkitMaskPosition: 'center' 
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '-50%', 
                  left: '-50%', 
                  width: '200%', 
                  height: '200%', 
                  backgroundImage: effectivePatternUrl ? `url(${effectivePatternUrl})` : 'none', backgroundSize: kimonoPatternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.angle - 90}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: effectivePatternUrl ? (creationMode === 'geometric' ? geoBgColor : 'transparent') : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 45, 
                maskImage: `url('/haneri.png?v=30')`, 
                WebkitMaskImage: `url('/haneri.png?v=30')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div className="w-full h-full relative" style={{ backgroundColor: kimonoHaneriColor }}>
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }} />
              </div>
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 60, 
                maskImage: `url('/obiage.png?v=30')`, 
                WebkitMaskImage: `url('/obiage.png?v=30')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div className="w-full h-full" style={{ backgroundColor: kimonoObiageColor }} />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 65, 
                maskImage: `url('/obi_2.png?v=30')`, 
                WebkitMaskImage: `url('/obi_2.png?v=30')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', backgroundColor: customObiUrl ? 'transparent' : kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: '50\% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat' }} /> </div> <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/jyouzan.png?v=30')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.5 }} /> </div> )} </div> ); };  return ( <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-8 flex flex-col bg-[#e4e4e7] lg:bg-transparent shadow-md lg:shadow-none mb-4 lg:mb-0"> <div className="w-full bg-[#e4e4e7] flex flex-col relative overflow-hidden">  {/* アイテム切替バー */} <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between z-30"> <span className="text-[10px] font-mono text-zinc-400"> {serialNumber ? `ID:${serialNumber}` : 'ID:PREVIEW'}
          </span>
          <div className="flex gap-1.5 items-center">
            <button type="button" onClick={() => handleItemTypeChange('hanhaba')} className={`px-2.5 py-1 text-[10px] font-black rounded transition-all ${itemType === 'hanhaba' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>半幅帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kyobukuro')} className={`px-2.5 py-1 text-[10px] font-black rounded transition-all ${itemType === 'kyobukuro' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>京袋帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kimono')} className={`px-2.5 py-1 text-[10px] font-black rounded transition-all flex items-center gap-1 ${itemType === 'kimono' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              着物<span className="text-[7px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse leading-none shadow-sm">NEW</span>
            </button>
          </div>
        </div>

        {/* プレビュー本体（★スマホ画面横幅いっぱいにドカンと表示！） */}
        <div className="w-full relative shadow-inner overflow-hidden flex flex-col items-center justify-center p-3 sm:p-5 pt-12 pb-12 bg-[#dedee2]">
          
          {/* 上部タブ切替 */}
          <div className="absolute top-2.5 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 px-2 z-20">
            <button type="button" onClick={() => setDisplayMode('mockup')} className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'mockup' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/75 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
              {itemType === 'hanhaba' && '半幅帯マッピング'}
              {itemType === 'kyobukuro' && '京袋帯マッピング'}
              {itemType === 'kimono' && '着物マッピング'}
            </button>
            {itemType === 'kyobukuro' && (
              <button type="button" onClick={() => setDisplayMode('trim')} className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'trim' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/75 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
                34cm裁断イメージ
              </button>
            )}
            <button type="button" onClick={() => setDisplayMode('data')} className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'data' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/75 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
              {itemType === 'hanhaba' ? '18cmプリントデータ' : '40cm反物データ'}
            </button>
          </div>

          {/* 1. モックアップ（★画面横幅いっぱい w-full max-w-[390px] sm:max-w-[420px]） */}
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
              <div 
                ref={previewContainerRef} 
                className="relative mx-auto drop-shadow-xl w-full max-w-[390px] sm:max-w-[420px] aspect-square flex items-center justify-center overflow-hidden"
              >
                {renderMockup()}
              </div>

              {/* 【昨日通りの洗練されたコンパクト裏地フロート】 */}
              {(itemType === 'hanhaba' || itemType === 'kyobukuro') && (
                <div className="mt-2.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-zinc-200 z-20">
                  <span className="text-[9px] font-black text-zinc-500 mr-0.5 tracking-wider">裏地:</span>
                  {COMPACT_LININGS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      title={col.name}
                      onClick={() => setObiLiningColor(col.hex)}
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-transform ${ obiLiningColor.toLowerCase() === col.hex.toLowerCase() ? 'scale-125 ring-2 ring-zinc-900 shadow' : 'hover:scale-110 opacity-80 hover:opacity-100' }`} style={{ backgroundColor: col.hex, borderColor: col.border }} /> ))} </div> )} </div> )}  {/* 2. トリム表示 */} {displayMode === 'trim' && itemType === 'kyobukuro' && ( <div className="w-full flex flex-col items-center animate-fade-in relative z-10"> <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-full max-w-[390px] sm:max-w-[420px]" style={{ aspectRatio: '40 / 34' }}> <div className="absolute inset-0" style={{ backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}\% auto` : `${(180 / 400) * 100}% auto`, backgroundPosition: 'center center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
              </div>
            </div>
          )}

          {/* 3. データ表示 */}
          {displayMode === 'data' && (
            <div className="flex flex-col items-center w-full animate-fade-in relative z-10">
              {itemType === 'hanhaba' ? (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-[200px] h-[444px]">
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 180) * 100}% auto` : '100% auto', backgroundPosition: 'top left', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                </div>
              ) : (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-full max-w-[390px] sm:max-w-[420px] aspect-square">
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : '100% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                </div>
              )}
            </div>
          )}

          {/* 右下フローティング保存ボタン */}
          {displayMode === 'mockup' && effectivePatternUrl && (
            <button 
              type="button" 
              onClick={handleDownloadMapping} 
              disabled={mockupSubmitting} 
              className={`absolute bottom-9 right-3 z-30 px-3.5 py-1.5 text-[9.5px] font-bold tracking-wider rounded-full shadow-lg backdrop-blur-md border transition-all flex items-center gap-1.5 hover:bg-black ${ mockupSubmitting ? 'bg-zinc-400/80 text-white border-zinc-400 cursor-not-allowed' : 'bg-zinc-900/90 text-white border-zinc-900/50' }`}
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {mockupSubmitting ? '作成中...' : '画像を保存'}
            </button>
          )}

          {/* 最下部：手作業修正フローティング注釈 */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-zinc-200 px-3 py-1.5 shadow-xs flex items-center justify-center pointer-events-none">
            <p className="text-[9px] text-zinc-600 font-medium leading-tight text-center tracking-wide">
              ※ 画面上は柄のつなぎ目が切れて見える場合がありますが、仕立て時は<strong className="text-zinc-950 font-black">ゴフクヤサンが手作業で柄送りを綺麗に修正</strong>します。
            </p>
          </div>

        </div>
      </div>

      {/* スマホ専用：生中継の丸いフロート小窓（昨日の大迫力サイズ 180px） */}
      {effectivePatternUrl && (
        <button
          type="button"
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`lg:hidden fixed bottom-6 right-4 z-50 w-[170px] h-[170px] sm:w-[200px] sm:h-[200px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-[4px] border-white overflow-hidden active:scale-95 transition-all duration-500 group bg-[#dedee2] ${isCompact ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'}`} > <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center scale-[1.15] transition-transform duration-500 group-hover:scale-[1.25]"> <div className="w-[170px] h-[170px] sm:w-[200px] sm:h-[200px]"> {renderMockup()} </div> </div> <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-colors group-hover:bg-black/20"> <div className="bg-black/60 p-2.5 rounded-full backdrop-blur-md shadow-sm"> <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> </div> </div> </button> )} </div> ); } ```  ---  ### 2. `app/page.tsx` の完全復元コード（伝統色名＆銘の自動連動） 格子・水玉製作所で選んだ伝統色の名前（「深緋」「水色」「漆黒」など）を自動で作品名（銘）に反映し、ポップアップも二度と出ない完全版です。 GitHubで **`app/page.tsx`** を開き、丸ごと上書き保存してください。  ```tsx // app/page.tsx 'use client';  import { useState, useEffect, type MouseEvent, useCallback, Suspense, useRef } from 'react'; import { useSearchParams } from 'next/navigation'; import { generateStripeSvg, generateDotSvg, generateGridSvg, generateGinghamSvg, generateCheckerSvg, svgToHighResPng, type StripeDirection, type DotLayout } from './utils/geometricPatterns'; import { TRADITIONAL_COLORS, FORBIDDEN_WORDS, UNIVERSAL_SCALE_FACTOR } from './lib/constants'; import { CURRENT_NOTICE } from './lib/noticeConfig'; import NoticeModal from './components/NoticeModal'; import PreviewArea from './components/preview/PreviewArea'; import ControlPanel from './components/controls/ControlPanel'; import { PlatformType, submitOrder } from './lib/orders'; import { renderTiledGeometricPng, render18cmPrintDataPng } from './lib/production/canvasRenderer';  const MAX_FLUX_PER_DAY = 24; const MAX_OPENAI_PER_DAY = 1;  function getTodayJST(): string { const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); return `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`;
}

// 伝統色の色名を取得する関数（例: "#8b1e2a" -> "深緋"）
function getColorNameFromHex(hex: string): string {
  const found = TRADITIONAL_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return found ? found.name.split(' ')[0] : '';
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<PlatformType>((searchParams.get('platform') as PlatformType) || 'makeshop');
  const [designFee, setDesignFee] = useState<number>(1000);

  const [creationMode, setCreationMode] = useState<'ai' | 'geometric'>('geometric');
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono'>('hanhaba');
  const [displayMode, setDisplayMode] = useState<'mockup' | 'trim' | 'data'>('mockup');
  
  const [aiStyle, setAiStyle] = useState<string>('mingei');
  const [motif, setMotif] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [density, setDensity] = useState<string>('四方柄（上下なし）');

  // 格子・水玉製作所ステート
  const [geoPatternType, setGeoPatternType] = useState<'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>('stripe');
  const [stripeDir, setStripeDir] = useState<StripeDirection>('vertical');
  const [dotLayout, setDotLayout] = useState<DotLayout>('staggered');
  const [dotRadius, setDotRadius] = useState<number>(5);
  const [gapWidth, setGapWidth] = useState<number>(10);
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [geoBgColor, setGeoBgColor] = useState<string>('#fffffc');
  const [geoPatternColor, setGeoPatternColor] = useState<string>('#161616');
  const [showGeoPaletteFor, setShowGeoPaletteFor] = useState<'bg' | 'pattern' | null>(null);
  const [bgSizeMm, setBgSizeMm] = useState<number>(100);

  const [obiLiningColor, setObiLiningColor] = useState<string>('#dcdddd');
  const [kimonoHaneriColor, setKimonoHaneriColor] = useState<string>('#ffffff');
  const [kimonoObiageColor, setKimonoObiageColor] = useState<string>('#c82a36');
  const [kimonoObiColor, setKimonoObiColor] = useState<string>('#1a1a1a');
  const [customObiUrl, setCustomObiUrl] = useState<string | null>(null);

  const [agreed, setAgreed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingEngine, setLoadingEngine] = useState<'flux' | 'openai' | null>(null);
  const [remainingFlux, setRemainingFlux] = useState<number>(MAX_FLUX_PER_DAY);
  const [remainingOpenAI, setRemainingOpenAI] = useState<number>(MAX_OPENAI_PER_DAY);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [patternTitle, setPatternTitle] = useState<string>('');
  const [mockupSubmitting, setMockupSubmitting] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = getTodayJST();
    const storedDate = localStorage.getItem('komon_usage_date');
    if (storedDate !== today) {
      localStorage.setItem('komon_usage_date', today);
      localStorage.setItem('komon_count_flux', '0');
      localStorage.setItem('komon_count_openai', '0');
      setRemainingFlux(MAX_FLUX_PER_DAY);
      setRemainingOpenAI(MAX_OPENAI_PER_DAY);
    } else {
      setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - parseInt(localStorage.getItem('komon_count_flux') || '0', 10)));
      setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - parseInt(localStorage.getItem('komon_count_openai') || '0', 10)));
    }

    if (CURRENT_NOTICE.enabled && localStorage.getItem('last_dismissed_notice_id') !== CURRENT_NOTICE.id) {
      setIsNoticeOpen(true);
    }
  }, []);

  const handleCloseNotice = () => {
    setIsNoticeOpen(false);
    if (CURRENT_NOTICE?.id) {
      localStorage.setItem('last_dismissed_notice_id', CURRENT_NOTICE.id);
    }
  };

  // ★ 格子・水玉の生成 ＆ 伝統色名による銘の自動連動
  const updateGeometricPattern = useCallback(async () => {
    if (creationMode !== 'geometric') return;
    let svg = '';
    let size = 100;
    
    if (geoPatternType === 'plain') { 
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100
