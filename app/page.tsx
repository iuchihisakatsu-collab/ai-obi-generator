'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, type MouseEvent, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  generateStripeSvg, 
  generateDotSvg, 
  generateGridSvg, 
  generateGinghamSvg,
  generateCheckerSvg, 
  svgToHighResPng, 
  type StripeDirection, 
  type DotLayout 
} from './utils/geometricPatterns';

const MAX_GENERATIONS_PER_DAY = 3;

const FORBIDDEN_WORDS = [
  'ディズニー', 'disney', 'ミッキー', 'mickey', 'ピカチュウ', 'ポケモン', 'pokemon',
  'マリオ', 'mario', 'サンリオ', 'キティ', 'kitty', 'ちいかわ', '鬼滅', '呪術',
  'ワンピース', 'one piece', 'ジブリ', 'トトロ', 'アンパンマン', 'スヌーピー',
  'シャネル', 'chanel', 'ヴィトン', 'vuitton', 'エルメス', 'hermes', 'グッチ', 'gucci',
  'ナイキ', 'nike', 'アディダス', 'adidas'
];

const TRADITIONAL_COLORS = [
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

  { name: '甕覗 (かめのぞき)', text: 'ごく淡いアイスブルー地', hex: '#a2d7dd', isDark: false },
  { name: '白群 (びゃくぐん)', text: '淡いペールブルー地', hex: '#83ccd2', isDark: false },
  { name: '水色 (みず)', text: '澄んだライトブルー地', hex: '#bce2e8', isDark: false },
  { name: '勿忘草 (わすれな)', text: '可憐なパウダーブルー地', hex: '#89c3eb', isDark: false },
  { name: '空色 (そら)', text: '爽やかなスカイブルー地', hex: '#a0d8ef', isDark: false },
  { name: '露草 (つゆくさ)', text: '鮮やかなシアンブルー地', hex: '#2ea9df', isDark: true },
  { name: '浅葱 (あさぎ)', text: '鮮やかな青緑・ターコイズ地', hex: '#00a3af', isDark: true },
  { name: '錆浅葱 (さびあさぎ)', text: 'くすんだブルーグレー地', hex: '#5c9291', isDark: true },
  { name: '縹色 (はなだ)', text: '力強いコバルトブルー地', hex: '#2792c3', isDark: true },
  { name: '瑠璃 (るり)', text: '鮮やかなロイヤルブルー地', hex: '#1e50a2', isDark: true },
  { name: '群青 (ぐんじょう)', text: '鮮やかなウルトラマリン地', hex: '#4c6cb3', isDark: true },
  { name: '藍色 (あい)', text: '深いネイビー・藍地', hex: '#163b5c', isDark: true },
  { name: '紺青 (こんじょう)', text: '深みのあるダークネイビー地', hex: '#192f60', isDark: true },
  { name: '鉄紺 (てっこん)', text: '極めて暗い紫みの紺地', hex: '#17184b', isDark: true },
  { name: '納戸 (なんど)', text: '深みのあるティールブルー地', hex: '#004055', isDark: true },
  { name: '碧色 (へきしょく)', text: '神秘的なピーコックブルー地', hex: '#007380', isDark: true },
  { name: '藍鉄 (あいてつ)', text: 'スモーキーなアイアンブルー地', hex: '#393f4c', isDark: true },
  { name: '留紺 (とまりこん)', text: '漆黒に近い極深紺地', hex: '#1c1c39', isDark: true },

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
    title: '【1】生き物・モチーフ',
    items: [
      { label: 'ねこ', id: 'ct300' },
      { label: '犬', id: 'ct301' },
      { label: 'うさぎ', id: 'ct303' },    
      { label: '虎', id: 'ct303' },    
      { label: '蛇', id: 'ct303' },
      { label: '鳥', id: 'ct269' },
      { label: '魚', id: 'ct265' },
      { label: '昆虫', id: 'ct188' },
      { label: '動物', id: 'ct47' },
      { label: '植物', id: 'ct46' },
      { label: '恐竜', id: 'ct267' },
      { label: 'リボン・レース', id: 'ct312' },
    ]
  },
  {
    title: '【2】世界観・テーマ',
    items: [
      { label: '宇宙', id: 'ct51' },
      { label: 'お菓子', id: 'ct48' },
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
      { label: '市松', id: 'ct53' },
      { label: '七宝', id: 'ct53' },     
      { label: '疋田絞', id: 'ct53' },
      { label: '青海波', id: 'ct53' },
      { label: '麻の葉', id: 'ct53' },
      { label: '矢絣', id: 'ct53' },
      { label: '亀甲', id: 'ct53' },
      { label: '唐草', id: 'ct53' },
      { label: '紗綾形', id: 'ct53' },
      { label: '千鳥格子', id: 'ct311' },
      { label: '幾何学模様', id: 'ct53' },
      { label: '墨流', id: 'ct171' },
    ]
  },
  {
    title: '【4】和の技法・様式',
    items: [
      { label: '友禅染め風', id: 'ct49' },
      { label: '紅型', id: 'ct49' },
      { label: '浮世絵', id: 'ct49' },
      { label: '水墨画', id: 'ct49' },
      { label: '琳派', id: 'ct49' },
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

const LOADING_STEPS = [
  '思い描いた意匠から、図案のアイデアを練り上げています...',
  '色や柄の調和を組み合わせ、反物のイメージを整えています...',
  '思い描いたイメージを図案帳に描き出しています...',
  '今回の図案イメージを準備しています...',
  'もう少しで、図案帳に仕上がります...',
  '仕上がりを表示する準備をしています...',
];

function HomeContent() {
  const searchParams = useSearchParams();
  const isShopify = searchParams.get('platform') === 'shopify';
  const SHOW_MAKESHOP_LINKS_ON_SHOPIFY = false;

  const [motif, setMotif] = useState('');
  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  const [density, setDensity] = useState('四方柄（上下なし・散らし柄）');
  const [itemType, setItemType] = useState('hanhaba'); 
  const [patternTitle, setPatternTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imageUrl, setImageUrl] = useState(''); 
  const [blobUrl, setBlobUrl] = useState('');    
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [displayMode, setDisplayMode] = useState<'fabric' | 'obi' | 'kyobukuro' | 'kimono'>('fabric');
  
  const [mockupSubmitting, setMockupSubmitting] = useState(false);
  const [mockupSuccess, setMockupSuccess] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [designFee, setDesignFee] = useState<number>(100);

  const [showTags, setShowTags] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ct334'); 

  const [creationMode, setCreationMode] = useState<'ai' | 'geometric'>('ai');
  const [geoPatternType, setGeoPatternType] = useState<'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>('stripe');
  const [stripeDir, setStripeDir] = useState<StripeDirection>('vertical');
  const [lineWidth, setLineWidth] = useState(5);
  const [gapWidth, setGapWidth] = useState(10);
  const [dotRadius, setDotRadius] = useState(5);
  const [dotLayout, setDotLayout] = useState<DotLayout>('staggered');
  
  const [geoBgColor, setGeoBgColor] = useState('#fffffc');
  const [geoPatternColor, setGeoPatternColor] = useState('#161616');
  const [showGeoPaletteFor, setShowGeoPaletteFor] = useState<'bg' | 'pattern' | null>(null);
  
  const [bgSizeMm, setBgSizeMm] = useState(100);
  
  const [obiLiningColor, setObiLiningColor] = useState('#8f2e14'); // デフォルト弁柄
  const [showLiningPalette, setShowLiningPalette] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('komon_generations');
    let count = 0;
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === today) {
          count = parsed.count;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setRemainingCount(Math.max(0, MAX_GENERATIONS_PER_DAY - count));
  }, []);

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

  useEffect(() => {
    if (motif.trim() === 'ベホイミ') {
      localStorage.removeItem('komon_generations');
      setRemainingCount(MAX_GENERATIONS_PER_DAY);
      setMotif('');
      alert('【管理者モード】本日の生成回数を全回復しました！✨');
    }
  }, [motif]);

  const updateGeometricPattern = useCallback(async () => {
    if (creationMode !== 'geometric') return;

    let svgString = '';
    let tileSize = 0;

    const period = lineWidth + gapWidth;
    const dotPitch = (dotRadius * 2) + gapWidth;

    if (geoPatternType === 'stripe') {
      svgString = generateStripeSvg({ direction: stripeDir, lineWidth, gap: gapWidth, bgColor: geoBgColor, stripeColor: geoPatternColor });
      tileSize = stripeDir === 'diagonal' ? period * 2 : period;
    } else if (geoPatternType === 'dot') {
      svgString = generateDotSvg({ layout: dotLayout, radius: dotRadius, gap: gapWidth, bgColor: geoBgColor, dotColor: geoPatternColor });
      tileSize = dotPitch; 
    } else if (geoPatternType === 'grid') {
      svgString = generateGridSvg({ lineWidth, gap: gapWidth, bgColor: geoBgColor, gridColor: geoPatternColor });
      tileSize = period;
    } else if (geoPatternType === 'gingham') {
      svgString = generateGinghamSvg({ lineWidth, gap: gapWidth, bgColor: geoBgColor, checkColor: geoPatternColor });
      tileSize = period;
    } else if (geoPatternType === 'checker') {
      svgString = generateCheckerSvg({ blockSize: lineWidth, bgColor: geoBgColor, checkColor: geoPatternColor });
      tileSize = lineWidth * 2;
    }

    setBgSizeMm(tileSize);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
    setImageUrl(svgDataUrl);
    const highResPng = await svgToHighResPng(svgString, 2400);
    setBlobUrl(highResPng);
    setSerialNumber(prev => prev.startsWith('GEO-') ? prev : `GEO-${Math.floor(1000 + Math.random() * 9000)}`);
    
    let newTitle = '無題';
    if (geoPatternType === 'stripe') newTitle = '万筋縞';
    if (geoPatternType === 'dot') newTitle = '千鳥水玉';
    if (geoPatternType === 'grid') newTitle = '格子柄';
    if (geoPatternType === 'gingham') newTitle = 'ギンガムチェック';
    if (geoPatternType === 'checker') newTitle = '市松模様';

    setPatternTitle(prev => {
      if (!prev || ['万筋縞', '千鳥水玉', '格子柄', 'ギンガムチェック', '市松模様'].includes(prev)) {
        return newTitle;
      }
      return prev;
    });
  }, [creationMode, geoPatternType, stripeDir, lineWidth, gapWidth, dotLayout, dotRadius, geoBgColor, geoPatternColor]);

  useEffect(() => {
    updateGeometricPattern();
  }, [updateGeometricPattern]);

  const handleTagClick = (item: CategoryItem) => {
    if (!motif.includes(item.label)) {
      const newMotif = motif ? `${motif}、${item.label}` : item.label;
      setMotif(newMotif);
    }
    setSelectedCategoryId(item.id);
  };

  const handleColorToggle = (col: typeof TRADITIONAL_COLORS[0]) => {
    setSelectedColors((prev) => {
      const exists = prev.some((c) => c.name === col.name);
      if (exists) {
        return prev.filter((c) => c.name !== col.name);
      } else {
        if (prev.length >= 3) {
          alert('配色は最大3色まで選択できます。');
          return prev;
        }
        return [...prev, col];
      }
    });
  };

  const handleGenerate = async () => {
    setErrorMsg('');

    if (!motif.trim()) { setErrorMsg('図案のイメージや好きな言葉を入力してください。'); return; }
    if (!agreed) { setErrorMsg('図案の利用に関する確認事項への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) { setErrorMsg(`入力内容に使用できない作品名・ブランド名等「${hitWord}」が含まれています。一般的なモチーフや特徴を表す言葉に変更してください。`); return; }

    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('komon_generations');
    
    let currentCount = 0;
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.date === today) {
          currentCount = parsedData.count;
        }
      } catch (e) {
        console.error("Local storage parse error:", e);
      }
    }

    if (currentCount >= MAX_GENERATIONS_PER_DAY) {
      setRemainingCount(0);
      alert(`【本日の上限に達しました🙏】\n\nお試しいただきありがとうございます！\nAIのサーバー利用料（課金）が高額になってしまうため、無料での作成は「お一人様1日3回まで」とさせていただいております。\n\nまた明日、新しい図案を作りに来てくださいね！`);
      return;
    }

    const matched = ALL_CATEGORIES.find(c => motif.includes(c.label));
    if (matched) {
      setSelectedCategoryId(matched.id);
    }

    const colorPayload = selectedColors.length > 0 
      ? selectedColors.map(c => c.text).join('と') 
      : 'モチーフ入力内容に準拠した配色';

    setLoading(true);
    setMockupSuccess(false);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif, color: colorPayload, density, itemType }),
      });
      const data = await res.json();

      if (data.imageUrl && data.blobUrl) {
        setImageUrl(data.imageUrl); 
        setBlobUrl(data.blobUrl);   
        setSerialNumber(`KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
        
        setDisplayMode('fabric');

        const newCount = currentCount + 1;
        localStorage.setItem('komon_generations', JSON.stringify({
          date: today,
          count: newCount
        }));
        setRemainingCount(Math.max(0, MAX_GENERATIONS_PER_DAY - newCount));
      } else {
        setErrorMsg(data.error || '図案の生成に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    const targetUrl = blobUrl || imageUrl;
    if (!targetUrl) return;

    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${serialNumber || 'pattern'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map(c => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = encodeURIComponent(`「妄想図案帳」で、柄のアイデアを試してみました。\n\n銘：『${finalTitle}』\n配色：${colorSummary}\n\n※AIによるアイデア図案です。実際の生地制作時はスタッフが人の目で調整します。\n\n#妄想図案帳`);
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  
  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      let finalImageUrl = blobUrl || imageUrl;

      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: finalImageUrl,
            filename: `${serialNumber}.png`,
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          finalImageUrl = uploadData.url;
          setBlobUrl(uploadData.url); 
        }
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: finalImageUrl, komonId: serialNumber, title: finalTitle }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(`メール送信エラー: ${result.error || '不明なエラー'}`);
        return;
      }

      const copyText = `図案ID: ${serialNumber}\n銘: ${finalTitle}`;
      try {
        await navigator.clipboard.writeText(copyText);
        alert(`【工場へのデータ送信完了】\n図案「${finalTitle}」の高解像度データを工場へ送信しました。\n\n画面切り替え後、MakeShopのシリアル番号欄に「${serialNumber}」が自動入力されているかご確認ください。`);
      } catch (err) {
        console.warn('クリップボードのコピーに失敗しました', err);
      }

     const cleanOrderUrl = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(serialNumber)}&title=${encodeURIComponent(finalTitle)}&image_url=${encodeURIComponent(finalImageUrl)}`;
      window.location.href = cleanOrderUrl;
      
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(`通信エラーが発生しました`);
    }
  };

  const handleVirtualProductSubmit = async () => {
    setMockupSubmitting(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/shopify-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: finalTitle,
          imageUrl: blobUrl || imageUrl,
          vendor: 'Printag Creator',
          designFee: designFee,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Shopifyへの連携に失敗しました');
      }

      setMockupSuccess(true);
      alert(`【登録完了】\n図案「${finalTitle}」（デザインフィー: ¥${designFee}）をShopifyへ下書き登録しました！`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '通信エラーが発生しました。');
      alert(`連携エラー: ${err.message}`);
    } finally {
      setMockupSubmitting(false);
    }
  };

  const makeshopCategoryUrl = `https://store.gofukuyasan.com/view/category/${selectedCategoryId}`;

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 p-4 sm:p-8 flex flex-col items-center justify-center font-sans selection:bg-zinc-200">
      <div className="max-w-2xl w-full bg-white border border-zinc-200 p-6 sm:p-12">
        
        {/* ① ヘッダーエリア */}
        <div className="text-center mb-8 p-8 sm:p-10 bg-zinc-950 text-white">
          <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-center leading-tight">
            {isShopify ? 'プリンタグ見本帳' : '妄想図案帳'}
          </h1>
          <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-medium tracking-wider">
            {isShopify ? (
              <>
                新潟デジタル捺染工場（モナリザ）直結のテキスタイル制作スタジオ。<br className="hidden sm:inline" />
                AIや幾何学文様から図案をデザインし、デザインフィーを設定してShopifyへ即時展開できます。
              </>
            ) : (
              <>
                新潟・十日町は着物の産地 着物の配色や柄づくりの知識を生かして、<br className="hidden sm:inline" />
                思いついた柄のアイデアを試せるAI図案ツールです。
              </>
            )}
          </p>
        </div>

        {/* モード切替タブ */}
        <div className="flex bg-zinc-50 border border-zinc-200 p-1 mb-8">
          <button
            type="button"
            onClick={() => setCreationMode('ai')}
            className={`flex-1 py-3 text-xs font-black tracking-wider transition-all ${
              creationMode === 'ai' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            ✨ AI妄想モード
          </button>
          <button
            type="button"
            onClick={() => setCreationMode('geometric')}
            className={`flex-1 py-3 text-xs font-black tracking-wider transition-all ${
              creationMode === 'geometric' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            📐 格子・水玉製作所
          </button>
        </div>

        <div className="space-y-8">
          {creationMode === 'ai' ? (
            <>
              {/* 壱. プロンプト自由入力 */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                    01. 図案のイメージ・プロンプト <span className="text-[10px] text-zinc-400 font-normal">（自由に入力してください）</span>
                  </label>
                  {motif && (
                    <button 
                      onClick={() => setMotif('')} 
                      className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 tracking-widest uppercase transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <textarea
                    className="w-full border border-zinc-300 p-4 bg-white text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium"
                    rows={4}
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="例：上から見た金魚。赤い金魚と黒出目金。水草。地色は白、ターコイズの流水柄。版画・切り絵風、ミッドセンチュリー"
                    disabled={loading}
                  />
                </div>

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setShowTags(!showTags)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors py-1"
                  >
                    <span>💡 {showTags ? 'ヒントを閉じる' : '図案のヒント・キーワードを探す'}</span>
                    <span className="text-[9px] transform transition-transform duration-200">{showTags ? '▲' : '▼'}</span>
                  </button>
                </div>

                {showTags && (
                  <div className="mt-3 p-4 bg-zinc-50 border border-zinc-200 space-y-4 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 animate-fade-in">
                    <p className="text-[11px] text-zinc-500 font-medium">クリックすると入力欄にキーワードが追加されます：</p>
                    {TAG_CATEGORIES.map((cat) => (
                      <div key={cat.title}>
                        <p className="text-[10px] font-bold text-zinc-400 tracking-wider mb-1.5">{cat.title}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.items.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => handleTagClick(item)}
                              className="px-3 py-1 bg-white border border-zinc-200 text-[11px] font-medium text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all duration-150"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 弐. 配色・地色 */}
              <div className="pt-2 border-t border-zinc-100">
                <div className="flex justify-between items-baseline mb-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 tracking-wider">
                      02. 配色・地色 <span className="text-[10px] text-zinc-400 font-normal">（迷ったら選択 / 複数OK）</span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">※上の入力欄に「地色は白」のように書くこともできます</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColorPalette(!showColorPalette)}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
                  >
                    <span>🎨 {showColorPalette ? 'パレットを閉じる' : '色見本から選ぶ (102色)'}</span>
                    <span className="text-[9px] transform transition-transform duration-200">{showColorPalette ? '▲' : '▼'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
                  {selectedColors.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">指定なし（入力欄の指定、またはAIの配色におまかせ）</span>
                  ) : (
                    <>
                      {selectedColors.map((col) => (
                        <span
                          key={col.name}
                          onClick={() => handleColorToggle(col)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold border cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: col.hex,
                            color: col.isDark ? '#fff' : '#000',
                            borderColor: 'rgba(0,0,0,0.1)'
                          }}
                        >
                          {col.name.split(' ')[0]}
                          <span className="text-[10px] opacity-70">✕</span>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedColors([])}
                        className="text-[10px] text-zinc-400 hover:text-zinc-700 underline ml-1"
                      >
                        リセット
                      </button>
                    </>
                  )}
                </div>

                {showColorPalette && (
                  <div className="mt-3 p-4 bg-zinc-50 border border-zinc-200 animate-fade-in">
                    <p className="text-[10px] text-zinc-500 font-medium mb-3">タップして選択（最大3色まで組み合わせ可能）：</p>
                    <div className="max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {TRADITIONAL_COLORS.map((col) => {
                          const isSelected = selectedColors.some((c) => c.name === col.name);
                          return (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => handleColorToggle(col)}
                              className={`relative h-12 p-2 flex flex-col justify-end text-left transition-all duration-200 ${
                                isSelected
                                  ? 'ring-2 ring-offset-2 ring-zinc-950 scale-95 font-black'
                                  : 'border border-zinc-200/50 hover:scale-105'
                              }`}
                              style={{ backgroundColor: col.hex }}
                            >
                              <span className={`text-[9px] font-bold tracking-wider truncate leading-tight flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {col.name.split(' ')[0]}
                                {isSelected && <span>✓</span>}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 参. 形式と密度 */}
              <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-zinc-100">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-3">
                    03. 柄の配置・密度
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: '四方柄（上下なし・散らし柄）', label: '四方柄（上下なし・裁断しやすい）' },
                      { id: '総柄（ぎっしり華やか）', label: '総柄（ぎっしり華やか）' },
                      { id: '飛び柄（余白のある小紋）', label: '飛び柄（余白のある小紋）' },
                      { id: 'お太鼓柄（ワンポイント/1枚絵）', label: 'お太鼓柄（ワンポイント/1枚絵）' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDensity(item.id)}
                        className={`py-2.5 px-3.5 text-xs font-bold tracking-wider transition-all duration-200 text-left border ${
                          density === item.id
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-3">
                    04. 形式・アスペクト比
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'square', label: '正方形 (小物・お太鼓・リピート用)' },
                      { id: 'hanhaba', label: '半幅帯 (横長 16:9)' },
                      { id: 'tanmono', label: '反物・着尺 (縦長 9:16)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setItemType(item.id)}
                        className={`py-2.5 px-3.5 text-xs font-bold tracking-wider transition-all duration-200 text-left border ${
                          itemType === item.id
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 伍. 図案銘 */}
              <div className="pt-2 border-t border-zinc-100">
                <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">
                  05. 図案銘 <span className="text-[10px] text-zinc-400 font-normal">（任意・作品タイトル）</span>
                </label>
                <input
                  type="text"
                  className="w-full border border-zinc-300 p-3 bg-zinc-50 text-sm focus:outline-none focus:border-zinc-900 focus:bg-white transition-all duration-200"
                  placeholder="例：遊泳金魚図"
                  value={patternTitle}
                  onChange={(e) => setPatternTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* ゴフクヤサン通常時のみ表示する回復呪文バナー */}
              {!isShopify && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 text-center">
                  <p className="mb-1 text-xs font-bold text-zinc-800">
                    ⚠️ 3回じゃ理想の柄が作れない方へ
                  </p>
                  <p className="mb-3 text-[11px] text-zinc-500">
                    本気でお誂えをご検討中の方限定で、生成回数をリセットできる【回復呪文】をお渡しします。
                  </p>
                  <a 
                    href="https://store.gofukuyasan.com/html/email.html" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block px-4 py-2 bg-zinc-800 text-white no-underline text-xs font-bold hover:bg-zinc-700 transition-colors"
                  >
                    ✉️ 回復呪文をリクエストする（お問い合わせフォームへ）
                  </a>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100">
                <label className="flex items-start gap-3 cursor-pointer select-none mb-6 group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors"
                  />
                  <span className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-800 transition-colors">
                    生成された図案はAIによるアイデアイメージであり、実際の生地制作・捺染時には工房の職職人の手でデータ調整が行われること、および公序良俗・権利侵害のない利用に同意します。
                  </span>
                </label>

                {errorMsg && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-wide">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || remainingCount === 0}
                  className={`w-full py-4 sm:py-5 font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                    remainingCount === 0
                      ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                      : 'bg-zinc-950 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <span>{LOADING_STEPS[loadingStep]}</span>
                      <span className="text-[9px] text-zinc-400 font-normal">PROCESSING...</span>
                    </div>
                  ) : (
                    <span>
                      {remainingCount === 0
                        ? '本日の上限に達しました (3/3)'
                        : `図案を描き出す (残り ${remainingCount ?? 3} 回)`}
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* 幾何学モード UI */
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 p-4 text-xs mb-4">
                <p className="font-bold mb-1">💡 このモードは使い放題です</p>
                <p className="text-[11px] opacity-90">AI生成枠（1日3回）を消費しません。納得いくまで何度でもサイズや色を調整して遊んでみてください。</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-2">柄の種類</label>
                  <select 
                    value={geoPatternType} 
                    onChange={(e) => setGeoPatternType(e.target.value as 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker')}
                    className="w-full border border-zinc-300 p-3 bg-white text-sm focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="stripe">縞（ストライプ）</option>
                    <option value="dot">水玉（ドット）</option>
                    <option value="grid">格子（ラインチェック）</option>
                    <option value="gingham">ギンガムチェック</option>
                    <option value="checker">市松（チェッカー）</option>
                  </select>
                </div>
                {geoPatternType === 'stripe' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-2">縞の向き</label>
                    <select 
                      value={stripeDir} 
                      onChange={(e) => setStripeDir(e.target.value as StripeDirection)}
                      className="w-full border border-zinc-300 p-3 bg-white text-sm focus:border-zinc-900 focus:outline-none"
                    >
                      <option value="vertical">縦縞（滝縞）</option>
                      <option value="horizontal">横縞（ボーダー）</option>
                      <option value="diagonal">斜め（右上がり）</option>
                    </select>
                  </div>
                )}
                {geoPatternType === 'dot' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-900 mb-2">配置</label>
                    <select 
                      value={dotLayout} 
                      onChange={(e) => setDotLayout(e.target.value as DotLayout)}
                      className="w-full border border-zinc-300 p-3 bg-white text-sm focus:border-zinc-900 focus:outline-none"
                    >
                      <option value="staggered">千鳥（互い違い）</option>
                      <option value="grid">正方格子</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <label className="block text-xs font-bold text-zinc-900 mb-4">サイズ調整（mm指定・実寸連動）</label>
                
                {geoPatternType === 'dot' && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">水玉の大きさ（直径）</span>
                        <span className="text-sm font-black text-zinc-900">{dotRadius * 2}<span className="text-[10px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                        <span className="text-sm font-black text-zinc-900">{gapWidth}<span className="text-[10px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="0" max="100" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full" />
                    </div>
                  </>
                )}

                {geoPatternType === 'checker' && (
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] font-bold text-zinc-500">市松の大きさ（1マス）</span>
                      <span className="text-sm font-black text-zinc-900">{lineWidth}<span className="text-[10px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                    </div>
                    <input type="range" min="1" max="200" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full" />
                  </div>
                )}

                {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham') && (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">線の太さ</span>
                        <span className="text-sm font-black text-zinc-900">{lineWidth}<span className="text-[10px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                        <span className="text-sm font-black text-zinc-900">{gapWidth}<span className="text-[10px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="0" max="200" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full" />
                    </div>
                  </>
                )}
              </div>

              {/* カラー選択エリア */}
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 mb-1">地色</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 p-0.5" style={{ backgroundColor: geoBgColor }}></div>
                      <button
                        type="button"
                        onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')}
                        className={`flex-1 text-[10px] h-8 font-bold transition-all border ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}
                      >
                        🎨 日本の伝統色
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-900 mb-1">柄色</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 p-0.5" style={{ backgroundColor: geoPatternColor }}></div>
                      <button
                        type="button"
                        onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')}
                        className={`flex-1 text-[10px] h-8 font-bold transition-all border ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}
                      >
                        🎨 日本の伝統色
                      </button>
                    </div>
                  </div>
                </div>

                {/* 102色パレットの表示領域 */}
                {showGeoPaletteFor && (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-[10px] text-zinc-500 font-bold">
                        {showGeoPaletteFor === 'bg' ? '地色' : '柄色'}を選ぶ（102色）：
                      </p>
                      <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[10px] text-zinc-400 hover:text-zinc-800 font-bold">閉じる ✕</button>
                    </div>
                    <div className="max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {TRADITIONAL_COLORS.map((col) => (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => {
                              if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex);
                              if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex);
                              setShowGeoPaletteFor(null);
                            }}
                            className="relative h-12 p-2 flex flex-col justify-end text-left transition-all duration-200 border border-zinc-300 hover:bg-zinc-200"
                            style={{ backgroundColor: col.hex }}
                          >
                            <span className={`text-[9px] font-bold tracking-wider truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                              {col.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100">
                <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">05. 図案銘</label>
                <input
                  type="text"
                  className="w-full border border-zinc-300 p-3 bg-zinc-50 text-sm focus:outline-none focus:border-zinc-900"
                  value={patternTitle}
                  onChange={(e) => setPatternTitle(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ▼▼ 生成結果表示エリア (フラットUI) ▼▼ */}
        {imageUrl && (
          <div className="mt-12 pt-12 border-t border-zinc-200 animate-fade-in">
            <div className="bg-white border border-zinc-300">
              
              <div className="p-6 sm:p-8 border-b border-zinc-200">
                <span className="inline-block text-[9px] font-mono font-bold tracking-widest text-zinc-400 mb-2">
                  ID: {serialNumber}
                </span>
                <h2 className="text-xl font-black text-zinc-900 tracking-widest">銘：『{finalTitle}』</h2>
              </div>

              {/* フラットなプレビュー切り替えタブ */}
              <div className="p-4 sm:px-8 bg-zinc-50 border-b border-zinc-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDisplayMode('fabric')}
                    className={`px-4 py-2.5 text-xs font-bold tracking-wider transition-all border ${
                      displayMode === 'fabric'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    1. 40cm幅 (データ完成図)
                  </button>
                  
                  {/* ★ 半幅帯タブ */}
                  <button
                    type="button"
                    onClick={() => setDisplayMode('obi')}
                    className={`relative px-4 py-2.5 text-xs font-bold tracking-wider transition-all border ${
                      displayMode === 'obi'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-100' 
                    }`}
                  >
                    2. 半幅帯 マッピング
                    
                    {displayMode !== 'obi' && (
                      <>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea5532] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ea5532]"></span>
                        </span>
                        <span className="absolute -top-3 -right-2 bg-[#ea5532] text-white text-[9px] px-1.5 py-0.5 font-black tracking-widest shadow-sm">
                          おすすめ
                        </span>
                      </>
                    )}
                  </button>
                  
                  <button disabled className="px-4 py-2.5 text-xs font-bold tracking-wider border bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed">
                    3. 京袋帯 (準備中)
                  </button>
                  <button disabled className="px-4 py-2.5 text-xs font-bold tracking-wider border bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed">
                    4. 着物 (準備中)
                  </button>
                </div>
              </div>

              {/* 画像・モックアップ表示コンテナ */}
              <div className="bg-[#f4f4f5] flex flex-col items-center justify-center min-h-[420px] p-6 relative">
                
                {/* 1. 40cm幅 データ完成図 */}
                {displayMode === 'fabric' && (
                  <div className="flex flex-col items-center w-full animate-fade-in">
                    <div 
                      className="w-full max-w-[400px] h-[500px] border border-zinc-300 bg-white"
                      style={{ 
                        backgroundImage: `url(${imageUrl})`, 
                        // ★ SVGタイリングバグ修正：縦横ガチガチ固定
                        backgroundSize: creationMode === 'geometric' ? `${bgSizeMm * 4}px ${bgSizeMm * 4}px` : '100% auto',
                        backgroundRepeat: 'repeat'
                      }} 
                    />
                    <p className="text-[11px] text-zinc-500 mt-4 font-medium">※画面上の枠幅を「実際の約40cm」とした場合の、仕上がり原寸大シミュレーション</p>
                  </div>
                )}

{/* 2. 半幅帯 モックアップ (新ファイル名・アンダーバー統一版) */}
                {displayMode === 'obi' && (
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    <div className="relative w-full max-w-[400px] aspect-square mx-auto">
                      {(() => {
                        const PIXELS_PER_CM = 440 / 16.5; 
                        const geoSizePx = (bgSizeMm / 10) * PIXELS_PER_CM;
                        
                        const patternSize = creationMode === 'geometric' 
                          ? `${geoSizePx}px ${geoSizePx}px` 
                          : `${40 * PIXELS_PER_CM}px ${40 * PIXELS_PER_CM}px`;
                        
                        const v = '5'; // 新規アップロード画像の強制読み込み

                        return (
                          <div className="relative w-full h-full overflow-hidden">
                            {/* ★ レイヤー1〜6 (アンダーバーなし統一) */}
                            {[
                              { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2, bgX: '12%', bgY: '34%' },
                              { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 88, bgX: '45%', bgY: '67%' },
                              { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 94, bgX: '78%', bgY: '12%' },
                              { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: 86, bgX: '23%', bgY: '89%' },
                              { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -12, bgX: '56%', bgY: '45%' },
                              { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -3, bgX: '89%', bgY: '23%' },
                            ].map((layer) => (
                              <div 
                                key={layer.id}
                                className="absolute inset-0 pointer-events-none" 
                                style={{ 
                                  zIndex: layer.z,
                                  maskImage: `url('/${layer.file}?v=${v}')`,
                                  WebkitMaskImage: `url('/${layer.file}?v=${v}')`,
                                  maskSize: 'contain',
                                  WebkitMaskSize: 'contain',
                                  maskRepeat: 'no-repeat',
                                  WebkitMaskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                  WebkitMaskPosition: 'center',
                                }}
                              >
                                <div 
                                  className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2"
                                  style={{
                                    backgroundImage: `url(${imageUrl})`, 
                                    backgroundSize: patternSize,
                                    backgroundRepeat: 'repeat',
                                    backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                                    transform: `rotate(${layer.rot}deg)`
                                  }}
                                />
                              </div>
                            ))}

                            {/* ★ レイヤー7 (裏地) */}
                            <div 
                              className="absolute inset-0 pointer-events-none" 
                              style={{ 
                                zIndex: 65,
                                maskImage: `url('/hanhaba_Layer07.png?v=${v}')`,
                                WebkitMaskImage: `url('/hanhaba_Layer07.png?v=${v}')`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                              }}
                            >
                              <div 
                                className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2"
                                style={{ backgroundColor: obiLiningColor }}
                              />
                            </div>

                            {/* 影・シワレイヤー (hanhaba_Layerkage.png) */}
                            <div 
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                zIndex: 70,
                                backgroundImage: `url('/hanhaba_Layerkage.png?v=${v}')`,
                                backgroundSize: 'contain',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                mixBlendMode: 'multiply'
                              }}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {/* ★ 裏地の色変更UI (以下の既存コードに続きます) */}

                    {/* ★ 裏地の色変更UI (伝統色パレット仕様) */}
                    <div className="mt-4 w-full max-w-[400px] bg-white p-3 border border-zinc-300">
                      <div className="flex items-center gap-3">
                        <label className="text-[11px] font-bold text-zinc-700">裏地の色を変更：</label>
                        <div className="flex items-center gap-2 flex-1">
                          <div 
                            className="w-8 h-8 shrink-0 border border-zinc-300 p-0.5" 
                            style={{ backgroundColor: obiLiningColor }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowLiningPalette(!showLiningPalette)}
                            className={`flex-1 text-[10px] h-8 font-bold transition-all border ${showLiningPalette ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}
                          >
                            🎨 日本の伝統色
                          </button>
                        </div>
                      </div>

                      {/* 裏地用102色パレット */}
                      {showLiningPalette && (
                        <div className="mt-3 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] text-zinc-500 font-bold">裏地の色を選ぶ（102色）：</p>
                            <button type="button" onClick={() => setShowLiningPalette(false)} className="text-[10px] text-zinc-400 hover:text-zinc-800 font-bold">閉じる ✕</button>
                          </div>
                          <div className="max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                              {TRADITIONAL_COLORS.map((col) => (
                                <button
                                  key={col.name}
                                  type="button"
                                  onClick={() => {
                                    setObiLiningColor(col.hex);
                                    setShowLiningPalette(false);
                                  }}
                                  className="relative h-8 p-1 flex flex-col justify-end text-left transition-all duration-200 border border-zinc-300 hover:bg-zinc-200"
                                  style={{ backgroundColor: col.hex }}
                                >
                                  <span className={`text-[8px] font-bold tracking-wider truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    {col.name.split(' ')[0]}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* ▼ ポン出し注釈 (帯・着物タブを選択した時のみ表示) ▼ */}
              {displayMode !== 'fabric' && (
                <div className="p-4 sm:px-8 bg-amber-50/50 border-t border-b border-zinc-200">
                  <p className="text-xs font-black text-amber-900 mb-2 flex items-center gap-1.5">
                    <span className="text-[14px]">⚠️</span> 仕上がりイメージについて
                  </p>
                  <div className="text-[11px] text-amber-900/90 space-y-1.5 font-medium leading-relaxed">
                    <p>※画面上のマッピング画像はAIによる自動生成（ポン出し）の簡易イメージです。</p>
                    <ul className="list-disc list-outside ml-4 space-y-1">
                      <li>受注確定後、ご希望の柄配置（柄の出方）などをヒアリングのうえ、工房より<strong className="text-amber-950">本物のシミュレーション画像</strong>をお送りいたします。そちらにご納得いただいてから、実際のプリント・お仕立て進行となります。</li>
                      <li>実際の<strong className="text-amber-950">「裏地」の色はお任せ</strong>となります（画面で選べる裏地色はあくまでシミュレーション用の参考です）。ご希望の色がある場合は、ご注文時のコメント欄にてお聞かせいただければ可能な限り考慮いたします。</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ▼▼ アクションエリア ▼▼ */}
              <div className="p-6 sm:p-8 space-y-4 bg-white">
                {isShopify ? (
                  <div className="p-5 bg-zinc-950 text-white space-y-4 border border-zinc-800">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-zinc-400 block uppercase">STAGE 02 / SHOPIFY PUBLISH</span>
                        <h3 className="text-sm font-bold tracking-wider text-white">🏪 デザイン価格設定 ＆ Shopify連携</h3>
                      </div>
                      <span className="text-[10px] bg-zinc-800 px-2.5 py-1 text-zinc-300 border border-zinc-700 font-mono">
                        ON-DEMAND SYNC
                      </span>
                    </div>

                    <div className="bg-zinc-900 p-4 border border-zinc-800 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <label className="text-xs font-bold text-zinc-300">
                          デザインフィー（あなたの取り分）
                        </label>
                        <div className="text-right">
                          <span className="text-xl font-black text-sky-400">¥{designFee.toLocaleString()}</span>
                          <span className="text-[10px] text-zinc-400 ml-1">/ 点</span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="50"
                        value={designFee}
                        onChange={(e) => setDesignFee(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-800 appearance-none cursor-pointer accent-sky-400"
                      />

                      <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                        <span>¥0 (原価)</span>
                        <span>¥50</span>
                        <span>¥100 (標準)</span>
                        <span>¥150</span>
                        <span>¥200 (上限)</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 pt-1">
                        ※AI生成図案のため上限200円となります。着物や帯などの派生商品にもこの金額が均一に上乗せ・還元されます。
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleVirtualProductSubmit}
                      disabled={mockupSubmitting}
                      className={`w-full py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 border ${
                        mockupSuccess 
                          ? 'bg-emerald-600 text-white border-emerald-700' 
                          : 'bg-white text-zinc-950 border-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {mockupSubmitting 
                        ? 'Shopifyへ登録中...' 
                        : mockupSuccess 
                          ? '✓ Shopifyへ登録完了（下書き）' 
                          : `この図案（フィー: ¥${designFee}）でShopifyに登録する`}
                    </button>
                    {errorMsg && (
                      <p className="text-[10px] text-red-400 mt-2 text-center font-bold">{errorMsg}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 p-3 text-xs font-bold text-center mb-2">
                      💡 お気に入りの柄は、次の図案を作る前に「保存」しておきましょう！
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full py-4 text-center border border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        画像を保存
                      </button>

                      <a
                        href={xShareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 text-center bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        𝕏でシェア
                      </a>
                    </div>

                    <a
                      href="#"
                      onClick={handleOrderClick}
                      className="block w-full py-5 text-center bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold tracking-widest uppercase transition-all duration-300 mt-2"
                    >
                      この図案でお誂えを申し込む
                    </a>
                  </>
                )}

                {(!isShopify || SHOW_MAKESHOP_LINKS_ON_SHOPIFY) && (
                  <>
                    <div className="mt-6 p-5 bg-zinc-50 border border-zinc-200">
                      <h3 className="text-[13px] font-bold text-zinc-900 mb-3 flex items-center gap-2">
                        クリエイター・作家様へ：オリジナル生地の制作について
                      </h3>
                      <ul className="text-xs text-zinc-600 space-y-2 mb-4 leading-relaxed list-disc list-inside">
                        <li><strong className="text-zinc-900">初回お試しパック（10,000円）：</strong>50cm×112cmの生地1枚＋<span className="underline decoration-zinc-300 decoration-2 underline-offset-2">商用利用可能な完全データ（職人による修正済み）</span>をお渡しします。</li>
                        <li><strong className="text-zinc-900">2回目以降（追加オーダー）：</strong>データ修正済みのため、生地のプリント代のみで1m単位から追加発注可能です。</li>
                        <li><strong className="text-zinc-900">5m以上のオーダー：</strong>お得な【卸価格】にて対応いたします。自社ブランドの量産等にぜひご活用ください。</li>
                      </ul>
                      <a 
                        href="https://store.gofukuyasan.com/html/email.html" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="block w-full py-3 text-center bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold tracking-wider transition-colors"
                      >
                        ✉️ オリジナル生地・商用利用について相談する
                      </a>
                    </div>

                    <div className="text-center pt-6">
                      <a
                        href={makeshopCategoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-zinc-400 hover:text-zinc-800 tracking-widest transition-colors"
                      >
                        似たテイストの帯・着物を探す →
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]">
        <p className="text-zinc-400 text-sm font-bold tracking-widest">LOADING...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
