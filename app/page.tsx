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
import { renderTiledGeometricPng } from './lib/production/canvasRenderer';

const MAX_FLUX_PER_DAY = 15;
const MAX_OPENAI_PER_DAY = 1;

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

  // モード：幾何学 / AI妄想 / 画像入稿
  const [creationMode, setCreationMode] = useState<'ai' | 'geometric' | 'upload'>('geometric');
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono'>('hanhaba');
  const [displayMode, setDisplayMode] = useState<'mockup' | 'trim' | 'data'>('mockup');
  
  const [aiStyle, setAiStyle] = useState<string>('none');
  const [selectedArtist, setSelectedArtist] = useState<string>('none');

  const [motif, setMotif] = useState<string>('');
  const [motif2, setMotif2] = useState<string>('');
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
  
  // 着物の帯・京袋帯の前腹の個別画像State
  const [customObiUrl, setCustomObiUrl] = useState<string | null>(null);
  const [customHaraUrl, setCustomHaraUrl] = useState<string | null>(null);

  const [agreed, setAgreed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingMode, setGeneratingMode] = useState<'flux' | 'openai_free' | 'openai_premium' | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  // 回数管理（スケッチ15回・無料1回・チケット残数）
  const [remainingFlux, setRemainingFlux] = useState<number>(MAX_FLUX_PER_DAY);
  const [remainingOpenAI, setRemainingOpenAI] = useState<number>(MAX_OPENAI_PER_DAY);
  const [ticketRemaining, setTicketRemaining] = useState<number | null>(null);

  const [premiumCode, setPremiumCode] = useState<string>('');
  const [premiumStatusMsg, setPremiumStatusMsg] = useState<string>('');

  const [imageUrl, setImageUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('GEO-INIT');
  const [patternTitle, setPatternTitle] = useState<string>('色無地');
  const [mockupSubmitting, setMockupSubmitting] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);

  // コピー完了状態の管理
  const [copiedPromptType, setCopiedPromptType] = useState<'seamless' | 'centered' | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 日付チェック
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
      const usedFlux = parseInt(localStorage.getItem('komon_count_flux') || '0', 10);
      const usedOpenAI = parseInt(localStorage.getItem('komon_count_openai') || '0', 10);
      setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - usedFlux));
      setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - usedOpenAI));
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

  // 「ぷっぴ」隠しコマンド
  useEffect(() => {
    if (motif.trim() === 'ぷっぴ') {
      localStorage.setItem('komon_count_flux', '0');
      localStorage.setItem('komon_count_openai', '0');
      setRemainingFlux(MAX_FLUX_PER_DAY);
      setRemainingOpenAI(MAX_OPENAI_PER_DAY);
      setMotif('');
      alert('【管理者モード】本日の生成回数を全回復しました。');
    }
  }, [motif]);

  useEffect(() => {
    const src = blobUrl || imageUrl;
    if (!src) {
      setRotatedPatternUrl('');
      return;
    }

    if (creationMode !== 'geometric' && itemType === 'hanhaba') {
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

  const handleCustomObiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCustomObiUrl(base64);
      try {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data: base64, filename: `custom_obi_${Date.now()}.png` }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) setCustomObiUrl(uploadData.url);
      } catch (err) {
        console.warn('帯画像のアップロード失敗:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomHaraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setCustomHaraUrl(base64);
      try {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data: base64, filename: `custom_hara_${Date.now()}.png` }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) setCustomHaraUrl(uploadData.url);
      } catch (err) {
        console.warn('前腹画像のアップロード失敗:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setUploadingImage(true);

    const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
    const newSerial = `USER-${Math.floor(1000 + Math.random() * 9000)}`;
    setPatternTitle(cleanFileName ? `${cleanFileName}（持ち込み）` : '持ち込み図案');
    setSerialNumber(newSerial);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setImageUrl(base64Data);
      setRotatedPatternUrl('');

      try {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, filename: `${newSerial}_original.png` }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          setBlobUrl(uploadData.url);
          setImageUrl(uploadData.url);
        } else {
          setBlobUrl(base64Data);
        }
      } catch (uploadErr) {
        console.error('Blob upload error:', uploadErr);
        setBlobUrl(base64Data);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyPrompt = (text: string, type: 'seamless' | 'centered') => {
    navigator.clipboard.writeText(text);
    setCopiedPromptType(type);
    setTimeout(() => setCopiedPromptType(null), 2000);
  };

  const handleGenerate = async (engineType: 'flux' | 'openai_free' | 'openai_premium') => {
    if (loading) return;

    if (creationMode === 'ai' && !agreed) {
      setErrorMsg('生成図案の利用に関する確認事項への同意が必要です。');
      return;
    }

    if (engineType === 'flux' && remainingFlux <= 0) {
      setErrorMsg('本日のスケッチ作成上限に達しました。');
      return;
    }
    if (engineType === 'openai_free' && remainingOpenAI <= 0) {
      setErrorMsg('本日の無料枠は終了しました。');
      return;
    }

    setErrorMsg('');
    setPremiumStatusMsg('');
    if (creationMode === 'ai' && !motif.trim()) { setErrorMsg('描きたいモチーフを入力してください。'); return; }
    for (const forbidden of FORBIDDEN_WORDS) {
      if (motif.includes(forbidden)) { setErrorMsg(`禁止ワード「${forbidden}」が含まれています。`); return; }
    }

    if (engineType === 'openai_premium' && !premiumCode.trim()) {
      setErrorMsg('チケットコードを入力してください。');
      return;
    }

    const actualEngine = engineType === 'flux' ? 'flux' : 'openai';
    setLoading(true);
    setGeneratingMode(engineType);
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
          motif2: motif2.trim(), 
          color: colorNames || 'おまかせ', 
          density, 
          itemType, 
          aiStyle, 
          artist: selectedArtist, 
          engine: actualEngine, 
          paymentMode: engineType === 'openai_premium' ? 'premium' : 'free',
          premiumCode: engineType === 'openai_premium' ? premiumCode.trim() : undefined,
          ticketCode: engineType === 'openai_premium' ? premiumCode.trim() : undefined,
          code: engineType === 'openai_premium' ? premiumCode.trim() : undefined,
          useTicket: engineType === 'openai_premium'
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || '画像生成に失敗しました');

      const elapsedTime = Date.now() - startTime;
      const MIN_WAIT_MS = actualEngine === 'openai' ? 5000 : 2500;
      if (elapsedTime < MIN_WAIT_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsedTime));
      }

      setImageUrl(data.imageUrl);
      setBlobUrl(data.blobUrl);
      
      const newSerial = `KOMON-${Math.floor(1000 + Math.random() * 9000)}`;
      setSerialNumber(newSerial);

      const colorPrefix = selectedColors.length > 0 ? `${getColorNameFromHex(selectedColors[0].hex)}の` : '';
      setPatternTitle(motif.trim() ? `${colorPrefix}${motif.trim()}小紋` : '無題の小紋');

      if (engineType === 'openai_premium') {
        const remaining = data.ticketRemaining ?? data.remaining ?? data.remainingCount ?? null;
        if (typeof remaining === 'number') {
          setTicketRemaining(remaining);
          setPremiumStatusMsg(`チケットを消費して生成しました（残り ${remaining} 回）`);
        } else {
          setPremiumStatusMsg('チケットを消費して高精度生成しました！');
        }
      } else if (engineType === 'openai_free') {
        const used = parseInt(localStorage.getItem('komon_count_openai') || '0', 10) + 1;
        localStorage.setItem('komon_count_openai', used.toString());
        setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - used));
      } else if (engineType === 'flux') {
        const used = parseInt(localStorage.getItem('komon_count_flux') || '0', 10) + 1;
        localStorage.setItem('komon_count_flux', used.toString());
        setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - used));
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || '通信エラーが発生しました');
    } finally {
      clearInterval(stepTimer);
      setLoading(false);
      setGeneratingMode(null);
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

        const isVerticalPattern = patternImg.height > patternImg.width * 1.5;
        let taikoPatternFill = patternFill;
        let haraPatternFill = patternFill;
        let haraRot = 0;

        if (isVerticalPattern && creationMode !== 'geometric') {
          const sqSize = patternImg.width; 
          const topCanvas = document.createElement('canvas');
          topCanvas.width = sqSize;
          topCanvas.height = sqSize;
          topCanvas.getContext('2d')!.drawImage(patternImg, 0, patternImg.height - sqSize, sqSize, sqSize, 0, 0, sqSize, sqSize);
          
          const pTopCanvas = document.createElement('canvas');
          pTopCanvas.width = bgWidth;
          pTopCanvas.height = bgWidth;
          const pTopCtx = pTopCanvas.getContext('2d')!;
          pTopCtx.drawImage(topCanvas, 0, 0, bgWidth, bgWidth);
          taikoPatternFill = ctx.createPattern(pTopCanvas, 'repeat')!;

          const btmCanvas = document.createElement('canvas');
          btmCanvas.width = sqSize;
          btmCanvas.height = sqSize;
          btmCanvas.getContext('2d')!.drawImage(patternImg, 0, 0, sqSize, sqSize, 0, 0, sqSize, sqSize);
          
          const pBtmCanvas = document.createElement('canvas');
          pBtmCanvas.width = bgWidth;
          pBtmCanvas.height = bgWidth;
          const pBtmCtx = pBtmCanvas.getContext('2d')!;
          pBtmCtx.drawImage(btmCanvas, 0, 0, bgWidth, bgWidth);
          haraPatternFill = ctx.createPattern(pBtmCanvas, 'repeat')!;
          
          haraRot = 90;
        }

        let individualHaraImg: HTMLImageElement | null = null;
        if (customHaraUrl) {
          try {
            individualHaraImg = await loadImage(customHaraUrl);
          } catch (e) {
            console.error('Failed to load custom hara image for canvas export:', e);
          }
        }

        const layers = [
          { id: 'hara', file: 'kyoubukurohara.png', rot: 271, bgX: 50, bgY: 50, fill: haraPatternFill, extraRot: haraRot },
          { id: 'tare', file: 'kyoubukurotare.png', rot: -1, bgX: 50, bgY: 50, fill: taikoPatternFill, extraRot: 0 },
          { id: 'taiko', file: 'kyoubukurotakio.png', rot: 2, bgX: 50, bgY: 50, fill: taikoPatternFill, extraRot: 0 },
        ];

        for (const layer of layers) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;
          const maskImg = await loadImage(`/${layer.file}?v=21`);
          tCtx.drawImage(maskImg, 0, 0, size, size);
          tCtx.globalCompositeOperation = 'source-in';

          if (layer.id === 'hara' && individualHaraImg) {
            const hRatio = Math.max(size / individualHaraImg.width, size / individualHaraImg.height);
            const drawW = individualHaraImg.width * hRatio;
            const drawH = individualHaraImg.height * hRatio;
            const drawX = (size - drawW) / 2;
            const drawY = (size - drawH) / 2;
            tCtx.drawImage(individualHaraImg, drawX, drawY, drawW, drawH);
          } else {
            tCtx.save();
            tCtx.translate(size / 2, size / 2);
            tCtx.rotate(layer.rot * Math.PI / 180);
            tCtx.translate(-size / 2, -size / 2);

            const rectSize = size * 1.5;
            const rectOffset = -size * 0.25;
            tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
            
            if (layer.extraRot) {
              tCtx.rotate(layer.extraRot * Math.PI / 180);
            }
            
            tCtx.fillStyle = layer.fill;
            tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); 
            tCtx.restore();
          }

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

        const jyouzan = await loadImage('/jyouzan.png?v=30');
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(jyouzan, 0, 0, size, size);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.font = 'bold 24px sans-serif';
      ctx.textBaseline = 'middle';
      const watermarkText = `ID: ${serialNumber || 'KOMON-XXXX'}`;
      const textWidth = ctx.measureText(watermarkText).width;
      
      const rectX = size - textWidth - 40;
      const rectY = size - 60;
      const rectW = textWidth + 30;
      const rectH = 40;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(rectX, rectY, rectW, rectH);

      ctx.fillStyle = '#111111';
      ctx.fillText(watermarkText, rectX + 15, rectY + (rectH / 2));

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

  // ★ 注文処理：半幅帯も着物と完全に同じ安全な正方形マスター画像を渡す
  const handleOrderClick = async (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      let finalImg = blobUrl || imageUrl;
      const validSerial = serialNumber || (creationMode === 'geometric' ? `GEO-${Math.floor(1000 + Math.random() * 9000)}` : `KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
      
      if (!serialNumber) setSerialNumber(validSerial);

      // Base64データ（幾何学モード等）のみアップロードしてURL化
      if (finalImg && finalImg.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data: finalImg, filename: `${validSerial}_${itemType}.png` }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          finalImg = uploadData.url;
        } else {
          throw new Error('画像データのアップロードに失敗しました。');
        }
      }

      if (itemType === 'kyobukuro' && customHaraUrl) {
        finalImg = `${finalImg}, ${customHaraUrl}`;
      }

      const finalTitle = patternTitle.trim() || '（無題）';

      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: finalImg, komonId: validSerial, title: finalTitle }),
        });
      } catch (mailErr) {
        console.warn('工房へのメール送信に失敗しました:', mailErr);
      }

      const result = await submitOrder(platform, {
        title: finalTitle,
        serialNumber: validSerial,
        imageUrl: finalImg,
        itemType,
        creationMode: creationMode === 'geometric' ? 'geometric' : 'ai',
        vendor: 'Printag Creator',
        designFee,
      });

      if (result.message) alert(result.message);

      // MakeShopへのURL自動振り分け（着物は7312、帯は7300）
      if (platform === 'makeshop') {
        let targetOrderUrl = 'https://store.gofukuyasan.com/view/item/000000007300';
        if (itemType === 'kimono') {
          targetOrderUrl = 'https://store.gofukuyasan.com/view/item/000000007312';
        }
        const cleanOrderUrl = `${targetOrderUrl}?komon_id=${encodeURIComponent(validSerial)}&title=${encodeURIComponent(finalTitle)}&image_url=${encodeURIComponent(finalImg)}`;
        window.location.href = cleanOrderUrl;
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '注文画面への遷移中にエラーが発生しました');
    }
  };

  const PROMPT_SEAMLESS = 'seamless textile pattern, full-bleed design, no humans, no mockups --tile --ar 1:1';
  const PROMPT_CENTERED = 'centered composition, artwork directly in the center, ample margin on left and right, full-bleed design, no humans, no mockups --ar 1:1';

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex flex-col items-center justify-start font-sans lg:p-8">
      
      <div className="w-full max-w-[1536px] flex flex-col lg:flex-row lg:gap-8 items-start justify-center">
        
        <div className="w-full lg:w-[55%] shrink-0">
          <PreviewArea
            imageUrl={imageUrl} blobUrl={blobUrl} rotatedPatternUrl={rotatedPatternUrl}
            serialNumber={serialNumber} itemType={itemType} displayMode={displayMode}
            creationMode={creationMode === 'geometric' ? 'geometric' : 'ai'} bgSizeMm={bgSizeMm}
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
            setCustomObiUrl={setCustomObiUrl}
            handleCustomObiUpload={handleCustomObiUpload}
            customHaraUrl={customHaraUrl}
            setCustomHaraUrl={setCustomHaraUrl}
            handleCustomHaraUpload={handleCustomHaraUpload}
            mockupSubmitting={mockupSubmitting} previewRef={previewRef} previewContainerRef={previewContainerRef}
            handleItemTypeChange={setItemType} setDisplayMode={setDisplayMode}
            handleDownloadMapping={handleDownloadMapping} UNIVERSAL_SCALE_FACTOR={UNIVERSAL_SCALE_FACTOR}
          />
        </div>

        <div className="w-full lg:w-[45%] flex flex-col gap-3">
          
          <div className="bg-white border border-zinc-300 shadow-sm p-1.5 flex gap-1 rounded-sm">
            <button
              type="button"
              onClick={() => setCreationMode('geometric')}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${
                creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              幾何学模様
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('ai')}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${
                creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              ✨ AI妄想
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('upload')}
              className={`flex-1 py-2 text-xs font-bold rounded transition-all ${
                creationMode === 'upload' ? 'bg-zinc-900 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              📁 画像入稿
            </button>
          </div>

          {creationMode === 'upload' ? (
            <div className="bg-white border border-zinc-300 shadow-xl p-5 flex flex-col gap-5 animate-fade-in rounded-sm">
              <div>
                <h2 className="text-sm font-black text-zinc-900 tracking-wider mb-1">【自作・外部AI画像の持ち込み】</h2>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Midjourneyやお持ちの画像生成AI、手描きイラストの画像をアップロードして原寸でマッピングシミュレーションできます。
                </p>
              </div>

              <div className="border-2 border-dashed border-zinc-300 rounded p-6 bg-zinc-50 hover:bg-zinc-100/80 transition-colors flex flex-col items-center justify-center text-center">
                <label className="cursor-pointer flex flex-col items-center justify-center w-full">
                  <span className="text-2xl mb-2">📤</span>
                  <span className="text-xs font-bold text-zinc-800 mb-1">
                    {uploadingImage ? '画像をアップロード中...' : 'メイン図案を選択、またはドラッグ＆ドロップ'}
                  </span>
                  <span className="text-[10px] text-zinc-500">推奨形式：正方形 (1:1) / PNG または JPEG</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleUserImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded">
                  {errorMsg}
                </div>
              )}

              {imageUrl && (
                <div className="p-3 bg-zinc-100 border border-zinc-200 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={imageUrl} alt="" className="w-10 h-10 object-cover rounded border border-zinc-300" />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 truncate max-w-[200px]">{patternTitle}</p>
                      <p className="text-[10px] font-mono text-zinc-500">{serialNumber}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">プレビュー反映中</span>
                </div>
              )}

              {itemType === 'kyobukuro' && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-800">京袋帯：前腹（お腹正面）の個別画像</span>
                      <p className="text-[9px] text-zinc-500">太鼓と別の柄を合わせたい場合のみ設定（回転せずそのまま配置）</p>
                    </div>
                    {customHaraUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomHaraUrl(null)}
                        className="text-[9px] text-red-600 underline font-bold"
                      >
                        解除
                      </button>
                    )}
                  </div>
                  <label className="py-2 text-[10px] font-bold text-center rounded border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer transition-colors block">
                    {customHaraUrl ? '前腹の画像を変更する' : '＋ 前腹の個別画像をアップロード'}
                    <input type="file" accept="image/*" onChange={handleCustomHaraUpload} className="hidden" />
                  </label>
                </div>
              )}

              {itemType === 'kimono' && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-800">着物：帯の個別画像</span>
                      <p className="text-[9px] text-zinc-500">自作の帯柄をコーディネートに重ねたい場合のみ設定</p>
                    </div>
                    {customObiUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomObiUrl(null)}
                        className="text-[9px] text-red-600 underline font-bold"
                      >
                        解除
                      </button>
                    )}
                  </div>
                  <label className="py-2 text-[10px] font-bold text-center rounded border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer transition-colors block">
                    {customObiUrl ? '帯の画像を変更する' : '＋ 帯の個別画像をアップロード'}
                    <input type="file" accept="image/*" onChange={handleCustomObiUpload} className="hidden" />
                  </label>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 mb-1">【外部AI生成用・末尾プロンプト】</h3>
                  <p className="text-[10px] text-zinc-500">
                    Midjourney等で思い通りの帯・着物データを作る際、プロンプトの末尾に足して出力してください。
                  </p>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-zinc-800">小紋・総柄（半幅帯・着物向け：リピート柄）</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(PROMPT_SEAMLESS, 'seamless')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                        copiedPromptType === 'seamless' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      {copiedPromptType === 'seamless' ? '✓ コピー完了！' : '📋 コピー'}
                    </button>
                  </div>
                  <code className="text-[10px] font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-700 break-all select-all">
                    {PROMPT_SEAMLESS}
                  </code>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-zinc-800">お太鼓・絵羽（京袋帯向け：センター主役）</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(PROMPT_CENTERED, 'centered')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors ${
                        copiedPromptType === 'centered' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      {copiedPromptType === 'centered' ? '✓ コピー完了！' : '📋 コピー'}
                    </button>
                  </div>
                  <code className="text-[10px] font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-700 break-all select-all">
                    {PROMPT_CENTERED}
                  </code>
                </div>
              </div>

              {imageUrl && (
                <div className="border-t border-zinc-200 pt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadOriginal}
                    className="w-full py-2.5 text-xs font-bold text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded transition-colors"
                  >
                    ↓ アップロード原寸画像を保存
                  </button>
                  <button
                    type="button"
                    onClick={handleOrderClick}
                    disabled={uploadingImage}
                    className="w-full py-3 text-center text-xs font-black text-white bg-zinc-900 hover:bg-zinc-800 rounded shadow-md transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? '画像を準備中...' : 'この持ち込み画像で仕立てる（注文へ）'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full [&>div]:!w-full [&>div]:!max-w-none">
              <ControlPanel
                creationMode={creationMode} setCreationMode={setCreationMode}
                itemType={itemType} setItemType={setItemType}
                aiStyle={aiStyle} setAiStyle={setAiStyle}
                selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist}
                motif={motif} setMotif={setMotif}
                motif2={motif2} setMotif2={setMotif2}
                selectedColors={selectedColors} setSelectedColors={setSelectedColors} handleColorToggle={handleColorToggle}
                showColorPalette={showColorPalette} setShowColorPalette={setShowColorPalette}
                density={density} setDensity={setDensity}
                geoPatternType={geoPatternType} setGeoPatternType={setGeoPatternType}
                stripeDir={stripeDir} setStripeDir={setStripeDir} dotLayout={dotLayout} setDotLayout={setDotLayout}
                dotRadius={dotRadius} setDotRadius={setDotRadius} gapWidth={gapWidth} setGapWidth={setGapWidth}
                lineWidth={lineWidth} setLineWidth={setLineWidth} geoBgColor={geoBgColor} setGeoBgColor={setGeoBgColor}
                geoPatternColor={geoPatternColor} setGeoPatternColor={setGeoPatternColor}
                showGeoPaletteFor={showGeoPaletteFor} setShowGeoPaletteFor={setShowGeoPaletteFor}
                agreed={agreed} setAgreed={setAgreed} errorMsg={errorMsg}
                loading={loading}
                generatingMode={generatingMode}
                remainingCount={remainingOpenAI}
                remainingFlux={remainingFlux}
                remainingOpenAI={remainingOpenAI}
                ticketRemaining={ticketRemaining}
                loadingStep={loadingStep}
                handleGenerate={handleGenerate} imageUrl={imageUrl} patternTitle={patternTitle} setPatternTitle={setPatternTitle}
                serialNumber={serialNumber}
                handleDownloadOriginal={handleDownloadOriginal} handleOrderClick={handleOrderClick}
                premiumCode={premiumCode} setPremiumCode={setPremiumCode}
                premiumStatusMsg={premiumStatusMsg}
              />
            </div>
          )}

        </div>
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
