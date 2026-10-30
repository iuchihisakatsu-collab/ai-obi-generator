'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, type MouseEvent, useCallback, Suspense, useRef } from 'react';
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

// 日本時間（JST）深夜0時リセット用日付
function getTodayJST(): string {
  const now = new Date();
  const jstFormatter = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = jstFormatter.formatToParts(now);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

// 幾何学SVGを400mm反物幅に実寸タイリングして2400px高解像度PNGに焼き込む関数
async function renderTiledGeometricPng(
  svgDataUrl: string, 
  bgSizeMm: number, 
  bgColor: string,
  targetWidthMm: number = 400,
  resolutionPx: number = 2400
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = resolutionPx;
        canvas.height = resolutionPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(svgDataUrl);
          return;
        }

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, resolutionPx, resolutionPx);

        const pxPerMm = resolutionPx / targetWidthMm;
        const tileSizePx = Math.max(1, bgSizeMm * pxPerMm);

        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileSizePx;
        tileCanvas.height = tileSizePx;
        const tCtx = tileCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = bgColor;
          tCtx.fillRect(0, 0, tileSizePx, tileSizePx);
          tCtx.drawImage(img, 0, 0, tileSizePx, tileSizePx);
          const pattern = ctx.createPattern(tileCanvas, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, resolutionPx, resolutionPx);
          }
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Tiled PNG rendering failed:', err);
        resolve(svgDataUrl);
      }
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}

// 半幅帯用：幅18cm（1080x2400px）の縦長プリントデータPNGを自動生成する関数
async function render18cmPrintDataPng(
  patternUrl: string,
  creationMode: 'ai' | 'geometric',
  bgSizeMm: number,
  bgColor: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(patternUrl);
          return;
        }

        ctx.fillStyle = bgColor || '#ffffff';
        ctx.fillRect(0, 0, 1080, 2400);

        if (creationMode === 'geometric') {
          const pxPerMm = 6;
          const tileSizePx = Math.max(1, bgSizeMm * pxPerMm);
          const tileCanvas = document.createElement('canvas');
          tileCanvas.width = tileSizePx;
          tileCanvas.height = tileSizePx;
          const tCtx = tileCanvas.getContext('2d');
          if (tCtx) {
            tCtx.fillStyle = bgColor || '#ffffff';
            tCtx.fillRect(0, 0, tileSizePx, tileSizePx);
            tCtx.drawImage(img, 0, 0, tileSizePx, tileSizePx);
            const pattern = ctx.createPattern(tileCanvas, 'repeat');
            if (pattern) {
              ctx.fillStyle = pattern;
              ctx.fillRect(0, 0, 1080, 2400);
            }
          }
        } else {
          const scale = 1080 / img.naturalWidth;
          const scaledHeight = img.naturalHeight * scale;
          for (let y = 0; y < 2400; y += scaledHeight) {
            ctx.drawImage(img, 0, y, 1080, scaledHeight);
          }
        }
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('18cm PNG rendering failed:', err);
        resolve(patternUrl);
      }
    };
    img.onerror = () => resolve(patternUrl);
    img.src = patternUrl;
  });
}

async function rotateImage90Degrees(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
}

// 1日の上限設定（デュアルエンジン体制）
const MAX_FLUX_PER_DAY = 15;
const MAX_OPENAI_PER_DAY = 1;

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

