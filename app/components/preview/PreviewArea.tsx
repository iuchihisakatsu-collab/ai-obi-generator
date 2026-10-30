// components/preview/PreviewArea.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, RefObject } from 'react';

// 定番クイックカラー（ワンタップ切り替え用）
const QUICK_PALETTE = [
  { name: '白磁', hex: '#f8fbf8', border: '#d4d4d8', isDark: false },
  { name: '灰桜', hex: '#e8d3d1', border: '#d4d4d8', isDark: false },
  { name: '漆黒', hex: '#161616', border: '#161616', isDark: true },
  { name: '紺青', hex: '#192f60', border: '#192f60', isDark: true },
  { name: '臙脂', hex: '#9e2a2b', border: '#9e2a2b', isDark: true },
  { name: '深緋', hex: '#8b1e2a', border: '#8b1e2a', isDark: true },
  { name: '芥子', hex: '#d0af4c', border: '#d0af4c', isDark: false },
  { name: '利休鼠', hex: '#888e7e', border: '#888e7e', isDark: true },
];

// 102色 伝統色パレット（フロートモーダル用）
const TRADITIONAL_COLORS = [
  { name: '胡粉', hex: '#fffffc', isDark: false },
  { name: '白磁', hex: '#f8fbf8', isDark: false },
  { name: '生成', hex: '#f6f5ec', isDark: false },
  { name: '白鼠', hex: '#dcdddd', isDark: false },
  { name: '灰桜', hex: '#e8d3d1', isDark: false },
  { name: '銀鼠', hex: '#afafb0', isDark: false },
  { name: '鉛色', hex: '#7b7c7d', isDark: true },
  { name: '利休鼠', hex: '#888e7e', isDark: true },
  { name: '墨色', hex: '#595857', isDark: true },
  { name: '消炭', hex: '#524e4d', isDark: true },
  { name: '漆黒', hex: '#161616', isDark: true },
  { name: '濡羽', hex: '#0b0b0b', isDark: true },
  { name: '甚三紅', hex: '#ee827c', isDark: false },
  { name: '緋色', hex: '#d3381c', isDark: true },
  { name: '朱色', hex: '#ea5532', isDark: true },
  { name: '紅赤', hex: '#e54256', isDark: true },
  { name: '真紅', hex: '#a22041', isDark: true },
  { name: '茜色', hex: '#b7282e', isDark: true },
  { name: '深緋', hex: '#8b1e2a', isDark: true },
  { name: '臙脂', hex: '#9e2a2b', isDark: true },
  { name: '蘇芳', hex: '#8e354a', isDark: true },
  { name: '紅樺', hex: '#bb5548', isDark: true },
  { name: '弁柄', hex: '#8f2e14', isDark: true },
  { name: '暗紅', hex: '#5b191f', isDark: true },
  { name: '桜色', hex: '#fef4f4', isDark: false },
  { name: '薄桜', hex: '#fdeff2', isDark: false },
  { name: '一斤染', hex: '#f4d5cb', isDark: false },
  { name: '撫子', hex: '#eebbcb', isDark: false },
  { name: '珊瑚', hex: '#f5b1aa', isDark: false },
  { name: '桃色', hex: '#f58f98', isDark: false },
  { name: '薔薇', hex: '#e9546b', isDark: true },
  { name: '牡丹', hex: '#e7609e', isDark: true },
  { name: '躑躅', hex: '#e95295', isDark: true },
  { name: '韓紅', hex: '#d9333f', isDark: true },
  { name: '梅紫', hex: '#a8497a', isDark: true },
  { name: '灰梅', hex: '#e8d3ca', isDark: false },
  { name: '洗柿', hex: '#f2a0a1', isDark: false },
  { name: '杏色', hex: '#f7b977', isDark: false },
  { name: '萱草', hex: '#fda14c', isDark: false },
  { name: '蜜柑', hex: '#f08300', isDark: true },
  { name: '橙色', hex: '#ee7800', isDark: true },
  { name: '柿色', hex: '#ed6d3d', isDark: true },
  { name: '黄丹', hex: '#f05a28', isDark: true },
  { name: '赤橙', hex: '#ea5506', isDark: true },
  { name: '琥珀', hex: '#bf783a', isDark: true },
  { name: '煉瓦', hex: '#b55239', isDark: true },
  { name: '黄櫨染', hex: '#7d532c', isDark: true },
  { name: '枯野', hex: '#d3a243', isDark: false },
  { name: '蒸栗', hex: '#ede1a9', isDark: false },
  { name: '刈安', hex: '#f5e56b', isDark: false },
  { name: '菜の花', hex: '#ffec47', isDark: false },
  { name: '蒲公英', hex: '#ffd900', isDark: false },
  { name: '山吹', hex: '#f8b500', isDark: true },
  { name: '鬱金', hex: '#fabf14', isDark: false },
  { name: '芥子', hex: '#d0af4c', isDark: false },
  { name: '金茶', hex: '#c7802d', isDark: true },
  { name: '黄土', hex: '#c39143', isDark: true },
  { name: '桑染', hex: '#b79b5b', isDark: false },
  { name: '朽葉', hex: '#917347', isDark: true },
  { name: '利休白茶', hex: '#b4a992', isDark: false },
  { name: '白緑', hex: '#d6e9ca', isDark: false },
  { name: '浅緑', hex: '#88cb7f', isDark: false },
  { name: '鶸色', hex: '#d7cf3a', isDark: false },
  { name: '若草', hex: '#abc900', isDark: false },
  { name: '青磁', hex: '#7ebea5', isDark: false },
  { name: '薄浅葱', hex: '#93b9b4', isDark: false },
  { name: '柳葉', hex: '#a1a46d', isDark: false },
  { name: '若竹', hex: '#68be8d', isDark: true },
  { name: '翡翠', hex: '#38b48b', isDark: true },
  { name: '常磐', hex: '#1b4d3e', isDark: true },
  { name: '萌葱', hex: '#006e54', isDark: true },
  { name: '千歳緑', hex: '#314f40', isDark: true },
  { name: '松葉', hex: '#455845', isDark: true },
  { name: '木賊', hex: '#3b7960', isDark: true },
  { name: '緑青', hex: '#47885e', isDark: true },
  { name: '海松', hex: '#726d40', isDark: true },
  { name: '鶯色', hex: '#928c36', isDark: true },
  { name: '苔色', hex: '#69821b', isDark: true },
  { name: '甕覗', hex: '#a2d7dd', isDark: false },
  { name: '白群', hex: '#83ccd2', isDark: false },
  { name: '水色', hex: '#bce2e8', isDark: false },
  { name: '勿忘草', hex: '#89c3eb', isDark: false },
  { name: '空色', hex: '#a0d8ef', isDark: false },
  { name: '露草', hex: '#2ea9df', isDark: true },
  { name: '浅葱', hex: '#00a3af', isDark: true },
  { name: '錆浅葱', hex: '#5c9291', isDark: true },
  { name: '縹色', hex: '#2792c3', isDark: true },
  { name: '瑠璃', hex: '#1e50a2', isDark: true },
  { name: '群青', hex: '#4c6cb3', isDark: true },
  { name: '藍色', hex: '#163b5c', isDark: true },
  { name: '紺青', hex: '#192f60', isDark: true },
  { name: '鉄紺', hex: '#17184b', isDark: true },
  { name: '納戸', hex: '#004055', isDark: true },
  { name: '碧色', hex: '#007380', isDark: true },
  { name: '藍鉄', hex: '#393f4c', isDark: true },
  { name: '留紺', hex: '#1c1c39', isDark: true },
  { name: '白藤', hex: '#dbd0e6', isDark: false },
  { name: '藤色', hex: '#bbbcde', isDark: false },
  { name: '紫苑', hex: '#8f77b5', isDark: true },
  { name: '菖蒲', hex: '#cc7eb1', isDark: true },
  { name: '竜胆', hex: '#9079ad', isDark: true },
  { name: '桔梗', hex: '#5654a2', isDark: true },
  { name: '江戸紫', hex: '#745399', isDark: true },
  { name: '古代紫', hex: '#895b8a', isDark: true },
  { name: '京紫', hex: '#9d5b8b', isDark: true },
  { name: '葡萄色', hex: '#640125', isDark: true },
  { name: '滅紫', hex: '#594255', isDark: true },
  { name: '濃紫', hex: '#3a243b', isDark: true },
  { name: '丁子', hex: '#efcd9a', isDark: false },
  { name: '鳥の子', hex: '#dac9a6', isDark: false },
  { name: '灰茶', hex: '#98623c', isDark: true },
  { name: '胡桃', hex: '#a86f4c', isDark: true },
  { name: '栗色', hex: '#762f07', isDark: true },
  { name: '焦茶', hex: '#693b32', isDark: true },
];

