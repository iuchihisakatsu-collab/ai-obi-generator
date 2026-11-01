'use client';

import React, { useState } from 'react';
import { TRADITIONAL_COLORS, FORBIDDEN_WORDS } from '../../lib/constants';
import { StripeDirection, DotLayout } from '../../utils/geometricPatterns';

export interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: (mode: 'ai' | 'geometric') => void;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  setItemType: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  aiStyle: string;
  setAiStyle: (style: string) => void;
  selectedArtist: string;
  setSelectedArtist: (artist: string) => void;
  motif: string;
  setMotif: (motif: string) => void;
  motif2: string;
  setMotif2: (motif: string) => void;
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: (colors: typeof TRADITIONAL_COLORS) => void;
  handleColorToggle: (color: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: (show: boolean) => void;
  density: string;
  setDensity: (density: string) => void;
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: (type: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir: StripeDirection;
  setStripeDir: (dir: StripeDirection) => void;
  dotLayout: DotLayout;
  setDotLayout: (layout: DotLayout) => void;
  dotRadius: number;
  setDotRadius: (r: number) => void;
  gapWidth: number;
  setGapWidth: (w: number) => void;
  lineWidth: number;
  setLineWidth: (w: number) => void;
  geoBgColor: string;
  setGeoBgColor: (c: string) => void;
  geoPatternColor: string;
  setGeoPatternColor: (c: string) => void;
  showGeoPaletteFor: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor: (target: 'bg' | 'pattern' | null) => void;
  obiLiningColor: string;
  setObiLiningColor: (c: string) => void;
  kimonoHaneriColor: string;
  setKimonoHaneriColor: (c: string) => void;
  kimonoObiageColor: string;
  setKimonoObiageColor: (c: string) => void;
  kimonoObiColor: string;
  setKimonoObiColor: (c: string) => void;
  customObiUrl: string | null;
  setCustomObiUrl: (url: string | null) => void;
  handleCustomObiUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  agreed: boolean;
  setAgreed: (agreed: boolean) => void;
  errorMsg: string;
  loading: boolean;
  loadingEngine: 'flux' | 'openai' | null;
  remainingCount: number;
  loadingStep: number;
  handleGenerate: () => void;
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: (title: string) => void;
  serialNumber: string;
  handleDownloadOriginal: () => void;
  handleOrderClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  selectedEngine: 'flux' | 'openai_free' | 'openai_premium';
  setSelectedEngine: (engine: 'flux' | 'openai_free' | 'openai_premium') => void;
  premiumCode: string;
  setPremiumCode: (code: string) => void;
  premiumStatusMsg: string;
}

export default function ControlPanel(props: ControlPanelProps) {
  const {
    creationMode, setCreationMode,
    itemType, setItemType,
    aiStyle, setAiStyle,
    selectedArtist, setSelectedArtist,
    motif, setMotif,
    motif2, setMotif2,
    selectedColors, setSelectedColors, handleColorToggle,
    showColorPalette, setShowColorPalette,
    density, setDensity,
    geoPatternType, setGeoPatternType,
    stripeDir, setStripeDir,
    dotLayout, setDotLayout,
    dotRadius, setDotRadius,
    gapWidth, setGapWidth,
    lineWidth, setLineWidth,
    geoBgColor, setGeoBgColor,
    geoPatternColor, setGeoPatternColor,
    showGeoPaletteFor, setShowGeoPaletteFor,
    obiLiningColor, setObiLiningColor,
    kimonoHaneriColor, setKimonoHaneriColor,
    kimonoObiageColor, setKimonoObiageColor,
    kimonoObiColor, setKimonoObiColor,
    customObiUrl, setCustomObiUrl,
    handleCustomObiUpload,
    agreed, setAgreed,
    errorMsg,
    loading, loadingEngine,
    remainingCount, loadingStep,
    handleGenerate,
    imageUrl,
    patternTitle, setPatternTitle,
    serialNumber,
    handleDownloadOriginal,
    handleOrderClick,
    selectedEngine, setSelectedEngine,
    premiumCode, setPremiumCode,
    premiumStatusMsg,
  } = props;

  const [showHaneriPalette, setShowHaneriPalette] = useState(false);
  const [showObiagePalette, setShowObiagePalette] = useState(false);
  const [showKimonoObiPalette, setShowKimonoObiPalette] = useState(false);
  const [showLiningPalette, setShowLiningPalette] = useState(false);

  const LOADING_STEPS = [
    '意匠の着想を練り上げています...',
    '色と柄の調和を整えています...',
    '図案の筆致を描き出しています...',
    '反物の割り付けを検証しています...',
    '仕上げの調合を行っています...',
  ];

  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10">
      
      {/* ヘッダータイトル */}
      <div className="text-center mb-6 sm:mb-8 p-5 sm:p-8 bg-zinc-950 text-white shadow-inner">
        <h1 className="text-xl sm:text-2xl font-black tracking-widest text-center leading-tight">
          妄想きもの図案帖
        </h1>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-3 leading-relaxed font-medium tracking-wider">
          新潟・十日町の染織美学と最先端のデジタル技術を融合。<br className="hidden sm:inline" />
          思い描いた着物・帯の図案をスマホで試作し、実物のお誂えへ繋げるアトリエツールです。
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
        {/* ================= AI妄想モードの設定 ================= */}
        {creationMode === 'ai' ? (
          <div className="space-y-5 animate-fade-in">
            {/* エンジン・チケット選択 */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 space-y-2">
              <label className="block text-[11px] font-bold text-zinc-800 tracking-wider">生成エンジン仕様</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEngine('flux')}
                  className={`py-2 px-2 text-[10px] font-bold border transition-all ${
                    selectedEngine === 'flux' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300'
                  }`}
                >
                  標準スケッチ（無料）
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEngine('openai_premium')}
                  className={`py-2 px-2 text-[10px] font-bold border transition-all ${
                    selectedEngine === 'openai_premium' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300'
                  }`}
                >
                  高精度チケット（有料枠）
                </button>
              </div>

              {selectedEngine === 'openai_premium' && (
                <div className="pt-2 border-t border-zinc-200 space-y-1.5 animate-fade-in">
                  <span className="text-[10px] text-zinc-600 block">ご購入時のチケットコードを入力してください：</span>
                  <input
                    type="text"
                    value={premiumCode}
                    onChange={(e) => setPremiumCode(e.target.value)}
                    placeholder="例: TICKET-XXXX-XXXX"
                    className="w-full border border-zinc-300 p-2 text-xs bg-white font-mono"
                  />
                  {premiumStatusMsg && <p className="text-[10px] text-green-700 font-bold">{premiumStatusMsg}</p>}
                </div>
              )}
            </div>

            {/* モチーフ入力 */}
            <div>
              <label className="block text-xs font-bold text-zinc-900 tracking-wider mb-1">
                01. 図案モチーフ・キーワード
              </label>
              <textarea
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="例：上から見た金魚。赤い金魚と黒出目金。水草。地色は白、ターコイズの流水柄。版画・切り絵風"
                className="w-full border border-zinc-300 p-3 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none font-medium shadow-sm"
                disabled={loading}
              />
            </div>

            {/* 伝統色パレット */}
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
          /* ================= 幾何学モードの設定 ================= */
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

            {/* スライダー群 */}
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

            {/* 配色指定 */}
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

        {/* ================= 共通設定（配置・仕立て・コーディネート） ================= */}
        <div className="space-y-6 pt-6 border-t border-zinc-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 03. 柄の配置 */}
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

            {/* 04. 仕立てアイテム */}
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

          {/* ★★★ 抜け落ちていた着物コーディネート選択ブロック ★★★ */}
          {itemType === 'kimono' ? (
            <div className="pt-4 border-t border-zinc-200 space-y-4 animate-fade-in bg-zinc-50 p-4 border border-zinc-200">
              <p className="text-xs font-bold text-zinc-900 tracking-wider border-b border-zinc-200 pb-2">
                着物コーディネート設定（プレビュー着せ替え）
              </p>

              {/* 半衿の色選択 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-700">半衿の色：</label>
                  <button
                    type="button"
                    onClick={() => setShowHaneriPalette(!showHaneriPalette)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-900 font-bold"
                  >
                    {showHaneriPalette ? '閉じる' : '伝統色から選ぶ'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoHaneriColor }} />
                  <span className="text-xs font-mono text-zinc-600">
                    {TRADITIONAL_COLORS.find((c) => c.hex.toLowerCase() === kimonoHaneriColor.toLowerCase())?.name || kimonoHaneriColor}
                  </span>
                </div>

                {showHaneriPalette && (
                  <div className="mt-2 p-2 bg-white border border-zinc-200 max-h-[140px] overflow-y-auto shadow-inner">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {TRADITIONAL_COLORS.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => {
                            setKimonoHaneriColor(col.hex);
                            setShowHaneriPalette(false);
                          }}
                          className="relative h-8 p-1 flex flex-col justify-end text-left border border-zinc-200 shadow-sm"
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

              {/* 帯揚の色選択 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-700">帯揚の色：</label>
                  <button
                    type="button"
                    onClick={() => setShowObiagePalette(!showObiagePalette)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-900 font-bold"
                  >
                    {showObiagePalette ? '閉じる' : '伝統色から選ぶ'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoObiageColor }} />
                  <span className="text-xs font-mono text-zinc-600">
                    {TRADITIONAL_COLORS.find((c) => c.hex.toLowerCase() === kimonoObiageColor.toLowerCase())?.name || kimonoObiageColor}
                  </span>
                </div>

                {showObiagePalette && (
                  <div className="mt-2 p-2 bg-white border border-zinc-200 max-h-[140px] overflow-y-auto shadow-inner">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                      {TRADITIONAL_COLORS.map((col) => (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => {
                            setKimonoObiageColor(col.hex);
                            setShowObiagePalette(false);
                          }}
                          className="relative h-8 p-1 flex flex-col justify-end text-left border border-zinc-200 shadow-sm"
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

              {/* 帯の指定（伝統色 or 手持ち画像アップロード） */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-700">帯のコーディネート：</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCustomObiUrl(null)}
                      className={`px-2 py-0.5 text-[10px] font-bold border transition-all ${
                        !customObiUrl ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300'
                      }`}
                    >
                      伝統色無地
                    </button>
                    <label className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer transition-all ${
                      customObiUrl ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300'
                    }`}>
                      画像アップロード
                      <input type="file" accept="image/*" onChange={handleCustomObiUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {!customObiUrl ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoObiColor }} />
                      <button
                        type="button"
                        onClick={() => setShowKimonoObiPalette(!showKimonoObiPalette)}
                        className="px-2.5 py-1 text-[11px] font-bold border border-zinc-300 bg-white hover:bg-zinc-50"
                      >
                        {showKimonoObiPalette ? 'パレットを閉じる' : '帯の色を変更'}
                      </button>
                      <span className="text-xs font-mono text-zinc-600">
                        {TRADITIONAL_COLORS.find((c) => c.hex.toLowerCase() === kimonoObiColor.toLowerCase())?.name || kimonoObiColor}
                      </span>
                    </div>

                    {showKimonoObiPalette && (
                      <div className="mt-2 p-2 bg-white border border-zinc-200 max-h-[140px] overflow-y-auto shadow-inner">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {TRADITIONAL_COLORS.map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => {
                                setKimonoObiColor(col.hex);
                                setShowKimonoObiPalette(false);
                              }}
                              className="relative h-8 p-1 flex flex-col justify-end text-left border border-zinc-200 shadow-sm"
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
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-white border border-zinc-200">
                    <span className="text-[11px] text-green-700 font-bold">✓ カスタム帯画像を適用中</span>
                    <button
                      type="button"
                      onClick={() => setCustomObiUrl(null)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-700 underline"
                    >
                      解除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 帯仕立て時の裏地色指定 */
            <div className="pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-zinc-700 whitespace-nowrap">帯の裏地色：</label>
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="w-7 h-7 border border-zinc-300 shadow-inner" style={{ backgroundColor: obiLiningColor }} />
                  <button
                    type="button"
                    onClick={() => setShowLiningPalette(!showLiningPalette)}
                    className={`flex-1 text-[10px] h-7 font-bold border ${showLiningPalette ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
                  >
                    伝統色から選ぶ
                  </button>
                </div>
              </div>

              {showLiningPalette && (
                <div className="mt-2 p-2.5 bg-zinc-50 border border-zinc-200 max-h-[140px] overflow-y-auto shadow-inner">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {TRADITIONAL_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => {
                          setObiLiningColor(col.hex);
                          setShowLiningPalette(false);
                        }}
                        className="relative h-8 p-1 flex flex-col justify-end text-left border border-zinc-300 shadow-sm"
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
          )}

          {/* 05. 図案銘 */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-1">
              05. 図案銘 <span className="text-[10px] text-zinc-400 font-normal">（作品タイトル）</span>
            </label>
            <input
              type="text"
              value={patternTitle}
              onChange={(e) => setPatternTitle(e.target.value)}
              placeholder="例：遊泳金魚図"
              className="w-full border border-zinc-300 p-2.5 bg-zinc-50 text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:bg-white shadow-sm"
              disabled={loading}
            />
          </div>

          {/* 生成実行ボタン */}
          {creationMode === 'ai' && (
            <div className="pt-2 border-t border-zinc-100">
              <label className="flex items-start gap-2.5 cursor-pointer select-none mb-4 group">
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
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || (selectedEngine !== 'openai_premium' && remainingCount <= 0)}
                className={`w-full py-3.5 sm:py-4 font-black text-xs sm:text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-md ${
                  (selectedEngine !== 'openai_premium' && remainingCount <= 0)
                    ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                    : 'bg-zinc-950 text-white hover:bg-zinc-800 shadow-md disabled:opacity-50'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-1">
                    <span>{LOADING_STEPS[loadingStep]}</span>
                    <span className="text-[8px] text-zinc-400">PROCESSING...</span>
                  </div>
                ) : (
                  <span>
                    {selectedEngine === 'openai_premium'
                      ? '高精度チケットで図案を生成'
                      : remainingCount <= 0
                      ? '本日の無料上限に達しました'
                      : `図案を描き出す (残り ${remainingCount} 回)`}
                  </span>
                )}
              </button>
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
