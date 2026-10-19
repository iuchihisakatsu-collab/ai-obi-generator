'use client';

import { useState, useEffect, type MouseEvent } from 'react';

// 1日あたりの生成上限回数
const MAX_GENERATIONS_PER_DAY = 3;

const FORBIDDEN_WORDS = [
  'ディズニー', 'disney', 'ミッキー', 'mickey', 'ピカチュウ', 'ポケモン', 'pokemon',
  'マリオ', 'mario', 'サンリオ', 'キティ', 'kitty', 'ちいかわ', '鬼滅', '呪術',
  'ワンピース', 'one piece', 'ジブリ', 'トトロ', 'アンパンマン', 'スヌーピー',
  'シャネル', 'chanel', 'ヴィトン', 'vuitton', 'エルメス', 'hermes', 'グッチ', 'gucci',
  'ナイキ', 'nike', 'アディダス', 'adidas'
];

// 6の倍数：ぴったり102色（伝統色・推し色対応）
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
  { name: '暗紅 (あんこう)', hex: '#5b191f', text: '極めて深いダークボルドー地', isDark: true },

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


// ==================== 変更箇所（ここから下を上書き） ====================
interface CategoryItem {
  label: string;
  id: string; 
}

const TAG_CATEGORIES: { title: string; items: CategoryItem[] }[] = [
  {
    title: '【1】生き物・モチーフ',
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
      { label: 'リボン・レース', id: 'ct312' },
    ]
  },
  {
    title: '【2】世界観・テーマ',
    items: [
      { label: '風景・宇宙', id: 'ct51' },
      { label: '食べ物・お菓子', id: 'ct48' },
      { label: 'ロリポップ・キャンディ', id: 'ct48' },
      { label: '音楽', id: 'ct315' },
      { label: '乗り物', id: 'ct320' },
      { label: '建造物', id: 'ct268' },
      { label: '鉱物・宝石', id: 'ct170' },
      { label: '玩具', id: 'ct319' },
      { label: '妖怪・おばけ・ドクロ', id: 'ct175' },
    ]
  },
  {
    title: '【3】柄・地紋',
    items: [
      { label: '水玉・ドット', id: 'ct310' },
      { label: '縞・ストライプ', id: 'ct309' },
      { label: '格子・チェック', id: 'ct311' },
      { label: '市松 (いちまつ)', id: 'ct53' },
      { label: '七宝 (しっぽう)', id: 'ct53' },
      { label: '青海波 (せいがいは)', id: 'ct53' },
      { label: '麻の葉 (あさのは)', id: 'ct53' },
      { label: '矢絣 (やがすり)', id: 'ct53' },
      { label: '亀甲 (きっこう)', id: 'ct53' },
      { label: '唐草 (からくさ)', id: 'ct53' },
      { label: '紗綾形 (さやがた)', id: 'ct53' },
      { label: '千鳥格子', id: 'ct311' },
      { label: '幾何学模様', id: 'ct53' },
      { label: 'マーブル', id: 'ct171' },
    ]
  },
  {
    title: '【4】和の技法・様式',
    items: [
      { label: '友禅染め風', id: 'ct49' },
      { label: '紅型 (びんがた) 風', id: 'ct49' },
      { label: '浮世絵タッチ', id: 'ct49' },
      { label: '水墨画', id: 'ct49' },
      { label: '琳派 (りんぱ) 風', id: 'ct49' },
      { label: '絞り染め風', id: 'ct53' },
      { label: '江戸小紋', id: 'ct53' },
      { label: '金彩・蒔絵風', id: 'ct49' },
    ]
  },
  {
    title: '【5】画材・タッチ',
    items: [
      { label: '水彩画', id: 'ct50' },
      { label: '油絵・厚塗り', id: 'ct50' },
      { label: 'ペン画・線画', id: 'ct50' },
      { label: '色鉛筆・パステル', id: 'ct50' },
      { label: '版画・切り絵風', id: 'ct49' },
      { label: 'リアルタッチ・写実的', id: 'ct50' },
      { label: 'アニメ塗り・ポップ', id: 'ct312' },
    ]
  },
  {
    title: '【6】テイスト・雰囲気',
    items: [
      { label: 'ファンシー・ゆめかわ', id: 'ct312' },
      { label: 'ゴスロリ・ロリータ', id: 'ct354' },
      { label: 'レトロ・大正ロマン', id: 'ct49' },
      { label: '西洋名画風', id: 'ct50' },
      { label: 'アールヌーヴォー・デコ', id: 'ct312' },
      { label: 'ゴシック・ダーク', id: 'ct354' },
      { label: 'オリエンタル', id: 'ct295' },
      { label: 'ミッドセンチュリー', id: 'ct352' },
    ]
  }
];

