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

const MAX_GENERATE_PER_DAY = 20;

function getTodayJST(): string {
  const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value}`;
}

function getColorNameFromHex(hex: string): string {
  const found = TRADITIONAL_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
  return found ? found.name.split(' ')[0] : '';
}

async function rotateImage90Degrees(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
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
  const [density, setDensity] = useState<string>('四方柄');

  const [geoPatternType, setGeoPatternType] = useState<'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>('plain');
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
  const [remainingCount, setRemainingCount] = useState<number>(MAX_GENERATE_PER_DAY);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('GEO-INIT');
  const [patternTitle, setPatternTitle] = useState<string>('色無地');
  const [mockupSubmitting, setMockupSubmitting] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = getTodayJST();
    const storedDate = localStorage.getItem('komon_usage_date');
    if (storedDate !== today) {
      localStorage.setItem('komon_usage_date', today);
      localStorage.setItem('komon_count_total', '0');
      setRemainingCount(MAX_GENERATE_PER_DAY);
    } else {
      setRemainingCount(Math.max(0, MAX_GENERATE_PER_DAY - parseInt(localStorage.getItem('komon_count_total') || '0', 10)));
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

  useEffect(() => {
    const src = blobUrl || imageUrl;
    if (!src) {
      setRotatedPatternUrl('');
      return;
    }

    if (creationMode === 'ai' && itemType === 'hanhaba') {
      rotateImage90Degrees(src)
        .then((rotated) => setRotatedPatternUrl(rotated))
        .catch((err) => {
          console.error('画像90度回転に失敗:', err);
          setRotatedPatternUrl(src);
        });
    } else {
      setRotatedPatternUrl(src);
    }
  }, [blobUrl, imageUrl, creationMode, itemType]);

  const updateGeometricPattern = useCallback(async () => {
    if (creationMode !== 'geometric') return;

    let svgString = '';
    let tileSize = 0;
    const period = lineWidth + gapWidth;
    const dotPitch = (dotRadius * 2) + gapWidth;

    if (geoPatternType === 'plain') {
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${geoBgColor}"/></svg>`;
      tileSize = 100;
    } else if (geoPatternType === 'stripe') {
      svgString = generateStripeSvg({ direction: stripeDir, lineWidth, gap: gapWidth, bgColor: geoBgColor, stripeColor: geoPatternColor });
      tileSize = stripeDir === 'diagonal' ? period * 2 : period;
    } else if (geoPatternType === 'dot') {
      svgString = generateDotSvg({ layout: dotLayout, radius: dotRadius, gap: gapWidth, bgColor: geoBgColor, dotColor: geoPatternColor });
      tileSize = dotPitch; 
    } else if (geoPatternType === 'grid') {
      svgString = generateGridSvg({ lineWidth, gap: gapWidth, bgColor: geoBgColor, gridColor: geoPatternColor });
      tileSize = period;
    } else if (geoPatternType === 'gingham') {
      svgString = generateGinghamSvg({ lineWidth, gap: gapWidth, bgColor: geoBgColor, checkColor: geoPatternColor });
      tileSize = period;
    } else if (geoPatternType === 'checker') {
      svgString = generateCheckerSvg({ blockSize: lineWidth, bgColor: geoBgColor, checkColor: geoPatternColor });
      tileSize = lineWidth * 2;
    }

    setBgSizeMm(tileSize);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setImageUrl(svgDataUrl);
    setRotatedPatternUrl('');

    try {
      const tiledPng = await renderTiledGeometricPng(svgDataUrl, tileSize, geoBgColor, 400, 2400);
      setBlobUrl(tiledPng);
    } catch {
      try {
        const fallbackPng = await svgToHighResPng(svgString, 2400);
        setBlobUrl(fallbackPng);
      } catch {
        setBlobUrl(svgDataUrl);
      }
    }

    const bgName = getColorNameFromHex(geoBgColor);
    const patName = getColorNameFromHex(geoPatternColor);
    let baseName = '無題';
    if (geoPatternType === 'plain') baseName = '色無地';
    if (geoPatternType === 'stripe') baseName = '万筋縞';
    if (geoPatternType === 'dot') baseName = '千鳥水玉';
    if (geoPatternType === 'grid') baseName = '格子柄';
    if (geoPatternType === 'gingham') baseName = '吟風';
    if (geoPatternType === 'checker') baseName = '市松模様';

    let autoTitle = baseName;
    if (geoPatternType === 'plain') {
      autoTitle = bgName ? `${bgName}の色無地` : '色無地';
    } else {
      const mainColor = patName || bgName;
      autoTitle = mainColor ? `${mainColor}の${baseName}` : baseName;
    }
    setPatternTitle(autoTitle);

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

  // ★ 1日20回制限 ＆ 5%の確率でOpenAIが当たるロジック
  const handleGenerate = async () => {
    if (loading || remainingCount <= 0) return;
    setErrorMsg('');
    if (creationMode === 'ai' && !motif.trim()) { setErrorMsg('描きたいモチーフを入力してください。'); return; }
    for (const forbidden of FORBIDDEN_WORDS) {
      if (motif.includes(forbidden)) { setErrorMsg(`禁止ワード「${forbidden}」が含まれています。`); return; }
    }

    const selectedEngine: 'flux' | 'openai' = Math.random() < 0.05 ? 'openai' : 'flux';

    setLoading(true);
    setLoadingEngine(selectedEngine);
    setLoadingStep(0);
    const stepTimer = setInterval(() => setLoadingStep(prev => prev < 4 ? prev + 1 : 0), 4000);

    try {
      const colorNames = selectedColors.map(c => getColorNameFromHex(c.hex)).join('、');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif: motif.trim(), color: colorNames || 'おまかせ', density, itemType, aiStyle, engine: selectedEngine })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '画像生成に失敗しました');

      setImageUrl(data.imageUrl);
      setBlobUrl(data.blobUrl);
      
      const newSerial = `KOMON-${Math.floor(1000 + Math.random() * 9000)}`;
      setSerialNumber(newSerial);

      const colorPrefix = selectedColors.length > 0 ? `${getColorNameFromHex(selectedColors[0].hex)}の` : '';
      setPatternTitle(motif.trim() ? `${colorPrefix}${motif.trim()}小紋` : '無題の小紋');

      const used = parseInt(localStorage.getItem('komon_count_total') || '0', 10) + 1;
      localStorage.setItem('komon_count_total', used.toString());
      setRemainingCount(Math.max(0, MAX_GENERATE_PER_DAY - used));

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
      const validSerial = serialNumber || (creationMode === 'geometric' ? `GEO-${Math.floor(1000 + Math.random() * 9000)}` : `KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
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
          obiLiningColor={obiLiningColor}
          setObiLiningColor={setObiLiningColor}
          kimonoHaneriColor={kimonoHaneriColor}
          setKimonoHaneriColor={setKimonoHaneriColor}
          kimonoObiageColor={kimonoObiageColor}
          setKimonoObiageColor={setKimonoObiageColor}
          kimonoObiColor={kimonoObiColor}
          setKimonoObiColor={setKimonoObiColor}
          customObiUrl={customObiUrl}
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
          showGeoPaletteFor={showGeoPaletteFor} setShowGeoPaletteFor={setShowGeoPaletteFor}
          obiLiningColor={obiLiningColor} setObiLiningColor={setObiLiningColor}
          kimonoHaneriColor={kimonoHaneriColor} setKimonoHaneriColor={setKimonoHaneriColor}
          kimonoObiageColor={kimonoObiageColor} setKimonoObiageColor={setKimonoObiageColor}
          kimonoObiColor={kimonoObiColor} setKimonoObiColor={setKimonoObiColor}
          customObiUrl={customObiUrl} setCustomObiUrl={setCustomObiUrl}
          handleCustomObiUpload={handleCustomObiUpload}
          agreed={agreed} setAgreed={setAgreed} errorMsg={errorMsg}
          loading={loading} loadingEngine={loadingEngine}
          remainingCount={remainingCount} loadingStep={loadingStep}
          handleGenerate={handleGenerate} imageUrl={imageUrl} patternTitle={patternTitle} setPatternTitle={setPatternTitle}
          handleDownloadOriginal={handleDownloadOriginal} handleOrderClick={handleOrderClick}
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
      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={handleCloseNotice}
        onGoToGeometric={() => { handleCloseNotice(); setCreationMode('geometric'); }}
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
