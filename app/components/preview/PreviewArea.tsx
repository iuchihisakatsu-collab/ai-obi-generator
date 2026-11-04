// app/components/preview/PreviewArea.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

export interface PreviewAreaProps {
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
  setObiLiningColor: (c: string) => void;
  kimonoHaneriColor: string;
  setKimonoHaneriColor: (c: string) => void;
  kimonoObiageColor: string;
  setKimonoObiageColor: (c: string) => void;
  kimonoObiColor: string;
  setKimonoObiColor: (c: string) => void;
  customObiUrl: string | null;
  setCustomObiUrl?: (url: string | null) => void;
  handleCustomObiUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customHaraUrl?: string | null;
  setCustomHaraUrl?: (url: string | null) => void;
  handleCustomHaraUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mockupSubmitting: boolean;
  previewRef: React.RefObject<HTMLDivElement | null>;
  previewContainerRef: React.RefObject<HTMLDivElement | null>;
  handleItemTypeChange: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  setDisplayMode: (mode: 'mockup' | 'trim' | 'data') => void;
  handleDownloadMapping: () => void;
  UNIVERSAL_SCALE_FACTOR: number;
}

// ----------------------------------------------------------------------
// ミニマル極細線画SVGアイコン（絵文字完全排除）
// ----------------------------------------------------------------------
const Icons = {
  Hanhaba: () => (
    <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h16M4 16h16M7 8v8M17 8v8" />
    </svg>
  ),
  Kyobukuro: () => (
    <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M4 10h16M10 10v10" />
    </svg>
  ),
  Kimono: () => (
    <svg className="w-4 h-4 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l9-3 9 3v4l-4 1v9H7v-9L3 11V7z" />
      <path d="M9 4v17M15 4v17" />
    </svg>
  ),
  Zoom: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[1.75]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
    </svg>
  ),
  Download: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[1.75]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  ),
  Scissors: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  ),
  Tune: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[1.5]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  ArrowUp: () => (
    <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4 stroke-current fill-none stroke-[2]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
};

