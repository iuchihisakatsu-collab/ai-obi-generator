// components/preview/PreviewArea.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, RefObject } from 'react';

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

  const renderMockup = () => {
    const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
    const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;
    const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);

    if (itemType === 'hanhaba') {
      return (
        <div className="relative w-full h-full overflow-hidden aspect-square">
          {[ 
            { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2, bgX: '12%', bgY: '34%' }, 
            { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 1, bgX: '45%', bgY: '67%' }, 
            { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 8, bgX: '78%', bgY: '12%' }, 
            { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: -1, bgX: '23%', bgY: '89%' }, 
            { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -10, bgX: '56%', bgY: '45%' }, 
            { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -93, bgX: '89%', bgY: '23%' }
          ].map((layer) => (
            <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=21')`, WebkitMaskImage: `url('/${layer.file}?v=21')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
              <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} />
            </div>
          ))}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 65, maskImage: `url('/hanhaba_Layer07.png?v=21')`, WebkitMaskImage: `url('/hanhaba_Layer07.png?v=21')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
            <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundColor: obiLiningColor }} />
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/hanhaba_Layer_kage.png?v=21')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.5 }} />
        </div>
      );
    }

    if (itemType === 'kyobukuro') {
      return (
        <div className="relative w-full h-full overflow-hidden aspect-square">
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
            <img src={`/kyoubukurogrand.png?v=21`} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20, maskImage: `url('/kyoubukurouraji.png?v=21')`, WebkitMaskImage: `url('/kyoubukurouraji.png?v=21')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
            <div className="w-full h-full" style={{ backgroundColor: obiLiningColor }} />
          </div>
          {[ 
            { id: 'hara', file: 'kyoubukurohara.png', z: 30, rot: 271, bgX: '50%', bgY: '50%' }, 
            { id: 'tare', file: 'kyoubukurotare.png', z: 40, rot: -1, bgX: '50%', bgY: '50%' }, 
            { id: 'taiko', file: 'kyoubukurotakio.png', z: 50, rot: 2, bgX: '50%', bgY: '50%' }
          ].map((layer) => (
            <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=21')`, WebkitMaskImage: `url('/${layer.file}?v=21')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
              <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} />
            </div>
          ))}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 60, backgroundImage: `url('/kyoubukuromask.png?v=21')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.5 }} />
        </div>
      );
    }

    if (itemType === 'kimono') {
      return (
        <div className="relative w-full h-full overflow-hidden aspect-square bg-white">
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            <img src={`/haikei.png?v=30`} alt="" className="w-full h-full object-contain" />
