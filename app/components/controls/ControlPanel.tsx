// app/components/controls/ControlPanel.tsx
'use client';

import React, { useState } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';
import { StripeDirection, DotLayout } from '../../utils/geometricPatterns';

export interface ControlPanelProps {
  creationMode?: 'ai' | 'geometric';
  setCreationMode?: (mode: 'ai' | 'geometric') => void;
  itemType?: 'hanhaba' | 'kyobukuro' | 'kimono';
  setItemType?: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  aiStyle?: string;
  setAiStyle?: (style: string) => void;
  selectedArtist?: string;
  setSelectedArtist?: (artist: string) => void;
  motif?: string;
  setMotif?: (motif: string) => void;
  motif2?: string;
  setMotif2?: (motif: string) => void;
  selectedColors?: typeof TRADITIONAL_COLORS;
  setSelectedColors?: (colors: typeof TRADITIONAL_COLORS) => void;
  handleColorToggle?: (color: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette?: boolean;
  setShowColorPalette?: (show: boolean) => void;
  density?: string;
  setDensity?: (density: string) => void;
  geoPatternType?: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType?: (type: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir?: StripeDirection;
  setStripeDir?: (dir: StripeDirection) => void;
  dotLayout?: DotLayout;
  setDotLayout?: (layout: DotLayout) => void;
  dotRadius?: number;
  setDotRadius?: (r: number) => void;
  gapWidth?: number;
  setGapWidth?: (w: number) => void;
  lineWidth?: number;
  setLineWidth?: (w: number) => void;
  geoBgColor?: string;
  setGeoBgColor?: (c: string) => void;
  geoPatternColor?: string;
  setGeoPatternColor?: (c: string) => void;
  showGeoPaletteFor?: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor?: (target: 'bg' | 'pattern' | null) => void;
  agreed?: boolean;
  setAgreed?: (agreed: boolean) => void;
  errorMsg?: string;
  loading?: boolean;
  loadingEngine?: 'flux' | 'openai' | null;
  remainingCount?: number;
  loadingStep?: number;
  handleGenerate?: (engine: 'flux' | 'openai_free' | 'openai_premium' | any) => void;
  imageUrl?: string;
  patternTitle?: string;
  setPatternTitle?: (title: string) => void;
  serialNumber?: string;
  handleDownloadOriginal?: () => void;
  handleOrderClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  premiumCode?: string;
  setPremiumCode?: (code: string) => void;
  premiumStatusMsg?: string;
  [key: string]: any;
}

export default function ControlPanel(props: ControlPanelProps) {
  const {
    creationMode = 'ai',
    setCreationMode = () => {},
    itemType = 'hanhaba',
    setItemType = () => {},
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
    remainingCount = 1,
    loadingStep = 0,
    handleGenerate = () => {},
    imageUrl = '',
    patternTitle = '',
    setPatternTitle = () => {},
    handleDownloadOriginal = () => {},
    handleOrderClick = () => {},
    premiumCode: propPremiumCode,
    setPremiumCode: propSetPremiumCode,
    premiumStatusMsg = '',
  } = props;

  // 親（page.tsx）が未改修でもエラー落ちしないためのローカル安全ステート
  const [localCode, setLocalCode] = useState('');
  const activeCode = propPremiumCode !== undefined ? propPremiumCode : localCode;
  const onCodeChange = (val: string) => {
    setLocalCode(val);
    if (propSetPremiumCode) propSetPremiumCode(val);
  };

  const isFreeExhausted = typeof remainingCount === 'number' && remainingCount <= 0;

  const LOADING_STEPS = [
    '意匠の着想を練り上げています...',
    '色と柄の調和を整えています...',
    '図案を描き出しています...',
    '割り付けを検証しています...',
    '仕上げの調合を行っています...',
  ];

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10">
      
      {/* タイトルヘッダー */}
      <div className="text-center mb-6 sm:mb-8 p-5 sm:p-8 bg-zinc-950 text-white shadow-inner">
        <h1 className="text-xl sm:text-2xl font-black tracking-widest text-center leading-tight">
          妄想きもの図案帖
        </h1>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-3 leading-relaxed font-medium tracking-wider">
          新潟・十日町デジタル捺染工場直結の図案ツール。<br className="hidden sm:inline" />
          思い描いたモチーフや幾何学文様から、世界にひとつの帯や着物をお誂えできます。
        </p>
      </div>

      {/* モード切替タブ */}
      <div className="flex bg-zinc-50 border border-zinc-200 p-1 mb-6 shadow-sm">
        <button
          type="button"
          onClick={() => setCreationMode('geometric')}
          className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${
            creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          格子・水玉製作所
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('ai')}
          className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${
            creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          AI妄想モード
        </button>
      </div>

      <div className="space-y-6">
        {/* ================= AI妄想モード ================= */}
        {creationMode === 'ai' ? (
          <div className="space-y-5 animate-fade-in">
            {/* モチーフ入力 */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-1">
                01. 図案モチーフ・キーワード
              </label>
              <textarea
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="例：上から見た金魚。赤い金魚と黒出目金。水草。地色は白、ターコイズの流水柄。"
                className="w-full border border-zinc-300 p-3 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none font-medium shadow-sm"
                disabled={loading}
              />
            </div>

            {/* 配色指定 */}
            <div className="pt-2 border-t border-zinc-100">
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                  02. 配色・地色（最大3色）
                </label>
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
                  <span className="text-xs text-zinc-400 italic">指定なし（AIにおまかせ）</span>
                ) : (
                  <>
                    {selectedColors.map((col) => (
                      <span
                        key={col.name}
                        onClick={() => handleColorToggle(col)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border cursor-pointer shadow-sm"
                        style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}
                      >
                        {col.name.split(' ')[0]}
                        <span className="text-[9px] opacity-70">✕</span>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedColors([])}
                      className="text-[10px] text-zinc-400 hover:text-zinc-700 underline ml-1"
                    >
                      リセット
                    </button>
                  </>
                )}
              </div>

              {showColorPalette && (
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner max-h-[180px] overflow-y-auto">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => {
                      const isSelected = selectedColors.some((c) => c.name === col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => handleColorToggle(col)}
                          className={`relative h-10 p-1 flex flex-col justify-end text-left transition-all ${
                            isSelected ? 'ring-2 ring-zinc-950 scale-95 font-black' : 'border border-zinc-200/50 shadow-sm'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        >
                          <span className={`text-[8px] font-bold truncate leading-tight flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {col.name.split(' ')[0]}
                            {isSelected && <span>✓</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ================= 幾何学モード ================= */
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-900 mb-1">柄の種類</label>
                <select
                  value={geoPatternType}
                  onChange={(e) => setGeoPatternType(e.target.value as any)}
                  className="w-full border border-zinc-300 p-2 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
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
                    onChange={(e) => setStripeDir(e.target.value as StripeDirection)}
                    className="w-full border border-zinc-300 p-2 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
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
                    onChange={(e) => setDotLayout(e.target.value as DotLayout)}
                    className="w-full border border-zinc-300 p-2 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm"
                  >
                    <option value="staggered">千鳥（互い違い）</option>
                    <option value="grid">正方格子</option>
                  </select>
                </div>
              )}
            </div>

            {/* スライダー */}
            <div className="space-y-3.5 pt-3 border-t border-zinc-100">
              {geoPatternType === 'dot' && (
                <>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">水玉の大きさ（直径）</span>
                      <span className="text-xs font-black text-zinc-900">{dotRadius * 2}mm</span>
                    </div>
                    <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full accent-zinc-900" />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                      <span className="text-xs font-black text-zinc-900">{gapWidth}mm</span>
                    </div>
                    <input type="range" min="0" max="100" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
                  </div>
                </>
              )}

              {geoPatternType === 'checker' && (
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-zinc-500">市松の大きさ（1マス）</span>
                    <span className="text-xs font-black text-zinc-900">{lineWidth}mm</span>
                  </div>
                  <input type="range" min="1" max="200" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
                </div>
              )}

              {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham') && (
                <>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">線の太さ</span>
                      <span className="text-xs font-black text-zinc-900">{lineWidth}mm</span>
                    </div>
                    <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                      <span className="text-xs font-black text-zinc-900">{gapWidth}mm</span>
                    </div>
                    <input type="range" min="0" max="200" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
                  </div>
                </>
              )}
            </div>

            {/* 配色 */}
            <div className="pt-3 border-t border-zinc-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-900 mb-1">地色</label>
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoBgColor }} />
                    <button
                      type="button"
                      onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')}
                      className={`flex-1 text-[10px] h-7 font-bold border ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
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
                        className={`flex-1 text-[10px] h-7 font-bold border ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
                      >
                        伝統色
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showGeoPaletteFor && (
                <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner max-h-[160px] overflow-y-auto">
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
                        className="relative h-9 p-1 flex flex-col justify-end text-left border border-zinc-300 shadow-sm"
                        style={{ backgroundColor: col.hex }}
                      >
                        <span className={`text-[8px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {col.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 共通設定 ================= */}
        <div className="space-y-6 pt-6 border-t border-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">03. 柄の配置</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: '四方柄', label: '小紋・四方柄（上下なし）' },
                  { id: '飛び柄', label: '飛び柄（余白スッキリ）' },
                  { id: 'お太鼓柄', label: 'お太鼓柄（ワンポイント）' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDensity(item.id)}
                    className={`py-2 px-2.5 text-[11px] font-bold text-left border transition-all ${
                      density === item.id ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">04. 仕立てアイテム</label>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setItemType('hanhaba')}
                  className={`py-2 px-2.5 text-[11px] font-bold text-left border transition-all ${
                    itemType === 'hanhaba' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  半幅帯 (プリント18cm)
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('kyobukuro')}
                  className={`py-2 px-2.5 text-[11px] font-bold text-left border transition-all ${
                    itemType === 'kyobukuro' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  京袋帯 (プリント34cm)
                </button>
                <button
                  type="button"
                  onClick={() => setItemType('kimono')}
                  className={`py-2 px-2.5 text-[11px] font-bold text-left border transition-all ${
                    itemType === 'kimono' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  着物 (反物幅40cm)
                </button>
              </div>
            </div>
          </div>

          {/* 図案銘 */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-1">
              05. 図案銘 <span className="text-[10px] text-zinc-400 font-normal">（作品タイトル）</span>
            </label>
            <input
              type="text"
              value={patternTitle}
              onChange={(e) => setPatternTitle(e.target.value)}
              placeholder="作品タイトル"
              className="w-full border border-zinc-300 p-2.5 bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:bg-white shadow-sm"
              disabled={loading}
            />
          </div>

          {/* ★★★ 3つの生成ボタン（常時縦並び配置・エラー完全遮断） ★★★ */}
          {creationMode === 'ai' && (
            <div className="pt-2 border-t border-zinc-100 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800">
                  生成図案はAIによるアイデアであり、実際の反物・帯制作時には職人が人の目でデータ調整を行うことに同意します。
                </span>
              </label>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">
                  {errorMsg}
                </div>
              )}

              {/* ===== ボタン①：スケッチモード（FLUX枠・常時利用可能） ===== */}
              <div>
                <button
                  type="button"
                  onClick={() => handleGenerate('flux')}
                  disabled={loading}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold text-xs tracking-wider rounded-sm shadow transition-colors flex items-center justify-center gap-2"
                >
                  {loading && loadingEngine === 'flux' ? (
                    <span>{LOADING_STEPS[loadingStep % LOADING_STEPS.length]}</span>
                  ) : (
                    <span>スケッチモードで試す</span>
                  )}
                </button>
              </div>

              {/* ===== ボタン②：丁寧に作るモード（OpenAI無料枠・1日1回限定） ===== */}
              <div>
                <button
                  type="button"
                  onClick={() => handleGenerate('openai_free')}
                  disabled={loading || isFreeExhausted}
                  className={`w-full py-3.5 font-bold text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm rounded-sm ${
                    isFreeExhausted
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                      : 'bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50'
                  }`}
                >
                  {loading && loadingEngine === 'openai' && !activeCode ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span>{LOADING_STEPS[loadingStep % LOADING_STEPS.length]}</span>
                    </div>
                  ) : (
                    <span>
                      {isFreeExhausted
                        ? '本日の無料枠は終了しました'
                        : '丁寧に作るモードで試す (本日無料 1回)'}
                    </span>
                  )}
                </button>
              </div>

              {/* ===== ボタン③：チケットコードで丁寧に作る（チケット枠・常時配置） ===== */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-zinc-800">
                    チケットコード利用
                  </span>
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
                    value={activeCode}
                    onChange={(e) => onCodeChange(e.target.value)}
                    placeholder="チケットコードを入力"
                    className="flex-1 border border-zinc-300 p-2 text-xs bg-white font-mono rounded-sm focus:border-zinc-900 focus:outline-none"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => handleGenerate('openai_premium')}
                    disabled={loading || !(activeCode && activeCode.trim())}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs font-bold rounded-sm shadow transition-colors whitespace-nowrap"
                  >
                    {loading && loadingEngine === 'openai' && activeCode ? '生成中...' : 'チケットコードで丁寧に作る'}
                  </button>
                </div>
                {premiumStatusMsg && <p className="text-[10px] text-green-700 font-bold">{premiumStatusMsg}</p>}
              </div>
            </div>
          )}
        </div>

        {/* 保存・注文アクション */}
        {imageUrl && (
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="py-3 text-center border border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold tracking-widest transition-all shadow-sm"
              >
                平面データ(原寸)を保存
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`「妄想きもの図案帖」で図案を作りました！\n銘：『${patternTitle}』\n#妄想きもの図案帖`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 text-center bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs font-bold tracking-widest transition-colors shadow-sm"
              >
                Xでシェア
              </a>
            </div>

            <a
              href="#"
              onClick={handleOrderClick}
              className="block w-full py-4 text-center bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold tracking-widest uppercase transition-all shadow-md hover:shadow-lg"
            >
              この図案でお誂えを申し込む
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