const ALL_CATEGORIES = TAG_CATEGORIES.flatMap((cat) => cat.items);

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

  const [motif, setMotif] = useState('');
  const [selectedColors, setSelectedColors] = useState<typeof TRADITIONAL_COLORS>([]);
  
  const [density, setDensity] = useState('四方柄（上下なし）');
  const [itemType, setItemType] = useState<'hanhaba' | 'kyobukuro' | 'kimono'>('hanhaba'); 
  const [patternTitle, setPatternTitle] = useState('');
  
  // 生成ローディング管理
  const [loading, setLoading] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState<'flux' | 'openai' | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const [imageUrl, setImageUrl] = useState(''); 
  const [blobUrl, setBlobUrl] = useState('');    
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [displayMode, setDisplayMode] = useState<'mockup' | 'trim' | 'data'>('mockup');
  
  const [mockupSubmitting, setMockupSubmitting] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');

  const [showTags, setShowTags] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  // デュアルエンジンの残回数ステート
  const [remainingFlux, setRemainingFlux] = useState<number>(MAX_FLUX_PER_DAY);
  const [remainingOpenAI, setRemainingOpenAI] = useState<number>(MAX_OPENAI_PER_DAY);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ct334'); 

  const [creationMode, setCreationMode] = useState<'ai' | 'geometric'>('geometric');
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
  const [obiLiningColor, setObiLiningColor] = useState('#dcdddd'); 
  const [showLiningPalette, setShowLiningPalette] = useState(false);

  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 全アイテム共通・実寸ロック黄金比率（3 / 22 %）
  const UNIVERSAL_SCALE_FACTOR = 3 / 22;

  const handleItemTypeChange = (type: 'hanhaba' | 'kyobukuro' | 'kimono') => {
    setItemType(type);
    setDisplayMode('mockup');
    if (type === 'kyobukuro') {
      setObiLiningColor('#161616');
    } else if (type === 'hanhaba') {
      setObiLiningColor('#dcdddd');
    }
  };

  // デュアルエンジンの生成回数ロード
  useEffect(() => {
    const todayJst = getTodayJST();
    const storedData = localStorage.getItem('komon_dual_generations');
    let fCount = 0;
    let oCount = 0;

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayJst) {
          fCount = parsed.flux || 0;
          oCount = parsed.openai || 0;
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // 過去データの互換マイグレーション
      const oldData = localStorage.getItem('komon_generations');
      if (oldData) {
        try {
          const parsedOld = JSON.parse(oldData);
          if (parsedOld.date === todayJst) {
            oCount = parsedOld.count || 0;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - fCount));
    setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - oCount));
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (loading && loadingEngine === 'openai') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_STEPS.length - 1) return prev + 1;
          return prev;
        });
      }, 4000); 
    }
    return () => { if (interval) clearInterval(interval); };
  }, [loading, loadingEngine]);

  // 管理者モード（ベホイミで全回復）
  useEffect(() => {
    if (motif.trim() === 'ベホイミ') {
      localStorage.removeItem('komon_dual_generations');
      localStorage.removeItem('komon_generations');
      setRemainingFlux(MAX_FLUX_PER_DAY);
      setRemainingOpenAI(MAX_OPENAI_PER_DAY);
      setMotif('');
      alert('【管理者モード】本日の生成回数をすべて全回復しました。\n・軽快スケッチ（FLUX）: 15回\n・本番清書（OpenAI）: 1回');
    }
  }, [motif]);

  useEffect(() => {
    const src = blobUrl || imageUrl;
    if (!src) {
      setRotatedPatternUrl('');
      return;
    }

    if (creationMode === 'ai' && itemType === 'hanhaba') {
      rotateImage90Degrees(src)
        .then((rotated) => setRotatedPatternUrl(rotated))
        .catch((err) => {
          console.error('画像90度回転に失敗:', err);
          setRotatedPatternUrl(src);
        });
    } else {
      setRotatedPatternUrl(src);
    }
  }, [blobUrl, imageUrl, creationMode, itemType]);

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
    
    try {
      const tiledPng = await renderTiledGeometricPng(svgDataUrl, tileSize, geoBgColor, 400, 2400);
      setBlobUrl(tiledPng);
    } catch {
      const fallbackPng = await svgToHighResPng(svgString, 2400);
      setBlobUrl(fallbackPng);
    }

    setSerialNumber((prev) => (prev && prev.startsWith('GEO-')) ? prev : `GEO-${Math.floor(1000 + Math.random() * 9000)}`);
    
    let newTitle = '無題';
    if (geoPatternType === 'stripe') newTitle = '万筋縞';
    if (geoPatternType === 'dot') newTitle = '千鳥水玉';
    if (geoPatternType === 'grid') newTitle = '格子柄';
    if (geoPatternType === 'gingham') newTitle = 'ギンガムチェック';
    if (geoPatternType === 'checker') newTitle = '市松模様';

    setPatternTitle((prev) => {
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

  // 生成ハンドラー（engine: 'flux' | 'openai'）
  const handleGenerate = async (engine: 'flux' | 'openai') => {
    setErrorMsg('');

    if (!motif.trim()) { setErrorMsg('図案のイメージや好きな言葉を入力してください。'); return; }
    if (!agreed) { setErrorMsg('図案の利用に関する確認事項への同意が必要です。'); return; }
    const hitWord = FORBIDDEN_WORDS.find((word) => motif.toLowerCase().includes(word));
    if (hitWord) { setErrorMsg(`入力内容に使用できない作品名・ブランド名等「${hitWord}」が含まれています。一般的なモチーフや特徴を表す言葉に変更してください。`); return; }

    const todayJst = getTodayJST();
    const storedData = localStorage.getItem('komon_dual_generations');
    let fCount = 0;
    let oCount = 0;
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayJst) {
          fCount = parsed.flux || 0;
          oCount = parsed.openai || 0;
        }
      } catch (e) {
        console.error('Local storage parse error:', e);
      }
    }

    if (engine === 'flux' && fCount >= MAX_FLUX_PER_DAY) {
      setRemainingFlux(0);
      alert('[本日のスケッチ上限に達しました]\n\n軽快スケッチ（FLUX）は1日15回までご利用いただけます。\nまた明日（深夜0時以降）お試しいただくか、「本番清書（OpenAI）」をお試しください。');
      return;
    }

    if (engine === 'openai' && oCount >= MAX_OPENAI_PER_DAY) {
      setRemainingOpenAI(0);
      alert('[本日の清書上限に達しました]\n\n最高精細の「本番清書」はお一人様1日1回までとなっております。\n「軽快スケッチ」は引き続きご利用いただけます。');
      return;
    }

    const matched = ALL_CATEGORIES.find((c) => motif.includes(c.label));
    if (matched) {
      setSelectedCategoryId(matched.id);
    }

    const colorPayload = selectedColors.length > 0 
      ? selectedColors.map((c) => c.text).join('と') 
      : 'モチーフ入力内容に準拠した配色';

    setLoading(true);
    setLoadingEngine(engine);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          motif, 
          color: colorPayload, 
          density, 
          itemType,
          engine 
        }),
      });
      const data = await res.json();

      if (data.imageUrl && data.blobUrl) {
        setImageUrl(data.imageUrl); 
        setBlobUrl(data.blobUrl);   
        setSerialNumber(`KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
        
        if (!patternTitle || ['万筋縞', '千鳥水玉', '格子柄', 'ギンガムチェック', '市松模様'].includes(patternTitle)) {
          setPatternTitle('');
        }

        setDisplayMode('mockup');

        // カウント更新
        const newFCount = engine === 'flux' ? fCount + 1 : fCount;
        const newOCount = engine === 'openai' ? oCount + 1 : oCount;

        localStorage.setItem('komon_dual_generations', JSON.stringify({
          date: todayJst,
          flux: newFCount,
          openai: newOCount
        }));

        setRemainingFlux(Math.max(0, MAX_FLUX_PER_DAY - newFCount));
        setRemainingOpenAI(Math.max(0, MAX_OPENAI_PER_DAY - newOCount));
        
        setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      } else {
        setErrorMsg(data.error || '図案の生成に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    } finally {
      setLoading(false);
      setLoadingEngine(null);
    }
  };

  const handleDownloadOriginal = async () => {
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

  // 全アイテム共通の実寸マッピング合成画像ダウンロード
  const handleDownloadMapping = async () => {
    if (!previewContainerRef.current || (itemType !== 'hanhaba' && itemType !== 'kyobukuro')) return;
    try {
      setMockupSubmitting(true);

      const canvas = document.createElement('canvas');
      const size = 1200; 
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => res(img);
        img.onerror = (e) => {
          console.error('Image load error:', src, e);
          rej(e);
        };
        img.src = src;
      });

      const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
      if (!effectivePatternUrl) throw new Error('No pattern image');
      
      const patternImg = await loadImage(effectivePatternUrl);

      // 全アイテム共通：統一黄金スケール (27 / 11 px/mm)
      const pxPerMm = 27 / 11;
      const bgWidth = creationMode === 'geometric' ? (bgSizeMm * pxPerMm) : (180 * pxPerMm);

      const bgScale = bgWidth / Math.max(1, patternImg.width);
      const bgHeight = patternImg.height * bgScale;

      const pCanvas = document.createElement('canvas');
      pCanvas.width = bgWidth;
      pCanvas.height = bgHeight;
      const pCtx = pCanvas.getContext('2d');
      if (creationMode === 'geometric' && geoBgColor) {
        pCtx!.fillStyle = geoBgColor;
        pCtx!.fillRect(0, 0, bgWidth, bgHeight);
      }
      pCtx!.drawImage(patternImg, 0, 0, bgWidth, bgHeight);

      const patternFill = ctx.createPattern(pCanvas, 'repeat')!;

      // ===== 半幅帯の合成 =====
      if (itemType === 'hanhaba') {
        const layers = [
          { id: '01', file: '/hanhaba_Layer01.png', z: 10, rot: 2,   bgX: 12, bgY: 34 },
          { id: '02', file: '/hanhaba_Layer02.png', z: 20, rot: 1,   bgX: 45, bgY: 67 },
          { id: '03', file: '/hanhaba_Layer03.png', z: 30, rot: 8,   bgX: 78, bgY: 12 }, 
          { id: '04', file: '/hanhaba_Layer04.png', z: 40, rot: -1,  bgX: 23, bgY: 89 },
          { id: '05', file: '/hanhaba_Layer05.png', z: 50, rot: -12, bgX: 56, bgY: 45 },
          { id: '06', file: '/hanhaba_Layer06.png', z: 60, rot: -3,  bgX: 89, bgY: 23 }, 
        ];

        for (const layer of layers) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;

          const maskImg = await loadImage(`${layer.file}?v=21`);
          tCtx.drawImage(maskImg, 0, 0, size, size);

          tCtx.globalCompositeOperation = 'source-in';

          tCtx.save();
          tCtx.translate(size / 2, size / 2);
          tCtx.rotate(layer.rot * Math.PI / 180);
          tCtx.translate(-size / 2, -size / 2);

          const rectSize = size * 1.5;
          const rectOffset = -size * 0.25;

          tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
          tCtx.fillStyle = patternFill;
          tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); 
          tCtx.restore();

          ctx.drawImage(tempCanvas, 0, 0);
        }

        const tempCanvas7 = document.createElement('canvas');
        tempCanvas7.width = size;
        tempCanvas7.height = size;
        const tCtx7 = tempCanvas7.getContext('2d')!;
        const mask7 = await loadImage('/hanhaba_Layer07.png?v=21');
        tCtx7.drawImage(mask7, 0, 0, size, size);
        tCtx7.globalCompositeOperation = 'source-in';
        tCtx7.fillStyle = obiLiningColor || '#dcdddd';
        tCtx7.fillRect(0, 0, size, size);
        ctx.drawImage(tempCanvas7, 0, 0);

        const kage = await loadImage('/hanhaba_Layer_kage.png?v=21');
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.7; 
        ctx.drawImage(kage, 0, 0, size, size);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      // ===== 京袋帯の合成 =====
      if (itemType === 'kyobukuro') {
        const grandImg = await loadImage('/kyoubukurogrand.png?v=21');
        ctx.drawImage(grandImg, 0, 0, size, size);

        const urajiCanvas = document.createElement('canvas');
        urajiCanvas.width = size;
        urajiCanvas.height = size;
        const uCtx = urajiCanvas.getContext('2d')!;
        const urajiImg = await loadImage('/kyoubukurouraji.png?v=21');
        uCtx.drawImage(urajiImg, 0, 0, size, size);
        uCtx.globalCompositeOperation = 'source-in';
        uCtx.fillStyle = obiLiningColor || '#161616';
        uCtx.fillRect(0, 0, size, size);
        ctx.drawImage(urajiCanvas, 0, 0);

        const layers = [
          { id: 'hara', file: '/kyoubukurohara.png', rot: 271, bgX: 50, bgY: 50 },
          { id: 'tare', file: '/kyoubukurotare.png', rot: -1, bgX: 50, bgY: 50 },
          { id: 'taiko', file: '/kyoubukurotakio.png', rot: 2, bgX: 50, bgY: 50 },
        ];

        for (const layer of layers) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;
          const maskImg = await loadImage(`${layer.file}?v=21`);
          tCtx.drawImage(maskImg, 0, 0, size, size);
          tCtx.globalCompositeOperation = 'source-in';

          tCtx.save();
          tCtx.translate(size / 2, size / 2);
          tCtx.rotate(layer.rot * Math.PI / 180);
          tCtx.translate(-size / 2, -size / 2);

          const rectSize = size * 1.5;
          const rectOffset = -size * 0.25;
          tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
          tCtx.fillStyle = patternFill;
          tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); 
          tCtx.restore();

          ctx.drawImage(tempCanvas, 0, 0);
        }

        const kage = await loadImage('/kyoubukuromask.png?v=21');
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.8; 
        ctx.drawImage(kage, 0, 0, size, size);
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }

      const finalUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = finalUrl;
      a.download = `${serialNumber || 'mapping'}_preview.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

    } catch (e) {
      console.error(e);
      alert('ダウンロード画像の生成に失敗しました。');
    } finally {
      setMockupSubmitting(false);
    }
  };

  const finalTitle = patternTitle.trim() || '（無題）';
  const colorSummary = selectedColors.length > 0 ? selectedColors.map((c) => c.name.split(' ')[0]).join('・') : '自由配色';
  const shareText = encodeURIComponent(`「妄想きもの図案帳」で、柄のアイデアを試してみました。\n\n銘：『${finalTitle}』\n配色：${colorSummary}\n\n※AIによるアイデア図案です。実際の生地制作時はスタッフが人の目で調整します。\n\n#妄想きもの図案帳`);
  const shareUrl = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
  const xShareLink = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  
  // 半幅帯は18cm縦長データ、京袋帯・着物は40cmデータをMakeShopに投げる
  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      let finalImageUrl = blobUrl || imageUrl;

      const validSerial = serialNumber || (creationMode === 'geometric' 
        ? `GEO-${Math.floor(1000 + Math.random() * 9000)}` 
        : `KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
      
      if (!serialNumber) {
        setSerialNumber(validSerial);
      }

      // 半幅帯の場合：幅18cmの縦長プリントデータPNGを生成してBlobへ送る
      if (itemType === 'hanhaba') {
        const sourceFor18cm = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
        const png18cm = await render18cmPrintDataPng(sourceFor18cm, creationMode, bgSizeMm, geoBgColor);
        finalImageUrl = png18cm;
      }

      // Base64データの場合、Vercel Blobへアップロードして永続URLに変換
      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Data: finalImageUrl,
            filename: `${validSerial}.png`,
          }),
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          finalImageUrl = uploadData.url;
          setBlobUrl(uploadData.url); 
        } else {
          throw new Error(uploadData.error || '画像のアップロードに失敗しました');
        }
      }

      // 工房宛てメール送信
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: finalImageUrl, komonId: validSerial, title: finalTitle }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(`メール送信エラー: ${result.error || '不明なエラー'}`);
        return;
      }

      // クリップボードへのコピー
      const copyText = `図案ID: ${validSerial}\n銘: ${finalTitle}`;
      try {
        await navigator.clipboard.writeText(copyText);
        alert(`[工場へのデータ送信完了]\n図案「${finalTitle}」の${itemType === 'hanhaba' ? '18cmプリントデータ' : '高解像度データ'}を職人へ送信しました。\n\n画面切り替え後、MakeShopのシリアル番号欄に「${validSerial}」が自動入力されているかご確認ください。`);
      } catch (err) {
        console.warn('クリップボードのコピーに失敗しました', err);
      }

      // MakeShopの注文ページへ遷移
      const cleanOrderUrl = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(validSerial)}&title=${encodeURIComponent(finalTitle)}&image_url=${encodeURIComponent(finalImageUrl)}`;
      window.location.href = cleanOrderUrl;
      
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('通信エラーが発生しました');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 p-2 sm:p-6 lg:p-8 flex flex-col items-center justify-start font-sans selection:bg-zinc-200">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 sm:gap-6 items-start justify-center">
        
        {/* ▼▼ プレビュー領域 ▼▼ */}
        <div 
          ref={previewRef}
          className="w-full lg:w-1/2 shrink-0 sticky top-2 z-30 lg:top-8 flex flex-col gap-3"
        >
          {imageUrl && (
            <div className="bg-white border border-zinc-300 shadow-xl overflow-hidden animate-fade-in">
              
              <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                <div>
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-zinc-400 block">
                    ID: {serialNumber}
                  </span>
                  <h2 className="text-xs sm:text-base font-black text-zinc-900 tracking-wider truncate max-w-[200px] sm:max-w-none">
                    銘：『{finalTitle}』
                  </h2>
                </div>
              </div>

              {/* アイテム直感切替バー（半幅帯 / 京袋帯 / 着物） */}
              <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider">仕立てアイテム：</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleItemTypeChange('hanhaba')}
                    className={`px-3 py-1 text-[11px] font-black rounded transition-all ${
                      itemType === 'hanhaba' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    半幅帯
                  </button>
                  <button
                    type="button"
                    onClick={() => handleItemTypeChange('kyobukuro')}
                    className={`px-3 py-1 text-[11px] font-black rounded transition-all ${
                      itemType === 'kyobukuro' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    京袋帯
                  </button>
                  <button
                    type="button"
                    onClick={() => handleItemTypeChange('kimono')}
                    className={`px-3 py-1 text-[11px] font-black rounded transition-all ${
                      itemType === 'kimono' ? 'bg-white text-zinc-950 shadow' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    着物
                  </button>
                </div>
              </div>

              {/* 動的タブUI */}
              <div className="px-3 py-2.5 border-b border-zinc-200 bg-zinc-100 flex flex-col gap-2">
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => setDisplayMode('mockup')}
                    className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${
                      displayMode === 'mockup'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow'
                        : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    {itemType === 'hanhaba' && '半幅帯マッピング'}
                    {itemType === 'kyobukuro' && '京袋帯マッピング'}
                    {itemType === 'kimono' && '着物マッピング'}
                  </button>

                  {itemType === 'kyobukuro' && (
                    <button
                      type="button"
                      onClick={() => setDisplayMode('trim')}
                      className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${
                        displayMode === 'trim'
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow'
                          : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      34cm 裁断イメージ
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDisplayMode('data')}
                    className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${
                      displayMode === 'data'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow'
                        : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    {itemType === 'hanhaba' ? '18cm プリントデータ' : '40cm 反物データ'}
                  </button>
                </div>
              </div>

              <div className="bg-[#e4e4e7] flex flex-col items-center justify-center p-3 sm:p-6 relative shadow-inner overflow-hidden min-h-[300px]">
                
                {/* 1. モックアップ表示 */}
                {displayMode === 'mockup' && (
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    
                    {/* 半幅帯マッピング（統一実寸ロック：180mm基準） */}
                    {itemType === 'hanhaba' && (
                      <>
                        <div ref={previewContainerRef} className="relative w-[210px] sm:w-[340px] aspect-square mx-auto drop-shadow-xl">
                          {(() => {
                            const patternSize = creationMode === 'geometric' 
                              ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` 
                              : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
                            
                            const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
                            const v = '21'; 

                            return (
                              <div className="relative w-full h-full overflow-hidden">
                                {[
                                  { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2,   bgX: '12%', bgY: '34%' },
                                  { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 1,   bgX: '45%', bgY: '67%' },
                                  { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 8,   bgX: '78%', bgY: '12%' },
                                  { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: -1,  bgX: '23%', bgY: '89%' },
                                  { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -12, bgX: '56%', bgY: '45%' },
                                  { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -3,  bgX: '89%', bgY: '23%' },
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
                                      style={{
                                        position: 'absolute
