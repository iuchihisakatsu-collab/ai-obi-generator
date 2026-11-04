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
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono'>('hanhaba');
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

  const [copiedPromptType, setCopiedPromptType] = useState<'seamless' | 'centered' | null>(null);

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
      
      alert('写真から色・柄のエッセンスを抽出しました！「AI妄想モード」で生成をお試しください。');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '写真の解析中にエラーが発生しました');
    } finally {
      setAnalyzingImage(false);
    }
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
      alert('マッピング画像の保存に失敗しました。');
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
          
          <div className="bg-white border border-zinc-300 shadow-sm p-1.5 flex gap-1 rounded-sm mt-2 lg:mt-8">
            <button
              type="button"
              onClick={() => setCreationMode('geometric')}
              className={`flex-1 py-2 text-[9px] sm:text-xs font-bold rounded transition-all ${
                creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              色無地・格子・縞・水玉
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('ai')}
              className={`flex-1 py-2 text-[9px] sm:text-xs font-bold rounded transition-all ${
                creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              ✨ テーマから図案をつくる
            </button>
            <button
              type="button"
              onClick={() => setCreationMode('upload')}
              className={`flex-1 py-2 text-[9px] sm:text-xs font-bold rounded transition-all ${
                creationMode === 'upload' ? 'bg-zinc-900 text-white shadow' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              📁 手持ちの画像で作る
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

              {imageUrl && !imageUrl.includes('sample_piano_cat') && (
                <div className="flex flex-col gap-3">
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

                  <button
                    type="button"
                    onClick={handleExtractPrompt}
                    disabled={analyzingImage || uploadingImage}
                    className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>✨</span>
                    <span>
                      {analyzingImage 
                        ? '写真の色・柄をAI解析中...' 
                        : 'この写真からプロンプトを抽出して「AI妄想」へ送る'}
                    </span>
                  </button>
                  <p className="text-[9px] text-zinc-400 text-center -mt-1.5">
                    ※写真から配色・タッチ・模様の特徴だけを抽出し、図案づくりモードで新しく図案化できます
                  </p>
                </div>
              )}

              {itemType === 'kyobukuro' && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-800">京袋帯：前腹（お腹正面）の個別画像</span>
                      <p className="text-[9px] text-zinc-500">太鼓と別の柄を合わせたい場合のみ設定</p>
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

              {imageUrl && !imageUrl.includes('sample_piano_cat') && (
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