const ALL_CATEGORIES = TAG_CATEGORIES.flatMap(cat => cat.items);
// ==================== 変更箇所（ここまでを上書き） ====================





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
    if (!motif.trim()) { setErrorMsg('図案のイメージを入力するか、上のヒントから選択してください。'); return; }
    if (!agreed) { setErrorMsg('図案の利用に関する確認事項への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) { setErrorMsg(`入力内容に使用できない作品名・ブランド名等「${hitWord}」が含まれています。一般的なモチーフや特徴を表す言葉に変更してください。`); return; }

    // 【追加】1日3回の制限チェック
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('komon_generations');
    
    let generationCount = 0;
    let storedDate = '';

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        storedDate = parsedData.date;
        generationCount = parsedData.count;
      } catch (e) {
        console.error("Local storage parse error:", e);
      }
    }

    if (storedDate !== today) {
      generationCount = 0;
    }

    if (generationCount >= MAX_GENERATIONS_PER_DAY) {
      alert(`【本日の上限に達しました🙏】\n\nお試しいただきありがとうございます！\nAIのサーバー利用料（課金）が高額になってしまうため、無料での作成は「お一人様1日3回まで」とさせていただいております。\n\nまた明日、新しい図案を作りに来てくださいね！`);
      return;
    }

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

        // 【追加】生成成功時のみカウントを1増やす
        const newCount = generationCount + 1;
        localStorage.setItem('komon_generations', JSON.stringify({
          date: today,
          count: newCount
        }));
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
  const shareText = encodeURIComponent(`ゴフクヤサンの「妄想小紋図案帖」で、柄のアイデアを試してみました。\n\n銘：『${finalTitle}』\n地色：${selectedColor.name}\n\n※AIによるアイデア図案です。実際の生地制作時は工房で調整します。\n\n#妄想小紋図案帖 #ゴフクヤサン`);
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
          <p className="text-[11px] sm:text-xs text-stone-600 mt-2 font-medium leading-relaxed">
            着物の配色や柄づくりの知識を生かして、思いついた柄のアイデアを試せるAI図案ツールです。<br className="hidden sm:inline" />
            伝統的なモチーフも、今の気分も。自由に組み合わせて、あなただけの柄の可能性を探してみてください。
          </p>
        </div>

        <div className="space-y-6">
          {/* 壱. 図案のヒント（任意） */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-bold text-stone-800 tracking-wider">
                壱. 図案のヒント（任意 / タップで追加）
              </label>
              <button onClick={() => setShowTags(!showTags)} className="text-xs text-stone-500 underline">
                {showTags ? '閉じる' : '開く'}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mb-3">
              ※タグは選ばなくても大丈夫です。下の入力欄に、思い浮かんだイメージを直接書いても図案を生成できます。
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

            {/* 図案のイメージ（自由入力） */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex flex-col mb-1.5">
                <p className="text-[12px] font-bold text-stone-800">
                  ▼ 図案のイメージ（自由入力）
                </p>
                <p className="text-[10px] text-stone-500 font-normal leading-relaxed mt-0.5">
                  思いついた言葉を自由に組み合わせてください。入力した内容をもとにAIが図案を生成します（イメージどおりにならない場合もあります）。
                </p>
              </div>
              <textarea
                className="w-full rounded-lg border-2 border-stone-300 p-3 bg-stone-50 text-sm focus:outline-none focus:border-stone-800 resize-none font-medium"
                rows={3}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="例：濃紺の地に、跳ねるうさぎと満月。余白を生かした、少しレトロな小紋柄"
                disabled={loading}
              />
              <button onClick={() => setMotif('')} className="text-[10px] text-stone-500 underline mt-1">クリア</button>
            </div>
          </div>

          {/* 弐. 地色を選ぶ（任意・全102色） */}
          <div>
            <div className="flex flex-col mb-1.5">
              <div className="flex justify-between items-baseline">
                <label className="block text-xs font-bold text-stone-700 tracking-wider">
                  弐. 地色を選ぶ（任意・全102色）
                </label>
                <span className="text-[10px] text-stone-500 font-bold">全102色</span>
              </div>
              <p className="text-[10px] text-stone-500">
                着物の伝統色を中心に、好みの色を選べます。パレットを使わず、入力欄に「淡いピンク地」「漆黒地」などと書くこともできます。
              </p>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-1 border border-stone-200 rounded-xl p-2 bg-stone-50/50 scrollbar-thin scrollbar-thumb-stone-300">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                {TRADITIONAL_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`relative h-14 rounded-lg p-1.5 flex flex-col justify-between text-left transition-all border ${
                      selectedColor.name === col.name
                        ? 'ring-2 ring-stone-900 border-stone-900 scale-95 shadow-md'
                        : 'border-stone-200 hover:border-stone-400'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  >
                    <span className={`text-[10px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-stone-900'}`}>
                      {col.name}
                    </span>
                    {selectedColor.name === col.name && (
                      <span className={`text-[9px] self-end font-bold px-1 rounded ${col.isDark ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}`}>
                        選択中
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 参. 柄の密度 */}
          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1.5">
              参. 柄の密度
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['総柄（ぎっしり華やか）', '飛び柄（余白のある小紋）'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    density === d
                      ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 四. 図案の比率・形式 */}
          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1.5">
              四. 図案の比率・形式
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hanhaba', label: '半幅帯 (横長)' },
                { id: 'tanmono', label: '反物・着尺 (縦長)' },
                { id: 'square', label: '正方形 (基本)' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setItemType(item.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    itemType === item.id
                      ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 伍. 図案銘（命名・任意） */}
          <div>
            <label className="block text-xs font-bold text-stone-700 tracking-wider mb-1.5">
              伍. 図案の銘（命名・任意）
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-2 border-stone-300 p-2.5 bg-stone-50 text-sm focus:outline-none focus:border-stone-800 font-medium"
              placeholder="例：月夜の跳ね兎"
              value={patternTitle}
              onChange={(e) => setPatternTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 利用規約同意チェック */}
          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-800"
              />
              <span className="text-[11px] text-stone-600 leading-snug">
                生成された図案はAIによるアイデアイメージであり、実際の生地制作・捺染時には工房の職人の手でデータ調整が行われること、および公序良俗・権利侵害のない利用に同意します。
              </span>
            </label>
          </div>

          {/* エラーメッセージ */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-bold">
              {errorMsg}
            </div>
          )}

          {/* 生成実行ボタン */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-base hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-1 py-1">
                <span className="text-sm">{LOADING_STEPS[loadingStep]}</span>
                <span className="text-[10px] text-stone-300">少々お待ちください...</span>
              </div>
            ) : (
              <span>👘 妄想小紋図案帖に描き出す（1日3回まで）</span>
            )}
          </button>
        </div>

        {/* 生成結果表示エリア */}
        {imageUrl && (
          <div className="mt-8 pt-8 border-t border-stone-200">
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-md">
              <div className="flex justify-between items-baseline mb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-stone-800 text-amber-200 px-2 py-0.5 rounded">
                    {serialNumber}
                  </span>
                  <h2 className="text-lg font-bold text-stone-900 mt-1">銘：『{finalTitle}』</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('pattern')}
                    className={`text-xs px-2.5 py-1 rounded border ${previewMode === 'pattern' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    図案
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('fabric')}
                    className={`text-xs px-2.5 py-1 rounded border ${previewMode === 'fabric' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}
                  >
                    帯プレビュー
                  </button>
                </div>
              </div>

              {/* 画像プレビュー */}
              <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center min-h-[300px]">
                {previewMode === 'pattern' ? (
                  <img src={imageUrl} alt={finalTitle} className="w-full h-auto object-contain max-h-[500px]" />
                ) : (
                  <div 
                    className="w-full h-[360px] bg-repeat shadow-inner"
                    style={{ 
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: '200px auto'
                    }}
                  />
                )}
              </div>

              {/* アクションボタン群 */}
              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={blobUrl || imageUrl}
                    download={`komon-${serialNumber}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 text-center bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-lg border border-stone-300 transition-colors"
                  >
                    💾 図案を保存する
                  </a>
                  <a
                    href={xShareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 text-center bg-black hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>𝕏 で共有する</span>
                  </a>
                </div>

                <a
                  href={orderUrl}
                  onClick={handleOrderClick}
                  className="block w-full py-3.5 text-center bg-[#8b1e2a] hover:bg-[#731923] text-white text-sm font-bold rounded-xl shadow-md transition-all"
                >
                  👘 この図案をもとにお誂えを申し込む
                </a>

                <div className="text-center pt-2">
                  <a
                    href={makeshopCategoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-500 hover:text-stone-800 underline"
                  >
                    似たモチーフ（{selectedCategoryName}）の既製帯・着物を見る →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
