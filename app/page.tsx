'use client';

import { useState, useEffect } from 'react';

// 代表的なNGワードリスト
const FORBIDDEN_WORDS = [
  'ディズニー', 'disney', 'ミッキー', 'mickey', 'ピカチュウ', 'ポケモン', 'pokemon',
  'マリオ', 'mario', 'サンリオ', 'キティ', 'kitty', 'ちいかわ', '鬼滅', '呪術',
  'ワンピース', 'one piece', 'ジブリ', 'トトロ', 'アンパンマン', 'スヌーピー',
  'シャネル', 'chanel', 'ヴィトン', 'vuitton', 'エルメス', 'hermes', 'グッチ', 'gucci',
  'ナイキ', 'nike', 'アディダス', 'adidas'
];

// ★大増量：選ぶ楽しみを最大化する「36色の伝統色＆モダンカラー」
const TRADITIONAL_COLORS = [
  // 【白・生成・グレー系】
  { name: '胡粉 (ごふん)', hex: '#fffffc', text: '純白地' },
  { name: '生成 (きなり)', hex: '#f6f5ec', text: '淡いアイボリー地' },
  { name: '灰桜 (はいざくら)', hex: '#e8d3d1', text: 'ごく淡いグレーピンク地' },
  { name: '銀鼠 (ぎんねず)', hex: '#afafb0', text: '明るいシルバーグレー地' },
  { name: '消炭 (けしずみ)', hex: '#524e4d', text: '濃いチャコールグレー地' },
  { name: '漆黒 (しっこく)', hex: '#161616', text: '真っ黒な地' },
  // 【赤・ピンク系】
  { name: '桜色 (さくら)', hex: '#fef4f4', text: 'ごく淡い桜ピンク地' },
  { name: '桃色 (もも)', hex: '#f58f98', text: '明るいピーチピンク地' },
  { name: '牡丹 (ぼたん)', hex: '#e7609e', text: '華やかなマゼンタピンク地' },
  { name: '珊瑚 (さんご)', hex: '#f5b1aa', text: '柔らかなコーラル地' },
  { name: '朱色 (しゅ)', hex: '#ea5532', text: '鮮やかな朱赤地' },
  { name: '深緋 (こきひ)', hex: '#8b1e2a', text: '深みのある真紅・ボルドー地' },
  // 【青・水色系】
  { name: '白群 (びゃくぐん)', hex: '#83ccd2', text: '淡いペールブルー地' },
  { name: '水色 (みず)', hex: '#bce2e8', text: '澄んだライトブルー地' },
  { name: '浅葱 (あさぎ)', hex: '#00a3af', text: '鮮やかな青緑・ターコイズ地' },
  { name: '瑠璃 (るり)', hex: '#1e50a2', text: '鮮やかなロイヤルブルー地' },
  { name: '藍色 (あい)', hex: '#163b5c', text: '深いネイビー・藍地' },
  { name: '鉄紺 (てっこん)', hex: '#17184b', text: '極めて暗い紫みの紺地' },
  // 【緑系】
  { name: '白緑 (びゃくろく)', hex: '#d6e9ca', text: 'ごく淡いミントグリーン地' },
  { name: '鶸色 (ひわ)', hex: '#d7cf3a', text: '明るいイエローグリーン地' },
  { name: '若竹 (わかたけ)', hex: '#68be8d', text: '鮮やかなエメラルドグリーン地' },
  { name: '青磁 (せいじ)', hex: '#7ebea5', text: 'くすんだブルーグリーン地' },
  { name: '海松 (みる)', hex: '#726d40', text: '渋いオリーブグリーン地' },
  { name: '常磐 (ときわ)', hex: '#1b4d3e', text: '深いフォレストグリーン地' },
  // 【紫系】
  { name: '藤色 (ふじ)', hex: '#bbbcde', text: '淡いラベンダー地' },
  { name: '桔梗 (ききょう)', hex: '#5654a2', text: '鮮やかな青紫地' },
  { name: '江戸紫 (えど)', hex: '#745399', text: '濃い赤紫地' },
  { name: '古代紫 (こだい)', hex: '#895b8a', text: 'くすんだアンティークパープル地' },
  { name: '滅紫 (けしむらさき)', hex: '#594255', text: '非常に暗いグレイッシュパープル地' },
  { name: '京紫 (きょう)', hex: '#9d5b8b', text: '華麗な赤みの紫地' },
  // 【黄・茶系】
  { name: '鳥の子 (とりのこ)', hex: '#dac9a6', text: '温かみのあるベージュ地' },
  { name: '山吹 (やまぶき)', hex: '#f8b500', text: '鮮やかな黄金・マスタード地' },
  { name: '芥子 (からし)', hex: '#d0af4c', text: '渋い辛子色地' },
  { name: '琥珀 (こはく)', hex: '#bf783a', text: '明るいキャメル・琥珀地' },
  { name: '胡桃 (くるみ)', hex: '#a86f4c', text: '穏やかなブラウン地' },
  { name: '焦茶 (こげちゃ)', hex: '#693b32', text: '深いダークブラウン・チョコレート地' },
];

