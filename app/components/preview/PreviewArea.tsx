// components/preview/PreviewArea.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, RefObject } from 'react';

// 定番の裏地クイックカラー
const QUICK_LINING_COLORS = [
  { name: '白磁', hex: '#f8fbf8', border: '#d4d4d8' },
  { name: '灰桜', hex: '#e8d3d1', border: '#d4d4d8' },
  { name: '漆黒', hex: '#161616', border: '#161616' },
  { name: '紺青', hex: '#192f60', border: '#192f60' },
  { name: '臙脂', hex: '#9e2a2b', border: '#9e2a2b' },
  { name: '利休鼠', hex: '#888e7e', border: '#888e7e' },
];

interface PreviewAreaProps {
  imageUrl: string;
  blobUrl: string;
  rotatedPatternUrl: string;
  serialNumber: string;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  displayMode: 'mockup' | 'trim' | 'data';
  creationMode: 'ai' | 'geometric';
  bgSizeMm: number;
  geoBgColor: string;
  obiLiningColor: string;
  setObiLiningColor?: (color: string) => void;
  kimonoHaneriColor: string;
  kimonoObiageColor: string;
  kimonoObiColor: string;
  customObiUrl: string | null;
  mockupSubmitting: boolean;
  previewRef: RefObject<HTMLDivElement>;
  previewContainerRef: RefObject<HTMLDivElement>;
  handleItemTypeChange: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  setDisplayMode: (mode: 'mockup' | 'trim' | 'data') => void;
  handleDownloadMapping: () => void;
  UNIVERSAL_SCALE_FACTOR: number;
}

