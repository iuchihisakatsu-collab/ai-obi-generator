'use client';

import { useState, useEffect } from 'react';

const FORBIDDEN_WORDS = [
  'ディズニー', 'disney', 'ミッキー', 'mickey', 'ピカチュウ', 'ポケモン', 'pokemon',
  'マリオ', 'mario', 'サンリオ', 'キティ', 'kitty', 'ちいかわ', '鬼滅', '呪術',
  'ワンピース', 'one piece', 'ジブリ', 'トトロ', 'アンパンマン', 'スヌーピー',
  'シャネル', 'chanel', 'ヴィトン', 'vuitton', 'エルメス', 'hermes', 'グッチ', 'gucci',
  'ナイキ', 'nike', 'アディダス', 'adidas'
];

const TRADITIONAL_COLORS = [
  { name: '胡粉 (ごふん)', hex: '#fffffc', text: '純白地' }, { name: '生成 (きなり)', hex: '#f6f5ec', text: '淡いアイボリー地' },
  { name: '灰桜 (はいざくら)', hex: '#e8d3d1', text: 'ごく淡いグレーピンク地' }, { name: '銀鼠 (ぎんねず)', hex: '#afafb0', text: '明るいシルバーグレー地' },
  { name: '消炭 (けしずみ)', hex: '#524e4d', text: '濃いチャコールグレー地' }, { name: '漆黒 (しっこく)', hex: '#161616', text: '真っ黒な地' },
  { name: '桜色 (さくら)', hex: '#fef4f4', text: 'ごく淡い桜ピンク地' }, { name: '桃色 (もも)', hex: '#f58f98', text: '明るいピーチピンク地' },
  { name: '牡丹 (ぼたん)', hex: '#e7609e', text: '華やかなマゼンタピンク地' }, { name: '珊瑚 (さんご)', hex: '#f5b1aa', text: '柔らかなコーラル地' },
  { name: '朱色 (しゅ)', hex: '#ea5532', text: '鮮やかな朱赤地' }, { name: '深緋 (こきひ)', hex: '#8b1e2a', text: '深みのある真紅・ボルドー地' },
  { name: '白群 (びゃくぐん)', hex: '#83ccd2', text: '淡いペールブルー地' }, { name: '水色 (みず)', hex: '#bce2e8', text: '澄んだライトブルー地' },
  { name: '浅葱 (あさぎ)', hex: '#00a3af', text: '鮮やかな青緑・ターコイズ地' }, { name: '瑠璃 (るり)', hex: '#1e50a2', text: '鮮やかなロイヤルブルー地' },
  { name: '藍色 (あい)', hex: '#163b5c', text: '深いネイビー・藍地' }, { name: '鉄紺 (てっこん)', hex: '#17184b', text: '極めて暗い紫みの紺地' },
  { name: '白緑 (びゃくろく)', hex: '#d6e9ca', text: 'ごく淡いミントグリーン地' }, { name: '鶸色 (ひわ)', hex: '#d7cf3a', text: '明るいイエローグリーン地' },
  { name: '若竹 (わかたけ)', hex: '#68be8d', text: '鮮やかなエメラルドグリーン地' }, { name: '青磁 (せいじ)', hex: '#7ebea5', text: 'くすんだブルーグリーン地' },
  { name: '海松 (みる)', hex: '#726d40', text: '渋いオリーブグリーン地' }, { name: '常磐 (ときわ)', hex: '#1b4d3e', text: '深いフォレストグリーン地' },
  { name: '藤色 (ふじ)', hex: '#bbbcde', text: '淡いラベンダー地' }, { name: '桔梗 (ききょう)', hex: '#5654a2', text: '鮮やかな青紫地' },
  { name: '江戸紫 (えど)', hex: '#745399', text: '濃い赤紫地' }, { name: '古代紫 (こだい)', hex: '#895b8a', text: 'くすんだアンティークパープル地' },
  { name: '滅紫 (けしむらさき)', hex: '#594255', text: '非常に暗いグレイッシュパープル地' }, { name: '京紫 (きょう)', hex: '#9d5b8b', text: '華麗な赤みの紫地' },
  { name: '鳥の子 (とりのこ)', hex: '#dac9a6', text: '温かみのあるベージュ地' }, { name: '山吹 (やまぶき)', hex: '#f8b500', text: '鮮やかな黄金・マスタード地' },
  { name: '芥子 (からし)', hex: '#d0af4c', text: '渋い辛子色地' }, { name: '琥珀 (こはく)', hex: '#bf783a', text: '明るいキャメル・琥珀地' },
  { name: '胡桃 (くるみ)', hex: '#a86f4c', text: '穏やかなブラウン地' }, { name: '焦茶 (こげちゃ)', hex: '#693b32', text: '深いダークブラウン・チョコレート地' },
];

const TAG_CATEGORIES = [
  { title: '【1】画風・アートスタイル', tags: ['浮世絵風', '京友禅風', '水彩画風', '油絵風', 'アールヌーヴォー', 'アールデコ', 'ミッドセンチュリー', 'ステンドグラス風'] },
  { title: '【2】カルチャー・世界観', tags: ['大正ロマン', '昭和レトロ', '70sサイケ', 'ゴスロリ', 'スチームパンク', 'サイバーパンク', 'ゆめかわいい', '絵本風'] },
  { title: '【3】季節・イベント', tags: ['お正月', 'お花見', '夏祭り', 'ハロウィン', 'クリスマス', 'イースター'] },
  { title: '【4】背景・地紋', tags: ['市松模様', '麻の葉', '矢絣', '七宝', '青海波', '唐草模様', '水玉', '縞模様', '幾何学模様', 'レース'] },
  { title: '【5】メインモチーフ', tags: ['猫', '犬', 'うさぎ', '鳥', '蝶々', '花・植物', '宇宙', '星座'] },
  { title: '【6】情景・アイデア', tags: ['空を飛ぶ', '水に浮かぶ', 'アンティークな', '機械仕掛けの', '洋書と一緒に', '珈琲カップと', 'シルエット', 'モノクローム'] }
];

const LOADING_STEPS = [
  'ご指定のモチーフから、図案のアイデアを生成しています...',
  '色や柄の雰囲気を組み合わせています...',
  '思い描いたイメージを画像にしています...',
  '今回の図案イメージを準備しています...',
  'もう少しで、生成結果が表示されます...',
  '図案イメージを表示する準備をしています...',
];

const IUCHI_LOGO = "https://gofukuyasan.com/wp-content/uploads/2026/10/logo22.jpg";

