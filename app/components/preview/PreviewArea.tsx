// components/preview/PreviewArea.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, RefObject } from 'react';

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
  
  // キャッシュ更新用バージョン番号
  const v = '21';

  const [isCompact, setIsCompact] = useState(false);
  
  // ドラッグ移動用のステートと参照
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const pointerData = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });
  
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    pointerData.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: dragOffset.x,
      origY: dragOffset.y,
      hasMoved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - pointerData.current.startX;
    const dy = e.clientY - pointerData.current.startY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      pointerData.current.hasMoved = true;
    }

    setDragOffset({
      x: pointerData.current.origX + dx,
      y: pointerData.current.origY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleWipeClick = () => {
    if (pointerData.current.hasMoved) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
  const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;
  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);

  return (
    <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-8 flex flex-col bg-[#e4e4e7] lg:bg-transparent shadow-md lg:shadow-none mb-6 lg:mb-0">
      {imageUrl && (
        <div className="w-full bg-[#e4e4e7] flex flex-col relative overflow-hidden">
          
          <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between z-30">
            <span className="text-[10px] font-mono text-zinc-400">ID:{serialNumber}</span>
            <div className="flex gap-1.5 items-center">
              <button type="button" onClick={() => handleItemTypeChange('hanhaba')} className={`px-2 py-1 text-[10px] font-black rounded transition-all ${itemType === 'hanhaba' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>半幅帯</button>
              <button type="button" onClick={() => handleItemTypeChange('kyobukuro')} className={`px-2 py-1 text-[10px] font-black rounded transition-all ${itemType === 'kyobukuro' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>京袋帯</button>
              <button type="button" onClick={() => handleItemTypeChange('kimono')} className={`px-2 py-1 text-[10px] font-black rounded transition-all flex items-center gap-1 ${itemType === 'kimono' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                着物<span className="text-[7px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse leading-none shadow-sm">NEW</span>
              </button>
            </div>
          </div>

          <div className="w-full relative shadow-inner overflow-hidden flex items-center justify-center min-h-[380px] sm:min-h-[420px] pt-14 pb-12">
            
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-2 px-2 z-20">
              <button type="button" onClick={() => setDisplayMode('mockup')} className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'mockup' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
                {itemType === 'hanhaba' && '半幅帯マッピング'}
                {itemType === 'kyobukuro' && '京袋帯マッピング'}
                {itemType === 'kimono' && '着物マッピング'}
              </button>
              {itemType === 'kyobukuro' && (
                <button type="button" onClick={() => setDisplayMode('trim')} className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'trim' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
                  34cm裁断イメージ
                </button>
              )}
              <button type="button" onClick={() => setDisplayMode('data')} className={`px-3 py-1.5 text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'data' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
                {itemType === 'hanhaba' ? '18cmプリントデータ' : '40cm反物データ'}
              </button>
            </div>

            {displayMode === 'mockup' && (
              <div className="w-full flex flex-col items-center animate-fade-in relative z-10 px-4">
                <div ref={previewContainerRef} className="relative mx-auto drop-shadow-xl w-full max-w-[360px] sm:max-w-[400px]">
                  
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
                        <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=${v}')`, WebkitMaskImage: `url('/${layer.file}?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition
