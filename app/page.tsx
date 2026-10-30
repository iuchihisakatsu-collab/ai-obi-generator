// app/page.tsx
'use client';

import { useState, useEffect, type MouseEvent, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  generateStripeSvg, 
  generateDotSvg, 
  generateGridSvg, 
  generateGinghamSvg, 
  generateCheckerSvg, 
  svgToHighResPng, 
  type StripeDirection, 
  type DotLayout 
} from './utils/geometricPatterns';

import { 
  TRADITIONAL_COLORS, FORBIDDEN_WORDS, 
  UNIVERSAL_SCALE_FACTOR 
} from './lib/constants';

import { CURRENT_NOTICE } from './lib/noticeConfig';
import NoticeModal from './components/NoticeModal';
import PreviewArea from './components/preview/PreviewArea';
import ControlPanel from './components/controls/ControlPanel';

const MAX_FLUX_PER_DAY = 24;
const MAX_OPENAI_PER_DAY = 1;

function getTodayJST(): string {
  const now = new Date();
  const jstFormatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const parts = jstFormatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

function getColorLabel(hex: string): string {
  const target = hex.toLowerCase();
  const found = TRADITIONAL_COLORS.find((c) => c.hex.toLowerCase() === target);
  return found ? found.name.split(' ')[0] : '';
}

async function renderTiledGeometricPng(svgDataUrl: string, bgSizeMm: number, bgColor: string, targetWidthMm: number = 400, resolutionPx: number = 2400): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = resolutionPx; canvas.height = resolutionPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(svgDataUrl); return; }
        ctx.fillStyle = bgColor; ctx.fillRect(0, 0, resolutionPx, resolutionPx);
        const pxPerMm = resolutionPx / targetWidthMm;
        const tileSizePx = Math.max(1, bgSizeMm * pxPerMm);
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileSizePx; tileCanvas.height = tileSizePx;
        const tCtx = tileCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = bgColor; tCtx.fillRect(0, 0, tileSizePx, tileSizePx);
          tCtx.drawImage(img, 0, 0, tileSizePx, tileSizePx);
          const pattern = ctx.createPattern(tileCanvas, 'repeat');
          if (pattern) { ctx.fillStyle = pattern; ctx.fillRect(0, 0, resolutionPx, resolutionPx); }
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (err) { resolve(svgDataUrl); }
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}

// 【絶対ルール適用】工場送信データ用。AIの400mm反物画像から中央の180mm(半幅帯)をトリミングして出力する
async function render18cmPrintDataPng(patternUrl: string, creationMode: 'ai' | 'geometric', bgSizeMm: number, bgColor: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // 解像度: 6px/mm (180mm = 1080px, 400mm = 2400px)
        canvas.width = 1080; 
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(patternUrl); return; }
        ctx.fillStyle = bgColor || '#ffffff'; ctx.fillRect(0, 0, 1080, 2400);

        if (creationMode === 'geometric') {
          const pxPerMm = 6;
          const tileSizePx = Math.max(1, bgSizeMm * pxPerMm);
          const tileCanvas = document.createElement('canvas');
          tileCanvas.width = tileSizePx; tileCanvas.height = tileSizePx;
          const tCtx = tileCanvas.getContext('2d');
          if (tCtx) {
            tCtx.fillStyle = bgColor || '#ffffff'; tCtx.fillRect(0, 0, tileSizePx, tileSizePx);
            tCtx.drawImage(img, 0, 0, tileSizePx, tileSizePx);
            const pattern = ctx.createPattern(tileCanvas, 'repeat');
            if (pattern) { ctx.fillStyle = pattern; ctx.fillRect(0, 0, 1080, 2400); }
          }
        } else {
          // AIモード: 画像は400mm角。これを2400px相当として扱い、中央1080px分をトリミングして縦に並べる
          const pxPerMm = 6;
          const scaledWidth = 400 * pxPerMm; // 2400px
          const scale = scaledWidth / img.naturalWidth;
          const scaledHeight = img.naturalHeight * scale;
          
          // 中央をトリミングするためのXオフセット計算： (1080 - 2400) / 2 = -660px
          const offsetX = (1080 - scaledWidth) / 2;
          
          for (let y = 0; y < 2400; y += scaledHeight) { 
            ctx.drawImage(img, offsetX, y, scaledWidth, scaledHeight); 
          }
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (err) { resolve(patternUrl); }
    };
    img.onerror = () => resolve(patternUrl);
    img.src = patternUrl;
  });
}

