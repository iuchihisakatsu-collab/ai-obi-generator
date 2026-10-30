// components/controls/GenerateButtons.tsx
'use client';

import { LOADING_STEPS } from '../../lib/constants';

interface GenerateButtonsProps {
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  errorMsg: string;
  loading: boolean;
  loadingEngine: 'flux' | 'openai' | null;
  loadingStep: number;
  remainingFlux: number;
  remainingOpenAI: number;
  handleGenerate: (engine: 'flux' | 'openai') => void;
  switchToGeometric: () => void;
}

export default function GenerateButtons({
  agreed,
  setAgreed,
  errorMsg,
  loading,
  loadingEngine,
  loadingStep,
  remainingFlux,
  remainingOpenAI,
  handleGenerate,
  switchToGeometric,
}: GenerateButtonsProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-zinc-200">
      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 accent-zinc-900 rounded"
        />
        利用規約および著作権ポリシーに同意する
      </label>

      {errorMsg && <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">{errorMsg}</div>}

      {/* ボタン1：falエンジン */}
      <button 
        type="button" 
        onClick={() => handleGenerate('flux')} 
        disabled={loading || remainingFlux === 0 || !agreed} 
        className={`w-full py-4 px-4 font-black text-xs sm:text-sm tracking-widest transition-all duration-200 flex flex-col items-center justify-center gap-1 shadow-md relative z-10 ${
          remainingFlux === 0 || !agreed
            ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' 
            : 'bg-zinc-900 text-white hover:bg-black hover:shadow-lg disabled:opacity-50'
        }`}
      >
        {loading && loadingEngine === 'flux' ? (
          <span className="text-xs">fal エンジンで生成中...</span>
        ) : (
          <span>fal エンジンで試す (残り {remainingFlux} 回)</span>
        )}
      </button>

      {/* ボタン2：OpenAIエンジン */}
      <button 
        type="button" 
        onClick={() => handleGenerate('openai')} 
        disabled={loading || remainingOpenAI === 0 || !agreed} 
        className={`w-full py-4 px-4 font-black text-xs sm:text-sm tracking-widest transition-all duration-200 flex flex-col items-center justify-center gap-1 border relative z-10 ${
          remainingOpenAI === 0 || !agreed
            ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed' 
            : 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100 hover:shadow-md disabled:opacity-50'
        }`}
      >
        {loading && loadingEngine === 'openai' ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs">{LOADING_STEPS[loadingStep]}</span>
          </div>
        ) : (
          <span>OpenAI エンジンで試す (残り {remainingOpenAI} 回)</span>
        )}
      </button>

      {remainingFlux === 0 && remainingOpenAI === 0 && (
        <div className="p-4 bg-zinc-100 border border-zinc-200 shadow-inner rounded-sm text-center animate-fade-in mt-4">
          <p className="text-[11px] font-bold text-zinc-700 mb-2 leading-relaxed">本日のAIエンジン利用枠は終了しました。</p>
          <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed px-2">「格子・水玉製作所」なら何度でも無制限でお楽しみいただけます。</p>
          <button
            type="button"
            onClick={switchToGeometric}
            className="w-full py-2.5 text-center bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-zinc-900 text-[11px] font-black tracking-wider transition-colors rounded-xs shadow-sm"
          >
            格子・水玉製作所へ切り替える
          </button>
        </div>
      )}
    </div>
  );
}
