// app/page.tsx
'use client';

import { Suspense, useState, useRef, useEffect, useCallback, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import PreviewArea from './components/preview/PreviewArea';
import ControlPanel from './components/controls/ControlPanel';
import NoticeModal from './components/NoticeModal';
import { 
  TRADITIONAL_COLORS,
  AI_STYLE_OPTIONS,
  DEFAULT_SCALE_MM
} from './lib/constants';
import { submitOrder } from './lib/orders';
import { PlatformType } from './lib/orders/types';
import { 
  generateIchimatsu, 
  generateShippo, 
  generateAsanoha, 
  generateSeigaiha, 
  generateUroko, 
  generateTatewaku 
} from './utils/geometricPatterns';

const UNIVERSAL_SCALE_FACTOR = 3 / 22; // 約 0.13636% / mm

// 画像を90度回転させるユーティリティ
async function rotateImage90Degrees(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

const PROMPT_SEAMLESS = 'seamless textile pattern, small delicate repeat pattern, authentic traditional Japanese komon motif, flat 2D vector, clean silhouettes, top-down view, NO perspective, NO shadows, NO gradients, NO mockup, NO clothing, NO humans, high-resolution print data';
const PROMPT_CENTERED = 'centered ornate medallion composition, single large focal motif in center, non-seamless placement print, traditional Japanese kimono aesthetic, flat 2D, top-down view, NO perspective, NO shadows, NO mockup, NO clothing, NO humans, high-resolution print data';
const PROMPT_SCARF = 'luxury silk scarf carré, perfect square framed composition, central ornate medallion, solid outer border margin, high-end European aesthetic, flat top-down 2D, NO tiling, NO humans, high resolution digital printing';

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
  const [density, setDensity] = useState<string>('一方向（上向き）');

  // 幾何学パラメーター
  const [geoBaseShape, setGeoBaseShape] = useState<string>('ichimatsu');
  const [geoArrangement, setGeoArrangement] = useState<string>('grid');
  const [geoCount, setGeoCount] = useState<number>(6);
  const [geoScale, setGeoScale] = useState<number>(1.0);
  const [geoComplexity, setGeoComplexity] = useState<number>(1);
  const [geoStrokeWidth, setGeoStrokeWidth] = useState<number>(3);
  const [geoBgColor, setGeoBgColor] = useState<string>('#ffffff');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [gapWidth, setGapWidth] = useState<number>(16);
  const [dotRadius, setDotRadius] = useState<number>(8);
  const [bgSizeMm, setBgSizeMm] = useState<number>(DEFAULT_SCALE_MM);

  // 帯・着物パーツカラー
  const [obiLiningColor, setObiLiningColor] = useState<string>('#1a1a1a');
  const [kimonoHaneriColor, setKimonoHaneriColor] = useState<string>('#ffffff');
  const [kimonoObiageColor, setKimonoObiageColor] = useState<string>('#c82a36');
  const [kimonoObiColor, setKimonoObiColor] = useState<string>('#1a1a1a');

  // 個別カスタム画像
  const [customObiUrl, setCustomObiUrl] = useState<string | null>(null);
  const [customHaraUrl, setCustomHaraUrl] = useState<string | null>(null);

  // 出力画像・状態管理
  const [imageUrl, setImageUrl] = useState<string>('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [patternTitle, setPatternTitle] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const [mockupSubmitting, setMockupSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 日次生成枠＆チケット管理
  const [remainingSketches, setRemainingSketches] = useState<number>(15);
  const [hasUsedFreeOpenAi, setHasUsedFreeOpenAi] = useState<boolean>(false);
  const [hasUsedFreeToday, setHasUsedFreeToday] = useState<boolean>(false);
  const [premiumCode, setPremiumCode] = useState<string>('');
  const [ticketRemaining, setTicketRemaining] = useState<number | null>(null);

  const [copiedPromptType, setCopiedPromptType] = useState<'seamless' | 'centered' | 'scarf' | null>(null);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPending, startTransition] = useTransition();

  // 初期化：ローカルストレージ・チケット復元
  useEffect(() => {
    const savedCode = localStorage.getItem('mousou_premium_code');
    if (savedCode) {
      setPremiumCode(savedCode);
      fetch(`/api/generate?code=${encodeURIComponent(savedCode)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setTicketRemaining(data.remaining);
          } else {
            localStorage.removeItem('mousou_premium_code');
            setPremiumCode('');
          }
        })
        .catch(() => {});
    }

    const today = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).split(' ')[0];
    const savedDate = localStorage.getItem('mousou_usage_date');
    if (savedDate !== today) {
      localStorage.setItem('mousou_usage_date', today);
      localStorage.setItem('mousou_flux_count', '0');
      localStorage.setItem('mousou_openaifree_used', 'false');
      setRemainingSketches(15);
      setHasUsedFreeOpenAi(false);
      setHasUsedFreeToday(false);
    } else {
      const fluxUsed = parseInt(localStorage.getItem('mousou_flux_count') || '0', 10);
      const openAiUsed = localStorage.getItem('mousou_openaifree_used') === 'true';
      setRemainingSketches(Math.max(0, 15 - fluxUsed));
      setHasUsedFreeOpenAi(openAiUsed);
      setHasUsedFreeToday(fluxUsed >= 15 && openAiUsed);
    }
  }, []);

  const handleCustomObiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCustomObiUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCustomHaraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCustomHaraUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleItemTypeChange = (type: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf') => {
    setItemType(type);
    if (type === 'scarf') {
      setDensity('スカーフ柄（額縁スクエアパネル）');
      setDisplayMode('mockup');
    } else if (type === 'kyobukuro') {
      if (!density.includes('お太鼓') && !density.includes('スカーフ')) {
        setDensity('お太鼓柄（ワンポイント主役パネル）');
      }
    } else if (type === 'kimono') {
      setDensity('四方柄（天地無用）');
    } else {
      setDensity('一方向（上向き）');
    }
  };

  // 半幅帯用の90度回転処理
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

    const fgColor = selectedColors.length > 0 ? selectedColors[0].hex : '#1a1a1a';
    const subColor = selectedColors.length > 1 ? selectedColors[1].hex : '#8b1e2a';
    const bgColor = geoBgColor;

    switch (geoBaseShape) {
      case 'ichimatsu':
        tileSize = period * 2;
        svgString = generateIchimatsu(tileSize, period, fgColor, bgColor);
        break;
      case 'shippo':
        tileSize = period * 2;
        svgString = generateShippo(tileSize, period, fgColor, bgColor, geoStrokeWidth);
        break;
      case 'asanoha':
        tileSize = period * 2;
        svgString = generateAsanoha(tileSize, period, fgColor, bgColor, geoStrokeWidth);
        break;
      case 'seigaiha':
        tileSize = period * 2;
        svgString = generateSeigaiha(tileSize, period, fgColor, bgColor, geoStrokeWidth);
        break;
      case 'uroko':
        tileSize = period * 2;
        svgString = generateUroko(tileSize, period, fgColor, bgColor);
        break;
      case 'tatewaku':
        tileSize = period * 2;
        svgString = generateTatewaku(tileSize, period, fgColor, bgColor, geoStrokeWidth);
        break;
      default:
        tileSize = period * 2;
        svgString = generateIchimatsu(tileSize, period, fgColor, bgColor);
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    setImageUrl(url);
    setBlobUrl(url);
    setRotatedPatternUrl(url);
    setSerialNumber(`GEO-${Date.now().toString(36).toUpperCase()}`);
  }, [
    creationMode, geoBaseShape, geoBgColor, selectedColors, 
    lineWidth, gapWidth, dotRadius, geoStrokeWidth
  ]);

  useEffect(() => {
    if (creationMode === 'geometric') {
      updateGeometricPattern();
    }
  }, [creationMode, updateGeometricPattern]);

  const handleCopyPrompt = (text: string, type: 'seamless' | 'centered' | 'scarf') => {
    navigator.clipboard.writeText(text);
    setCopiedPromptType(type);
    setTimeout(() => setCopiedPromptType(null), 2500);
  };

  // AI図案生成トリガー
  const handleGenerate = async (engine: 'flux' | 'openai', mode: 'free' | 'premium') => {
    if (loading) return;
    setLoading(true);
    setStatusText('AIが世界にひとつの図案を紡いでいます...');
    setErrorMsg('');

    try {
      let activeMotif = motif.trim();
      if (activeMotif === 'ぷっぴ') {
        const adminPass = window.prompt('管理者パスワードを入力してください:');
        if (adminPass) {
          try {
            const adminRes = await fetch('/api/admin/codes', {
              headers: { 'x-admin-password': adminPass },
            });
            const adminData = await adminRes.json();
            if (adminData.success) {
              const codeList = adminData.codes
                .map((c: any) => `${c.code} (${c.type === 'paid' ? '有償50回' : 'IG5回'} / 残:${c.remaining})`)
                .join('\n');
              alert(`【発行済みコード一覧】\n${codeList}`);
            } else {
              alert(adminData.error || '管理者認証に失敗しました');
            }
          } catch (e) {
            alert('管理者API通信エラー');
          }
        }
        setLoading(false);
        return;
      }

      const activeColor = selectedColors.length > 0 ? selectedColors.map((c) => c.name).join('、') : 'おまかせ';

      const payload = {
        motif: activeMotif,
        color: activeColor,
        density,
        itemType,
        aiStyle,
        tasteMode,
        engine: mode === 'premium' ? 'openai_premium' : engine === 'flux' ? 'flux' : 'openai_free',
        paymentMode: mode,
        premiumCode: mode === 'premium' ? premiumCode : undefined,
        patternScale,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || '生成に失敗しました。');
      }

      setImageUrl(data.imageUrl || data.blobUrl);
      setBlobUrl(data.blobUrl || data.imageUrl);
      setSerialNumber(`GFK-${Date.now().toString(36).toUpperCase().slice(-6)}`);

      if (mode === 'premium') {
        if (typeof data.remaining === 'number') {
          setTicketRemaining(data.remaining);
        } else if (ticketRemaining !== null) {
          setTicketRemaining(Math.max(0, ticketRemaining - 1));
        }
      } else {
        if (engine === 'flux') {
          const nextVal = Math.max(0, remainingSketches - 1);
          setRemainingSketches(nextVal);
          const used = 15 - nextVal;
          localStorage.setItem('mousou_flux_count', used.toString());
        } else {
          setHasUsedFreeOpenAi(true);
          localStorage.setItem('mousou_openaifree_used', 'true');
        }
      }

      // 帯・着物画像の自動アップロード（Vercel Blob保存）
      if (customObiUrl && customObiUrl.startsWith('data:')) {
        try {
          const upRes = await fetch('/api/upload-blob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data: customObiUrl, filename: `custom_obi_${Date.now()}.png` }),
          });
          const upData = await upRes.json();
          if (upData?.url) setCustomObiUrl(upData.url);
        } catch (err) {
          console.warn('帯画像のアップロード失敗:', err);
        }
      }

      if (customHaraUrl && customHaraUrl.startsWith('data:')) {
        try {
          const upRes = await fetch('/api/upload-blob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data: customHaraUrl, filename: `custom_hara_${Date.now()}.png` }),
          });
          const upData = await upRes.json();
          if (upData?.url) setCustomHaraUrl(upData.url);
        } catch (err) {
          console.warn('前腹画像のアップロード失敗:', err);
        }
      }

      // 生成完了時にプレビューエリアへ自動スムーズスクロール
      setTimeout(() => {
        if (previewRef.current) {
          previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '生成処理中にエラーが発生しました');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // マッピング画像の結合キャプチャ＆保存
  const handleDownloadMapping = async () => {
    if (!previewContainerRef.current) return;
    setMockupSubmitting(true);

    try {
      const container = previewContainerRef.current;
      const targetSize = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas Context Error');

      ctx.fillStyle = '#e4e4e7';
      ctx.fillRect(0, 0, targetSize, targetSize);

      const patternImg = new Image();
      patternImg.crossOrigin = 'anonymous';
      const patSrc = rotatedPatternUrl || blobUrl || imageUrl;
      await new Promise((res, rej) => {
        patternImg.onload = res;
        patternImg.onerror = rej;
        patternImg.src = patSrc;
      });

      const effectiveScale = creationMode === 'geometric' ? bgSizeMm * UNIVERSAL_SCALE_FACTOR : 400 * UNIVERSAL_SCALE_FACTOR;

      const drawMaskedLayer = async (maskFile: string, rotDeg: number, bgXPct: number, bgYPct: number, scalePct: number) => {
        const maskImg = new Image();
        maskImg.crossOrigin = 'anonymous';
        await new Promise((res, rej) => {
          maskImg.onload = res;
          maskImg.onerror = rej;
          maskImg.src = `/${maskFile}?v=32`;
        });

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetSize;
        tempCanvas.height = targetSize;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCtx.save();
        tempCtx.translate(targetSize / 2, targetSize / 2);
        tempCtx.rotate((rotDeg * Math.PI) / 180);

        const patTileSize = (targetSize * (effectiveScale * (scalePct / 100))) / 100;
        const patCanvas = document.createElement('canvas');
        patCanvas.width = patTileSize;
        patCanvas.height = patTileSize;
        const patCtx = patCanvas.getContext('2d');
        if (patCtx) {
          if (creationMode === 'geometric') {
            patCtx.fillStyle = geoBgColor;
            patCtx.fillRect(0, 0, patTileSize, patTileSize);
          }
          patCtx.drawImage(patternImg, 0, 0, patTileSize, patTileSize);
          const pattern = tempCtx.createPattern(patCanvas, 'repeat');
          if (pattern) {
            tempCtx.fillStyle = pattern;
            const shiftX = (patTileSize * bgXPct) / 100;
            const shiftY = (patTileSize * bgYPct) / 100;
            tempCtx.translate(shiftX, shiftY);
            tempCtx.fillRect(-targetSize * 1.5, -targetSize * 1.5, targetSize * 3, targetSize * 3);
          }
        }
        tempCtx.restore();

        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(maskImg, 0, 0, targetSize, targetSize);
        tempCtx.globalCompositeOperation = 'source-over';

        ctx.drawImage(tempCanvas, 0, 0);
      };

      if (itemType === 'hanhaba') {
        const layers = [
          { file: 'hanhaba_Layer01_a.png', rot: 1, scale: 111, x: 69, y: 50 },
          { file: 'hanhaba_Layer01_b.png', rot: 3, scale: 100, x: 33, y: 50 },
          { file: 'hanhaba_Layer02.png', rot: 5, scale: 108, x: 63, y: 56 },
          { file: 'hanhaba_Layer03.png', rot: 13, scale: 100, x: 32, y: 40 },
          { file: 'hanhaba_Layer04.png', rot: 3, scale: 109, x: 59, y: 58 },
          { file: 'hanhaba_Layer05.png', rot: -8, scale: 100, x: 22, y: 35 },
          { file: 'hanhaba_Layer06.png', rot: -93, scale: 107, x: 74, y: 43 },
        ];

        for (const l of layers) {
          await drawMaskedLayer(l.file, l.rot, l.x, l.y, l.scale);
        }

        const maskLining = new Image();
        maskLining.crossOrigin = 'anonymous';
        await new Promise((res) => { maskLining.onload = res; maskLining.src = '/hanhaba_Layer07.png?v=32'; });
        const liningCanvas = document.createElement('canvas');
        liningCanvas.width = targetSize;
        liningCanvas.height = targetSize;
        const lCtx = liningCanvas.getContext('2d');
        if (lCtx) {
          lCtx.fillStyle = obiLiningColor;
          lCtx.fillRect(0, 0, targetSize, targetSize);
          lCtx.globalCompositeOperation = 'destination-in';
          lCtx.drawImage(maskLining, 0, 0, targetSize, targetSize);
          ctx.drawImage(liningCanvas, 0, 0);
        }

        const shadowImg = new Image();
        shadowImg.crossOrigin = 'anonymous';
        await new Promise((res) => { shadowImg.onload = res; shadowImg.src = '/hanhaba_Layer_kage.png?v=32'; });
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(shadowImg, 0, 0, targetSize, targetSize);
        ctx.restore();

      } else if (itemType === 'kyobukuro') {
        const bgGrand = new Image();
        bgGrand.crossOrigin = 'anonymous';
        await new Promise((res) => { bgGrand.onload = res; bgGrand.src = '/kyoubukurogrand.png?v=32'; });
        ctx.drawImage(bgGrand, 0, 0, targetSize, targetSize);

        const maskLining = new Image();
        maskLining.crossOrigin = 'anonymous';
        await new Promise((res) => { maskLining.onload = res; maskLining.src = '/kyoubukurouraji.png?v=32'; });
        const liningCanvas = document.createElement('canvas');
        liningCanvas.width = targetSize;
        liningCanvas.height = targetSize;
        const lCtx = liningCanvas.getContext('2d');
        if (lCtx) {
          lCtx.fillStyle = obiLiningColor;
          lCtx.fillRect(0, 0, targetSize, targetSize);
          lCtx.globalCompositeOperation = 'destination-in';
          lCtx.drawImage(maskLining, 0, 0, targetSize, targetSize);
          ctx.drawImage(liningCanvas, 0, 0);
        }

        await drawMaskedLayer('kyoubukurohara.png', 90, 50, 50, 85);
        await drawMaskedLayer('kyoubukurotare.png', -1, 76.5, 47, 100);
        await drawMaskedLayer('kyoubukurotakio.png', 1, 75.5, 47, 100);

        const shadowImg = new Image();
        shadowImg.crossOrigin = 'anonymous';
        await new Promise((res) => { shadowImg.onload = res; shadowImg.src = '/kyoubukuromask.png?v=32'; });
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(shadowImg, 0, 0, targetSize, targetSize);
        ctx.restore();

      } else if (itemType === 'kimono') {
        const bgHaikei = new Image();
        bgHaikei.crossOrigin = 'anonymous';
        await new Promise((res) => { bgHaikei.onload = res; bgHaikei.src = '/haikei.png?v=32'; });
        ctx.drawImage(bgHaikei, 0, 0, targetSize, targetSize);

        const parts = [
          { file: 'usiromigoro_75.png', rot: -15, scale: 100, x: 50, y: 50 },
          { file: 'hidarisode2_175.png', rot: 85, scale: 100, x: 49, y: 50 },
          { file: 'hidarisode_150.png', rot: 60, scale: 100, x: 49.5, y: 50 },
          { file: 'migisode_165.png', rot: 75, scale: 100, x: 49, y: 50 },
          { file: 'maemigoro2_140.png', rot: 75, scale: 100, x: 45.5, y: 50 },
          { file: 'maemigoro_105.png', rot: 15, scale: 100, x: 50, y: 50 },
          { file: 'maeokumi_110.png', rot: 20, scale: 100, x: 50, y: 50 },
          { file: 'migieri_65.png', rot: -25, scale: 100, x: 47.5, y: 50 },
          { file: 'hidarieri_117.png', rot: 31, scale: 100, x: 52, y: 50 },
        ];

        for (const p of parts) {
          await drawMaskedLayer(p.file, p.rot, p.x, p.y, p.scale);
        }

        const drawColorLayer = async (file: string, color: string) => {
          const mImg = new Image();
          mImg.crossOrigin = 'anonymous';
          await new Promise((res) => { mImg.onload = res; mImg.src = `/${file}?v=32`; });
          const cCanvas = document.createElement('canvas');
          cCanvas.width = targetSize;
          cCanvas.height = targetSize;
          const cCtx = cCanvas.getContext('2d');
          if (cCtx) {
            cCtx.fillStyle = color;
            cCtx.fillRect(0, 0, targetSize, targetSize);
            cCtx.globalCompositeOperation = 'destination-in';
            cCtx.drawImage(mImg, 0, 0, targetSize, targetSize);
            ctx.drawImage(cCanvas, 0, 0);
          }
        };

        await drawColorLayer('haneri.png', kimonoHaneriColor);
        await drawColorLayer('obiage.png', kimonoObiageColor);

        if (customObiUrl) {
          const obiImg = new Image();
          obiImg.crossOrigin = 'anonymous';
          await new Promise((res) => { obiImg.onload = res; obiImg.src = customObiUrl; });
          const oCanvas = document.createElement('canvas');
          oCanvas.width = targetSize;
          oCanvas.height = targetSize;
          const oCtx = oCanvas.getContext('2d');
          const mImg = new Image();
          mImg.crossOrigin = 'anonymous';
          await new Promise((res) => { mImg.onload = res; mImg.src = '/obi_2.png?v=32'; });
          if (oCtx) {
            oCtx.drawImage(obiImg, 0, 0, targetSize, targetSize);
            oCtx.globalCompositeOperation = 'destination-in';
            oCtx.drawImage(mImg, 0, 0, targetSize, targetSize);
            ctx.drawImage(oCanvas, 0, 0);
          }
        } else {
          await drawColorLayer('obi_2.png', kimonoObiColor);
        }

        const shadowImg = new Image();
        shadowImg.crossOrigin = 'anonymous';
        await new Promise((res) => { shadowImg.onload = res; shadowImg.src = '/jyouzan.png?v=32'; });
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.5;
        ctx.drawImage(shadowImg, 0, 0, targetSize, targetSize);
        ctx.restore();

      } else if (itemType === 'scarf') {
        // スカーフ（100×100cm）キャンバス描画
        const pad = 40;
        const scarfSize = targetSize - pad * 2;
        
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = creationMode === 'geometric' ? geoBgColor : '#fff';
        ctx.fillRect(pad, pad, scarfSize, scarfSize);
        ctx.restore();

        ctx.drawImage(patternImg, pad, pad, scarfSize, scarfSize);

        // 三巻き縫製フレーム（ハンドロール風ステッチ枠）
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 4;
        ctx.strokeRect(pad + 2, pad + 2, scarfSize - 4, scarfSize - 4);

        // ドレープ陰影
        const grad = ctx.createRadialGradient(
          pad + scarfSize * 0.3, pad + scarfSize * 0.3, scarfSize * 0.1,
          pad + scarfSize * 0.5, pad + scarfSize * 0.5, scarfSize * 0.7
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = grad;
        ctx.fillRect(pad, pad, scarfSize, scarfSize);
        ctx.restore();
      }

      const finalBase64 = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = finalBase64;
      a.download = `${serialNumber || 'mapping'}_${itemType}_mockup.png`;
      a.click();

    } catch (err: any) {
      console.error(err);
      alert('マッピング画像の作成に失敗しました。');
    } finally {
      setMockupSubmitting(false);
    }
  };

  // お誂え・ご注文導線（MakeShop / Shopify連携）
  const handleOrderClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!imageUrl && !blobUrl) {
      alert('まずは図案を生成してください。');
      return;
    }

    const validSerial = serialNumber || `GFK-${Date.now().toString(36).toUpperCase()}`;
    const finalTitle = patternTitle.trim() || '（無題の図案）';

    try {
      let finalImg = blobUrl || imageUrl;

      if (finalImg.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data: finalImg, filename: `${validSerial}_${itemType}.png` }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData?.url) {
          finalImg = uploadData.url;
          setBlobUrl(uploadData.url);
        }
      }

      // 個別画像のアップロード保証
      if (itemType === 'kyobukuro' && customHaraUrl) {
        if (customHaraUrl.startsWith('data:')) {
          const haraUpload = await fetch('/api/upload-blob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data: customHaraUrl, filename: `${validSerial}_hara.png` }),
          });
          const haraData = await haraUpload.json();
          if (haraData?.url) setCustomHaraUrl(haraData.url);
        }
      }

      if (itemType === 'kimono' && customObiUrl) {
        if (customObiUrl.startsWith('data:')) {
          const obiUpload = await fetch('/api/upload-blob', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Data: customObiUrl, filename: `${validSerial}_obi.png` }),
          });
          const obiData = await obiUpload.json();
          if (obiData?.url) setCustomObiUrl(obiData.url);
        }
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
        // スカーフはテスト販売として半幅帯と同じ商品番号（000000007300）へ連携
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
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white">
      <NoticeModal />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-xs font-bold flex justify-between items-center shadow-sm">
            <span>⚠️ {errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg('')} className="text-sm font-black">✕</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* 左カラム：プレビュー */}
          <PreviewArea
            imageUrl={imageUrl}
            blobUrl={blobUrl}
            rotatedPatternUrl={rotatedPatternUrl}
            serialNumber={serialNumber}
            itemType={itemType}
            displayMode={displayMode}
            creationMode={creationMode === 'geometric' ? 'geometric' : 'ai'}
            bgSizeMm={bgSizeMm}
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
            mockupSubmitting={mockupSubmitting}
            previewRef={previewRef}
            previewContainerRef={previewContainerRef}
            handleItemTypeChange={handleItemTypeChange}
            setDisplayMode={setDisplayMode}
            handleDownloadMapping={handleDownloadMapping}
            UNIVERSAL_SCALE_FACTOR={UNIVERSAL_SCALE_FACTOR}
          />

          {/* 右カラム：操作パネル */}
          <ControlPanel
            creationMode={creationMode === 'geometric' ? 'geometric' : 'ai'}
            setCreationMode={(m) => setCreationMode(m)}
            itemType={itemType}
            setItemType={setItemType}
            aiStyle={aiStyle}
            setAiStyle={setAiStyle}
            tasteMode={tasteMode}
            setTasteMode={setTasteMode}
            selectedArtist={selectedArtist}
            setSelectedArtist={setSelectedArtist}
            motif={motif}
            setMotif={setMotif}
            motif2={motif2}
            setMotif2={setMotif2}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            setImageUrl={setImageUrl}
            setBlobUrl={setBlobUrl}
            patternScale={patternScale}
            setPatternScale={setPatternScale}
            density={density}
            setDensity={setDensity}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            geoBaseShape={geoBaseShape}
            setGeoBaseShape={setGeoBaseShape}
            geoArrangement={geoArrangement}
            setGeoArrangement={setGeoArrangement}
            geoCount={geoCount}
            setGeoCount={setGeoCount}
            geoScale={geoScale}
            setGeoScale={setGeoScale}
            geoComplexity={geoComplexity}
            setGeoComplexity={setGeoComplexity}
            geoStrokeWidth={geoStrokeWidth}
            setGeoStrokeWidth={setGeoStrokeWidth}
            geoBgColor={geoBgColor}
            setGeoBgColor={setGeoBgColor}
            bgSizeMm={bgSizeMm}
            setBgSizeMm={setBgSizeMm}
            loading={loading}
            setLoading={setLoading}
            statusText={statusText}
            setStatusText={setStatusText}
            patternTitle={patternTitle}
            setPatternTitle={setPatternTitle}
            serialNumber={serialNumber}
            imageUrl={imageUrl}
            blobUrl={blobUrl}
            remainingSketches={remainingSketches}
            setRemainingSketches={setRemainingSketches}
            hasUsedFreeOpenAi={hasUsedFreeOpenAi}
            setHasUsedFreeOpenAi={setHasUsedFreeOpenAi}
            hasUsedFreeToday={hasUsedFreeToday}
            setHasUsedFreeToday={setHasUsedFreeToday}
            premiumCode={premiumCode}
            setPremiumCode={setPremiumCode}
            ticketRemaining={ticketRemaining}
            setTicketRemaining={setTicketRemaining}
            onGenerate={handleGenerate}
            handleOrderClick={handleOrderClick}
          />
        </div>

        {/* 下部：外部AIプロンプト＆補助ガイド */}
        <div className="mt-12 bg-white border border-zinc-200 p-6 rounded-sm shadow-sm space-y-6">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-sm font-black text-zinc-900 tracking-wider">
              【プロンプト連携＆制作ガイド】
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              MidjourneyやChatGPT等の外部AIで作成したお手持ちの図案画像も、上部の画像選択からシミュレーターにそのまま読み込めます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800">小紋・総柄（半幅帯・着物向け）</span>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(PROMPT_SEAMLESS, 'seamless')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    copiedPromptType === 'seamless' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white'
                  }`}
                >
                  {copiedPromptType === 'seamless' ? '✓ コピー完了' : '📋 コピー'}
                </button>
              </div>
              <code className="text-[10px] font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-700 break-all select-all">
                {PROMPT_SEAMLESS}
              </code>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800">お太鼓・絵羽（京袋帯向け）</span>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(PROMPT_CENTERED, 'centered')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    copiedPromptType === 'centered' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white'
                  }`}
                >
                  {copiedPromptType === 'centered' ? '✓ コピー完了' : '📋 コピー'}
                </button>
              </div>
              <code className="text-[10px] font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-700 break-all select-all">
                {PROMPT_CENTERED}
              </code>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800">スカーフ柄（100cmウールスカーフ向け）</span>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(PROMPT_SCARF, 'scarf')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                    copiedPromptType === 'scarf' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-white'
                  }`}
                >
                  {copiedPromptType === 'scarf' ? '✓ コピー完了' : '📋 コピー'}
                </button>
              </div>
              <code className="text-[10px] font-mono bg-white p-2 rounded border border-zinc-200 text-zinc-700 break-all select-all">
                {PROMPT_SCARF}
              </code>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-xs font-bold text-zinc-400">
        読み込み中...
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
