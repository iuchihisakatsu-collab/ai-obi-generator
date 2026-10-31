// components/controls/ControlPanel.tsx
'use client';

import { Dispatch, SetStateAction, MouseEvent } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

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
  aiStyle, setAiStyle,
  selectedArtist, setSelectedArtist,
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
  obiLiningColor, setObiLiningColor,
  kimonoHaneriColor, setKimonoHaneriColor,
  kimonoObiageColor, setKimonoObiageColor,
  kimonoObiColor, setKimonoObiColor,
  customObiUrl, setCustomObiUrl, handleCustomObiUpload,
  agreed, setAgreed, errorMsg,
  loading, loadingEngine, remainingCount, loadingStep,
  handleGenerate, imageUrl, patternTitle, setPatternTitle,
  serialNumber, handleDownloadOriginal, handleOrderClick,
  selectedEngine, setSelectedEngine,
  premiumCode, setPremiumCode, premiumStatusMsg
}: ControlPanelProps) {
  return (
    <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-6 lg:p-8 shrink-0 shadow-sm z-10 flex flex-col gap-6">
      
      {/* モード切替タブ */}
      <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200">
        <button
          type="button"
          onClick={() => setCreationMode('geometric')}
          className={`flex-1 py-2 text-xs font-black tracking-wider transition-all rounded-sm ${
            creationMode === 'geometric' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          幾何学文様 (使い放題)
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('ai')}
          className={`flex-1 py-2 text-xs font-black tracking-wider transition-all rounded-sm ${
            creationMode === 'ai' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          AI妄想モード
        </button>
      </div>

      {/* AIモード */}
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
              className="w-full border border-zinc-300 p-3 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 resize-none rounded-sm"
              rows={2}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="例：上から見た金魚、朝顔、幾何学模様など"
              disabled={loading}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100">
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">画風・スタイル</label>
              <select
                value={aiStyle}
                onChange={(e) => setAiStyle(e.target.value)}
                className="w-full border border-zinc-300 p-2 text-xs bg-white focus:outline-none focus:border-zinc-900 rounded-sm"
              >
                <option value="none">指定なし（標準）</option>
                <option value="watercolor">水彩画・淡彩</option>
                <option value="woodblock">版画・切り絵風</option>
                <option value="oil">油絵・マティエール</option>
                <option value="lineart">線画・ペン画</option>
                <option value="yuzen">友禅染・型染め風</option>
                <option value="retro">大正ロマン・レトロ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">作家・様式</label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full border border-zinc-300 p-2 text-xs bg-white focus:outline-none focus:border-zinc-900 rounded-sm"
              >
                <option value="none">指定なし</option>
                <option value="rimpa">琳派（光琳・抱一風）</option>
                <option value="morris">ウィリアム・モリス風</option>
                <option value="mucha">ミュシャ風</option>
                <option value="midcentury">ミッドセンチュリー</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <div className="flex justify-between items-baseline mb-2">
              <label className="block text-xs font-bold text-zinc-900">02. 配色（最大3色まで）</label>
              <button
                type="button"
                onClick={() => setShowColorPalette(!showColorPalette)}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-bold"
              >
                {showColorPalette ? '閉じる' : '色見本から選ぶ'}
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
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold border cursor-pointer rounded-sm"
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
              <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-sm">
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

          {/* ★ 3段構えの生成エンジン選択 ＆ プレミアムコード入力欄 */}
          <div className="pt-4 border-t border-zinc-200 space-y-3">
            <label className="block text-xs font-bold text-zinc-900 tracking-wider">03. どのAIで描く？（生成エンジンの選択）</label>
            <div className="grid grid-cols-1 gap-2">
              
              {/* 1. FLUX (無料・アイデア出し用) */}
              <label className={`relative flex cursor-pointer rounded-sm border p-3 shadow-sm transition-all ${selectedEngine === 'flux' ? 'border-zinc-900 bg-zinc-900 text-white ring-1 ring-zinc-900' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
                <input type="radio" name="engine" value="flux" className="sr-only" checked={selectedEngine === 'flux'} onChange={() => setSelectedEngine('flux')} />
                <div className="flex w-full items-center justify-between">
                  <div className="text-xs sm:text-sm font-black">【無料】アイデア出し用（FLUX）</div>
                  <div className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded">残り: {remainingCount}回</div>
                </div>
              </label>

              {/* 2. OpenAI (無料お試し・1日1回) */}
              <label className={`relative flex cursor-pointer rounded-sm border p-3 shadow-sm transition-all ${selectedEngine === 'openai_free' ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
                <input type="radio" name="engine" value="openai_free" className="sr-only" checked={selectedEngine === 'openai_free'} onChange={() => setSelectedEngine('openai_free')} />
                <div className="flex w-full items-center justify-between">
                  <div className="text-xs sm:text-sm font-black">【無料お試し】本気の1枚（最高品質）</div>
                  <div className="text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">1日1回</div>
                </div>
              </label>

              {/* 3. OpenAI (プレミアムチケット利用) */}
              <label className={`relative flex flex-col cursor-pointer rounded-sm border p-3 shadow-sm transition-all ${selectedEngine === 'openai_premium' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
                <div className="flex w-full items-center justify-between">
                  <input type="radio" name="engine" value="openai_premium" className="sr-only" checked={selectedEngine === 'openai_premium'} onChange={() => setSelectedEngine('openai_premium')} />
                  <div className="text-xs sm:text-sm font-black">【チケット利用】究極のこだわり（最高品質）</div>
                  <div className="text-[10px] sm:text-xs font-bold text-indigo-700">実物購入で還元</div>
                </div>
                
                {selectedEngine === 'openai_premium' && (
                  <div className="mt-2.5 pt-2.5 border-t border-indigo-200 animate-fade-in">
                    <p className="text-[10px] mb-1.5 text-indigo-800 font-medium">発行されたプレミアムコード（GFK-...）を入力：</p>
                    <input 
                      type="text" 
                      placeholder="例: GFK-7338-MWX5" 
                      value={premiumCode}
                      onChange={(e) => setPremiumCode(e.target.value)}
                      className="w-full px-3 py-1.5 border border-indigo-300 rounded-sm text-xs bg-white text-indigo-950 uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* 幾何学モード */
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-900 mb-1">文様の種類</label>
              <select
                value={geoPatternType}
                onChange={(e) => setGeoPatternType(e.target.value as any)}
                className="w-full border border-zinc-300 p-2 text-xs bg-white rounded-sm focus:outline-none focus:border-zinc-900"
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
                  className="w-full border border-zinc-300 p-2 text-xs bg-white rounded-sm focus:outline-none focus:border-zinc-900"
                >
                  <option value="vertical">縦縞</option>
                  <option value="horizontal">横縞</option>
                  <option value="diagonal">斜め縞</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-zinc-100 space-y-3">
            <label className="block text-xs font-bold text-zinc-900">サイズ調整（mm実寸連動）</label>
            {geoPatternType === 'dot' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>水玉の直径</span>
                  <span className="font-bold">{dotRadius * 2}mm</span>
                </div>
                <input type="range" min="2" max="60" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full accent-zinc-900" />
              </div>
            )}
            {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham' || geoPatternType === 'checker') && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>線の太さ／マス目</span>
                  <span className="font-bold">{lineWidth}mm</span>
                </div>
                <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* タイトルと生成ボタン */}
      <div className="pt-4 border-t border-zinc-200 space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-900 mb-1">図案銘（作品タイトル）</label>
          <input
            type="text"
            className="w-full border border-zinc-300 p-2.5 text-xs bg-zinc-50 rounded-sm focus:bg-white focus:outline-none focus:border-zinc-900"
            placeholder="例：春陽の風車"
            value={patternTitle}
            onChange={(e) => setPatternTitle(e.target.value)}
          />
        </div>

        {creationMode === 'ai' && (
          <div className="space-y-3">
            <label className="flex items-start gap-2 cursor-pointer text-[10px] text-zinc-500">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              <span>生成図案はAIによるアイデアであり、生地制作時は職人の手で調整が行われることに同意します。</span>
            </label>

            {errorMsg && <div className="p-2.5 bg-red-50 text-red-600 text-xs font-bold border border-red-200">{errorMsg}</div>}
            {premiumStatusMsg && <div className="p-2.5 bg-green-50 text-green-700 text-xs font-bold border border-green-200">{premiumStatusMsg}</div>}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || (selectedEngine !== 'openai_premium' && remainingCount <= 0)}
              className="w-full py-3.5 bg-zinc-950 text-white font-black text-xs sm:text-sm tracking-widest rounded-sm hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? 'AIが図案帳に描き出しています...' : (
                selectedEngine === 'openai_premium' 
                  ? 'プレミアムチケットを消費して描く' 
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
              className="w-full py-2.5 border border-zinc-900 text-xs font-bold tracking-wider hover:bg-zinc-50 transition-colors"
            >
              高解像度プリントデータを保存
            </button>
            <a
              href="#"
              onClick={handleOrderClick}
              className="block w-full py-3 bg-zinc-900 text-white text-center text-xs font-black tracking-widest hover:bg-zinc-800 transition-colors shadow"
            >
              この図案でお誂えを申し込む
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
