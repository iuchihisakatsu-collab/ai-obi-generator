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
    category: ' 雰囲気・様式',
    tags: ['大正ロマン', '昭和レトロ', 'モリス風', 'ガレ風', 'ミュシャ風', '北斎風', '若冲風', '光琳・琳派', '夢二浪漫', 'アール・ヌーヴォー', '北欧風', 'アンティーク', '和モダン']
  },
  {
    category: ' タッチ・画材',
    tags: ['水彩画', '木版画', 'ステンドグラス', 'ペン画', '切り絵', 'リソグラフ風', 'トワルドジュイ']
  },
  {
    category: ' 人気モチーフ',
    tags: ['猫', '兎', '鳥', '椿', '薔薇', '百合', '鍵盤', '幾何学', '波・雲']
  },
  {
    category: ' 配色・トーン',
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
          imageUrl: imageUrl, // 40cm角の元データ
          title: patternTitle,
          author: galleryAuthor,
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
    const trimmed = inputCodeValue.trim();
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
      else if (itemType === 'kimono') setDensity('四方柄（天地無用）');
      else if (itemType === 'hanhaba') setDensity('一方向（上向き）');
      else setDensity('総柄（小紋タイプ）');
    }
  }, [itemType, density, setDensity]);

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map((c) => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = `「妄想小紋図案帖」で柄のアイデアを試してみました。\n作品名：『${finalTitle}』\n配色：${colorSummary}\n#妄想きもの図案帳 #ゴフクヤサン`;
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
      alert('作品名とテキストをコピーしました。\nInstagramの投稿画面に貼り付けてお使いください。');
    } catch {}
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const primaryMotif = motif.trim() ? motif.split('、')[0].split(' ')[0] : '';
  const makeshopSearchUrl = primaryMotif ? `https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(primaryMotif)}` : 'https://store.gofukuyasan.com/';

  const effectiveRemainingFlux = remainingFlux ?? 15;
  const effectiveRemainingOpenAI = remainingOpenAI ?? remainingCount ?? 1;

  const hasValidCode = Boolean(premiumCode && premiumCode.trim().length > 0);
  const isInstagramCode = premiumCode.trim().toUpperCase().startsWith('IG-');
  const isPaidTicketCode = premiumCode.trim().toUpperCase().startsWith('GFK-');

  return (
    <div className="w-full bg-white border border-zinc-200 p-4 sm:p-7 lg:p-8 shrink-0 shadow-sm z-10 relative rounded-sm">
      
      <div className="space-y-5">

        {/*  最上部：チケット・クーポン入力バー */}
        {creationMode === 'ai' && (
          <div className="bg-zinc-50 border border-zinc-200 rounded p-3 text-left">
            {hasValidCode ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
                      <span></span>
                      <span>
                        {isInstagramCode 
                          ? 'Instagram特典コード適用中' 
                          : isPaidTicketCode 
                            ? 'プレミアムチケット適用中' 
                            : 'チケットコード適用中'}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 block">
                      コード: {premiumCode}
                      {ticketRemaining !== null && ticketRemaining !== undefined && (
                        <strong className="text-emerald-700 ml-1.5">（残り {ticketRemaining}回）</strong>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowCodeInput(true)}
                    className="text-[10px] font-bold text-zinc-600 hover:text-zinc-950 underline"
                  >
                    変更
                  </button>
                  <span className="text-zinc-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="text-[10px] font-bold text-red-600 hover:text-red-800 underline"
                  >
                    解除
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
                      className="text-left flex items-center gap-1.5 group w-full"
                    >
                      <span className="text-xs"></span>
                      <span className="text-[11px] font-bold text-zinc-800 group-hover:text-zinc-950 group-hover:underline">
                        Instagramクーポン・チケットをお持ちの方はこちら
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold ml-auto">▼ 入力</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1">
                        <span></span>
                        <span>コードを入力してください</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCodeInput(false)}
                        className="text-[10px] text-zinc-400 hover:text-zinc-700"
                      >
                        閉じる
                      </button>
                    </div>

                    <form onSubmit={handleApplyCode} className="flex gap-1.5">
                      <input
                        type="text"
                        value={inputCodeValue}
                        onChange={(e) => setInputCodeValue(e.target.value)}
                        placeholder="例: IG-XXXXXX または GFK-XXXX-XXXX"
                        className="flex-1 border border-zinc-300 p-2 text-xs bg-white font-mono rounded focus:border-zinc-900 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!inputCodeValue.trim()}
                        className="px-4 py-2 bg-zinc-900 hover:bg-black disabled:bg-zinc-300 disabled:text-zinc-400 text-white text-xs font-bold rounded shadow-sm transition-all whitespace-nowrap"
                      >
                        適用する
                      </button>
                    </form>

                    <div className="flex items-center justify-between pt-1 text-[9.5px] text-zinc-500">
                      <a
                        href="https://www.instagram.com/gofukuyasan/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-0.5"
                      >
                        <span> インスタで無料コードをもらう（最新投稿に「チケット」とコメント）</span>
                        <span></span>
                      </a>
                      <a
                        href="https://store.gofukuyasan.com/view/item/000000007300"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-0.5"
                      >
                        <span> 50回チケット購入</span>
                        <span></span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {codeAppliedSuccess && (
              <div className="mt-2 p-2 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded animate-fade-in flex items-center gap-1.5">
                <span></span>
                <span>コードを適用しました！下の生成ボタンから本気デザインをお試しいただけます。</span>
              </div>
            )}
          </div>
        )}

        {creationMode === 'ai' ? (
          <>
            {/* 01. 何を描く？（モチーフ入力） */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                  01. 何を描く？（テーマ・モチーフ）
                </label>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded text-[10.5px] font-bold shadow-sm transition-all active:scale-95">
                  <span></span>
                  <span>{analyzingPhoto ? '解析中...' : '写真から自動入力'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUploadAndExtract} disabled={analyzingPhoto || loading} className="hidden" />
                </label>
              </div>

              <div className="relative">
                <textarea 
                  className="w-full border border-zinc-300 p-3 sm:p-3.5 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium shadow-sm rounded-sm" 
                  placeholder="好きなものを自由に入力（例：黒猫、ピアノの鍵盤、月、椿）" 
                  rows={2} 
                  value={motif} 
                  onChange={(e) => setMotif(e.target.value)} 
                  disabled={loading || analyzingPhoto} 
                />
                {motif && (
                  <button 
                    type="button"
                    onClick={() => setMotif('')} 
                    className="absolute right-2.5 bottom-2.5 text-[9px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 px-2 py-0.5 rounded transition-colors"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            {/* ひらめき作例（ワンタップ自動入力） */}
            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[10px] font-bold text-zinc-500">
                   アイデアに迷ったら（作例をワンタップでセット）：
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {RECIPES.map(recipe => (
                  <button
                    key={recipe.id}
                    type="button"
                    onClick={() => handleRecipeSelect(recipe)}
                    className="p-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-left transition-all flex items-center gap-2 group hover:border-zinc-400"
                  >
                    <img src={recipe.image} alt={recipe.title} className="w-8 h-8 rounded object-cover shrink-0 border border-zinc-200" />
                    <span className="text-[10px] font-bold text-zinc-800 line-clamp-1 group-hover:text-zinc-950">
                      {recipe.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 同意チェック ＆ 著作権ポリシー */}
            <div className="pt-2 border-t border-zinc-100 space-y-1.5">
              <label className="flex items-start gap-2 cursor-pointer select-none group">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer shrink-0" 
                />
                <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800 transition-colors">
                  作成図案は意匠のアイデアです。実際の生地制作時はスタッフが目視で柄のつなぎ目（送り）を調整することに同意します。
                </span>
              </label>

              <button 
                type="button" 
                onClick={onOpenPolicy} 
                className="text-[9.5px] font-bold text-zinc-400 hover:text-zinc-800 underline text-left flex items-center gap-1 ml-5"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                当店の著作権ポリシーと安心への取り組み
              </button>
            </div>

            {/* エラーメッセージ */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded shadow-sm animate-fade-in">
                {errorMsg}
              </div>
            )}

            {/* 生成ボタンエリア */}
            <div className="space-y-2 pt-1">
              {hasValidCode && (
                <div className="space-y-1">
                  <button 
                    type="button" 
                    onClick={() => handleGenerate('openai_premium')} 
                    disabled={loading} 
                    className="w-full py-3.5 px-4 font-black text-xs sm:text-sm tracking-wider bg-zinc-950 hover:bg-black text-white rounded shadow-md transition-all flex items-center justify-center gap-2 border border-zinc-900 active:scale-[0.99] disabled:opacity-50"
                  >
                    <span></span>
                    <span>
                      {loading && (generatingMode === 'openai_premium' || (loadingEngine === 'openai' && premiumCode))
                        ? '本気デザインを描出中...'
                        : `チケットで本気デザインを生成${ticketRemaining !== null ? `（残り ${ticketRemaining}回）` : ''}`}
                    </span>
                  </button>
                  <p className="text-[9px] text-zinc-500 text-center">
                    ※選んだ生地の地色やモチーフを高精度に描き出します
                  </p>
                </div>
              )}

              {!hasValidCode && (
                <div className="space-y-1">
                  <button 
                    type="button" 
                    onClick={() => handleGenerate('openai_free')} 
                    disabled={loading || effectiveRemainingOpenAI <= 0} 
                    className={`w-full py-3.5 px-4 font-black text-xs sm:text-sm tracking-wider transition-all duration-200 flex items-center justify-center gap-2 rounded shadow-sm ${
                      effectiveRemainingOpenAI <= 0 
                        ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' 
                        : 'bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50 border border-zinc-900'
                    }`}
                  >
                    {loading && (generatingMode === 'openai_free' || (loadingEngine === 'openai' && !premiumCode)) ? (
                      <span>本気デザインを描出中...</span>
                    ) : (
                      <span>
                        {effectiveRemainingOpenAI <= 0 
                          ? '本日の無料本気デザイン枠は終了しました' 
                          : ` 本気デザインでつくる（本日無料 ${effectiveRemainingOpenAI}回）`}
                      </span>
                    )}
                  </button>
                  <p className="text-[9px] text-zinc-500 text-center">
                    ※言葉のニュアンスや構図を計算して高精度に描き出します
                  </p>
                </div>
              )}

              <div>
                <button 
                  type="button" 
                  onClick={() => handleGenerate('flux')} 
                  disabled={loading || effectiveRemainingFlux <= 0} 
                  className={`w-full py-2.5 px-3 font-bold text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 rounded ${
                    effectiveRemainingFlux <= 0
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300'
                  }`}
                >
                  {loading && (generatingMode === 'flux' || loadingEngine === 'flux') ? (
                    <span>スケッチを描画中...</span>
                  ) : (
                    <span>
                      {effectiveRemainingFlux <= 0
                        ? '本日のスケッチ枠は終了しました'
                        : ` 気まぐれスケッチで試す（本日残り ${effectiveRemainingFlux}回）`}
                    </span>
                  )}
                </button>
                <p className="text-[8.5px] text-zinc-400 text-center mt-0.5">
                  ※まずは使い方に慣れたり、偶然の面白い出会いを楽しむテスト用にお使いください
                </p>
              </div>

              {!hasValidCode && effectiveRemainingOpenAI <= 0 && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded text-left animate-fade-in mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[11px] text-amber-950 flex items-center gap-1">
                      <span></span>
                      <span>もっと試したい方へ</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCodeInput(true)}
                      className="text-[10px] font-bold text-amber-900 underline"
                    >
                      コードをお持ちの方はこちら
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <a
                      href="https://www.instagram.com/gofukuyasan/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-amber-200 rounded text-center hover:bg-amber-100/50 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-zinc-900 block"> インスタで無料GET</span>
                      <span className="text-[8.5px] text-zinc-500 block mt-0.5">最新投稿に「チケット」とコメント</span>
                    </a>
                    <a
                      href="https://store.gofukuyasan.com/view/item/000000007300"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white border border-amber-200 rounded text-center hover:bg-amber-100/50 transition-colors"
                    >
                      <span className="text-[10px] font-bold text-zinc-900 block"> 50回チケット購入</span>
                      <span className="text-[8.5px] text-zinc-500 block mt-0.5">注文時全額ポイント還元</span>
                    </a>
                  </div>
                </div>
              )}

              {premiumStatusMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 animate-fade-in text-left">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                    
                  </span>
                  <p className="text-xs font-bold text-emerald-900">
                    {premiumStatusMsg}
                  </p>
                </div>
              )}
            </div>

            {/* ローディング */}
            {loading && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded shadow-2xl flex flex-col gap-2.5 animate-fade-in my-3 text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 border-2 border-zinc-600 border-t-amber-400 rounded-full animate-spin shrink-0" />
                  <p className="text-xs font-bold text-white tracking-wide">
                    {LOADING_STEPS[loadingStep % LOADING_STEPS.length]}
                  </p>
                </div>

                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-[3000ms] ease-out"
                    style={{ width: `${Math.min(100, (loadingStep + 1) * 22)}%` }}
                  />
                </div>

                <div className="text-[9.5px] text-zinc-400 flex justify-between items-center">
                  <span>{generatingMode === 'flux' ? ' スケッチを描画中' : ' 高精度で描出中（約10〜15秒）'}</span>
                  <span className="text-amber-400 font-bold animate-pulse">画面を閉じずにお待ちください</span>
                </div>
              </div>
            )}

            {/* こだわり設定（アコーディオン） */}
            <div className="pt-3 border-t border-zinc-200">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-700"></span>
                  <span className="text-xs font-bold text-zinc-800 group-hover:text-zinc-950">
                    もっと細かく設定する（色・テイスト・サイズ・向き）
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {isAdvancedOpen ? '閉じる' : '開く'}
                  </span>
                  <span className={`text-[10px] text-zinc-400 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {isAdvancedOpen && (
                <div className="pt-4 space-y-5 animate-fade-in">
                  
                  {/* 02. 図案のテイスト */}
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                        図案のテイスト
                      </label>
                      <span className="text-[9px] text-zinc-400">染織の風合い</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {TASTE_MODES.map((tm) => {
                        const isSelected = currentTaste === tm.id;
                        return (
                          <button
                            key={tm.id}
                            type="button"
                            onClick={() => setTasteMode?.(tm.id)}
                            className={`p-2 rounded border text-left transition-all ${
                              isSelected
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm ring-1 ring-zinc-900'
                                : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="text-[11px] font-bold block">{tm.title}</span>
                            <span className={`text-[8px] block mt-0.5 leading-tight ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                              {tm.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 03. 地色（ベースカラー）＆ 102色パレット */}
                  <div className="pt-3 border-t border-zinc-100 relative">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <div>
                        <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                          地色（ベースカラー）
                        </label>
                        <p className="text-[9.5px] text-amber-900 font-bold">★選んだ色が布地全体の背景（地色）になります</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowColorPalette(!showColorPalette)} 
                        className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 font-bold transition-colors"
                      >
                        <span>{showColorPalette ? '閉じる' : '伝統色パレット (102色)'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                      {selectedColors.length === 0 ? ( 
                        <span className="text-xs text-zinc-400 italic">指定なし（おまかせ調色）</span> 
                      ) : (
                        <>
                          {selectedColors.map((col, idx) => (
                            <span 
                              key={col.name} 
                              onClick={() => handleColorToggle(col)} 
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border cursor-pointer shadow-sm relative z-10 rounded-xs" 
                              style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}
                            >
                              {idx === 0 ? `【地色】${col.name.split(' ')[0]}` : col.name.split(' ')[0]}
                              <span className="text-[9px] opacity-70 ml-1">×</span>
                            </span>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => setSelectedColors([])} 
                            className="text-[10px] text-zinc-400 hover:text-zinc-700 underline ml-1 relative z-10"
                          >
                            リセット
                          </button>
                        </>
                      )}
                    </div>

                    {showColorPalette && (
                      <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50 rounded">
                        <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {TRADITIONAL_COLORS.map((col) => {
                            const isSelected = selectedColors.some((c) => c.name === col.name);
                            return (
                              <button 
                                key={col.name} 
                                type="button" 
                                onClick={() => handleColorToggle(col)} 
                                className={`relative min-h-[40px] p-1.5 flex flex-col justify-end text-left transition-all rounded-xs ${isSelected ? 'ring-2 ring-zinc-950 scale-95 font-black' : 'border border-zinc-200/50 shadow-sm hover:scale-[1.02]'}`} 
                                style={{ backgroundColor: col.hex }}
                              >
                                <span className={`text-[8.5px] font-bold truncate leading-tight flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                                  {col.name.split(' ')[0]}
                                  {isSelected && <span></span>}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 04. 雰囲気・画材をトッピング */}
                  <div className="pt-3 border-t border-zinc-100">
                    <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-2">
                      雰囲気・画材をトッピング（複数選択OK）
                    </label>
                    
                    <div className="space-y-3">
                      {TAG_CATEGORIES.map(category => (
                        <div key={category.category} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                          <span className="text-[9.5px] font-bold text-zinc-400 w-22 shrink-0 pt-0.5">{category.category}</span>
                          <div className="flex flex-wrap gap-1">
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
                                  className={`px-2 py-0.5 text-[9.5px] font-bold rounded-sm transition-all shadow-xs ${
                                    isSelected 
                                      ? 'bg-zinc-900 text-white ring-1 ring-zinc-900' 
                                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
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
                  <div className="pt-3 border-t border-zinc-100">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                        柄の大きさ（サイズ感）
                      </label>
                      <span className="text-[9px] text-zinc-400">40cm反物基準</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'small', label: '細かい', desc: '小紋調・密' },
                        { id: 'medium', label: '普 通', desc: '標準サイズ' },
                        { id: 'large', label: '大きい', desc: '大胆な大柄' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPatternScale(item.id as 'small' | 'medium' | 'large')}
                          className={`py-1.5 px-2 text-center border rounded-sm transition-all shadow-xs flex flex-col items-center justify-center ${
                            patternScale === item.id
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[10.5px] font-bold">{item.label}</span>
                          <span className="text-[8px] opacity-75 mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 06. 柄の向き・天地 */}
                  <div className="pt-3 border-t border-zinc-100">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                        柄の向き（天地）
                      </label>
                      <span className="text-[9.5px] text-zinc-500">
                        {density.includes('額縁') || density.includes('スクエア') ? ' 額縁スクエア構図' : density.includes('四方') ? ' 上下左右ランダム（着物推奨）' : ' 上向き整列（帯推奨）'}
                      </span>
                    </div>

                    {itemType === 'scarf' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDensity('額縁スクエアパネル（正方形1枚絵）')}
                          className={`py-2 px-3 border rounded-sm transition-all shadow-xs flex flex-col items-center justify-center text-center ${
                            density.includes('額縁') || density.includes('スクエア')
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[10.5px] font-bold flex items-center gap-1">
                            <span></span>
                            <span>額縁スクエア柄（推奨）</span>
                          </span>
                          <span className="text-[8px] opacity-75 mt-0.5">額縁パネル・正方形1枚絵</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDensity('四方柄（天地無用）')}
                          className={`py-2 px-3 border rounded-sm transition-all shadow-xs flex flex-col items-center justify-center text-center ${
                            density.includes('四方') || density.includes('天地無用')
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[10.5px] font-bold flex items-center gap-1">
                            <span></span>
                            <span>総柄リピート</span>
                          </span>
                          <span className="text-[8px] opacity-75 mt-0.5">天地無用・全面シームレス小紋</span>
                        </button>
                      </div>
                    ) : itemType === 'kyobukuro' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {[
                          { id: '四方柄（天地無用）', label: '四方柄', sub: '天地無用・ランダム' },
                          { id: 'お太鼓柄（ワンポイント主役パネル）', label: 'お太鼓柄', sub: '中央主役' },
                          { id: '額縁スクエアパネル（正方形1枚絵）', label: '額縁パネル', sub: '正方形1枚絵' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDensity(item.id)}
                            className={`py-1.5 px-2 text-center border rounded-sm transition-all shadow-xs flex flex-col items-center justify-center ${
                              density.includes(item.label) 
                                ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900' 
                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                            }`}
                          >
                            <span className="text-[10.5px] font-black">{item.label}</span>
                            <span className="text-[8px] opacity-75 mt-0.5">{item.sub}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDensity('四方柄（天地無用）')}
                          className={`py-2 px-3 border rounded-sm transition-all shadow-xs flex flex-col items-center justify-center text-center ${
                            density.includes('四方') || density.includes('天地無用')
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[10.5px] font-bold flex items-center gap-1">
                            <span></span>
                            <span>四方柄（天地無用）</span>
                          </span>
                          <span className="text-[8px] opacity-75 mt-0.5">上下左右逆さま・着物向け</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDensity('一方向（上向き）')}
                          className={`py-2 px-3 border rounded-sm transition-all shadow-xs flex flex-col items-center justify-center text-center ${
                            density.includes('一方向') || density.includes('上向き')
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[10.5px] font-bold flex items-center gap-1">
                            <span></span>
                            <span>一方向（上向き）</span>
                          </span>
                          <span className="text-[8px] opacity-75 mt-0.5">すべて頭が上・帯向け</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 07. 作品名 */}
                  <div className="pt-3 border-t border-zinc-100">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-1">
                      作品名 <span className="font-normal text-[9.5px] text-zinc-400">（お好みの名前に変更できます）</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-zinc-300 p-2 bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:bg-white shadow-xs font-bold rounded"
                      placeholder="作品名"
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
          <div className="space-y-5 animate-fade-in text-left">
            <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1">柄の種類</label>
                <select 
                  value={geoPatternType} 
                  onChange={(e) => setGeoPatternType(e.target.value as any)} 
                  className="w-full border border-zinc-300 p-2 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-xs font-bold rounded"
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
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1">縞の向き</label>
                  <select 
                    value={stripeDir} 
                    onChange={(e) => setStripeDir(e.target.value as 'vertical' | 'horizontal' | 'diagonal')} 
                    className="w-full border border-zinc-300 p-2 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-xs rounded"
                  >
                    <option value="vertical">縦縞（滝縞）</option>
                    <option value="horizontal">横縞（ボーダー）</option>
                    <option value="diagonal">斜め（右上がり）</option>
                  </select>
                </div>
              )}
              {geoPatternType === 'dot' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1">配置</label>
                  <select 
                    value={dotLayout} 
                    onChange={(e) => setDotLayout(e.target.value as 'staggered' | 'grid')} 
                    className="w-full border border-zinc-300 p-2 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-xs rounded"
                  >
                    <option value="staggered">千鳥（互い違い）</option>
                    <option value="grid">正方格子</option>
                  </select>
                </div>
              )}
            </div>

            {geoPatternType !== 'plain' && (
              <div className="space-y-4 pt-3 border-t border-zinc-100">
                <label className="block text-xs font-bold text-zinc-900">サイズ調整（mm実寸連動）</label>
                
                {geoPatternType === 'dot' && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">水玉の大きさ（直径）</span>
                        <span className="text-xs font-black text-zinc-900">{dotRadius * 2}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                        <span className="text-xs font-black text-zinc-900">{gapWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="0" max="100" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                  </>
                )}

                {geoPatternType === 'checker' && (
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">市松の大きさ（1マス）</span>
                      <span className="text-xs font-black text-zinc-900">{lineWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                    </div>
                    <input type="range" min="1" max="200" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                  </div>
                )}

                {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham') && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">線の太さ</span>
                        <span className="text-xs font-black text-zinc-900">{lineWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                        <span className="text-xs font-black text-zinc-900">{gapWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="0" max="200" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 mb-1">{geoPatternType === 'plain' ? '無地の色' : '地色'}</label>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 shrink-0 border border-zinc-300 shadow-inner rounded-xs" style={{ backgroundColor: geoBgColor }} />
                    <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')} className={`flex-1 text-[11px] h-7 font-bold transition-all border shadow-xs rounded ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>伝統色</button>
                  </div>
                </div>
                {geoPatternType !== 'plain' && (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 mb-1">柄色</label>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 shrink-0 border border-zinc-300 shadow-inner rounded-xs" style={{ backgroundColor: geoPatternColor }} />
                      <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')} className={`flex-1 text-[11px] h-7 font-bold transition-all border shadow-xs rounded ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>伝統色</button>
                    </div>
                  </div>
                )}
              </div>

              {showGeoPaletteFor && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner rounded">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-zinc-500 font-bold">{showGeoPaletteFor === 'bg' ? (geoPatternType === 'plain' ? '無地の色' : '地色') : '柄色'}を選択：</p>
                    <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[10px] text-zinc-400 font-bold">閉じる</button>
                  </div>
                  <div className="max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {TRADITIONAL_COLORS.map((col) => (
                        <button key={col.name} type="button" onClick={() => { if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex); if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex); setShowGeoPaletteFor(null); }} className="relative min-h-[38px] p-1 flex flex-col justify-end text-left border border-zinc-300 shadow-xs hover:scale-[1.02] transition-transform rounded-xs" style={{ backgroundColor: col.hex }}>
                          <span className={`text-[8.5px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-1">
                作品名
              </label>
              <input
                type="text"
                className="w-full border border-zinc-300 p-2 bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:bg-white shadow-xs font-bold rounded"
                placeholder="作品名"
                value={patternTitle}
                onChange={(e) => setPatternTitle(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 生成完了後の作品表示エリア */}
        {imageUrl && !imageUrl.includes('sample_piano_cat') && !imageUrl.includes('sample_cafe') && !imageUrl.includes('sample_antique') && !imageUrl.includes('sample_hokusai_cat') && (
          <div className="pt-6 mt-6 border-t-2 border-zinc-950 space-y-4 animate-fade-in bg-zinc-50 -mx-4 sm:-mx-7 lg:-mx-8 px-4 sm:px-7 lg:px-8 pb-6">
            <h3 className="text-center font-bold text-sm tracking-widest text-zinc-900 pt-2">
               あなただけの作品が完成しました
            </h3>

            {creationMode === 'ai' && (
              <button
                type="button"
                onClick={() => {
                  setIsAdvancedOpen(true);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-3 bg-white hover:bg-zinc-100 border border-zinc-300 rounded text-xs font-bold text-zinc-800 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span></span>
                <span>色やサイズを変えてもう一度作る（こだわり設定を開く）</span>
              </button>
            )}

            <div className="space-y-3">
              {/*  ギャラリー公開フォーム */}
              <div className="bg-white border border-zinc-200 p-4 shadow-sm rounded">
                <p className="text-[11px] font-black text-zinc-900 mb-2 flex items-center gap-1.5">
                  <span className="text-sm"></span>
                  <span>あなたの図案をみんなのギャラリーに飾りませんか？</span>
                </p>
                <div className="space-y-3">
                  {publishSuccess ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-center animate-fade-in">
                      <p className="text-xs font-bold text-emerald-900 mb-1"> ギャラリーに展示されました！</p>
                      <p className="text-[10px] text-emerald-700">素敵な作品をありがとうございます。</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-700 mb-1">作品名（任意）</label>
                        <input
                          type="text"
                          className="w-full border border-zinc-300 p-2 bg-zinc-50 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white rounded"
                          placeholder="作品名"
                          value={patternTitle}
                          onChange={(e) => setPatternTitle(e.target.value)}
                          disabled={isPublishing}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-700 mb-1">Instagram/Xのアカウント名（任意）</label>
                        <input
                          type="text"
                          className="w-full border border-zinc-300 p-2 bg-zinc-50 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white rounded"
                          placeholder="例: @shirone_ga"
                          value={galleryAuthor}
                          onChange={(e) => setGalleryAuthor(e.target.value)}
                          disabled={isPublishing}
                        />
                      </div>
                      <label className="flex items-start gap-2 cursor-pointer select-none mt-2">
                        <input 
                          type="checkbox" 
                          checked={publishToGallery} 
                          onChange={(e) => setPublishToGallery(e.target.checked)} 
                          className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer shrink-0" 
                          disabled={isPublishing}
                        />
                        <span className="text-[9.5px] text-zinc-600 leading-tight">
                          ギャラリーへの掲載と、ゴフクヤサン公式SNSでの紹介（リポスト・投稿）に同意する
                        </span>
                      </label>
                      <button 
                        type="button" 
                        onClick={handlePublishToGallery}
                        disabled={!publishToGallery || isPublishing}
                        className={`w-full py-2.5 text-[11px] font-bold transition-all rounded shadow-sm flex items-center justify-center gap-1.5 ${
                          !publishToGallery 
                            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            : 'bg-zinc-900 hover:bg-black text-white border border-zinc-950 active:scale-[0.99]'
                        }`}
                      >
                        {isPublishing ? '保存しています...' : 'ギャラリーに公開して保存する'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <button 
                  type="button" 
                  onClick={handleDownloadOriginal} 
                  className="w-full py-3 text-center border border-zinc-300 bg-white hover:border-zinc-950 hover:bg-zinc-100 text-zinc-800 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-xs rounded"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  この作品の原画データ（40cm角）を手元に残す
                </button>
                <p className="text-[9.5px] text-zinc-500 text-center leading-normal mt-1">
                   気に入った柄は保存しておけば、あとからいつでも注文できます。
                </p>
              </div>

              {/* SNSシェア */}
              <div className="pt-2 pb-1 border-t border-zinc-200">
                <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-1.5 text-center">この作品をSNSでお披露目する</p>
                
                <div className="grid grid-cols-5 gap-1.5">
                  <button type="button" onClick={shareToX} className="flex flex-col items-center justify-center py-2 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-xs group" title="Xでポスト">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-[8.5px] font-bold mt-1 tracking-tighter">X</span>
                  </button>

                  <button type="button" onClick={shareToThreads} className="flex flex-col items-center justify-center py-2 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-xs group" title="Threadsでポスト">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.72 0 12.186 5.094 12.186 11.814 0 2.253-.615 4.417-1.78 6.257l-1.92-1.22c.905-1.43 1.38-3.11 1.38-4.863 0-5.467-4.44-9.5-9.866-9.5-5.426 0-9.866 4.44-9.866 9.866 0 5.427 4.44 9.867 9.866 9.867 3.52 0 6.64-1.854 8.36-4.96l1.986 1.1c-2.226 4.013-6.24 6.406-10.74 6.406z"/>
                      <path d="M12.186 17.5c-3.14 0-5.694-2.553-5.694-5.693 0-3.14 2.554-5.694 5.694-5.694 3.14 0 5.693 2.554 5.693 5.694 0 .693-.56 1.253-1.253 1.253-.694 0-1.254-.56-1.254-1.253 0-1.76-1.433-3.194-3.193-3.194-1.76 0-3.194 1.434-3.194 3.194 0 1.76 1.434 3.193 3.194 3.194 1.053 0 1.986-.52 2.56-1.306.493.533 1.2 1.306 2.066 1.306 1.96 0 3.547-1.587 3.547-3.547 0-4.32-3.507-7.827-7.827-7.827-4.32 0-7.827 3.507-7.827 7.827 0 4.32 3.507 7.827 7.827 7.827 2.373 0 4.547-1.067 6.013-2.773l1.84 1.333C20.693 20.307 17.973 21.667 15 21.667c-.933 0-1.88-.134-2.814-.414z"/>
                    </svg>
                    <span className="text-[8.5px] font-bold mt-1 tracking-tighter">Threads</span>
                  </button>

                  <button type="button" onClick={shareToInstagram} className="flex flex-col items-center justify-center py-2 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-xs group" title="Instagram用テキストをコピーして開く">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className="text-[8.5px] font-bold mt-1 tracking-tighter">Instagram</span>
                  </button>

                  <button type="button" onClick={shareToPinterest} className="flex flex-col items-center justify-center py-2 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-xs group" title="Pinterestにピン留め">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.987C24.02 5.367 18.644 0 12.017 0z"/>
                    </svg>
                    <span className="text-[8.5px] font-bold mt-1 tracking-tighter">Pinterest</span>
                  </button>

                  <button type="button" onClick={shareToFacebook} className="flex flex-col items-center justify-center py-2 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-xs group" title="Facebookでシェア">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-[8.5px] font-bold mt-1 tracking-tighter">Facebook</span>
                  </button>
                </div>
              </div>

              {/* 妄想を現実に */}
              <div>
                <a 
                  href="#" 
                  onClick={handleOrderClick} 
                  className="block w-full py-3.5 mt-2 text-center bg-[#8b1e2a] hover:bg-[#721822] text-white text-[14px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] rounded border border-red-900"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-300">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span>
                      {itemType === 'scarf' 
                        ? '妄想を現実に（100cm大判ウールスカーフにお仕立て） ＞' 
                        : '妄想を現実に（本物の帯・着物にお仕立て） ＞'}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium tracking-wider text-amber-200 mt-0.5 block">
                    {itemType === 'scarf'
                      ? '（半幅帯と同価格 17,000円前後 / 実質0円対象）'
                      : '（生地・サイズ・仕立て価格をカートで確認する / 実質0円対象）'}
                  </span>
                </a>
                <p className="text-[9.5px] text-zinc-500 text-center leading-relaxed mt-1">
                  ※チケット代（1,100円）は商品購入時に全額ポイント還元（実質0円）されます<br />
                  ※保存した画像から後日いつでもご注文可能です
                </p>
              </div>

              {primaryMotif && (
                <div className="mt-4 p-3.5 bg-zinc-100 border border-zinc-200 shadow-inner rounded text-center animate-fade-in">
                  <p className="text-[10.5px] font-bold text-zinc-700 mb-1 leading-relaxed">
                    <span className="text-[9px] text-zinc-500 block mb-0.5">【 寄り道のご案内 】</span>
                    お客様、もしかして『<span className="text-zinc-950 font-black text-xs">{primaryMotif}</span>』に<br/>目がありませんね？
                  </p>
                  <p className="text-[8.5px] text-zinc-500 mb-3 leading-relaxed px-2">
                    妄想図案もいいですが……実はゴフクヤサンにも、<br/>自慢の『{primaryMotif}』アイテムがたくさんスタンバイしています。
                  </p>
                  <a 
                    href={makeshopSearchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block w-full py-2.5 bg-white border border-zinc-300 text-zinc-800 text-[9.5px] font-bold tracking-widest hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-colors shadow-xs rounded"
                  >
                    ゴフクヤサンの「{primaryMotif}」コレクションを覗く（無料） →
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
