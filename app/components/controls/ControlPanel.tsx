// app/components/controls/ControlPanel.tsx
'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: (mode: 'ai' | 'geometric') => void;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf';
  setItemType: (type: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf') => void;
  
  aiStyle: string;
  setAiStyle: (val: string) => void;
  tasteMode?: string;
  setTasteMode?: (val: string) => void;

  selectedArtist: string;
  setSelectedArtist: (artist: string) => void;
  motif: string;
  setMotif: (val: string) => void;
  motif2: string;
  setMotif2: (val: string) => void;
  
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  setImageUrl: (url: string) => void;
  setBlobUrl: (url: string) => void;

  patternScale: 'small' | 'medium' | 'large';
  setPatternScale: (scale: 'small' | 'medium' | 'large') => void;
  
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: (colors: typeof TRADITIONAL_COLORS) => void;
  handleColorToggle: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: (val: boolean) => void;
  density: string;
  setDensity: (val: string) => void;
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: (val: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir: 'vertical' | 'horizontal' | 'diagonal';
  setStripeDir: (val: 'vertical' | 'horizontal' | 'diagonal') => void;
  dotLayout: 'staggered' | 'grid';
  setDotLayout: (val: 'staggered' | 'grid') => void;
  dotRadius: number;
  setDotRadius: (val: number) => void;
  gapWidth: number;
  setGapWidth: (val: number) => void;
  lineWidth: number;
  setLineWidth: (val: number) => void;
  geoBgColor: string;
  setGeoBgColor: (val: string) => void;
  geoPatternColor: string;
  setGeoPatternColor: (val: string) => void;
  showGeoPaletteFor: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor: (val: 'bg' | 'pattern' | null) => void;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  errorMsg: string;
  loading: boolean;
  loadingEngine?: 'flux' | 'openai' | null;
  generatingMode?: 'flux' | 'openai_free' | 'openai_premium' | null;
  remainingCount?: number;
  remainingFlux?: number;
  remainingOpenAI?: number;
  ticketRemaining?: number | null;
  loadingStep: number;
  handleGenerate: (engineType: 'flux' | 'openai_free' | 'openai_premium') => void;
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: (val: string) => void;
  serialNumber: string;
  handleDownloadOriginal: () => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  premiumCode: string;
  setPremiumCode: (val: string) => void;
  premiumStatusMsg: string;
  
  onOpenPolicy: () => void;
}

const TASTE_MODES = [
  { id: 'katazome', title: '粋・型染め', desc: '江戸小紋・藍染・潔い輪郭' },
  { id: 'botanical', title: '博物画・銅版', desc: '細密エッチング・モリス工芸' },
  { id: 'mingei', title: '昭和民藝・木版', desc: '骨太な版画味・純喫茶ポスター' },
  { id: 'mode', title: '辛口・モード', desc: '幾何学・バウハウス・ソリッド' },
];

const LOADING_STEPS = [
  '入力されたテーマから、図案の骨格を組み立てています...',
  'モチーフの配置と角度を計算しています...',
  '色と質感をピクセル単位で緻密に描き込んでいます...',
  '全体のバランスと発色を整えています...',
  '最終仕上げ中。まもなく完成します...',
];

const RECIPES = [
  {
    id: 'piano_cat',
    title: '月夜のピアノと黒猫',
    motif: '黒猫、ピアノの鍵盤、月、椿',
    tags: ['大正ロマン', '水彩画'],
    colors: ['漆黒', '真紅'],
    image: '/sample_piano_cat.png' 
  },
  {
    id: 'cafe',
    title: '純喫茶ポワロのクリームソーダ',
    motif: 'メロンソーダ、さくらんぼ、ステンドグラス',
    tags: ['昭和レトロ', 'ペン画'],
    colors: ['翡翠', '朱色'],
    image: '/sample_cafe.png'
  },
  {
    id: 'antique',
    title: '英国・秘密の花園',
    motif: '白うさぎ、ブラックベリー、時計、鍵',
    tags: ['アンティーク', '木版画', 'モリス風'],
    colors: ['銀鼠', '葡萄色'],
    image: '/sample_antique.png'
  },
  {
    id: 'hokusai_cat',
    title: '波間に遊ぶ黒白猫',
    motif: '黒白の猫、濃淡の青い波、白い泡の点描',
    tags: ['浮世絵風', '和モダン', '北斎風', '猫', '波・雲'],
    colors: ['鳥の子色', '瑠璃色'],
    image: '/sample_hokusai_cat.png'
  }
];

const TAG_CATEGORIES = [
  {
    category: 'STYLE / 様式',
    tags: ['大正ロマン', '昭和レトロ', 'モリス風', 'ガレ風', 'ミュシャ風', '北斎風', '若冲風', '光琳・琳派', '夢二浪漫', 'アール・ヌーヴォー', '北欧風', 'アンティーク', '和モダン']
  },
  {
    category: 'TEXTURE / タッチ',
    tags: ['水彩画', '木版画', 'ステンドグラス', 'ペン画', '切り絵', 'リソグラフ風', 'トワルドジュイ']
  },
  {
    category: 'MOTIF / 人気モチーフ',
    tags: ['猫', '兎', '鳥', '椿', '薔薇', '百合', '鍵盤', '幾何学', '波・雲']
  },
  {
    category: 'TONE / 配色',
    tags: ['くすみカラー', 'パステル', 'ビビッド', 'セピア', 'モノトーン', '黄金色']
  }
];

export default function ControlPanel({
  creationMode, setCreationMode,
  itemType, setItemType,
  aiStyle, setAiStyle,
  tasteMode = 'katazome', setTasteMode,
  selectedArtist, setSelectedArtist,
  motif, setMotif, motif2, setMotif2,
  
  selectedTags, setSelectedTags,
  setImageUrl, setBlobUrl,
  patternScale, setPatternScale,
  
  selectedColors, setSelectedColors, handleColorToggle,
  showColorPalette, setShowColorPalette,
  density, setDensity,
  geoPatternType, setGeoPatternType,
  stripeDir, setStripeDir, dotLayout, setDotLayout,
  dotRadius, setDotRadius, gapWidth, setGapWidth, lineWidth, setLineWidth,
  geoBgColor, setGeoBgColor, geoPatternColor, setGeoPatternColor,
  showGeoPaletteFor, setShowGeoPaletteFor,
  agreed, setAgreed, errorMsg,
  loading, loadingEngine, generatingMode,
  remainingCount, remainingFlux, remainingOpenAI, ticketRemaining,
  loadingStep, handleGenerate,
  imageUrl, patternTitle, setPatternTitle, serialNumber,
  handleDownloadOriginal, handleOrderClick,
  premiumCode, setPremiumCode, premiumStatusMsg,
  onOpenPolicy,
}: ControlPanelProps) {

  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inputCodeValue, setInputCodeValue] = useState(premiumCode || '');
  const [codeAppliedSuccess, setCodeAppliedSuccess] = useState(false);

  const currentTaste = tasteMode || 'katazome';

  const [publishToGallery, setPublishToGallery] = useState(false);
  const [galleryAuthor, setGalleryAuthor] = useState('');
  const [galleryNote, setGalleryNote] = useState(''); // NEW: クリエイターのひとこと
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    if (premiumCode) {
      setInputCodeValue(premiumCode);
    }
  }, [premiumCode]);

  const handlePublishToGallery = async () => {
    if (!imageUrl) return;
    setIsPublishing(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl, 
          title: patternTitle,
          author: galleryAuthor,
          note: galleryNote, // NEW: APIへ送信
          itemType: itemType,
          scale: patternScale,
          density: density,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishSuccess(true);
      } else {
        alert('エラーが発生しました: ' + (data.error || '不明なエラー'));
      }
    } catch (err) {
      alert('通信エラーが発生しました。');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleApplyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let trimmed = inputCodeValue.trim();
    if (!trimmed) return;
    
    setPremiumCode(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('komon_premium_code', trimmed);
    }
    setCodeAppliedSuccess(true);
    setShowCodeInput(false);
    setTimeout(() => setCodeAppliedSuccess(false), 4000);
  };

  const handleClearCode = () => {
    setPremiumCode('');
    setInputCodeValue('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('komon_premium_code');
    }
  };

  const handleRecipeSelect = (recipe: typeof RECIPES[0]) => {
    setMotif(recipe.motif);
    setSelectedTags(recipe.tags);
    
    const newColors = TRADITIONAL_COLORS.filter(c => recipe.colors.includes(c.name.split(' ')[0]));
    setSelectedColors(newColors);
    
    setPatternTitle(recipe.title);
    setImageUrl(recipe.image);
    setBlobUrl(recipe.image);
  };

  const handlePhotoUploadAndExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: base64Data }),
          });
          const result = await res.json();
          if (result.success && result.data) {
            const { prompt: extractedPrompt, motif: exMotif, color: exColor, texture: exTexture } = result.data;
            const finalPrompt = extractedPrompt || `${exMotif}。配色：${exColor}。タッチ：${exTexture}`;
            setMotif(finalPrompt);
            alert('写真から色・柄の特徴を抽出してモチーフ欄に入力しました！');
          } else {
            alert(result.error || '写真の解析に失敗しました。');
          }
        } catch (err) {
          console.error(err);
          alert('解析通信エラーが発生しました。');
        } finally {
          setAnalyzingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAnalyzingPhoto(false);
      console.error(err);
    }
  };

  useEffect(() => {
    if (!density) {
      if (itemType === 'scarf') setDensity('額縁スクエアパネル（正方形1枚絵）');
      else if (itemType === 'kimono') setDensity('ALL-OVER (四方柄)');
      else if (itemType === 'hanhaba') setDensity('UPWARD (一方向)');
      else setDensity('総柄（小紋タイプ）');
    }
  }, [itemType, density, setDensity]);

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map((c) => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = `「妄想小紋図案帖」で柄のアイデアを試してみました。\nTITLE / 作品名：『${finalTitle}』\n配色：${colorSummary}\n#妄想きもの図案帳 #ゴフクヤサン`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://store.gofukuyasan.com/';
  const mediaUrl = imageUrl || '';

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const shareToThreads = () => {
    const textWithUrl = `${shareText}\n${currentUrl}`;
    const url = `https://www.threads.net/intent/post?text=${encodeURIComponent(textWithUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=550');
  };

  const shareToPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=750,height=600');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const shareToInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      alert('TITLE / 作品名とテキストをコピーしました。\nInstagramの投稿画面に貼り付けてお使いください。');
    } catch {}
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const primaryMotif = motif.trim() ? motif.split('、')[0].split(' ')[0] : '';
  const makeshopSearchUrl = primaryMotif ? `https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(primaryMotif)}` : 'https://store.gofukuyasan.com/';

  const effectiveRemainingFlux = remainingFlux ?? 15;
  const effectiveRemainingOpenAI = remainingOpenAI ?? remainingCount ?? 1;

  const hasValidCode = Boolean(premiumCode && premiumCode.trim().length > 0);
  const isInstagramCode = premiumCode.trim().toUpperCase().startsWith('IG-') || premiumCode.trim().toUpperCase().startsWith('X-');
  const isPaidTicketCode = premiumCode.trim().toUpperCase().startsWith('GFK-');

  return (
    <div className="w-full bg-white border border-zinc-200 p-6 lg:p-10 shrink-0 shadow-sm z-10 relative">
      
      <div className="space-y-6">

        {/* チケット入力バー */}
        {creationMode === 'ai' && (
          <div className="bg-zinc-50 border border-zinc-200 p-4 text-left">
            {hasValidCode ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
                  <div>
                    <span className="text-[10px] font-bold text-zinc-900 tracking-widest flex items-center gap-1.5 uppercase">
                      <span>
                        {isInstagramCode 
                          ? 'INSTAGRAM COUPON APPLIED' 
                          : isPaidTicketCode 
                            ? 'PREMIUM TICKET APPLIED' 
                            : 'TICKET CODE APPLIED'}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block mt-1">
                      CODE: {premiumCode}
                      {ticketRemaining !== null && ticketRemaining !== undefined && (
                        <strong className="text-zinc-900 ml-2">（REMAINING: {ticketRemaining}）</strong>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto text-[10px] font-bold tracking-widest uppercase">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(true)}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    EDIT
                  </button>
                  <span className="text-zinc-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="text-zinc-400 hover:text-zinc-900 transition-colors"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {!showCodeInput ? (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowCodeInput(true)}
                      className="text-left flex items-center justify-between w-full group"
                    >
                      <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-900 tracking-widest transition-colors uppercase">
                        TICKET / COUPON CODE
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-zinc-900 transition-colors">ENTER CODE +</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">
                        ENTER TICKET CODE
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCodeInput(false)}
                        className="text-[9px] font-bold text-zinc-400 hover:text-zinc-900 tracking-widest uppercase transition-colors"
                      >
                        CLOSE
                      </button>
                    </div>

                    <form onSubmit={handleApplyCode} className="flex gap-2">
                      <input
                        type="text"
                        value={inputCodeValue}
                        onChange={(e) => setInputCodeValue(e.target.value)}
                        placeholder="e.g., IG-XXXXXX or GFK-XXXX-XXXX"
                        className="flex-1 border border-zinc-300 p-3 text-xs bg-white font-mono focus:border-zinc-900 focus:outline-none transition-colors"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!inputCodeValue.trim()}
                        className="px-6 py-2 bg-zinc-900 hover:bg-black disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border-zinc-200 border border-zinc-900 text-white text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap"
                      >
                        APPLY
                      </button>
                    </form>

                    <div className="flex items-center justify-between pt-2 text-[9px] text-zinc-400 tracking-widest uppercase font-bold">
                      <a
                        href="https://www.instagram.com/gofukuyasan/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                      >
                        <span>Instagramで無料コードを取得</span>
                      </a>
                      <a
                        href="https://store.gofukuyasan.com/view/item/000000007300"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-zinc-900 transition-colors flex items-center gap-1"
                      >
                        <span>50回分チケットを購入</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {codeAppliedSuccess && (
              <div className="mt-3 p-3 bg-zinc-100 border border-zinc-200 text-zinc-900 text-[10px] font-bold tracking-widest uppercase animate-fade-in flex items-center gap-2">
                <span>コードを適用しました。高品質なデザイン生成が可能です。</span>
              </div>
            )}
          </div>
        )}

        {creationMode === 'ai' ? (
          <>
            {/* 01. 何を描く？（モチーフ入力） */}
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <label className="block text-[11px] font-bold text-zinc-900 tracking-[0.15em] uppercase">
                  01. THEME & MOTIF / テーマ・モチーフ
                </label>

                <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-zinc-900 hover:bg-zinc-50 text-zinc-900 text-[9px] font-bold tracking-widest uppercase transition-colors">
                  <span>写真から抽出</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUploadAndExtract} disabled={analyzingPhoto || loading} className="hidden" />
                </label>
              </div>

              <div className="relative">
                <textarea 
                  className="w-full border border-zinc-200 p-4 bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:bg-white resize-none transition-all duration-300 leading-relaxed font-medium" 
                  placeholder="例：黒猫、ピアノの鍵盤、月、椿" 
                  rows={2} 
                  value={motif} 
                  onChange={(e) => setMotif(e.target.value)} 
                  disabled={loading || analyzingPhoto} 
                />
                {motif && (
                  <button 
                    type="button"
                    onClick={() => setMotif('')} 
                    className="absolute right-3 bottom-3 text-[9px] font-bold text-zinc-400 hover:text-zinc-900 tracking-widest uppercase transition-colors"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            {/* ひらめき作例 */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">
                  INSPIRATION / 作例から選ぶ
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RECIPES.map(recipe => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => handleRecipeSelect(recipe)}
                    className="p-2 border border-zinc-200 hover:border-zinc-900 text-left transition-colors flex flex-col gap-2 group bg-white"
                  >
                    <img src={recipe.image} alt={recipe.title} className="w-full aspect-square object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-900 line-clamp-1 tracking-widest uppercase">
                      {recipe.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 同意チェック */}
            <div className="pt-4 border-t border-zinc-100 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer shrink-0" 
                />
                <span className="text-[10px] text-zinc-500 font-light leading-relaxed group-hover:text-zinc-900 transition-colors">
                  作成図案は意匠のアイデアです。実際の生地制作時はスタッフが目視で柄のつなぎ目（送り）を調整することに同意します。
                </span>
              </label>

              <button 
                type="button" 
                onClick={onOpenPolicy} 
                className="text-[9px] font-bold text-zinc-400 hover:text-zinc-900 tracking-widest uppercase text-left flex items-center gap-1.5 ml-6 transition-colors"
              >
                POLICY & SAFETY (ポリシーと安全性)
              </button>
            </div>

            {errorMsg && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 text-red-600 text-xs font-bold animate-fade-in">
                {errorMsg}
              </div>
            )}

            {/* 生成ボタンエリア */}
            <div className="space-y-3 pt-2">
              {hasValidCode && (
                <div className="space-y-2">
                  <button 
                    type="button" 
                    onClick={() => handleGenerate('openai_premium')} 
                    disabled={loading} 
                    className="w-full py-4 px-4 font-black text-xs sm:text-sm tracking-[0.2em] uppercase bg-zinc-900 hover:bg-black text-white transition-all border border-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && (generatingMode === 'openai_premium' || (loadingEngine === 'openai' && premiumCode))
                      ? 'GENERATING HIGH-RES DESIGN...'
                      : `GENERATE (PREMIUM)${ticketRemaining !== null ? ` [ ${ticketRemaining} ]` : ''}`}
                  </button>
                  <p className="text-[9px] text-zinc-400 text-center font-light tracking-widest">
                    選んだ生地の地色やモチーフを高精度に描き出します
                  </p>
                </div>
              )}

              {!hasValidCode && (
                <div className="space-y-2">
                  <button 
                    type="button" 
                    onClick={() => handleGenerate('openai_free')} 
                    disabled={loading || effectiveRemainingOpenAI <= 0} 
                    className={`w-full py-4 px-4 font-black text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 border ${
                      effectiveRemainingOpenAI <= 0 
                        ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed' 
                        : 'bg-zinc-900 text-white border-zinc-900 hover:bg-black disabled:opacity-50'
                    }`}
                  >
                    {loading && (generatingMode === 'openai_free' || (loadingEngine === 'openai' && !premiumCode)) ? (
                      'GENERATING HIGH-RES DESIGN...'
                    ) : (
                      effectiveRemainingOpenAI <= 0 
                        ? 'FREE HIGH-RES QUOTA EXCEEDED' 
                        : `GENERATE DESIGN [ FREE: ${effectiveRemainingOpenAI} ]`
                    )}
                  </button>
                  <p className="text-[9px] text-zinc-400 text-center font-light tracking-widest">
                    言葉のニュアンスや構図を計算して高精度に描き出します
                  </p>
                </div>
              )}

              <div>
                <button 
                  type="button" 
                  onClick={() => handleGenerate('flux')} 
                  disabled={loading || effectiveRemainingFlux <= 0} 
                  className={`w-full py-3 px-4 font-bold text-[10px] sm:text-[11px] tracking-widest uppercase transition-all duration-300 border ${
                    effectiveRemainingFlux <= 0
                      ? 'bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed'
                      : 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {loading && (generatingMode === 'flux' || loadingEngine === 'flux') ? (
                    'GENERATING SKETCH...'
                  ) : (
                    effectiveRemainingFlux <= 0
                      ? 'SKETCH QUOTA EXCEEDED'
                      : `GENERATE SKETCH [ REMAINING: ${effectiveRemainingFlux} ]`
                  )}
                </button>
                <p className="text-[9px] text-zinc-400 text-center mt-2 font-light tracking-widest">
                  まずは使い方に慣れたり、テスト用にお使いください
                </p>
              </div>

              {!hasValidCode && effectiveRemainingOpenAI <= 0 && (
                <div className="p-5 border border-zinc-200 bg-zinc-50 text-left animate-fade-in mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-[10px] text-zinc-900 tracking-widest uppercase">
                      FOR MORE GENERATIONS
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCodeInput(true)}
                      className="text-[9px] font-bold text-zinc-500 hover:text-zinc-900 tracking-widest uppercase transition-colors"
                    >
                      チケットをお持ちの方
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="https://www.instagram.com/gofukuyasan/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white border border-zinc-200 text-center hover:border-zinc-900 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-zinc-900 block tracking-widest">FREE TICKET</span>
                      <span className="text-[9px] text-zinc-500 block mt-1 font-light">Instagramで取得</span>
                    </a>
                    <a
                      href="https://store.gofukuyasan.com/view/item/000000007300"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white border border-zinc-200 text-center hover:border-zinc-900 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-zinc-900 block tracking-widest">PREMIUM TICKET</span>
                      <span className="text-[9px] text-zinc-500 block mt-1 font-light">次回以降に使えるポイント還元</span>
                    </a>
                  </div>
                </div>
              )}

              {premiumStatusMsg && (
                <div className="p-4 bg-zinc-900 border border-zinc-900 text-center animate-fade-in">
                  <p className="text-[10px] font-bold text-white tracking-widest uppercase">
                    {premiumStatusMsg}
                  </p>
                </div>
              )}
            </div>

            {/* ローディング */}
            {loading && (
              <div className="p-6 bg-zinc-50 border border-zinc-200 flex flex-col gap-4 animate-fade-in my-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-zinc-900 tracking-widest uppercase">
                    {LOADING_STEPS[loadingStep % LOADING_STEPS.length]}
                  </p>
                  <div className="w-3 h-3 border border-zinc-300 border-t-zinc-900 rounded-full animate-spin shrink-0" />
                </div>

                <div className="w-full h-[1px] bg-zinc-200 overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-zinc-900 transition-all duration-[3000ms] ease-out"
                    style={{ width: `${Math.min(100, (loadingStep + 1) * 22)}%` }}
                  />
                </div>

                <div className="text-[9px] text-zinc-400 flex justify-between items-center tracking-widest uppercase font-bold">
                  <span>{generatingMode === 'flux' ? 'SKETCH MODE' : 'HIGH-RES MODE (~15s)'}</span>
                  <span className="text-zinc-900 animate-pulse">PLEASE WAIT</span>
                </div>
              </div>
            )}

            {/* こだわり設定（アコーディオン） */}
            <div className="pt-4 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full py-3 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-left transition-colors flex items-center justify-between"
              >
                <span className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase">
                  ADVANCED SETTINGS / 詳細設定
                </span>
                <span className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase">
                  {isAdvancedOpen ? 'CLOSE' : 'OPEN'}
                </span>
              </button>

              {isAdvancedOpen && (
                <div className="pt-6 space-y-8 animate-fade-in">
                  
                  {/* 02. 図案のテイスト */}
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase">
                        TASTE / テイスト
                      </label>
                      <span className="text-[9px] text-zinc-400 font-light">染織の風合い</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TASTE_MODES.map((tm) => {
                        const isSelected = currentTaste === tm.id;
                        return (
                          <button
                            key={tm.id}
                            type="button"
                            onClick={() => setTasteMode?.(tm.id)}
                            className={`p-3 text-left transition-colors border ${
                              isSelected
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                            }`}
                          >
                            <span className="text-[10px] font-bold tracking-widest block mb-1">{tm.title}</span>
                            <span className={`text-[9px] block font-light leading-relaxed ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                              {tm.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 03. 地色（ベースカラー）＆ 102色パレット */}
                  <div className="pt-6 border-t border-zinc-100 relative">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-1">
                          BASE COLOR / 地色
                        </label>
                        <p className="text-[9px] text-zinc-500 font-light">選んだ色が布地全体の背景（地色）になります</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowColorPalette(!showColorPalette)} 
                        className="text-[9px] text-zinc-500 hover:text-zinc-900 font-bold tracking-widest uppercase transition-colors"
                      >
                        {showColorPalette ? 'CLOSE' : 'COLOR PALETTE'}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 min-h-[30px]">
                      {selectedColors.length === 0 ? ( 
                        <span className="text-[10px] text-zinc-400 font-light">指定なし（おまかせ調色）</span> 
                      ) : (
                        <>
                          {selectedColors.map((col, idx) => (
                            <span 
                              key={col.name} 
                              onClick={() => handleColorToggle(col)} 
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold border cursor-pointer relative z-10 tracking-widest" 
                              style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000', borderColor: col.isDark ? col.hex : '#e4e4e7' }}
                            >
                              {idx === 0 ? `地色: ${col.name.split(' ')[0]}` : col.name.split(' ')[0]}
                              <span className="text-[9px] opacity-50">✕</span>
                            </span>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => setSelectedColors([])} 
                            className="text-[9px] text-zinc-400 hover:text-zinc-900 tracking-widest uppercase ml-2 relative z-10 transition-colors"
                          >
                            RESET
                          </button>
                        </>
                      )}
                    </div>

                    {showColorPalette && (
                      <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 animate-fade-in relative z-50">
                        <div className="max-h-[240px] overflow-y-auto pr-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {TRADITIONAL_COLORS.map((col) => {
                            const isSelected = selectedColors.some((c) => c.name === col.name);
                            return (
                              <button 
                                key={col.name} 
                                type="button" 
                                onClick={() => handleColorToggle(col)} 
                                className={`relative h-12 p-2 flex flex-col justify-end text-left transition-all ${isSelected ? 'ring-1 ring-zinc-900 scale-95' : 'border border-zinc-200/50 hover:border-zinc-400'}`} 
                                style={{ backgroundColor: col.hex }}
                              >
                                <span className={`text-[9px] font-bold tracking-widest truncate flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                                  {col.name.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 04. 雰囲気・画材をトッピング */}
                  <div className="pt-6 border-t border-zinc-100">
                    <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-4">
                      STYLE & TEXTURE / スタイル・画材 (複数選択可)
                    </label>
                    
                    <div className="space-y-4">
                      {TAG_CATEGORIES.map(category => (
                        <div key={category.category} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                          <span className="text-[9px] font-bold tracking-widest text-zinc-400 w-32 shrink-0 pt-1.5">{category.category}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {category.tags.map(tag => {
                              const isSelected = selectedTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedTags(selectedTags.filter(t => t !== tag));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                  className={`px-3 py-1.5 text-[9px] font-bold tracking-widest transition-colors border ${
                                    isSelected 
                                      ? 'bg-zinc-900 text-white border-zinc-900' 
                                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900'
                                  }`}
                                >
                                  {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 05. 柄のサイズ感 */}
                  <div className="pt-6 border-t border-zinc-100">
                    <div className="flex justify-between items-end mb-3">
                      <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase">
                        PATTERN SCALE / 柄の大きさ
                      </label>
                      <span className="text-[9px] text-zinc-400 font-light">40cm反物基準</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'small', label: '細かい', desc: '小紋調・密' },
                        { id: 'medium', label: '普 通', desc: '標準サイズ' },
                        { id: 'large', label: '大きい', desc: '大胆な大柄' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPatternScale(item.id as 'small' | 'medium' | 'large')}
                          className={`py-3 px-2 text-center border transition-colors flex flex-col items-center justify-center ${
                            patternScale === item.id
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-widest">{item.label}</span>
                          <span className="text-[9px] font-light mt-1 opacity-70">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 06. 柄の向き・天地 */}
                  <div className="pt-6 border-t border-zinc-100">
                    <div className="flex justify-between items-end mb-3">
                      <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase">
                        PATTERN DIRECTION / 柄の向き
                      </label>
                      <span className="text-[9px] text-zinc-500 font-light">
                        {density.includes('額縁') || density.includes('スクエア') ? 'SQUARE FRAME' : density.includes('四方') ? 'ALL-OVER SEAMLESS' : 'UPWARD ALIGNMENT'}
                      </span>
                    </div>

                    {itemType === 'scarf' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDensity('額縁スクエアパネル（正方形1枚絵）')}
                          className={`py-4 px-4 border transition-colors flex flex-col items-center justify-center text-center ${
                            density.includes('額縁') || density.includes('スクエア')
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-widest mb-1">
                            SQUARE FRAME (額縁)
                          </span>
                          <span className="text-[9px] font-light opacity-70">正方形1枚絵パネル</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDensity('四方柄（天地無用）')}
                          className={`py-4 px-4 border transition-colors flex flex-col items-center justify-center text-center ${
                            density.includes('四方') || density.includes('天地無用')
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-widest mb-1">
                            SEAMLESS REPEAT (総柄)
                          </span>
                          <span className="text-[9px] font-light opacity-70">天地無用・全面シームレス小紋</span>
                        </button>
                      </div>
                    ) : itemType === 'kyobukuro' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: '四方柄（天地無用）', label: 'ALL-OVER (四方柄)', sub: '天地無用・ランダム' },
                          { id: 'お太鼓柄（ワンポイント主役パネル）', label: 'CENTERED (お太鼓)', sub: '中央主役' },
                          { id: '額縁スクエアパネル（正方形1枚絵）', label: 'SQUARE FRAME (額縁)', sub: '正方形1枚絵' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDensity(item.id)}
                            className={`py-3 px-3 text-center border transition-colors flex flex-col items-center justify-center ${
                              density.includes(item.label.split(' ')[0]) 
                                ? 'bg-zinc-900 text-white border-zinc-900' 
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                            }`}
                          >
                            <span className="text-[10px] font-bold tracking-widest mb-1">{item.label}</span>
                            <span className="text-[9px] font-light opacity-70">{item.sub}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDensity('四方柄（天地無用）')}
                          className={`py-4 px-4 border transition-colors flex flex-col items-center justify-center text-center ${
                            density.includes('四方') || density.includes('天地無用')
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-widest mb-1">
                            ALL-OVER (四方柄)
                          </span>
                          <span className="text-[9px] font-light opacity-70">上下左右逆さま・着物向け</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDensity('一方向（上向き）')}
                          className={`py-4 px-4 border transition-colors flex flex-col items-center justify-center text-center ${
                            density.includes('一方向') || density.includes('上向き')
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
                          }`}
                        >
                          <span className="text-[10px] font-bold tracking-widest mb-1">
                            UPWARD (一方向)
                          </span>
                          <span className="text-[9px] font-light opacity-70">すべて頭が上・帯向け</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 07. TITLE / 作品名 */}
                  <div className="pt-6 border-t border-zinc-100">
                    <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">
                      TITLE / 作品名
                    </label>
                    <input
                      type="text"
                      className="w-full border border-zinc-300 p-3 bg-zinc-50 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                      placeholder="作品名を入力"
                      value={patternTitle}
                      onChange={(e) => setPatternTitle(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                </div>
              )}
            </div>
          </>
        ) : (
          /* 幾何学モード */
          <div className="space-y-6 animate-fade-in text-left pt-2">
            <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">柄の種類</label>
                <select 
                  value={geoPatternType} 
                  onChange={(e) => setGeoPatternType(e.target.value as any)} 
                  className="w-full border border-zinc-300 p-3 bg-white text-xs focus:border-zinc-900 focus:outline-none transition-colors"
                >
                  <option value="plain">無地</option>
                  <option value="stripe">縞（ストライプ）</option>
                  <option value="dot">水玉（ドット）</option>
                  <option value="grid">格子（ラインチェック）</option>
                  <option value="gingham">ギンガムチェック</option>
                  <option value="checker">市松（チェッカー）</option>
                </select>
              </div>
              {geoPatternType === 'stripe' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">縞の向き</label>
                  <select 
                    value={stripeDir} 
                    onChange={(e) => setStripeDir(e.target.value as 'vertical' | 'horizontal' | 'diagonal')} 
                    className="w-full border border-zinc-300 p-3 bg-white text-xs focus:border-zinc-900 focus:outline-none transition-colors"
                  >
                    <option value="vertical">縦縞（滝縞）</option>
                    <option value="horizontal">横縞（ボーダー）</option>
                    <option value="diagonal">斜め（右上がり）</option>
                  </select>
                </div>
              )}
              {geoPatternType === 'dot' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">配置</label>
                  <select 
                    value={dotLayout} 
                    onChange={(e) => setDotLayout(e.target.value as 'staggered' | 'grid')} 
                    className="w-full border border-zinc-300 p-3 bg-white text-xs focus:border-zinc-900 focus:outline-none transition-colors"
                  >
                    <option value="staggered">千鳥（互い違い）</option>
                    <option value="grid">正方格子</option>
                  </select>
                </div>
              )}
            </div>

            {geoPatternType !== 'plain' && (
              <div className="space-y-5 pt-6 border-t border-zinc-100">
                <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase">サイズ調整 (mm実寸)</label>
                
                {geoPatternType === 'dot' && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest">水玉の大きさ</span>
                        <span className="text-xs font-mono text-zinc-900">{dotRadius * 2}<span className="text-[9px] text-zinc-400 ml-1">mm</span></span>
                      </div>
                      <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-1 bg-zinc-200 appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest">間隔</span>
                        <span className="text-xs font-mono text-zinc-900">{gapWidth}<span className="text-[9px] text-zinc-400 ml-1">mm</span></span>
                      </div>
                      <input type="range" min="0" max="100" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-1 bg-zinc-200 appearance-none" />
                    </div>
                  </>
                )}

                {geoPatternType === 'checker' && (
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] text-zinc-500 font-bold tracking-widest">市松の大きさ</span>
                      <span className="text-xs font-mono text-zinc-900">{lineWidth}<span className="text-[9px] text-zinc-400 ml-1">mm</span></span>
                    </div>
                    <input type="range" min="1" max="200" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-1 bg-zinc-200 appearance-none" />
                  </div>
                )}

                {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham') && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest">線の太さ</span>
                        <span className="text-xs font-mono text-zinc-900">{lineWidth}<span className="text-[9px] text-zinc-400 ml-1">mm</span></span>
                      </div>
                      <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-1 bg-zinc-200 appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest">間隔</span>
                        <span className="text-xs font-mono text-zinc-900">{gapWidth}<span className="text-[9px] text-zinc-400 ml-1">mm</span></span>
                      </div>
                      <input type="range" min="0" max="200" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-1 bg-zinc-200 appearance-none" />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-zinc-100 space-y-4">
              <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">{geoPatternType === 'plain' ? 'BASE COLOR' : 'BASE COLOR'}</label>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 shrink-0 border border-zinc-200" style={{ backgroundColor: geoBgColor }} />
                    <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')} className={`flex-1 text-[10px] h-8 font-bold tracking-widest uppercase transition-colors border ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-900'}`}>PALETTE</button>
                  </div>
                </div>
                {geoPatternType !== 'plain' && (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">PATTERN COLOR</label>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 shrink-0 border border-zinc-200" style={{ backgroundColor: geoPatternColor }} />
                      <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')} className={`flex-1 text-[10px] h-8 font-bold tracking-widest uppercase transition-colors border ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300 hover:border-zinc-900'}`}>PALETTE</button>
                    </div>
                  </div>
                )}
              </div>

              {showGeoPaletteFor && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 animate-fade-in mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] text-zinc-900 font-bold tracking-widest uppercase">SELECT {showGeoPaletteFor === 'bg' ? 'BASE' : 'PATTERN'} COLOR</p>
                    <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[9px] text-zinc-400 font-bold tracking-widest uppercase hover:text-zinc-900">CLOSE</button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto pr-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {TRADITIONAL_COLORS.map((col) => (
                      <button key={col.name} type="button" onClick={() => { if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex); if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex); setShowGeoPaletteFor(null); }} className="relative h-10 p-1 flex flex-col justify-end text-left border border-zinc-200 hover:border-zinc-400 transition-colors" style={{ backgroundColor: col.hex }}>
                        <span className={`text-[8px] font-bold tracking-widest truncate ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <label className="block text-[10px] font-bold text-zinc-900 tracking-widest uppercase mb-2">
                TITLE / 作品名
              </label>
              <input
                type="text"
                className="w-full border border-zinc-300 p-3 bg-zinc-50 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                placeholder="作品名"
                value={patternTitle}
                onChange={(e) => setPatternTitle(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 生成完了後の作品表示エリア */}
        {imageUrl && !imageUrl.includes('sample_piano_cat') && !imageUrl.includes('sample_cafe') && !imageUrl.includes('sample_antique') && !imageUrl.includes('sample_hokusai_cat') && (
          <div className="pt-10 mt-10 border-t border-zinc-900 space-y-6 animate-fade-in -mx-6 lg:-mx-10 px-6 lg:px-10 pb-10">
            <h3 className="text-center font-bold text-[11px] sm:text-xs tracking-[0.2em] text-zinc-900 uppercase">
              GENERATION COMPLETE
            </h3>

            {creationMode === 'ai' && (
              <button
                type="button"
                onClick={() => {
                  setIsAdvancedOpen(true);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="w-full py-4 bg-white hover:bg-zinc-50 border border-zinc-200 text-[10px] font-bold text-zinc-900 tracking-widest uppercase transition-colors"
              >
                ADJUST SETTINGS / 設定を調整して再生成
              </button>
            )}

            <div className="space-y-4">
              {/* ギャラリー公開フォーム */}
              <div className="bg-zinc-50 border border-zinc-200 p-6">
                <p className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase mb-4">
                  PUBLISH TO GALLERY / ギャラリーに公開
                </p>
                <div className="space-y-4">
                  {publishSuccess ? (
                    <div className="p-4 bg-zinc-900 text-center animate-fade-in">
                      <p className="text-[10px] font-bold text-white tracking-widest uppercase">PUBLISHED SUCCESSFULLY / ギャラリーに公開しました</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 tracking-widest uppercase mb-2">TITLE / 作品名（必須）</label>
                        <input
                          type="text"
                          className="w-full border border-zinc-300 p-3 bg-white text-xs focus:outline-none focus:border-zinc-900 transition-colors"
                          placeholder="作品名"
                          value={patternTitle}
                          onChange={(e) => setPatternTitle(e.target.value)}
                          disabled={isPublishing}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 tracking-widest uppercase mb-2">SNS ACCOUNT (Optional) / SNSアカウント</label>
                        <input
                          type="text"
                          className="w-full border border-zinc-300 p-3 bg-white text-xs focus:outline-none focus:border-zinc-900 transition-colors"
                          placeholder="e.g. @gofukuyasan"
                          value={galleryAuthor}
                          onChange={(e) => setGalleryAuthor(e.target.value)}
                          disabled={isPublishing}
                        />
                      </div>
                      
                      {/* NEW: クリエイターのひとこと */}
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-500 tracking-widest uppercase mb-2">CREATOR'S NOTE (Optional) / こだわりやひとこと</label>
                        <textarea
                          className="w-full border border-zinc-300 p-3 bg-white text-xs focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                          placeholder="どんな人に着てほしいか、どこにこだわったか等（ギャラリーに表示されます）"
                          rows={2}
                          value={galleryNote}
                          onChange={(e) => setGalleryNote(e.target.value)}
                          disabled={isPublishing}
                        />
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer select-none mt-2">
                        <input 
                          type="checkbox" 
                          checked={publishToGallery} 
                          onChange={(e) => setPublishToGallery(e.target.checked)} 
                          className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer shrink-0" 
                          disabled={isPublishing}
                        />
                        <span className="text-[10px] text-zinc-500 font-light leading-relaxed">
                          ギャラリーへの掲載と、ゴフクヤサン公式SNSでの紹介に同意する
                        </span>
                      </label>
                      <button 
                        type="button" 
                        onClick={handlePublishToGallery}
                        disabled={!publishToGallery || !patternTitle.trim() || isPublishing}
                        className={`w-full py-4 text-[10px] font-bold tracking-widest uppercase transition-all border ${
                          !publishToGallery || !patternTitle.trim()
                            ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed'
                            : 'bg-zinc-900 hover:bg-black text-white border-zinc-950'
                        }`}
                      >
                        {isPublishing ? 'PUBLISHING...' : 'PUBLISH & SAVE / 公開して保存'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <button 
                  type="button" 
                  onClick={handleDownloadOriginal} 
                  className="w-full py-4 text-center border border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white text-zinc-900 text-[10px] font-bold tracking-widest uppercase transition-colors"
                >
                  DOWNLOAD ORIGINAL DATA / 原画を保存
                </button>
                <p className="text-[9px] text-zinc-400 text-center font-light mt-2 tracking-widest">
                  Hint: Save your design for later use. / 気に入った柄を保存
                </p>
              </div>

              {/* SNSシェア */}
              <div className="pt-6 border-t border-zinc-200">
                <p className="text-[9px] font-bold text-zinc-900 tracking-widest uppercase mb-4 text-center">SHARE ON SOCIAL MEDIA</p>
                
                <div className="grid grid-cols-5 gap-2">
                  <button type="button" onClick={shareToX} className="py-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors flex justify-center items-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase">X</span>
                  </button>
                  <button type="button" onClick={shareToThreads} className="py-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors flex justify-center items-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase">TH</span>
                  </button>
                  <button type="button" onClick={shareToInstagram} className="py-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors flex justify-center items-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase">IG</span>
                  </button>
                  <button type="button" onClick={shareToPinterest} className="py-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors flex justify-center items-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase">PIN</span>
                  </button>
                  <button type="button" onClick={shareToFacebook} className="py-3 bg-zinc-50 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors flex justify-center items-center">
                    <span className="text-[9px] font-bold tracking-widest uppercase">FB</span>
                  </button>
                </div>
              </div>

              {/* オーダーボタン */}
              <div className="pt-2">
                <a 
                  href="#" 
                  onClick={handleOrderClick} 
                  className="block w-full py-5 text-center bg-zinc-900 hover:bg-black text-white transition-colors border border-zinc-950"
                >
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                      {itemType === 'scarf' 
                        ? 'ORDER AS WOOL SCARF / スカーフにお仕立て' 
                        : 'ORDER AS KIMONO OR OBI / 着物・帯にお仕立て'}
                    </span>
                    <span className="text-[9px] font-light tracking-widest opacity-80">
                      実質0円対象 / ポイント還元
                    </span>
                  </div>
                </a>
              </div>

              {primaryMotif && (
                <div className="mt-8 p-6 bg-zinc-50 border border-zinc-200 text-center animate-fade-in">
                  <p className="text-[9px] font-bold text-zinc-900 tracking-widest uppercase mb-3">RELATED ITEMS</p>
                  <p className="text-[10px] text-zinc-600 mb-4 leading-relaxed font-light">
                    ゴフクヤサンが誇る『{primaryMotif}』のコレクションもご覧になりませんか？
                  </p>
                  <a 
                    href={makeshopSearchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block w-full py-3 bg-white border border-zinc-300 text-zinc-900 text-[9px] font-bold tracking-widest hover:border-zinc-900 transition-colors uppercase"
                  >
                    VIEW COLLECTION →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
