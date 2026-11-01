// components/controls/ControlPanel.tsx
'use client';

import { useState, useEffect, MouseEvent } from 'react';
import { TRADITIONAL_COLORS, CategoryItem, LOADING_STEPS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode?: 'ai' | 'geometric';
  setCreationMode?: (mode: 'ai' | 'geometric') => void;
  itemType?: 'hanhaba' | 'kyobukuro' | 'kimono';
  setItemType?: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  aiStyle?: string;
  setAiStyle?: (val: string) => void;
  selectedArtist?: string;
  setSelectedArtist?: (val: string) => void;
  motif?: string;
  setMotif?: (val: string) => void;
  motif2?: string;
  setMotif2?: (val: string) => void;
  handleTagClick?: (item: CategoryItem) => void;
  selectedColors?: typeof TRADITIONAL_COLORS;
  setSelectedColors?: any;
  handleColorToggle?: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette?: boolean;
  setShowColorPalette?: (val: boolean) => void;
  density?: string;
  setDensity?: (val: string) => void;
  geoPatternType?: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType?: (val: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir?: 'vertical' | 'horizontal' | 'diagonal';
  setStripeDir?: (val: 'vertical' | 'horizontal' | 'diagonal') => void;
  dotLayout?: 'staggered' | 'grid';
  setDotLayout?: (val: 'staggered' | 'grid') => void;
  dotRadius?: number;
  setDotRadius?: (val: number) => void;
  gapWidth?: number;
  setGapWidth?: (val: number) => void;
  lineWidth?: number;
  setLineWidth?: (val: number) => void;
  geoBgColor?: string;
  setGeoBgColor?: (val: string) => void;
  geoPatternColor?: string;
  setGeoPatternColor?: (val: string) => void;
  showGeoPaletteFor?: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor?: (val: 'bg' | 'pattern' | null) => void;
  obiLiningColor?: string;
  setObiLiningColor?: (val: string) => void;
  kimonoHaneriColor?: string;
  setKimonoHaneriColor?: (val: string) => void;
  kimonoObiageColor?: string;
  setKimonoObiageColor?: (val: string) => void;
  kimonoObiColor?: string;
  setKimonoObiColor?: (val: string) => void;
  customObiUrl?: string | null;
  setCustomObiUrl?: (url: string | null) => void;
  handleCustomObiUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  agreed?: boolean;
  setAgreed?: (val: boolean) => void;
  errorMsg?: string;
  loading?: boolean;
  loadingEngine?: 'flux' | 'openai' | null;
  remainingCount?: number;
  loadingStep?: number;
  handleGenerate?: () => void;
  imageUrl?: string;
  patternTitle?: string;
  setPatternTitle?: (val: string) => void;
  serialNumber?: string;
  handleDownloadOriginal?: () => void;
  handleOrderClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  selectedEngine?: 'flux' | 'openai_free' | 'openai_premium';
  setSelectedEngine?: (engine: 'flux' | 'openai_free' | 'openai_premium') => void;
  premiumCode?: string;
  setPremiumCode?: (code: string) => void;
  premiumStatusMsg?: string;
  [key: string]: any;
}

const AI_STYLES = [
  { id: 'mingei', label: '民藝と型染め', sub: '芹沢銈介風・素朴' },
  { id: 'retro', label: '大正ロマン', sub: '竹久夢二・銘仙' },
  { id: 'kissaten', label: '純喫茶レトロ', sub: '昭和ノスタルジー' },
  { id: 'nordic', label: '北欧モダン', sub: 'ミニマル・大柄' },
  { id: 'morris', label: '英国ボタニカル', sub: 'モリス調・草花' },
  { id: 'sarasa', label: 'エキゾチック更紗', sub: 'バティック・唐草' },
  { id: 'classic', label: '騙し絵クラシック', sub: '金襴・西陣織風' },
  { id: 'mode', label: 'モード＆ストリート', sub: 'モノトーン・エッジ' },
  { id: 'yuzen', label: 'はんなり友禅', sub: '上品・水彩ぼかし' },
  { id: 'etching', label: 'アンティーク銅版画', sub: '幻想・ペン画' },
  { id: 'silhouette', label: '切り絵影絵', sub: 'コントラスト' },
  { id: 'artdeco', label: 'アール・デコ', sub: '1920s幾何学装飾' },
];

const PULLDOWN_MOTIFS = [
  {
    group: '生き物・動物',
    items: ['犬', 'うさぎ', '小鳥', '金魚', '蝶', '虎', 'ペンギン', '恐竜']
  },
  {
    group: '花・植物・果実',
    items: ['椿', '桜', '紫陽花', 'キノコ', '林檎', '紅葉・イチョウ', '唐草']
  },
  {
    group: '趣味・嗜好品',
    items: ['ビール・洋酒', '本・古書・万年筆', '楽器・音楽', 'レコード', 'カメラ', '和菓子']
  },
  {
    group: '自然・天体・道具',
    items: ['鉱物・水晶', '波・雲', '自転車', '気球', 'アンティーク時計', 'リボン・レース']
  }
];

export default function ControlPanel({
  creationMode = 'geometric',
  setCreationMode = () => {},
  aiStyle = 'mingei',
  setAiStyle = () => {},
  motif = '',
  setMotif = () => {},
  selectedColors = [],
  setSelectedColors = () => {},
  handleColorToggle = () => {},
  showColorPalette = false,
  setShowColorPalette = () => {},
  density = '四方柄（上下なし）',
  setDensity = () => {},
  geoPatternType = 'plain',
  setGeoPatternType = () => {},
  stripeDir = 'vertical',
  setStripeDir = () => {},
  dotLayout = 'staggered',
  setDotLayout = () => {},
  dotRadius = 5,
  setDotRadius = () => {},
  gapWidth = 10,
  setGapWidth = () => {},
  lineWidth = 5,
  setLineWidth = () => {},
  geoBgColor = '#fffffc',
  setGeoBgColor = () => {},
  geoPatternColor = '#161616',
  setGeoPatternColor = () => {},
  showGeoPaletteFor = null,
  setShowGeoPaletteFor = () => {},
  agreed = true,
  setAgreed = () => {},
  errorMsg = '',
  loading = false,
  loadingEngine = null,
  remainingCount = 20,
  loadingStep = 0,
  handleGenerate = () => {},
  imageUrl = '',
  patternTitle = '',
  setPatternTitle = () => {},
  handleDownloadOriginal = () => {},
  handleOrderClick = () => {},
  selectedEngine = 'flux',
  setSelectedEngine = () => {},
  premiumCode = '',
  setPremiumCode = () => {},
  premiumStatusMsg = ''
}: ControlPanelProps) {

  // 改良中お知らせモーダルの開閉ステート（案B）
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(true);

  // 文字入力が空文字でリセットされないためのローカル保持ステート
  const [localCode, setLocalCode] = useState<string>(premiumCode || '');

  // 親の premiumCode がリセット等で変わった場合にローカルも同期
  useEffect(() => {
    if (premiumCode !== undefined && premiumCode !== localCode) {
      setLocalCode(premiumCode);
    }
  }, [premiumCode]);

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
  const makeshopSearchUrl = primaryMotif 
    ? `https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(primaryMotif)}` 
    : 'https://store.gofukuyasan.com/';

  const handleQuickAdd = (word: string) => {
    if (!motif.includes(word)) {
      setMotif(motif ? `${motif}、${word}` : word);
    }
  };

  const switchToGeometric = () => {
    setCreationMode('geometric');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // シリアルコード入力ハンドラー
  const handleCodeChange = (val: string) => {
    setLocalCode(val);
    setPremiumCode?.(val);
  };

  // 生成実行ハンドラー（親の handleGenerate を確実にトリガー）
  const onTriggerGenerate = () => {
    if (loading) return;
    if (selectedEngine === 'openai_premium') {
      const code = localCode.trim();
      if (!code) {
        alert('プレミアムチケットのシリアルコードを入力してください。');
        return;
      }
      setPremiumCode?.(code);
    }
    handleGenerate?.();
  };

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10 relative">
      <div className="flex bg-zinc-50 border border-zinc-200 p-1 mb-6 shadow-sm">
        <button type="button" onClick={() => setCreationMode('geometric')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
          格子・水玉製作所
        </button>
        <button type="button" onClick={() => setCreationMode('ai')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
          妄想意匠モード
        </button>
      </div>

      <div className="space-y-6">
        {creationMode === 'ai' ? (
          <>
            <div>
              <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-2">01. どんな世界観で？（12の意匠様式）</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                {AI_STYLES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setAiStyle(s.id)} className={`flex flex-col items-center justify-center p-2 sm:p-2.5 border transition-all shadow-sm ${aiStyle === s.id ? 'bg-zinc-900 text-white border-zinc-900 scale-95 ring-2 ring-zinc-900' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:scale-[1.01]'}`}>
                    <span className="text-[10px] sm:text-[11px] font-black leading-tight text-center">{s.label}</span>
                    <span className="text-[8px] sm:text-[9px] opacity-70 mt-0.5 leading-none text-center">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 relative">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 tracking-wider">02. 好きな色（着物のテーマカラー）</label>
                  <p className="text-[10px] text-zinc-400 mt-0.5">選んだ色が地色や柄色として優先的に反映されます</p>
                </div>
                <button type="button" onClick={() => setShowColorPalette(!showColorPalette)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
                  <span>{showColorPalette ? '閉じる' : '色見本から選ぶ (102色)'}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                {selectedColors.length === 0 ? ( 
                  <span className="text-xs text-zinc-400 italic">指定なし（ゴフクヤサンにおまかせ）</span> 
                ) : (
                  <>
                    {selectedColors.map((col) => (
                      <span key={col.name} onClick={() => handleColorToggle(col)} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border cursor-pointer shadow-sm relative z-10" style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}>
                        {col.name.split(' ')[0]}<span className="text-[9px] opacity-70 ml-1">×</span>
                      </span>
                    ))}
                    <button type="button" onClick={() => setSelectedColors([])} className="text-[10px] text-zinc-400 hover:text-zinc-700 underline ml-1 relative z-10">リセット</button>
                  </>
                )}
              </div>
              {showColorPalette && (
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                  <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => {
                      const isSelected = selectedColors.some((c) => c.name === col.name);
                      return (
                        <button key={col.name} type="button" onClick={() => handleColorToggle(col)} className={`relative min-h-[44px] p-1.5 flex flex-col justify-end text-left transition-all ${isSelected ? 'ring-2 ring-zinc-950 scale-95 font-black' : 'border border-zinc-200/50 shadow-sm hover:scale-[1.02]'}`} style={{ backgroundColor: col.hex }}>
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

            <div className="pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-baseline mb-1">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">03. 何を描く？（モチーフ）</label>
                {motif && <button onClick={() => setMotif('')} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 tracking-widest uppercase transition-colors">Clear</button>}
              </div>
              <p className="text-[10px] text-zinc-400 mb-2">難しい文章は不要です。好きな単語をポンと1つ入れるだけで、ゴフクヤサンが素敵な図案に仕立てます。</p>
              
              <textarea 
                className="w-full border border-zinc-300 p-3 sm:p-4 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium shadow-sm" 
                placeholder="例：黒猫、ホットケーキ、月、バイオリン（思いついた言葉をそのままどうぞ）" 
                rows={2} 
                value={motif} 
                onChange={(e) => setMotif(e.target.value)} 
                disabled={loading} 
              />

              {primaryMotif && (
                <div className="mt-1.5 flex justify-end">
                  <a 
                    href={makeshopSearchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-950 underline decoration-zinc-300 transition-colors"
                  >
                    <span>ゴフクヤサンの「{primaryMotif}」既製品コレクションを見る（無料）</span>
                    <span className="text-[9px]">→</span>
                  </a>
                </div>
              )}
              
              <div className="mt-2.5 pt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mr-1">入力アシスト:</span>
                {['ねこ', '珈琲', '薔薇', '月と星'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleQuickAdd(w)}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-200 text-zinc-700 text-[10px] font-bold rounded-sm transition-all shadow-2xs"
                  >
                    + {w}
                  </button>
                ))}

                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleQuickAdd(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-2 py-1 bg-white border border-zinc-300 text-zinc-600 text-[10px] font-bold rounded-sm focus:outline-none focus:border-zinc-900 cursor-pointer shadow-2xs"
                  defaultValue=""
                >
                  <option value="" disabled>その他のモチーフから選ぶ</option>
                  {PULLDOWN_MOTIFS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.items.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200">
              <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">04. 柄の配置</label>
              <div className="flex flex-col gap-1.5">
                {['四方柄（上下なし）', '飛び柄（余白あり）', 'お太鼓柄（ワンポイント/1枚絵）'].map((id) => (
                  <button key={id} type="button" onClick={() => setDensity(id)} className={`py-2 px-2.5 text-[11px] font-bold tracking-wider transition-all text-left border ${density === id ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-sm'} relative z-10`}>
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* ▼ 05. 図案の描き分け（親の selectedEngine と完全連動） ▼ */}
            <div className="pt-4 border-t border-zinc-200">
              <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-2">
                05. 図案の描き分け（生成エンジン）
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1. 軽快スケッチ (flux) */}
                <button
                  type="button"
                  onClick={() => setSelectedEngine?.('flux')}
                  className={`p-3 text-left border transition-all flex flex-col justify-between ${
                    selectedEngine === 'flux'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow ring-2 ring-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 font-black text-xs">
                      <span>⚡ 軽快スケッチ</span>
                    </div>
                    <p className={`text-[9px] mt-1 ${selectedEngine === 'flux' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      爆速スケッチ（約1〜2秒）
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${selectedEngine === 'flux' ? 'text-amber-300' : 'text-zinc-800'}`}>
                    無料枠残り {remainingCount} 回
                  </span>
                </button>

                {/* 2. 本番清書 (openai_free) */}
                <button
                  type="button"
                  onClick={() => setSelectedEngine?.('openai_free')}
                  className={`p-3 text-left border transition-all flex flex-col justify-between ${
                    selectedEngine === 'openai_free'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow ring-2 ring-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 font-black text-xs">
                      <span>✨ 本番清書</span>
                    </div>
                    <p className={`text-[9px] mt-1 ${selectedEngine === 'openai_free' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      高精細仕上げ（OpenAI）
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${selectedEngine === 'openai_free' ? 'text-amber-300' : 'text-zinc-800'}`}>
                    無料枠残り {remainingCount} 回
                  </span>
                </button>

                {/* 3. 極みの意匠 (openai_premium / チケット利用) */}
                <button
                  type="button"
                  onClick={() => setSelectedEngine?.('openai_premium')}
                  className={`p-3 text-left border transition-all flex flex-col justify-between ${
                    selectedEngine === 'openai_premium'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow ring-2 ring-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1 font-black text-xs">
                      <span className="text-amber-400">🎫</span>
                      <span>極みの意匠</span>
                    </div>
                    <p className={`text-[9px] mt-1 ${selectedEngine === 'openai_premium' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      モナリザ直結・最高解像度
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${selectedEngine === 'openai_premium' ? 'text-amber-300' : 'text-amber-600'}`}>
                    チケット利用
                  </span>
                </button>
              </div>

              {/* 極みの意匠（チケット）選択時のコード入力枠 */}
              {selectedEngine === 'openai_premium' && (
                <div className="mt-3 p-3.5 bg-zinc-50 border border-zinc-300 space-y-2 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-zinc-800">
                      シリアルコードを入力（Enterキーで即時生成）：
                    </label>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      チケット購入はこちら（実質0円 ※ポイント全額還元）
                    </span>
                  </div>

                  <input
                    type="text"
                    value={localCode}
                    onChange={(e) => handleCodeChange(e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        if (!loading) {
                          onTriggerGenerate();
                        }
                      }
                    }}
                    placeholder="例：GFK-XXXX-XXXX"
                    className="w-full border border-zinc-300 p-2.5 bg-white text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:border-zinc-900 shadow-sm"
                    disabled={loading}
                  />
                  <p className="text-[9px] text-zinc-400">
                    ※注文確認メールに記載のコード（GFK-…）を貼り付けてください。Enterキーでも描き出せます。
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">柄の種類</label>
                <select value={geoPatternType} onChange={(e) => setGeoPatternType(e.target.value as any)} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10 font-bold">
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
                  <select value={stripeDir} onChange={(e) => setStripeDir(e.target.value as any)} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10">
                    <option value="vertical">縦縞（滝縞）</option>
                    <option value="horizontal">横縞（ボーダー）</option>
                    <option value="diagonal">斜め（右上がり）</option>
                  </select>
                </div>
              )}
              {geoPatternType === 'dot' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">配置</label>
                  <select value={dotLayout} onChange={(e) => setDotLayout(e.target.value as any)} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10">
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

        {/* ▼ 生成実行ボタンエリア ▼ */}
        <div className="space-y-4 mt-6">
          {creationMode === 'ai' && (
            <div className="pt-6 border-t border-zinc-200 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none mb-2 group relative z-10">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed?.(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800 transition-colors">
                  生成図案は意匠アイデアであり、実際の生地制作時はゴフクヤサンの手でデータ調整が行われることに同意します。
                </span>
              </label>
              
              {/* エラーメッセージ */}
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">{errorMsg}</div>}
              
              {/* チケット消費完了メッセージ */}
              {premiumStatusMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-sm flex items-center gap-1.5 animate-fade-in">
                  <span>🎉</span>
                  <span>{premiumStatusMsg}</span>
                </div>
              )}

              {/* 親プログラムと直結した生成ボタン */}
              <button 
                type="button" 
                onClick={onTriggerGenerate} 
                disabled={
                  loading || 
                  (selectedEngine !== 'openai_premium' && remainingCount <= 0) ||
                  (selectedEngine === 'openai_premium' && !localCode.trim())
                } 
                className={`w-full py-4 px-4 font-black text-xs sm:text-sm tracking-widest transition-all duration-200 flex flex-col items-center justify-center gap-0.5 shadow-md relative z-10 ${
                  (selectedEngine !== 'openai_premium' && remainingCount <= 0) ||
                  (selectedEngine === 'openai_premium' && !localCode.trim())
                    ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' 
                    : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-lg disabled:opacity-50'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs">{LOADING_STEPS[loadingStep]}</span>
                    <span className="text-[8px] text-zinc-400 tracking-wider">
                      {loadingEngine === 'openai' ? 'HIGH-RES RENDERING (OPENAI)...' : 'FAST SKETCHING (FLUX)...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      {selectedEngine === 'flux' && <span className="text-amber-400">⚡</span>}
                      {selectedEngine === 'openai_free' && <span>✨</span>}
                      {selectedEngine === 'openai_premium' && <span className="text-amber-400">🎫</span>}
                      <span>
                        {selectedEngine === 'flux' && `軽快スケッチで描き出す (残り ${remainingCount} 回)`}
                        {selectedEngine === 'openai_free' && `本番清書で描き出す (残り ${remainingCount} 回)`}
                        {selectedEngine === 'openai_premium' && '極みの意匠を描き出す（チケット利用）'}
                      </span>
                    </div>
                    <span className="text-[9px] font-normal text-zinc-400 tracking-normal">
                      {selectedEngine === 'flux' && '約1〜2秒で何パターンもアイデア出し'}
                      {selectedEngine === 'openai_free' && 'モナリザ印刷用の最高精細仕上げ'}
                      {selectedEngine === 'openai_premium' && 'モナリザ直結・最高解像度レンダリング（Enterキーでも実行可）'}
                    </span>
                  </>
                )}
              </button>

              {/* 無料枠上限到達時の案内カード */}
              {selectedEngine !== 'openai_premium' && remainingCount <= 0 && (
                <div className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100 border-2 border-zinc-900 rounded-sm shadow-md animate-fade-in space-y-4">
                  <div className="text-center">
                    <span className="inline-block px-2.5 py-0.5 bg-zinc-900 text-white text-[9px] font-black tracking-widest rounded-full uppercase mb-2">
                      無料枠上限のお知らせ
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-900 tracking-wider">
                      本日の無料枠は使い切りましたが、プレミアムチケットなら今すぐ続けられます！
                    </h4>
                  </div>

                  <div className="space-y-2 pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedEngine?.('openai_premium')}
                      className="w-full py-3 bg-zinc-950 text-white text-xs font-black tracking-wider transition-colors shadow-sm"
                    >
                      チケット利用モードに切り替える →
                    </button>
                    <button
                      type="button"
                      onClick={switchToGeometric}
                      className="w-full py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-400 text-[11px] font-bold tracking-wider transition-colors shadow-2xs"
                    >
                      完全無料の「格子・水玉製作所」で遊ぶ →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 生成完了後の作品表示エリア */}
        {imageUrl && (
          <div className="pt-8 mt-8 border-t-2 border-zinc-950 space-y-6 relative z-10 animate-fade-in bg-zinc-50 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 pb-8">
            <h3 className="text-center font-bold text-sm tracking-widest text-zinc-800 pt-6">あなただけの作品が完成しました</h3>
            
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-baseline">
                <label className="block text-xs font-bold text-zinc-700 tracking-wider">
                  作品名 <span className="font-normal text-[10px] text-zinc-400">（お好みの名前に変更できます）</span>
                </label>
              </div>
              <input
                type="text"
                className="w-full border-b-2 border-zinc-300 p-3 bg-transparent text-sm font-bold focus:outline-none focus:border-zinc-950 transition-colors"
                placeholder="例：深緋の色無地"
                value={patternTitle}
                onChange={(e) => setPatternTitle?.(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-3 pt-2">
              <button type="button" onClick={handleDownloadOriginal} className="w-full py-3 text-center border border-zinc-300 bg-white hover:border-zinc-950 hover:bg-zinc-100 text-zinc-800 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm">
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
                      <path d="M12.186 17.5c-3.14 0-5.694-2.553-5.694-5.693 0-3.14 2.554-5.694 5.694-5.694 3.14 0 5.693 2.554 5.693 5.694 0 .693-.56 1.253-1.253 1.253-.694 0-1.254-.56-1.254-1.253 0-1.76-1.433-3.194-3.193-3.194-1.76 0-3.194 1.434-3.1
