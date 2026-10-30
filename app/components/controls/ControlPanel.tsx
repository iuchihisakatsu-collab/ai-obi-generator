// components/controls/ControlPanel.tsx
'use client';

import AiControls from './AiControls';
import GeometricControls from './GeometricControls';
import GenerateButtons from './GenerateButtons';
import ResultSharePanel from './ResultSharePanel';

export default function ControlPanel(props: any) {
  const {
    creationMode = 'ai',
    setCreationMode = () => {},
    imageUrl,
    motif = '',
  } = props;

  const primaryMotif = motif.split(/[、, ]/)[0] || '';

  const switchToGeometric = () => {
    setCreationMode('geometric');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col bg-white border border-zinc-200 shadow-sm p-4 sm:p-8 lg:p-10 transition-all">
      <div className="space-y-8">
        
        {/* モード切り替えタブ */}
        <div className="flex border-b border-zinc-200 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 bg-zinc-50/50">
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
            AI意匠製作所
          </button>
        </div>

        {/* 1. 設定パネル（AI or 幾何学） */}
        {creationMode === 'ai' ? (
          <AiControls {...props} />
        ) : (
          <GeometricControls {...props} />
        )}

        {/* 2. AI生成ボタン群 */}
        {creationMode === 'ai' && (
          <GenerateButtons {...props} switchToGeometric={switchToGeometric} />
        )}

        {/* 3. 作品完成・SNSシェア・注文エリア */}
        {imageUrl && (
          <ResultSharePanel
            {...props}
            primaryMotif={primaryMotif}
          />
        )}
      </div>
    </div>
  );
}
