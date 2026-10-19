'use client';

import { useState, useEffect, type MouseEvent } from 'react';

const FORBIDDEN_WORDS = [
  'ディズニー', 'disney', 'ミッキー', 'mickey', 'ピカチュウ', 'ポケモン', 'pokemon',
  'マリオ', 'mario', 'サンリオ', 'キティ', 'kitty', 'ちいかわ', '鬼滅', '呪術',
  'ワンピース', 'one piece', 'ジブリ', 'トトロ', 'アンパンマン', 'スヌーピー',
  'シャネル', 'chanel', 'ヴィトン', 'vuitton', 'エルメス', 'hermes', 'グッチ', 'gucci',
  'ナイキ', 'nike', 'アディダス', 'adidas'
];

// ★ 6の倍数：ぴったり102色（推し活・色無地対応の伝統色＆ニュアンスカラー）
const TRADITIONAL_COLORS = [
  // 1. 白・灰・黒（12色）
  { name: '胡粉 (ごふん)', hex: '#fffffc', text: '純白地', isDark: false },
  { name: '白磁 (はくじ)', hex: '#f8fbf8', text: '澄んだ白地', isDark: false },
  { name: '生成 (きなり)', hex: '#f6f5ec', text: '淡いアイボリー地', isDark: false },
  { name: '白鼠 (しろねず)', hex: '#dcdddd', text: '淡いライトグレー地', isDark: false },
  { name: '灰桜 (はいざくら)', hex: '#e8d3d1', text: '淡いグレーピンク地', isDark: false },
  { name: '銀鼠 (ぎんねず)', hex: '#afafb0', text: '明るいシルバーグレー地', isDark: false },
  { name: '鉛色 (なまり)', hex: '#7b7c7d', text: 'シックなミディアムグレー地', isDark: true },
  { name: '利休鼠 (りきゅうねず)', hex: '#888e7e', text: '落ち着いたグリーングレー地', isDark: true },
  { name: '墨色 (すみ)', hex: '#595857', text: 'ダークチャコール地', isDark: true },
  { name: '消炭 (けしずみ)', hex: '#524e4d', text: '濃いチャコールグレー地', isDark: true },
  { name: '漆黒 (しっこく)', hex: '#161616', text: '真っ黒な地', isDark: true },
  { name: '濡羽 (ぬれば)', hex: '#0b0b0b', text: '深みのある艶やかな黒地', isDark: true },

  // 2. 赤・深紅（12色）
  { name: '甚三紅 (じんざもみ)', hex: '#ee827c', text: '柔らかなサーモンレッド地', isDark: false },
  { name: '緋色 (ひいろ)', hex: '#d3381c', text: '鮮烈なスカーレットレッド地', isDark: true },
  { name: '朱色 (しゅ)', hex: '#ea5532', text: '鮮やかな朱赤地', isDark: true },
  { name: '紅赤 (べにあか)', hex: '#e54256', text: '鮮やかなルビーレッド地', isDark: true },
  { name: '真紅 (しんく)', hex: '#a22041', text: '深みのあるピュアレッド地', isDark: true },
  { name: '茜色 (あかね)', hex: '#b7282e', text: '温かみのある茜色地', isDark: true },
  { name: '深緋 (こきひ)', hex: '#8b1e2a', text: '深みのあるボルドー地', isDark: true },
  { name: '臙脂 (えんじ)', hex: '#9e2a2b', text: '気品あるクラシックワイン地', isDark: true },
  { name: '蘇芳 (すおう)', hex: '#8e354a', text: '渋いベリーレッド地', isDark: true },
  { name: '紅樺 (べにかば)', hex: '#bb5548', text: '落ち着いたテラコッタレッド地', isDark: true },
  { name: '弁柄 (べんがら)', hex: '#8f2e14', text: '重厚な弁柄赤地', isDark: true },
  { name: '暗紅 (あんこう)', hex: '#5b191f,', text: '極めて深いダークボルドー地', isDark: true },

  // 3. 桃・マゼンタ（12色）
  { name: '桜色 (さくら)', hex: '#fef4f4', text: '淡い桜ピンク地', isDark: false },
  { name: '薄桜 (うすざくら)', hex: '#fdeff2', text: '澄んだミルキーピンク地', isDark: false },
  { name: '一斤染 (いっこん)', hex: '#f4d5cb', text: 'ごく淡いペールピンク地', isDark: false },
  { name: '撫子 (なでしこ)', hex: '#eebbcb', text: '可憐な撫子ピンク地', isDark: false },
  { name: '珊瑚 (さんご)', hex: '#f5b1aa', text: '柔らかなコーラルピンク地', isDark: false },
  { name: '桃色 (もも)', hex: '#f58f98', text: '明るいピーチピンク地', isDark: false },
  { name: '薔薇 (ばら)', hex: '#e9546b', text: '鮮やかなローズピンク地', isDark: true },
  { name: '牡丹 (ぼたん)', hex: '#e7609e', text: '華やかなマゼンタピンク地', isDark: true },
  { name: '躑躅 (つつじ)', hex: '#e95295', text: '鮮烈なショッキングピンク地', isDark: true },
  { name: '韓紅 (からくれない)', hex: '#d9333f', text: '艶やかなクリムゾンピンク地', isDark: true },
  { name: '梅紫 (うめむらさき)', hex: '#a8497a', text: '大人びたダスティベリー地', isDark: true },
  { name: '灰梅 (はいうめ)', hex: '#e8d3ca', text: 'くすみスモーキーピンク地', isDark: false },

  // 4. 橙・琥珀（12色）
  { name: '洗柿 (あらいがき)', hex: '#f2a0a1', text: '淡いサーモンオレンジ地', isDark: false },
  { name: '杏色 (あんず)', hex: '#f7b977', text: '明るいアプリコット地', isDark: false },
  { name: '萱草 (かんぞう)', hex: '#fda14c', text: '温かいマンダリンオレンジ地', isDark: false },
  { name: '蜜柑 (みかん)', hex: '#f08300', text: '鮮やかなビビッドオレンジ地', isDark: true },
  { name: '橙色 (だいだい)', hex: '#ee7800', text: '純粋なオレンジ地', isDark: true },
  { name: '柿色 (かき)', hex: '#ed6d3d', text: '落ち着いた柿色地', isDark: true },
  { name: '黄丹 (おうに)', hex: '#f05a28', text: '気品ある朱橙地', isDark: true },
  { name: '赤橙 (あかだいだい)', hex: '#ea5506', text: '情熱的なブラッドオレンジ地', isDark: true },
  { name: '琥珀 (こはく)', hex: '#bf783a', text: '上品なアンバーキャメル地', isDark: true },
  { name: '煉瓦 (れんが)', hex: '#b55239', text: 'クラシックなテラコッタ地', isDark: true },
  { name: '黄櫨染 (こうろぜん)', hex: '#7d532c', text: '重厚なノーブルアンバー地', isDark: true },
  { name: '枯野 (かれの)', hex: '#d3a243', text: 'くすんだマスタードオレンジ地', isDark: false },

  // 5. 黄・金（12色）
  { name: '蒸栗 (むしくり)', hex: '#ede1a9', text: '淡いミルキーイエロー地', isDark: false },
  { name: '刈安 (かりやす)', hex: '#f5e56b', text: '爽やかなペールレモン地', isDark: false },
  { name: '菜の花 (なのはな)', hex: '#ffec47', text: '明るいカナリアイエロー地', isDark: false },
  { name: '蒲公英 (たんぽぽ)', hex: '#ffd900', text: '鮮やかなビビッドイエロー地', isDark: false },
  { name: '山吹 (やまぶき)', hex: '#f8b500', text: '華やかな黄金・マスタード地', isDark: true },
  { name: '鬱金 (うこん)', hex: '#fabf14', text: '温かみのあるサフランイエロー地', isDark: false },
  { name: '芥子 (からし)', hex: '#d0af4c', text: '渋い辛子色地', isDark: false },
  { name: '金茶 (きんちゃ)', hex: '#c7802d', text: '深みのあるゴールデンブラウン地', isDark: true },
  { name: '黄土 (おうど)', hex: '#c39143', text: '落ち着きのあるオーカー地', isDark: true },
  { name: '桑染 (くわぞめ)', hex: '#b79b5b', text: 'シックなオリーブゴールド地', isDark: false },
  { name: '朽葉 (くちば)', hex: '#917347', text: 'アンティークなゴールドブラウン地', isDark: true },
  { name: '利休白茶 (しらちゃ)', hex: '#b4a992', text: '上品なくすみサンドベージュ地', isDark: false },

  // 6. 緑・萌黄（18色）
  { name: '白緑 (びゃくろく)', hex: '#d6e9ca', text: 'ごく淡いペールミント地', isDark: false },
  { name: '浅緑 (あさみどり)', hex: '#88cb7f', text: '爽やかなライトグリーン地', isDark: false },
  { name: '鶸色 (ひわ)', hex: '#d7cf3a', text: '明るいイエローグリーン地', isDark: false },
  { name: '若草 (わかくさ)', hex: '#abc900', text: 'みずみずしい黄緑地', isDark: false },
  { name: '青磁 (せいじ)', hex: '#7ebea5', text: 'くすんだブルーグリーン地', isDark: false },
  { name: '薄浅葱 (うすあさぎ)', hex: '#93b9b4', text: '淡いスモーキーミント地', isDark: false },
  { name: '柳葉 (やなぎば)', hex: '#a1a46d', text: '穏やかなセージグリーン地', isDark: false },
  { name: '若竹 (わかたけ)', hex: '#68be8d', text: '鮮やかなエメラルドグリーン地', isDark: true },
  { name: '翡翠 (ひすい)', hex: '#38b48b', text: '澄んだジェイドグリーン地', isDark: true },
  { name: '常磐 (ときわ)', hex: '#1b4d3e', text: '深いフォレストグリーン地', isDark: true },
  { name: '萌葱 (もえぎ)', hex: '#006e54', text: '深みのあるモエギグリーン地', isDark: true },
  { name: '千歳緑 (ちとせ)', hex: '#314f40', text: '重厚なダークフォレスト地', isDark: true },
  { name: '松葉 (まつば)', hex: '#455845', text: 'クラシックなパイングリーン地', isDark: true },
  { name: '木賊 (とくさ)', hex: '#3b7960', text: '品格あるディープグリーン地', isDark: true },
  { name: '緑青 (ろくしょう)', hex: '#47885e', text: 'アンティークな青緑地', isDark: true },
  { name: '海松 (みる)', hex: '#726d40', text: '渋いオリーブグリーン地', isDark: true },
  { name: '鶯色 (うぐいす)', hex: '#928c36', text: '落ち着いたモスグリーン地', isDark: true },
  { name: '苔色 (こけ)', hex: '#69821b', text: '味わい深いディープオリーブ地', isDark: true },

  // 7. 青・藍・水色（18色）
  { name: '甕覗 (かめのぞき)', hex: '#a2d7dd', text: 'ごく淡いアイスブルー地', isDark: false },
  { name: '白群 (びゃくぐん)', hex: '#83ccd2', text: '淡いペールブルー地', isDark: false },
  { name: '水色 (みず)', hex: '#bce2e8', text: '澄んだライトブルー地', isDark: false },
  { name: '勿忘草 (わすれな)', hex: '#89c3eb', text: '可憐なパウダーブルー地', isDark: false },
  { name: '空色 (そら)', hex: '#a0d8ef', text: '爽やかなスカイブルー地', isDark: false },
  { name: '露草 (つゆくさ)', hex: '#2ea9df', text: '鮮やかなシアンブルー地', isDark: true },
  { name: '浅葱 (あさぎ)', hex: '#00a3af', text: '鮮やかな青緑・ターコイズ地', isDark: true },
  { name: '錆浅葱 (さびあさぎ)', hex: '#5c9291', text: 'くすんだブルーグレー地', isDark: true },
  { name: '縹色 (はなだ)', hex: '#2792c3', text: '力強いコバルトブルー地', isDark: true },
  { name: '瑠璃 (るり)', hex: '#1e50a2', text: '鮮やかなロイヤルブルー地', isDark: true },
  { name: '群青 (ぐんじょう)', hex: '#4c6cb3', text: '鮮やかなウルトラマリン地', isDark: true },
  { name: '藍色 (あい)', hex: '#163b5c', text: '深いネイビー・藍地', isDark: true },
  { name: '紺青 (こんじょう)', hex: '#192f60', text: '深みのあるダークネイビー地', isDark: true },
  { name: '鉄紺 (てっこん)', hex: '#17184b', text: '極めて暗い紫みの紺地', isDark: true },
  { name: '納戸 (なんど)', hex: '#004055', text: '深みのあるティールブルー地', isDark: true },
  { name: '碧色 (へきしょく)', hex: '#007380', text: '神秘的なピーコックブルー地', isDark: true },
  { name: '藍鉄 (あいてつ)', hex: '#393f4c', text: 'スモーキーなアイアンブルー地', isDark: true },
  { name: '留紺 (とまりこん)', hex: '#1c1c39', text: '漆黒に近い極深紺地', isDark: true },

  // 8. 紫・菫（12色）
  { name: '白藤 (しらふじ)', hex: '#dbd0e6', text: 'ごく淡いペールライラック地', isDark: false },
  { name: '藤色 (ふじ)', hex: '#bbbcde', text: '淡いラベンダー地', isDark: false },
  { name: '紫苑 (しおん)', hex: '#8f77b5', text: '澄んだライトバイオレット地', isDark: true },
  { name: '菖蒲 (あやめ)', hex: '#cc7eb1', text: '明るいオーキッドパープル地', isDark: true },
  { name: '竜胆 (りんどう)', hex: '#9079ad', text: '上品なアメジストパープル地', isDark: true },
  { name: '桔梗 (ききょう)', hex: '#5654a2', text: '鮮やかな青紫・バイオレット地', isDark: true },
  { name: '江戸紫 (えど)', hex: '#745399', text: '濃い赤紫地', isDark: true },
  { name: '古代紫 (こだい)', hex: '#895b8a', text: 'くすんだアンティークパープル地', isDark: true },
  { name: '京紫 (きょう)', hex: '#9d5b8b', text: '華麗な赤みの紫地', isDark: true },
  { name: '葡萄色 (えびいろ)', hex: '#640125', text: '深いワイングレープ地', isDark: true },
  { name: '滅紫 (けしむらさき)', hex: '#594255', text: '非常に暗いグレイッシュパープル地', isDark: true },
  { name: '濃紫 (こむらさき)', hex: '#3a243b', text: '極めて深いディープバイオレット地', isDark: true },

  // 9. 茶・ベージュ（6色）
  { name: '丁子 (ちょうじ)', hex: '#efcd9a', text: '温かいキャメルベージュ地', isDark: false },
  { name: '鳥の子 (とりのこ)', hex: '#dac9a6', text: '温かみのある生成りベージュ地', isDark: false },
  { name: '灰茶 (はいちゃ)', hex: '#98623c', text: 'まろやかなミルクティーブラウン地', isDark: true },
  { name: '胡桃 (くるみ)', hex: '#a86f4c', text: '穏やかなウォルナットブラウン地', isDark: true },
  { name: '栗色 (くりいろ)', hex: '#762f07', text: '深みのあるマロンブラウン地', isDark: true },
  { name: '焦茶 (こげちゃ)', hex: '#693b32', text: '深いダークブラウン・チョコレート地', isDark: true },
];

