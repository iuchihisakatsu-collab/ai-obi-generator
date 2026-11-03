// app/components/controls/ControlPanel.tsx
'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: (mode: 'ai' | 'geometric') => void;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  setItemType: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  
  // aiStyle は廃止しましたが、親との互換性のため一旦残して無視します
  aiStyle: string;
  setAiStyle: (val: string) => void;
  
  selectedArtist: string;
  setSelectedArtist: (artist: string) => void;
  motif: string;
  setMotif: (val: string) => void;
  motif2: string;
  setMotif2: (val: string) => void;
  
  // ★ 新しいタグState
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  setImageUrl: (url: string) => void;
  setBlobUrl: (url: string) => void;
  
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
}

const LOADING_STEPS = [
  '思い描いた意匠から、図案のアイデアを練り上げています...',
  '色や柄の調和を組み合わせ、反物のイメージを整えています...',
  '柄のつなぎ目は仕立て時にスタッフが整えますので、自由な妄想をお楽しみください...',
  '今回の図案イメージを準備しています...',
  'もう少しで、図案帖に仕上がります...',
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
　　colors: ['翡翠'], // 透き通る綺麗なメロンソーダグリーン
    image: '/sample_cafe.png'
  },
  {
    id: 'antique',
    title: '英国・秘密の花園',
    motif: '白うさぎ、ブラックベリー、時計、鍵',
    tags: ['アンティーク', '木版画'],
    colors: ['銀鼠', '葡萄色'],
    image: '/sample_antique.png'
  },
  {
    id: 'hokusai_cat',
    title: '波間に遊ぶ黒白猫',
    motif: '黒白の猫、濃淡の青い波、白い泡の点描',
    tags: ['浮世絵風', '和モダン', '木版画', '猫', '波・雲'],
    colors: ['鳥の子色', '瑠璃色'],
    image: '/sample_hokusai_cat.png'
  }
];

const TAG_CATEGORIES = [
  {
    category: '🎨 雰囲気・様式',
    tags: ['大正ロマン', '昭和レトロ', 'アール・ヌーヴォー', '北欧風', 'アンティーク', 'ゴシック', '浮世絵風', '和モダン']
  },
  {
    category: '🖌️ タッチ・画材',
    tags: ['水彩画', '木版画', 'ステンドグラス', 'ペン画', '油絵', '切り絵']
  },
  {
    category: '🌸 人気モチーフ',
    tags: ['猫', '兎', '鳥', '椿', '薔薇', '百合', '鍵盤', '幾何学', '波・雲']
  },
  {
    category: '🌈 配色・トーン',
    tags: ['くすみカラー', 'パステル', 'ビビッド', 'セピア', 'モノトーン', '黄金色']
  }
];

