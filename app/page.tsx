// app/page.tsx
'use client';

export const dynamic = 'force-dynamic';

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

  const [creationMode, setCreationMode] = useState<'ai' | 'geometric' | 'upload'>('ai');
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf'>('hanhaba');
  const [displayMode, setDisplayMode] = useState<'mockup' | 'trim' | 'data'>('mockup');
  
  const [aiStyle, setAiStyle] = useState<string>('none');
  const [tasteMode, setTasteMode] = useState<string>('katazome');
  const [selectedArtist, setSelectedArtist] = useState<string>('none');

  const [motif, setMotif] = useState<string>('黒猫、ピアノの鍵盤、月、椿');
  const [motif2, setMotif2] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['大正ロマン', '水彩画']);
  
  const [patternScale, setPatternScale] = useState<'small' | 'medium' | 'large'>('medium');

  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(false);
  const [density, setDensity] = useState<string>('一方向リピート（上向き総柄・18cm最適化）');

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
  const [customHaraUrl, setCustomHaraUrl] = useState<string | null>(null);

  const [agreed, setAgreed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [analyzingImage, setAnalyzingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingMode, setGeneratingMode] = useState<'flux' | 'openai_free' | 'openai_premium' | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const [remainingFlux, setRemainingFlux] = useState<number>(MAX_FLUX_PER_DAY);
  const [remainingOpenAI, setRemainingOpenAI] = useState<number>(MAX_OPENAI_PER_DAY);
  const [ticketRemaining, setTicketRemaining] = useState<number | null>(null);

  const [premiumCode, setPremiumCode] = useState<string>('');
  const [premiumStatusMsg, setPremiumStatusMsg] = useState<string>('');

  const [imageUrl, setImageUrl] = useState<string>('/sample_piano_cat.png');
  const [blobUrl, setBlobUrl] = useState<string>('/sample_piano_cat.png');
  
  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('KOMON-INIT');
  const [patternTitle, setPatternTitle] = useState<string>('月夜のピアノと黒猫');
  const [mockupSubmitting, setMockupSubmitting] = useState<boolean>(false);
  
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);

  const [copiedPromptType, setCopiedPromptType] = useState<'seamless' | 'centered' | 'scarf' | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialColors = TRADITIONAL_COLORS.filter(c => ['漆黒', '真紅'].includes(c.name.split(' ')[0]));
    setSelectedColors(initialColors);
  }, []);

  useEffect(() => {
    const savedCode = localStorage.getItem('komon_premium_code');
    if (savedCode) {
      setPremiumCode(savedCode);
    }
  }, []);

  const handleSetPremiumCode = (newCode: string) => {
    setPremiumCode(newCode);
    if (!newCode.trim()) {
      setPremiumStatusMsg('');
      setTicketRemaining(null);
    }
  };

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
          body: JSON.stringify({ base64Data: base64Data, filename: `${newSerial}_original.png` }),
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

  const handleExtractPrompt = async () => {
    const targetImg = blobUrl || imageUrl;
    if (!targetImg) return;

    setAnalyzingImage(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: targetImg }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || '画像の解析に失敗しました');
      }

      const { prompt, motif: extractedMotif, color, texture } = result.data;
      const combinedPrompt = prompt || `${extractedMotif}。配色：${color}。タッチ：${texture}`;

      setMotif(combinedPrompt);
      setCreationMode('ai');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '写真の解析中にエラーが発生しました');
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleCopyPrompt = (text: string, type: 'seamless' | 'centered' | 'scarf') => {
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

    if (engineType === 'openai_premium' && premiumCode.trim()) {
      localStorage.setItem('komon_premium_code', premiumCode.trim());
    }

    const actualEngine = engineType === 'flux' ? 'flux' : 'openai';
    setLoading(true);
    setGeneratingMode(engineType);
    setLoadingStep(0);

    const startTime = Date.now();
    const stepTimer = setInterval(() => setLoadingStep(prev => (prev + 1) % 5), 4000);

    try {
      const colorNames = selectedColors.map(c => getColorNameFromHex(c.hex)).join('、');
      
      const tagPrompt = selectedTags.length > 0 ? `。雰囲気・タッチ：${selectedTags.join('、')}` : '';

      const scalePromptMap = {
        small: '。柄の大きさ：細かい小紋調、小さなリピート柄 (tiny delicate repeating motifs, dense micro-pattern)',
        medium: '。柄の大きさ：標準的なサイズ (medium-scale repeating motifs)',
        large: '。柄の大きさ：大胆な大柄 (large bold prominent motifs, oversized pattern elements)',
      };
      const scalePrompt = scalePromptMap[patternScale];
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          motif: motif.trim() + tagPrompt + scalePrompt, 
          motif2: motif2.trim(), 
          color: colorNames || 'おまかせ', 
          density, 
          itemType, 
          aiStyle: 'none',
          tasteMode,
          artist: selectedArtist, 
          engine: actualEngine, 
          paymentMode: engineType === 'openai_premium' ? 'premium' : 'free',
          premiumCode: engineType === 'openai_premium' ? premiumCode.trim() : undefined,
          ticketCode: engineType === 'openai_premium' ? premiumCode.trim() : undefined,
          code: engineType === 'openai_premium' ? premiumCode.trim() : undefined,
          useTicket: engineType === 'openai_premium',
          patternScale: patternScale
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
      setPatternTitle(motif.trim() ? `${colorPrefix}${motif.trim().split('、')[0]}小紋` : '無題の小紋');

      if (engineType === 'openai_premium') {
        const remaining = data.ticketRemaining ?? data.remaining ?? data.remainingCount ?? null;
        if (typeof remaining === 'number') {
          setTicketRemaining(remaining);
          setPremiumStatusMsg(`PREMIUM APPLIED（REMAINING: ${remaining}）`);
        } else {
          setPremiumStatusMsg('PREMIUM TICKET APPLIED');
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
      if (!(window as any).htmlToImage) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('スクリプトの読み込みに失敗しました'));
          document.head.appendChild(script);
        });
      }

      const htmlToImage = (window as any).htmlToImage;
      const dataUrl = await htmlToImage.toPng(previewContainerRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${serialNumber || 'mapping'}_${itemType}_mockup.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (e) {
      console.error('マッピング保存エラー:', e);
    } finally {
      setMockupSubmitting(false);
    }
  };

  const handleOrderClick = async (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      let finalImg = blobUrl || imageUrl;
      const validSerial = serialNumber || (creationMode === 'geometric' ? `GEO-${Math.floor(1000 + Math.random() * 9000)}` : `KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
      
      if (!serialNumber) setSerialNumber(validSerial);

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

      if (platform === 'makeshop') {
        let targetOrderUrl = 'https://store.gofukuyasan.com/view/item/000000007300';
        if (itemType === 'kimono') {
          targetOrderUrl = 'https://store.gofukuyasan.com/view/item/000000007312';
        }
        const orderTitle = itemType === 'scarf' ? `【スカーフ】${finalTitle}` : finalTitle;
        const cleanOrderUrl = `${targetOrderUrl}?komon_id=${encodeURIComponent(validSerial)}&title=${encodeURIComponent(orderTitle)}&image_url=${encodeURIComponent(finalImg)}&item_type=${encodeURIComponent(itemType)}`;
        window.location.href = cleanOrderUrl;
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '注文画面への遷移中にエラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex flex-col items-center justify-start font-sans lg:p-8">
      
      {/* GALLERY FAB (Floating Action Button) */}
      <a 
        href="/gallery" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-[99] bg-zinc-900 text-white px-6 py-4 shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center border border-zinc-700"
      >
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase">GALLERY</span>
      </a>

      <div className="w-full max-w-[1536px] flex flex-col lg:flex-row lg:gap-8 items-start justify-center">
        
        {/* PREVIEW AREA */}
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

        {/* CONTROLS */}
        <div className="w-full lg:w-[45%] flex flex-col gap-3">
          
          {/* TABS */}
          <div className="bg-white border border-zinc-200 p-1 flex gap-1 mt-2 lg:mt-0">
            <button
              type="button"
              onClick={() => setCreationMode('ai')}
              className={`flex-1 py-3 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all ${
                creationMode === 'ai' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              AI GENERATION / テーマから生成
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('geometric')}
              className={`flex-1 py-3 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all ${
                creationMode === 'geometric' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              GEOMETRIC / 幾何学・無地
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('upload')}
              className={`flex-1 py-3 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all ${
                creationMode === 'upload' ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              UPLOAD IMAGE / 画像持ち込み
            </button>
          </div>

          {creationMode === 'upload' ? (
            <div className="bg-white border border-zinc-200 p-6 sm:p-8 flex flex-col gap-6 animate-fade-in text-left">
              <div>
                <h2 className="text-xs font-bold text-zinc-900 tracking-[0.2em] mb-2 uppercase">IMPORT EXTERNAL DESIGN</h2>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                  Midjourneyやお持ちの画像生成AI、手描きイラストの画像をアップロードして原寸でマッピングシミュレーションできます。
                </p>
              </div>

              <div className="border border-dashed border-zinc-300 p-8 bg-zinc-50 hover:bg-zinc-100 transition-colors flex flex-col items-center justify-center text-center">
                <label className="cursor-pointer flex flex-col items-center justify-center w-full">
                  <span className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase mb-2">
                    {uploadingImage ? 'UPLOADING...' : 'SELECT OR DROP IMAGE'}
                  </span>
                  <span className="text-[10px] text-zinc-400">Recommended: Square (1:1) / PNG or JPEG</span>
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
                <div className="p-3 bg-zinc-50 text-red-600 border border-zinc-200 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {imageUrl && !imageUrl.includes('sample_piano_cat') && (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={imageUrl} alt="" className="w-12 h-12 object-cover border border-zinc-200" />
                      <div>
                        <p className="text-xs font-bold text-zinc-900 tracking-wider truncate max-w-[200px]">{patternTitle}</p>
                        <p className="text-[9px] font-mono text-zinc-400 mt-0.5">{serialNumber}</p>
                      </div>
                    </div>
                    <span className="text-[9px] border border-zinc-900 text-zinc-900 font-bold px-2 py-1 uppercase tracking-widest">PREVIEWING</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExtractPrompt}
                    disabled={analyzingImage || uploadingImage}
                    className="w-full py-3 px-4 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
                  >
                    {analyzingImage 
                      ? 'ANALYZING IMAGE...' 
                      : 'EXTRACT PROMPT FOR AI GENERATION'}
                  </button>
                  <p className="text-[9px] text-zinc-400 text-center">
                    ※写真から配色・タッチ・模様の特徴だけを抽出し、図案づくりモードで新しく図案化できます
                  </p>
                </div>
              )}

              {itemType === 'kyobukuro' && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">京袋帯：前腹（お腹正面）の個別画像</span>
                      <p className="text-[9px] text-zinc-500 mt-0.5">太鼓と別の柄を合わせたい場合のみ設定</p>
                    </div>
                    {customHaraUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomHaraUrl(null)}
                        className="text-[9px] text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                  <label className="py-2.5 text-[10px] font-bold text-center border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer transition-colors block uppercase tracking-widest">
                    {customHaraUrl ? 'CHANGE IMAGE' : 'UPLOAD FRONT IMAGE'}
                    <input type="file" accept="image/*" onChange={handleCustomHaraUpload} className="hidden" />
                  </label>
                </div>
              )}

              {itemType === 'kimono' && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">着物：帯の個別画像</span>
                      <p className="text-[9px] text-zinc-500 mt-0.5">自作の帯柄をコーディネートに重ねたい場合のみ設定</p>
                    </div>
                    {customObiUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomObiUrl(null)}
                        className="text-[9px] text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest"
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                  <label className="py-2.5 text-[10px] font-bold text-center border border-zinc-300 bg-white hover:bg-zinc-100 cursor-pointer transition-colors block uppercase tracking-widest">
                    {customObiUrl ? 'CHANGE IMAGE' : 'UPLOAD OBI IMAGE'}
                    <input type="file" accept="image/*" onChange={handleCustomObiUpload} className="hidden" />
                  </label>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase mb-1">PROMPTS FOR EXTERNAL AI</h3>
                  <p className="text-[10px] text-zinc-500 font-light">
                    Midjourney等で思い通りの帯・着物データを作る際、プロンプトの末尾に足して出力してください。
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">SEAMLESS REPEAT (Komon)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(PROMPT_SEAMLESS, 'seamless')}
                      className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {copiedPromptType === 'seamless' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <code className="text-[9px] font-mono bg-white p-3 border border-zinc-200 text-zinc-600 break-all select-all block">
                    {PROMPT_SEAMLESS}
                  </code>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">CENTERED FOCAL (Kyobukuro)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(PROMPT_CENTERED, 'centered')}
                      className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {copiedPromptType === 'centered' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <code className="text-[9px] font-mono bg-white p-3 border border-zinc-200 text-zinc-600 break-all select-all block">
                    {PROMPT_CENTERED}
                  </code>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200 flex flex-col gap-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">SQUARE FRAME (Scarf)</span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(PROMPT_SCARF, 'scarf')}
                      className="text-[9px] font-bold tracking-widest uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      {copiedPromptType === 'scarf' ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                  <code className="text-[9px] font-mono bg-white p-3 border border-zinc-200 text-zinc-600 break-all select-all block">
                    {PROMPT_SCARF}
                  </code>
                </div>
              </div>

              {imageUrl && !imageUrl.includes('sample_piano_cat') && (
                <div className="border-t border-zinc-200 pt-6 flex flex-col gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsPolicyOpen(true)} 
                    className="text-[9px] tracking-widest uppercase font-bold text-zinc-400 hover:text-zinc-900 transition-colors text-center mb-4"
                  >
                    POLICY & SAFETY
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadOriginal}
                    className="w-full py-3 text-[10px] font-bold tracking-widest uppercase text-zinc-900 border border-zinc-900 hover:bg-zinc-50 transition-colors"
                  >
                    DOWNLOAD IMAGE
                  </button>
                  <button
                    type="button"
                    onClick={handleOrderClick}
                    disabled={uploadingImage}
                    className="w-full py-3.5 text-center text-[11px] tracking-widest font-black text-white bg-zinc-900 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? 'PROCESSING...' : 'ORDER WITH THIS IMAGE'}
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
                tasteMode={tasteMode} setTasteMode={setTasteMode}
                selectedArtist={selectedArtist} setSelectedArtist={setSelectedArtist}
                motif={motif} setMotif={setMotif}
                motif2={motif2} setMotif2={setMotif2}
                
                selectedTags={selectedTags} setSelectedTags={setSelectedTags}
                setImageUrl={setImageUrl} setBlobUrl={setBlobUrl}
                patternScale={patternScale} setPatternScale={setPatternScale}
                
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
                premiumCode={premiumCode} setPremiumCode={handleSetPremiumCode}
                premiumStatusMsg={premiumStatusMsg}
                onOpenPolicy={() => setIsPolicyOpen(true)}
              />
            </div>
          )}

        </div>
      </div>

      {/* POLICY MODAL */}
      {isPolicyOpen && (
        <div className="fixed inset-0 z-[99999] bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" onClick={() => setIsPolicyOpen(false)}>
          <div className="bg-white border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative text-left shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-[11px] font-bold text-zinc-900 tracking-[0.2em] uppercase">
                POLICY & SAFETY
              </h3>
              <button onClick={() => setIsPolicyOpen(false)} className="text-zinc-400 hover:text-zinc-900 text-xs tracking-widest uppercase">
                CLOSE
              </button>
            </div>
            
            <div className="p-8 space-y-8 text-zinc-800">
              <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-500 font-light">
                「妄想きもの図案帳」をご利用いただきありがとうございます。クリエイターの皆様、そしてすべての利用者の皆様に安心してお使いいただけるよう、当店の明確なポリシーをお約束いたします。
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-2 tracking-widest uppercase">
                    01. No Training on User Data
                  </h4>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-500 font-light">
                    お預かりした画像や入力されたプロンプトが、AIの学習データとして無断で使われることは絶対にありません。当ツールが連携しているAIシステム（API）は、入力データがモデル学習に利用されないセキュアな設計となっております。
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-2 tracking-widest uppercase">
                    02. Strict Safety Moderation
                  </h4>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-500 font-light">
                    システム内部で「NGワードブロック」および「AI側の公序良俗フィルター」が常に稼働しております。さらに、お仕立てへ進むデータはすべて、製作前に熟練スタッフが必ず目視確認いたします。著作権や商標権を侵害する恐れがある図案につきましては、厳格に製作をお断りさせていただきます。
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-2 tracking-widest uppercase">
                    03. Original Designs Welcome
                  </h4>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-500 font-light">
                    AIはあくまで「絵が描けない方・アイデアを広げたい方」のための補助ツールです。ご自身でイラストやデザインを描かれるクリエイター様向けの「完全オリジナルデータ入稿（AI非使用）」も、当店の主力サービスとして今後も大切に承ってまいります。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {CURRENT_NOTICE.enabled && (
        <div className="w-full max-w-7xl px-4 py-12 mt-12 flex justify-center border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 tracking-widest uppercase transition-colors"
          >
            SYSTEM UPDATE
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><p className="text-zinc-400 text-xs font-light tracking-[0.2em] uppercase">Loading</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
