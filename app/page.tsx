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
  '壱. ご指定の意匠から、テキスタイルの骨格を設計中...',
  '弐. 着物の配色・構図バランスを反映中...',
  '参. デジタル捺染機「モナリザ」用の高精細データを構築中...',
  '四. シームレス文様の送り付け（連続性）を計算中...',
  '五. 染料の重なりと生地の質感をシミュレート中...',
  '六. 最終仕上げ：図案の生成を完了しています...',
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
    if (!agreed) { setErrorMsg('著作権への配慮および利用規約への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) { setErrorMsg(`特定のキャラクターや既存ブランド名「${hitWord}」を含む言葉は入力できません。`); return; }

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
  const shareText = encodeURIComponent(`AIと一緒に考えたオリジナルの小紋図案ができました👘✨\n\n銘：『${finalTitle}』\n地色：${selectedColor.name}\n\n#ゴフクヤサン小紋ジェネレーター #ゴフクヤサン #モナリザプリント #居内商店`);
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
                  className={`p-1.5 rounded-lg