export default function ControlPanel({
  creationMode, setCreationMode,
  itemType, setItemType,
  selectedArtist, setSelectedArtist,
  motif, setMotif, motif2, setMotif2,
  
  selectedTags, setSelectedTags,
  setImageUrl, setBlobUrl,
  
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
}: ControlPanelProps) {

  const [analyzingPhoto, setAnalyzingPhoto] = useState(false);

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
    if (itemType === 'kimono') {
      if (density !== '四方柄（天地無用・40cm最適化）') setDensity('四方柄（天地無用・40cm最適化）');
    } else if (itemType === 'hanhaba') {
      if (density !== '一方向リピート（上向き総柄・18cm最適化）') setDensity('一方向リピート（上向き総柄・18cm最適化）');
    } else if (itemType === 'kyobukuro') {
      const validOptions = ['総柄（小紋タイプ・34cm最適化）', 'お太鼓柄（ワンポイント主役パネル）', 'スカーフ柄（額縁スクエアパネル）'];
      if (!validOptions.includes(density)) setDensity('総柄（小紋タイプ・34cm最適化）');
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

  const primaryMotif = motif.trim() ? motif.split(/[、\s ]+/)[0] : '';
  const makeshopSearchUrl = primaryMotif ? `https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(primaryMotif)}` : 'https://store.gofukuyasan.com/';

  const effectiveRemainingOpenAI = remainingOpenAI ?? remainingCount ?? 1;
  const effectiveRemainingFlux = remainingFlux ?? 15;

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10 relative">
      
      <div className="space-y-6">
        {creationMode === 'ai' ? (
          <>
            {/* ★ 01. ひらめき妄想レシピ（作例カード） */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                  01. ひらめき妄想レシピ（作例から選ぶ）
                </label>
                <span className="text-[9px] text-zinc-500 font-medium">タップでプロンプトをセット</span>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-zinc-300">
                {RECIPES.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => handleRecipeSelect(recipe)}
                    className="flex-shrink-0 w-32 h-32 relative rounded-sm border border-zinc-200 overflow-hidden hover:ring-2 hover:ring-zinc-900 transition-all group shadow-sm bg-zinc-100"
                  >
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-2.5">
                      <span className="text-white text-[11px] font-bold leading-tight text-left drop-shadow-md">{recipe.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 02. テーマカラー */}
            <div className="pt-4 border-t border-zinc-100 relative">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                    02. 好きな色（着物のテーマカラー）
                  </label>
                  <p className="text-[10px] text-zinc-400 mt-0.5">選んだ色が地色や柄色として優先的に反映されます</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowColorPalette(!showColorPalette)} 
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
                >
                  <span>{showColorPalette ? '閉じる' : '色見本から選ぶ (102色)'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                {selectedColors.length === 0 ? ( 
                  <span className="text-xs text-zinc-400 italic">指定なし（ゴフクヤサンにおまかせ）</span> 
                ) : (
                  <>
                    {selectedColors.map((col) => (
                      <span 
                        key={col.name} 
                        onClick={() => handleColorToggle(col)} 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border cursor-pointer shadow-sm relative z-10" 
                        style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}
                      >
                        {col.name.split(' ')[0]}<span className="text-[9px] opacity-70 ml-1">×</span>
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
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => {
                      const isSelected = selectedColors.some((c) => c.name === col.name);
                      return (
                        <button 
                          key={col.name} 
                          type="button" 
                          onClick={() => handleColorToggle(col)} 
                          className={`relative min-h-[44px] p-1.5 flex flex-col justify-end text-left transition-all ${isSelected ? 'ring-2 ring-zinc-950 scale-95 font-black' : 'border border-zinc-200/50 shadow-sm hover:scale-[1.02]'}`} 
                          style={{ backgroundColor: col.hex }}
                        >
                          <span className={`text-[9px] font-bold truncate leading-tight flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {col.name.split(' ')[0]}
                            {isSelected && <span>選択中</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 03. モチーフ入力 */}
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                  03. 何を描く？（モチーフ）
                </label>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded text-[11px] font-bold shadow-sm transition-all active:scale-95">
                  <span>✨</span>
                  <span>{analyzingPhoto ? '写真の色・柄をAI解析中...' : '📷 写真から自動入力'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUploadAndExtract} disabled={analyzingPhoto || loading} className="hidden" />
                </label>
              </div>

              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-zinc-400">
                  好きな単語を入れるか、上の「作例レシピ」や写真から言葉をセットできます。
                </p>
                {motif && (
                  <button onClick={() => setMotif('')} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 tracking-widest uppercase transition-colors shrink-0 ml-2">Clear</button>
                )}
              </div>
              
              <textarea 
                className="w-full border border-zinc-300 p-3 sm:p-4 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium shadow-sm" 
                placeholder="例：黒猫、ホットケーキ、月、バイオリン" 
                rows={2} value={motif} onChange={(e) => setMotif(e.target.value)} disabled={loading || analyzingPhoto} 
              />
            </div>

            {/* ★ 04. 統合された4カテゴリの入力アシストタグ群 */}
            <div className="pt-4 border-t border-zinc-100">
              <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-3">
                04. 雰囲気・画材をトッピング（複数選択OK）
              </label>
              
              <div className="space-y-4">
                {TAG_CATEGORIES.map(category => (
                  <div key={category.category} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
                    <span className="text-[10px] font-black text-zinc-500 w-24 shrink-0 pt-1">{category.category}</span>
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
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-sm transition-all shadow-sm ${
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

            {/* 05. 柄の配置 */}
            <div className="pt-4 border-t border-zinc-200 mt-2">
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                  05. 柄の配置
                </label>
                <span className="text-[10px] font-bold text-zinc-500">
                  {itemType === 'kimono' && '着物：40cm幅に最適化'}
                  {itemType === 'hanhaba' && '半幅帯：18cm幅に最適化'}
                  {itemType === 'kyobukuro' && '京袋帯：34cm幅に最適化'}
                </span>
              </div>

              {itemType === 'kimono' && (
                <div className="flex flex-col gap-1.5">
                  <div className="py-2.5 px-3 bg-zinc-900 text-white text-[11px] font-bold tracking-wider rounded-sm shadow border border-zinc-900 flex items-center justify-between">
                    <span>四方柄（天地無用・ランダム回転）</span>
                    <span className="text-[9px] bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-200">自動固定</span>
                  </div>
                </div>
              )}

              {itemType === 'hanhaba' && (
                <div className="flex flex-col gap-1.5">
                  <div className="py-2.5 px-3 bg-zinc-900 text-white text-[11px] font-bold tracking-wider rounded-sm shadow border border-zinc-900 flex items-center justify-between">
                    <span>一方向リピート（上向き総柄）</span>
                    <span className="text-[9px] bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-200">自動固定</span>
                  </div>
                </div>
              )}

              {itemType === 'kyobukuro' && (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: '総柄（小紋タイプ・34cm最適化）', label: '総柄', sub: '連続小紋' },
                      { id: 'お太鼓柄（ワンポイント主役パネル）', label: 'お太鼓柄', sub: '中央主役' },
                      { id: 'スカーフ柄（額縁スクエアパネル）', label: 'スカーフ柄', sub: 'Carré額縁' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDensity(item.id)}
                        className={`py-2 px-2 text-center border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center ${
                          density === item.id 
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900' 
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-[11px] font-black">{item.label}</span>
                        <span className="text-[8px] opacity-75 mt-0.5">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ================= 幾何学モード（格子・水玉製作所） ================= */
          <div className="space-y-6 animate-fade-in">
             <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">柄の種類</label>
                <select 
                  value={geoPatternType} 
                  onChange={(e) => setGeoPatternType(e.target.value as any)} 
                  className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10 font-bold"
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
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">縞の向き</label>
                  <select 
                    value={stripeDir} 
                    onChange={(e) => setStripeDir(e.target.value as 'vertical' | 'horizontal' | 'diagonal')} 
                    className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10"
                  >
                    <option value="vertical">縦縞（滝縞）</option>
                    <option value="horizontal">横縞（ボーダー）</option>
                    <option value="diagonal">斜め（右上がり）</option>
                  </select>
                </div>
              )}
              {geoPatternType === 'dot' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">配置</label>
                  <select 
                    value={dotLayout} 
                    onChange={(e) => setDotLayout(e.target.value as 'staggered' | 'grid')} 
                    className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10"
                  >
                    <option value="staggered">千鳥（互い違い）</option>
                    <option value="grid">正方格子</option>
                  </select>
                </div>
              )}
            </div>

            {geoPatternType !== 'plain' && (
              <div className="space-y-5 pt-4 border-t border-zinc-100 relative z-10">
                <label className="block text-xs font-bold text-zinc-900 mb-2">サイズ調整（mm実寸連動）</label>
                
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

            <div className="pt-4 border-t border-zinc-100 space-y-3 relative">
              <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">{geoPatternType === 'plain' ? '無地の色' : '地色'}</label>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoBgColor }} />
                    <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>伝統色</button>
                  </div>
                </div>
                {geoPatternType !== 'plain' && (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">柄色</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoPatternColor }} />
                      <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>伝統色</button>
                    </div>
                  </div>
                )}
              </div>

              {showGeoPaletteFor && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] text-zinc-500 font-bold">{showGeoPaletteFor === 'bg' ? (geoPatternType === 'plain' ? '無地の色' : '地色') : '柄色'}を選択：</p>
                    <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[10px] text-zinc-400 font-bold">閉じる</button>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {TRADITIONAL_COLORS.map((col) => (
                        <button key={col.name} type="button" onClick={() => { if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex); if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex); setShowGeoPaletteFor(null); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                          <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 06. 作品名 */}
        <div className="pt-4 border-t border-zinc-200">
          <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-1">
            作品名 <span className="font-normal text-[10px] text-zinc-400">（お好みの名前に変更できます）</span>
          </label>
          <input
            type="text"
            className="w-full border border-zinc-300 p-2.5 bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:bg-white shadow-sm font-bold"
            placeholder="作品名"
            value={patternTitle}
            onChange={(e) => setPatternTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 3つの生成ボタン */}
        <div className="space-y-4 mt-6">
          {creationMode === 'ai' && (
            <div className="pt-6 border-t border-zinc-200 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none mb-2 group relative z-10">
                <input 
                  type="checkbox" 
                  checked={agreed} 
                  onChange={(e) => setAgreed(e.target.checked)} 
                  className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer" 
                />
                <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800 transition-colors">
                  生成図案は意匠のアイデアです。実際の生地制作時はスタッフが目視で柄のつなぎ目（送り）をきれいに調整することに同意します。
                </span>
              </label>
              
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">
                  {errorMsg}
                </div>
              )}

              {/* ボタン①：スケッチモード */}
              <div>
                <button 
                  type="button" 
                  onClick={() => handleGenerate('flux')} 
                  disabled={loading || effectiveRemainingFlux <= 0} 
                  className={`w-full py-3.5 px-4 font-bold text-xs sm:text-sm tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm rounded-sm relative z-10 ${
                    effectiveRemainingFlux <= 0
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50'
                  }`}
                >
                  {loading && (generatingMode === 'flux' || loadingEngine === 'flux') ? (
                    <span>スケッチを作成中...</span>
                  ) : (
                    <span>
                      {effectiveRemainingFlux <= 0
                        ? '本日のスケッチ枠は終了しました'
                        : `スケッチモードで試す (本日残り ${effectiveRemainingFlux}回)`}
                    </span>
                  )}
                </button>
              </div>

              {/* ボタン②：丁寧に作るモード（無料枠） */}
              <div>
                <button 
                  type="button" 
                  onClick={() => handleGenerate('openai_free')} 
                  disabled={loading || effectiveRemainingOpenAI <= 0} 
                  className={`w-full py-3.5 px-4 font-bold text-xs sm:text-sm tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm rounded-sm relative z-10 ${
                    effectiveRemainingOpenAI <= 0 
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' 
                      : 'bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50'
                  }`}
                >
                  {loading && (generatingMode === 'openai_free' || (loadingEngine === 'openai' && !premiumCode)) ? (
                    <span>丁寧に作成中...</span>
                  ) : (
                    <span>
                      {effectiveRemainingOpenAI <= 0 
                        ? '本日の無料枠は終了しました' 
                        : '丁寧に作るモードで試す (本日無料 1回)'}
                    </span>
                  )}
                </button>
              </div>

              {/* ボタン③：チケットコードで丁寧に作る */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-sm space-y-2.5 relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-zinc-800">
                      チケットコード利用
                    </span>
                    {ticketRemaining !== null && ticketRemaining !== undefined && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-100 text-green-800 rounded">
                        残数: {ticketRemaining}回
                      </span>
                    )}
                  </div>
                  <a
                    href="https://store.gofukuyasan.com/view/item/000000007311"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-zinc-600 underline hover:text-zinc-900"
                  >
                    チケットを購入する
                  </a>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={premiumCode}
                    onChange={(e) => setPremiumCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        if (!loading && premiumCode.trim()) {
                          handleGenerate('openai_premium');
                        }
                      }
                    }}
                    placeholder="例：GFK-XXXX-XXXX"
                    className="flex-1 border border-zinc-300 p-2 text-xs bg-white font-mono rounded-sm focus:border-zinc-900 focus:outline-none"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerate('openai_premium')}
                    disabled={loading || !premiumCode.trim()}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-bold rounded-sm shadow transition-colors whitespace-nowrap min-w-[170px] text-center"
                  >
                    {loading && (generatingMode === 'openai_premium' || (loadingEngine === 'openai' && premiumCode))
                      ? '高精度生成中...'
                      : 'チケットコードで丁寧に作る'}
                  </button>
                </div>

                {premiumStatusMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center gap-2.5 animate-fade-in shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-black">
                      ✓
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-black text-emerald-900 leading-snug">
                        {premiumStatusMsg}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {loading && (
                <div className="p-4 bg-zinc-50 border border-zinc-300 rounded-sm shadow-sm flex items-start gap-3.5 animate-fade-in my-3">
                  <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs sm:text-sm font-bold text-zinc-900 leading-relaxed">
                      {LOADING_STEPS[loadingStep % LOADING_STEPS.length]}
                    </p>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      AIが図案の調合を行っています。画面を閉じず、そのまま少々お待ちください。
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 生成完了後の作品表示エリア */}
        {imageUrl && !imageUrl.includes('sample_piano_cat') && !imageUrl.includes('sample_cafe') && !imageUrl.includes('sample_antique') && !imageUrl.includes('sample_hokusai_cat') && (
          <div className="pt-8 mt-8 border-t-2 border-zinc-950 space-y-6 relative z-10 animate-fade-in bg-zinc-50 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 pb-8">
            <h3 className="text-center font-bold text-sm tracking-widest text-zinc-800 pt-6">あなただけの作品が完成しました</h3>

            <div className="space-y-3 pt-2">
              <button 
                type="button" 
                onClick={handleDownloadOriginal} 
                className="w-full py-3 text-center border border-zinc-300 bg-white hover:border-zinc-950 hover:bg-zinc-100 text-zinc-800 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                この作品の画像データを手元に残す
              </button>

              <div className="pt-3 pb-1 border-t border-zinc-200">
                <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-2 text-center">この作品をSNSでお披露目する</p>
                
                <div className="grid grid-cols-5 gap-1.5">
                  <button type="button" onClick={shareToX} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Xでポスト">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">X</span>
                  </button>

                  <button type="button" onClick={shareToThreads} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Threadsでポスト">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.72 0 12.186 5.094 12.186 11.814 0 2.253-.615 4.417-1.78 6.257l-1.92-1.22c.905-1.43 1.38-3.11 1.38-4.863 0-5.467-4.44-9.5-9.866-9.5-5.426 0-9.866 4.44-9.866 9.866 0 5.427 4.44 9.867 9.866 9.867 3.52 0 6.64-1.854 8.36-4.96l1.986 1.1c-2.226 4.013-6.24 6.406-10.74 6.406z"/>
                      <path d="M12.186 17.5c-3.14 0-5.694-2.553-5.694-5.693 0-3.14 2.554-5.694 5.694-5.694 3.14 0 5.693 2.554 5.693 5.694 0 .693-.56 1.253-1.253 1.253-.694 0-1.254-.56-1.254-1.253 0-1.76-1.433-3.194-3.193-3.194-1.76 0-3.194 1.434-3.194 3.194 0 1.76 1.434 3.193 3.194 3.194 1.053 0 1.986-.52 2.56-1.306.493.533 1.2 1.306 2.066 1.306 1.96 0 3.547-1.587 3.547-3.547 0-4.32-3.507-7.827-7.827-7.827-4.32 0-7.827 3.507-7.827 7.827 0 4.32 3.507 7.827 7.827 7.827 2.373 0 4.547-1.067 6.013-2.773l1.84 1.333C20.693 20.307 17.973 21.667 15 21.667c-.933 0-1.88-.134-2.814-.414z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Threads</span>
                  </button>

                  <button type="button" onClick={shareToInstagram} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Instagram用テキストをコピーして開く">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Instagram</span>
                  </button>

                  <button type="button" onClick={shareToPinterest} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Pinterestにピン留め">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.987C24.02 5.367 18.644 0 12.017 0z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Pinterest</span>
                  </button>

                  <button type="button" onClick={shareToFacebook} className="flex flex-col items-center justify-center py-2.5 px-1 bg-white border border-zinc-300 rounded hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Facebookでシェア">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-[9px] font-bold mt-1 tracking-tighter">Facebook</span>
                  </button>
                </div>
              </div>

              <a 
                href="#" 
                onClick={handleOrderClick} 
                className="block w-full py-4 mt-2 text-center bg-zinc-950 text-white text-[15px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] border-2 border-zinc-950 rounded-sm"
              >
                妄想を現実に<br/><span className="text-[10px] font-medium tracking-wider opacity-90 mt-1 block">（この作品を現実の着物・帯として仕立てる）</span>
              </a>

              {primaryMotif && (
                <div className="mt-6 p-4 bg-zinc-100 border border-zinc-200 shadow-inner rounded-sm text-center animate-fade-in">
                  <p className="text-[11px] font-bold text-zinc-700 mb-2 leading-relaxed">
                    <span className="text-[9px] text-zinc-500 block mb-1">【 寄り道のご案内 】</span>
                    お客様、もしかして『<span className="text-zinc-950 font-black text-sm">{primaryMotif}</span>』に<br/>目がありませんね？
                  </p>
                  <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed px-2">
                    妄想図案もいいですが……実はゴフクヤサンにも、<br/>自慢の『{primaryMotif}』アイテムがたくさんスタンバイしています。
                  </p>
                  <a 
                    href={makeshopSearchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block w-full py-3 bg-white border border-zinc-300 text-zinc-800 text-[10px] font-bold tracking-widest hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-colors shadow-sm rounded-sm"
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
