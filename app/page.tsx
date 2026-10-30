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
  
  const [aiStyle, setAiStyle] = useState<string>('none');
  const [selectedArtist, setSelectedArtist] = useState<string>('none');

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

    const startTime = Date.now();
    const stepTimer = setInterval(() => setLoadingStep(prev => (prev + 1) % 5), 4000);

    try {
      const colorNames = selectedColors.map(c => getColorNameFromHex(c.hex)).join('、');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          motif: motif.trim(), 
          color: colorNames || 'おまかせ', 
          density, 
          itemType, 
          aiStyle, 
          artist: selectedArtist,
          engine: selectedEngine 
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '画像生成に失敗しました');

      const elapsedTime = Date.now() - startTime;
      const MIN_WAIT_MS = 20000;
      if (elapsedTime < MIN_WAIT_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsedTime));
      }

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
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${serialNumber || 'komon'}_original.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { 
      window.open(blobUrl || imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // ★ グレー化を根絶：Canvas APIによる自前レイヤー合成（1200x1200px高解像度PNG）
  const handleDownloadMapping = async () => {
    if (!previewContainerRef.current) return;
    try {
      setMockupSubmitting(true);

      const canvas = document.createElement('canvas');
      const size = 1200;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = (e) => {
          console.error('Image load error:', src, e);
          rej(e);
        };
        img.src = src;
      });

      const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
      if (!effectivePatternUrl) throw new Error('No pattern image');

      const patternImg = await loadImage(effectivePatternUrl);

      const pxPerMm = 27 / 11;
      const bgWidth = creationMode === 'geometric' ? (bgSizeMm * pxPerMm) : (180 * pxPerMm);
      const bgScale = bgWidth / Math.max(1, patternImg.width);
      const bgHeight = patternImg.height * bgScale;

      const pCanvas = document.createElement('canvas');
      pCanvas.width = Math.max(1, bgWidth);
      pCanvas.height = Math.max(1, bgHeight);
      const pCtx = pCanvas.getContext('2d')!;
      if (creationMode === 'geometric' && geoBgColor) {
        pCtx.fillStyle = geoBgColor;
        pCtx.fillRect(0, 0, bgWidth, bgHeight);
      }
      pCtx.drawImage(patternImg, 0, 0, bgWidth, bgHeight);

      const patternFill = ctx.createPattern(pCanvas, 'repeat')!;

      // 1. 半幅帯の合成
      if (itemType === 'hanhaba') {
        const layers = [
          { id: '01', file: 'hanhaba_Layer01.png', rot: 2,   bgX: 12, bgY: 34 },
          { id: '02', file: 'hanhaba_Layer02.png', rot: 1,   bgX: 45, bgY: 67 },
          { id: '03', file: 'hanhaba_Layer03.png', rot: 8,   bgX: 78, bgY: 12 }, 
          { id: '04', file: 'hanhaba_Layer04.png', rot: -1,  bgX: 23, bgY: 89 },
          { id: '05', file: 'hanhaba_Layer05.png', rot: -10, bgX: 56, bgY: 45 },
          { id: '06', file: 'hanhaba_Layer06.png', rot: -93, bgX: 89, bgY: 23 }, 
        ];

        for (const layer of layers) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;

          const maskImg = await loadImage(`/${layer.file}?v=21`);
          tCtx.drawImage(maskImg, 0, 0, size, size);

          tCtx.globalCompositeOperation = 'source-in';

          tCtx.save();
          tCtx.translate(size / 2, size / 2);
          tCtx.rotate(layer.rot * Math.PI / 180);
          tCtx.translate(-size / 2, -size / 2);

          const rectSize = size * 1.5;
          const rectOffset = -size * 0.25;

          tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
          tCtx.fillStyle = patternFill;
          tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); 
          tCtx.restore();

          ctx.drawImage(tempCanvas, 0, 0);
        }

        const tempCanvas7 = document.createElement('canvas');
        tempCanvas7.width = size;
        tempCanvas7.height = size;
        const tCtx7 = tempCanvas7.getContext('2d')!;
        const mask7 = await loadImage('/hanhaba_Layer07.png?v=21');
        tCtx7.drawImage(mask7, 0, 0, size, size);
        tCtx7.globalCompositeOperation = 'source-in';
        tCtx7.fillStyle = obiLiningColor || '#dcdddd';
        tCtx7.fillRect(0, 0, size, size);
        ctx.drawImage(tempCanvas7, 0, 0);

        const kage = await loadImage('/hanhaba_Layer_kage.png?v=21');
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5; 
        ctx.drawImage(kage, 0, 0, size, size);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      // 2. 京袋帯の合成
      if (itemType === 'kyobukuro') {
        const grandImg = await loadImage('/kyoubukurogrand.png?v=21');
        ctx.drawImage(grandImg, 0, 0, size, size);

        const urajiCanvas = document.createElement('canvas');
        urajiCanvas.width = size;
        urajiCanvas.height = size;
        const uCtx = urajiCanvas.getContext('2d')!;
        const urajiImg = await loadImage('/kyoubukurouraji.png?v=21');
        uCtx.drawImage(urajiImg, 0, 0, size, size);
        uCtx.globalCompositeOperation = 'source-in';
        uCtx.fillStyle = obiLiningColor || '#161616';
        uCtx.fillRect(0, 0, size, size);
        ctx.drawImage(urajiCanvas, 0, 0);

        const layers = [
          { id: 'hara', file: 'kyoubukurohara.png', rot: 271, bgX: 50, bgY: 50 },
          { id: 'tare', file: 'kyoubukurotare.png', rot: -1, bgX: 50, bgY: 50 },
          { id: 'taiko', file: 'kyoubukurotakio.png', rot: 2, bgX: 50, bgY: 50 },
        ];

        for (const layer of layers) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;
          const maskImg = await loadImage(`/${layer.file}?v=21`);
          tCtx.drawImage(maskImg, 0, 0, size, size);
          tCtx.globalCompositeOperation = 'source-in';

          tCtx.save();
          tCtx.translate(size / 2, size / 2);
          tCtx.rotate(layer.rot * Math.PI / 180);
          tCtx.translate(-size / 2, -size / 2);

          const rectSize = size * 1.5;
          const rectOffset = -size * 0.25;
          tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
          tCtx.fillStyle = patternFill;
          tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); 
          tCtx.restore();

          ctx.drawImage(tempCanvas, 0, 0);
        }

        const kage = await loadImage('/kyoubukuromask.png?v=21');
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5; 
        ctx.drawImage(kage, 0, 0, size, size);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      // 3. 着物の合成
      if (itemType === 'kimono') {
        const haikei = await loadImage('/haikei.png?v=30');
        ctx.drawImage(haikei, 0, 0, size, size);

        const kimonoBgWidth = bgWidth / 2;
        const kimonoBgHeight = bgHeight / 2;
        const kpCanvas = document.createElement('canvas');
        kpCanvas.width = Math.max(1, kimonoBgWidth);
        kpCanvas.height = Math.max(1, kimonoBgHeight);
        const kpCtx = kpCanvas.getContext('2d')!;
        if (creationMode === 'geometric' && geoBgColor) {
          kpCtx.fillStyle = geoBgColor;
          kpCtx.fillRect(0, 0, kimonoBgWidth, kimonoBgHeight);
        }
        kpCtx.drawImage(patternImg, 0, 0, kimonoBgWidth, kimonoBgHeight);
        const kimonoPatternFill = ctx.createPattern(kpCanvas, 'repeat')!;

        const kimonoLayers = [
          { id: 'usiromigoro', file: 'usiromigoro_75.png', angle: 75, bgX: 50, bgY: 50 },
          { id: 'migisode', file: 'migisode_165.png', angle: 165, bgX: 20, bgY: 30 },
          { id: 'hidarisode', file: 'hidarisode_150.png', angle: 150, bgX: 80, bgY: 40 },
          { id: 'hidarisode2', file: 'hidarisode2_175.png', angle: 175, bgX: 80, bgY: 70 },
          { id: 'maemigoro', file: 'maemigoro_105.png', angle: 105, bgX: 45, bgY: 60 },
          { id: 'maemigoro2', file: 'maemigoro2_140.png', angle: 140, bgX: 45, bgY: 20 },
          { id: 'maeokumi', file: 'maeokumi_110.png', angle: 110, bgX: 55, bgY: 50 },
          { id: 'migieri', file: 'migieri_65.png', angle: 65, bgX: 30, bgY: 10 },
          { id: 'hidarieri', file: 'hidarieri_117.png', angle: 117, bgX: 70, bgY: 10 },
        ];

        for (const layer of kimonoLayers) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;
          const maskImg = await loadImage(`/${layer.file}?v=30`);
          tCtx.drawImage(maskImg, 0, 0, size, size);
          tCtx.globalCompositeOperation = 'source-in';

          tCtx.save();
          tCtx.translate(size / 2, size / 2);
          tCtx.rotate((layer.angle - 90) * Math.PI / 180);
          tCtx.translate(-size / 2, -size / 2);

          const rectSize = size * 2;
          const rectOffset = -size * 0.5;
          tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
          tCtx.fillStyle = kimonoPatternFill;
          tCtx.fillRect(-size * 2, -size * 2, size * 5, size * 5);
          tCtx.restore();

          ctx.drawImage(tempCanvas, 0, 0);
        }

        // 半衿
        const haneriCanvas = document.createElement('canvas');
        haneriCanvas.width = size;
        haneriCanvas.height = size;
        const hCtx = haneriCanvas.getContext('2d')!;
        const haneriMask = await loadImage('/haneri.png?v=30');
        hCtx.drawImage(haneriMask, 0, 0, size, size);
        hCtx.globalCompositeOperation = 'source-in';
        hCtx.fillStyle = kimonoHaneriColor || '#ffffff';
        hCtx.fillRect(0, 0, size, size);
        ctx.drawImage(haneriCanvas, 0, 0);

        // 帯揚げ
        const obiageCanvas = document.createElement('canvas');
        obiageCanvas.width = size;
        obiageCanvas.height = size;
        const oCtx = obiageCanvas.getContext('2d')!;
        const obiageMask = await loadImage('/obiage.png?v=30');
        oCtx.drawImage(obiageMask, 0, 0, size, size);
        oCtx.globalCompositeOperation = 'source-in';
        oCtx.fillStyle = kimonoObiageColor || '#c82a36';
        oCtx.fillRect(0, 0, size, size);
        ctx.drawImage(obiageCanvas, 0, 0);

        // 帯
        const obiCanvas = document.createElement('canvas');
        obiCanvas.width = size;
        obiCanvas.height = size;
        const obCtx = obiCanvas.getContext('2d')!;
        const obiMask = await loadImage('/obi_2.png?v=30');
        obCtx.drawImage(obiMask, 0, 0, size, size);
        obCtx.globalCompositeOperation = 'source-in';
        if (customObiUrl) {
          const customObiImg = await loadImage(customObiUrl);
          obCtx.drawImage(customObiImg, 0, 0, size, size);
        } else {
          obCtx.fillStyle = kimonoObiColor || '#1a1a1a';
          obCtx.fillRect(0, 0, size, size);
        }
        ctx.drawImage(obiCanvas, 0, 0);

        // 乗算シャドウ
        const jyouzan = await loadImage('/jyouzan.png?v=30');
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(jyouzan, 0, 0, size, size);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      const finalUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = finalUrl;
      a.download = `${serialNumber || 'mapping'}_${itemType}_mockup.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (e) {
      console.error(e);
      alert('ダウンロード画像の生成に失敗しました。');
    } finally {
      setMockupSubmitting(false);
    }
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
          aiStyle={aiStyle} setAiStyle={setAiStyle}
          selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist}
          motif={motif} setMotif={setMotif}
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