interface CategoryItem {
  label: string;
  id: string; 
}

const TAG_CATEGORIES: { title: string; items: CategoryItem[] }[] = [
  {
    title: '【1】生き物・モチーフ（MakeShop連動）',
    items: [
      { label: 'ねこ', id: 'ct300' },
      { label: '犬', id: 'ct301' },
      { label: 'うさぎ', id: 'ct303' },
      { label: '鳥類', id: 'ct269' },
      { label: '海・海洋', id: 'ct265' },
      { label: '昆虫', id: 'ct188' },
      { label: '動物', id: 'ct47' },
      { label: '植物・ボタニカル', id: 'ct46' },
      { label: '恐竜・架空動物', id: 'ct267' },
    ]
  },
  {
    title: '【2】世界観・テーマ（MakeShop連動）',
    items: [
      { label: '風景・宇宙', id: 'ct51' },
      { label: '食べ物', id: 'ct48' },
      { label: '音楽', id: 'ct315' },
      { label: '乗り物', id: 'ct320' },
      { label: '建造物', id: 'ct268' },
      { label: '鉱物・宝石', id: 'ct170' },
      { label: '玩具', id: 'ct319' },
      { label: '妖怪・おばけ・ドクロ', id: 'ct175' },
    ]
  },
  {
    title: '【3】柄・地紋（MakeShop連動）',
    items: [
      { label: '水玉（ドット）', id: 'ct310' },
      { label: 'ボーダー・ストライプ', id: 'ct309' },
      { label: 'ギンガム・格子', id: 'ct311' },
      { label: '幾何学模様', id: 'ct53' },
      { label: 'マーブル', id: 'ct171' },
      { label: 'ミリタリー・迷彩', id: 'ct166' },
    ]
  },
  {
    title: '【4】画風・アートスタイル（MakeShop連動）',
    items: [
      { label: '日本画', id: 'ct49' },
      { label: '西洋画', id: 'ct50' },
      { label: '名画', id: 'ct358' },
      { label: 'アールヌーヴォー・デコ', id: 'ct312' },
      { label: 'ミッドセンチュリー', id: 'ct352' },
      { label: 'ゴシック', id: 'ct354' },
      { label: 'オリエンタル', id: 'ct295' },
    ]
  }
];