// ★一球入魂のアイデア・フックタグ
const TAG_CATEGORIES = [
  {
    title: '【1】画風・アートスタイル',
    tags: ['浮世絵風', '京友禅風', '水彩画風', '油絵風', 'アールヌーヴォー', 'アールデコ', 'ミッドセンチュリー', 'ステンドグラス風']
  },
  {
    title: '【2】カルチャー・世界観',
    tags: ['大正ロマン', '昭和レトロ', '70sサイケ', 'ゴスロリ', 'スチームパンク', 'サイバーパンク', 'ゆめかわいい', '絵本風']
  },
  {
    title: '【3】季節・イベント',
    tags: ['お正月', 'お花見', '夏祭り', 'ハロウィン', 'クリスマス', 'イースター']
  },
  {
    title: '【4】背景・地紋（和洋ミックス）',
    tags: ['市松模様', '麻の葉', '矢絣', '七宝', '青海波', '唐草模様', '水玉（ドット）', '縞模様', '幾何学模様', 'レース']
  },
  {
    title: '【5】メインモチーフ（定番）',
    tags: ['猫', '犬', 'うさぎ', '鳥', '蝶々', '花・植物', '宇宙', '星座']
  },
  {
    title: '【6】情景・アイデア（ひらめきのヒント！）',
    tags: ['空を飛ぶ', '水に浮かぶ', 'アンティークな', '機械仕掛けの', '洋書と一緒に', '珈琲カップと', 'シルエット', 'モノクローム']
  }
];