export default function PreviewArea({
  imageUrl,
  blobUrl,
  rotatedPatternUrl,
  serialNumber,
  itemType,
  displayMode,
  creationMode,
  bgSizeMm,
  geoBgColor,
  obiLiningColor,
  setObiLiningColor,
  kimonoHaneriColor,
  kimonoObiageColor,
  kimonoObiColor,
  customObiUrl,
  mockupSubmitting,
  previewRef,
  previewContainerRef,
  handleItemTypeChange,
  setDisplayMode,
  handleDownloadMapping,
  UNIVERSAL_SCALE_FACTOR
}: PreviewAreaProps) {
  
  const [isCompact, setIsCompact] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        setIsCompact(window.scrollY > 300);
      } else {
        setIsCompact(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
  const hasPattern = Boolean(effectivePatternUrl);

  const renderMockup = () => {
    const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}\% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
    const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}\% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;

    return (
      <>
        {itemType === 'hanhaba' && (
          <div className="relative w-full h-full overflow-hidden">
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
                  maskImage: `url('/${layer.file}')`, WebkitMaskImage: `url('/${layer.file}')`, 
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
                  backgroundImage: hasPattern ? `url(${effectivePatternUrl})` : 'none', backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: hasPattern 
                    ? (creationMode === 'geometric' ? geoBgColor : 'transparent') 
                    : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 65, 
                maskImage: `url('/hanhaba_Layer07.png')`, 
                WebkitMaskImage: `url('/hanhaba_Layer07.png')`, 
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
                backgroundImage: `url('/hanhaba_Layer_kage.png')`, 
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
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <img src={`/kyoubukurogrand.png`} alt="" className="w-full h-full object-contain" />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 20, 
                maskImage: `url('/kyoubukurouraji.png')`, 
                WebkitMaskImage: `url('/kyoubukurouraji.png')`, 
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
                  maskImage: `url('/${layer.file}')`, WebkitMaskImage: `url('/${layer.file}')`, 
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
                  backgroundImage: hasPattern ? `url(${effectivePatternUrl})` : 'none', backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: hasPattern 
                    ? (creationMode === 'geometric' ? geoBgColor : 'transparent') 
                    : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 60, 
                backgroundImage: `url('/kyoubukuromask.png')`, 
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
          <div className="relative w-full h-full overflow-hidden bg-white">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              <img src={`/haikei.png`} alt="" className="w-full h-full object-contain" />
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
                  maskImage: `url('/${layer.file}')`, WebkitMaskImage: `url('/${layer.file}')`, 
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
                  backgroundImage: hasPattern ? `url(${effectivePatternUrl})` : 'none', backgroundSize: kimonoPatternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.angle - 90}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: hasPattern 
                    ? (creationMode === 'geometric' ? geoBgColor : 'transparent') 
                    : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 45, 
                maskImage: `url('/haneri.png')`, 
                WebkitMaskImage: `url('/haneri.png')`, 
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
                maskImage: `url('/obiage.png')`, 
                WebkitMaskImage: `url('/obiage.png')`, 
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
                maskImage: `url('/obi_2.png')`, 
                WebkitMaskImage: `url('/obi_2.png')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', backgroundColor: customObiUrl ? 'transparent' : kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: '50\% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat' }} /> </div> <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/jyouzan.png')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.5 }} /> </div> )} </> ); };  return ( <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-8 flex flex-col bg-[#e4e4e7] lg:bg-transparent shadow-md lg:shadow-none mb-6 lg:mb-0"> <div className="w-full bg-[#e4e4e7] flex flex-col relative overflow-hidden">  {/* ヘッダー・アイテム切り替えバー */} <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between z-30"> <span className="text-[10px] font-mono text-zinc-400"> {serialNumber ? `ID:${serialNumber}` : 'ID:SAMPLE'}
          </span>
          <div className="flex gap-1.5 items-center">
            <button type="button" onClick={() => handleItemTypeChange('hanhaba')} className={`px-2 py-1 text-[10px] font-black rounded transition-all ${itemType === 'hanhaba' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>半幅帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kyobukuro')} className={`px-2 py-1 text-[10px] font-black rounded transition-all ${itemType === 'kyobukuro' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>京袋帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kimono')} className={`px-2 py-1 text-[10px] font-black rounded transition-all flex items-center gap-1 ${itemType === 'kimono' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              着物<span className="text-[7px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse leading-none shadow-sm">NEW</span>
            </button>
          </div>
        </div>

        {/* メインプレビューエリア */}
        <div className="w-full relative shadow-inner overflow-hidden flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px] pt-14 pb-16">
          
          {/* 上部タブ切替 */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 px-2 z-20">
            <button type="button" onClick={() => setDisplayMode('mockup')} className={`px-2.5 sm:px-3 py-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'mockup' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
              {itemType === 'hanhaba' && '半幅帯マッピング'}
              {itemType === 'kyobukuro' && '京袋帯マッピング'}
              {itemType === 'kimono' && '着物マッピング'}
            </button>
            {itemType === 'kyobukuro' && (
              <button type="button" onClick={() => setDisplayMode('trim')} className={`px-2.5 sm:px-3 py-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'trim' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
                34cm裁断イメージ
              </button>
            )}
            <button type="button" onClick={() => setDisplayMode('data')} className={`px-2.5 sm:px-3 py-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'data' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
              {itemType === 'hanhaba' ? '18cmプリントデータ' : '40cm反物データ'}
            </button>
          </div>

          {/* モックアップ表示（初期状態は無地の白帯・無地着物として表示） */}
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10 px-4">
              <div 
                ref={previewContainerRef} 
                className="relative mx-auto drop-shadow-xl w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] flex items-center justify-center overflow-hidden bg-[#dedee2]"
              >
                {renderMockup()}
              </div>

              {/* フローティング裏地クイックセレクター（半幅帯・京袋帯時） */}
              {(itemType === 'hanhaba' || itemType === 'kyobukuro') && setObiLiningColor && (
                <div className="mt-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-zinc-200 z-20">
                  <span className="text-[9px] font-bold text-zinc-500 mr-1">裏地:</span>
                  {QUICK_LINING_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      title={col.name}
                      onClick={() => setObiLiningColor(col.hex)}
                      className={`w-5 h
