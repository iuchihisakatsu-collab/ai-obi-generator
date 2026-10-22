'use client';

/* eslint-disable @next/next/no-img-element */

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
  '思い描いたイメージを図案帖に描き出しています...',
  '今回の図案イメージを準備しています...',
  'もう少しで、図案帖に仕上がります...',
  '仕上がりを表示する準備をしています...',
];

export default function Home() {
  const [motif, setMotif] = useState('');
  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  const [density, setDensity] = useState('四方柄（上下なし・散らし柄）');
  const [itemType, setItemType] = useState('square'); 
  const [patternTitle, setPatternTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [imageUrl, setImageUrl] = useState(''); 
  const [blobUrl, setBlobUrl] = useState('');    
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState<'pattern' | 'fabric' | 'mockup'>('pattern');
  const [mockupItem, setMockupItem] = useState<'bag' | 'cushion' | 'tshirt'>('bag');
  const [mockupSubmitting, setMockupSubmitting] = useState(false);
  const [mockupSuccess, setMockupSuccess] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  
  const [showTags, setShowTags] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ct334'); 

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
      a.download = `komon-${serialNumber || 'pattern'}.png`;
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
  const shareText = encodeURIComponent(`「妄想図案帖」で、柄のアイデアを試してみました。\n\n銘：『${finalTitle}』\n配色：${colorSummary}\n\n※AIによるアイデア図案です。実際の生地制作時はスタッフが人の目で調整します。\n\n#妄想図案帖`);
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
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(`通信エラーが発生しました`);
    }
  };

  // 査察用：バーチャルサンプル化（仮掲載キュー登録）シミュレーション
  const handleVirtualProductSubmit = async () => {
    setMockupSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMockupSuccess(true);
      alert(`【バーチャル化完了】\n図案「${finalTitle}」の立体バーチャルサンプルを生成し、Shopifyフロントエンド（仮掲載コレクション）へ連携しました！`);
    } catch (err) {
      console.error(err);
    } finally {
      setMockupSubmitting(false);
    }
  };

  const makeshopCategoryUrl = `https://store.gofukuyasan.com/view/category/${selectedCategoryId}`;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 p-4 sm:p-8 flex flex-col items-center justify-center font-sans selection:bg-zinc-200">
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-6 sm:p-12 transition-all duration-300">
        
        {/* ヘッダーエリア */}
        <div className="relative overflow-hidden text-center mb-8 p-8 sm:p-10 bg-zinc-950 text-white rounded-[1.5rem] shadow-xl">
          <div className="relative z-10">
      
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-center leading-tight">
              妄想図案帖
            </h1>
            <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-medium tracking-wider">
              新潟・十日町は着物の産地　着物の配色や柄づくりの知識を生かして、<br className="hidden sm:inline" />思いついた柄のアイデアを試せるAI図案ツールです。
            </p>
          </div>
        </div>

        <div className="space-y-8">
          
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
                className="w-full rounded-2xl border-2 border-zinc-200 p-4 bg-white text-sm focus:outline-none focus:border-zinc-900 focus:ring-0 resize-none transition-all duration-200 leading-relaxed shadow-sm font-medium"
                rows={4}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="例：上から見た金魚。赤い金魚と黒出目金。水草。地色は白、ターコイズの流水柄。版画・切り絵風、ミッドセンチュリー"
                disabled={loading}
              />
            </div>

            {/* 図案ヒントの折りたたみアコーディオン */}
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
              <div className="mt-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-4 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 animate-fade-in">
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
                          className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-[11px] font-medium text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-150"
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

            {/* 選択中の色バッジ一覧 */}
            <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
              {selectedColors.length === 0 ? (
                <span className="text-xs text-zinc-400 italic">指定なし（入力欄の指定、またはAIの配色におまかせ）</span>
              ) : (
                <>
                  {selectedColors.map((col) => (
                    <span
                      key={col.name}
                      onClick={() => handleColorToggle(col)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
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

            {/* 色パレット */}
            {showColorPalette && (
              <div className="mt-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 animate-fade-in">
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
                          className={`relative h-12 rounded-xl p-2 flex flex-col justify-end text-left transition-all duration-200 ${
                            isSelected
                              ? 'ring-2 ring-offset-2 ring-zinc-950 scale-95 shadow-md font-black'
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
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 text-left ${
                      density === item.id
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
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
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 text-left ${
                      itemType === item.id
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
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
              className="w-full rounded-xl border border-zinc-200 p-3 bg-zinc-50/50 text-sm focus:outline-none focus:border-zinc-900 focus:bg-white transition-all duration-200"
              placeholder="例：遊泳金魚図"
              value={patternTitle}
              onChange={(e) => setPatternTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 回復呪文お知らせバナー */}
          <div className="p-4 bg-zinc-50 rounded-xl text-center border border-zinc-200 shadow-sm">
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
              className="inline-block px-4 py-2 bg-zinc-800 text-white no-underline rounded-lg text-xs font-bold hover:bg-zinc-700 transition-colors"
            >
              ✉️ 回復呪文をリクエストする（お問い合わせフォームへ）
            </a>
          </div>

          {/* 同意と生成ボタン */}
          <div className="pt-2 border-t border-zinc-100">
            <label className="flex items-start gap-3 cursor-pointer select-none mb-6 group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors"
              />
              <span className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-800 transition-colors">
                生成された図案はAIによるアイデアイメージであり、実際の生地制作・捺染時には工房の職人の手でデータ調整が行われること、および公序良俗・権利侵害のない利用に同意します。
              </span>
            </label>

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs rounded-xl font-bold tracking-wide">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || remainingCount === 0}
              className={`w-full py-4 sm:py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${
                remainingCount === 0
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
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
        </div>

        {/* 生成結果表示エリア */}
        {imageUrl && (
          <div className="mt-12 pt-12 border-t border-zinc-100 animate-fade-in">
            <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-6 sm:p-8 pb-6 border-b border-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="inline-block text-[9px] font-mono font-bold tracking-widest text-zinc-400 mb-2">
                    ID: {serialNumber}
                  </span>
                  <h2 className="text-xl font-black text-zinc-900 tracking-widest">銘：『{finalTitle}』</h2>
                </div>
                
                {/* プレビュー切り替え（モックアップ追加） */}
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('pattern')}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all duration-200 ${previewMode === 'pattern' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    図案
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('fabric')}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all duration-200 ${previewMode === 'fabric' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    反物
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mockup')}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-bold tracking-wider transition-all duration-200 ${previewMode === 'mockup' ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    3Dモックアップ
                  </button>
                </div>
              </div>

              {/* 画像・モックアップ表示コンテナ */}
              <div className="bg-zinc-50/70 flex flex-col items-center justify-center min-h-[420px] p-6 relative">
                {previewMode === 'pattern' && (
                  <img src={imageUrl} alt={finalTitle} className="w-full max-w-lg h-auto object-contain rounded-xl shadow-sm" />
                )}

                {previewMode === 'fabric' && (
                  <div 
                    className="w-full h-[400px] rounded-xl shadow-inner border border-zinc-200/60"
                    style={{ 
                      backgroundImage: `url(${imageUrl})`, 
                      backgroundSize: '200px auto'
                    }} 
                  />
                )}

                {previewMode === 'mockup' && (
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    {/* アイテム選択スイッチ */}
                    <div className="flex gap-2 mb-6">
                      {[
                        { key: 'bag', label: 'トートバッグ' },
                        { key: 'cushion', label: 'クッション' },
                        { key: 'tshirt', label: 'Tシャツ' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setMockupItem(item.key as any)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                            mockupItem === item.key
                              ? 'bg-zinc-900 text-white shadow-md'
                              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* 立体合成モックアップ本体 */}
                    <div className="relative flex items-center justify-center py-4">
                      {mockupItem === 'bag' && (
                        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                          <div className="relative w-full h-full">
                            {/* 1. 生成された柄レイヤー（バッグの形に切り抜き） */}
                            <div 
                              className="absolute inset-0 z-0" 
                              style={{ 
                                backgroundImage: `url(${imageUrl})`, 
                                backgroundSize: '120px auto',
                                backgroundRepeat: 'repeat',
                                maskImage: `url('/bag-mockup.png')`,
                                WebkitMaskImage: `url('/bag-mockup.png')`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                              }} 
                            />
                            
                            {/* 2. 陰影レイヤー（元のグレーバッグを乗算合成してシワを出す） */}
                            <div 
                              className="absolute inset-0 z-10 pointer-events-none"
                              style={{
                                backgroundImage: `url('/bag-mockup.png')`,
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                mixBlendMode: 'multiply'
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {mockupItem === 'cushion' && (
                        <div className="relative w-64 h-64 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200/80 bg-zinc-100">
                          <div 
                            className="absolute inset-0" 
                            style={{ 
                              backgroundImage: `url(${imageUrl})`, 
                              backgroundSize: '130px auto',
                              backgroundRepeat: 'repeat' 
                            }} 
                          />
                          {/* クッションの膨らみ陰影 */}
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 45% 45%, rgba(255,255,255,0.65) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.6) 100%)',
                              mixBlendMode: 'multiply'
                            }}
                          />
                        </div>
                      )}

                      {mockupItem === 'tshirt' && (
                        <div className="relative w-64 h-72 rounded-t-2xl rounded-b-lg overflow-hidden shadow-2xl border border-zinc-200/80 bg-zinc-100">
                          <div 
                            className="absolute inset-0" 
                            style={{ 
                              backgroundImage: `url(${imageUrl})`, 
                              backgroundSize: '150px auto',
                              backgroundRepeat: 'repeat' 
                            }} 
                          />
                          {/* Tシャツ陰影 */}
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9) 16%, transparent 17%), linear-gradient(to right, rgba(0,0,0,0.3) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.3) 100%)',
                              mixBlendMode: 'multiply'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 mt-2 font-medium">※デジタル捺染（モナリザ）による仕上がりシミュレーション</p>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-4 bg-white">
                
                {/* バーチャル化・仮掲載アクションボタン（査察デモのハイライト） */}
                {previewMode === 'mockup' ? (
                  <div className="p-4 bg-zinc-900 rounded-2xl text-white space-y-3 shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold tracking-wider text-zinc-300">🏪 Shopify仮掲載連携</span>
                      <span className="text-[10px] bg-zinc-800 px-2.5 py-0.5 rounded-full text-zinc-300 border border-zinc-700">自動バーチャルサンプル化</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleVirtualProductSubmit}
                      disabled={mockupSubmitting}
                      className={`w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 ${
                        mockupSuccess 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-white text-zinc-900 hover:bg-zinc-100'
                      }`}
                    >
                      {mockupSubmitting 
                        ? '3D合成中 ＆ Shopifyへデータ連携中...' 
                        : mockupSuccess 
                          ? '✓ Shopifyへ仮掲載完了（審査・公開中）' 
                          : 'この立体サンプルでShopify仮掲載を依頼する'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 保存の注意書き */}
                    <div className="bg-orange-50 border border-orange-100 text-orange-800 p-3 rounded-xl text-xs font-bold text-center mb-2 shadow-sm">
                      💡 お気に入りの柄は、次の図案を作る前に「保存」しておきましょう！
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full py-4 text-center border-2 border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-bold tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
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
                        className="w-full py-4 text-center bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-xs font-bold tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        𝕏でシェア
                      </a>
                    </div>

                    <a
                      href={orderUrl}
                      onClick={handleOrderClick}
                      className="block w-full py-5 text-center bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold tracking-widest uppercase rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-2"
                    >
                      この図案でお誂えを申し込む
                    </a>
                  </>
                )}

                {/* 商用利用・オリジナル生地制作の案内バナー */}
                <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-100/50 shadow-sm">
                  <h3 className="text-[13px] font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    クリエイター・作家様へ：オリジナル生地の制作について
                  </h3>
                  <ul className="text-xs text-amber-800/80 space-y-2 mb-4 leading-relaxed list-disc list-inside">
                    <li><strong className="text-amber-900">初回お試しパック（10,000円）：</strong>50cm×112cmの生地1枚＋<span className="underline decoration-amber-300 decoration-2 underline-offset-2">商用利用可能な完全データ（職人による修正済み）</span>をお渡しします。</li>
                    <li><strong className="text-amber-900">2回目以降（追加オーダー）：</strong>データ修正済みのため、生地のプリント代のみで1m単位から追加発注可能です。</li>
                    <li><strong className="text-amber-900">5m以上のオーダー：</strong>お得な【卸価格】にて対応いたします。自社ブランドの量産等にぜひご活用ください。</li>
                  </ul>
                  <a 
                    href="https://store.gofukuyasan.com/html/email.html" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full py-3 text-center bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold tracking-wider rounded-lg transition-colors shadow-sm"
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
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
