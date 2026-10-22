"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

// 伝統色パレット（102色の一部を代表として定義・実際のデータに合わせて拡張してください）
const TRADITIONAL_COLORS = [
  '墨色', '白磁', '生成り', '漆黒', '紅', '藍色', '瑠璃色', '浅葱色', '萌葱色', '山吹色',
  '桜色', '藤色', '紫苑', '鶯色', '琥珀', '銀鼠', '利休鼠', '鉄紺', '青磁', '臙脂'
];

export default function Home() {
  // --- 状態管理 (State) ---
  const [promptText, setPromptText] = useState('');
  const [selectedPattern, setSelectedPattern] = useState('none');
  const [scale, setScale] = useState('medium');
  const [colors, setColors] = useState<string[]>(['墨色', '白磁']);
  const [density, setDensity] = useState('シームレス総柄');
  const [aspectRatio, setAspectRatio] = useState('正方形 (1:1)');
  const [title, setTitle] = useState('');
  
  // システム用State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsLeft, setGenerationsLeft] = useState(3);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [komonId, setKomonId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showColorPalette, setShowColorPalette] = useState(false);

  // --- 初期化 & 1日3回制限の管理 (ベホイミ対応) ---
  useEffect(() => {
    // ローカルストレージから回数を読み込み
    const stored = localStorage.getItem('komon_generations');
    const today = new Date().toDateString();
    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) {
        setGenerationsLeft(Math.max(0, 3 - count));
      } else {
        localStorage.setItem('komon_generations', JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem('komon_generations', JSON.stringify({ date: today, count: 0 }));
    }
  }, []);

  useEffect(() => {
    // 隠しコマンド（管理者用回数リセット）
    if (promptText.includes('ベホイミ')) {
      setGenerationsLeft(3);
      localStorage.setItem('komon_generations', JSON.stringify({ date: new Date().toDateString(), count: 0 }));
      setPromptText(promptText.replace('ベホイミ', ''));
      alert('【管理者モード】生成回数が3回に全回復しました！');
    }
  }, [promptText]);

  // --- 色の追加/削除ハンドラー ---
  const toggleColor = (color: string) => {
    if (colors.includes(color)) {
      setColors(colors.filter(c => c !== color));
    } else {
      if (colors.length >= 5) {
        alert('配色は最大5色まで選択できます。');
        return;
      }
      setColors([...colors, color]);
    }
  };

  // --- 生成実行関数 (API呼び出し) ---
  const handleGenerate = async () => {
    if (generationsLeft <= 0) {
      alert('本日の生成上限（3回）に達しました。');
      return;
    }
    
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedImageUrl(null);
    setKomonId(null);

    try {
      // route.ts (OpenAI生成 + Vercel Blob保存) へのリクエスト
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          pattern: selectedPattern,
          scale,
          colors,
          density,
          aspectRatio,
          title: title || '無題の図案'
        }),
      });

      if (!response.ok) {
        throw new Error('図案の生成に失敗しました。時間をおいて再度お試しください。');
      }

      const data = await response.json();
      
      // Vercel Blobから返ってきたURLとIDをセット
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setKomonId(data.id || `komon_${Date.now()}`);

        // 回数消費の記録
        const stored = localStorage.getItem('komon_generations');
        const count = stored ? JSON.parse(stored).count : 0;
        localStorage.setItem('komon_generations', JSON.stringify({ 
          date: new Date().toDateString(), 
          count: count + 1 
        }));
        setGenerationsLeft(prev => prev - 1);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- MakeShop お誂えページへの遷移 ---
  const handleOrder = () => {
    if (!komonId || !generatedImageUrl) return;
    // MakeShopのお誂え商品ページへパラメータを渡して遷移
    const baseUrl = "https://store.gofukuyasan.com/shopdetail/000000000001"; // ※実際のMakeShop商品URLに変更してください
    const orderUrl = new URL(baseUrl);
    orderUrl.searchParams.append('komon_id', komonId);
    orderUrl.searchParams.append('title', title || '無題の図案');
    window.open(orderUrl.toString(), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-gray-800 font-sans">
      
      {/* ヘッダーエリア (ディープブラック) */}
      <header className="bg-black text-white text-center py-12 px-4 rounded-b-3xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-4 tracking-widest">妄想小紋図案帖</h1>
        <p className="text-sm text-gray-300 leading-relaxed">
          着物の配色や柄づくりの知識を生かして、<br />
          思いついた柄のアイデアを試せるAI図案ツールです。
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-4 space-y-10">
        
        {/* ==========================================
            01. 図案のイメージ・プロンプト
        ========================================== */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <label className="text-base font-bold text-gray-900">
              01. 図案のイメージ・プロンプト <span className="text-xs font-normal text-gray-500 ml-2">(自由に入力・組み合わせ自由)</span>
            </label>
          </div>

          <div>
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="例: 深海を泳ぐクラゲ、光る幾何学模様、淡い水彩タッチの朝顔..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-[#0080a2] focus:outline-none focus:ring-1 focus:ring-[#0080a2]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 self-center mr-1">よく使う言葉:</span>
            {['北欧風', 'モダン幾何学', '水彩グラデーション', '昭和レトロ小紋', 'ネオンカラー', 'ボタニカル'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setPromptText(prev => prev ? `${prev}、${tag}` : tag)}
                className="text-xs bg-white hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 transition shadow-sm"
              >
                + {tag}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-gray-900 mb-2">ベースの柄形式（下地・骨格）</label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm bg-white focus:border-[#0080a2] focus:outline-none focus:ring-1 focus:ring-[#0080a2]"
            >
              <option value="none">指定なし（プロンプトのみで描画）</option>
              <option value="windowpane">格子（ウィンドウペン）</option>
              <option value="polkadot">水玉（ドット）</option>
              <option value="ichimatsu">市松（チェッカー）</option>
              <option value="stripe">縞（ストライプ）</option>
              <option value="asanoha">麻の葉・幾何学</option>
            </select>

            <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 leading-relaxed shadow-sm">
              {selectedPattern === 'windowpane' && <p>💡 <strong>格子（ウィンドウペン）：</strong>窓枠のようなスッキリとした細い格子です。モダンで洗練された帯・着物におすすめです。</p>}
              {selectedPattern === 'polkadot' && <p>💡 <strong>水玉（ドット）：</strong>シンプルでPOPな丸模様。配色の組み合わせによってレトロにも現代風にも仕上がります。</p>}
              {selectedPattern === 'ichimatsu' && <p>💡 <strong>市松：</strong>四角形が交互に並ぶ伝統柄。コントラストを効かせたモダンな帯に最適です。</p>}
              {selectedPattern === 'stripe' && <p>💡 <strong>縞：</strong>縦または横の直線で構成されるスタイリッシュな柄です。</p>}
              {selectedPattern === 'asanoha' && <p>💡 <strong>麻の葉・幾何学：</strong>伝統的な和モダンの六角形幾何パターンです。</p>}
              {selectedPattern === 'none' && <p>💡 <strong>指定なし：</strong>上のテキスト入力欄に入力した言葉のモチーフを全面に活かして柄を構成します。</p>}
            </div>
          </div>

          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <label className="block text-sm font-bold text-gray-900 mb-3">柄の大きさ (スケール)</label>
            <div className="flex gap-6">
              {[
                { id: 'small', label: '小（細線・密集）' },
                { id: 'medium', label: '中（標準）' },
                { id: 'large', label: '大（太線・大柄）' }
              ].map(item => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="scale" 
                    value={item.id}
                    checked={scale === item.id}
                    onChange={(e) => setScale(e.target.value)}
                    className="text-[#0080a2] focus:ring-[#0080a2]"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* ==========================================
            02. 配色・地色
        ========================================== */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <label className="text-base font-bold text-gray-900">
              02. 配色・地色 <span className="text-xs font-normal text-gray-500 ml-2">(迷ったら選択 / 複数OK)</span>
            </label>
            <button 
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="text-xs text-gray-600 hover:text-black font-bold"
            >
              🎨 色見本から選ぶ ▼
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">※上の入力欄に「地色は白」のように書くこともできます</p>
          
          {showColorPalette && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-inner flex flex-wrap gap-2">
              {TRADITIONAL_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    colors.includes(color) 
                      ? 'bg-gray-800 text-white border-gray-800' 
                      : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-center flex-wrap">
            {colors.map(color => (
              <span key={color} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-600 text-white">
                {color}
                <button onClick={() => toggleColor(color)} className="ml-2 text-gray-300 hover:text-white">×</button>
              </span>
            ))}
            {colors.length > 0 && (
              <button onClick={() => setColors([])} className="text-xs text-gray-400 hover:text-gray-600 ml-2 border-b border-gray-400">リセット</button>
            )}
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* ==========================================
            03 & 04 2カラムレイアウト
        ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <label className="block text-base font-bold text-gray-900 mb-3">03. 柄の配置・密度</label>
            <div className="space-y-2">
              {['シームレス総柄', '余白あり（飛び柄）', '四方柄・散らし柄', 'ワンポイント・パネル柄'].map(item => (
                <button 
                  key={item}
                  onClick={() => setDensity(item)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition ${density === item ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-base font-bold text-gray-900 mb-3">04. 形式・アスペクト比</label>
            <div className="space-y-2">
              {['横長ファブリック (16:9)', '縦長ファブリック (9:16)', '正方形 (1:1)'].map(item => (
                <button 
                  key={item}
                  onClick={() => setAspectRatio(item)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition ${aspectRatio === item ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        </div>

        <hr className="border-gray-200" />

        {/* ==========================================
            05. 図案銘
        ========================================== */}
        <section>
          <label className="block text-base font-bold text-gray-900 mb-3">
            05. 図案銘 <span className="text-xs font-normal text-gray-500 ml-2">(任意・作品タイトル)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例 : 遊泳金魚図"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-[#0080a2] focus:outline-none focus:ring-1 focus:ring-[#0080a2]"
          />
        </section>

        {/* エラー表示 */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-bold">
            {errorMsg}
          </div>
        )}

        {/* ==========================================
            アクションエリア (生成 & MakeShop連携)
        ========================================== */}
        {!generatedImageUrl ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center shadow-sm">
            <p className="text-sm font-bold text-yellow-600 mb-2">⚠️ 3回じゃ理想の柄が作れない方へ</p>
            <p className="text-xs text-gray-600 mb-6">本気でお誂えをご検討中の方限定で、生成回数をリセットできる【回復呪文】をお渡しします。</p>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || generationsLeft <= 0}
              className={`w-full md:w-auto px-12 py-4 rounded-lg text-white font-bold text-lg shadow-md transition ${isGenerating || generationsLeft <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0080a2] hover:bg-[#006682]'}`}
            >
              {isGenerating ? 'AIが図案を生成中...' : `図案を生成する（残り${generationsLeft}回）`}
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#0080a2] rounded-xl p-6 shadow-lg text-center animate-fade-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">✨ 図案が完成しました！</h3>
            <div className="relative w-full max-w-lg mx-auto aspect-square mb-6 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
              <Image 
                src={generatedImageUrl} 
                alt="Generated Komon Pattern" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            <p className="text-sm text-gray-600 mb-6">
              この図案を使って、実際の帯や着物をデジナ（エプソン・モナリザ）でプリントアウトできます。
            </p>
            
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <button 
                onClick={() => setGeneratedImageUrl(null)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                別の図案を作る
              </button>
              <button 
                onClick={handleOrder}
                className="px-6 py-3 rounded-lg bg-[#0080a2] text-white font-bold hover:bg-[#006682] shadow-md transition"
              >
                この柄でお誂えを依頼する（MakeShopへ）
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
