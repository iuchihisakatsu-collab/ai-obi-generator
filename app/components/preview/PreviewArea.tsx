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
    mockupSubmitting,
    previewRef, previewContainerRef,
    handleItemTypeChange, setDisplayMode,
    handleDownloadMapping,
    UNIVERSAL_SCALE_FACTOR,
  } = props;

  const [activeFloatPalette, setActiveFloatPalette] = useState<'lining' | 'haneri' | 'obiage' | 'obi' | null>(null);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  if (!imageUrl) return null;

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
  const patternSize = creationMode === 'geometric'
    ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto`
    : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;

  const v = '30';

  const kimonoParts = [
    { id: 'usiromigoro', file: 'usiromigoro_75.png', angle: 75, z: 2 },
    { id: 'hidarisode2', file: 'hidarisode2_175.png', angle: 175, z: 3 },
    { id: 'hidarisode', file: 'hidarisode_150.png', angle: 150, z: 4 },
    { id: 'migisode', file: 'migisode_165.png', angle: 165, z: 5 },
    { id: 'maemigoro2', file: 'maemigoro2_140.png', angle: 140, z: 6 },
    { id: 'maemigoro', file: 'maemigoro_105.png', angle: 105, z: 7 },
    { id: 'maeokumi', file: 'maeokumi_110.png', angle: 110, z: 8 },
    { id: 'migieri', file: 'migieri_65.png', angle: 65, z: 9 },
    { id: 'hidarieri', file: 'hidarieri_117.png', angle: 117, z: 10 },
  ];

  // 着物マッピングの共通レンダラー
  const renderKimonoContent = () => (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <img src={`/haikei.png?v=${v}`} alt="" className="w-full h-full object-contain" />
      </div>

      {kimonoParts.map((part) => (
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
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              backgroundImage: `url(${effectivePatternUrl})`,
              backgroundSize: patternSize,
              backgroundRepeat: 'repeat',
              backgroundPosition: 'center center',
              transform: `rotate(${part.angle - 90}deg)`,
              transformOrigin: 'center center',
              backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent',
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

  return (
    <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 sticky top-2 z-30 lg:top-8 flex flex-col gap-3">
      <div className="bg-white border border-zinc-300 shadow-xl overflow-hidden animate-fade-in">
        
        {/* アイテム切替バー */}
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

        {/* プレビュー表示タブ */}
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
        <div className="bg-[#e4e4e7] flex flex-col items-center justify-center p-3 sm:p-5 relative shadow-inner overflow-hidden min-h-[320px]">
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative">
              
              {/* マッピング画像コンテナ（フロート配置の基準親要素） */}
              <div className="relative mx-auto drop-shadow-xl">
                
                {/* ★★★ 1. 拡大フローティングボタン（右上に配置） ★★★ */}
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="absolute top-2 right-2 z-50 flex items-center gap-1 bg-zinc-900/80 hover:bg-zinc-900 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <span>🔍</span>
                  <span>拡大</span>
                </button>

                {/* ★★★ 2. コーディネート・裏地フローティングバー（左上に配置） ★★★ */}
                <div className="absolute top-2 left-2 z-50 flex flex-wrap gap-1 bg-white/90 backdrop-blur-md p-1 rounded border border-zinc-300/80 shadow-md">
                  {itemType === 'kimono' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveFloatPalette(activeFloatPalette === 'haneri' ? null : 'haneri')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${
                          activeFloatPalette === 'haneri' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white/80 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: kimonoHaneriColor }} />
                        <span>半衿</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFloatPalette(activeFloatPalette === 'obiage' ? null : 'obiage')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${
                          activeFloatPalette === 'obiage' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white/80 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: kimonoObiageColor }} />
                        <span>帯揚</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFloatPalette(activeFloatPalette === 'obi' ? null : 'obi')}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${
                          activeFloatPalette === 'obi' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white/80 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: kimonoObiColor }} />
                        <span>帯{customObiUrl ? '(画像)' : ''}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveFloatPalette(activeFloatPalette === 'lining' ? null : 'lining')}
                      className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${
                        activeFloatPalette === 'lining' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white/80 text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-zinc-400 shrink-0 inline-block" style={{ backgroundColor: obiLiningColor }} />
                      <span>裏地の色</span>
                    </button>
                  )}
                </div>

                {/* ★★★ 3. 画像の上にフロート展開する伝統色パレット ★★★ */}
                {activeFloatPalette && (
                  <div className="absolute top-10 left-2 right-2 z-50 bg-white/95 backdrop-blur-md border border-zinc-300 p-2.5 rounded shadow-2xl animate-fade-in max-w-[340px]">
                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-zinc-200">
                      <span className="text-[10px] font-bold text-zinc-800">
                        {activeFloatPalette === 'lining' && '帯の裏地色を選択'}
                        {activeFloatPalette === 'haneri' && '半衿の色を選択'}
                        {activeFloatPalette === 'obiage' && '帯揚の色を選択'}
                        {activeFloatPalette === 'obi' && '帯の指定'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveFloatPalette(null)}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800"
                      >
                        ✕ 閉じる
                      </button>
                    </div>

                    {activeFloatPalette === 'obi' && (
                      <div className="flex gap-1 mb-2 pb-1 border-b border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setCustomObiUrl?.(null)}
                          className={`flex-1 py-0.5 text-[9px] font-bold rounded border ${!customObiUrl ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}
                        >
                          伝統色無地
                        </button>
                        <label className={`flex-1 py-0.5 text-[9px] font-bold text-center rounded border cursor-pointer ${customObiUrl ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                          画像アップロード
                          <input type="file" accept="image/*" onChange={handleCustomObiUpload} className="hidden" />
                        </label>
                      </div>
                    )}

                    {!(activeFloatPalette === 'obi' && customObiUrl) && (
                      <div className="max-h-[140px] overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 gap-1">
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
                            className="relative h-7 p-0.5 flex flex-col justify-end text-left border border-zinc-200 rounded-sm shadow-sm hover:scale-95 transition-transform"
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

                {/* 半幅帯マッピング */}
                {itemType === 'hanhaba' && (
                  <div ref={previewContainerRef} className="relative w-[220px] sm:w-[340px] aspect-square">
                    <div className="relative w-full h-full overflow-hidden">
                      {[
                        { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2, bgX: '12%', bgY: '34%' },
                        { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 1, bgX: '45%', bgY: '67%' },
                        { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 8, bgX: '78%', bgY: '12%' },
                        { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: -1, bgX: '23%', bgY: '89%' },
                        { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -10, bgX: '56%', bgY: '45%' },
                        { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -93, bgX: '89%', bgY: '23%' },
                      ].map((layer) => (
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
                              backgroundSize: patternSize,
                              backgroundRepeat: 'repeat',
                              backgroundPosition: `${layer.bgX} ${layer.bgY}`,
                              transform: `rotate(${layer.rot}deg)`,
                              transformOrigin: 'center center',
                              backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent',
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
                  </div>
                )}

                {/* 京袋帯マッピング */}
                {itemType === 'kyobukuro' && (
                  <div ref={previewContainerRef} className="relative w-[220px] sm:w-[340px] aspect-square">
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

                      {[
                        { id: 'hara', file: 'kyoubukurohara.png', z: 30, rot: 271, bgX: '50%', bgY: '50%' },
                        { id: 'tare', file: 'kyoubukurotare.png', z: 40, rot: -1, bgX: '50%', bgY: '50%' },
                        { id: 'taiko', file: 'kyoubukurotakio.png', z: 50, rot: 2, bgX: '50%', bgY: '50%' },
                      ].map((layer) => (
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
                              backgroundSize: patternSize,
                              backgroundRepeat: 'repeat',
                              backgroundPosition: `${layer.bgX} ${layer.bgY}`,
                              transform: `rotate(${layer.rot}deg)`,
                              transformOrigin: 'center center',
                              backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent',
                            }}
                          />
                        </div>
                      ))}

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
                  </div>
                )}

                {/* 着物マッピング */}
                {itemType === 'kimono' && (
                  <div ref={previewContainerRef} className="relative w-[240px] sm:w-[380px] aspect-square">
                    {renderKimonoContent()}
                  </div>
                )}
              </div>

              {/* 保存ボタン */}
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

          {/* トリム表示 */}
          {displayMode === 'trim' && itemType === 'kyobukuro' && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <div className="relative w-[280px] sm:w-[400px] mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden" style={{ aspectRatio: '40 / 34' }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${effectivePatternUrl})`,
                    backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : `${(180 / 400) * 100}% auto`,
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
                      backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 180) * 100}% auto` : '100% auto',
                      backgroundPosition: 'top left',
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

      {/* ★★★ 全画面拡大モーダル（🔍拡大ボタンを押したときに展開） ★★★ */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div 
            className="relative bg-white p-3 sm:p-6 rounded-lg max-w-[90vw] max-h-[90vh] overflow-auto shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-900 text-lg font-black w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"
            >
              ✕
            </button>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-800 mb-3 tracking-widest">
              【拡大表示】{itemType === 'hanhaba' ? '半幅帯' : itemType === 'kyobukuro' ? '京袋帯' : '着物'}マッピング
            </h3>
            <div className="w-[300px] sm:w-[500px] lg:w-[600px] aspect-square bg-[#e4e4e7] relative overflow-hidden shadow-inner border border-zinc-300">
              {itemType === 'kimono' ? (
                renderKimonoContent()
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-xs text-zinc-400 font-bold">帯プレビュー拡大</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
