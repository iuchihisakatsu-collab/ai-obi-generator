// components/controls/AiControls.tsx
'use client';

import { TRADITIONAL_COLORS } from '../../lib/constants';

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
  { group: '伝統・古典の吉祥文様', items: ['辻が花（幻の花）', '宝尽くし（打出の小槌・隠れ蓑）', '乱菊（咲き乱れる大輪）', '有職唐草（途切れぬ繁栄）', '雲取りに波頭（雄大）', '雪輪に四季草花', '源氏香に桜散らし', '南蛮渡来の異国更紗'] },
  { group: '季節を彩る草花・自然', items: ['夜桜と花筏', '水辺の八橋に杜若', '深緑の竹林と笹鳴り', '雪中南天（難を転ずる）', '満月に跳ね兎と薄', '宵闇に浮かぶ鬼灯', '雨煙る紫陽花', '初秋の萩と撫子'] },
  { group: '粋・モダン・遊び心', items: ['飛び交う千鳥と波', '蝙蝠（福を呼ぶ吉祥蝙蝠）', '歌舞伎の隈取尽くし', '寄り添う黒猫と足跡', 'アンティーク万華鏡', '切子ガラスの幾何学光彩', '大正浪漫のステンドグラス', '星座と銀河の天体図'] },
  { group: '昭和ノスタルジー・純喫茶', items: ['純喫茶のプリンアラモードと珈琲', 'クリームソーダとさくらんぼ', 'レトロタイルのモザイク舗道', 'ネオンサインとミッドナイト', '蓄音機と踊る音符', '真夜中のシネマとフィルム'] },
  { group: '生き物・動物たち', items: ['跳躍する錦鯉と水紋', '戯れる子犬（円山応挙風）', '威風堂々たる白虎', '森の梟と三日月', '優雅に泳ぐ金魚尽くし', '蝶の乱舞と標本箱'] },
];

interface AiControlsProps {
  aiStyle: string;
  setAiStyle: (val: string) => void;
  motif: string;
  setMotif: (val: string) => void;
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: (colors: typeof TRADITIONAL_COLORS) => void;
  handleColorToggle: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: (val: boolean) => void;
  density: string;
  setDensity: (val: string) => void;
  loading: boolean;
}

export default function AiControls({
  aiStyle,
  setAiStyle,
  motif,
  setMotif,
  selectedColors,
  setSelectedColors,
  handleColorToggle,
  showColorPalette,
  setShowColorPalette,
  density,
  setDensity,
  loading,
}: AiControlsProps) {
  return (
    <div className="space-y-6">
      {/* 1. スタイル */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-zinc-900 tracking-wider">1. 意匠の作風（スタイル）</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AI_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setAiStyle(style.id)}
              className={`p-2.5 text-left border rounded transition-all ${
                aiStyle === style.id
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                  : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800'
              }`}
            >
              <p className="text-xs font-bold leading-tight">{style.label}</p>
              <p className={`text-[10px] mt-0.5 leading-none ${aiStyle === style.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {style.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. モチーフ */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-zinc-900 tracking-wider">2. 描きたいモチーフ</label>
        <input
          type="text"
          className="w-full border border-zinc-300 p-3 text-sm font-bold focus:outline-none focus:border-zinc-900 rounded-sm"
          placeholder="例：黒猫と三日月、金魚、アールデコ幾何学"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          disabled={loading}
        />
        <div className="space-y-2 pt-1">
          <p className="text-[10px] font-bold text-zinc-500 tracking-wider">▼ 定番モチーフ候補から選ぶ</p>
          <div className="space-y-2">
            {PULLDOWN_MOTIFS.map((group, idx) => (
              <div key={idx} className="bg-zinc-50 p-2.5 border border-zinc-100 rounded">
                <p className="text-[10px] font-bold text-zinc-600 mb-1.5">{group.group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setMotif(item)}
                      className="px-2 py-1 bg-white border border-zinc-200 text-zinc-700 text-[10px] font-bold hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors rounded-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 配色 */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <label className="block text-xs font-bold text-zinc-900 tracking-wider">3. 配色の指定（日本の伝統色）</label>
          <button
            type="button"
            onClick={() => setShowColorPalette(!showColorPalette)}
            className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 underline"
          >
            {showColorPalette ? 'パレットを閉じる' : '色を選ぶ'}
          </button>
        </div>

        {selectedColors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center p-2 bg-zinc-50 border border-zinc-200 rounded">
            <span className="text-[10px] font-bold text-zinc-500 mr-1">選択中:</span>
            {selectedColors.map((col: any) => (
              <span key={col.hex} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-white border border-zinc-300 rounded shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block" style={{ backgroundColor: col.hex }} />
                {col.name.split(' ')[0]}
                <button type="button" onClick={() => handleColorToggle(col)} className="text-zinc-400 hover:text-zinc-900 ml-0.5">×</button>
              </span>
            ))}
            <button type="button" onClick={() => setSelectedColors([])} className="text-[10px] text-zinc-400 hover:text-zinc-800 underline ml-auto">全解除</button>
          </div>
        )}

        {showColorPalette && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-zinc-50 border border-zinc-200 max-h-48 overflow-y-auto rounded">
            {TRADITIONAL_COLORS.map((col) => {
              const isSelected = selectedColors.some((c: any) => c.hex === col.hex);
              return (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => handleColorToggle(col)}
                  className={`p-1.5 border flex flex-col items-center gap-1 rounded transition-all ${
                    isSelected ? 'border-zinc-900 bg-white ring-2 ring-zinc-900 shadow-xs' : 'border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: col.hex }} />
                  <span className="text-[9px] font-bold text-zinc-700 leading-none truncate max-w-full">{col.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 密度 */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-900 tracking-wider">4. 柄の密度</label>
        <div className="grid grid-cols-3 gap-2">
          {['すっきり（小柄・余白あり）', '標準（バランス）', 'ぎっしり（総柄・細密）'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDensity(d)}
              className={`py-2 px-1 text-center text-xs font-bold border rounded transition-all ${
                density === d ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
              }`}
            >
              {d.split('（')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
