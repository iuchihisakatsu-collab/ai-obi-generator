// components/controls/ControlPanel.tsx
'use client';

import { useState, Dispatch, SetStateAction, MouseEvent } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

interface CategoryItem {
  label: string;
  id: string; 
}

const TAG_CATEGORIES: { title: string; items: CategoryItem[] }[] = [
  {
    title: '【1】生き物・モチーフ',
    items: [
      { label: 'ねこ', id: 'ct300' },
      { label: '犬', id: 'ct301' },
      { label: 'うさぎ', id: 'ct303' },    
      { label: '虎', id: 'ct303' },    
      { label: '蛇', id: 'ct303' },
      { label: '鳥', id: 'ct269' },
      { label: '魚', id: 'ct265' },
      { label: '昆虫', id: 'ct188' },
      { label: '動物', id: 'ct47' },
      { label: '植物', id: 'ct46' },
      { label: '恐竜', id: 'ct267' },
      { label: 'リボン・レース', id: 'ct312' },
    ]
  },
  {
    title: '【2】世界観・テーマ',
    items: [
      { label: '宇宙', id: 'ct51' },
      { label: 'お菓子', id: 'ct48' },
      { label: 'ロリポップ・キャンディ', id: 'ct48' },
      { label: '音楽', id: 'ct315' },
      { label: '乗り物', id: 'ct320' },
      { label: '建造物', id: 'ct268' },
      { label: '鉱物・宝石', id: 'ct170' },
      { label: '玩具', id: 'ct319' },
      { label: '妖怪・おばけ・ドクロ', id: 'ct175' },
    ]
  },
  {
    title: '【3】柄・地紋',
    items: [
      { label: '水玉・ドット', id: 'ct310' },
      { label: '縞・ストライプ', id: 'ct309' },
      { label: '格子・チェック', id: 'ct311' },
      { label: '市松', id: 'ct53' },
      { label: '七宝', id: 'ct53' },     
      { label: '疋田絞', id: 'ct53' },
      { label: '青海波', id: 'ct53' },
      { label: '麻の葉', id: 'ct53' },
      { label: '矢絣', id: 'ct53' },
      { label: '亀甲', id: 'ct53' },
      { label: '唐草', id: 'ct53' },
      { label: '紗綾形', id: 'ct53' },
      { label: '千鳥格子', id: 'ct311' },
      { label: '幾何学模様', id: 'ct53' },
      { label: '墨流', id: 'ct171' },
    ]
  },
  {
    title: '【4】和の技法・様式',
    items: [
      { label: '友禅染め風', id: 'ct49' },
      { label: '紅型', id: 'ct49' },
      { label: '浮世絵', id: 'ct49' },
      { label: '水墨画', id: 'ct49' },
      { label: '琳派', id: 'ct49' },
      { label: '絞り染め風', id: 'ct53' },
      { label: '江戸小紋', id: 'ct53' },
      { label: '金彩・蒔絵風', id: 'ct49' },
    ]
  },
  {
    title: '【5】画材・タッチ',
    items: [
      { label: '水彩画', id: 'ct50' },
      { label: '油絵・厚塗り', id: 'ct50' },
      { label: 'ペン画・線画', id: 'ct50' },
      { label: '色鉛筆・パステル', id: 'ct50' },
      { label: '版画・切り絵風', id: 'ct49' },
      { label: 'リアルタッチ・写実的', id: 'ct50' },
      { label: 'ポップ調', id: 'ct312' },
    ]
  },
  {
    title: '【6】テイスト・雰囲気',
    items: [
      { label: '大正ロマン', id: 'ct49' },
      { label: 'レトロモダン', id: 'ct49' },
      { label: 'アールヌーヴォー', id: 'ct312' },
      { label: 'ミッドセンチュリー', id: 'ct352' },
      { label: 'オリエンタル', id: 'ct295' },
      { label: 'ゴシック・ダーク', id: 'ct354' },
      { label: 'ファンシー・ゆめかわ', id: 'ct312' },
    ]
  }
];

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: Dispatch<SetStateAction<'ai' | 'geometric'>>;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  setItemType: Dispatch<SetStateAction<'hanhaba' | 'kyobukuro' | 'kimono'>>;
  aiStyle: string;
  setAiStyle: Dispatch<SetStateAction<string>>;
  selectedArtist: string;
  setSelectedArtist: Dispatch<SetStateAction<string>>;
  motif: string;
  setMotif: Dispatch<SetStateAction<string>>;
  motif2: string;
  setMotif2: Dispatch<SetStateAction<string>>;
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: Dispatch<SetStateAction<typeof TRADITIONAL_COLORS>>;
  handleColorToggle: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: Dispatch<SetStateAction<boolean>>;
  density: string;
  setDensity: Dispatch<SetStateAction<string>>;
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: Dispatch<SetStateAction<'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>>;
  stripeDir: 'vertical' | 'horizontal' | 'diagonal';
  setStripeDir: Dispatch<SetStateAction<'vertical' | 'horizontal' | 'diagonal'>>;
  dotLayout: 'staggered' | 'grid';
  setDotLayout: Dispatch<SetStateAction<'staggered' | 'grid'>>;
  dotRadius: number;
  setDotRadius: Dispatch<SetStateAction<number>>;
  gapWidth: number;
  setGapWidth: Dispatch<SetStateAction<number>>;
  lineWidth: number;
  setLineWidth: Dispatch<SetStateAction<number>>;
  geoBgColor: string;
  setGeoBgColor: Dispatch<SetStateAction<string>>;
  geoPatternColor: string;
  setGeoPatternColor: Dispatch<SetStateAction<string>>;
  showGeoPaletteFor: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor: Dispatch<SetStateAction<'bg' | 'pattern' | null>>;
  obiLiningColor: string;
  setObiLiningColor: Dispatch<SetStateAction<string>>;
  kimonoHaneriColor: string;
  setKimonoHaneriColor: Dispatch<SetStateAction<string>>;
  kimonoObiageColor: string;
  setKimonoObiageColor: Dispatch<SetStateAction<string>>;
  kimonoObiColor: string;
  setKimonoObiColor: Dispatch<SetStateAction<string>>;
  customObiUrl: string | null;
  setCustomObiUrl: Dispatch<SetStateAction<string | null>>;
  handleCustomObiUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  agreed: boolean;
  setAgreed: Dispatch<SetStateAction<boolean>>;
  errorMsg: string;
  loading: boolean;
  loadingEngine: 'flux' | 'openai' | null;
  remainingCount: number;
  loadingStep: number;
  handleGenerate: () => void;
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: Dispatch<SetStateAction<string>>;
  serialNumber: string;
  handleDownloadOriginal: () => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  selectedEngine: 'flux' | 'openai_free' | 'openai_premium';
  setSelectedEngine: Dispatch<SetStateAction<'flux' | 'openai_free' | 'openai_premium'>>;
  premiumCode: string;
  setPremiumCode: Dispatch<SetStateAction<string>>;
  premiumStatusMsg: string;
}