export default function Home() {
  const [motif, setMotif] = useState('');
  const [selectedColor, setSelectedColor] = useState(TRADITIONAL_COLORS[0]);
  const [density, setDensity] = useState('総柄（ぎっしり華やか）');
  const [itemType, setItemType] = useState('hanhaba'); 
  const [patternTitle, setPatternTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imageUrl, setImageUrl] = useState(''); 
  const [blobUrl, setBlobUrl] = useState('');   
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState<'pattern' | 'fabric'>('pattern');
  const [serialNumber, setSerialNumber] = useState('');
  const [showTags, setShowTags] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 4000); 
    }
    return () => { if (interval) clearInterval(interval); };
  }, [loading]);

  const handleTagClick = (tag: string) => {
    if (motif.includes(tag)) return; 
    const newMotif = motif ? `${motif}、${tag}` : tag;
    setMotif(newMotif);
  };

  const handleGenerate = async () => {
    setErrorMsg('');
    if (!motif.trim()) { setErrorMsg('モチーフを入力または選択してください。'); return; }
    if (!agreed) { setErrorMsg('図案の利用に関する確認事項への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) { setErrorMsg(`入力内容に使用できない作品名・ブランド名等「${hitWord}」が含まれています。一般的なモチーフや特徴を表す言葉に変更してください。`); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif, color: selectedColor.text, density, itemType }),
      });
      const data = await res.json();

      if (data.imageUrl && data.blobUrl) {
        setImageUrl(data.imageUrl); 
        setBlobUrl(data.blobUrl);   
        setSerialNumber(`KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setErrorMsg(data.error || '図案の生成に失敗しました。');
      }
    } catch (error) {
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    }
    setLoading(false);
  };

  const finalTitle = patternTitle.trim() || '（無題）';
  const shareText = encodeURIComponent(`ゴフクヤサン小紋ジェネレーターで、AIを使って図案のアイデアを形にしてみました。\n\n銘：『${finalTitle}』\n地色：${selectedColor.name}\n\n※これはAIで生成した図案イメージです。実際の生地にする際は、工房で確認し、必要に応じて調整します。\n\n#ゴフクヤサン小紋ジェネレーター #ゴフクヤサン`);
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const orderUrl = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(serialNumber)}&title=${encodeURIComponent(finalTitle)}`;

  const handleOrderClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: blobUrl, komonId: serialNumber, title: finalTitle }),
      }).catch(err => console.error(err));
    } catch (err) {
      console.error(err);
    }
    window.open(orderUrl, '_blank', 'noopener,noreferrer');
  };

  const splitMotifs = motif ? motif.split('、') : [];
  const primaryTag = splitMotifs.length > 0 && splitMotifs[0] ? splitMotifs[0].trim() : '';
  const searchKeyword = primaryTag ? primaryTag.slice(0, 6) : '帯';

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 sm:p-6 flex flex-col items-center justify-center font-serif">
      <div className="max-w-2xl w-full bg-[#fdfbf7] rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8">
        
        {/* ヘッダーエリア */}
        <div className="text-center mb-6 pb-4 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 bg-stone-800 text-amber-200 text-[10px] tracking-widest px-3 py-0.5 rounded uppercase font-sans font-bold shadow-sm">
            <img src={IUCHI_LOGO} alt="" className="h-3.5 w-auto object-contain brightness-125" />
            <span>Gofukuyasan Pattern Studio</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <img src={IUCHI_LOGO} alt="居内商店" className="h-10 sm:h-12 w-auto object-contain" />
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider text-left leading-tight">
              ゴフクヤサン<br className="sm:hidden" />小紋ジェネレーター
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-500 mt-2 font-sans font-bold">
            着物の配色と柄づくりのノウハウを生かした、オリジナル図案づくりのためのAIツール
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-stone-800 tracking-wider font-sans">
                壱. 画風・意匠の選択（タップで追加）
              </label>
              <button onClick={() => setShowTags(!showTags)} className="text-xs text-stone-500 underline font-sans">
                {showTags ? '閉じる' : '開く'}
              </button>
            </div>
            
            {showTags && (
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-300">
                {TAG_CATEGORIES.map((cat) => (
                  <div key={cat.title}>
                    <p className="text-[11px] font-bold text-stone-500 mb-1.5 font-sans">{cat.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="px-2.5 py-1 bg-stone-100 border border-stone-300 rounded-md text-[11px] font-sans text-stone-700 hover:bg-stone-800 hover:text-white transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <div className="flex flex-col mb-1 font-sans">
                <p className="text-[11px] font-bold text-stone-700">▼ 選択された意匠（自由に書き足しも可能です）</p>
                <p className="text-[10px] font-bold text-amber-800 mt-0.5">※頭の中にあるイメージを言葉で書き足すほど、より理想の雰囲気に近づきます。</p>
              </div>
              <textarea
                className="w-full rounded-lg border-2 border-stone-300 p-3 bg-stone-50 font-sans text-sm focus:outline-none focus:border-stone-800 resize-none font-bold"
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="例：黒猫と赤い椿が絡み合うように、背景には三日月を浮かべて..."
                disabled={loading}
              />
              <button onClick={() => setMotif('')} className="text-[10px] text-stone-500 underline mt-1 font-sans">クリア</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-2 font-sans">
              弐. 着物の地色（36の伝統色から選ぶ）
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TRADITIONAL_COLORS.map((col) => (
                <button
                  key={col.name}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedColor.name === col.name ? 'border-stone-900 ring-2 ring-stone-900 bg-white shadow-sm' : 'border-stone-200 bg-white/60 hover:bg-white'
                  }`}
                >
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: col.hex }} />
                  <span className="text-[9px] sm:text-[10px] font-sans text-stone-700 font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                    {col.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1 font-sans">
              参. 仕立てるアイテム（柄の比率が変わります）
            </label>
            <div className="flex gap-3 font-sans text-xs">
              <label className={`flex-1 p-2.5 rounded-lg border text-center cursor-pointer font-bold transition ${itemType === 'hanhaba' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-700'}`}>
                <input type="radio" className="sr-only" checked={itemType === 'hanhaba'} onChange={() => setItemType('hanhaba')} />
                半幅帯（横長）
              </label>
              <label className={`flex-1 p-2.5 rounded-lg border text-center cursor-pointer font-bold transition ${itemType === 'tanmono' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-700'}`}>
                <input type="radio" className="sr-only" checked={itemType === 'tanmono'} onChange={() => setItemType('tanmono')} />
                反物・京袋帯（縦長）
              </label>
            </div>
          </div>

          <div className="flex gap-3 font-sans text-xs">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-stone-500 mb-1">密度</label>
              <select className="w-full p-2 border border-stone-300 rounded bg-white text-stone-700 focus:outline-none focus:border-stone-800" value={density} onChange={(e) => setDensity(e.target.value)}>
                <option value="総柄（ぎっしり華やか）">総柄（ぎっしり華やか）</option>
                <option value="飛び柄（余白を活かして上品に）">飛び柄（余白を活かして上品に）</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-stone-500 mb-1">図案銘（任意）</label>
              <input type="text" className="w-full p-2 border border-stone-300 rounded bg-white text-stone-700 focus:outline-none focus:border-stone-800" value={patternTitle} onChange={(e) => setPatternTitle(e.target.value)} placeholder="例：春宵の椿" />
            </div>
          </div>

          {/* AI生成画像の特性と商品化前の確認について説明 */}
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs text-stone-600 font-sans">
            <label className="flex items-start gap-2 font-bold cursor-pointer text-stone-800 leading-snug">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-stone-900 focus:ring-stone-900" />
              <span>既存の作品・キャラクター・ブランド等の模倣を目的として利用しません。AI生成の図案は既存の意匠と似る場合があり、完全な独自性や権利上の問題がないことを保証するものではないと理解しました。実際の生地制作をご希望の場合は、工房で図案を確認し、必要に応じて調整します。</span>
            </label>
          </div>

          {errorMsg && <div className="bg-rose-50 text-rose-800 text-xs font-bold p-3 rounded-lg border border-rose-200 font-sans">{errorMsg}</div>}

          <button onClick={handleGenerate} disabled={loading} className="w-full bg-stone-900 text-amber-100 font-bold py-4 rounded-xl shadow-lg hover:bg-black disabled:bg-stone-400 disabled:text-stone-200 transition duration-200 font-sans tracking-widest text-sm">
            {loading ? '図案イメージを生成しています...' : 'この内容で図案イメージを生成する'}
          </button>
        </div>

        {loading && (
          <div className="mt-8 p-6 rounded-xl bg-stone-800 border border-stone-700 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://gofukuyasan.com/wp-content/uploads/2026/10/logo22.jpg')] bg-repeat opacity-5 animate-[slide_20s_linear_infinite]" />
            <p className="text-sm font-bold text-amber-200 font-sans relative z-10 tracking-widest leading-relaxed">
              {LOADING_STEPS[loadingStep]}
            </p>
            <div className="mt-4 w-full bg-stone-700 h-1.5 rounded-full overflow-hidden relative z-10">
              <div className="bg-amber-400 h-full animate-[loading_24s_ease-in-out_forwards]" />
            </div>
            <p className="text-[10px] text-stone-400 mt-3 relative z-10 font-sans">※画像の生成と保存には時間がかかる場合があります。</p>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="mt-8 pt-6 border-t border-stone-200 space-y-4 animate-fade-in">
            <div className="flex justify-center gap-2 font-sans text-xs">
              <button onClick={() => setPreviewMode('pattern')} className={`px-4 py-1.5 rounded-full font-bold transition ${previewMode === 'pattern' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>① 図案原画</button>
              <button onClick={() => setPreviewMode('fabric')} className={`px-4 py-1.5 rounded-full font-bold transition ${previewMode === 'fabric' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>② 生地にした場合のイメージ</button>
            </div>

            <div className="bg-[#fffefb] border-2 border-stone-300 rounded-xl p-4 shadow-xl">
              {previewMode === 'pattern' ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                  <img src={imageUrl} alt="小紋の図案" className="w-full h-auto object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 bg-stone-200/50 rounded-lg">
                  <span className="text-[11px] font-sans text-stone-500 mb-2 font-bold">【反物にした場合のイメージ】</span>
                  <div className="w-full h-64 rounded border-x-4 border-stone-400 shadow-md bg-repeat" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: '120px' }} />
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-dashed border-stone-300 flex justify-between items-end text-stone-700">
                <div>
                  <p className="text-[10px] font-sans text-stone-400">図案銘</p>
                  <p className="text-base font-black text-stone-900">{finalTitle}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-sans font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{serialNumber}</span>
                    <img src={IUCHI_LOGO} alt="" className="h-5 w-auto object-contain" />
                  </div>
                  <p className="text-[9px] font-sans text-stone-400">AI生成による図案イメージ / Gofukuyasan</p>
                </div>
              </div>
            </div>

            {/* 生成画像と実際の商品制作の違いを明示 */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-rose-800 font-sans mb-1">＼ お誂えをご希望の方へ ／</p>
              <p className="text-[10px] text-rose-700 font-sans mb-3 leading-relaxed">
                生成された画像は、図案のアイデアを確認するためのイメージです。実際の生地として制作する場合は、ご注文後に工房で柄のつながりや色彩バランス、印刷への適性を確認し、必要に応じてデータを調整します。生成画像と実際の生地では、色味や柄の見え方が異なる場合があります。
              </p>
              <a href={orderUrl} onClick={handleOrderClick} className="block w-full bg-rose-800 text-amber-50 font-black py-3 rounded-lg hover:bg-rose-900 transition shadow text-sm tracking-wider cursor-pointer">
                この図案イメージをもとにお誂えを申し込む
              </a>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mt-2">
              <p className="text-xs font-bold text-stone-800 font-sans mb-2">この図案に合わせるコーディネート</p>
              <p className="text-[10px] text-stone-600 font-sans mb-3 leading-relaxed">
                図案の雰囲気に合わせて、当店の商品もご覧いただけます。
              </p>
              <div className="flex flex-col gap-2">
                <a href={`https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(searchKeyword)}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-white border border-stone-300 text-stone-700 text-center py-2.5 rounded-lg hover:bg-stone-100 transition text-[11px] font-bold shadow-sm">
                  ゴフクヤサンの「{searchKeyword}」関連商品を見る
                </a>
                <a href="https://store.gofukuyasan.com/" target="_blank" rel="noopener noreferrer" className="block w-full bg-white border border-stone-300 text-stone-700 text-center py-2.5 rounded-lg hover:bg-stone-100 transition text-[11px] font-bold shadow-sm">
                  着物・帯・小物を見る
                </a>
              </div>
            </div>

            <div className="space-y-3 font-sans pt-2">
              <div className="text-center bg-stone-100 rounded-lg p-3 border border-stone-200">
                <p className="text-[11px] font-bold text-stone-800 mb-1">【画像の保存・共有】</p>
                <p className="text-[10px] text-stone-600 mb-3">画像を保存して、SNSなどで共有できます。共有の際は、AI生成による図案イメージであることも添えていただけると幸いです。</p>
                
                <a href={blobUrl} download={`${serialNumber || 'komon'}_${finalTitle}.png`} className="flex items-center justify-center gap-2 w-full bg-white text-stone-800 font-bold py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 transition shadow-sm text-[13px] mb-2">
                  <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  図案画像を端末に保存する
                </a>

                <a href={xShareLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-stone-800 transition shadow text-[13px]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  この図案イメージをXで共有する
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes slide { from { background-position: 0 0; } to { background-position: 100% 100%; } } @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }`}} />
    </div>
  );
}
