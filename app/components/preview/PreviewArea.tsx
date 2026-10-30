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
    // 【絶対ルール】画像の実寸幅は、幾何学ならbgSizeMm、AIなら常に40cm（400mm）の反物基準とする
    const imageRealWidthMm = creationMode === 'geometric' ? bgSizeMm : 400;

    // ゴフクヤサン考案の完璧な黄金比率（3/22）をそのまま実寸に掛けるだけで全アイテムの縮尺がピタリと合う
    const patternSize = `${imageRealWidthMm * UNIVERSAL_SCALE_FACTOR}% auto`;
    const kimonoPatternSize = `${(imageRealWidthMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;
    
    const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);

    return (
      <>
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
              <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=21')`, WebkitMaskImage: `url('/${layer.file}?v=21')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
                <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} />
              </div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 65, maskImage: `url('/hanhaba_Layer07.png?v=21')`, WebkitMaskImage: `url('/hanhaba_Layer07.png?v=21')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
              <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundColor: obiLiningColor }} />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/hanhaba_Layer_kage.png?v=21')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.5 }} />
          </div>
        )}

        {itemType === 'kyobukuro' && (
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
              <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=30')`, WebkitMaskImage: `url('/${layer.file}?v=30')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: kimonoPatternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.angle - 90}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} />
              </div>
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 45, maskImage: `url('/haneri.png?v=30')`, WebkitMaskImage: `url('/haneri.png?v=30')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
              <div className="w-full h-full relative" style={{ backgroundColor: kimonoHaneriColor }}>
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }} />
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 60, maskImage: `url('/obiage.png?v=30')`, WebkitMaskImage: `url('/obiage.png?v=30')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
              <div className="w-full h-full" style={{ backgroundColor: kimonoObiageColor }} />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 65, maskImage: `url('/obi_2.png?v=30')`, WebkitMaskImage: `url('/obi_2.png?v=30')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', backgroundColor: customObiUrl ? 'transparent' : kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: '50% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat' }} />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/jyouzan.png?v=30')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.5 }} />
          </div>
        )}
      </>
    );
  };

  const imageRealWidthMm = creationMode === 'geometric' ? bgSizeMm : 400;
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
                  {renderMockup()}
                </div>
              </div>
            )}

            {/* 40cm反物を34cmにトリミング（京袋帯） */}
            {displayMode === 'trim' && itemType === 'kyobukuro' && (
              <div className="w-full flex flex-col items-center animate-fade-in relative z-10 px-4">
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-full max-w-[360px] sm:max-w-[400px]" style={{ aspectRatio: '40 / 34' }}>
                  <div className="absolute inset-0" style={{ 
                    backgroundImage: `url(${effectivePatternUrl})`, 
                    backgroundSize: `${(imageRealWidthMm / 400) * 100}% auto`, 
                    backgroundPosition: 'center center', 
                    backgroundRepeat: 'repeat', 
                    backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' 
                  }} />
                </div>
              </div>
            )}

            {/* プリントデータ用表示 */}
            {displayMode === 'data' && (
              <div className="flex flex-col items-center w-full animate-fade-in relative z-10 px-4">
                {itemType === 'hanhaba' ? (
                  // 40cmの反物を18cm幅にトリミング（中央を切り抜き）
                  <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-[216px] h-[480px]">
                    <div className="absolute inset-0" style={{ 
                      backgroundImage: `url(${effectivePatternUrl})`, 
                      backgroundSize: `${(imageRealWidthMm / 180) * 100}% auto`, 
                      backgroundPosition: 'center', 
                      backgroundRepeat: 'repeat', 
                      backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' 
                    }} />
                  </div>
                ) : (
                  // 40cmの反物原寸表示
                  <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-full max-w-[360px] sm:max-w-[400px] aspect-square">
                    <div className="absolute inset-0" style={{ 
                      backgroundImage: `url(${effectivePatternUrl})`, 
                      backgroundSize: `${(imageRealWidthMm / 400) * 100}% auto`, 
                      backgroundPosition: 'center', 
                      backgroundRepeat: 'repeat', 
                      backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' 
                    }} />
                  </div>
                )}
              </div>
            )}

            {displayMode === 'mockup' && (
              <button type="button" onClick={handleDownloadMapping} disabled={mockupSubmitting} className={`absolute bottom-3 right-3 z-20 px-4 py-2 text-[10px] font-bold tracking-wider rounded-full shadow-lg backdrop-blur-md border transition-all flex items-center gap-1.5 hover:bg-black ${ mockupSubmitting ? 'bg-zinc-400/80 text-white border-zinc-400 cursor-not-allowed' : 'bg-zinc-900/90 text-white border-zinc-900/50' }`}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                {mockupSubmitting ? '作成中...' : '画像を保存'}
              </button>
            )}
          </div>

          <div className="px-4 py-2.5 bg-zinc-100 border-t border-zinc-200 text-center">
            <p className="text-[10px] sm:text-[11px] text-zinc-600 font-medium leading-relaxed">
              ※ シミュレーション上は柄のつなぎ目が切れて見える場合がありますが、実際のお仕立て・生地制作時は<strong className="text-zinc-950 font-bold">ゴフクヤサンが目視・手作業で柄の送りを綺麗に修正・調整</strong>いたしますのでご安心ください。
            </p>
          </div>
        </div>
      )}

      {imageUrl && (
        <button
          type="button"
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`lg:hidden fixed bottom-6 right-5 z-50 w-[180px] h-[180px] sm:w-[224px] sm:h-[224px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-[5px] border-white overflow-hidden active:scale-95 transition-all duration-500 group bg-[#e4e4e7] ${isCompact ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'}`}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center scale-[1.15] transition-transform duration-500 group-hover:scale-[1.25]">
            <div className="w-full h-full">
              {renderMockup()}
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-colors group-hover:bg-black/20">
            <div className="bg-black/60 p-3 rounded-full backdrop-blur-md shadow-sm">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
