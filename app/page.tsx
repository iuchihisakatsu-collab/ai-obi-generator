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

// 日本の伝統色パレット（24色）
const TRADITIONAL_COLORS = [
  // モノトーン・ベース系
  { name: '漆黒 (しっこく)', hex: '#161616', text: '黒地' },
  { name: '生成り (きなり)', hex: '#f6f5ec', text: '淡いアイボリー地' },
  { name: '胡粉色 (ごふん)', hex: '#fffffc', text: '純白地' },
  { name: '銀鼠 (ぎんねず)', hex: '#afafb0', text: '明るいシルバーグレー地' },
  // 赤・ピンク系
  { name: '深緋 (こきひ)', hex: '#8b1e2a', text: '深みのある紅・臙脂地' },
  { name: '朱色 (しゅいろ)', hex: '#ea5532', text: '鮮やかな朱赤地' },
  { name: '牡丹色 (ぼたん)', hex: '#e7609e', text: '華やかな牡丹色地' },
  { name: '桜色 (さくらいろ)', hex: '#fef4f4', text: 'ごく淡い桜ピンク地' },
  // 青・紺系
  { name: '藍色 (あいいろ)', hex: '#163b5c', text: '濃紺・藍地' },
  { name: '鉄紺 (てっこん)', hex: '#17184b', text: '極めて暗い紫みの紺地' },
  { name: '瑠璃色 (るりいろ)', hex: '#1e50a2', text: '鮮やかな瑠璃・ブルー地' },
  { name: '浅葱色 (あさぎ)', hex: '#00a3af', text: '明るい青緑・水色地' },
  // 緑系
  { name: '常磐色 (ときわ)', hex: '#1b4d3e', text: '深い深緑地' },
  { name: '海松色 (みるいろ)', hex: '#726d40', text: '渋いオリーブグリーン地' },
  { name: '青磁色 (せいじ)', hex: '#7ebea5', text: '柔らかい青磁・ミントグリーン地' },
  { name: '白緑 (びゃくろく)', hex: '#d6e9ca', text: 'ごく淡い黄緑地' },
  // 紫系
  { name: '古代紫 (こだい)', hex: '#895b8a', text: 'くすんだ深紫地' },
  { name: '江戸紫 (えど)', hex: '#745399', text: '鮮やかな青紫地' },
  { name: '桔梗色 (ききょう)', hex: '#5654a2', text: '濃い青紫地' },
  { name: '藤紫 (ふじ)', hex: '#9b82aa', text: '上品な淡紫地' },
  // 黄・茶系
  { name: '山吹色 (やまぶき)', hex: '#f8b500', text: '鮮やかな黄金・山吹色地' },
  { name: '芥子色 (からし)', hex: '#d0af4c', text: '渋いマスタードイエロー地' },
  { name: '胡桃色 (くるみ)', hex: '#a86f4c', text: '温かみのある胡桃ブラウン地' },
  { name: '焦茶 (こげちゃ)', hex: '#693b32', text: '深いダークブラウン地' },
];

// 生成中に切り替わる仕立てストーリー
const LOADING_STEPS = [
  '① ご指定の地色とモチーフから、反物の骨格を製版中...',
  '② デジタル捺染機「モナリザ」に合わせた高精細リピートを構築中...',
  '③ 染料の重なりとテキスタイルの質感をシミュレート中...',
  '④ 世界に一着だけの着物の銘を打刻しています...',
];

export default function Home() {
  const [motif, setMotif] = useState('');
  const [selectedColor, setSelectedColor] = useState(TRADITIONAL_COLORS[0]);
  const [density, setDensity] = useState('総柄（ぎっしり華やか）');
  const [designerName, setDesignerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [remaining, setRemaining] = useState(5);
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState<'pattern' | 'fabric'>('pattern');
  const [serialNumber, setSerialNumber] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem('generateDate');
    const savedCount = localStorage.getItem('generateCount');

    if (savedDate !== today) {
      localStorage.setItem('generateDate', today);
      localStorage.setItem('generateCount', '0');
      setRemaining(5);
    } else {
      const count = savedCount ? parseInt(savedCount, 10) : 0;
      setRemaining(Math.max(0, 5 - count));
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    setErrorMsg('');

    if (remaining <= 0) {
      setErrorMsg('本日の生成上限（5回）に達しました。明日またお試しください！');
      return;
    }
    if (!motif.trim()) {
      setErrorMsg('モチーフを入力してください。');
      return;
    }
    if (!agreed) {
      setErrorMsg('著作権・商標権に関する注意書きへの同意が必要です。');
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
        body: JSON.stringify({
          motif,
          color: selectedColor.text,
          density,
        }),
      });
      const data = await res.json();

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setSerialNumber(`KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
        
        const today = new Date().toISOString().slice(0, 10);
        const newCount = 5 - remaining + 1;
        localStorage.setItem('generateDate', today);
        localStorage.setItem('generateCount', newCount.toString());
        setRemaining(5 - newCount);
      } else {
        setErrorMsg(data.error || '図案の調合に失敗しました。');
      }
    } catch (error) {
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    }
    setLoading(false);
  };

  const titleName = `${motif}の小紋`;
  const shareText = encodeURIComponent(
    `AIで仕立てた私だけの着物図案が完成しました👘✨\n\n銘：『${titleName}』\n地色：${selectedColor.name}\n図案師：${designerName || '名無し'} 殿\n\n#AI着物ジェネレーター #ゴフクヤサン #モナリザプリント`
  );
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 sm:p-6 flex flex-col items-center justify-center font-serif">
      <div className="max-w-xl w-full bg-[#fdfbf7] rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8">
        
        <div className="text-center mb-6 pb-4 border-b border-stone-200">
          <div className="inline-block bg-stone-800 text-amber-200 text-[11px] tracking-widest px-3 py-0.5 rounded uppercase font-sans font-bold">
            Digital Textile Atelier
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-3 text-stone-900 tracking-wider">
            AI小紋柄 仕立て処
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            言葉と色彩から、世界で一着だけの着物（小紋）の柄をお誂えします
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1 font-sans">
              壱. 図案師のお名前（反物の銘板に刻印されます）
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-stone-300 p-2.5 bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-stone-800"
              value={designerName}
              onChange={(e) => setDesignerName(e.target.value)}
              placeholder="例：千代、きもの好き花子（空欄可）"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-2 font-sans">
              弐. 着物の地色（24の伝統色から選ぶ）
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
                  <span
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="text-[9px] sm:text-[10px] font-sans text-stone-700 font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                    {col.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1 font-sans">
              参. 着物に散りばめるモチーフ・背景柄（自由入力）
            </label>
            <p className="text-[10px] text-stone-500 mb-2 font-sans">
              ※「市松模様」「水玉」「縦縞」などの背景柄も、ここへ自由にテキストで指示できます。
            </p>
            <textarea
              className="w-full rounded-lg border border-stone-300 p-3 bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 resize-none"
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="例：市松模様の背景に、黒猫と赤い椿&#13;&#10;例：水玉模様の上に、レトロな蓄音機と洋書"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1 font-sans">
              四. 柄の密度
            </label>
            <div className="flex gap-3 font-sans text-xs">
              {['総柄（ぎっしり華やか）', '飛び柄（余白を活かして上品に）'].map((item) => (
                <label
                  key={item}
                  className={`flex-1 p-2.
