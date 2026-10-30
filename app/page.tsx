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

const MAX_FLUX_PER_DAY = 15;
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

async function render18cmPrintDataPng(patternUrl: string, creationMode: 'ai' | 'geometric', bgSizeMm: number, bgColor: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 2400;
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
          const scale = 1080 / img.naturalWidth;
          const scaledHeight = img.naturalHeight * scale;
          for (let y = 0; y < 2400; y += scaledHeight) { ctx.drawImage(img, 0, y, 1080, scaledHeight); }
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
  
  // デュアルエンジン残回数（FLUX 15回 / OpenAI 1回）
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
  
  // 新着ポップアップ状態
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
      alert('管理者モード：本日の生成回数を回復しました。\n・軽快スケッチ（FLUX）: 15回\n・本番清書（OpenAI）: 1回');
    }
  }, [motif]);

  useEffect(() => {
    const src = blobUrl || imageUrl;
    if (!src) { setRotatedPatternUrl(''); return; }
    if (creationMode === 'ai' && itemType === 'hanhaba') {
      rotateImage90Degrees(src)
        .then((rotated) => setRotatedPatternUrl(rotated))
        .catch(() => setRotatedPatternUrl(src));
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
      alert('[本日のスケッチ上限に達しました]\n\n軽快スケッチ（FLUX）は1日15回までご利用いただけます。');
      return;
    }
    if (engine === 'openai' && oCount >= MAX_OPENAI_PER_DAY) {
      setRemainingOpenAI(0);
      alert('[本日の清書上限に達しました]\n\n最高精細の「本番清書」はお一人様1日1回までとなっております。');
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

  const handleDownloadMapping = async () => {
    if (!previewContainerRef.current) return;
    try {
      setMockupSubmitting(true);
      const canvas = document.createElement('canvas');
      const size = 1200; canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((res, rej) => {
        const img = new Image(); img.crossOrigin = 'anonymous';
        img.onload = () => res(img); img.onerror = (e) => rej(e); img.src = src;
      });

      const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
      if (!effectivePatternUrl) throw new Error('No image');
      const patternImg = await loadImage(effectivePatternUrl);

      if (itemType === 'hanhaba' || itemType === 'kyobukuro') {
        const pxPerMm = 27 / 11;
        const effectiveBase = itemType === 'hanhaba' ? (size * 0.45) : (size * 0.65);
        const bgWidth = creationMode === 'geometric' ? (bgSizeMm * pxPerMm) : effectiveBase;
        const bgScale = bgWidth / Math.max(1, patternImg.width);
        const bgHeight = patternImg.height * bgScale;
        const pCanvas = document.createElement('canvas');
        pCanvas.width = bgWidth; pCanvas.height = bgHeight;
        const pCtx = pCanvas.getContext('2d');
        if (creationMode === 'geometric' && geoBgColor) { pCtx!.fillStyle = geoBgColor; pCtx!.fillRect(0, 0, bgWidth, bgHeight); }
        pCtx!.drawImage(patternImg, 0, 0, bgWidth, bgHeight);
        const patternFill = ctx.createPattern(pCanvas, 'repeat')!;

        if (itemType === 'hanhaba') {
          const layers = [
            { id: '01', file: '/hanhaba_Layer01.png', rot: 2, bgX: 12, bgY: 34 }, 
            { id: '02', file: '/hanhaba_Layer02.png', rot: 1, bgX: 45, bgY: 67 }, 
            { id: '03', file: '/hanhaba_Layer03.png', rot: 8, bgX: 78, bgY: 12 }, 
            { id: '04', file: '/hanhaba_Layer04.png', rot: -1, bgX: 23, bgY: 89 }, 
            { id: '05', file: '/hanhaba_Layer05.png', rot: -10, bgX: 56, bgY: 45 }, 
            { id: '06', file: '/hanhaba_Layer06.png', rot: -93, bgX: 89, bgY: 23 }
          ];
          for (const layer of layers) {
            const tempCanvas = document.createElement('canvas'); tempCanvas.width = size; tempCanvas.height = size;
            const tCtx = tempCanvas.getContext('2d')!;
            const maskImg = await loadImage(`${layer.file}?v=21`);
            tCtx.drawImage(maskImg, 0, 0, size, size);
            tCtx.globalCompositeOperation = 'source-in';
            tCtx.save(); tCtx.translate(size/2, size/2); tCtx.rotate(layer.rot * Math.PI / 180); tCtx.translate(-size/2, -size/2);
            const rectSize = size * 1.5; const rectOffset = -size * 0.25;
            tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
            tCtx.fillStyle = patternFill; tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); tCtx.restore();
            ctx.drawImage(tempCanvas, 0, 0);
          }
          const mask7 = await loadImage('/hanhaba_Layer07.png?v=21');
          const tempCanvas7 = document.createElement('canvas'); tempCanvas7.width = size; tempCanvas7.height = size;
          const tCtx7 = tempCanvas7.getContext('2d')!;
          tCtx7.drawImage(mask7, 0, 0, size, size);
          tCtx7.globalCompositeOperation = 'source-in'; tCtx7.fillStyle = obiLiningColor || '#dcdddd'; tCtx7.fillRect(0, 0, size, size);
          ctx.drawImage(tempCanvas7, 0, 0);
          const kage = await loadImage('/hanhaba_Layer_kage.png?v=21');
          ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(kage, 0, 0, size, size);
          ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';
        }

        if (itemType === 'kyobukuro') {
          const grandImg = await loadImage('/kyoubukurogrand.png?v=21'); ctx.drawImage(grandImg, 0, 0, size, size);
          const urajiCanvas = document.createElement('canvas'); urajiCanvas.width = size; urajiCanvas.height = size;
          const uCtx = urajiCanvas.getContext('2d')!;
          const urajiImg = await loadImage('/kyoubukurouraji.png?v=21'); uCtx.drawImage(urajiImg, 0, 0, size, size);
          uCtx.globalCompositeOperation = 'source-in'; uCtx.fillStyle = obiLiningColor || '#161616'; uCtx.fillRect(0, 0, size, size);
          ctx.drawImage(urajiCanvas, 0, 0);
          
          for (const layer of [ { file: '/kyoubukurohara.png', rot: 271, bgX: 50, bgY: 50 }, { file: '/kyoubukurotare.png', rot: -1, bgX: 50, bgY: 50 }, { file: '/kyoubukurotakio.png', rot: 2, bgX: 50, bgY: 50 } ]) {
            const tempCanvas = document.createElement('canvas'); tempCanvas.width = size; tempCanvas.height = size;
            const tCtx = tempCanvas.getContext('2d')!;
            const maskImg = await loadImage(`${layer.file}?v=21`); tCtx.drawImage(maskImg, 0, 0, size, size);
            tCtx.globalCompositeOperation = 'source-in'; tCtx.save(); tCtx.translate(size/2, size/2); tCtx.rotate(layer.rot * Math.PI / 180); tCtx.translate(-size/2, -size/2);
            tCtx.translate(-size * 0.25 + (size * 1.5 * layer.bgX / 100), -size * 0.25 + (size * 1.5 * layer.bgY / 100));
            tCtx.fillStyle = patternFill; tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); tCtx.restore();
            ctx.drawImage(tempCanvas, 0, 0);
          }
          const kage = await loadImage('/kyoubukuromask.png?v=21');
          ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(kage, 0, 0, size, size);
          ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';
        }
      }

      if (itemType === 'kimono') {
        const kimonoPxPerMm = 1200 / 600; 
        const kBgWidth = creationMode === 'geometric' ? ((bgSizeMm * kimonoPxPerMm) / 2) : (size * 0.42);
        const kBgScale = kBgWidth / Math.max(1, patternImg.width);
        const kBgHeight = patternImg.height * kBgScale;
        const kPCanvas = document.createElement('canvas'); kPCanvas.width = kBgWidth; kPCanvas.height = kBgHeight;
        const kPCtx = kPCanvas.getContext('2d')!;
        if (creationMode === 'geometric' && geoBgColor) { kPCtx.fillStyle = geoBgColor; kPCtx.fillRect(0,0,kBgWidth, kBgHeight); }
        kPCtx.drawImage(patternImg, 0, 0, kBgWidth, kBgHeight);
        const kimonoPatternFill = ctx.createPattern(kPCanvas, 'repeat')!;

        const bgImg = await loadImage('/haikei.png?v=30'); ctx.drawImage(bgImg, 0, 0, size, size);

        const kimonoLayers = [ { file: '/usiromigoro_75.png', angle: 75, bgX: 50, bgY: 50 }, { file: '/migisode_165.png', angle: 165, bgX: 20, bgY: 30 }, { file: '/hidarisode_150.png', angle: 150, bgX: 80, bgY: 40 }, { file: '/hidarisode2_175.png', angle: 175, bgX: 80, bgY: 70 }, { file: '/maemigoro_105.png', angle: 105, bgX: 45, bgY: 60 }, { file: '/maemigoro2_140.png', angle: 140, bgX: 45, bgY: 20 }, { file: '/maeokumi_110.png', angle: 110, bgX: 55, bgY: 50 }, { file: '/migieri_65.png', angle: 65, bgX: 30, bgY: 10 }, { file: '/hidarieri_117.png', angle: 117, bgX: 70, bgY: 10 } ];
        for (const layer of kimonoLayers) {
          const tempCanvas = document.createElement('canvas'); tempCanvas.width = size; tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;
          const maskImg = await loadImage(`${layer.file}?v=30`); tCtx.drawImage(maskImg, 0, 0, size, size);
          tCtx.globalCompositeOperation = 'source-in'; tCtx.save(); tCtx.translate(size/2, size/2); tCtx.rotate((layer.angle - 90) * Math.PI / 180); tCtx.translate(-size/2, -size/2);
          tCtx.translate(-size * 0.25 + (size * 1.5 * layer.bgX / 100), -size * 0.25 + (size * 1.5 * layer.bgY / 100));
          tCtx.fillStyle = kimonoPatternFill; tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); tCtx.restore();
          ctx.drawImage(tempCanvas, 0, 0);
        }

        const hCanvas = document.createElement('canvas'); hCanvas.width = size; hCanvas.height = size;
        const hCtx = hCanvas.getContext('2d')!; hCtx.drawImage(await loadImage('/haneri.png?v=30'), 0, 0, size, size);
        hCtx.globalCompositeOperation = 'source-in'; hCtx.fillStyle = kimonoHaneriColor; hCtx.fillRect(0,0,size,size);
        hCtx.fillStyle = 'rgba(0,0,0,0.03)'; hCtx.fillRect(0,0,size,size); ctx.drawImage(hCanvas, 0, 0);

        const oaCanvas = document.createElement('canvas'); oaCanvas.width = size; oaCanvas.height = size;
        const oaCtx = oaCanvas.getContext('2d')!; oaCtx.drawImage(await loadImage('/obiage.png?v=30'), 0, 0, size, size);
        oaCtx.globalCompositeOperation = 'source-in'; oaCtx.fillStyle = kimonoObiageColor; oaCtx.fillRect(0,0,size,size); ctx.drawImage(oaCanvas, 0, 0);

        const oCanvas = document.createElement('canvas'); oCanvas.width = size; oCanvas.height = size;
        const oCtx = oCanvas.getContext('2d')!; oCtx.drawImage(await loadImage('/obi_2.png?v=30'), 0, 0, size, size);
        oCtx.globalCompositeOperation = 'source-in';
        if (customObiUrl) { oCtx.drawImage(await loadImage(customObiUrl), 0, 0, size, size); } else { oCtx.fillStyle = kimonoObiColor; oCtx.fillRect(0,0,size,size); }
        ctx.drawImage(oCanvas, 0, 0);

        ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.5; ctx.drawImage(await loadImage('/jyouzan.png?v=30'), 0, 0, size, size);
        ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = 'source-over';
      }

      const finalUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a'); a.href = finalUrl; a.download = `${patternTitle || serialNumber || 'mapping'}_preview.png`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch (e) { alert('ダウンロード画像の生成に失敗しました。'); } finally { setMockupSubmitting(false); }
  };

  const finalTitle = patternTitle.trim() || '（無題）';

  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      let finalImageUrl = blobUrl || imageUrl;
      const validSerial = serialNumber || `KOMON-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!serialNumber) setSerialNumber(validSerial);
      if (itemType === 'hanhaba') finalImageUrl = await render18cmPrintDataPng(creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl), creationMode, bgSizeMm, geoBgColor);

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
      {CURRENT_NOTICE.enabled && (
        <div className="w-full max-w-7xl px-4 py-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-950 underline decoration-zinc-300 transition-colors"
          >
            {CURRENT_NOTICE.category}を確認する
          </button>
        </div>
      )}

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