export default function ControlPanel({
  creationMode, setCreationMode,
  itemType, setItemType,
  motif, setMotif,
  motif2, setMotif2,
  selectedColors, setSelectedColors, handleColorToggle,
  showColorPalette, setShowColorPalette,
  density, setDensity,
  geoPatternType, setGeoPatternType,
  stripeDir, setStripeDir, dotLayout, setDotLayout,
  dotRadius, setDotRadius, gapWidth, setGapWidth,
  lineWidth, setLineWidth, geoBgColor, setGeoBgColor,
  geoPatternColor, setGeoPatternColor,
  showGeoPaletteFor, setShowGeoPaletteFor,
  agreed, setAgreed, errorMsg,
  loading, remainingCount,
  handleGenerate, imageUrl, patternTitle, setPatternTitle,
  handleDownloadOriginal, handleOrderClick,
  selectedEngine, setSelectedEngine,
  premiumCode, setPremiumCode, premiumStatusMsg
}: ControlPanelProps) {
  const [showTags, setShowTags] = useState(false);

  const handleTagClick = (item: CategoryItem) => {
    if (!motif.includes(item.label)) {
      const newMotif = motif ? `${motif}、${item.label}` : item.label;
      setMotif(newMotif);
    }
  };

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-6 lg:p-8 shrink-0 shadow-sm z-10 flex flex-col gap-6">
      
      {/* 看板ヘッダー（AIという文字を完全排除） */}
      <div className="text-center p-4 sm:p-6 bg-zinc-950 text-white shadow-inner rounded-sm">
        <h1 className="text-lg sm:text-2xl font-black tracking-widest text-center leading-tight">
          妄想きもの図案帳
        </h1>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-2.5 leading-relaxed font-medium tracking-wider">
          新潟・十日町は着物の産地。着物の配色や柄づくりの知識を生かして、<br className="hidden sm:inline" />
          思いついた柄の意匠をカタチにするデジタル図案システムです。
        </p>
      </div>

      {/* モード切替タブ */}
      <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200">
        <button
          type="button"
          onClick={() => setCreationMode('geometric')}
          className={`flex-1 py-2.5 text-xs font-black tracking-wider transition-all rounded-sm ${
            creationMode === 'geometric' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          幾何学文様 (使い放題)
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('ai')}
          className={`flex-1 py-2.5 text-xs font-black tracking-wider transition-all rounded-sm ${
            creationMode === 'ai' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          妄想意匠モード
        </button>
      </div>

      {/* 妄想意匠モード */}
      {creationMode === 'ai' ? (
        <div className="space-y-5 animate-fade-in">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                01. 図案モチーフ（お太鼓・メイン柄）
              </label>
              {motif && (
                <button onClick={() => setMotif('')} className="text-[10px] text-zinc-400 hover:text-zinc-700">クリア</button>
              )}
            </div>
            <textarea
              className="w-full border border-zinc-300 p-3 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 resize-none rounded-sm leading-relaxed"
              rows={2}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="例：上から見た金魚。赤い金魚と黒出目金。水草。地色は白、ターコイズの流水柄。"
              disabled={loading}
            />

            {/* ヒントタグ（アコーディオン） */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setShowTags(!showTags)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors py-1"
              >
                <span>{showTags ? 'ヒントを閉じる' : '図案のヒント・キーワードを探す'}</span>
                <span className="text-[9px]">{showTags ? '▲' : '▼'}</span>
              </button>
            </div>

            {showTags && (
              <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 animate-fade-in shadow-inner rounded-sm">
                <p className="text-[10px] text-zinc-500 font-medium">クリックするとモチーフにキーワードが追加されます：</p>
                {TAG_CATEGORIES.map((cat) => (
                  <div key={cat.title}>
                    <p className="text-[10px] font-bold text-zinc-400 tracking-wider mb-1">{cat.title}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleTagClick(item)}
                          className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-medium text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all shadow-sm rounded-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 京袋帯専用：前柄指定 */}
          {itemType === 'kyobukuro' && (
            <div className="pt-2 border-t border-zinc-100">
              <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-1.5">
                前柄モチーフ（胴に巻く部分）<span className="text-[10px] text-zinc-400 font-normal ml-1">※空欄ならお太鼓と統一</span>
              </label>
              <input
                type="text"
                className="w-full border border-zinc-300 p-2.5 text-xs focus:outline-none focus:border-zinc-900 rounded-sm"
                value={motif2}
                onChange={(e) => setMotif2(e.target.value)}
                placeholder="例：小さな波紋、ワンポイントの水草など"
                disabled={loading}
              />
            </div>
          )}

          {/* 02. 配色パレット */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="flex justify-between items-baseline mb-2">
              <label className="block text-xs font-bold text-zinc-900">02. 配色（最大3色まで）</label>
              <button
                type="button"
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-bold"
              >
                {showColorPalette ? '閉じる' : '色見本から選ぶ (102色)'}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
              {selectedColors.length === 0 ? (
                <span className="text-xs text-zinc-400 italic">指定なし（モチーフ内容に合わせて自動調合）</span>
              ) : (
                <>
                  {selectedColors.map((col) => (
                    <span
                      key={col.name}
                      onClick={() => handleColorToggle(col)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border cursor-pointer rounded-sm shadow-sm"
                      style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}
                    >
                      {col.name.split(' ')[0]} ✕
                    </span>
                  ))}
                  <button type="button" onClick={() => setSelectedColors([])} className="text-[10px] text-zinc-400 underline ml-1">リセット</button>
                </>
              )}
            </div>

            {showColorPalette && (
              <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-sm shadow-inner">
                <div className="max-h-[160px] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-1.5 pr-1">
                  {TRADITIONAL_COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => handleColorToggle(col)}
                      className="h-8 p-1 text-left border border-zinc-200 rounded-sm shadow-sm"
                      style={{ backgroundColor: col.hex }}
                    >
                      <span className={`text-[8px] font-bold block truncate ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {col.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 03. 柄の配置 */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-2">
              03. 柄の配置
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '四方柄', label: '小紋・四方柄' },
                { id: '飛び柄', label: '飛び柄' },
                { id: 'お太鼓柄', label: 'お太鼓柄' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDensity(item.id)}
                  className={`py-2 px-1 text-center text-xs font-bold tracking-wider transition-all border rounded-sm ${
                    density === item.id
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 04. 図案の描き分け（製版クオリティの選択 / 案A採用） */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <label className="block text-xs font-bold text-zinc-900 tracking-wider">
              04. 図案の描き分け（製版クオリティの選択）
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* 1. FLUX (無料・ひらめき図案) */}
              <label className={`relative flex flex-col cursor-pointer rounded-sm border p-3 shadow-sm transition-all ${selectedEngine === 'flux' ? 'border-zinc-900 bg-zinc-900 text-white ring-1 ring-zinc-900' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
                <input type="radio" name="engine" value="flux" className="sr-only" checked={selectedEngine === 'flux'} onChange={() => setSelectedEngine('flux')} />
                <div className="flex w-full items-center justify-between">
                  <div className="text-xs sm:text-sm font-black">【無料】ひらめき図案（スタンダード）</div>
                  <div className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded ${selectedEngine === 'flux' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'}`}>本日残り: {remainingCount}回</div>
                </div>
                <p className={`text-[10px] mt-1.5 leading-relaxed ${selectedEngine === 'flux' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  軽快に何枚も試せる通常仕立て。気に入った柄はそのまま帯や着物に製品化できます。
                </p>
              </label>

              {/* 2. OpenAI (無料お試し) */}
              <label className={`relative flex flex-col cursor-pointer rounded-sm border p-3 shadow-sm transition-all ${selectedEngine === 'openai_free' ? 'border-amber-600 bg-amber-50 text-amber-950 ring-1 ring-amber-600' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
                <input type="radio" name="engine" value="openai_free" className="sr-only" checked={selectedEngine === 'openai_free'} onChange={() => setSelectedEngine('openai_free')} />
                <div className="flex w-full items-center justify-between">
                  <div className="text-xs sm:text-sm font-black">【無料お試し】本気の1枚（最高精細）</div>
                  <div className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">1日1回</div>
                </div>
                <p className={`text-[10px] mt-1.5 leading-relaxed ${selectedEngine === 'openai_free' ? 'text-amber-800' : 'text-zinc-500'}`}>
                  最高峰モデルの描写力を1日1回無料でお試しいただけます。
                </p>
              </label>

              {/* 3. OpenAI (プレミアムチケット・ポイント全額還元) */}
              <label className={`relative flex flex-col cursor-pointer rounded-sm border p-3 shadow-sm transition-all ${selectedEngine === 'openai_premium' ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-600' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
                <div className="flex w-full items-center justify-between">
                  <input type="radio" name="engine" value="openai_premium" className="sr-only" checked={selectedEngine === 'openai_premium'} onChange={() => setSelectedEngine('openai_premium')} />
                  <div className="text-xs sm:text-sm font-black">【チケット利用】極みの意匠（最高精細）</div>
                  <div className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-indigo-600 text-white rounded">ポイントで全額還元</div>
                </div>
                <p className={`text-[10px] mt-1.5 leading-relaxed ${selectedEngine === 'openai_premium' ? 'text-indigo-900' : 'text-zinc-500'}`}>
                  繊細な筆致と豊かなグラデーションを描き出す最高峰モデル。実物をお仕立ての際、チケット代金分がMakeShopポイントとして全額戻ります（実質0円）。
                </p>
                
                {selectedEngine === 'openai_premium' && (
                  <div className="mt-2.5 pt-2.5 border-t border-indigo-200 animate-fade-in">
                    <p className="text-[10px] mb-1.5 text-indigo-900 font-bold">発行されたプレミアムコード（GFK-...）を入力：</p>
                    <input 
                      type="text" 
                      placeholder="例: GFK-7338-MWX5" 
                      value={premiumCode}
                      onChange={(e) => setPremiumCode(e.target.value)}
                      className="w-full px-3 py-2 border border-indigo-300 rounded-sm text-xs bg-white text-indigo-950 uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* 幾何学文様モード */
        <div className="space-y-4 animate-fade-in">
          <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 p-3 text-xs shadow-sm rounded-sm">
            <p className="font-bold text-[11px] mb-0.5">幾何学文様・使い放題</p>
            <p className="text-[10px] text-zinc-600">左側のプレビューを見ながら、サイズや色を自由にいじって遊んでみてください。</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-900 mb-1">文様の種類</label>
              <select
                value={geoPatternType}
                onChange={(e) => setGeoPatternType(e.target.value as any)}
                className="w-full border border-zinc-300 p-2 text-xs bg-white rounded-sm focus:outline-none focus:border-zinc-900 shadow-sm"
              >
                <option value="plain">色無地</option>
                <option value="stripe">万筋縞（ストライプ）</option>
                <option value="dot">千鳥水玉（ドット）</option>
                <option value="grid">格子柄（方眼）</option>
                <option value="gingham">ギンガムチェック</option>
                <option value="checker">市松模様</option>
              </select>
            </div>
            {geoPatternType === 'stripe' && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1">縞の向き</label>
                <select
                  value={stripeDir}
                  onChange={(e) => setStripeDir(e.target.value as any)}
                  className="w-full border border-zinc-300 p-2 text-xs bg-white rounded-sm focus:outline-none focus:border-zinc-900 shadow-sm"
                >
                  <option value="vertical">縦縞</option>
                  <option value="horizontal">横縞</option>
                  <option value="diagonal">斜め縞</option>
                </select>
              </div>
            )}
            {geoPatternType === 'dot' && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1">配置</label>
                <select
                  value={dotLayout}
                  onChange={(e) => setDotLayout(e.target.value as any)}
                  className="w-full border border-zinc-300 p-2 text-xs bg-white rounded-sm focus:outline-none focus:border-zinc-900 shadow-sm"
                >
                  <option value="staggered">千鳥（互い違い）</option>
                  <option value="grid">正方格子</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <label className="block text-xs font-bold text-zinc-900">サイズ調整（mm実寸連動）</label>
            {geoPatternType === 'dot' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500 font-bold">水玉の直径</span>
                  <span className="font-black text-zinc-900">{dotRadius * 2}mm</span>
                </div>
                <input type="range" min="2" max="60" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full accent-zinc-900" />
              </div>
            )}
            {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham' || geoPatternType === 'checker') && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500 font-bold">線の太さ／マス目</span>
                  <span className="font-black text-zinc-900">{lineWidth}mm</span>
                </div>
                <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-900 mb-1">地色</label>
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoBgColor }} />
                  <button
                    type="button"
                    onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')}
                    className={`flex-1 text-[10px] h-7 font-bold transition-all border shadow-sm ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
                  >
                    伝統色
                  </button>
                </div>
              </div>
              {geoPatternType !== 'plain' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 mb-1">柄色</label>
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoPatternColor }} />
                    <button
                      type="button"
                      onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')}
                      className={`flex-1 text-[10px] h-7 font-bold transition-all border shadow-sm ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
                    >
                      伝統色
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showGeoPaletteFor && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner rounded-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] text-zinc-500 font-bold">{showGeoPaletteFor === 'bg' ? '地色' : '柄色'}を選択：</p>
                  <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                </div>
                <div className="max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex);
                          if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex);
                          setShowGeoPaletteFor(null);
                        }}
                        className="h-8 p-1 text-left border border-zinc-300 shadow-sm rounded-sm"
                        style={{ backgroundColor: col.hex }}
                      >
                        <span className={`text-[8px] font-bold block truncate ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {col.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 05. タイトルと生成ボタン */}
      <div className="pt-4 border-t border-zinc-200 space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">05. 図案銘（作品タイトル）</label>
          <input
            type="text"
            className="w-full border border-zinc-300 p-2.5 text-xs bg-zinc-50 rounded-sm focus:bg-white focus:outline-none focus:border-zinc-900 shadow-sm"
            placeholder="例：春陽の風車"
            value={patternTitle}
            onChange={(e) => setPatternTitle(e.target.value)}
          />
        </div>

        {creationMode === 'ai' && (
          <div className="space-y-3">
            <label className="flex items-start gap-2 cursor-pointer text-[10px] text-zinc-500 leading-tight">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              <span>生成図案は試作用の意匠イメージであり、実際の染織・製品化の際はスタッフが柄送りや色調を人の目で最適化することに同意します。</span>
            </label>

            {errorMsg && <div className="p-2.5 bg-red-50 text-red-600 text-xs font-bold border border-red-200 rounded-sm">{errorMsg}</div>}
            {premiumStatusMsg && <div className="p-2.5 bg-green-50 text-green-700 text-xs font-bold border border-green-200 rounded-sm">{premiumStatusMsg}</div>}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || (selectedEngine !== 'openai_premium' && remainingCount <= 0)}
              className="w-full py-4 bg-zinc-950 text-white font-black text-xs sm:text-sm tracking-widest rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <span>デジタル筆で図案帳に描き出しています...</span>
              ) : (
                selectedEngine === 'openai_premium' 
                  ? '極みの意匠を描き出す（チケット消費）' 
                  : `妄想した図案をつくる (本日残り: ${remainingCount}回)`
              )}
            </button>
          </div>
        )}

        {/* 保存・注文ボタン */}
        {imageUrl && (
          <div className="pt-2 border-t border-zinc-200 space-y-2">
            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="w-full py-2.5 border border-zinc-900 text-xs font-bold tracking-wider hover:bg-zinc-50 transition-colors rounded-sm"
            >
              高解像度プリントデータを保存
            </button>
            <a
              href="#"
              onClick={handleOrderClick}
              className="block w-full py-3 bg-zinc-900 text-white text-center text-xs font-black tracking-widest hover:bg-zinc-800 transition-colors shadow rounded-sm"
            >
              この図案でお誂えを申し込む
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
