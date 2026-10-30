// app/page.tsx
'use client';

import { useState, useEffect, type MouseEvent, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  generateStripeSvg, generateDotSvg, generateGridSvg, 
  generateGinghamSvg, generateCheckerSvg, svgToHighResPng, 
  type StripeDirection, type DotLayout 
} from './utils/geometricPatterns';
import { TRADITIONAL_COLORS, FORBIDDEN_WORDS, UNIVERSAL_SCALE_FACTOR } from './lib/constants';
import { CURRENT_NOTICE } from './lib/noticeConfig';
import NoticeModal from './components/NoticeModal';
import PreviewArea from './components/preview/PreviewArea';
import ControlPanel from './components/controls/ControlPanel';
import { PlatformType, submitOrder } from './lib/orders';
import { renderTiledGeometricPng, render18cmPrintDataPng } from './lib/production/canvasRenderer';

const MAX_FLUX_PER_DAY = 24;
const MAX_OPENAI_PER_DAY = 1;

function getTodayJST(): string {
  const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`;
}

function getColorLabel(hex: string): string {
  const found = TRADITIONAL_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return found ? found.name.split(' ')[0] : '';
}

function HomeContent() {
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<PlatformType>((searchParams.get('platform') as PlatformType) || 'makeshop');
  const [designFee, setDesignFee] = useState<number>(1000);

  const [creationMode, setCreationMode] = useState<'ai' | 'geometric'>('ai');
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono'>('hanhaba');
  const [displayMode, setDisplayMode] = useState<'mockup' | 'trim' | 'data'>('mockup');
  
  const [aiStyle, setAiStyle] = useState<string>('mingei');
  const [motif, setMotif] = useState<string>('');
  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [density, setDensity] = useState<string>('標準（バランス）');

  const [geoPatternType, setGeoPatternType] = useState<'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>('stripe');
  const [stripeDir, setStripeDir] = useState<StripeDirection>('vertical');
  const [dotLayout, setDotLayout] = useState<DotLayout>('staggered');
  const [dotRadius, setDotRadius] = useState<number>(20);
  const [gapWidth, setGapWidth] = useState<number>(20);
  const [lineWidth, setLineWidth] = useState<number>(10);
  const [geoBgColor, setGeoBgColor] = useState<string>('#ffffff');
  const [geoPatternColor, setGeoPatternColor] = useState<string>('#000000');
  const [bgSizeMm, setBgSizeMm] = useState<number>(100);

  const [obiLiningColor, setObiLiningColor] = useState<string>('#262626');
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

  const updateGeometricPattern = useCallback(async () => {
    if (creationMode !== 'geometric') return;
    let svg = '';
    let size = 100;
    
    if (geoPatternType === 'plain') { 
      svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${geoBgColor}"/></svg>`; 
    }
    else if (geoPatternType === 'stripe') { 
      svg = generateStripeSvg({ direction: stripeDir, lineWidth, gap: gapWidth, bgColor: geoBgColor, stripeColor: geoPatternColor }); 
      size = stripeDir === 'diagonal' ? (lineWidth + gapWidth) * 2 : (lineWidth + gapWidth); 
    }
    else if (geoPatternType === 'dot') { 
      svg = generateDotSvg({ layout: dotLayout, radius: dotRadius, gap: gapWidth, bgColor: geoBgColor, dotColor: geoPatternColor }); 
      size = (dotRadius * 2) + gapWidth; 
    }
    else if (geoPatternType === 'grid') { 
      svg = generateGridSvg({ lineWidth, gap: gapWidth, bgColor: geoBgColor, gridColor: geoPatternColor }); 
      size = lineWidth + gapWidth; 
    }
    else if (geoPatternType === 'gingham') { 
      svg = generateGinghamSvg({ lineWidth, gap: gapWidth, bgColor: geoBgColor, checkColor: geoPatternColor }); 
      size = lineWidth + gapWidth; 
    }
    else if (geoPatternType === 'checker') { 
      svg = generateCheckerSvg({ blockSize: lineWidth, bgColor: geoBgColor, checkColor: geoPatternColor }); 
      size = lineWidth * 2; 
    }
    
    setBgSizeMm(size);
    setImageUrl(await svgToHighResPng(svg, size));
    setBlobUrl('');
    setRotatedPatternUrl('');
  }, [creationMode, geoPatternType, lineWidth, gapWidth, geoPatternColor, geoBgColor, stripeDir, dotRadius, dotLayout]);

  useEffect(() => {
    if (creationMode === 'geometric') updateGeometricPattern();
  }, [creationMode, updateGeometricPattern]);

  const handleColorToggle = (colorObj: typeof TRADITIONAL_COLORS[0]) => {
    if (selectedColors.some(c => c.hex === colorObj.hex)) {
      setSelectedColors(selectedColors.filter(c => c.hex !== colorObj.hex));
    } else {
      if (selectedColors.length >= 3) { setErrorMsg('選択できる色は最大3色までです'); return; }
      setSelectedColors([...selectedColors, colorObj]);
      setErrorMsg('');
    }
  };

  const handleCustomObiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomObiUrl(url);
    }
  };

  const handleGenerate = async (engine: 'flux' | 'openai') => {
    if (loading) return;
    setErrorMsg('');
    if (creationMode === 'ai' && !motif.trim()) { setErrorMsg('描きたいモチーフを入力してください。'); return; }
    for (const forbidden of FORBIDDEN_WORDS) {
      if (motif.includes(forbidden)) { setErrorMsg(`禁止ワード「${forbidden}」が含まれています。`); return; }
    }

    setLoading(true);
    setLoadingEngine(engine);
    setLoadingStep(0);
    const stepTimer = setInterval(() => setLoadingStep(prev => prev < 4 ? prev + 1 : prev), 4000);

    try {
      const colorNames = selectedColors.map(c => getColorLabel(c.hex)).join('、');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif: motif.trim(), color: colorNames || 'おまかせ', density, itemType, aiStyle, engine })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '画像生成に失敗しました');

      setImageUrl(data.imageUrl);
      setBlobUrl(data.blobUrl);
      setRotatedPatternUrl(data.rotatedPatternUrl || data.imageUrl);
      const newSerial = `KOMON-${Math.floor(1000 + Math.random() * 9000)}`;
      setSerialNumber(newSerial);
      setPatternTitle(motif.trim() ? `${motif.trim()}小紋` : '無題の小紋');

      const storageKey = engine === 'flux' ? 'komon_count_flux' : 'komon_count_openai';
      const maxCount = engine === 'flux' ? MAX_FLUX_PER_DAY : MAX_OPENAI_PER_DAY;
      const setter = engine === 'flux' ? setRemainingFlux : setRemainingOpenAI;
      const used = parseInt(localStorage.getItem(storageKey) || '0', 10) + 1;
      localStorage.setItem(storageKey, used.toString());
      setter(Math.max(0, maxCount - used));

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || '通信エラーが発生しました');
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
      setLoadingEngine(null);
    }
  };

  const handleDownloadOriginal = async () => {
    try {
      let downloadUrl = blobUrl || imageUrl;
      if (creationMode === 'geometric' && imageUrl) {
        downloadUrl = await renderTiledGeometricPng(imageUrl, bgSizeMm, geoBgColor, 400, 2400);
      }
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${serialNumber || 'komon'}_original.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch { alert('ダウンロードに失敗しました'); }
  };

  const handleDownloadMapping = async () => {
    if (!previewContainerRef.current) return;
    setMockupSubmitting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewContainerRef.current, { useCORS: true, allowTaint: true, backgroundColor: '#ffffff', scale: 2 });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${serialNumber || 'komon'}_${itemType}_mockup.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch { alert('プレビュー画像の保存に失敗しました'); }
    finally { setMockupSubmitting(false); }
  };

  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      let finalImg = blobUrl || imageUrl;
      const validSerial = serialNumber || `KOMON-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!serialNumber) setSerialNumber(validSerial);

      if (itemType === 'hanhaba') {
        finalImg = await render18cmPrintDataPng(
          creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl),
          creationMode, bgSizeMm, geoBgColor
        );
      }

      const result = await submitOrder(platform, {
        title: patternTitle.trim() || '（無題）',
        serialNumber: validSerial,
        imageUrl: finalImg,
        itemType,
        creationMode,
        vendor: 'Printag Creator',
        designFee,
      });

      if (result.message) alert(result.message);
      if (result.redirectUrl) window.location.href = result.redirectUrl;
    } catch (err: any) {
      setErrorMsg(err.message || '通信エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex flex-col items-center justify-start font-sans lg:p-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:gap-6 items-start justify-center">
        <PreviewArea
          imageUrl={imageUrl} blobUrl={blobUrl} rotatedPatternUrl={rotatedPatternUrl}
          serialNumber={serialNumber} itemType={itemType} displayMode={displayMode}
          creationMode={creationMode} bgSizeMm={bgSizeMm}
          geoBgColor={geoBgColor}
          obiLiningColor={obiLiningColor} setObiLiningColor={setObiLiningColor}
          kimonoHaneriColor={kimonoHaneriColor} setKimonoHaneriColor={setKimonoHaneriColor}
          kimonoObiageColor={kimonoObiageColor} setKimonoObiageColor={setKimonoObiageColor}
          kimonoObiColor={kimonoObiColor} setKimonoObiColor={setKimonoObiColor}
          customObiUrl={customObiUrl} setCustomObiUrl={setCustomObiUrl}
          handleCustomObiUpload={handleCustomObiUpload}
          mockupSubmitting={mockupSubmitting} previewRef={previewRef} previewContainerRef={previewContainerRef}
          handleItemTypeChange={setItemType} setDisplayMode={setDisplayMode}
          handleDownloadMapping={handleDownloadMapping} UNIVERSAL_SCALE_FACTOR={UNIVERSAL_SCALE_FACTOR}
        />

        <ControlPanel
          creationMode={creationMode} setCreationMode={setCreationMode}
          aiStyle={aiStyle} setAiStyle={setAiStyle} motif={motif} setMotif={setMotif}
          selectedColors={selectedColors} setSelectedColors={setSelectedColors} handleColorToggle={handleColorToggle}
          showColorPalette={showColorPalette} setShowColorPalette={setShowColorPalette}
          density={density} setDensity={setDensity}
          geoPatternType={geoPatternType} setGeoPatternType={setGeoPatternType}
          stripeDir={stripeDir} setStripeDir={setStripeDir} dotLayout={dotLayout} setDotLayout={setDotLayout}
          dotRadius={dotRadius} setDotRadius={setDotRadius} gapWidth={gapWidth} setGapWidth={setGapWidth}
          lineWidth={lineWidth} setLineWidth={setLineWidth} geoBgColor={geoBgColor} setGeoBgColor={setGeoBgColor}
          geoPatternColor={geoPatternColor} setGeoPatternColor={setGeoPatternColor}
          agreed={agreed} setAgreed={setAgreed} errorMsg={errorMsg}
          loading={loading} loadingEngine={loadingEngine}
          remainingFlux={remainingFlux} remainingOpenAI={remainingOpenAI} loadingStep={loadingStep}
          handleGenerate={handleGenerate} imageUrl={imageUrl} patternTitle={patternTitle} setPatternTitle={setPatternTitle}
          handleDownloadOriginal={handleDownloadOriginal} handleOrderClick={handleOrderClick}
          platform={platform} designFee={designFee} setDesignFee={setDesignFee}
        />
      </div>

      {CURRENT_NOTICE.enabled && (
        <div className="w-full max-w-7xl px-4 py-8 mt-12 flex justify-center border-t border-zinc-200">
          <button
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-950 underline transition-colors"
          >
            {CURRENT_NOTICE.category}を確認する
          </button>
        </div>
      )}

      {/* 開発・査察用プラットフォーム切替バー */}
      <div className="w-full max-w-7xl px-4 py-4 mt-4 flex justify-between items-center text-[10px] text-zinc-400 border-t border-zinc-200">
        <span>稼働中: {platform === 'shopify' ? 'Shopify連携モード（補助事業査察・D2C還元）' : 'MakeShop連携モード（通常稼働中）'}</span>
        <div className="flex gap-2 items-center">
          <span>切替:</span>
          <button
            type="button"
            onClick={() => setPlatform('makeshop')}
            className={`px-2 py-0.5 border rounded font-bold ${platform === 'makeshop' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300'}`}
          >
            MakeShop
          </button>
          <button
            type="button"
            onClick={() => setPlatform('shopify')}
            className={`px-2 py-0.5 border rounded font-bold ${platform === 'shopify' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-zinc-600 border-zinc-300'}`}
          >
            Shopify (査察用)
          </button>
        </div>
      </div>

      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        onGoToGeometric={() => { setIsNoticeOpen(false); setCreationMode('geometric'); }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]"><p className="text-zinc-400 text-sm font-bold tracking-widest">LOADING...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
