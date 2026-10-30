// components/controls/GeometricControls.tsx
'use client';

import { StripeDirection, DotLayout } from '../../utils/geometricPatterns';

interface GeometricControlsProps {
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: (val: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir: StripeDirection;
  setStripeDir: (val: StripeDirection) => void;
  dotLayout: DotLayout;
  setDotLayout: (val: DotLayout) => void;
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
}

export default function GeometricControls({
  geoPatternType,
  setGeoPatternType,
  stripeDir,
  setStripeDir,
  dotLayout,
  setDotLayout,
  dotRadius,
  setDotRadius,
  gapWidth,
  setGapWidth,
  lineWidth,
  setLineWidth,
  geoBgColor,
  setGeoBgColor,
  geoPatternColor,
  setGeoPatternColor,
}: GeometricControlsProps) {
  return (
    <div className="space-y-6">
      {/* 種別 */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-900 tracking-wider">幾何学パターン種別</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: 'plain', label: '無地' },
            { id: 'stripe', label: '縞 (ストライプ)' },
            { id: 'dot', label: '水玉 (ドット)' },
            { id: 'grid', label: '格子 (方眼)' },
            { id: 'gingham', label: '吟風 (ギンガム)' },
            { id: 'checker', label: '市松 (チェッカー)' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGeoPatternType(item.id as any)}
              className={`py-2 px-1 text-center text-xs font-bold border rounded transition-all ${
                geoPatternType === item.id ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 配色 */}
      <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-50 border border-zinc-200 rounded">
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-zinc-700">地色（背景）</label>
          <div className="flex items-center gap-2">
            <input type="color" value={geoBgColor} onChange={(e) => setGeoBgColor(e.target.value)} className="w-8 h-8 rounded border border-zinc-300 cursor-pointer" />
            <span className="text-xs font-mono font-bold text-zinc-600">{geoBgColor}</span>
          </div>
        </div>
        {geoPatternType !== 'plain' && (
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-zinc-700">柄色</label>
            <div className="flex items-center gap-2">
              <input type="color" value={geoPatternColor} onChange={(e) => setGeoPatternColor(e.target.value)} className="w-8 h-8 rounded border border-zinc-300 cursor-pointer" />
              <span className="text-xs font-mono font-bold text-zinc-600">{geoPatternColor}</span>
            </div>
          </div>
        )}
      </div>

      {/* スライダー */}
      {geoPatternType === 'stripe' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {[
              { id: 'vertical', label: '縦縞' },
              { id: 'horizontal', label: '横縞' },
              { id: 'diagonal', label: '斜め縞' }
            ].map((dir) => (
              <button
                key={dir.id}
                type="button"
                onClick={() => setStripeDir(dir.id as any)}
                className={`flex-1 py-1.5 text-xs font-bold border rounded ${stripeDir === dir.id ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-600'}`}
              >
                {dir.label}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-600"><span>線の太さ</span><span>{lineWidth}mm</span></div>
            <input type="range" min={1} max={50} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-600"><span>間隔</span><span>{gapWidth}mm</span></div>
            <input type="range" min={1} max={100} value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
          </div>
        </div>
      )}

      {geoPatternType === 'dot' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            {[
              { id: 'staggered', label: '千鳥配置 (斜め交互)' },
              { id: 'grid', label: '碁盤配置 (整列)' }
            ].map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => setDotLayout(layout.id as any)}
                className={`flex-1 py-1.5 text-xs font-bold border rounded ${dotLayout === layout.id ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-600'}`}
              >
                {layout.label}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-600"><span>水玉の大きさ</span><span>{dotRadius * 2}mm</span></div>
            <input type="range" min={2} max={50} value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full accent-zinc-900" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-zinc-600"><span>間隔</span><span>{gapWidth}mm</span></div>
            <input type="range" min={5} max={100} value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full accent-zinc-900" />
          </div>
        </div>
      )}
    </div>
  );
}
