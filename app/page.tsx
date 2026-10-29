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
  const [loading, setLoading] = useState(false);
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
  const [remainingCount, setRemainingCount] = useState<number | null>(null);
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

  // ▼▼ 着物・帯まわり専用ステート ▼▼
  const [kimonoObiColor, setKimonoObiColor] = useState('#161616'); 
  const [customObiUrl, setCustomObiUrl] = useState<string | null>(null);
  const [showObiColorPalette, setShowObiColorPalette] = useState(false);
  
  const [kimonoHaneriColor, setKimonoHaneriColor] = useState('#fffffc'); 
  const [showHaneriColorPalette, setShowHaneriColorPalette] = useState(false);

  const [kimonoObiageColor, setKimonoObiageColor] = useState('#e8d3d1'); 
  const [showObiageColorPalette, setShowObiageColorPalette] = useState(false);

  const [rotatedPatternUrl, setRotatedPatternUrl] = useState<string>('');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // ★ 全アイテム共通・実寸ロック黄金比率（3 / 22 %）
  const UNIVERSAL_SCALE_FACTOR = 3 / 22;

  // ユーザー手持ち帯画像のアップロード処理
  const handleCustomObiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCustomObiUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleItemTypeChange = (type: 'hanhaba' | 'kyobukuro' | 'kimono') => {
    setItemType(type);
    setDisplayMode('mockup');
    if (type === 'kyobukuro') {
      setObiLiningColor('#161616');
    } else if (type === 'hanhaba') {
      setObiLiningColor('#dcdddd');
    }
  };

  useEffect(() => {
    const todayJst = getTodayJST();
    const storedData = localStorage.getItem('komon_generations');
    let count = 0;
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayJst) {
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
    if (motif.trim() === 'ホイミ') {
      localStorage.removeItem('komon_generations');
      setRemainingCount(MAX_GENERATIONS_PER_DAY);
      setMotif('');
      alert('【管理者モード】本日の生成回数を全回復しました。');
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

    const todayJst = getTodayJST();
    const storedData = localStorage.getItem('komon_generations');
    
    let currentCount = 0;
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.date === todayJst) {
          currentCount = parsedData.count;
        }
      } catch (e) {
        console.error('Local storage parse error:', e);
      }
    }

    if (currentCount >= MAX_GENERATIONS_PER_DAY) {
      setRemainingCount(0);
      alert('[本日の上限に達しました]\n\nお試しいただきありがとうございます。\nAIのサーバー利用料（課金）が高額になってしまうため、無料での作成は「お一人様1日3回まで」とさせていただいております。\n\nまた明日（深夜0時以降）、新しい図案を作りに来てください。');
      return;
    }

    const matched = ALL_CATEGORIES.find((c) => motif.includes(c.label));
    if (matched) setSelectedCategoryId(matched.id);

    const colorPayload = selectedColors.length > 0 
      ? selectedColors.map((c) => c.text).join('と') 
      : 'モチーフ入力内容に準拠した配色';

    setLoading(true);
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
        
        setDisplayMode('mockup');
        const newCount = currentCount + 1;
        localStorage.setItem('komon_generations', JSON.stringify({ date: todayJst, count: newCount }));
        setRemainingCount(Math.max(0, MAX_GENERATIONS_PER_DAY - newCount));
        
        setTimeout(() => { previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
      } else {
        setErrorMsg(data.error || '図案の生成に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('通信エラーが発生しました。時間を置いてお試しください。');
    }
    setLoading(false);
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

  const handleDownloadMapping = async () => {
    if (!previewContainerRef.current) return;
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
        img.onerror = (e) => rej(e);
        img.src = src;
      });

      const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
      if (!effectivePatternUrl) throw new Error('No pattern image');
      const patternImg = await loadImage(effectivePatternUrl);

      // ===== 半幅帯・京袋帯の合成 =====
      if (itemType === 'hanhaba' || itemType === 'kyobukuro') {
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

        if (itemType === 'hanhaba') {
          // ★ 半幅帯マッピングの角度を完全補正 (Layer03=横90度, Layer04=縦-1度)
          const layers = [
            { file: '/hanhaba_Layer01.png', rot: 2, bgX: 12, bgY: 34 }, 
            { file: '/hanhaba_Layer02.png', rot: 1, bgX: 45, bgY: 67 },
            { file: '/hanhaba_Layer03.png', rot: 90, bgX: 78, bgY: 12 }, 
            { file: '/hanhaba_Layer04.png', rot: -1, bgX: 23, bgY: 89 }, 
            { file: '/hanhaba_Layer05.png', rot: -12, bgX: 56, bgY: 45 }, 
            { file: '/hanhaba_Layer06.png', rot: -3, bgX: 89, bgY: 23 }
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
            tCtx.translate(size/2, size/2); 
            tCtx.rotate(layer.rot * Math.PI / 180); 
            tCtx.translate(-size/2, -size/2);
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
            { file: '/kyoubukurohara.png', rot: 271, bgX: 50, bgY: 50 }, 
            { file: '/kyoubukurotare.png', rot: -1, bgX: 50, bgY: 50 },
            { file: '/kyoubukurotakio.png', rot: 2, bgX: 50, bgY: 50 }
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
            tCtx.translate(size/2, size/2); 
            tCtx.rotate(layer.rot * Math.PI / 180); 
            tCtx.translate(-size/2, -size/2);
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
      }

      // ===== ★ 着物マッピングのCanvas合成 =====
      if (itemType === 'kimono') {
        const kimonoLayers = [
          { file: '/usiromigoro_75.png', angle: 75, bgX: 50, bgY: 50 },
          { file: '/migisode_165.png', angle: 165, bgX: 20, bgY: 30 },
          { file: '/hidarisode_150.png', angle: 150, bgX: 80, bgY: 40 },
          { file: '/hidarisode2_175.png', angle: 175, bgX: 80, bgY: 70 },
          { file: '/maemigoro_105.png', angle: 105, bgX: 45, bgY: 60 },
          { file: '/maemigoro2_140.png', angle: 140, bgX: 45, bgY: 20 },
          { file: '/maeokumi_110.png', angle: 110, bgX: 55, bgY: 50 },
          { file: '/migieri_65.png', angle: 65, bgX: 30, bgY: 10 },
          { file: '/hidarieri_117.png', angle: 117, bgX: 70, bgY: 10 },
        ];

        const KIMONO_CANVAS_MM = 600;
        const kimonoPxPerMm = 1200 / KIMONO_CANVAS_MM; 
        const kBgWidth = creationMode === 'geometric' ? ((bgSizeMm * kimonoPxPerMm) / 2) : ((180 * kimonoPxPerMm) / 2);
        const kBgScale = kBgWidth / Math.max(1, patternImg.width);
        const kBgHeight = patternImg.height * kBgScale;
        const kPCanvas = document.createElement('canvas');
        kPCanvas.width = kBgWidth; 
        kPCanvas.height = kBgHeight;
        const kPCtx = kPCanvas.getContext('2d')!;
        
        if (creationMode === 'geometric' && geoBgColor) { 
          kPCtx.fillStyle = geoBgColor; 
          kPCtx.fillRect(0,0,kBgWidth, kBgHeight); 
        }
        kPCtx.drawImage(patternImg, 0, 0, kBgWidth, kBgHeight);
        const kimonoPatternFill = ctx.createPattern(kPCanvas, 'repeat')!;

        const bgImg = await loadImage('/haikei.png?v=30');
        ctx.drawImage(bgImg, 0, 0, size, size);

        for (const layer of kimonoLayers) {
          const tempCanvas = document.createElement('canvas'); 
          tempCanvas.width = size; 
          tempCanvas.height = size;
          const tCtx = tempCanvas.getContext('2d')!;
          const maskImg = await loadImage(`${layer.file}?v=30`);
          tCtx.drawImage(maskImg, 0, 0, size, size);
          tCtx.globalCompositeOperation = 'source-in';
          tCtx.save(); 
          tCtx.translate(size/2, size/2); 
          tCtx.rotate((layer.angle - 90) * Math.PI / 180); 
          tCtx.translate(-size/2, -size/2);
          const rectSize = size * 1.5; 
          const rectOffset = -size * 0.25;
          tCtx.translate(rectOffset + (rectSize * layer.bgX / 100), rectOffset + (rectSize * layer.bgY / 100));
          tCtx.fillStyle = kimonoPatternFill; 
          tCtx.fillRect(-size * 2, -size * 2, size * 4, size * 4); 
          tCtx.restore();
          ctx.drawImage(tempCanvas, 0, 0);
        }

        const haneriImg = await loadImage('/haneri.png?v=30');
        const hCanvas = document.createElement('canvas'); 
        hCanvas.width = size; 
        hCanvas.height = size;
        const hCtx = hCanvas.getContext('2d')!; 
        hCtx.drawImage(haneriImg, 0, 0, size, size);
        hCtx.globalCompositeOperation = 'source-in'; 
        hCtx.fillStyle = kimonoHaneriColor; 
        hCtx.fillRect(0,0,size,size);
        // ★ 半衿の白浮き防止処理（黒3%の乗算で自然に沈ませる）
        hCtx.fillStyle = 'rgba(0,0,0,0.03)';
        hCtx.fillRect(0,0,size,size);
        ctx.drawImage(hCanvas, 0, 0);

        const obiageImg = await loadImage('/obiage.png?v=30');
        const oaCanvas = document.createElement('canvas'); 
        oaCanvas.width = size; 
        oaCanvas.height = size;
        const oaCtx = oaCanvas.getContext('2d')!; 
        oaCtx.drawImage(obiageImg, 0, 0, size, size);
        oaCtx.globalCompositeOperation = 'source-in'; 
        oaCtx.fillStyle = kimonoObiageColor; 
        oaCtx.fillRect(0,0,size,size);
        ctx.drawImage(oaCanvas, 0, 0);

        const obiImg = await loadImage('/obi_2.png?v=30');
        const oCanvas = document.createElement('canvas'); 
        oCanvas.width = size; 
        oCanvas.height = size;
        const oCtx = oCanvas.getContext('2d')!; 
        oCtx.drawImage(obiImg, 0, 0, size, size);
        oCtx.globalCompositeOperation = 'source-in';
        if (customObiUrl) {
           const customObiImg = await loadImage(customObiUrl);
           oCtx.drawImage(customObiImg, 0, 0, size, size); 
        } else {
           oCtx.fillStyle = kimonoObiColor; 
           oCtx.fillRect(0,0,size,size);
        }
        ctx.drawImage(oCanvas, 0, 0);

        const kageImg = await loadImage('/jyouzan.png?v=30');
        ctx.globalCompositeOperation = 'multiply'; 
        ctx.globalAlpha = 0.8; 
        ctx.drawImage(kageImg, 0, 0, size, size);
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
  
  // コピー用ヘルパー
  const copyToClipboard = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  // OS標準のシェア機能（Web Share API連携）
  const handleNativeShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const decodedText = decodeURIComponent(shareText);

    if (navigator.share) {
      try {
        await navigator.share({
          title: finalTitle,
          text: decodedText,
          url: shareUrl,
        });
      } catch (err) {
        console.warn('Share canceled', err);
      }
    } else {
      // OS標準シェアが使えないPC等の場合はテキストをコピーして案内
      await copyToClipboard(decodedText + '\n' + shareUrl);
      alert('シェア用のテキストとURLをコピーしました。\nお好きなSNS（InstagramやXなど）にペーストしてご活用ください！');
    }
  };
  
  const handleOrderClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); 
    try {
      let finalImageUrl = blobUrl || imageUrl;
      const validSerial = serialNumber || (creationMode === 'geometric' ? `GEO-${Math.floor(1000 + Math.random() * 9000)}` : `KOMON-${Math.floor(1000 + Math.random() * 9000)}`);
      if (!serialNumber) setSerialNumber(validSerial);

      if (itemType === 'hanhaba') {
        const sourceFor18cm = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
        const png18cm = await render18cmPrintDataPng(sourceFor18cm, creationMode, bgSizeMm, geoBgColor);
        finalImageUrl = png18cm;
      }

      if (finalImageUrl && finalImageUrl.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload-blob', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ base64Data: finalImageUrl, filename: `${validSerial}.png` }) 
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) { 
          finalImageUrl = uploadData.url; 
          setBlobUrl(uploadData.url); 
        } else {
          throw new Error(uploadData.error || '画像のアップロードに失敗しました');
        }
      }

      const response = await fetch('/api/send-email', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ imageUrl: finalImageUrl, komonId: validSerial, title: finalTitle }) 
      });
      const result = await response.json();
      if (!response.ok || !result.success) { 
        setErrorMsg(`メール送信エラー: ${result.error || '不明なエラー'}`); 
        return; 
      }

      const copyText = `図案ID: ${validSerial}\n銘: ${finalTitle}`;
      try { 
        await navigator.clipboard.writeText(copyText); 
        alert(`[工場へのデータ送信完了]\n図案「${finalTitle}」のデータを職人へ送信しました。\n\n画面切り替え後、MakeShopのシリアル番号欄に「${validSerial}」が自動入力されているかご確認ください。`); 
      } catch (err) { 
        console.warn('コピー失敗', err); 
      }

      window.location.href = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(validSerial)}&title=${encodeURIComponent(finalTitle)}&image_url=${encodeURIComponent(finalImageUrl)}`;
    } catch (err: unknown) { 
      console.error(err); 
      setErrorMsg('通信エラーが発生しました'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 p-2 sm:p-6 lg:p-8 flex flex-col items-center justify-start font-sans selection:bg-zinc-200">
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 sm:gap-6 items-start justify-center">
        
        {/* ▼▼ プレビュー領域 ▼▼ */}
        <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 sticky top-2 z-30 lg:top-8 flex flex-col gap-3">
          {imageUrl && (
            <div className="bg-white border border-zinc-300 shadow-xl overflow-hidden animate-fade-in">
              
              {/* ▼ 統合・圧縮されたUIヘッダー ▼ */}
              <div className="px-3 py-2.5 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-400">ID:{serialNumber}</span>
                  <h2 className="text-sm font-black truncate max-w-[180px] sm:max-w-[240px]">
                    銘：『{finalTitle}』
                  </h2>
                </div>
                <div className="flex gap-1.5 items-center">
                  <button type="button" onClick={() => handleItemTypeChange('hanhaba')} className={`px-2.5 py-1.5 text-[11px] font-black rounded transition-all ${itemType === 'hanhaba' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>半幅帯</button>
                  <button type="button" onClick={() => handleItemTypeChange('kyobukuro')} className={`px-2.5 py-1.5 text-[11px] font-black rounded transition-all ${itemType === 'kyobukuro' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>京袋帯</button>
                  <button type="button" onClick={() => handleItemTypeChange('kimono')} className={`px-2.5 py-1.5 text-[11px] font-black rounded transition-all flex items-center gap-1.5 ${itemType === 'kimono' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                    着物<span className="text-[8px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse leading-none shadow-sm">NEW</span>
                  </button>
                </div>
              </div>

              <div className="px-3 py-2 border-b border-zinc-200 bg-zinc-100 flex flex-col gap-2">
                <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
                  <button type="button" onClick={() => setDisplayMode('mockup')} className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${displayMode === 'mockup' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}>
                    {itemType === 'hanhaba' && '半幅帯マッピング'}
                    {itemType === 'kyobukuro' && '京袋帯マッピング'}
                    {itemType === 'kimono' && '着物マッピング'}
                  </button>
                  {itemType === 'kyobukuro' && (
                    <button type="button" onClick={() => setDisplayMode('trim')} className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${displayMode === 'trim' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}>
                      34cm 裁断イメージ
                    </button>
                  )}
                  <button type="button" onClick={() => setDisplayMode('data')} className={`flex-1 px-3 py-2 text-[10px] sm:text-xs font-bold tracking-wider transition-all border rounded-sm ${displayMode === 'data' ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'}`}>
                    {itemType === 'hanhaba' ? '18cm プリントデータ' : '40cm 反物データ'}
                  </button>
                </div>
              </div>

              <div className="bg-[#e4e4e7] flex flex-col items-center justify-center p-3 sm:p-6 relative shadow-inner overflow-hidden min-h-[300px]">
                
                {displayMode === 'mockup' && (
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    
                    {/* 半幅帯マッピング */}
                    {itemType === 'hanhaba' && (
                      <>
                        <div ref={previewContainerRef} className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-square mx-auto drop-shadow-xl">
                          {(() => {
                            const patternSize = creationMode === 'geometric' 
                              ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` 
                              : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
                            const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
                            const v = '21'; 

                            return (
                              <div className="relative w-full h-full overflow-hidden">
                                {[ 
                                  { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2, bgX: '12%', bgY: '34%' }, 
                                  { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 1, bgX: '45%', bgY: '67%' }, 
                                  { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 90, bgX: '78%', bgY: '12%' }, 
                                  { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: -1, bgX: '23%', bgY: '89%' }, 
                                  { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -12, bgX: '56%', bgY: '45%' }, 
                                  { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -3, bgX: '89%', bgY: '23%' }
                                ].map((layer) => (
                                  <div 
                                    key={layer.id} 
                                    className="absolute inset-0 pointer-events-none" 
                                    style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=${v}')`, WebkitMaskImage: `url('/${layer.file}?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
                                  >
                                    <div 
                                      style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} 
                                    />
                                  </div>
                                ))}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 65, maskImage: `url('/hanhaba_Layer07.png?v=${v}')`, WebkitMaskImage: `url('/hanhaba_Layer07.png?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
                                  <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundColor: obiLiningColor }} />
                                </div>
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/hanhaba_Layer_kage.png?v=${v}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.7 }} />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-3 w-full max-w-[320px] mx-auto">
                          <button type="button" onClick={handleDownloadMapping} disabled={mockupSubmitting} className={`w-full px-3 py-2.5 text-[11px] sm:text-xs font-bold tracking-wider rounded-sm shadow-sm transition-colors ${mockupSubmitting ? 'bg-zinc-400 text-zinc-100 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                            {mockupSubmitting ? '画像を作成中...' : '↓ マッピング画像を保存'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* 京袋帯マッピング */}
                    {itemType === 'kyobukuro' && (
                      <>
                        <div ref={previewContainerRef} className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-square mx-auto drop-shadow-xl">
                          {(() => {
                            const patternSize = creationMode === 'geometric' 
                              ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` 
                              : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
                            const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
                            const v = '21'; 

                            return (
                              <div className="relative w-full h-full overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                                  <img src={`/kyoubukurogrand.png?v=${v}`} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20, maskImage: `url('/kyoubukurouraji.png?v=${v}')`, WebkitMaskImage: `url('/kyoubukurouraji.png?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
                                  <div className="w-full h-full" style={{ backgroundColor: obiLiningColor }} />
                                </div>
                                {[ 
                                  { id: 'hara', file: 'kyoubukurohara.png', z: 30, rot: 271, bgX: '50%', bgY: '50%' }, 
                                  { id: 'tare', file: 'kyoubukurotare.png', z: 40, rot: -1, bgX: '50%', bgY: '50%' }, 
                                  { id: 'taiko', file: 'kyoubukurotakio.png', z: 50, rot: 2, bgX: '50%', bgY: '50%' }
                                ].map((layer) => (
                                  <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=${v}')`, WebkitMaskImage: `url('/${layer.file}?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}>
                                    <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.rot}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} />
                                  </div>
                                ))}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 60, backgroundImage: `url('/kyoubukuromask.png?v=${v}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.8 }} />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-3 w-full max-w-[320px] mx-auto">
                          <button type="button" onClick={handleDownloadMapping} disabled={mockupSubmitting} className={`w-full px-3 py-2.5 text-[11px] sm:text-xs font-bold tracking-wider rounded-sm shadow-sm transition-colors ${mockupSubmitting ? 'bg-zinc-400 text-zinc-100 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                            {mockupSubmitting ? '画像を作成中...' : '↓ マッピング画像を保存'}
                          </button>
                        </div>
                      </>
                    )}

                    {/* ★ 着物マッピング（全14枚・180mm実寸完全ロック・角度連動・Canvasダウンロード完全対応） */}
                    {itemType === 'kimono' && (
                      <>
                        <div ref={previewContainerRef} className="relative w-full max-w-[320px] sm:max-w-[340px] aspect-square mx-auto drop-shadow-xl bg-white">
                          {(() => {
                            // ★ 180mm絶対基準 ＆ 200%拡大用の ÷2 スケール補正
                            const patternSize = creationMode === 'geometric' 
                              ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto` 
                              : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;
                            
                            const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
                            const v = '30'; 

                            const kimonoLayers = [
                              { id: 'usiromigoro', file: 'usiromigoro_75.png', z: 10, angle: 75, bgX: '50%', bgY: '50%' },
                              { id: 'migisode', file: 'migisode_165.png', z: 15, angle: 165, bgX: '20%', bgY: '30%' },
                              { id: 'hidarisode', file: 'hidarisode_150.png', z: 20, angle: 150, bgX: '80%', bgY: '40%' },
                              { id: 'hidarisode2', file: 'hidarisode2_175.png', z: 25, angle: 175, bgX: '80%', bgY: '70%' },
                              { id: 'maemigoro', file: 'maemigoro_105.png', z: 30, angle: 105, bgX: '45%', bgY: '60%' },
                              { id: 'maemigoro2', file: 'maemigoro2_140.png', z: 35, angle: 140, bgX: '45%', bgY: '20%' },
                              { id: 'maeokumi', file: 'maeokumi_110.png', z: 40, angle: 110, bgX: '55%', bgY: '50%' },
                              { id: 'migieri', file: 'migieri_65.png', z: 50, angle: 65, bgX: '30%', bgY: '10%' },
                              { id: 'hidarieri', file: 'hidarieri_117.png', z: 55, angle: 117, bgX: '70%', bgY: '10%' },
                            ];

                            return (
                              <div className="relative w-full h-full overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                                  <img src={`/haikei.png?v=${v}`} alt="" className="w-full h-full object-contain" />
                                </div>
                                {kimonoLayers.map((layer) => (
                                  <div key={layer.id} className="absolute inset-0 pointer-events-none" style={{ zIndex: layer.z, maskImage: `url('/${layer.file}?v=${v}')`, WebkitMaskImage: `url('/${layer.file}?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}>
                                    <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: patternSize, backgroundRepeat: 'repeat', backgroundPosition: `${layer.bgX} ${layer.bgY}`, transform: `rotate(${layer.angle - 90}deg)`, transformOrigin: 'center center', backgroundColor: creationMode === 'geometric' ? geoBgColor : 'transparent' }} />
                                  </div>
                                ))}
                                {/* 半衿 (白浮き防止に黒3%を被せる) */}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 45, maskImage: `url('/haneri.png?v=${v}')`, WebkitMaskImage: `url('/haneri.png?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}>
                                  <div className="w-full h-full relative" style={{ backgroundColor: kimonoHaneriColor }}>
                                    <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }} />
                                  </div>
                                </div>
                                {/* 帯揚げ */}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 60, maskImage: `url('/obiage.png?v=${v}')`, WebkitMaskImage: `url('/obiage.png?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}>
                                  <div className="w-full h-full" style={{ backgroundColor: kimonoObiageColor }} />
                                </div>
                                {/* 帯 */}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 65, maskImage: `url('/obi_2.png?v=${v}')`, WebkitMaskImage: `url('/obi_2.png?v=${v}')`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }}>
                                  <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', backgroundColor: customObiUrl ? 'transparent' : kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: '50% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat' }} />
                                </div>
                                {/* 影 */}
                                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 70, backgroundImage: `url('/jyouzan.png?v=${v}')`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', mixBlendMode: 'multiply', opacity: 0.8 }} />
                              </div>
                            );
                          })()}
                        </div>
                        <div className="mt-3 w-full max-w-[320px] mx-auto">
                          <button type="button" onClick={handleDownloadMapping} disabled={mockupSubmitting} className={`w-full px-3 py-2.5 text-[11px] sm:text-xs font-bold tracking-wider rounded-sm shadow-sm transition-colors ${ mockupSubmitting ? 'bg-zinc-400 text-zinc-100 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800' }`}>
                            {mockupSubmitting ? '画像を作成中...' : '↓ マッピング画像を保存'}
                          </button>
                        </div>
                      </>
                    )}
                    
                    {/* ★ 警告テキスト追加 */}
                    <p className="w-full max-w-[320px] mx-auto text-[10px] font-bold text-red-600 mt-3 text-center bg-red-50 border border-red-100 py-1.5 rounded-sm shadow-sm">
                      ※一期一会のデータです。<br className="sm:hidden" />閉じると消えるため必ず保存してください。
                    </p>
                  </div>
                )}

                {displayMode === 'trim' && itemType === 'kyobukuro' && (
                  <div className="w-full flex flex-col items-center animate-fade-in">
                    <div className="relative w-full max-w-[320px] sm:max-w-[400px] mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden" style={{ aspectRatio: '40 / 34' }}>
                      <div className="absolute inset-0" style={{ backgroundImage: `url(${creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl)})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : `${(180 / 400) * 100}% auto`, backgroundPosition: 'center center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                    </div>
                  </div>
                )}

                {displayMode === 'data' && (
                  <div className="flex flex-col items-center w-full animate-fade-in">
                    {itemType === 'hanhaba' ? (
                      <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden" style={{ width: '216px', height: '480px' }}>
                        <div className="absolute inset-0" style={{ backgroundImage: `url(${creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl)})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 180) * 100}% auto` : '100% auto', backgroundPosition: 'top left', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                      </div>
                    ) : (
                      <div className="relative w-full max-w-[320px] sm:max-w-[400px] aspect-square mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden">
                        <div className="absolute inset-0" style={{ backgroundImage: `url(${creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl)})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : '100% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ▼▼ 操作パネル ▼▼ */}
        <div className="w-full lg:w-1/2 bg-white border border-zinc-200 p-4 sm:p-8 lg:p-10 shrink-0 shadow-sm z-10 relative">
          
          {/* お誘いバナー */}
          <div className="bg-pink-50 border border-pink-200 text-pink-800 p-3 shadow-sm mb-6 rounded-sm">
            <p className="font-bold text-xs mb-1 flex items-center gap-1.5 tracking-wider">
              <span>🌸</span> 1日3回のお楽しみ
            </p>
            <p className="text-[10px] leading-relaxed opacity-90 font-medium">
              深夜0時に生成回数がリセットされます。<br className="sm:hidden" />ブラウザの「ブックマーク」やスマホの「ホーム画面に追加」をして、毎日の息抜きに遊びに来てくださいね。
            </p>
          </div>

          <div className="flex bg-zinc-50 border border-zinc-200 p-1 mb-6 shadow-sm">
            <button type="button" onClick={() => setCreationMode('geometric')} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'geometric' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
              格子・水玉製作所
            </button>
            <button type="button" onClick={() => { setCreationMode('ai'); setPatternTitle(''); }} className={`flex-1 py-2.5 sm:py-3 text-xs font-black tracking-wider transition-all ${creationMode === 'ai' ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-800'}`}>
              AI妄想モード
            </button>
          </div>

          <div className="space-y-6">
            {creationMode === 'ai' ? (
              <>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-900 tracking-wider">01. 図案のイメージ・プロンプト</label>
                    {motif && <button onClick={() => setMotif('')} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-800 tracking-widest uppercase transition-colors">Clear</button>}
                  </div>
                  <textarea className="w-full border border-zinc-300 p-3 sm:p-4 bg-white text-xs sm:text-sm focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none transition-all duration-200 leading-relaxed font-medium shadow-sm" rows={3} value={motif} onChange={(e) => setMotif(e.target.value)} disabled={loading} />
                  <div className="mt-2 text-right">
                    <button type="button" onClick={() => setShowTags(!showTags)} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors py-1">
                      <span>{showTags ? 'ヒントを閉じる' : '図案のヒント・キーワードを探す'}</span>
                      <span className="text-[9px] transform transition-transform duration-200">{showTags ? '▲' : '▼'}</span>
                    </button>
                  </div>
                  {showTags && (
                    <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 animate-fade-in shadow-inner relative z-20">
                      {TAG_CATEGORIES.map((cat) => (
                        <div key={cat.title}>
                          <p className="text-[10px] font-bold text-zinc-400 tracking-wider mb-1">{cat.title}</p>
                          <div className="flex flex-wrap gap-1">
                            {cat.items.map((item) => ( 
                              <button key={item.label} type="button" onClick={() => handleTagClick(item)} className="px-2 py-1 bg-white border border-zinc-200 text-[10px] font-medium text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
                                {item.label}
                              </button> 
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-100 relative">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="block text-xs font-bold text-zinc-900 tracking-wider">02. 配色・地色</label>
                    <button type="button" onClick={() => setShowColorPalette(!showColorPalette)} className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 font-bold transition-colors">
                      <span>{showColorPalette ? '閉じる' : '色見本から選ぶ (102色)'}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                    {selectedColors.length === 0 ? ( 
                      <span className="text-xs text-zinc-400 italic">指定なし（AIにおまかせ）</span> 
                    ) : (
                      <>
                        {selectedColors.map((col) => (
                          <span key={col.name} onClick={() => handleColorToggle(col)} className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border cursor-pointer shadow-sm relative z-10" style={{ backgroundColor: col.hex, color: col.isDark ? '#fff' : '#000' }}>
                            {col.name.split(' ')[0]}<span className="text-[9px] opacity-70">✕</span>
                          </span>
                        ))}
                        <button type="button" onClick={() => setSelectedColors([])} className="text-[10px] text-zinc-400 hover:text-zinc-700 underline ml-1 relative z-10">リセット</button>
                      </>
                    )}
                  </div>
                  {showColorPalette && (
                    <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                      <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {TRADITIONAL_COLORS.map((col) => {
                          const isSelected = selectedColors.some((c) => c.name === col.name);
                          return (
                            <button key={col.name} type="button" onClick={() => handleColorToggle(col)} className={`relative min-h-[44px] p-1.5 flex flex-col justify-end text-left transition-all ${isSelected ? 'ring-2 ring-zinc-950 scale-95 font-black' : 'border border-zinc-200/50 shadow-sm hover:scale-[1.02]'}`} style={{ backgroundColor: col.hex }}>
                              <span className={`text-[9px] font-bold truncate leading-tight flex items-center justify-between ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                                {col.name.split(' ')[0]}
                                {isSelected && <span>✓</span>}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">柄の種類</label>
                    <select 
                      value={geoPatternType} 
                      onChange={(e) => setGeoPatternType(e.target.value as any)}
                      className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10"
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
                      <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">縞の向き</label>
                      <select 
                        value={stripeDir} 
                        onChange={(e) => setStripeDir(e.target.value as StripeDirection)}
                        className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10"
                      >
                        <option value="vertical">縦縞（滝縞）</option>
                        <option value="horizontal">横縞（ボーダー）</option>
                        <option value="diagonal">斜め（右上がり）</option>
                      </select>
                    </div>
                  )}
                  {geoPatternType === 'dot' && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-900 mb-1.5">配置</label>
                      <select 
                        value={dotLayout} 
                        onChange={(e) => setDotLayout(e.target.value as DotLayout)}
                        className="w-full border border-zinc-300 p-2.5 bg-white text-xs focus:border-zinc-900 focus:outline-none shadow-sm relative z-10"
                      >
                        <option value="staggered">千鳥（互い違い）</option>
                        <option value="grid">正方格子</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-5 pt-4 border-t border-zinc-100 relative z-10">
                  <label className="block text-xs font-bold text-zinc-900 mb-2">サイズ調整（mm実寸連動）</label>
                  
                  {geoPatternType === 'dot' && (
                    <>
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-zinc-500">水玉の大きさ（直径）</span>
                          <span className="text-xs font-black text-zinc-900">{dotRadius * 2}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                        </div>
                        <input type="range" min="1" max="50" value={dotRadius} onChange={(e) => setDotRadius(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                          <span className="text-xs font-black text-zinc-900">{gapWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                        </div>
                        <input type="range" min="0" max="100" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                      </div>
                    </>
                  )}

                  {geoPatternType === 'checker' && (
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-zinc-500">市松の大きさ（1マス）</span>
                        <span className="text-xs font-black text-zinc-900">{lineWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                      </div>
                      <input type="range" min="1" max="200" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                    </div>
                  )}

                  {(geoPatternType === 'stripe' || geoPatternType === 'grid' || geoPatternType === 'gingham') && (
                    <>
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-zinc-500">線の太さ</span>
                          <span className="text-xs font-black text-zinc-900">{lineWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                        </div>
                        <input type="range" min="1" max="100" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                      </div>
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-[10px] font-bold text-zinc-500">間隔（余白）</span>
                          <span className="text-xs font-black text-zinc-900">{gapWidth}<span className="text-[9px] font-normal text-zinc-400 ml-0.5">mm</span></span>
                        </div>
                        <input type="range" min="0" max="200" value={gapWidth} onChange={(e) => setGapWidth(Number(e.target.value))} className="w-full cursor-pointer accent-zinc-900 h-2 bg-zinc-200 rounded-lg appearance-none" />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-3 relative">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">地色</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoBgColor }} />
                        <button
                          type="button"
                          onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'bg' ? null : 'bg')}
                          className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'bg' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
                        >
                          伝統色
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-900 mb-1.5">柄色</label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: geoPatternColor }} />
                        <button
                          type="button"
                          onClick={() => setShowGeoPaletteFor(showGeoPaletteFor === 'pattern' ? null : 'pattern')}
                          className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm relative z-10 ${showGeoPaletteFor === 'pattern' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'}`}
                        >
                          伝統色
                        </button>
                      </div>
                    </div>
                  </div>

                  {showGeoPaletteFor && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-zinc-500 font-bold">{showGeoPaletteFor === 'bg' ? '地色' : '柄色'}を選択：</p>
                        <button type="button" onClick={() => setShowGeoPaletteFor(null)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {TRADITIONAL_COLORS.map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              onClick={() => {
                                if (showGeoPaletteFor === 'bg') setGeoBgColor(col.hex);
                                if (showGeoPaletteFor === 'pattern') setGeoPatternColor(col.hex);
                                setShowGeoPaletteFor(null);
                              }}
                              className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform"
                              style={{ backgroundColor: col.hex }}
                            >
                              <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
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

            <div className="space-y-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-zinc-200">
                <div>
                  <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-2">03. 柄の配置</label>
                  <div className="flex flex-col gap-1.5">
                    {['四方柄（上下なし）', '飛び柄（余白あり）', 'お太鼓柄（ワンポイント/1枚絵）'].map((id) => (
                      <button key={id} type="button" onClick={() => setDensity(id)} className={`py-2 px-2.5 text-[11px] font-bold tracking-wider transition-all text-left border ${density === id ? 'bg-zinc-900 text-white border-zinc-900 shadow' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-sm'} relative z-10`}>
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 帯用・裏地用 共通設定パネル切り替え */}
              {(itemType === 'hanhaba' || itemType === 'kyobukuro') && (
                <div className="pt-3 border-t border-zinc-100 relative">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-zinc-700 whitespace-nowrap">裏地の色：</label>
                    <div className="flex items-center gap-1.5 flex-1">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 p-0.5 shadow-inner" style={{ backgroundColor: obiLiningColor }} />
                      <button type="button" onClick={() => setShowLiningPalette(!showLiningPalette)} className={`flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm ${showLiningPalette ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border-zinc-300'} relative z-10`}>
                        伝統色から選ぶ
                      </button>
                    </div>
                  </div>
                  {showLiningPalette && (
                    <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 animate-fade-in shadow-inner relative z-50">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-zinc-500 font-bold">裏地の色を選択：</p>
                        <button type="button" onClick={() => setShowLiningPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                        {TRADITIONAL_COLORS.map((col) => (
                          <button key={col.name} type="button" onClick={() => { setObiLiningColor(col.hex); setShowLiningPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                            <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                              {col.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ▼ 着物専用：帯・小物カスタマイズパネル ▼ */}
              {itemType === 'kimono' && (
                <div className="pt-3 border-t border-zinc-100 space-y-4 relative z-30">
                  <label className="block text-[11px] font-bold text-zinc-800 tracking-wider">着物のコーディネート</label>
                  
                  {/* 帯 */}
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-zinc-700 w-10">帯：</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: 'cover' }} />
                      <button type="button" onClick={() => { setShowObiColorPalette(!showObiColorPalette); setShowHaneriColorPalette(false); setShowObiageColorPalette(false); }} className="flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative z-10">
                        色を選ぶ
                      </button>
                    </div>
                    <label className="flex-1 cursor-pointer text-center text-[10px] h-8 font-bold transition-all border shadow-sm bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 relative z-10">
                      画像から帯を乗せる
                      <input type="file" accept="image/*" className="hidden" onChange={handleCustomObiUpload} />
                    </label>
                    {customObiUrl && ( 
                      <button type="button" onClick={() => setCustomObiUrl(null)} className="text-[10px] text-zinc-500 hover:text-zinc-800 underline ml-1 relative z-10">
                        解除
                      </button> 
                    )}
                  </div>
                  
                  {showObiColorPalette && (
                    <div className="p-4 bg-zinc-50 border border-zinc-200 shadow-inner relative z-50">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] text-zinc-500 font-bold">帯の色を選択：</p>
                        <button type="button" onClick={() => setShowObiColorPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                        {TRADITIONAL_COLORS.map((col) => (
                          <button key={`obi-${col.name}`} type="button" onClick={() => { setKimonoObiColor(col.hex); setCustomObiUrl(null); setShowObiColorPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                            <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                              {col.name.split(' ')[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 半衿と帯揚げの設定 */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-zinc-100/50">
                    
                    {/* 半衿 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-700 w-10">半衿：</span>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoHaneriColor }} />
                          <button type="button" onClick={() => { setShowHaneriColorPalette(!showHaneriColorPalette); setShowObiColorPalette(false); setShowObiageColorPalette(false); }} className="flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative z-10">
                            色を選ぶ
                          </button>
                        </div>
                      </div>
                      {showHaneriColorPalette && (
                        <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 shadow-inner relative z-50">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] text-zinc-500 font-bold">半衿の色を選択：</p>
                            <button type="button" onClick={() => setShowHaneriColorPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                          </div>
                          <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 gap-1.5">
                            {TRADITIONAL_COLORS.map((col) => (
                              <button key={`haneri-${col.name}`} type="button" onClick={() => { setKimonoHaneriColor(col.hex); setShowHaneriColorPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                                <span className={`text-[9px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 帯揚げ */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-700 w-10">帯揚げ：</span>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-8 h-8 shrink-0 border border-zinc-300 shadow-inner" style={{ backgroundColor: kimonoObiageColor }} />
                          <button type="button" onClick={() => { setShowObiageColorPalette(!showObiageColorPalette); setShowObiColorPalette(false); setShowHaneriColorPalette(false); }} className="flex-1 text-[11px] h-8 font-bold transition-all border shadow-sm bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative z-10">
                            色を選ぶ
                          </button>
                        </div>
                      </div>
                      {showObiageColorPalette && (
                        <div className="mt-2 p-4 bg-zinc-50 border border-zinc-200 shadow-inner relative z-50">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] text-zinc-500 font-bold">帯揚げの色を選択：</p>
                            <button type="button" onClick={() => setShowObiageColorPalette(false)} className="text-[10px] text-zinc-400 font-bold">✕</button>
                          </div>
                          <div className="max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 grid grid-cols-3 gap-1.5">
                            {TRADITIONAL_COLORS.map((col) => (
                              <button key={`obiage-${col.name}`} type="button" onClick={() => { setKimonoObiageColor(col.hex); setShowObiageColorPalette(false); }} className="relative min-h-[44px] p-1.5 flex flex-col justify-end text-left border border-zinc-300 shadow-sm hover:scale-[1.02] transition-transform" style={{ backgroundColor: col.hex }}>
                                <span className={`text-[8px] font-bold truncate leading-tight ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>{col.name.split(' ')[0]}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100">
                <label className="block text-xs font-bold text-zinc-800 tracking-wider mb-1">04. 図案銘 <span className="text-[10px] text-zinc-400 font-normal">（作品タイトル）</span></label>
                <input type="text" className="w-full border border-zinc-300 p-3 bg-zinc-50 text-sm focus:outline-none focus:border-zinc-900 focus:bg-white shadow-sm relative z-10" placeholder="例：遊泳金魚図" value={patternTitle} onChange={(e) => setPatternTitle(e.target.value)} disabled={loading} />
              </div>

              {creationMode === 'ai' && (
                <div className="pt-2 border-t border-zinc-100">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none mb-4 group relative z-10">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 border-zinc-300 text-zinc-900 focus:ring-zinc-900 transition-colors cursor-pointer" />
                    <span className="text-[10px] text-zinc-500 leading-tight group-hover:text-zinc-800 transition-colors">
                      生成図案はAIによるアイデアであり、実際の生地制作時は職人の手でデータ調整が行われることに同意します。
                    </span>
                  </label>
                  {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-bold shadow-sm">{errorMsg}</div>}
                  <button type="button" onClick={handleGenerate} disabled={loading || remainingCount === 0} className={`w-full py-4 font-black text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md relative z-10 ${remainingCount === 0 ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed' : 'bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-lg disabled:opacity-50'}`}>
                    {loading ? ( 
                      <div className="flex flex-col items-center gap-1">
                        <span>{LOADING_STEPS[loadingStep]}</span>
                        <span className="text-[8px] text-zinc-400">PROCESSING...</span>
                      </div> 
                    ) : ( 
                      <span>{remainingCount === 0 ? '本日の上限に達しました (3/3)' : `図案を描き出す (残り ${remainingCount ?? 3} 回)`}</span> 
                    )}
                  </button>
                </div>
              )}
            </div>

            {imageUrl && (
              <div className="pt-6 border-t border-zinc-200 space-y-4 relative z-10">
                <a href="#" onClick={handleOrderClick} className="block w-full py-4 sm:py-5 text-center bg-zinc-950 text-white text-sm font-black tracking-widest uppercase transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] border-2 border-zinc-950">
                  この図案でお誂えを申し込む
                </a>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button type="button" onClick={handleDownloadOriginal} className="flex-1 py-3 text-center border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm rounded-sm">
                    平面データを保存
                  </button>
                  <button type="button" onClick={handleNativeShare} className="flex-1 py-3 text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[11px] sm:text-xs font-bold tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm border border-zinc-300 rounded-sm">
                    SNSでシェア（スマホ標準機能）
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f4f4f5]"><p className="text-zinc-400 text-sm font-bold tracking-widest">LOADING...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}
