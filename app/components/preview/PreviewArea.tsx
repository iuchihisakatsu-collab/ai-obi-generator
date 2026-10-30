// components/preview/PreviewArea.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, RefObject } from 'react';

// 定番裏地カラー（洗練されたコンパクトパレット）
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

  // ★ フローティング小窓を指やマウスで自由に動かせる（ドラッグ移動）ステート
  const [pipPos, setPipPos] = useState<{ x: number; y: number } | null>(null);
  const dragInfo = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

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

  // スマホ（タッチ操作）でのドラッグ移動
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    dragInfo.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: rect.left,
      initialY: rect.top,
      moved: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const dx = touch.clientX - dragInfo.current.startX;
    const dy = touch.clientY - dragInfo.current.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      dragInfo.current.moved = true;
    }
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const targetW = 170;
    const targetH = 170;
    const nextX = Math.max(10, Math.min(windowW - targetW - 10, dragInfo.current.initialX + dx));
    const nextY = Math.max(10, Math.min(windowH - targetH - 10, dragInfo.current.initialY + dy));
    setPipPos({ x: nextX, y: nextY });
  };

  const handleTouchEnd = () => {
    // 指を動かさずにポンとタップした時だけ画面上部へスクロール
    if (!dragInfo.current.moved) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // PC（マウス操作）でのドラッグ移動
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      moved: false,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragInfo.current.startX;
      const dy = moveEvent.clientY - dragInfo.current.startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        dragInfo.current.moved = true;
      }
      const windowW = window.innerWidth;
      const windowH = window.innerHeight;
      const targetW = 170;
      const targetH = 170;
      const nextX = Math.max(10, Math.min(windowW - targetW - 10, dragInfo.current.initialX + dx));
      const nextY = Math.max(10, Math.min(windowH - targetH - 10, dragInfo.current.initialY + dy));
      setPipPos({ x: nextX, y: nextY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (!dragInfo.current.moved) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
  const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
  const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;

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
                  maskImage: `url('/${layer.file}?v=21')`, 
                  WebkitMaskImage: `url('/${layer.file}?v=21')`, 
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
                  backgroundImage: effectivePatternUrl ? `url("${effectivePatternUrl}")` : 'none', 
                  backgroundSize: patternSize, 
                  backgroundRepeat: 'repeat', 
                  backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                  transform: `rotate(${layer.rot}deg)`, 
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
                  maskImage: `url('/${layer.file}?v=21')`, 
                  WebkitMaskImage: `url('/${layer.file}?v=21')`, 
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
                  backgroundImage: effectivePatternUrl ? `url("${effectivePatternUrl}")` : 'none', 
                  backgroundSize: patternSize, 
                  backgroundRepeat: 'repeat', 
                  backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                  transform: `rotate(${layer.rot}deg)`, 
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
                  maskImage: `url('/${layer.file}?v=30')`, 
                  WebkitMaskImage: `url('/${layer.file}?v=30')`, 
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
                  backgroundImage: effectivePatternUrl ? `url("${effectivePatternUrl}")` : 'none', 
                  backgroundSize: kimonoPatternSize, 
                  backgroundRepeat: 'repeat', 
                  backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                  transform: `rotate(${layer.angle - 90}deg)`, 
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
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', backgroundColor: customObiUrl ? 'transparent' : kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: '50% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat' }} />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 70, 
                backgroundImage: `url('/jyouzan.png?v=30')`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                mixBlendMode: 'multiply', 
                opacity: 0.5 
              }} 
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-8 flex flex-col bg-[#e4e4e7] lg:bg-transparent shadow-md lg:shadow-none mb-4 lg:mb-0">
      <div className="w-full bg-[#e4e4e7] flex flex-col relative overflow-hidden">
        
        {/* アイテム切替バー */}
        <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between z-30">
          <span className="text-[10px] font-mono text-zinc-400">
            {serialNumber ? `ID:${serialNumber}` : 'ID:PREVIEW'}
          </span>
          <div className="flex gap-1.5 items-center">
            <button type="button" onClick={() => handleItemTypeChange('hanhaba')} className={`px-2.5 py-1 text-[10px] font-black rounded transition-all ${itemType === 'hanhaba' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>半幅帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kyobukuro')} className={`px-2.5 py-1 text-[10px] font-black rounded transition-all ${itemType === 'kyobukuro' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>京袋帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kimono')} className={`px-2.5 py-1 text-[10px] font-black rounded transition-all flex items-center gap-1 ${itemType === 'kimono' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              着物<span className="text-[7px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse leading-none shadow-sm">NEW</span>
            </button>
          </div>
        </div>

        {/* プレビュー本体（スマホ画面横幅いっぱいにドカンと大迫力表示） */}
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

          {/* 1. モックアップ（スマホ横幅いっぱい w-full max-w-[390px] sm:max-w-[420px]） */}
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
              <div 
                ref={previewContainerRef} 
                className="relative mx-auto drop-shadow-xl w-full max-w-[390px] sm:max-w-[420px] aspect-square flex items-center justify-center overflow-hidden"
              >
                {renderMockup()}
              </div>

              {/* 【洗練されたコンパクト裏地フロート】 */}
              {(itemType === 'hanhaba' || itemType === 'kyobukuro') && (
                <div className="mt-2.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-zinc-200 z-20">
                  <span className="text-[9px] font-black text-zinc-500 mr-0.5 tracking-wider">裏地:</span>
                  {COMPACT_LININGS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      title={col.name}
                      onClick={() => setObiLiningColor(col.hex)}
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-transform ${
                        obiLiningColor.toLowerCase() === col.hex.toLowerCase() 
                          ? 'scale-125 ring-2 ring-zinc-900 shadow' 
                          : 'hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col.hex, borderColor: col.border }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. トリム表示 */}
          {displayMode === 'trim' && itemType === 'kyobukuro' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10">
              <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-full max-w-[390px] sm:max-w-[420px]" style={{ aspectRatio: '40 / 34' }}>
                <div className="absolute inset-0" style={{ backgroundImage: `url("${effectivePatternUrl}")`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : `${(180 / 400) * 100}% auto`, backgroundPosition: 'center center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
              </div>
            </div>
          )}

          {/* 3. データ表示 */}
          {displayMode === 'data' && (
            <div className="flex flex-col items-center w-full animate-fade-in relative z-10">
              {itemType === 'hanhaba' ? (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-[200px] h-[444px]">
                  <div className="absolute inset-0" style={{ backgroundImage: `url("${effectivePatternUrl}")`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 180) * 100}% auto` : '100% auto', backgroundPosition: 'top left', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                </div>
              ) : (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-full max-w-[390px] sm:max-w-[420px] aspect-square">
                  <div className="absolute inset-0" style={{ backgroundImage: `url("${effectivePatternUrl}")`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : '100% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
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

      {/* ★ 指で自由に好きな位置へ動かせる（Draggable）生中継丸型フロート小窓 */}
      {effectivePatternUrl && (
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={pipPos ? { left: `${pipPos.x}px`, top: `${pipPos.y}px`, bottom: 'auto', right: 'auto' } : undefined}
          className={`lg:hidden fixed z-50 w-[170px] h-[170px] sm:w-[200px] sm:h-[200px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.35)] border-[4.5px] border-white overflow-hidden active:scale-95 transition-transform duration-100 group bg-[#dedee2] cursor-move select-none touch-none ${
            pipPos ? '' : 'bottom-6 right-4'
          } ${isCompact ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'}`}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center scale-[1.15]">
            <div className="w-[170px] h-[170px] sm:w-[200px] sm:h-[200px]">
              {renderMockup()}
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-colors group-hover:bg-black/20 pointer-events-none">
            <div className="bg-black/60 p-2.5 rounded-full backdrop-blur-md shadow-sm">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