export default function PreviewArea(props: PreviewAreaProps) {
  const {
    imageUrl, blobUrl, rotatedPatternUrl,
    serialNumber, itemType, displayMode,
    creationMode, bgSizeMm, geoBgColor,
    obiLiningColor, setObiLiningColor,
    kimonoHaneriColor, setKimonoHaneriColor,
    kimonoObiageColor, setKimonoObiageColor,
    kimonoObiColor, setKimonoObiColor,
    customObiUrl, setCustomObiUrl, handleCustomObiUpload,
    customHaraUrl, setCustomHaraUrl, handleCustomHaraUpload,
    mockupSubmitting,
    previewRef, previewContainerRef,
    handleItemTypeChange, setDisplayMode,
    handleDownloadMapping,
    UNIVERSAL_SCALE_FACTOR,
  } = props;

  const [activeFloatPalette, setActiveFloatPalette] = useState<'lining' | 'haneri' | 'obiage' | 'obi' | 'hara' | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [showTuningPanel, setShowTuningPanel] = useState<boolean>(false);

  // 確実なスクロール位置検知（メインプレビューが画面上に消えたらFABを表示）
  const [isScrolledPast, setIsScrolledPast] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      // プレビュー領域の下端が画面上端を越えたら表示
      setIsScrolledPast(rect.bottom < 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [previewRef]);

  const scrollToTop = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ★ 1. 半幅帯パーツ定義（確定数値）
  const [hanhabaOffsets, setHanhabaOffsets] = useState([
    { id: '01_a', name: 'Layer01_a（奥羽・右側）', file: 'hanhaba_Layer01_a.png', z: 10, rot: 1,   scale: 111, x: 69, y: 50 },
    { id: '01_b', name: 'Layer01_b（奥羽・左下）', file: 'hanhaba_Layer01_b.png', z: 15, rot: 3,   scale: 100, x: 33, y: 50 },
    { id: '02',   name: 'Layer02（奥羽・右）',     file: 'hanhaba_Layer02.png',   z: 20, rot: 5,   scale: 108, x: 63, y: 56 },
    { id: '03',   name: 'Layer03（奥垂れ）',       file: 'hanhaba_Layer03.png',   z: 30, rot: 13,  scale: 100, x: 32, y: 40 },
    { id: '04',   name: 'Layer04（手前羽・左）',   file: 'hanhaba_Layer04.png',   z: 40, rot: 3,   scale: 109, x: 59, y: 58 },
    { id: '05',   name: 'Layer05（手前羽・右）',   file: 'hanhaba_Layer05.png',   z: 50, rot: -8,  scale: 100, x: 22, y: 35 },
    { id: '06',   name: 'Layer06（手前垂れ・基準）',file: 'hanhaba_Layer06.png',   z: 60, rot: -93, scale: 107, x: 74, y: 43 },
  ]);

  // ★ 2. 京袋帯パーツ定義（確定数値）
  const [kyobukuroOffsets, setKyobukuroOffsets] = useState([
    { id: 'hara',  name: '前腹（胴回り）', file: 'kyoubukurohara.png', z: 30, rot: 90, scale: 85,  x: 50,   y: 50 },
    { id: 'tare',  name: '垂れ先',         file: 'kyoubukurotare.png', z: 40, rot: -1, scale: 100, x: 76.5, y: 47 },
    { id: 'taiko', name: 'お太鼓',         file: 'kyoubukurotakio.png', z: 50, rot: 1,  scale: 100, x: 75.5, y: 47 },
  ]);

  // ★ 3. 着物パーツ定義（確定数値）
  const [kimonoOffsets, setKimonoOffsets] = useState([
    { id: 'usiromigoro', name: '後ろ身頃',     file: 'usiromigoro_75.png',   z: 2,  rot: -15, scale: 100, x: 50,   y: 50 },
    { id: 'hidarisode2', name: '左袖（奥）',   file: 'hidarisode2_175.png',  z: 3,  rot: 85,  scale: 100, x: 49,   y: 50 },
    { id: 'hidarisode',  name: '左袖（手前）', file: 'hidarisode_150.png',   z: 4,  rot: 60,  scale: 100, x: 49.5, y: 50 },
    { id: 'migisode',    name: '右袖',         file: 'migisode_165.png',     z: 5,  rot: 75,  scale: 100, x: 49,   y: 50 },
    { id: 'maemigoro2',  name: '前身頃（下）', file: 'maemigoro2_140.png',   z: 6,  rot: 75,  scale: 100, x: 45.5, y: 50 },
    { id: 'maemigoro',   name: '前身頃（上）', file: 'maemigoro_105.png',   z: 7,  rot: 15,  scale: 100, x: 50,   y: 50 },
    { id: 'maeokumi',    name: '前衽（おくみ）', file: 'maeokumi_110.png',   z: 8,  rot: 20,  scale: 100, x: 50,   y: 50 },
    { id: 'migieri',     name: '右衿',         file: 'migieri_65.png',       z: 9,  rot: -25, scale: 100, x: 47.5, y: 50 },
    { id: 'hidarieri',   name: '左衿',         file: 'hidarieri_117.png',    z: 10, rot: 31,  scale: 100, x: 52,   y: 50 },
  ]);

  const handleOffsetChange = (index: number, axis: 'x' | 'y' | 'rot' | 'scale', value: number) => {
    if (itemType === 'hanhaba') {
      setHanhabaOffsets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [axis]: value };
        return next;
      });
    } else if (itemType === 'kyobukuro') {
      setKyobukuroOffsets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [axis]: value };
        return next;
      });
    } else if (itemType === 'kimono') {
      setKimonoOffsets((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [axis]: value };
        return next;
      });
    }
  };

  const handleCopyCode = () => {
    let code = '';
    if (itemType === 'hanhaba') {
      code = `  const hanhabaLayers = [\n` +
        hanhabaOffsets.map((l) => `    { id: '${l.id}', file: '${l.file}', z: ${l.z}, rot: ${l.rot}, scale: ${l.scale}, bgX: '${l.x}%', bgY: '${l.y}%' },`).join('\n') +
        `\n  ];`;
    } else if (itemType === 'kyobukuro') {
      code = `  const kyobukuroLayers = [\n` +
        kyobukuroOffsets.map((l) => `    { id: '${l.id}', file: '${l.file}', z: ${l.z}, rot: ${l.rot}, scale: ${l.scale}, bgX: '${l.x}%', bgY: '${l.y}%' },`).join('\n') +
        `\n  ];`;
    } else if (itemType === 'kimono') {
      code = `  const kimonoParts = [\n` +
        kimonoOffsets.map((l) => `    { id: '${l.id}', file: '${l.file}', z: ${l.z}, rot: ${l.rot}, scale: ${l.scale}, bgX: '${l.x}%', bgY: '${l.y}%' },`).join('\n') +
        `\n  ];`;
    }
    navigator.clipboard.writeText(code);
    alert(`【${itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物'}】の確定コードをコピーしました。`);
  };

  if (!imageUrl) return null;

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);

  const baseScale = creationMode === 'geometric'
    ? bgSizeMm * UNIVERSAL_SCALE_FACTOR
    : 400 * UNIVERSAL_SCALE_FACTOR;

  const v = '32';

  // 半幅帯レイヤー描画
  const renderHanhabaLayers = () => (
    <div className="relative w-full h-full overflow-hidden">
      {hanhabaOffsets.map((layer) => (
        <div
          key={layer.id}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: layer.z,
            maskImage: `url('/${layer.file}?v=${v}')`,
            WebkitMaskImage: `url('/${layer.file}?v=${v}')`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-25%',
              left: '-25%',
              width: '150%',
              height: '150%',
              backgroundImage: `url(${effectivePatternUrl})`,
              backgroundSize: `${baseScale * (layer.scale / 100)}% auto`,
              backgroundRepeat: 'repeat',
              backgroundPosition: `${layer.x}% ${layer.y}%`,
              transform: `rotate(${layer.rot}deg)`,
              transformOrigin: 'center center',
              backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent',
              transition: 'background-position 0.05s ease-out, transform 0.05s ease-out, background-size 0.05s ease-out',
            }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 65,
          maskImage: `url('/hanhaba_Layer07.png?v=${v}')`,
          WebkitMaskImage: `url('/hanhaba_Layer07.png?v=${v}')`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      >
        <div className="w-full h-full" style={{ backgroundColor: obiLiningColor }} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 70,
          backgroundImage: `url('/hanhaba_Layer_kage.png?v=${v}')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
          opacity: 0.5,
        }}
      />
    </div>
  );

  // 京袋帯レイヤー描画
  const renderKyobukuroLayers = () => (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <img src={`/kyoubukurogrand.png?v=${v}`} alt="" className="w-full h-full object-contain" />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 20,
          maskImage: `url('/kyoubukurouraji.png?v=${v}')`,
          WebkitMaskImage: `url('/kyoubukurouraji.png?v=${v}')`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      >
        <div className="w-full h-full" style={{ backgroundColor: obiLiningColor }} />
      </div>

      {kyobukuroOffsets.map((layer) => {
        const isHara = layer.id === 'hara';
        const useIndividualHara = isHara && !!customHaraUrl;
        
        const layerPatternUrl = useIndividualHara ? customHaraUrl : effectivePatternUrl;
        const layerRot = useIndividualHara ? 0 : layer.rot;
        const layerBgPos = useIndividualHara ? 'center center' : `${layer.x}% ${layer.y}%`;
        const layerBgSize = useIndividualHara ? 'cover' : `${baseScale * (layer.scale / 100)}% auto`;
        const layerRepeat = useIndividualHara ? 'no-repeat' : 'repeat';

        return (
          <div
            key={layer.id}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: layer.z,
              maskImage: `url('/${layer.file}?v=${v}')`,
              WebkitMaskImage: `url('/${layer.file}?v=${v}')`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-25%',
                left: '-25%',
                width: '150%',
                height: '150%',
                backgroundImage: `url(${layerPatternUrl})`,
                backgroundSize: layerBgSize,
                backgroundRepeat: layerRepeat,
                backgroundPosition: layerBgPos,
                transform: `rotate(${layerRot}deg)`,
                transformOrigin: 'center center',
                backgroundColor: (!useIndividualHara && creationMode === 'geometric') ? geoBgColor : 'transparent',
                transition: 'background-position 0.05s ease-out, transform 0.05s ease-out, background-size 0.05s ease-out',
              }}
            />
          </div>
        );
      })}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 60,
          backgroundImage: `url('/kyoubukuromask.png?v=${v}')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
          opacity: 0.5,
        }}
      />
    </div>
  );

  // 着物レイヤー描画
  const renderKimonoLayers = () => (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <img src={`/haikei.png?v=${v}`} alt="" className="w-full h-full object-contain" />
      </div>

      {kimonoOffsets.map((part) => (
        <div
          key={part.id}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: part.z,
            maskImage: `url('/${part.file}?v=${v}')`,
            WebkitMaskImage: `url('/${part.file}?v=${v}')`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-25%',
              left: '-25%',
              width: '150%',
              height: '150%',
              backgroundImage: `url(${effectivePatternUrl})`,
              backgroundSize: `${baseScale * (part.scale / 100)}% auto`,
              backgroundRepeat: 'repeat',
              backgroundPosition: `${part.x}% ${part.y}%`,
              transform: `rotate(${part.rot}deg)`,
              transformOrigin: 'center center',
              backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent',
              transition: 'background-position 0.05s ease-out, transform 0.05s ease-out, background-size 0.05s ease-out',
            }}
          />
        </div>
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 11,
          maskImage: `url('/haneri.png?v=${v}')`,
          WebkitMaskImage: `url('/haneri.png?v=${v}')`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      >
        <div className="w-full h-full" style={{ backgroundColor: kimonoHaneriColor }} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 12,
          maskImage: `url('/obiage.png?v=${v}')`,
          WebkitMaskImage: `url('/obiage.png?v=${v}')`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      >
        <div className="w-full h-full" style={{ backgroundColor: kimonoObiageColor }} />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 13,
          maskImage: `url('/obi_2.png?v=${v}')`,
          WebkitMaskImage: `url('/obi_2.png?v=${v}')`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      >
        {customObiUrl ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${customObiUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: kimonoObiColor }} />
        )}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 14,
          backgroundImage: `url('/jyouzan.png?v=${v}')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          mixBlendMode: 'multiply',
          opacity: 0.5,
        }}
      />
    </div>
  );

  const currentOffsets = itemType === 'hanhaba'
    ? hanhabaOffsets
    : itemType === 'kyobukuro'
      ? kyobukuroOffsets
      : kimonoOffsets;

  const itemLabel = itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物';

  return (
    <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 sticky top-2 z-30 lg:top-8 flex flex-col gap-3">
      
      <div className="bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
        
        {/* ========================================================
            1. 仕立てアイテム大型セグメントタブ（高さ44px・極細線画）
           ======================================================== */}
        <div className="p-2 bg-stone-900 border-b border-stone-800">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-medium text-stone-400 tracking-wider">お仕立てアイテムを選択</span>
            <span className="text-[10px] text-stone-400 font-mono">1反からお仕立て</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-stone-950 p-1 rounded-md border border-stone-800">
            <button
              type="button"
              onClick={() => { handleItemTypeChange('hanhaba'); setActiveFloatPalette(null); }}
              className={`h-11 flex items-center justify-center gap-2 rounded text-xs font-bold transition-all ${
                itemType === 'hanhaba'
                  ? 'bg-white text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Icons.Hanhaba />
              <span>半幅帯</span>
            </button>

            <button
              type="button"
              onClick={() => { handleItemTypeChange('kyobukuro'); setActiveFloatPalette(null); }}
              className={`h-11 flex items-center justify-center gap-2 rounded text-xs font-bold transition-all ${
                itemType === 'kyobukuro'
                  ? 'bg-white text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Icons.Kyobukuro />
              <span>京袋帯</span>
            </button>

            <button
              type="button"
              onClick={() => { handleItemTypeChange('kimono'); setActiveFloatPalette(null); }}
              className={`h-11 flex items-center justify-center gap-2 rounded text-xs font-bold transition-all ${
                itemType === 'kimono'
                  ? 'bg-white text-stone-950 shadow-md scale-[1.01]'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Icons.Kimono />
              <span>着物</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            2. 表示モード切替タブ
           ======================================================== */}
        <div className="px-2 sm:px-3 py-2 border-b border-stone-200 bg-stone-50 flex gap-1.5">
          <button
            type="button"
            onClick={() => setDisplayMode('mockup')}
            className={`flex-1 h-9 flex items-center justify-center gap-1.5 px-1 sm:px-2 text-[11px] font-bold tracking-wide transition-all border rounded ${
              displayMode === 'mockup'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <span>{itemLabel}コーデ着用</span>
          </button>

          {itemType === 'kyobukuro' && (
            <button
              type="button"
              onClick={() => setDisplayMode('trim')}
              className={`flex-1 h-9 flex items-center justify-center gap-1.5 px-1 sm:px-2 text-[11px] font-bold tracking-wide transition-all border rounded ${
                displayMode === 'trim'
                  ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Icons.Scissors />
              <span>34cm 裁断</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDisplayMode('data')}
            className={`flex-1 h-9 flex items-center justify-center gap-1.5 px-1 sm:px-2 text-[11px] font-bold tracking-wide transition-all border rounded ${
              displayMode === 'data'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <Icons.Grid />
            <span>{itemType === 'hanhaba' ? '18cm 反物原画' : '40cm 反物原画'}</span>
          </button>
        </div>

        {/* ========================================================
            3. メイン描画エリア（スマホ幅いっぱいに最大化！）
           ======================================================== */}
        <div className="bg-[#e4e4e7] flex flex-col items-center justify-center p-1 sm:p-4 relative min-h-[340px]">
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative">
              
              {/* マッピング正方形枠（w-full max-w-[420px] でド迫力表示） */}
              <div className="relative w-full max-w-[420px] aspect-square bg-stone-100 shadow-md sm:rounded-sm overflow-hidden">
                
                {/* 1. マッピング画像（背面） */}
                <div ref={previewContainerRef} className="w-full h-full relative overflow-hidden">
                  {itemType === 'hanhaba' && renderHanhabaLayers()}
                  {itemType === 'kyobukuro' && renderKyobukuroLayers()}
                  {itemType === 'kimono' && renderKimonoLayers()}
                </div>

                {/* 2. 【両端フロート】オーバーレイコントロール（衿元・中央を邪魔しない配置） */}
                <div className="absolute inset-0 pointer-events-none z-20">
                  
                  {/* 左端寄せフロート：パーツカラー指定ボタン群 */}
                  <div className="pointer-events-auto absolute top-2 left-2 flex flex-col sm:flex-row gap-1 bg-white/90 backdrop-blur-md p-1 rounded border border-stone-300/80 shadow-md">
                    {itemType === 'kimono' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'haneri' ? null : 'haneri')}
                          className={`flex items-center gap-1 px-1.5 py-1 text-[10px] font-bold rounded border transition-all ${
                            activeFloatPalette === 'haneri' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-stone-400 shrink-0 inline-block" style={{ backgroundColor: kimonoHaneriColor }} />
                          <span>半衿</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'obiage' ? null : 'obiage')}
                          className={`flex items-center gap-1 px-1.5 py-1 text-[10px] font-bold rounded border transition-all ${
                            activeFloatPalette === 'obiage' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-stone-400 shrink-0 inline-block" style={{ backgroundColor: kimonoObiageColor }} />
                          <span>帯揚</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'obi' ? null : 'obi')}
                          className={`flex items-center gap-1 px-1.5 py-1 text-[10px] font-bold rounded border transition-all ${
                            activeFloatPalette === 'obi' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-stone-400 shrink-0 inline-block" style={{ backgroundColor: kimonoObiColor }} />
                          <span>帯{customObiUrl ? '(画)' : ''}</span>
                        </button>
                      </>
                    ) : itemType === 'kyobukuro' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'lining' ? null : 'lining')}
                          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                            activeFloatPalette === 'lining' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-stone-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                          <span>裏地</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'hara' ? null : 'hara')}
                          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                            activeFloatPalette === 'hara' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-stone-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                          <span>前腹{customHaraUrl ? '(画)' : ''}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveFloatPalette(activeFloatPalette === 'lining' ? null : 'lining')}
                        className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded border transition-all ${
                          activeFloatPalette === 'lining' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-stone-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                        <span>裏地</span>
                      </button>
                    )}
                  </div>

                  {/* 右端寄せフロート：原寸拡大ボタン */}
                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(true)}
                    className="pointer-events-auto absolute top-2 right-2 flex items-center gap-1 bg-stone-950/85 text-white px-2.5 py-1.5 rounded-full text-[10px] font-bold shadow-md transition-all hover:bg-stone-900 active:scale-95 border border-white/20 backdrop-blur-sm"
                  >
                    <Icons.Zoom />
                    <span>原寸拡大</span>
                  </button>

                  {/* 展開カラーパレット */}
                  {activeFloatPalette && (
                    <div className="pointer-events-auto absolute top-12 left-2 right-2 bg-white/95 backdrop-blur-md border border-stone-900 p-3 rounded-md shadow-2xl animate-fade-in max-w-[340px] z-30">
                      <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-stone-200">
                        <span className="text-[11px] font-bold text-stone-900">
                          {activeFloatPalette === 'lining' && '帯の裏地色を選択'}
                          {activeFloatPalette === 'haneri' && '半衿の色を選択'}
                          {activeFloatPalette === 'obiage' && '帯揚の色を選択'}
                          {activeFloatPalette === 'obi' && '着物の帯を指定'}
                          {activeFloatPalette === 'hara' && '京袋帯の前腹（胴回り）を指定'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(null)}
                          className="text-stone-400 hover:text-stone-900 p-0.5"
                        >
                          <Icons.Close />
                        </button>
                      </div>

                      {activeFloatPalette === 'hara' && (
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] text-stone-500 leading-normal">
                            太鼓柄と異なるデザインを前腹（お腹正面）に出したい場合に個別設定できます。
                          </p>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => { setCustomHaraUrl?.(null); setActiveFloatPalette(null); }}
                              className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${!customHaraUrl ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
                            >
                              太鼓柄と連動
                            </button>
                            <label className={`flex-1 py-1.5 text-[10px] font-bold text-center rounded border cursor-pointer ${customHaraUrl ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
                              画像アップロード
                              <input type="file" accept="image/*" onChange={(e) => { handleCustomHaraUpload?.(e); setActiveFloatPalette(null); }} className="hidden" />
                            </label>
                          </div>
                        </div>
                      )}

                      {activeFloatPalette === 'obi' && (
                        <div className="flex gap-1.5 mb-2 pb-1.5 border-b border-stone-100">
                          <button
                            type="button"
                            onClick={() => setCustomObiUrl?.(null)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${!customObiUrl ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}
                          >
                            伝統色無地
                          </button>
                          <label className={`flex-1 py-1.5 text-[10px] font-bold text-center rounded border cursor-pointer ${customObiUrl ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
                            画像アップロード
                            <input type="file" accept="image/*" onChange={(e) => { handleCustomObiUpload?.(e); setActiveFloatPalette(null); }} className="hidden" />
                          </label>
                        </div>
                      )}

                      {!(activeFloatPalette === 'hara' || (activeFloatPalette === 'obi' && customObiUrl)) && (
                        <div className="max-h-[160px] overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 gap-1">
                          {TRADITIONAL_COLORS.map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => {
                                if (activeFloatPalette === 'lining') setObiLiningColor(col.hex);
                                if (activeFloatPalette === 'haneri') setKimonoHaneriColor(col.hex);
                                if (activeFloatPalette === 'obiage') setKimonoObiageColor(col.hex);
                                if (activeFloatPalette === 'obi') {
                                  setKimonoObiColor(col.hex);
                                  setCustomObiUrl?.(null);
                                }
                                setActiveFloatPalette(null);
                              }}
                              className="relative h-8 p-1 flex flex-col justify-end text-left border border-stone-200 rounded shadow-sm hover:scale-95 transition-transform"
                              style={{ backgroundColor: col.hex }}
                            >
                              <span className={`text-[8px] font-bold truncate leading-none ${col.isDark ? 'text-white' : 'text-stone-900'}`}>
                                {col.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* マッピング画像保存ボタン */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleDownloadMapping}
                  disabled={mockupSubmitting}
                  className={`h-9 px-4 text-xs font-bold tracking-wider rounded shadow transition-all flex items-center gap-2 ${
                    mockupSubmitting ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95'
                  }`}
                >
                  <Icons.Download />
                  <span>{mockupSubmitting ? '画像を作成中...' : 'プレビュー画像を保存'}</span>
                </button>
              </div>

            </div>
          )}

          {/* 京袋帯 34cm 裁断イメージ */}
          {displayMode === 'trim' && itemType === 'kyobukuro' && (
            <div className="w-full flex flex-col items-center animate-fade-in py-2">
              <div className="relative w-full max-w-[340px] border border-stone-300 bg-white shadow-md overflow-hidden rounded-sm" style={{ aspectRatio: '34 / 40' }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${effectivePatternUrl})`,
                    backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 340) * 100}% auto` : `${(400 / 340) * 100}% auto`,
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'repeat',
                    backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff',
                  }}
                />
              </div>
              <p className="mt-2 text-[10px] text-stone-500">※幅34cmの仕立て幅にトリミングされたイメージです。</p>
            </div>
          )}

          {/* 反物・プリント原画データ */}
          {displayMode === 'data' && (
            <div className="flex flex-col items-center w-full animate-fade-in py-2">
              {itemType === 'hanhaba' ? (
                <div className="relative mx-auto border border-stone-300 bg-white shadow-md overflow-hidden rounded-sm" style={{ width: '216px', height: '480px' }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${effectivePatternUrl})`,
                      backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 180) * 100}% auto` : `${(400 / 180) * 100}% auto`,
                      backgroundPosition: 'center top',
                      backgroundRepeat: 'repeat',
                      backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff',
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full max-w-[380px] aspect-square mx-auto border border-stone-300 bg-white shadow-md overflow-hidden rounded-sm">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${effectivePatternUrl})`,
                      backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : '100% auto',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'repeat',
                      backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff',
                    }}
                  />
                </div>
              )}
              <p className="mt-2 text-[10px] text-stone-500">※新潟十日町ファクトリー（デジタル捺染機モナリザ）へ送信される正方形原画データです。</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          4. 【工房スタッフ専用】柄あわせ微調整ツール
         ======================================================== */}
      <div className="text-right">
        <button
          type="button"
          onClick={() => setShowTuningPanel(!showTuningPanel)}
          className="text-[11px] text-stone-400 hover:text-stone-700 tracking-wider inline-flex items-center gap-1.5 transition-colors"
        >
          <Icons.Tune />
          <span>{showTuningPanel ? '調整パネルを閉じる' : '工房用：柄あわせ微調整'}</span>
        </button>

        {showTuningPanel && (
          <div className="mt-2 bg-white border border-stone-900 rounded-lg p-4 shadow-xl text-left animate-fade-in">
            <div className="mb-3 pb-2 border-b border-stone-200">
              <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                <Icons.Tune />
                <span>柄あわせ調整シミュレーター（{itemLabel}）</span>
              </h4>
              <p className="text-[10px] text-stone-500 leading-normal">
                生地を裁断する前に柄の繋がりを確認・微調整するためのシミュレーターです。お客様が操作されても注文データには影響しません。
              </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {currentOffsets.map((layer, idx) => (
                <div key={layer.id} className="p-3 bg-stone-50 border border-stone-200 rounded">
                  <div className="flex justify-between items-center mb-2 pb-1 border-b border-stone-200">
                    <span className="text-[11px] font-bold text-stone-800">{layer.name}</span>
                    <span className="font-mono text-stone-400 text-[10px]">{layer.file}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                        <span>X（横位置）</span>
                        <span className="font-mono font-bold text-stone-900">{layer.x}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="0.5"
                        value={layer.x}
                        onChange={(e) => handleOffsetChange(idx, 'x', Number(e.target.value))}
                        className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                        <span>Y（縦位置）</span>
                        <span className="font-mono font-bold text-stone-900">{layer.y}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="0.5"
                        value={layer.y}
                        onChange={(e) => handleOffsetChange(idx, 'y', Number(e.target.value))}
                        className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                        <span>角度（rot）</span>
                        <span className="font-mono font-bold text-stone-900">{layer.rot}°</span>
                      </div>
                      <input
                        type="range" min="-180" max="180" step="1"
                        value={layer.rot}
                        onChange={(e) => handleOffsetChange(idx, 'rot', Number(e.target.value))}
                        className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                        <span>倍率（scale）</span>
                        <span className="font-mono font-bold text-stone-900">{layer.scale}%</span>
                      </div>
                      <input
                        type="range" min="50" max="150" step="1"
                        value={layer.scale}
                        onChange={(e) => handleOffsetChange(idx, 'scale', Number(e.target.value))}
                        className="w-full accent-stone-900 cursor-pointer h-1.5 bg-stone-200 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2"
              >
                <Icons.Copy />
                <span>【{itemLabel}】の確定数値をコピー</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          5. 【全画面原寸拡大モーダル】
         ======================================================== */}
      {isZoomModalOpen && (
        <div 
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div 
            className="relative bg-white p-4 sm:p-6 rounded-lg max-w-[95vw] max-h-[95vh] overflow-auto shadow-2xl flex flex-col items-center border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-3 right-3 text-stone-400 hover:text-stone-950 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center transition-colors"
            >
              <Icons.Close />
            </button>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-4 tracking-wider">
              【原寸拡大プレビュー】{itemLabel}
            </h3>
            <div className="w-[300px] sm:w-[500px] lg:w-[600px] aspect-square bg-[#e4e4e7] relative overflow-hidden shadow-inner border border-stone-300 rounded">
              {itemType === 'hanhaba' && renderHanhabaLayers()}
              {itemType === 'kyobukuro' && renderKyobukuroLayers()}
              {itemType === 'kimono' && renderKimonoLayers()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. 【右下丸型ミニFAB】邪魔にならないスマートなスクロール追従
         ======================================================== */}
      {isScrolledPast && (
        <div className="fixed bottom-6 right-4 z-40 flex flex-col items-center gap-2.5 animate-fade-in">
          {/* 丸型サムネイル（タップで原寸拡大モーダルが開く） */}
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(true)}
            className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-2xl bg-stone-900 hover:scale-110 active:scale-95 transition-transform"
            title="クリックで拡大プレビュー"
          >
            <img src={effectivePatternUrl} alt="現在の図案" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white">
              <Icons.Zoom />
            </div>
          </button>

          {/* 上へ戻る丸ボタン */}
          <button
            type="button"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-white text-stone-900 border border-stone-300 shadow-xl flex items-center justify-center hover:bg-stone-50 active:scale-95 transition-transform"
            title="プレビューへ戻る"
          >
            <Icons.ArrowUp />
          </button>
        </div>
      )}
    </div>
  );
}