const ALL_CATEGORIES = TAG_CATEGORIES.flatMap(cat => cat.items);

const LOADING_STEPS = [
  '妄想された意匠から、図案のアイデアを練り上げています...',
  '色や柄の調和を組み合わせ、反物のイメージを整えています...',
  '思い描いたイメージを図案帖に描き出しています...',
  '今回の図案イメージを準備しています...',
  'もう少しで、図案帖に仕上がります...',
  '仕上がりを表示する準備をしています...',
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

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ct334'); 
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('帯');

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

  const handleTagClick = (item: CategoryItem) => {
    if (!motif.includes(item.label)) {
      const newMotif = motif ? `${motif}、${item.label}` : item.label;
      setMotif(newMotif);
    }
    setSelectedCategoryId(item.id);
    setSelectedCategoryName(item.label);
  };

  const handleGenerate = async () => {
    setErrorMsg('');
    if (!motif.trim()) { setErrorMsg('図案のイメージを直接入力するか、上のタグから選択してください。'); return; }
    if (!agreed) { setErrorMsg('図案の利用に関する確認事項への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) { setErrorMsg(`入力内容に使用できない作品名・ブランド名等「${hitWord}」が含まれています。一般的なモチーフや特徴を表す言葉に変更してください。`); return; }

    const matched = ALL_CATEGORIES.find(c => motif.includes(c.label));
    if (matched) {
      setSelectedCategoryId(matched.id);
      setSelectedCategoryName(matched.label);
    }

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
      console.error(error);
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    }
    setLoading(false);
  };

  const finalTitle = patternTitle.trim() || '（無題）';
  const shareText = encodeURIComponent(`ゴフクヤサンの「妄想小紋図案帖」で、頭の中のアイデアを図案にしてみました。\n\n銘：『${finalTitle}』\n地色：${selectedColor.name}\n\n※職人が仕上げる前のAIイメージ図案です。\n\n#妄想小紋図案帖 #ゴフクヤサン`);
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const orderUrl = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(serialNumber)}&title=${encodeURIComponent(finalTitle)}`;

  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: blobUrl, komonId: serialNumber, title: finalTitle }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(`メール送信エラー: ${result.error || '不明なエラー'}`);
        return;
      }

      window.open(orderUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`通信エラーが発生しました: ${err.message}`);
    }
  };

  const makeshopCategoryUrl = `https://store.gofukuyasan.com/view/category/${selectedCategoryId}`;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-[#fdfbf7] rounded-2xl shadow-2xl border border-stone-200 p-6 sm:p-8">
        
        {/* ヘッダーエリア */}
        <div className="text-center mb-6 pb-4 border-b border-stone-200">
          <div className="inline-flex items-center gap-1.5 bg-stone-800 text-amber-200 text-[10px] tracking-widest px-3 py-0.5 rounded uppercase font-bold shadow-sm">
            <img src={IUCHI_LOGO} alt="" className="h-3.5 w-auto object-contain brightness-125" />
            <span>Gofukuyasan Pattern Studio</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <img src={IUCHI_LOGO} alt="居内商店" className="h-10 sm:h-12 w-auto object-contain" />
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-wider text-left leading-tight font-sans">
              妄想小紋図案帖<br className="sm:hidden" />（ずあんちょう）
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-stone-500 mt-2 font-bold">
            着物の配色と柄づくりのノウハウを生かした、自由な意匠づくりのためのアトリエ
          </p>
        </div>

        <div className="space-y-6">
          {/* 壱. 画風・意匠の選択 */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-stone-800 tracking-wider">
                壱. 画風・意匠の選択（任意 / タップで追加）
              </label>
              <button onClick={() => setShowTags(!showTags)} className="text-xs text-stone-500 underline">
                {showTags ? '閉じる' : '開く'}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mb-3">
              ※ボタンの選択は必須ではありません。選ばずに下の入力欄に直接書いてもOKです。
            </p>
            
            {showTags && (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-300">
                {TAG_CATEGORIES.map((cat) => (
                  <div key={cat.title}>
                    <p className="text-[11px] font-bold text-stone-500 mb-1.5">{cat.title}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleTagClick(item)}
                          className="px-2.5 py-1 bg-stone-100 border border-stone-300 rounded-md text-[11px] text-stone-700 hover:bg-stone-800 hover:text-white transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex flex-col mb-1.5">
                <p className="text-[12px] font-bold text-stone-800">
                  ▼ 図案のイメージ（直接入力だけでも生成できます）
                </p>
                <p className="text-[10px] text-amber-800 font-medium leading-relaxed mt-0.5">
                  ※上のタグや地色パレットを選ばなくても大丈夫です。「濃紺の地に、飛び跳ねるうさぎと満月」のように、思いついたイメージを直接ここに入力するだけで図案が作れます！
                </p>
              </div>
              <textarea
                className="w-full rounded-lg border-2 border-stone-300 p-3 bg-stone-50 text-sm focus:outline-none focus:border-stone-800 resize-none font-bold"
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="例：黒地に赤い椿の花、背景には三日月を浮かべて..."
                disabled={loading}
              />
              <button onClick={() => setMotif('')} className="text-[10px] text-stone-500 underline mt-1">クリア</button>
            </div>
          </div>

          {/* 弐. 着物の地色（102色・高さ2/3のh-8仕様） */}
          <div>
            <div className="flex flex-col mb-1.5">
              <div className="flex justify-between items-baseline">
                <label className="block text-xs font-bold text-stone-700 tracking-wider">
                  弐. 着物の地色（任意 / 102の伝統色・推し色から選ぶ）
                </label>
                <span className="text-[10px] text-stone-500 font-bold">全102色</span>
              </div>
              <p className="text-[10px] text-stone-400">
                ※パレットを選ばず、上のテキスト欄に「淡いピンク地」「漆黒地」のように直接書いても反映されます。
              </p>
            </div>
            
            {/* スクロール可能なカラーパレットコンテナ */}
            <div className="max-h-[300px] overflow-y-auto pr-1 border border-stone-200 rounded-xl p-2 bg-stone-50/50 scrollbar-thin scrollbar-thumb-stone-300">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {TRADITIONAL_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`relative h-8 rounded border flex items-center justify-center overflow-hidden transition-all ${
                      selectedColor.name === col.name 
                        ? 'border-stone-900 ring-2 ring-stone-900 ring-offset-0 scale-[1.03] z-10' 
                        : 'border-stone-200 hover:opacity-90'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    <span className={`text-[9px] sm:text-[10px] font-bold tracking-tight px-1 truncate ${
                      col.isDark ? 'text-white' : 'text-stone-800'
                    }`}>
                      {col.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 参. 仕立てるアイテム */}
          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1">
              参. 仕立てるアイテム（柄の比率が変わります）
            </label>
            <div className="flex gap-3 text-xs">
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

          <div className="flex gap-3 text-xs">
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

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs text-stone-600">
            <label className="flex items-start gap-2 font-bold cursor-pointer text-stone-800 leading-snug">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 mt-0.5 rounded text-stone-900 focus:ring-stone-900" />
              <span>既存の作品・キャラクター・ブランド等の模倣を目的として利用しません。AI生成の図案は既存の意匠と似る場合があり、完全な独自性や権利上の問題がないことを保証するものではないと理解しました。実際の生地制作をご希望の場合は、工房で図案を確認し、必要に応じて調整します。</span>
            </label>
          </div>

          {errorMsg && <div className="bg-rose-50 text-rose-800 text-xs font-bold p-3 rounded-lg border border-rose-200">{errorMsg}</div>}

          <button onClick={handleGenerate} disabled={loading} className="w-full bg-stone-900 text-amber-100 font-bold py-4 rounded-xl shadow-lg hover:bg-black disabled:bg-stone-400 disabled:text-stone-200 transition duration-200 tracking-widest text-sm">
            {loading ? '妄想を図案帖に描いています...' : 'この内容で図案を生成する'}
          </button>
        </div>

        {loading && (
          <div className="mt-8 p-6 rounded-xl bg-stone-800 border border-stone-700 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://gofukuyasan.com/wp-content/uploads/2026/10/logo22.jpg')] bg-repeat opacity-5 animate-[slide_20s_linear_infinite]" />
            <p className="text-sm font-bold text-amber-200 relative z-10 tracking-widest leading-relaxed">
              {LOADING_STEPS[loadingStep]}
            </p>
            <div className="mt-4 w-full bg-stone-700 h-1.5 rounded-full overflow-hidden relative z-10">
              <div className="bg-amber-400 h-full animate-[loading_24s_ease-in-out_forwards]" />
            </div>
            <p className="text-[10px] text-stone-400 mt-3 relative z-10">※画像の生成と保存には時間がかかる場合があります。</p>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="mt-8 pt-6 border-t border-stone-200 space-y-4 animate-fade-in">
            <div className="flex justify-center gap-2 text-xs">
              <button onClick={() => setPreviewMode('pattern')} className={`px-4 py-1.5 rounded-full font-bold transition ${previewMode === 'pattern' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>① 図案原画</button>
              <button onClick={() => setPreviewMode('fabric')} className={`px-4 py-1.5 rounded-full font-bold transition ${previewMode === 'fabric' ? 'bg-amber-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>② 反物にした場合のイメージ</button>
            </div>

            <div className="bg-[#fffefb] border-2 border-stone-300 rounded-xl p-4 shadow-xl">
              {previewMode === 'pattern' ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                  <img src={imageUrl} alt="小紋の図案" className="w-full h-auto object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center py-4 bg-stone-200/50 rounded-lg">
                  <span className="text-[11px] text-stone-500 mb-2 font-bold">【反物にした場合のイメージ】</span>
                  <div className="w-full h-64 rounded border-x-4 border-stone-400 shadow-md bg-repeat" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: '120px' }} />
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-dashed border-stone-300 flex justify-between items-end text-stone-700">
                <div>
                  <p className="text-[10px] text-stone-400">図案銘</p>
                  <p className="text-base font-black text-stone-900">{finalTitle}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{serialNumber}</span>
                    <img src={IUCHI_LOGO} alt="" className="h-5 w-auto object-contain" />
                  </div>
                  <p className="text-[9px] text-stone-400">妄想小紋図案帖 / Gofukuyasan</p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <p className="text-xs font-bold text-rose-800 mb-1">＼ お誂えをご希望の方へ ／</p>
              <p className="text-[10px] text-rose-700 mb-3 leading-relaxed">
                生成された画像は、図案のアイデアを確認するためのイメージです。実際の生地として制作する場合は、ご注文後に工房で柄のつながりや色彩バランス、印刷への適性を確認し、必要に応じてデータを調整します。生成画像と実際の生地では、色味や柄の見え方が異なる場合があります。
              </p>
              <a href={orderUrl} onClick={handleOrderClick} className="block w-full bg-rose-800 text-amber-50 font-black py-3 rounded-lg hover:bg-rose-900 transition shadow text-sm tracking-wider cursor-pointer">
                この図案をもとにお誂えを申し込む
              </a>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mt-2">
              <p className="text-xs font-bold text-stone-800 mb-2">👘 この図案に合わせるコーディネート</p>
              <p className="text-[10px] text-stone-600 mb-3 leading-relaxed">
                思い描いた「{selectedCategoryName}」の意匠に合わせて、ゴフクヤサンの実在アイテムをご覧いただけます。
              </p>
              <div className="flex flex-col gap-2">
                <a 
                  href={makeshopCategoryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full bg-white border border-stone-300 text-stone-700 text-center py-2.5 rounded-lg hover:bg-stone-100 transition text-[11px] font-bold shadow-sm"
                >
                  ▶ ゴフクヤサンの「{selectedCategoryName}」カテゴリー商品を見る
                </a>
                <a 
                  href="https://store.gofukuyasan.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full bg-white border border-stone-300 text-stone-700 text-center py-2.5 rounded-lg hover:bg-stone-100 transition text-[11px] font-bold shadow-sm"
                >
                  ▶ 着物・帯・小物 全商品を見る
                </a>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-center bg-stone-100 rounded-lg p-3 border border-stone-200">
                <p className="text-[11px] font-bold text-stone-800 mb-1">【画像の保存・共有】</p>
                <p className="text-[10px] text-stone-600 mb-3">画像を保存して、SNSなどで共有できます。共有の際は、AI生成による図案イメージであることも添えていただけると幸いです。</p>
                
                <a href={blobUrl} download={`${serialNumber || 'komon'}_${finalTitle}.png`} className="flex items-center justify-center gap-2 w-full bg-white text-stone-800 font-bold py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 transition shadow-sm text-[13px] mb-2">
                  <svg className="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  図案画像を端末に保存する
                </a>

                <a href={xShareLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-black text-white font-bold py-3 px-4 rounded-xl hover:bg-stone-800 transition shadow text-[13px]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  この図案をXで共有する
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