// 儀式感を高めるローディングステップ
const LOADING_STEPS = [
  '壱. ご指定の意匠から、テキスタイルの骨格を設計中...',
  '弐. 選択された画風と色彩のバランスを最適化中...',
  '参. デジタル捺染機「モナリザ」用の高精細データを構築中...',
  '四. シームレス文様の送り付け（連続性）を計算中...',
  '五. 染料の重なりと生地の質感をシミュレート中...',
  '六. 最終仕上げ：世界に一つの図案に銘を打刻しています...',
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
  const [remaining, setRemaining] = useState(1); // 1日1回制限
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState<'pattern' | 'fabric'>('pattern');
  const [serialNumber, setSerialNumber] = useState('');
  const [showTags, setShowTags] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem('generateDate');
    const savedCount = localStorage.getItem('generateCount');

    if (savedDate !== today) {
      localStorage.setItem('generateDate', today);
      localStorage.setItem('generateCount', '0');
      setRemaining(1);
    } else {
      const count = savedCount ? parseInt(savedCount, 10) : 0;
      setRemaining(Math.max(0, 1 - count));
    }
  }, []);

  // 焦らす演出：4秒ごとにテキスト切り替え
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 4000); 
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleTagClick = (tag: string) => {
    if (motif.includes(tag)) return; 
    const newMotif = motif ? `${motif}、${tag}` : tag;
    setMotif(newMotif);
  };

  const handleGenerate = async () => {
    setErrorMsg('');

    if (remaining <= 0) {
      setErrorMsg('本日の調合枠は終了しました。明日またお越しください。');
      return;
    }
    if (!motif.trim()) {
      setErrorMsg('モチーフを入力または選択してください。');
      return;
    }
    if (!agreed) {
      setErrorMsg('著作権・商標権に関する誓約への同意が必要です。');
      return;
    }

    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) {
      setErrorMsg(`特定のキャラクターや商標名「${hitWord}」を含む言葉は入力できません。`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif, color: selectedColor.text, density, itemType }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setSerialNumber(`KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
        
        const today = new Date().toISOString().slice(0, 10);
        const newCount = 1 - remaining + 1;
        localStorage.setItem('generateDate', today);
        localStorage.setItem('generateCount', newCount.toString());
        setRemaining(Math.max(0, 1 - newCount));
      } else {
        setErrorMsg(data.error || '図案の調合に失敗しました。');
      }
    } catch (error) {
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    }
    setLoading(false);
  };

  const finalTitle = patternTitle.trim() || '（無題）';
  const shareText = encodeURIComponent(
    `AIで仕立てた私だけの小紋図案が完成しました👘✨\n\n銘：『${finalTitle}』\n地色：${selectedColor.name}\n\n#ゴフクヤサン小紋ジェネレーター #ゴフクヤサン #モナリザプリント #居内商店`
  );
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const orderUrl = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(serialNumber)}&title=${encodeURIComponent(finalTitle)}`;

  const handleOrderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: imageUrl, komonId: serialNumber, title: finalTitle }),
    }).catch(err => console.error(err));
    window.open(orderUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 sm:p-6 flex flex-col items-center justify-center font-serif">
      <div className="max-w-2xl w-full bg-[#fdfbf7] rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8">
        
        <div className="text-center mb-6 pb-4 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 bg-stone-800 text-amber-200 text-[10px] tracking-widest px-3 py-0.5 rounded uppercase font-sans font-bold">
            <img src={IUCHI_LOGO} alt="" className="h-3.5 w-auto object-contain brightness-125" />
            <span>Digital Textile Atelier</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <img src={IUCHI_LOGO} alt="居内商店" className="h-10 sm:h-12 w-auto object-contain" />
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider text-left leading-tight">
              ゴフクヤサン<br className="sm:hidden" />小紋ジェネレーター
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-2 font-sans font-bold text-rose-800">
            【1日1回限定】あなただけの着物図案をお誂えします
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
              <p className="text-[10px] font-bold text-stone-500 mb-1 font-sans">▼ 選択された意匠（自由に書き足しも可能です）</p>
              <textarea
                className="w-full rounded-lg border-2 border-stone-300 p-3 bg-stone-50 font-sans text-sm focus:outline-none focus:border-stone-800 resize-none font-bold"
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="上のボタンをタップするか、好きな言葉を入力してください"
                disabled={loading}
              />
              <button 
                onClick={() => setMotif('')} 
                className="text-[10px] text-stone-500 underline mt-1 font-sans"
              >
                クリア
              </button>
            </div>
          </div>

          {/* ★大増量：36色のカラーピッカー */}
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
                    selectedColor.name === col.name
                      ? 'border-stone-900 ring-2 ring-stone-900 bg-white shadow-sm'
                      : 'border-stone-200 bg-white/60 hover:bg-white'
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
              <select 
                className="w-full p-2 border border-stone-300 rounded bg-white text-stone-700 focus:outline-none focus:border-stone-800"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              >
                <option value="総柄（ぎっしり華やか）">総柄（ぎっしり華やか）</option>
                <option value="飛び柄（余白を活かして上品に）">飛び柄（余白を活かして上品に）</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-stone-500 mb-1">図案銘（任意）</label>
              <input
                type="text"
                className="w-full p-2 border border-stone-300 rounded bg-white text-stone-700 focus:outline-none focus:border-stone-800"
                value={patternTitle}
                onChange={(e) => setPatternTitle(e.target.value)}
                placeholder="例：春宵の椿"
              />
            </div>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs text-stone-600 font-sans">
            <label className="flex items-start gap-2 font-bold cursor-pointer text-stone-800 leading-snug">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-stone-900 focus:ring-stone-900" />
              <span>アニメや既存ブランド等の権利を侵害しない、完全オリジナル意匠として調合することに誓約します</span>
            </label>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 text-xs font-bold p-3 rounded-lg border border-rose-200 font-sans">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-between items-center text-xs font-sans font-bold px-1 text-stone-600">
            <span>※ 日付変更（午前0時）で枠が回復します</span>
            <span>本日の残り枠：<strong className={`text-sm ${remaining > 0 ? 'text-rose-700' : 'text-stone-400'}`}>{remaining}回</strong></span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || remaining <= 0}
            className="w-full bg-stone-900 text-amber-100 font-bold py-4 rounded-xl shadow-lg hover:bg-black disabled:bg-stone-400 disabled:text-stone-200 transition duration-200 font-sans tracking-widest text-sm"
          >
            {loading ? '図案を染め上げています...' : 'この意匠で小紋図案を謹製する'}
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
            <p className="text-[10px] text-stone-400 mt-3 relative z-10 font-sans">※高精細なデータを作成するため、お時間をいただきます。</p>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="mt-8 pt-6 border-t border-stone-200 space-y-4 animate-fade-in">
            <div className="flex justify-center gap-2 font-sans text-xs">
              <button onClick={() => setPreviewMode('pattern')} className={`px-4 py-1.5 rounded-full font-bold transition ${previewMode === 'pattern' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>① 図案原画</button>
              <button onClick={() => setPreviewMode('fabric')} className={`px-4 py-1.5 rounded-full font-bold transition ${previewMode === 'fabric' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>② 反物仕立て姿</button>
            </div>

            <div className="bg-[#fffefb] border-2 border-stone-300 rounded-xl p-4 shadow-xl">
              {previewMode === 'pattern' ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                  <img src={imageUrl} alt="小紋の図案" className="w-full h-auto object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 bg-stone-200/50 rounded-lg">
                  <span className="text-[11px] font-sans text-stone-500 mb-2 font-bold">【反物（着尺）イメージ】</span>
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
                  <p className="text-[9px] font-sans text-stone-400">Mona Lisa捺染 謹製規格</p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-rose-800 font-sans mb-1">＼ お誂えをご希望の方へ ／</p>
              <p className="text-[10px] text-rose-600 font-sans mb-3">この図案データは当工房に送信され、職人が手作業で送り付け（つなぎ目）の微調整を行ってからプリントいたします。</p>
              <a href={orderUrl} onClick={handleOrderClick} className="block w-full bg-rose-800 text-amber-50 font-black py-3 rounded-lg hover:bg-rose-900 transition shadow text-sm tracking-wider cursor-pointer">
                この図案でお誂えを仕立てる
              </a>
            </div>

            <div className="space-y-2 font-sans pt-2">
              <a href={xShareLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-black text-white font-bold py-3.5 px-4 rounded-xl hover:bg-stone-800 transition shadow text-sm">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                この小紋図案をXで披露する
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* Tailwindのアニメーション定義 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide { from { background-position: 0 0; } to { background-position: 100% 100%; } }
        @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
      `}} />
    </div>
  );
}