async function rotateImage90Degrees(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight; canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context failed')); return; }
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

  const [aiStyle, setAiStyle] = useState('mingei');
  const [motif, setMotif] = useState('');
  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  const [density, setDensity] = useState('四方柄（上下なし）');
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono'>('hanhaba'); 
  const [patternTitle, setPatternTitle] = useState('');
  const lastAutoTitleRef = useRef('');
  const [loading, setLoading] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState<'flux' | 'openai' | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imageUrl, setImageUrl] = useState(''); 
  const [blobUrl, setBlobUrl] = useState('');    
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [displayMode, setDisplayMode] = useState<'mockup' | 'trim' | 'data'>('mockup');
  const [mockupSubmitting, setMockupSubmitting] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  // デュアルエンジン残回数（fal 24回 / OpenAI 1回）
  const [remainingFlux, setRemainingFlux] = useState<number>(MAX_FLUX_PER_DAY);
  const [remainingOpenAI, setRemainingOpenAI] = useState<number>(MAX_OPENAI_PER_DAY);
  
  const [creationMode, setCreationMode] = useState<'ai' | 'geometric'>('geometric');
  
  const [geoPatternType, setGeoPatternType] = useState<'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>('plain');
  const [stripeDir, setStripeDir] = useState<StripeDirection>('vertical');
  const [lineWidth, setLineWidth] = useState(5);
  const [gapWidth, setGapWidth] = useState(10);
  const [dotRadius, setDotRadius] = useState(5);
  const [dotLayout, setDotLayout] = useState<DotLayout>('staggered');
  const [geoBgColor, setGeoBgColor] = useState('#fffffc');
  const [geoPatternColor, setGeoPatternColor] = useState('#161616');
  const [showGeoPaletteFor, setShowGeoPaletteFor] = useState<'bg' | 'pattern' | null>(null);
  const [bgSizeMm, setBgSizeMm] = useState(100);
  
  const [obiLiningColor, setObiLiningColor] = useState('#dcdddd'); 
  const [kimonoObiColor, setKimonoObiColor] = useState('#161616'); 
  const [customObiUrl, setCustomObiUrl] = useState<string | null>(null);
  const [kimonoHaneriColor, setKimonoHaneriColor] = useState('#fffffc'); 
  const [kimonoObiageColor, setKimonoObiageColor] = useState('#e8d3d1'); 
  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CURRENT_NOTICE.enabled) return;
    const dismissedId = localStorage.getItem('komon_notice_dismissed_id');
    if (dismissedId !== CURRENT_NOTICE.id) {
      setIsNoticeOpen(true);
    }
  }, []);

  const handleCloseNotice = () => {
    localStorage.setItem('komon_notice_dismissed_id', CURRENT_NOTICE.id);
    setIsNoticeOpen(false);
  };

  const handleGoToGeometricFromNotice = () => {
    handleCloseNotice();
    setCreationMode('geometric');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (creationMode !== 'geometric') return;
    if (patternTitle !== '' && lastAutoTitleRef.current !== '' && patternTitle !== lastAutoTitleRef.current) {
      return;
    }

    const bgName = getColorLabel(geoBgColor) || '生成り';
    const patName = getColorLabel(geoPatternColor) || '墨黒';

    let autoName = '';
    if (geoPatternType === 'plain') {
      autoName = `${bgName}の色無地`;
    } else if (geoPatternType === 'stripe') {
      const dirText = stripeDir === 'vertical' ? '縦縞' : stripeDir === 'horizontal' ? '横縞' : '斜め縞';
      autoName = `${bgName}に${patName}の${dirText}`;
    } else if (geoPatternType === 'dot') {
      const dotText = dotLayout === 'staggered' ? '千鳥水玉' : '水玉';
      autoName = `${bgName}に${patName}の${dotText}`;
    } else if (geoPatternType === 'grid') {
      autoName = `${bgName}に${patName}の格子`;
    } else if (geoPatternType === 'gingham') {
      autoName = `${bgName}に${patName}のギンガムチェック`;
    } else if (geoPatternType === 'checker') {
      autoName = `${bgName}と${patName}の市松`;
    }

    lastAutoTitleRef.current = autoName;
    setPatternTitle(autoName);
  }, [creationMode, geoPatternType, stripeDir, dotLayout, geoBgColor, geoPatternColor, patternTitle]);

  const handleCustomObiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCustomObiUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleItemTypeChange = (type: 'hanhaba' | 'kyobukuro' | 'kimono') => {
    setItemType(type);
    setDisplayMode('mockup');
    if (type === 'kyobukuro') setObiLiningColor('#161616');
    else if (type === 'hanhaba') setObiLiningColor('#dcdddd');
  };

  useEffect(() => {
    const todayJst = getTodayJST();
    const storedData = localStorage.getItem('komon_dual_generations');
    let fCount = 0;
    let oCount = 0;
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayJst) {
          fCount = parsed.flux || 0;
          oCount = parsed.openai || 0;
        }
      } catch (e) {}
    } else {
      const oldData = localStorage.getItem('komon_generations');
      if (oldData) {
        try {
          const parsedOld = JSON.parse(oldData);
          if (parsedOld.date === todayJst) {
            oCount = parsedOld.count || 0;
          }
        } catch (e) {}
      }
    }
    setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - fCount));
    setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - oCount));
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (loading && loadingEngine === 'openai') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < 5) return prev + 1;
          return prev;
        });
      }, 4000); 
    }
    return () => { if (interval) clearInterval(interval); };
  }, [loading, loadingEngine]);

  useEffect(() => {
    if (motif.trim() === 'ぷっぴ' || motif.trim() === 'ベホイミ') {
      localStorage.removeItem('komon_dual_generations');
      localStorage.removeItem('komon_generations');
      setRemainingFlux(MAX_FLUX_PER_DAY);
      setRemainingOpenAI(MAX_OPENAI_PER_DAY);
      setMotif('');
      alert('【管理者モード】本日の生成回数をすべて全回復しました。\n・falエンジン: 24回\n・OpenAIエンジン: 1回');
    }
  }, [motif]);

  // AI画像は正方形なので回転させない
  useEffect(() => {
    const src = blobUrl || imageUrl;
    if (!src) { setRotatedPatternUrl(''); return; }
    if (creationMode === 'ai' && itemType === 'hanhaba') {
      // 古い横長画像を回転させる処理は廃止。AI画像はそのまま使う
      setRotatedPatternUrl(src);
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
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${geoBgColor}"/></svg>`;
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
    
    try {
      const tiledPng = await renderTiledGeometricPng(svgDataUrl, tileSize, geoBgColor, 400, 2400);
      setBlobUrl(tiledPng);
    } catch {
      const fallbackPng = await svgToHighResPng(svgString, 2400);
      setBlobUrl(fallbackPng);
    }
    setSerialNumber((prev) => (prev && prev.startsWith('GEO-')) ? prev : `GEO-${Math.floor(1000 + Math.random() * 9000)}`);
  }, [creationMode, geoPatternType, stripeDir, lineWidth, gapWidth, dotLayout, dotRadius, geoBgColor, geoPatternColor]);

  useEffect(() => { updateGeometricPattern(); }, [updateGeometricPattern]);

  const handleTagClick = (item: { label: string; id: string }) => {
    if (!motif.includes(item.label)) {
      setMotif(motif ? `${motif}、${item.label}` : item.label);
    }
  };

  const handleColorToggle = (col: typeof TRADITIONAL_COLORS[0]) => {
    setSelectedColors((prev) => {
      if (prev.some((c) => c.name === col.name)) return prev.filter((c) => c.name !== col.name);
      if (prev.length >= 3) { alert('配色は最大3色まで選択できます。'); return prev; }
      return [...prev, col];
    });
  };

  const handleGenerate = async (engine: 'flux' | 'openai' = 'flux') => {
    setErrorMsg('');
    if (!motif.trim()) { setErrorMsg('図案のモチーフを入力してください。'); return; }
    if (!agreed) { setErrorMsg('図案の利用への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((w) => motif.toLowerCase().includes(w));
    if (hitWord) { setErrorMsg(`使用できない言葉「${hitWord}」が含まれています。`); return; }

    const todayJst = getTodayJST();
    const storedData = localStorage.getItem('komon_dual_generations');
    let fCount = 0;
    let oCount = 0;
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayJst) {
          fCount = parsed.flux || 0;
          oCount = parsed.openai || 0;
        }
      } catch (e) {}
    }

    if (engine === 'flux' && fCount >= MAX_FLUX_PER_DAY) {
      setRemainingFlux(0);
      alert('[本日の上限に達しました]\n\nfalエンジンは1日24回までご利用いただけます。');
      return;
    }
    if (engine === 'openai' && oCount >= MAX_OPENAI_PER_DAY) {
      setRemainingOpenAI(0);
      alert('[本日の上限に達しました]\n\nOpenAIエンジンはお一人様1日1回までとなっております。');
      return;
    }

    const colorPayload = selectedColors.length > 0 ? selectedColors.map((c) => c.text).join('と') : 'モチーフに準拠した配色';

    setLoading(true);
    setLoadingEngine(engine);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif, color: colorPayload, density, itemType, aiStyle, engine }),
      });
      const data = await res.json();
      if (data.imageUrl && data.blobUrl) {
        setImageUrl(data.imageUrl); 
        setBlobUrl(data.blobUrl);   
        setSerialNumber(`KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
        
        if (creationMode === 'ai') {
          const styleLabels: Record<string, string> = {
            'mingei': '型染め小紋',
            'retro': '浪漫小紋',
            'kissaten': '喫茶文様',
            'nordic': 'モダン小紋',
            'morris': 'ボタニカル文様',
            'sarasa': '更紗帯地',
            'classic': '古典見立て織風',
            'mode': 'モードアート小紋',
            'yuzen': 'はんなり友禅調',
            'etching': '銅版画調図案',
            'silhouette': '切り絵小紋',
            'artdeco': 'アールデコ文様'
          };
          const cleanMotif = motif.split(/[、\s ]+/)[0];
          const generatedTitle = `${cleanMotif}の${styleLabels[aiStyle] || '図案'}`;
          setPatternTitle(generatedTitle);
        }

        setDisplayMode('mockup');
        const newFCount = engine === 'flux' ? fCount + 1 : fCount;
        const newOCount = engine === 'openai' ? oCount + 1 : oCount;

        localStorage.setItem('komon_dual_generations', JSON.stringify({
          date: todayJst,
          flux: newFCount,
          openai: newOCount
        }));

        setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - newFCount));
        setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - newOCount));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || '図案の生成に失敗しました。');
      }
    } catch (error) { setErrorMsg('通信エラーが発生しました。'); }
    finally {
      setLoading(false);
      setLoadingEngine(null);
    }
  };

  const handleDownloadOriginal = async () => {
    const targetUrl = blobUrl || imageUrl;
    if (!targetUrl) return;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${serialNumber || 'pattern'}.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { window.open(targetUrl, '_blank', 'noopener,noreferrer'); }
  };

  const finalTitle = patternTitle.trim() || '（無題）';

  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      let finalImageUrl = blobUrl || imageUrl;
      const validSerial = serialNumber || `KOMON-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!serialNumber) setSerialNumber(validSerial);
      
      if (itemType === 'hanhaba') {
        finalImageUrl = await render18cmPrintDataPng(
          creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl), 
          creationMode, 
          bgSizeMm, 
          geoBgColor
        );
      }

      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-blob', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64Data: finalImageUrl, filename: `${validSerial}.png` }) });
        const uploadData = await uploadRes.json();
        if (uploadData.url) { finalImageUrl = uploadData.url; setBlobUrl(uploadData.url); }
      }

      const response = await fetch('/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: finalImageUrl, komonId: validSerial, title: finalTitle }) });
      const result = await response.json();
      if (!response.ok || !result.success) { setErrorMsg(`送信エラー`); return; }

      await navigator.clipboard.writeText(`図案ID: ${validSerial}\n作品名: ${finalTitle}`).catch(()=>{});
      alert(`[工場へのデータ送信完了]\n自動入力されているかご確認ください。`); 
      window.location.href = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(validSerial)}&title=${encodeURIComponent(finalTitle)}&image_url=${encodeURIComponent(finalImageUrl)}`;
    } catch { setErrorMsg('通信エラーが発生しました'); }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex flex-col items-center justify-start font-sans selection:bg-zinc-200 lg:p-8">

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
          handleItemTypeChange={handleItemTypeChange} setDisplayMode={setDisplayMode}
          handleDownloadMapping={handleDownloadMapping} UNIVERSAL_SCALE_FACTOR={UNIVERSAL_SCALE_FACTOR}
        />

        <ControlPanel
          creationMode={creationMode} setCreationMode={setCreationMode} 
          aiStyle={aiStyle} setAiStyle={setAiStyle}
          motif={motif} setMotif={setMotif}
          handleTagClick={handleTagClick}
          selectedColors={selectedColors} setSelectedColors={setSelectedColors} handleColorToggle={handleColorToggle}
          showColorPalette={showColorPalette} setShowColorPalette={setShowColorPalette} density={density} setDensity={setDensity}
          geoPatternType={geoPatternType} setGeoPatternType={setGeoPatternType} stripeDir={stripeDir} setStripeDir={setStripeDir}
          dotLayout={dotLayout} setDotLayout={setDotLayout} dotRadius={dotRadius} setDotRadius={setDotRadius}
          gapWidth={gapWidth} setGapWidth={setGapWidth} lineWidth={lineWidth} setLineWidth={setLineWidth}
          geoBgColor={geoBgColor} setGeoBgColor={setGeoBgColor} geoPatternColor={geoPatternColor} setGeoPatternColor={setGeoPatternColor}
          showGeoPaletteFor={showGeoPaletteFor} setShowGeoPaletteFor={setShowGeoPaletteFor}
          agreed={agreed} setAgreed={setAgreed} errorMsg={errorMsg}
          loading={loading} loadingEngine={loadingEngine}
          remainingFlux={remainingFlux} remainingOpenAI={remainingOpenAI}
          loadingStep={loadingStep} handleGenerate={handleGenerate}
          imageUrl={imageUrl} patternTitle={patternTitle} setPatternTitle={setPatternTitle}
          handleDownloadOriginal={handleDownloadOriginal} handleOrderClick={handleOrderClick}
        />
      </div>

      {CURRENT_NOTICE.enabled && (
        <div className="w-full max-w-7xl px-4 py-8 mt-12 flex justify-center border-t border-zinc-200">
          <button
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-950 underline decoration-zinc-300 transition-colors"
          >
            {CURRENT_NOTICE.category}を確認する
          </button>
        </div>
      )}

      <NoticeModal
        isOpen={isNoticeOpen}
        onClose={handleCloseNotice}
        onGoToGeometric={handleGoToGeometricFromNotice}
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
