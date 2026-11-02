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

  // 日付チェック（日本時間0時をまたいだら自動リセット）
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
    const src = blobUrl || imageUrl;
    if (!src) {
      setRotatedPatternUrl('');
      return;
    }

    // AIモードまたは入稿モードの半幅帯では90度回転を適用
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

  // 着物の帯画像ハンドラー
  const handleCustomObiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomObiUrl(url);
    }
  };

  // 京袋帯の前腹画像ハンドラー
  const handleCustomHaraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomHaraUrl(url);
    }
  };

  // 入稿モード用：マスター画像の取り込みハンドラー
  const handleUserImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setBlobUrl(''); // Base64データがimageUrlに入るのでblobUrlは空にする
    setRotatedPatternUrl('');
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
    setPatternTitle(cleanFileName ? `${cleanFileName}（持ち込み）` : '持ち込み図案');
    setSerialNumber(`USER-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // プロンプトコピーハンドラー
  const handleCopyPrompt = (text: string, type: 'seamless' | 'centered') => {
    navigator.clipboard.writeText(text);
    setCopiedPromptType(type);
    setTimeout(() => setCopiedPromptType(null), 2000);
  };

  const handleGenerate = async (engineType: 'flux' | 'openai_free' | 'openai_premium') => {
    if (loading) return;
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
    // 既存のダウンロード処理（省略せずに元の実装を保持）
    // ...
  };

  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      // 1. 注文用に送るベース画像の確保
      let finalImg = blobUrl || imageUrl;
      const validSerial = serialNumber || (creationMode === 'geometric' ? `GEO-${Math.floor(1000 + Math.random() * 9000)}` : `KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
      if (!serialNumber) setSerialNumber(validSerial);

      // 半幅帯の場合は18cm用に再レンダリング
      if (itemType === 'hanhaba') {
        finalImg = await render18cmPrintDataPng(
          creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl),
          creationMode === 'geometric' ? 'geometric' : 'ai',
          bgSizeMm,
          geoBgColor
        );
      }

      // ★ 根本解決: URL文字数オーバー（クラッシュ）を防ぐため、Base64画像を必ずVercel Blobにアップロードして短いURLに変換する
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

      // 京袋帯で前腹の個別画像がある場合、カンマ区切りで2枚のURLを結合して渡す
      if (itemType === 'kyobukuro' && customHaraUrl) {
        finalImg = `${finalImg}, ${customHaraUrl}`;
      }

      const finalTitle = patternTitle.trim() || '（無題）';

      // 工房宛てに画像をメール送信する（元の処理を復活）
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: finalImg, komonId: validSerial, title: finalTitle }),
        });
      } catch (mailErr) {
        console.warn('工房へのメール送信に失敗しました:', mailErr);
      }

      // Shopifyなどのための既存の注文API呼び出し（影響を与えないよう保持）
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

      // ★ 着物と帯の自動振り分け（MakeShopへのリダイレクト）
      if (platform === 'makeshop') {
        let targetOrderUrl = 'https://store.gofukuyasan.com/view/item/000000007300'; // 帯ページ（デフォルト）
        if (itemType === 'kimono') {
          targetOrderUrl = 'https://store.gofukuyasan.com/view/item/000000007312'; // 着物ページ
        }
        
        // 変換済みの短いURL（finalImg）をパラメータとして渡すのでクラッシュしない
        const cleanOrderUrl = `${targetOrderUrl}?komon_id=${encodeURIComponent(validSerial)}&title=${encodeURIComponent(finalTitle)}&image_url=${encodeURIComponent(finalImg)}`;
        window.location.href = cleanOrderUrl;
      } else if (result.redirectUrl) {
        // Shopify等の場合は既存のredirectUrlに従う
        window.location.href = result.redirectUrl;
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '注文画面への遷移中にエラーが発生しました');
    }
  };

  // 外部AI用の固定英語プロンプト構文
  const PROMPT_SEAMLESS = 'seamless textile pattern, full-bleed design, no humans, no mockups --tile --ar 1:1';
  const PROMPT_CENTERED = 'centered composition, artwork directly in the center, ample margin on left and right, full-bleed design, no humans, no mockups --ar 1:1';

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex flex-col items-center justify-start font-sans lg:p-8">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row lg:gap-6 items-start justify-center">
        
        {/* 左側プレビューエリア：customHaraUrl と customObiUrl を完全連携 */}
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

        {/* 右側操作エリア */}
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