interface PreviewAreaProps {
  imageUrl?: string;
  blobUrl?: string;
  rotatedPatternUrl?: string;
  serialNumber?: string;
  itemType?: 'hanhaba' | 'kyobukuro' | 'kimono';
  displayMode?: 'mockup' | 'trim' | 'data';
  creationMode?: 'ai' | 'geometric';
  bgSizeMm?: number;
  geoBgColor?: string;
  obiLiningColor?: string;
  setObiLiningColor?: (color: string) => void;
  kimonoHaneriColor?: string;
  setKimonoHaneriColor?: (color: string) => void;
  kimonoObiageColor?: string;
  setKimonoObiageColor?: (color: string) => void;
  kimonoObiColor?: string;
  setKimonoObiColor?: (color: string) => void;
  customObiUrl?: string | null;
  mockupSubmitting?: boolean;
  previewRef?: RefObject<HTMLDivElement>;
  previewContainerRef?: RefObject<HTMLDivElement>;
  handleItemTypeChange?: (type: 'hanhaba' | 'kyobukuro' | 'kimono') => void;
  setDisplayMode?: (mode: 'mockup' | 'trim' | 'data') => void;
  handleDownloadMapping?: () => void;
  UNIVERSAL_SCALE_FACTOR?: number;
}

export default function PreviewArea(props: PreviewAreaProps) {
  const {
    imageUrl = '',
    blobUrl = '',
    rotatedPatternUrl = '',
    serialNumber = '',
    itemType = 'hanhaba',
    displayMode = 'mockup',
    creationMode = 'ai',
    bgSizeMm = 100,
    geoBgColor = '#ffffff',
    customObiUrl = null,
    mockupSubmitting = false,
    previewRef,
    previewContainerRef,
    handleItemTypeChange = () => {},
    setDisplayMode = () => {},
    handleDownloadMapping = () => {},
    UNIVERSAL_SCALE_FACTOR = 3 / 22
  } = props;

  // 親からsetterが渡されていなくても単体で動く二重防壁（内部State）
  const [activeLiningColor, setActiveLiningColor] = useState(props.obiLiningColor || '#f8fbf8');
  const [activeHaneriColor, setActiveHaneriColor] = useState(props.kimonoHaneriColor || '#ffffff');
  const [activeObiageColor, setActiveObiageColor] = useState(props.kimonoObiageColor || '#d3381c');
  const [activeObiColor, setActiveObiColor] = useState(props.kimonoObiColor || '#161616');

  // 着物モード時の編集対象パーツ（haneri, obiage, obi）
  const [kimonoPartTarget, setKimonoPartTarget] = useState<'haneri' | 'obiage' | 'obi'>('obi');

  // 102色フロートモーダルの開閉状態
  const [showFloatModal, setShowFloatModal] = useState(false);

  // スマホ専用PIPワイプ（丸い生中継小窓）のスクロール出現フラグ
  const [isCompact, setIsCompact] = useState(false);

  // 親propsが変更された場合の同期
  useEffect(() => {
    if (props.obiLiningColor) setActiveLiningColor(props.obiLiningColor);
  }, [props.obiLiningColor]);

  useEffect(() => {
    if (props.kimonoHaneriColor) setActiveHaneriColor(props.kimonoHaneriColor);
  }, [props.kimonoHaneriColor]);

  useEffect(() => {
    if (props.kimonoObiageColor) setActiveObiageColor(props.kimonoObiageColor);
  }, [props.kimonoObiageColor]);

  useEffect(() => {
    if (props.kimonoObiColor) setActiveObiColor(props.kimonoObiColor);
  }, [props.kimonoObiColor]);

  // スクロール検知：スマホで140px以上スクロールしたら丸い生中継フロート小窓を出現
  useEffect(() => {
    const handleScroll = () => {
      const top = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (window.innerWidth < 1024) {
        setIsCompact(top > 140);
      } else {
        setIsCompact(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // カラー変更ハンドラー（親propsがあれば通知、内部stateも更新）
  const handleColorChange = (colorHex: string) => {
    if (itemType === 'hanhaba' || itemType === 'kyobukuro') {
      setActiveLiningColor(colorHex);
      if (props.setObiLiningColor) props.setObiLiningColor(colorHex);
    } else if (itemType === 'kimono') {
      if (kimonoPartTarget === 'haneri') {
        setActiveHaneriColor(colorHex);
        if (props.setKimonoHaneriColor) props.setKimonoHaneriColor(colorHex);
      } else if (kimonoPartTarget === 'obiage') {
        setActiveObiageColor(colorHex);
        if (props.setKimonoObiageColor) props.setKimonoObiageColor(colorHex);
      } else if (kimonoPartTarget === 'obi') {
        setActiveObiColor(colorHex);
        if (props.setKimonoObiColor) props.setKimonoObiColor(colorHex);
      }
    }
  };

  const effectivePatternUrl = creationMode === 'geometric' ? imageUrl : (rotatedPatternUrl || blobUrl || imageUrl);
  const hasPattern = Boolean(effectivePatternUrl);

  // モックアップ描画関数
  const renderMockup = () => {
    const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
    const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;

    return (
      <>
        {/* 半幅帯マッピング */}
        {itemType === 'hanhaba' && (
          <div className="relative w-full h-full overflow-hidden">
            {[ 
              { id: '01', file: 'hanhaba_Layer01.png', z: 10, rot: 2, bgX: '12%', bgY: '34%' }, 
              { id: '02', file: 'hanhaba_Layer02.png', z: 20, rot: 1, bgX: '45%', bgY: '67%' }, 
              { id: '03', file: 'hanhaba_Layer03.png', z: 30, rot: 8, bgX: '78%', bgY: '12%' }, 
              { id: '04', file: 'hanhaba_Layer04.png', z: 40, rot: -1, bgX: '23%', bgY: '89%' }, 
              { id: '05', file: 'hanhaba_Layer05.png', z: 50, rot: -10, bgX: '56%', bgY: '45%' }, 
              { id: '06', file: 'hanhaba_Layer06.png', z: 60, rot: -93, bgX: '89%', bgY: '23%' }
            ].map((layer) => (
              <div 
                key={layer.id} 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  zIndex: layer.z, 
                  maskImage: `url('/${layer.file}')`, 
                  WebkitMaskImage: `url('/${layer.file}')`, 
                  maskSize: 'contain', 
                  WebkitMaskSize: 'contain', 
                  maskRepeat: 'no-repeat', 
                  WebkitMaskRepeat: 'no-repeat', 
                  maskPosition: 'center', 
                  WebkitMaskPosition: 'center' 
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '-25%', 
                  left: '-25%', 
                  width: '150%', 
                  height: '150%', 
                  backgroundImage: hasPattern ? `url(${effectivePatternUrl})` : 'none', 
                  backgroundSize: patternSize, 
                  backgroundRepeat: 'repeat', 
                  backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                  transform: `rotate(${layer.rot}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: hasPattern 
                    ? (creationMode === 'geometric' ? geoBgColor : 'transparent') 
                    : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 65, 
                maskImage: `url('/hanhaba_Layer07.png')`, 
                WebkitMaskImage: `url('/hanhaba_Layer07.png')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div style={{ position: 'absolute', top: '-25%', left: '-25%', width: '150%', height: '150%', backgroundColor: activeLiningColor }} />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 70, 
                backgroundImage: `url('/hanhaba_Layer_kage.png')`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                mixBlendMode: 'multiply', 
                opacity: 0.5 
              }} 
            />
          </div>
        )}

        {/* 京袋帯マッピング */}
        {itemType === 'kyobukuro' && (
          <div className="relative w-full h-full overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              <img src={`/kyoubukurogrand.png`} alt="" className="w-full h-full object-contain" />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 20, 
                maskImage: `url('/kyoubukurouraji.png')`, 
                WebkitMaskImage: `url('/kyoubukurouraji.png')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div className="w-full h-full" style={{ backgroundColor: activeLiningColor }} />
            </div>
            {[ 
              { id: 'hara', file: 'kyoubukurohara.png', z: 30, rot: 271, bgX: '50%', bgY: '50%' }, 
              { id: 'tare', file: 'kyoubukurotare.png', z: 40, rot: -1, bgX: '50%', bgY: '50%' }, 
              { id: 'taiko', file: 'kyoubukurotakio.png', z: 50, rot: 2, bgX: '50%', bgY: '50%' }
            ].map((layer) => (
              <div 
                key={layer.id} 
                className="absolute inset-0 pointer-events-none" 
                style={{ 
                  zIndex: layer.z, 
                  maskImage: `url('/${layer.file}')`, 
                  WebkitMaskImage: `url('/${layer.file}')`, 
                  maskSize: 'contain', 
                  WebkitMaskSize: 'contain', 
                  maskRepeat: 'no-repeat', 
                  WebkitMaskRepeat: 'no-repeat', 
                  maskPosition: 'center', 
                  WebkitMaskPosition: 'center' 
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  top: '-25%', 
                  left: '-25%', 
                  width: '150%', 
                  height: '150%', 
                  backgroundImage: hasPattern ? `url(${effectivePatternUrl})` : 'none', 
                  backgroundSize: patternSize, 
                  backgroundRepeat: 'repeat', 
                  backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                  transform: `rotate(${layer.rot}deg)`, 
                  transformOrigin: 'center center', 
                  backgroundColor: hasPattern 
                    ? (creationMode === 'geometric' ? geoBgColor : 'transparent') 
                    : '#f4f4f5' 
                }} />
              </div>
            ))}
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 60, 
                backgroundImage: `url('/kyoubukuromask.png')`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                mixBlendMode: 'multiply', 
                opacity: 0.5 
              }} 
            />
          </div>
        )}

        {/* 着物マッピング */}
        {itemType === 'kimono' && (
          <div className="relative w-full h-full overflow-hidden bg-white">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              <img src={`/haikei.png`} alt="" className="w-full h-full object-contain"
