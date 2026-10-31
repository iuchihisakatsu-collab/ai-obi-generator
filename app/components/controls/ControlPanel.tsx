// components/controls/ControlPanel.tsx
'use client';

import { MouseEvent } from 'react';
import { TRADITIONAL_COLORS, CategoryItem } from '../../lib/constants';

interface ControlPanelProps {
  creationMode?: 'ai' | 'geometric';
  setCreationMode?: (mode: 'ai' | 'geometric') => void;
  aiStyle?: string;
  setAiStyle?: (val: string) => void;
  selectedArtist?: string;
  setSelectedArtist?: (val: string) => void;
  motif?: string;
  setMotif?: (val: string) => void;
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
  [key: string]: any;
}

const AI_STYLES = [
  { id: 'none', label: '指定なし（完全自由）', sub: 'すべて自分で考える', searchKeyword: '' },
  { id: 'yuzen', label: 'はんなり友禅', sub: '京友禅・水彩ぼかし', searchKeyword: '友禅' },
  { id: 'mingei', label: '民藝と型染め', sub: '芹沢銈介風', searchKeyword: '民藝' },
  { id: 'retro', label: '大正ロマン', sub: '竹久夢二・銘仙', searchKeyword: '大正ロマン' },
  { id: 'sarasa', label: 'エキゾチック更紗', sub: 'バティック・唐草', searchKeyword: '更紗' },
  { id: 'morris', label: '英国ボタニカル', sub: 'ウィリアム・モリス調', searchKeyword: 'モリス' },
  { id: 'botanical', label: 'ボタニカル', sub: '植物図譜・水彩花', searchKeyword: 'ボタニカル' },
  { id: 'artnouveau', label: 'アール・ヌーヴォー', sub: 'ミュシャ調・優美な曲線', searchKeyword: 'アールヌーヴォー' },
  { id: 'nordic', label: '北欧モダン', sub: 'マリメッコ調・大柄', searchKeyword: '北欧' },
  { id: 'kissaten', label: '純喫茶レトロ', sub: '昭和ノスタルジー', searchKeyword: 'レトロ' },
  { id: 'psychedelic', label: '70sサイケ', sub: 'うねり・レトロポップ', searchKeyword: 'サイケ' },
  { id: 'anime', label: 'アニメ調', sub: '明快なセル画線画', searchKeyword: 'アニメ' },
  { id: 'lollipop', label: 'ロリポップ', sub: 'ファンシー・ゆめかわ', searchKeyword: 'ポップ' },
  { id: 'cyberpunk', label: 'サイバーパンク', sub: 'ネオン・電子回路', searchKeyword: 'サイバーパンク' },
  { id: 'steampunk', label: 'スチームパンク', sub: '歯車・真鍮時計', searchKeyword: 'スチームパンク' },
  { id: 'retrofuturism', label: 'レトロフューチャー', sub: 'スペースエイジ・宇宙SF', searchKeyword: 'レトロフューチャー' },
];

