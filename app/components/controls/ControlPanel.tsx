// app/components/controls/ControlPanel.tsx
'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: (mode: 'ai' | 'geometric') => void;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf';
  setItemType: (type: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf') => void;
  
  aiStyle: string;
  setAiStyle: (val: string) => void;
  tasteMode?: string;
  setTasteMode?: (val: string) => void;

  selectedArtist: string;
  setSelectedArtist: (artist: string) => void;
  motif: string;
  setMotif: (val: string) => void;
  motif2: string;
  setMotif2: (val: string) => void;
  
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  setImageUrl: (url: string) => void;
  setBlobUrl: (url: string) => void;

  patternScale: 'small' | 'medium' | 'large';
  setPatternScale: (scale: 'small' | 'medium' | 'large') => void;

  density: string;
  setDensity: (density: string) => void;

  selectedColors: { name: string; hex: string; isDark: boolean }[];
  setSelectedColors: (colors: { name: string; hex: string; isDark: boolean }[]) => void;

  geoBaseShape: string;
  setGeoBaseShape: (shape: string) => void;
  geoArrangement: string;
  setGeoArrangement: (arr: string) => void;
  geoCount: number;
  setGeoCount: (cnt: number) => void;
  geoScale: number;
  setGeoScale: (s: number) => void;
  geoComplexity: number;
  setGeoComplexity: (c: number) => void;
  geoStrokeWidth: number;
  setGeoStrokeWidth: (w: number) => void;
  geoBgColor: string;
  setGeoBgColor: (col: string) => void;
  bgSizeMm: number;
  setBgSizeMm: (size: number) => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;
  statusText: string;
  setStatusText: (text: string) => void;

  patternTitle: string;
  setPatternTitle: (title: string) => void;
  serialNumber: string;
  imageUrl: string;
  blobUrl: string;

  remainingSketches: number;
  setRemainingSketches: React.Dispatch<React.SetStateAction<number>>;
  hasUsedFreeOpenAi: boolean;
  setHasUsedFreeOpenAi: React.Dispatch<React.SetStateAction<boolean>>;
  hasUsedFreeToday: boolean;
  setHasUsedFreeToday: React.Dispatch<React.SetStateAction<boolean>>;
  premiumCode: string;
  setPremiumCode: (code: string) => void;
  ticketRemaining: number | null;
  setTicketRemaining: React.Dispatch<React.SetStateAction<number | null>>;

  onGenerate: (engine: 'flux' | 'openai', mode: 'free' | 'premium') => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function ControlPanel(props: ControlPanelProps) {
  const {
    creationMode, setCreationMode,
    itemType, setItemType,
    aiStyle, setAiStyle,
    tasteMode = 'katazome', setTasteMode,
    selectedArtist, setSelectedArtist,
    motif, setMotif,
    motif2, setMotif2,
    selectedTags, setSelectedTags,
    patternScale, setPatternScale,
    density, setDensity,
    selectedColors, setSelectedColors,
    geoBaseShape, setGeoBaseShape,
    geoArrangement, setGeoArrangement,
    geoCount, setGeoCount,
    geoScale, setGeoScale,
    geoComplexity, setGeoComplexity,
    geoStrokeWidth, setGeoStrokeWidth,
    geoBgColor, setGeoBgColor,
    bgSizeMm, setBgSizeMm,
    loading, setLoading,
    statusText, setStatusText,
    patternTitle, setPatternTitle,
    serialNumber, imageUrl, blobUrl,
    remainingSketches, setRemainingSketches,
    hasUsedFreeOpenAi, setHasUsedFreeOpenAi,
    hasUsedFreeToday, setHasUsedFreeToday,
    premiumCode, setPremiumCode,
    ticketRemaining, setTicketRemaining,
    onGenerate, handleOrderClick
  } = props;

  const [activeTab, setActiveTab] = useState<'create' | 'order'>('create');
  const [ticketInput, setTicketInput] = useState(premiumCode || '');
  const [isVerifyingTicket, setIsVerifyingTicket] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  const [colorHistory, setColorHistory] = useState<{ name: string; hex: string; isDark: boolean }[][]>([]);

  const sampleTags = ['市松', '幾何学', '桜', '金魚', '七宝', 'モダン', '花鳥風月', '波', '唐草', 'アールデコ'];

  const artistChoices = [
    { id: 'custom', name: '✏️ 自由入力（プロンプト直接入力）', desc: 'ご自身でモチーフや世界観を自由に入力します' },
    { id: 'morris', name: '🌿 ウィリアム・モリス', desc: 'アーツ＆クラフツの緻密な植物・草花リピート' },
    { id: 'galle', name: '🏺 エミール・ガレ', desc: 'アール・ヌーヴォーの幻想的な植物・被せガラスの陰影' },
    { id: 'chagall', name: '🎨 マルク・シャガール', desc: '愛と色彩の詩情、浮遊する恋人たちと動物たち' },
    { id: 'matisse', name: '✂️ アンリ・マティス', desc: '切り紙絵の純粋な色彩と、伸びやかな抽象フォルム' },
    { id: 'rousseau', name: '🌴 アンリ・ルソー', desc: '素朴派の濃密な熱帯ジャングルと幻想の野生動物' },
    { id: 'muchas', name: '🌸 アルフォンス・ミュシャ', desc: '優美な曲線、華麗な装飾枠と四季の植物モチーフ' },
    { id: 'klimt', name: '✨ グスタフ・クリムト', desc: '黄金のモザイク、幾何学的装飾とアール・ヌーヴォーの旋律' },
    { id: 'jakuchu', name: '🐓 伊藤若冲', desc: '超絶技巧の細密描写、動植綵絵の圧倒的な生命力' },
    { id: 'hokusai', name: '🌊 葛飾北斎', desc: '富嶽三十六景の大胆な波・富士と江戸グラフィック' },
    { id: 'korin', name: '🌺 尾形光琳', desc: '琳派の神髄、金箔地に響く大胆な梅・燕子花の意匠' },
    { id: 'yumeji', name: '👘 竹久夢二', desc: '大正ロマンの情緒、どこか儚くレトロモダンな乙女意匠' },
  ];

  const handleArtistSelect = (artistId: string) => {
    setSelectedArtist(artistId);
    if (artistId === 'custom') {
      setMotif('');
      return;
    }

    const artistMotifs: Record<string, string> = {
      morris: 'William Morris style, intricate dense botanical patterns, acanthus leaves, interwoven floral tapestry',
      galle: 'Emile Galle Art Nouveau style, botanical naturalist cameo glass aesthetic, poetic plant silhouettes, dragonfly, layered translucent depth',
      chagall: 'Marc Chagall style, poetic dreamlike floating lovers, celestial blue wash, mythical animals, violin, romantic stained glass atmosphere',
      matisse: 'Henri Matisse cut-outs style, bold paper silhouette shapes, expressive primary colors, organic seaweed and dancing forms, minimalist rhythm',
      rousseau: 'Henri Rousseau style, lush naive tropical jungle foliage, mysterious exotic wild animals hidden in leaves, dense layered virgin forest',
      muchas: 'Alphonse Mucha Art Nouveau style, elegant flowing curving lines, ornamental arabesque floral halos, delicate lilies and iris motifs',
      klimt: 'Gustav Klimt Golden Phase style, intricate shimmering gold leaf mosaics, spiral ornamental geometry, opulent Byzantine decorative swirls',
      jakuchu: 'Ito Jakuchu style, ultra-detailed Edo nature painting, dynamic roosters with vibrant feathers, lush flora, crisp fine brushwork',
      hokusai: 'Katsushika Hokusai style, dynamic cresting ocean waves, stylized Mt Fuji in background, bold Edo woodblock print linework',
      korin: 'Ogata Korin Rimpa school style, bold decorative red and white plum blossoms, flowing water swirls on subtle antique gold background',
      yumeji: 'Takehisa Yumeji Taisho Roman style, nostalgic retro Japanese textile, delicate weeping willows, Camellia japonica flowers, poetic soft romantic melancholy',
    };

    if (artistMotifs[artistId]) {
      setMotif(artistMotifs[artistId]);
    }
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
      setMotif(motif.replace(new RegExp(tag + '[,\\s]*', 'g'), '').trim());
    } else {
      setSelectedTags([...selectedTags, tag]);
      setMotif(motif ? `${motif}, ${tag}` : tag);
    }
  };

  const handleColorClick = (color: { name: string; hex: string; isDark: boolean }) => {
    setColorHistory((prev) => [...prev, selectedColors]);
    if (selectedColors.some((c) => c.name === color.name)) {
      setSelectedColors(selectedColors.filter((c) => c.name !== color.name));
    } else {
      if (selectedColors.length >= 3) {
        setSelectedColors([...selectedColors.slice(1), color]);
      } else {
        setSelectedColors([...selectedColors, color]);
      }
    }
  };

  const handleUndoColor = () => {
    if (colorHistory.length === 0) return;
    const previous = colorHistory[colorHistory.length - 1];
    setSelectedColors(previous);
    setColorHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const handleClearColors = () => {
    if (selectedColors.length === 0) return;
    setColorHistory((prev) => [...prev, selectedColors]);
    setSelectedColors([]);
  };

  const handleVerifyTicket = async () => {
    const code = ticketInput.trim().toUpperCase();
    if (!code) {
      setTicketError('シリアルコードを入力してください');
      return;
    }
    setIsVerifyingTicket(true);
    setTicketError('');

    try {
      const res = await fetch(`/api/generate?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success) {
        setPremiumCode(code);
        setTicketRemaining(data.remaining);
        localStorage.setItem('mousou_premium_code', code);
      } else {
        setTicketError(data.error || '無効なコードです');
        setTicketRemaining(null);
      }
    } catch (err: any) {
      setTicketError('通信エラーが発生しました');
    } finally {
      setIsVerifyingTicket(false);
    }
  };

  const handleClearTicket = () => {
    setPremiumCode('');
    setTicketInput('');
    setTicketRemaining(null);
    setTicketError('');
    localStorage.removeItem('mousou_premium_code');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setAnalyzeError('画像サイズが大きすぎます（10MB以下の画像をお使いください）');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          });
          const data = await res.json();
          if (data.success && data.motif) {
            setMotif(data.motif);
          } else {
            setAnalyzeError(data.error || '図案の抽出に失敗しました。');
          }
        } catch (err) {
          setAnalyzeError('通信エラーが発生しました。');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAnalyzeError('画像の読み込みに失敗しました。');
      setIsAnalyzing(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(motif);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWebShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: '妄想小紋図案帖',
          text: `「妄想小紋図案帖」で柄をデザインしました！\n作品名：『${finalTitle}』\n配色：${colorSummary}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      handleCopyPrompt();
    }
  };

  useEffect(() => {
    if (!density) {
      if (itemType === 'scarf') setDensity('スカーフ柄（額縁スクエアパネル）');
      else if (itemType === 'kimono') setDensity('四方柄（天地無用）');
      else if (itemType === 'hanhaba') setDensity('一方向（上向き）');
      else setDensity('総柄（小紋タイプ）');
    }
  }, [itemType, density, setDensity]);

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map((c) => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = `「妄想小紋図案帖」で柄のアイデアを試してみました。\n作品名：『${finalTitle}』\n配色：${colorSummary}\n#妄想きもの図案帳 #ゴフクヤサン`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://store.gofukuyasan.com/';
  const mediaUrl = imageUrl || '';

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToLine = () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToPinterest = () => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const primaryMotif = motif.split(/[,、\s]/)[0]?.trim();
  const makeshopSearchUrl = primaryMotif ? `https://store.gofukuyasan.com/view/search?search_keyword=${encodeURIComponent(primaryMotif)}` : 'https://store.gofukuyasan.com/';

  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-6">
      <div className="bg-white border border-zinc-300 shadow-xl overflow-hidden rounded-sm">
        
        {/* ナビゲーションタブ */}
        <div className="flex border-b border-zinc-200 bg-zinc-100">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-xs sm:text-sm font-black tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white text-zinc-950 border-b-2 border-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50'
            }`}
          >
            <span>🎨</span>
            <span>図案をデザインする</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`flex-1 py-3 text-xs sm:text-sm font-black tracking-widest transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'order'
                ? 'bg-white text-zinc-950 border-b-2 border-zinc-950 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/50'
            }`}
          >
            <span>✨</span>
            <span>お誂え・ご注文・共有</span>
            {imageUrl && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="p-4 sm:p-6 space-y-6 animate-fade-in">

            {/* 01. 生成モード */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-2 tracking-wider">
                01. 図案生成モード
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreationMode('ai')}
                  className={`py-3 px-3 border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center text-center ${
                    creationMode === 'ai'
                      ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-black flex items-center gap-1">
                    <span>✨</span>
                    <span>AI妄想モード</span>
                  </span>
                  <span className="text-[9px] opacity-75 mt-0.5">言葉から新しい柄をAI生成</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMode('geometric')}
                  className={`py-3 px-3 border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center text-center ${
                    creationMode === 'geometric'
                      ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-black flex items-center gap-1">
                    <span>📐</span>
                    <span>幾何学文様モード</span>
                  </span>
                  <span className="text-[9px] opacity-75 mt-0.5">数学的な和柄をパラメーター生成</span>
                </button>
              </div>
            </div>

            {/* AI妄想モードの設定項目 */}
            {creationMode === 'ai' ? (
              <>
                {/* 02. 作風・画風（巨匠の流儀） */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      02. 巨匠の流儀（インスピレーション）
                    </label>
                    <span className="text-[10px] text-zinc-400">世界の芸術家・伝統の筆致</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {artistChoices.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleArtistSelect(a.id)}
                        className={`p-2.5 text-left border rounded-sm transition-all shadow-sm flex flex-col justify-between ${
                          selectedArtist === a.id
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-xs font-black">{a.name}</span>
                        <span className="text-[9px] opacity-75 mt-1 leading-normal line-clamp-2">
                          {a.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 03. 染織テイスト */}
                {setTasteMode && (
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                        03. 染織・質感テイスト
                      </label>
                      <span className="text-[10px] text-zinc-400">布地に宿る技法</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'katazome', label: '型染・藍', desc: '江戸のグラフィック' },
                        { id: 'botanical', label: '細密博物画', desc: 'モリス風エッチング' },
                        { id: 'mingei', label: '民藝・版画', desc: '温もりの木版・凸版' },
                        { id: 'mode', label: '北欧・モード', desc: 'バウハウス・幾何学' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTasteMode(item.id)}
                          className={`p-2 text-center border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center ${
                            tasteMode === item.id
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-xs font-black">{item.label}</span>
                          <span className="text-[8px] opacity-75 mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 04. モチーフ入力 */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      04. モチーフ・描きたい世界
                    </label>
                    <span className="text-[10px] text-zinc-400">日本語で自由に入力可能</span>
                  </div>
                  <textarea
                    rows={3}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="例：黒猫と三日月、純喫茶のメロンソーダとプリン、真夜中の読書会、サイバーパンクな花鳥風月..."
                    className="w-full p-3 border border-zinc-300 rounded-sm text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-900 font-sans shadow-inner"
                  />

                  {/* 画像からモチーフ抽出 */}
                  <div className="mt-2.5 flex items-center justify-between bg-zinc-50 border border-dashed border-zinc-300 p-2.5 rounded-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📷</span>
                      <span className="text-[10px] font-bold text-zinc-700">お手持ちの画像からモチーフを自動抽出</span>
                    </div>
                    <label className="px-3 py-1 bg-white border border-zinc-300 text-zinc-800 text-[10px] font-black rounded-sm cursor-pointer hover:bg-zinc-100 transition-all shadow-sm">
                      {isAnalyzing ? '解析中...' : '画像を選択'}
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isAnalyzing} className="hidden" />
                    </label>
                  </div>
                  {analyzeError && <p className="text-[10px] text-red-600 mt-1">{analyzeError}</p>}

                  {/* タグチップス */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sampleTags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTagClick(t)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-sm border transition-all ${
                          selectedTags.includes(t)
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 05. スタイルアクセント */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      05. スタイル・アクセント
                    </label>
                    <span className="text-[10px] text-zinc-400">質感・技法の追加</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'none', label: 'なし（基本）' },
                      { id: 'scarf', label: 'カレ・額縁スカーフ' },
                      { id: 'galle', label: 'ガレ風被せガラス' },
                      { id: 'organic', label: 'ポエティック有機' },
                      { id: 'toile', label: 'トワルドジュイ' },
                      { id: 'risograph', label: 'リソグラフ' },
                      { id: 'woodblock', label: '木版・和紙' },
                      { id: 'yuzen', label: '友禅の雅' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setAiStyle(st.id)}
                        className={`py-2 px-2 text-center border rounded-sm transition-all shadow-sm ${
                          aiStyle === st.id
                            ? 'bg-zinc-900 text-white border-zinc-900 font-bold'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 text-[11px]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 06. 柄の大きさ（スケール） */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      06. 柄の大きさ（スケール）
                    </label>
                    <span className="text-[10px] text-zinc-400">40cm反物基準</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'small', label: '細かい（小紋）', desc: '15-20mm / 密度高' },
                      { id: 'medium', label: '普通（標準）', desc: '40-50mm / バランス' },
                      { id: 'large', label: '大きい（大柄）', desc: '100mm+ / 迫力重視' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setPatternScale(s.id as any)}
                        className={`py-2 px-2 text-center border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center ${
                          patternScale === s.id
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-xs font-black">{s.label}</span>
                        <span className="text-[8px] opacity-75 mt-0.5">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 07. 柄の向き・天地（自由選択） */}
                <div className="pt-4 border-t border-zinc-200 mt-2">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      07. 柄の向き（天地）
                    </label>
                    <span className="text-[10px] text-zinc-500">
                      {density.includes('スカーフ') ? '🧣 カレ額縁パネル構図' : density.includes('四方') ? '🔄 上下左右ランダム（着物推奨）' : '⬆️ 上向き整列（帯推奨）'}
                    </span>
                  </div>

                  {itemType === 'scarf' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDensity('スカーフ柄（額縁スクエアパネル）')}
                        className={`py-2.5 px-3 border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center text-center ${
                          density.includes('スカーフ')
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-[11px] font-bold flex items-center gap-1">
                          <span>🧣</span>
                          <span>スカーフ柄（推奨）</span>
                        </span>
                        <span className="text-[8.5px] opacity-75 mt-0.5">Carré 額縁スクエアパネル・1枚絵</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDensity('四方柄（天地無用）')}
                        className={`py-2.5 px-3 border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center text-center ${
                          density.includes('四方') || density.includes('天地無用')
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-[11px] font-bold flex items-center gap-1">
                          <span>🔄</span>
                          <span>総柄リピート</span>
                        </span>
                        <span className="text-[8.5px] opacity-75 mt-0.5">天地無用・全面シームレス小紋</span>
                      </button>
                    </div>
                  ) : itemType === 'kyobukuro' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {[
                        { id: '四方柄（天地無用）', label: '四方柄', sub: '天地無用・ランダム' },
                        { id: 'お太鼓柄（ワンポイント主役パネル）', label: 'お太鼓柄', sub: '中央主役' },
                        { id: 'スカーフ柄（額縁スクエアパネル）', label: 'スカーフ柄', sub: 'Carré額縁' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setDensity(item.id)}
                          className={`py-2 px-2 text-center border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center ${
                            density.includes(item.label) 
                              ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900' 
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <span className="text-[11px] font-black">{item.label}</span>
                          <span className="text-[8px] opacity-75 mt-0.5">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDensity('四方柄（天地無用）')}
                        className={`py-2.5 px-3 border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center text-center ${
                          density.includes('四方') || density.includes('天地無用')
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-[11px] font-bold flex items-center gap-1">
                          <span>🔄</span>
                          <span>四方柄（天地無用）</span>
                        </span>
                        <span className="text-[8.5px] opacity-75 mt-0.5">上下左右逆さま・着物向け</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDensity('一方向（上向き）')}
                        className={`py-2.5 px-3 border rounded-sm transition-all shadow-sm flex flex-col items-center justify-center text-center ${
                          density.includes('一方向') || density.includes('上向き')
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-[11px] font-bold flex items-center gap-1">
                          <span>⬆️</span>
                          <span>一方向（上向き）</span>
                        </span>
                        <span className="text-[8.5px] opacity-75 mt-0.5">すべて頭が上・帯向け</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 08. 日本の伝統色パレット */}
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      08. 色彩の指定（日本の伝統色から最大3色）
                    </label>
                    <div className="flex items-center gap-2">
                      {colorHistory.length > 0 && (
                        <button
                          type="button"
                          onClick={handleUndoColor}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 underline"
                        >
                          一つ戻す
                        </button>
                      )}
                      {selectedColors.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearColors}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 underline"
                        >
                          クリア
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedColors.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 bg-zinc-50 border border-zinc-200 rounded-sm">
                      {selectedColors.map((c) => (
                        <span
                          key={c.name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-sm border shadow-sm"
                          style={{
                            backgroundColor: c.hex,
                            color: c.isDark ? '#fff' : '#000',
                            borderColor: 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <span>{c.name.split(' ')[0]}</span>
                          <button
                            type="button"
                            onClick={() => handleColorClick(c)}
                            className="hover:opacity-75 font-black text-xs leading-none ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 mb-2">
                      ※未選択の場合は、AIがモチーフに最適な配色を自動調色します。
                    </p>
                  )}

                  <div className="max-h-[160px] overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 gap-1 border border-zinc-200 p-1.5 rounded-sm bg-zinc-50">
                    {TRADITIONAL_COLORS.map((col) => {
                      const isSelected = selectedColors.some((c) => c.name === col.name);
                      return (
                        <button
                          key={col.name}
                          type="button"
                          onClick={() => handleColorClick(col)}
                          className={`relative h-9 p-1 flex flex-col justify-end text-left border rounded-sm shadow-sm transition-transform hover:scale-95 ${
                            isSelected ? 'ring-2 ring-zinc-950 scale-95 border-transparent' : 'border-zinc-300'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        >
                          {isSelected && (
                            <span className="absolute top-0.5 right-1 text-[9px] font-black text-zinc-950 bg-white/90 rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              ✓
                            </span>
                          )}
                          <span className={`text-[7.5px] font-bold truncate leading-none ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {col.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* 幾何学文様モードの設定項目 */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-2 tracking-wider">
                    基本文様（ベースシェイプ）
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'ichimatsu', label: '市松（チェッカー）' },
                      { id: 'shippo', label: '七宝（円の重なり）' },
                      { id: 'asanoha', label: '麻の葉（六角星）' },
                      { id: 'seigaiha', label: '青海波（扇形の同心円）' },
                      { id: 'uroko', label: '鱗（三角形の連続）' },
                      { id: 'tatewaku', label: '立涌（波打つ曲線）' },
                    ].map((shp) => (
                      <button
                        key={shp.id}
                        type="button"
                        onClick={() => setGeoBaseShape(shp.id)}
                        className={`py-2 px-2 text-center border rounded-sm transition-all shadow-sm text-xs font-bold ${
                          geoBaseShape === shp.id
                            ? 'bg-zinc-900 text-white border-zinc-900 ring-1 ring-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {shp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-bold text-zinc-800 tracking-wider">
                      柄の配置・配列規則
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'grid', label: '格子整列（Grid）' },
                      { id: 'brick', label: '互の目（Brick）' },
                      { id: 'radial', label: '放射円形（Radial）' },
                    ].map((arr) => (
                      <button
                        key={arr.id}
                        type="button"
                        onClick={() => setGeoArrangement(arr.id)}
                        className={`py-1.5 px-2 text-center border rounded-sm transition-all text-[11px] font-bold ${
                          geoArrangement === arr.id
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {arr.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-200">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-zinc-700 mb-1">
                      <span>密度・繰り返し数</span>
                      <span>{geoCount}</span>
                    </div>
                    <input
                      type="range" min="2" max="24" step="1"
                      value={geoCount}
                      onChange={(e) => setGeoCount(Number(e.target.value))}
                      className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-zinc-700 mb-1">
                      <span>線の太さ</span>
                      <span>{geoStrokeWidth}px</span>
                    </div>
                    <input
                      type="range" min="1" max="15" step="1"
                      value={geoStrokeWidth}
                      onChange={(e) => setGeoStrokeWidth(Number(e.target.value))}
                      className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-700 mb-1">
                    <span>実寸法リピートサイズ</span>
                    <span>{bgSizeMm} mm</span>
                  </div>
                  <input
                    type="range" min="100" max="600" step="10"
                    value={bgSizeMm}
                    onChange={(e) => setBgSizeMm(Number(e.target.value))}
                    className="w-full accent-zinc-900 cursor-pointer h-1 bg-zinc-300 rounded"
                  />
                  <span className="text-[9px] text-zinc-400 mt-0.5 block">反物幅（約400mm）に対する柄の物理的な繰り返しサイズです</span>
                </div>
              </div>
            )}

            {/* 生成ボタン群（常時3つ配置） */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              {creationMode === 'ai' ? (
                <>
                  {/* ボタン①：FLUX（無料スケッチ枠 / 日次15回） */}
                  <button
                    type="button"
                    onClick={() => onGenerate('flux', 'free')}
                    disabled={loading || remainingSketches <= 0}
                    className={`w-full py-3.5 px-4 rounded-sm text-sm font-black tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                      loading || remainingSketches <= 0
                        ? 'bg-zinc-200 text-zinc-400 border border-zinc-300 cursor-not-allowed shadow-none'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg active:scale-[0.99] border border-zinc-950'
                    }`}
                  >
                    <span>⚡</span>
                    <span>スケッチモードで試す (本日残り {remainingSketches}回)</span>
                  </button>

                  {/* ボタン②：OpenAI（無料枠 / 日次1回） */}
                  <button
                    type="button"
                    onClick={() => onGenerate('openai', 'free')}
                    disabled={loading || hasUsedFreeOpenAi}
                    className={`w-full py-3 px-4 rounded-sm text-xs font-black tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 border ${
                      loading || hasUsedFreeOpenAi
                        ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                        : 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-50 hover:shadow active:scale-[0.99]'
                    }`}
                  >
                    <span>🌟</span>
                    <span>丁寧に作るモードで試す (本日無料 {hasUsedFreeOpenAi ? '0' : '1'}回)</span>
                  </button>

                  {/* ボタン③：チケットコード枠（常時配置） */}
                  <div className="p-3 bg-zinc-50 border border-zinc-300 rounded-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-zinc-800 flex items-center gap-1">
                        <span>🎟️</span>
                        <span>プレミアムチケットコードをお持ちの方</span>
                      </span>
                      {ticketRemaining !== null && (
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          残り {ticketRemaining} 回
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={ticketInput}
                        onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                        placeholder="GFK-XXXX-XXXX"
                        disabled={ticketRemaining !== null}
                        className="flex-1 px-3 py-1.5 border border-zinc-300 rounded-sm text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-zinc-900 bg-white"
                      />
                      {ticketRemaining !== null ? (
                        <button
                          type="button"
                          onClick={handleClearTicket}
                          className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold rounded-sm transition-colors"
                        >
                          解除
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleVerifyTicket}
                          disabled={isVerifyingTicket || !ticketInput.trim()}
                          className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-950 text-white text-xs font-bold rounded-sm transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
                        >
                          {isVerifyingTicket ? '確認中...' : '認証'}
                        </button>
                      )}
                    </div>
                    {ticketError && <p className="text-[10px] text-red-600">{ticketError}</p>}

                    <button
                      type="button"
                      onClick={() => onGenerate('openai', 'premium')}
                      disabled={loading || ticketRemaining === null || ticketRemaining <= 0}
                      className={`w-full py-2.5 px-4 rounded-sm text-xs font-black tracking-widest transition-all shadow-sm flex items-center justify-center gap-1.5 border ${
                        loading || ticketRemaining === null || ticketRemaining <= 0
                          ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white border-amber-950 hover:brightness-110 shadow-md active:scale-[0.99]'
                      }`}
                    >
                      <span>✨</span>
                      <span>チケットコードで丁寧に作る</span>
                    </button>
                  </div>
                </>
              ) : (
                /* 幾何学モード：即時生成 */
                <button
                  type="button"
                  onClick={() => onGenerate('flux', 'free')}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-sm text-sm font-black tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>📐</span>
                  <span>幾何学文様をレンダリング</span>
                </button>
              )}
            </div>

            {loading && (
              <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-sm text-center animate-pulse">
                <p className="text-xs font-bold text-zinc-800">{statusText || '図案を生成しています...'}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">※AIの混雑状況によって十数秒〜数十秒かかります</p>
              </div>
            )}
          </div>
        ) : (
          /* お誂え・ご注文・共有タブ */
          <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5 tracking-wider">
                  作品タイトル（銘）
                </label>
                <input
                  type="text"
                  value={patternTitle}
                  onChange={(e) => setPatternTitle(e.target.value)}
                  placeholder="例：朧月夜の黒猫、春霞の七宝..."
                  className="w-full p-2.5 border border-zinc-300 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {serialNumber && (
                <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-sm flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-bold">図案シリアル識別番号：</span>
                  <span className="font-mono font-black text-zinc-900">{serialNumber}</span>
                </div>
              )}

              {/* SNSシェア */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-2 tracking-wider">
                  SNSでデザインを共有・保存
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={shareToX}
                    className="py-2 px-3 bg-black text-white text-[11px] font-bold rounded-sm shadow-sm hover:opacity-85 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>𝕏</span>
                    <span>ポスト</span>
                  </button>
                  <button
                    type="button"
                    onClick={shareToLine}
                    className="py-2 px-3 bg-[#06C755] text-white text-[11px] font-bold rounded-sm shadow-sm hover:opacity-85 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>LINE</span>
                    <span>送る</span>
                  </button>
                  <button
                    type="button"
                    onClick={shareToPinterest}
                    className="py-2 px-3 bg-[#E60023] text-white text-[11px] font-bold rounded-sm shadow-sm hover:opacity-85 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>Pin</span>
                    <span>保存</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWebShare}
                    className="py-2 px-3 bg-zinc-800 text-white text-[11px] font-bold rounded-sm shadow-sm hover:opacity-85 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <span>📤</span>
                    <span>共有</span>
                  </button>
                </div>
              </div>

              {/* プロンプトのコピー */}
              {motif && (
                <div>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="w-full py-2.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>📋</span>
                    <span>{isCopied ? 'プロンプトをコピーしました！' : 'この図案のプロンプトをコピー'}</span>
                  </button>
                </div>
              )}

              {/* チケット購入バナー */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-sm shadow-sm">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0 mt-0.5">🎟️</span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-amber-950">
                      もっとこだわりたい方へ：プレミアムチケット（50回分）
                    </h4>
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                      AI高品質モデル（OpenAI）で納得いくまでじっくり50回生成可能。<br />
                      帯や着物をお仕立ての際、<strong className="text-amber-950">チケット代は全額ポイント還元（実質0円）</strong>されます！
                    </p>
                    <div className="pt-2">
                      <a
                        href="https://store.gofukuyasan.com/view/item/000000007300"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-1.5 bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-bold rounded-sm transition-colors shadow-sm"
                      >
                        プレミアムチケットを購入する（1,100円） →
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* お誂え注文ボタン */}
              <div>
                <a 
                  href="#" 
                  onClick={handleOrderClick} 
                  className="block w-full py-4 mt-2 text-center bg-[#8b1e2a] hover:bg-[#721822] text-white text-[15px] font-black tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] rounded-sm border border-red-900"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-300">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    <span>
                      {itemType === 'scarf' 
                        ? '妄想を現実に（100cm大判ウールスカーフにお仕立て） ＞' 
                        : '妄想を現実に（本物の帯・着物にお仕立て） ＞'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium tracking-wider text-amber-200 mt-1 block">
                    {itemType === 'scarf'
                      ? '（半幅帯と同価格 17,000円前後 / 実質0円対象）'
                      : '（生地・サイズ・仕立て価格をカートで確認する / 実質0円対象）'}
                  </span>
                </a>
                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mt-1.5">
                  ※チケット代（1,100円）は商品購入時に全額ポイント還元（実質0円）されます<br />
                  ※保存した画像から後日いつでもご注文可能です
                </p>
              </div>

              {primaryMotif && (
                <div className="mt-6 p-4 bg-zinc-100 border border-zinc-200 shadow-inner rounded-sm text-center animate-fade-in">
                  <p className="text-[11px] font-bold text-zinc-700 mb-2 leading-relaxed">
                    <span className="text-[9px] text-zinc-500 block mb-1">【 寄り道のご案内 】</span>
                    お客様、もしかして『<span className="text-zinc-950 font-black text-sm">{primaryMotif}</span>』に<br/>目がありませんね？
                  </p>
                  <p className="text-[9px] text-zinc-500 mb-4 leading-relaxed px-2">
                    妄想図案もいいですが……実はゴフクヤサンにも、<br/>自慢の『{primaryMotif}』アイテムがたくさんスタンバイしています。
                  </p>
                  <a 
                    href={makeshopSearchUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block w-full py-3 bg-white border border-zinc-300 text-zinc-800 text-[10px] font-bold tracking-widest hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-colors shadow-sm rounded-sm"
                  >
                    ゴフクヤサンの「{primaryMotif}」コレクションを覗く（無料） →
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
