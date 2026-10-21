'use client';

import React, { useState, useEffect } from 'react';

// ==========================================
// 1. 定数定義エリア（選択肢などの設定）
// ==========================================
const DENSITY_OPTIONS = [
  '総柄（ぎっしり華やか）',
  '飛び柄',
  '四方柄・散らし柄', // ← 今回追加した四方柄
  'お太鼓柄（ワンポイント/1枚絵）'
];

const ITEM_TYPES = [
  { id: 'hanhaba', label: '半幅帯 (横長 16:9)' },
  { id: 'tanmono', label: '反物・着尺 (縦長 9:16)' },
  { id: 'square', label: '正方形 (お太鼓・小物用)' }
];

// ※ここに実際の伝統色102色の配列を入れてください（長くなるため省略表記しています）
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
  // ...既存の102色リストを配置...
];

export default function Home() {
  // ==========================================
  // 2. 状態管理（State）エリア
  // ==========================================
  const [motif, setMotif] = useState('');
  const [color, setColor] = useState('#fbfaf5');
  const [density, setDensity] = useState('総柄（ぎっしり華やか）');
  const [itemType, setItemType] = useState('hanhaba');
  
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // 1日の生成回数制限（最大3回）
  const [generationsLeft, setGenerationsLeft] = useState(3);

  // ==========================================
  // 3. ロジック・関数エリア（回数制限・API通信など）
  // ==========================================
  
  // 初期読み込み時の回数制限チェック
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('komon_generations');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        setGenerationsLeft(data.left);
      } else {
        localStorage.setItem('komon_generations', JSON.stringify({ date: today, left: 3 }));
        setGenerationsLeft(3);
      }
    } else {
      localStorage.setItem('komon_generations', JSON.stringify({ date: today, left: 3 }));
    }
  }, []);

  // 隠しコマンド（ベホイミ）検知
  useEffect(() => {
    if (motif === 'ベホイミ') {
      const today = new Date().toDateString();
      localStorage.setItem('komon_generations', JSON.stringify({ date: today, left: 3 }));
      setGenerationsLeft(3);
      setMotif(''); // 入力欄をクリア
      alert('【管理者モード】生成回数をリセットしました！');
    }
  }, [motif]);

  // 画像生成処理
  const handleGenerate = async () => {
    if (generationsLeft <= 0) {
      setErrorMsg('本日の生成上限（3回）に達しました。また明日お試しください。');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    setImageUrl('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motif, color, density, itemType }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'エラーが発生しました');

      setImageUrl(data.imageUrl);

      // 回数を減らす
      const newLeft = generationsLeft - 1;
      setGenerationsLeft(newLeft);
      localStorage.setItem('komon_generations', JSON.stringify({ date: new Date().toDateString(), left: newLeft }));

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. UI: 画面描画（HTML）エリア
  // ==========================================
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">
      
      {/* --- ヘッダー部分 --- */}
      <header className="bg-black text-white p-6 text-center">
        <h1 className="text-2xl font-serif tracking-widest">妄想小紋図案帖</h1>
        <p className="text-sm mt-2 opacity-80">AIが紡ぐ、あなただけの着物図案</p>
      </header>

      <main className="max-w-3xl mx-auto p-6 mt-8">
        
        {/* --- 入力フォーム エリア --- */}
        <section className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          
          {/* 1. モチーフ入力 */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">モチーフ・世界観</label>
            <textarea
              className="w-full p-3 border rounded focus:ring-2 focus:ring-black outline-none"
              rows={3}
              placeholder="例：猫と牡丹、大正ロマン風、ステンドグラス..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
            />
          </div>

          {/* 2. 地色の選択 */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">地色（カラー）</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-12 h-12 cursor-pointer"
              />
              <span className="text-sm text-gray-600">※お好みの色を選択、またはテキストで指定</span>
            </div>
            {/* 伝統色パレットを表示する場合はここに配置 */}
          </div>

          {/* 3. 形式（比率）の選択 */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">形式</label>
            <div className="flex flex-wrap gap-4">
              {ITEM_TYPES.map((item) => (
                <label key={item.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="itemType"
                    value={item.id}
                    checked={itemType === item.id}
                    onChange={(e) => setItemType(e.target.value)}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. 柄の密度・配置の選択（四方柄を追加した箇所） */}
          <div className="mb-8">
            <label className="block text-sm font-bold mb-2">柄の密度・配置</label>
            <div className="flex flex-wrap gap-4">
              {DENSITY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="density"
                    value={option}
                    checked={density === option}
                    onChange={(e) => setDensity(e.target.value)}
                    className="accent-black w-4 h-4"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {/* クリエイター向けのアピールポイント表示 */}
            {density === '四方柄・散らし柄' && (
              <p className="text-xs text-gray-600 mt-3 bg-white p-2 border border-gray-200 rounded">
                💡 上下の向きがないため、洋服や小物を作る際に裁断ロスが少なく扱いやすい配置です。
              </p>
            )}
          </div>

          {/* 生成ボタン */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">本日の残り生成回数: {generationsLeft}回</p>
            <button
              onClick={handleGenerate}
              disabled={isLoading || generationsLeft <= 0 || !motif}
              className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors w-full font-bold tracking-wide"
            >
              {isLoading ? '図案を生成中...' : 'AIで図案を描く'}
            </button>
          </div>
          {errorMsg && <p className="text-red-500 text-sm mt-4 text-center font-bold">{errorMsg}</p>}
        </section>

        {/* ========================================== */}
        {/* 5. UI: 画像表示＆MakeShop連携エリア */}
        {/* ========================================== */}
        {imageUrl && (
          <section className="mt-12 text-center animate-fade-in">
            <h2 className="text-xl font-bold mb-4">完成した図案</h2>
            <div className="border p-2 bg-white shadow-sm inline-block">
              <img src={imageUrl} alt="生成された図案" className="max-w-full h-auto max-h-[600px] object-contain" />
            </div>

            {/* ▼ 今後ここに「生地にしてみる」ボタン（MakeShop連携）を追加します ▼ */}
            <div className="mt-8 bg-gray-50 p-6 rounded border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">この図案を使って、オリジナルのテキスタイルを制作できます。</p>
              {/* <button className="...">生地にしてみる</button> */}
            </div>
            {/* ▲ ここまで ▲ */}

          </section>
        )}

      </main>
    </div>
  );
}