const MASTER_ARTISTS = [
  {
    group: '和の巨匠（浮世絵・琳派・奇想）',
    items: [
      { id: 'hokusai', label: '葛飾北斎（冨嶽三十六景・藍の濃淡）', searchKeyword: '北斎' },
      { id: 'jakuchu', label: '伊藤若冲（超細密花鳥・極彩色）', searchKeyword: '若冲' },
      { id: 'kuniyoshi', label: '歌川国芳（奇想天外・武者絵・猫）', searchKeyword: '国芳' },
      { id: 'korin', label: '尾形光琳（琳派・金地流水）', searchKeyword: '光琳' },
      { id: 'hoitsu', label: '酒井抱一（江戸琳派・洗練四季草花）', searchKeyword: '抱一' },
      { id: 'kyosai', label: '河鍋暁斎（躍動感・洒脱な墨絵妖怪）', searchKeyword: '暁斎' },
      { id: 'utamaro', label: '喜多川歌麿（美人画・繊細な極細線）', searchKeyword: '歌麿' },
      { id: 'koson', label: '小原古邨（新版画・花鳥木版画）', searchKeyword: '古邨' },
      { id: 'sharaku', label: '東洲斎写楽（強烈な役者絵デフォルメ）', searchKeyword: '写楽' },
    ]
  },
  {
    group: '洋の巨匠（装飾・印象派・色彩）',
    items: [
      { id: 'klimt', label: 'グスタフ・クリムト（黄金様式・幾何学装飾）', searchKeyword: 'クリムト' },
      { id: 'mucha', label: 'アルフォンス・ミュシャ（流麗な植物枠装飾）', searchKeyword: 'ミュシャ' },
      { id: 'vangogh', label: 'フィンセント・ファン・ゴッホ（うねる筆致・星月夜）', searchKeyword: 'ゴッホ' },
      { id: 'monet', label: 'クロード・モネ（睡蓮・光と印象派）', searchKeyword: 'モネ' },
      { id: 'rousseau', label: 'アンリ・ルソー（幻想の密林ジャングル）', searchKeyword: 'ルソー' },
      { id: 'matisse', label: 'アンリ・マティス（色彩の魔術師・切り絵）', searchKeyword: 'マティス' },
      { id: 'redon', label: 'オディロン・ルドン（夢幻のパステル神秘花）', searchKeyword: 'ルドン' },
      { id: 'gauguin', label: 'ポール・ゴーギャン（鮮烈で平面的色彩）', searchKeyword: 'ゴーギャン' },
      { id: 'bonnard', label: 'ピエール・ボナール（光と色彩のモザイク）', searchKeyword: 'ボナール' },
    ]
  }
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

const WAITING_MESSAGES = [
  "出てきた作品は一期一会。更新すると二度と戻りません。「気に入ったらまず保存」これが鉄則です！",
  "実は1回描くごとにゴフクヤサンにリアルに課金されてます（笑）言葉をよーく選んで試してみて！",
  "画面を眺めるだけじゃもったいない！この柄、本当に着物や帯に仕立てられます。「妄想を現実に」ボタンをぜひ。",
  "ご注文後は必ず職人が目視と手作業で柄の不具合を修正してから仕立てに出します。安心してお任せを。",
  "「柄は最高だけど地色が惜しい！」などあれば注文時に教えてください。背景色の変更もやります！"
];

export default function ControlPanel({
  creationMode = 'geometric',
  setCreationMode = () => {},
  aiStyle = 'none',
  setAiStyle = () => {},
  selectedArtist = 'none',
  setSelectedArtist = () => {},
  motif = '',
  setMotif = () => {},
  selectedColors = [],
  setSelectedColors = () => {},
  handleColorToggle = () => {},
  showColorPalette = false,
  setShowColorPalette = () => {},
  density = '四方柄',
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
  agreed = false,
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
  serialNumber = '',
  handleDownloadOriginal = () => {},
  handleOrderClick = () => {}
}: ControlPanelProps) {

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map((c) => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = `「妄想小紋図案帖」で柄のアイデアを試してみました。\n作品名：『${finalTitle}』\n配色：${colorSummary}\n#妄想きもの図案帳 #ゴフクヤサン`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://store.gofukuyasan.com/';
  const mediaUrl = imageUrl || '';

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(serialNumber || '');
      alert(`作品ID「${serialNumber}」をコピーしました！\n後でご注文される際に貼り付けてお使いください。`);
    } catch (err) {
      alert('コピーに失敗しました。');
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  const shareToThreads = () => {
    const textWithUrl = `${shareText}\n${currentUrl}`;
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

  const handleQuickAdd = (word: string) => {
    if (!motif.includes(word)) {
      setMotif(motif ? `${motif}、${word}` : word);
    }
  };

  // 検索タグ生成
  const searchTags: string[] = [];
  const currentStyle = AI_STYLES.find(s => s.id === aiStyle);
  if (currentStyle && currentStyle.searchKeyword) {
    searchTags.push(currentStyle.searchKeyword);
  }

  const allArtists = MASTER_ARTISTS.flatMap(g => g.items);
  const currentArtist = allArtists.find(a => a.id === selectedArtist);
  if (currentArtist && currentArtist.searchKeyword && !searchTags.includes(currentArtist.searchKeyword)) {
    searchTags.push(currentArtist.searchKeyword);
  }

  if (motif.trim()) {
    const words = motif.split(/[、,，\s ]+/).map(w => w.trim()).filter(Boolean);
    for (const w of words) {
      if (!searchTags.includes(w)) {
        searchTags.push(w);
      }
    }
  }

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10 relative">
      <div className="flex bg-zinc-50 border border-zinc-200 p-1 mb-6 shadow-sm">
        <button type="button" onClick={() => setCreationMode('geometric')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
          格子・水玉製作所
        </button>
        <button type="button" onClick={() => setCreationMode('ai')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
          図案妄想モード
        </button>
      </div>

      <div className="space-y-6">
        {creationMode === 'ai' ? (
          <>
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">01. どんな世界観で？（15のスタイル）</label>
                <span className="text-[10px] text-zinc-400">先頭ボタンで自由設定可能</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3">
                {AI_STYLES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setAiStyle(s.id)} className={`flex flex-col items-center justify-center p-2 sm:p-2.5 border transition-all shadow-sm ${aiStyle === s.id ? 'bg-zinc-900 text-white border-zinc-900 scale-95 ring-2 ring-zinc-900' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:scale-[1.01]'}`}>
                    <span className="text-[10px] sm:text-[11px] font-black leading-tight text-center">{s.label}</span>
                    <span className="text-[8px] sm:text-[9px] opacity-70 mt-0.5 leading-none text-center">{s.sub}</span>
                  </button>
                ))}
              </div>

              {/* 名画・巨匠の筆致プルダウン */}
              <div className="pt-2 border-t border-dashed border-zinc-200">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 shrink-0">名画・巨匠の筆致 (任意):</span>
                  <select
                    value={selectedArtist}
                    onChange={(e) => setSelectedArtist(e.target.value)}
                    className="flex-1 py-1.5 px-2.5 bg-zinc-50 border border-zinc-300 text-zinc-800 text-xs font-bold rounded-xs focus:outline-none focus:border-zinc-900 cursor-pointer shadow-xs truncate"
                  >
                    <option value="none">指定なし（なし）</option>
                    {MASTER_ARTISTS.map((g) => (
                      <optgroup key={g.group} label={g.group}>
                        {g.items.map((a) => (
                          <option key={a.id} value={a.id}>{a.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 relative">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 tracking-wider">02. 好きな色（着物のテーマカラー）</label>
                </div>
                <button type="button" onClick={() => setShowColorPalette(!showColorPalette)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
                  <span>{showColorPalette ? '閉じる' : '色見本から選ぶ (102色)'}</span>
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed mb-2 bg-amber-50/70 border border-amber-200/60 p-2 rounded-xs">
                ※ 色を選ぶとその色に<strong className="text-zinc-900">かなり強く引っ張られます</strong>。偶然生まれる絶妙な色合わせを楽しみたい場合は、<strong className="text-zinc-900">「指定なし（おまかせ）」</strong>のままにするのがおすすめです。
              </p>

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
              <p className="text-[10px] text-zinc-400 mb-2">言葉を細かく足していくほど、あなたの理想の図案に近づきます。</p>
              
              <textarea 
                className="w-full border border-zinc-300 p-3 sm:p-4 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium shadow-sm" 
                placeholder="例：黒猫、満月、星空、バイオリン（言葉を細かく足していくほど、あなたの理想の図案に近づきます）" 
                rows={2} 
                value={motif} 
                onChange={(e) => setMotif(e.target.value)} 
                disabled={loading} 
              />
              
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
                {['四方柄', '飛び柄', 'お太鼓柄'].map((id) => (
                  <button key={id} type="button" onClick={() => setDensity(id)} className={`py-2 px-2.5 text-[11px] font-bold tracking-wider transition-all text-left border ${density === id ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-sm'} relative z-10`}>
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className={`grid ${geoPatternType === 'plain' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">柄の種類</label>
                <select value={geoPatternType} onChange={(e) => setGeoPatternType(e.target.value as any)} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10 font-bold">
                  <option value="plain">無地</option>
                  <option value="stripe">縞</option>
                  <option value="dot">水玉</option>
                  <option value="grid">格子</option>
                  <option value="gingham">吟風</option>
                  <option value="checker">市松</option>
                </select>
              </div>
              {geoPatternType === 'stripe' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">縞の向き</label>
                  <select value={stripeDir} onChange={(e) => setStripeDir(e.target.value as 'vertical' | 'horizontal' | 'diagonal')} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10">
                    <option value="vertical">縦縞</option>
                    <option value="horizontal">横縞</option>
                    <option value="diagonal">斜め縞</option>
                  </select>
                </div>
              )}
              {geoPatternType === 'dot' && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">配置</label>
                  <select value={dotLayout} onChange={(e) => setDotLayout(e.target.value as 'staggered' | 'grid')} className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10">
                    <option value="staggered">千鳥</option>
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
                        <span className="text-[10px] font-bold text-zinc-500">水玉の大きさ</span>
                        <span className="text-xs font-black text-zinc-900">{dotRadius * 2}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔</span>
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
                        <span className="text-[10px] font-bold text-zinc-500">間隔</span>
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
                    <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>102の伝統色から選ぶ</button>
                  </div>
                </div>
                {geoPatternType !== 'plain' && (
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">柄色</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoPatternColor }} />
                      <button type="button" onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}>102の伝統色から選ぶ</button>
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

        {/* 妄想した図案をつくる ボタン */}
        <div className="space-y-4 mt-6">
          {creationMode === 'ai' && (
            <div className="pt-6 border-t border-zinc-200 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none mb-2 group relative z-10">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer" />
                <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800 transition-colors">生成図案はデザインのアイデアであり、仕立て時は職人が手作業で不具合を修正することに同意します。</span>
              </label>
              
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">{errorMsg}</div>}
              
              <button 
                type="button" 
                onClick={handleGenerate} 
                disabled={loading || remainingCount <= 0} 
                className={`w-full relative overflow-hidden font-black transition-all duration-300 flex flex-col items-center justify-center gap-1 shadow-md z-10 ${
                  remainingCount <= 0 
                    ? 'bg-zinc-100 text-zinc-400 border-2 border-zinc-200 cursor-not-allowed py-5' 
                    : loading
                      ? 'bg-zinc-900 text-white border-2 border-zinc-900 py-4'
                      : 'bg-zinc-950 text-white hover:bg-black hover:shadow-xl hover:scale-[1.01] border-2 border-zinc-950 py-5'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center w-full max-w-sm px-4">
                    {loadingEngine === 'openai' ? (
                      <span className="text-[10.5px] text-amber-300 animate-pulse font-bold tracking-[0.2em] mb-2 flex items-center gap-1.5">
                        🎯 大当たり！最高峰モードで作画中...
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-zinc-300 font-bold tracking-[0.2em] mb-2">
                        図案を紡いでいます...
                      </span>
                    )}
                    <span key={loadingStep} className="text-[10px] leading-relaxed text-zinc-100 font-medium animate-fade-in text-center h-8 flex items-center justify-center tracking-wider">
                      {WAITING_MESSAGES[loadingStep % WAITING_MESSAGES.length]}
                    </span>
                  </div>
                ) : (
                  <span className="text-[15px] sm:text-base tracking-[0.3em] font-black">
                    {remainingCount <= 0 
                      ? '本日の図案制作枠が終了しました' 
                      : '妄想した図案をつくる'}
                  </span>
                )}
              </button>
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
                  作品の銘
                </label>
              </div>
              <input
                type="text"
                className="w-full border-b-2 border-zinc-300 p-3 bg-transparent text-sm font-bold focus:outline-none focus:border-zinc-950 transition-colors text-center"
                placeholder="例：深緋の色無地"
                value={patternTitle}
                onChange={(e) => setPatternTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* ★ 対策A・B：ワンタップIDコピーと赤文字の警告 */}
            <div className="mt-4 p-3 bg-white border-2 border-zinc-200 rounded-sm shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">作品ID（ご注文時に必須）</span>
                  <span className="text-sm font-black text-zinc-900 tracking-widest">{serialNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={copyId}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-[10px] font-bold rounded-sm transition-all shadow-sm flex items-center gap-1"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  IDをコピー
                </button>
              </div>
              <p className="text-[9.5px] text-red-600 font-bold leading-relaxed bg-red-50 p-2 rounded-xs">
                ※スマホで画像を長押し保存するとファイル名（ID）が消えてしまいます。後で注文する場合は必ず【IDをコピー】するか、この画面をスクショ保存してください。
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button 
                type="button" 
                onClick={handleDownloadOriginal} 
                className="w-full py-3.5 text-center border-2 border-zinc-950 bg-white hover:bg-zinc-950 hover:text-white text-zinc-950 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm rounded-xs"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                この作品の画像データを手元に残す
              </button>

              <div className="pt-3 pb-1 border-t border-zinc-200">
                <div className="flex justify-center items-center gap-1.5 mt-2">
                  <button type="button" onClick={shareToX} className="flex flex-col items-center justify-center w-10 h-10 bg-white border border-zinc-300 rounded-full hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Xでポスト">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>

                  <button type="button" onClick={shareToThreads} className="flex flex-col items-center justify-center w-10 h-10 bg-white border border-zinc-300 rounded-full hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Threadsでポスト">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.72 0 12.186 5.094 12.186 11.814 0 2.253-.615 4.417-1.78 6.257l-1.92-1.22c.905-1.43 1.38-3.11 1.38-4.863 0-5.467-4.44-9.5-9.866-9.5-5.426 0-9.866 4.44-9.866 9.866 0 5.427 4.44 9.867 9.866 9.867 3.52 0 6.64-1.854 8.36-4.96l1.986 1.1c-2.226 4.013-6.24 6.406-10.74 6.406z"/>
                      <path d="M12.186 17.5c-3.14 0-5.694-2.553-5.694-5.693 0-3.14 2.554-5.694 5.694-5.694 3.14 0 5.693 2.554 5.693 5.694 0 .693-.56 1.253-1.253 1.253-.694 0-1.254-.56-1.254-1.253 0-1.76-1.433-3.194-3.193-3.194-1.76 0-3.194 1.434-3.194 3.194 0 1.76 1.434 3.193 3.194 3.194 1.053 0 1.986-.52 2.56-1.306.493.533 1.2 1.306 2.066 1.306 1.96 0 3.547-1.587 3.547-3.547 0-4.32-3.507-7.827-7.827-7.827-4.32 0-7.827 3.507-7.827 7.827 0 4.32 3.507 7.827 7.827 7.827 2.373 0 4.547-1.067 6.013-2.773l1.84 1.333C20.693 20.307 17.973 21.667 15 21.667c-.933 0-1.88-.134-2.814-.414z"/>
                    </svg>
                  </button>

                  <button type="button" onClick={shareToInstagram} className="flex flex-col items-center justify-center w-10 h-10 bg-white border border-zinc-300 rounded-full hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Instagram用テキストをコピーして開く">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </button>

                  <button type="button" onClick={shareToPinterest} className="flex flex-col items-center justify-center w-10 h-10 bg-white border border-zinc-300 rounded-full hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Pinterestにピン留め">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12.004-5.367 12.004-11.987C24.02 5.367 18.644 0 12.017 0z"/>
                    </svg>
                  </button>

                  <button type="button" onClick={shareToFacebook} className="flex flex-col items-center justify-center w-10 h-10 bg-white border border-zinc-300 rounded-full hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all shadow-sm group" title="Facebookでシェア">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="transition-transform group-hover:scale-110">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <a href="#" onClick={handleOrderClick} className="block w-full py-4 mt-2 text-center bg-zinc-950 text-white text-[15px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] border-2 border-zinc-950 rounded-sm">
                妄想を現実に<br/><span className="text-[10px] font-medium tracking-wider opacity-90 mt-1 block">（この作品を現実の着物・帯として仕立てる）</span>
              </a>

              <div className="mt-6 pt-5 border-t border-zinc-200">
                <p className="text-xs font-bold text-zinc-900 mb-2.5 flex items-center gap-1.5">
                  <span className="text-amber-500">✦</span>
                  <span>お好きな柄があるかも？ ゴフクヤサンで探す</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {searchTags.map((tag) => (
                    <a
                      key={tag}
                      href={`https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(tag)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white text-zinc-800 text-[11px] font-bold rounded-full transition-all shadow-2xs group"
                    >
                      <span>{tag}</span>
                      <span className="text-[9px] opacity-60 group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                  ))}
                  <a
                    href="https://store.gofukuyasan.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[11px] font-bold rounded-full transition-colors"
                  >
                    <span>全商品一覧</span>
                    <span className="text-[9px]">→</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
