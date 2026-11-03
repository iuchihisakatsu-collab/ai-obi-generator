// app/components/preview/PreviewArea.tsx
'use client';

import React, { useState } from 'react';
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

  // ★ 1. 半幅帯パーツ定義（確定数値を初期値に完全焼き付け）
  const [hanhabaOffsets, setHanhabaOffsets] = useState([
    { id: '01_a', name: 'Layer01_a（奥羽・右側）', file: 'hanhaba_Layer01_a.png', z: 10, rot: 1,   scale: 111, x: 69, y: 50 },
    { id: '01_b', name: 'Layer01_b（奥羽・左下）', file: 'hanhaba_Layer01_b.png', z: 15, rot: 3,   scale: 100, x: 33, y: 50 },
    { id: '02',   name: 'Layer02（奥羽・右）',     file: 'hanhaba_Layer02.png',   z: 20, rot: 5,   scale: 108, x: 63, y: 56 },
    { id: '03',   name: 'Layer03（奥垂れ）',       file: 'hanhaba_Layer03.png',   z: 30, rot: 13,  scale: 100, x: 32, y: 40 },
    { id: '04',   name: 'Layer04（手前羽・左）',   file: 'hanhaba_Layer04.png',   z: 40, rot: 3,   scale: 109, x: 59, y: 58 },
    { id: '05',   name: 'Layer05（手前羽・右）',   file: 'hanhaba_Layer05.png',   z: 50, rot: -8,  scale: 100, x: 22, y: 35 },
    { id: '06',   name: 'Layer06（手前垂れ・基準）',file: 'hanhaba_Layer06.png',   z: 60, rot: -93, scale: 107, x: 74, y: 43 },
  ]);

  // ★ 2. 京袋帯パーツ定義（4軸調整可能State）
  const [kyobukuroOffsets, setKyobukuroOffsets] = useState([
    { id: 'hara',  name: '前腹（胴回り）', file: 'kyoubukurohara.png', z: 30, rot: 271, scale: 100, x: 50,   y: 50 },
    { id: 'tare',  name: '垂れ先',         file: 'kyoubukurotare.png', z: 40, rot: -1,  scale: 100, x: 76.5, y: 47 },
    { id: 'taiko', name: 'お太鼓',         file: 'kyoubukurotakio.png', z: 50, rot: 2,   scale: 100, x: 76.5, y: 47 },
  ]);

  // ★ 3. 着物パーツ定義（分度器実測角度ルールをベースにした4軸調整可能State）
  const [kimonoOffsets, setKimonoOffsets] = useState([
    { id: 'usiromigoro', name: '後ろ身頃',     file: 'usiromigoro_75.png',   z: 2,  rot: -15, scale: 100, x: 50, y: 50 },
    { id: 'hidarisode2', name: '左袖（奥）',   file: 'hidarisode2_175.png',  z: 3,  rot: 85,  scale: 100, x: 50, y: 50 },
    { id: 'hidarisode',  name: '左袖（手前）', file: 'hidarisode_150.png',   z: 4,  rot: 60,  scale: 100, x: 50, y: 50 },
    { id: 'migisode',    name: '右袖',         file: 'migisode_165.png',     z: 5,  rot: 75,  scale: 100, x: 50, y: 50 },
    { id: 'maemigoro2',  name: '前身頃（下）', file: 'maemigoro2_140.png',   z: 6,  rot: 50,  scale: 100, x: 50, y: 50 },
    { id: 'maemigoro',   name: '前身頃（上）', file: 'maemigoro_105.png',   z: 7,  rot: 15,  scale: 100, x: 50, y: 50 },
    { id: 'maeokumi',    name: '前衽（おくみ）', file: 'maeokumi_110.png',   z: 8,  rot: 20,  scale: 100, x: 50, y: 50 },
    { id: 'migieri',     name: '右衿',         file: 'migieri_65.png',       z: 9,  rot: -25, scale: 100, x: 50, y: 50 },
    { id: 'hidarieri',   name: '左衿',         file: 'hidarieri_117.png',    z: 10, rot: 27,  scale: 100, x: 50, y: 50 },
  ]);

  // アイテム別のスライダー変更ハンドラ
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

  // アイテム別の確定コードコピーハンドラ
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
    alert(`【${itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物'}】の確定コードをコピーしました！チャットに貼り付けてください。`);
  };

  if (!imageUrl) return null;

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);

  // ★ 全アイテム共通・実寸ロック黄金比率（マスター400mm角基準）
  const baseScale = creationMode === 'geometric'
    ? bgSizeMm * UNIVERSAL_SCALE_FACTOR
    : 400 * UNIVERSAL_SCALE_FACTOR;

  const v = '31';

  // 半幅帯マッピングのレイヤー描画
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

  // 京袋帯マッピングのレイヤー描画（スライダー連動）
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

  // 着物マッピングのレイヤー描画（スライダー連動）
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

  // 現在選択中のアイテムに応じたオフセットリストを取得
  const currentOffsets = itemType === 'hanhaba'
    ? hanhabaOffsets
    : itemType === 'kyobukuro'
      ? kyobukuroOffsets
      : kimonoOffsets;

  return (
    <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 sticky top-2 z-30 lg:top-8 flex flex-col gap-3">
      <div className="bg-white border border-zinc-300 shadow-xl overflow-hidden animate-fade-in">
        
        {/* アイテム切替 */}
        <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider">仕立てアイテム：</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { handleItemTypeChange('hanhaba'); setActiveFloatPalette(null); }}
              className={`px-3 py-1 text-[11px] font-black rounded transition-all ${
                itemType === 'hanhaba' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              半幅帯
            </button>
            <button
              type="button"
              onClick={() => { handleItemTypeChange('kyobukuro'); setActiveFloatPalette(null); }}
              className={`px-3 py-1 text-[11px] font-black rounded transition-all ${
                itemType === 'kyobukuro' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              京袋帯
            </button>
            <button
              type="button"
              onClick={() => { handleItemTypeChange('kimono'); setActiveFloatPalette(null); }}
              className={`px-3 py-1 text-[11px] font-black rounded transition-all ${
                itemType === 'kimono' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              着物
            </button>
          </div>
        </div>

        {/* 表示タブ */}
        <div className="px-3 py-2 border-b border-zinc-200 bg-zinc-100 flex gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setDisplayMode('mockup')}
            className={`flex-1 px-3 py-1.5 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${
              displayMode === 'mockup' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-300'
            }`}
          >
            {itemType === 'hanhaba' && '半幅帯マッピング'}
            {itemType === 'kyobukuro' && '京袋帯マッピング'}
            {itemType === 'kimono' && '着物マッピング'}
          </button>

          {itemType === 'kyobukuro' && (
            <button
              type="button"
              onClick={() => setDisplayMode('trim')}
              className={`flex-1 px-3 py-1.5 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${
                displayMode === 'trim' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-300'
              }`}
            >
              34cm 裁断イメージ
            </button>
          )}

          <button
            type="button"
            onClick={() => setDisplayMode('data')}
            className={`flex-1 px-3 py-1.5 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${
              displayMode === 'data' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-300'
            }`}
          >
            {itemType === 'hanhaba' ? '18cm プリントデータ' : '40cm 反物データ'}
          </button>
        </div>

        {/* 描画エリア */}
        <div className="bg-[#e4e4e7] flex flex-col items-center justify-center p-3 sm:p-5 relative shadow-inner min-h-[320px]">
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative">
              
              {/* 全アイテム共通枠サイズ */}
              <div className="relative mx-auto drop-shadow-xl w-[240px] sm:w-[360px] aspect-square">
                
                {/* 1. マッピング画像（背面に描画） */}
                <div ref={previewContainerRef} className="w-full h-full relative overflow-hidden">
                  {itemType === 'hanhaba' && renderHanhabaLayers()}
                  {itemType === 'kyobukuro' && renderKyobukuroLayers()}
                  {itemType === 'kimono' && renderKimonoLayers()}
                </div>

                {/* 2. 最前面オーバーレイ層（z-[9999]） */}
                <div className="absolute inset-0 pointer-events-none z-[9999]">
                  
                  {/* 拡大ボタン（右上） */}
                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(true)}
                    className="pointer-events-auto absolute top-2 right-2 flex items-center gap-1 bg-zinc-950 text-white px-2.5 py-1 rounded-full text-[10px] font-black shadow-2xl transition-transform hover:scale-105 active:scale-95 border border-white/30"
                  >
                    <span>🔍</span>
                    <span>拡大</span>
                  </button>

                  {/* コーディネート・裏地・パーツ個別指定ボタンバー（左上） */}
                  <div className="pointer-events-auto absolute top-2 left-2 flex flex-wrap gap-1 bg-white/95 backdrop-blur-md p-1 rounded-sm border border-zinc-400 shadow-2xl">
                    {itemType === 'kimono' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'haneri' ? null : 'haneri')}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-all ${
                            activeFloatPalette === 'haneri' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: kimonoHaneriColor }} />
                          <span>半衿</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'obiage' ? null : 'obiage')}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-all ${
                            activeFloatPalette === 'obiage' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: kimonoObiageColor }} />
                          <span>帯揚</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'obi' ? null : 'obi')}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-all ${
                            activeFloatPalette === 'obi' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: kimonoObiColor }} />
                          <span>帯{customObiUrl ? '(画像)' : ''}</span>
                        </button>
                      </>
                    ) : itemType === 'kyobukuro' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'lining' ? null : 'lining')}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-all ${
                            activeFloatPalette === 'lining' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                          <span>裏地の色</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(activeFloatPalette === 'hara' ? null : 'hara')}
                          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-all ${
                            activeFloatPalette === 'hara' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                          <span>前腹{customHaraUrl ? '(画像)' : ''}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveFloatPalette(activeFloatPalette === 'lining' ? null : 'lining')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-all ${
                          activeFloatPalette === 'lining' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                        <span>裏地の色</span>
                      </button>
                    )}
                  </div>

                  {/* 展開パレット */}
                  {activeFloatPalette && (
                    <div className="pointer-events-auto absolute top-10 left-2 right-2 bg-white border-2 border-zinc-900 p-2.5 rounded shadow-2xl animate-fade-in max-w-[340px]">
                      <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-zinc-200">
                        <span className="text-[10px] font-black text-zinc-900">
                          {activeFloatPalette === 'lining' && '帯の裏地色を選択'}
                          {activeFloatPalette === 'haneri' && '半衿の色を選択'}
                          {activeFloatPalette === 'obiage' && '帯揚の色を選択'}
                          {activeFloatPalette === 'obi' && '着物の帯を指定'}
                          {activeFloatPalette === 'hara' && '京袋帯の前腹（胴回り）を指定'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveFloatPalette(null)}
                          className="text-[11px] font-black text-zinc-500 hover:text-zinc-950 px-1"
                        >
                          ✕ 閉じる
                        </button>
                      </div>

                      {activeFloatPalette === 'hara' && (
                        <div className="flex flex-col gap-2">
                          <p className="text-[9px] text-zinc-500 leading-normal">
                            太鼓柄と別のデザインを前腹（お腹正面）に出したい場合に画像を個別設定できます。（回転せずそのまま配置されます）
                          </p>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => { setCustomHaraUrl?.(null); setActiveFloatPalette(null); }}
                              className={`flex-1 py-1 text-[10px] font-bold rounded border ${!customHaraUrl ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}
                            >
                              太鼓柄と連動（自動）
                            </button>
                            <label className={`flex-1 py-1 text-[10px] font-bold text-center rounded border cursor-pointer ${customHaraUrl ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}>
                              画像アップロード
                              <input type="file" accept="image/*" onChange={(e) => { handleCustomHaraUpload?.(e); setActiveFloatPalette(null); }} className="hidden" />
                            </label>
                          </div>
                        </div>
                      )}

                      {activeFloatPalette === 'obi' && (
                        <div className="flex gap-1 mb-2 pb-1 border-b border-zinc-100">
                          <button
                            type="button"
                            onClick={() => setCustomObiUrl?.(null)}
                            className={`flex-1 py-1 text-[10px] font-bold rounded border ${!customObiUrl ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}
                          >
                            伝統色無地
                          </button>
                          <label className={`flex-1 py-1 text-[10px] font-bold text-center rounded border cursor-pointer ${customObiUrl ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'}`}>
                            画像アップロード
                            <input type="file" accept="image/*" onChange={(e) => { handleCustomObiUpload?.(e); setActiveFloatPalette(null); }} className="hidden" />
                          </label>
                        </div>
                      )}

                      {!(activeFloatPalette === 'hara' || (activeFloatPalette === 'obi' && customObiUrl)) && (
                        <div className="max-h-[150px] overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 gap-1">
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
                              className="relative h-8 p-0.5 flex flex-col justify-end text-left border border-zinc-300 rounded-sm shadow-sm hover:scale-95 transition-transform"
                              style={{ backgroundColor: col.hex }}
                            >
                              <span className={`text-[7px] font-bold truncate leading-none ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
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
                  className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold tracking-wider rounded-sm shadow-sm transition-colors ${
                    mockupSubmitting ? 'bg-zinc-400 text-zinc-100 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {mockupSubmitting ? '画像を作成中...' : '↓ マッピング画像を保存'}
                </button>
              </div>

            </div>
          )}

          {/* トリム表示（京袋帯 34cm 裁断イメージ） */}
          {displayMode === 'trim' && itemType === 'kyobukuro' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="relative w-[272px] sm:w-[340px] mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden" style={{ aspectRatio: '34 / 40' }}>
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
            </div>
          )}

          {/* 反物・プリントデータ表示 */}
          {displayMode === 'data' && (
            <div className="flex flex-col items-center w-full animate-fade-in">
              {itemType === 'hanhaba' ? (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden" style={{ width: '216px', height: '480px' }}>
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
                <div className="relative w-[260px] sm:w-[400px] aspect-square mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden">
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
            </div>
          )}
        </div>
      </div>

      {/* ★★★ 【工房スタッフ専用】全アイテム連動 4軸調整ツール（最下部リンク） ★★★ */}
      <div className="mt-2 text-right">
        <button
          type="button"
          onClick={() => setShowTuningPanel(!showTuningPanel)}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 tracking-wider inline-flex items-center gap-1"
        >
          {showTuningPanel ? '✕ 閉じる' : '柄あわせ調整'}
        </button>

        {showTuningPanel && (
          <div className="mt-2 bg-white border-2 border-zinc-900 rounded p-4 shadow-2xl text-left animate-fade-in">
            <div className="mb-3 pb-2 border-b border-zinc-200">
              <h4 className="text-xs font-black text-zinc-900 mb-1 flex items-center gap-1.5">
                <span>🛠️</span>
                <span>
                  工房スタッフ専用：柄あわせ調整ツール（{itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物'}）
                </span>
              </h4>
              <p className="text-[9px] text-zinc-500 leading-normal">
                生地を裁断する前に、帯や着物の柄（送り）が美しく繋がるかを確認・微調整するためのシミュレーターです。お客様が操作されても注文データには影響しません。
              </p>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300">
              {currentOffsets.map((layer, idx) => (
                <div key={layer.id} className="p-3 bg-zinc-50 border border-zinc-300 rounded shadow-sm">
                  <div className="flex justify-between items-center mb-2 pb-1 border-b border-zinc-200">
                    <span className="text-[11px] font-black text-zinc-800">{layer.name}</span>
                    <span className="font-mono text-zinc-400 text-[9px]">{layer.file}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {/* X (横) */}
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-600 mb-1">
                        <span>X（横位置）</span>
                        <span className="font-mono font-bold text-zinc-900">{layer.x}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="0.5"
                        value={layer.x}
                        onChange={(e) => handleOffsetChange(idx, 'x', Number(e.target.value))}
                        className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                      />
                    </div>

                    {/* Y (縦) */}
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-600 mb-1">
                        <span>Y（縦位置）</span>
                        <span className="font-mono font-bold text-zinc-900">{layer.y}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="0.5"
                        value={layer.y}
                        onChange={(e) => handleOffsetChange(idx, 'y', Number(e.target.value))}
                        className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                      />
                    </div>

                    {/* 角度 (rot) */}
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-600 mb-1">
                        <span>角度（rot）</span>
                        <span className="font-mono font-bold text-zinc-900">{layer.rot}°</span>
                      </div>
                      <input
                        type="range" min="-180" max="180" step="1"
                        value={layer.rot}
                        onChange={(e) => handleOffsetChange(idx, 'rot', Number(e.target.value))}
                        className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                      />
                    </div>

                    {/* スケール (scale) */}
                    <div>
                      <div className="flex justify-between text-[9px] text-zinc-600 mb-1">
                        <span>倍率（scale）</span>
                        <span className="font-mono font-bold text-zinc-900">{layer.scale}%</span>
                      </div>
                      <input
                        type="range" min="50" max="150" step="1"
                        value={layer.scale}
                        onChange={(e) => handleOffsetChange(idx, 'scale', Number(e.target.value))}
                        className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 mt-2 border-t border-zinc-200">
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-bold rounded shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>📋</span>
                <span>【{itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物'}】の確定数値をコピー</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 全画面拡大モーダル */}
      {isZoomModalOpen && (
        <div 
          style={{ zIndex: 99999 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div 
            className="relative bg-white p-4 sm:p-6 rounded-lg max-w-[95vw] max-h-[95vh] overflow-auto shadow-2xl flex flex-col items-center border border-zinc-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-950 text-base font-black w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
            >
              ✕
            </button>
            <h3 className="text-xs sm:text-sm font-black text-zinc-900 mb-4 tracking-widest">
              【原寸拡大プレビュー】{itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物'}
            </h3>
            <div className="w-[300px] sm:w-[500px] lg:w-[600px] aspect-square bg-[#e4e4e7] relative overflow-hidden shadow-inner border border-zinc-300">
              {itemType === 'hanhaba' && renderHanhabaLayers()}
              {itemType === 'kyobukuro' && renderKyobukuroLayers()}
              {itemType === 'kimono' && renderKimonoLayers()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
