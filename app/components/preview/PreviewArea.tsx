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

  // 親setter未指定時でも単体稼働する内部State
  const [activeLiningColor, setActiveLiningColor] = useState(props.obiLiningColor || '#f8fbf8');
  const [activeHaneriColor, setActiveHaneriColor] = useState(props.kimonoHaneriColor || '#ffffff');
  const [activeObiageColor, setActiveObiageColor] = useState(props.kimonoObiageColor || '#d3381c');
  const [activeObiColor, setActiveObiColor] = useState(props.kimonoObiColor || '#161616');

  // 着物モード時の対象部位セレクター
  const [kimonoPartTarget, setKimonoPartTarget] = useState<'haneri' | 'obiage' | 'obi'>('obi');

  // 102色フロートパレットの開閉
  const [showFloatModal, setShowFloatModal] = useState(false);

  // スマホ専用PIPワイプ（丸い生中継小窓）スクロール出現
  const [isCompact, setIsCompact] = useState(false);

  // 親propsとの同期
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

  // スマホスクロール監視
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

  // カラー変更ハンドラー
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

  const patternSize = creationMode === 'geometric' ? `${bgSizeMm * UNIVERSAL_SCALE_FACTOR}% auto` : `${180 * UNIVERSAL_SCALE_FACTOR}% auto`;
  const kimonoPatternSize = creationMode === 'geometric' ? `${(bgSizeMm * UNIVERSAL_SCALE_FACTOR) / 2}% auto` : `${(180 * UNIVERSAL_SCALE_FACTOR) / 2}% auto`;

  // モックアップ本体の描画
  const renderMockup = () => {
    return (
      <div className="relative w-full h-full overflow-hidden">
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

        {itemType === 'kimono' && (
          <div className="relative w-full h-full overflow-hidden bg-white">
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
              <img src={`/haikei.png`} alt="" className="w-full h-full object-contain" />
            </div>
            {[ 
              { id: 'usiromigoro', file: 'usiromigoro_75.png', z: 10, angle: 75, bgX: '50%', bgY: '50%' },
              { id: 'migisode', file: 'migisode_165.png', z: 15, angle: 165, bgX: '20%', bgY: '30%' },
              { id: 'hidarisode', file: 'hidarisode_150.png', z: 20, angle: 150, bgX: '80%', bgY: '40%' },
              { id: 'hidarisode2', file: 'hidarisode2_175.png', z: 25, angle: 175, bgX: '80%', bgY: '70%' },
              { id: 'maemigoro', file: 'maemigoro_105.png', z: 30, angle: 105, bgX: '45%', bgY: '60%' },
              { id: 'maemigoro2', file: 'maemigoro2_140.png', z: 35, angle: 140, bgX: '45%', bgY: '20%' },
              { id: 'maeokumi', file: 'maeokumi_110.png', z: 40, angle: 110, bgX: '55%', bgY: '50%' },
              { id: 'migieri', file: 'migieri_65.png', z: 50, angle: 65, bgX: '30%', bgY: '10%' },
              { id: 'hidarieri', file: 'hidarieri_117.png', z: 55, angle: 117, bgX: '70%', bgY: '10%' },
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
                  top: '-50%', 
                  left: '-50%', 
                  width: '200%', 
                  height: '200%', 
                  backgroundImage: hasPattern ? `url(${effectivePatternUrl})` : 'none', 
                  backgroundSize: kimonoPatternSize, 
                  backgroundRepeat: 'repeat', 
                  backgroundPosition: `${layer.bgX} ${layer.bgY}`, 
                  transform: `rotate(${layer.angle - 90}deg)`, 
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
                zIndex: 45, 
                maskImage: `url('/haneri.png')`, 
                WebkitMaskImage: `url('/haneri.png')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div className="w-full h-full relative" style={{ backgroundColor: activeHaneriColor }}>
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }} />
              </div>
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 60, 
                maskImage: `url('/obiage.png')`, 
                WebkitMaskImage: `url('/obiage.png')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div className="w-full h-full" style={{ backgroundColor: activeObiageColor }} />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 65, 
                maskImage: `url('/obi_2.png')`, 
                WebkitMaskImage: `url('/obi_2.png')`, 
                maskSize: 'contain', 
                WebkitMaskSize: 'contain', 
                maskRepeat: 'no-repeat', 
                WebkitMaskRepeat: 'no-repeat', 
                maskPosition: 'center', 
                WebkitMaskPosition: 'center' 
              }}
            >
              <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', backgroundColor: customObiUrl ? 'transparent' : activeObiColor, backgroundImage: customObiUrl ? `url(${customObiUrl})` : 'none', backgroundSize: '50% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat' }} />
            </div>
            <div 
              className="absolute inset-0 pointer-events-none" 
              style={{ 
                zIndex: 70, 
                backgroundImage: `url('/jyouzan.png')`, 
                backgroundSize: 'contain', 
                backgroundPosition: 'center', 
                backgroundRepeat: 'no-repeat', 
                mixBlendMode: 'multiply', 
                opacity: 0.5 
              }} 
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={previewRef} className="w-full lg:w-1/2 shrink-0 lg:sticky lg:top-8 flex flex-col bg-[#dedee2] lg:bg-transparent shadow-md lg:shadow-none mb-6 lg:mb-0">
      <div className="w-full bg-[#e4e4e7] flex flex-col relative overflow-hidden rounded-xs border border-zinc-300 shadow-sm">
        
        {/* ヘッダー・アイテム切り替えバー */}
        <div className="px-3 py-2 bg-zinc-900 text-white flex items-center justify-between z-30">
          <span className="text-[10px] font-mono text-zinc-400">
            {serialNumber ? `ID:${serialNumber}` : 'ID:SAMPLE'}
          </span>
          <div className="flex gap-1.5 items-center">
            <button type="button" onClick={() => handleItemTypeChange('hanhaba')} className={`px-2 py-1 text-[10px] font-black rounded transition-all ${itemType === 'hanhaba' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>半幅帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kyobukuro')} className={`px-2 py-1 text-[10px] font-black rounded transition-all ${itemType === 'kyobukuro' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>京袋帯</button>
            <button type="button" onClick={() => handleItemTypeChange('kimono')} className={`px-2 py-1 text-[10px] font-black rounded transition-all flex items-center gap-1 ${itemType === 'kimono' ? 'bg-white text-zinc-950' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
              着物<span className="text-[7px] bg-red-500 text-white px-1 py-0.5 rounded-sm animate-pulse leading-none shadow-sm">NEW</span>
            </button>
          </div>
        </div>

        {/* メインプレビューコンテナ */}
        <div className="w-full relative shadow-inner overflow-hidden flex flex-col items-center justify-center min-h-[420px] sm:min-h-[460px] pt-14 pb-14 bg-[#dedee2]">
          
          {/* 上部タブ切替 */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 px-2 z-20">
            <button type="button" onClick={() => setDisplayMode('mockup')} className={`px-2.5 sm:px-3 py-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'mockup' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
              {itemType === 'hanhaba' && '半幅帯マッピング'}
              {itemType === 'kyobukuro' && '京袋帯マッピング'}
              {itemType === 'kimono' && '着物マッピング'}
            </button>
            {itemType === 'kyobukuro' && (
              <button type="button" onClick={() => setDisplayMode('trim')} className={`px-2.5 sm:px-3 py-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'trim' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
                34cm裁断イメージ
              </button>
            )}
            <button type="button" onClick={() => setDisplayMode('data')} className={`px-2.5 sm:px-3 py-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider rounded-full backdrop-blur-md border transition-all shadow-md ${displayMode === 'data' ? 'bg-zinc-900/90 text-white border-zinc-900/50' : 'bg-white/70 text-zinc-700 border-white/50 hover:bg-white/90'}`}>
              {itemType === 'hanhaba' ? '18cmプリントデータ' : '40cm反物データ'}
            </button>
          </div>

          {/* 1. モックアップ表示 */}
          {displayMode === 'mockup' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10 px-4">
              <div 
                ref={previewContainerRef} 
                className="relative mx-auto drop-shadow-xl w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] flex items-center justify-center overflow-hidden bg-[#dedee2]"
              >
                {renderMockup()}
              </div>

              {/* フローティング着せ替えセレクター */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-zinc-200 z-20 max-w-full">
                
                {/* 帯モード：裏地色セレクター */}
                {(itemType === 'hanhaba' || itemType === 'kyobukuro') && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-zinc-600 tracking-wider">裏地:</span>
                    <div className="flex items-center gap-1">
                      {QUICK_PALETTE.map((col) => (
                        <button
                          key={col.hex}
                          type="button"
                          title={col.name}
                          onClick={() => handleColorChange(col.hex)}
                          className={`w-5 h-5 rounded-full border transition-transform ${
                            activeLiningColor.toLowerCase() === col.hex.toLowerCase() 
                              ? 'scale-125 ring-2 ring-zinc-900 shadow' 
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: col.hex, borderColor: col.border }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowFloatModal(true)}
                        className="px-1.5 py-0.5 ml-1 text-[8.5px] font-bold bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-300 rounded text-zinc-700 transition-colors"
                      >
                        ＋102色
                      </button>
                    </div>
                  </div>
                )}

                {/* 着物モード：半衿 / 帯揚げ / 帯のフローティング着せ替えタブ */}
                {itemType === 'kimono' && (
                  <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-0.5 rounded-full border border-zinc-200 text-[8.5px] font-bold">
                      <button
                        type="button"
                        onClick={() => setKimonoPartTarget('haneri')}
                        className={`px-2 py-0.5 rounded-full transition-all ${kimonoPartTarget === 'haneri' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'}`}
                      >
                        半衿
                      </button>
                      <button
                        type="button"
                        onClick={() => setKimonoPartTarget('obiage')}
                        className={`px-2 py-0.5 rounded-full transition-all ${kimonoPartTarget === 'obiage' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'}`}
                      >
                        帯揚
                      </button>
                      <button
                        type="button"
                        onClick={() => setKimonoPartTarget('obi')}
                        className={`px-2 py-0.5 rounded-full transition-all ${kimonoPartTarget === 'obi' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600'}`}
                      >
                        帯
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {QUICK_PALETTE.map((col) => {
                        const isSelected = 
                          (kimonoPartTarget === 'haneri' && activeHaneriColor.toLowerCase() === col.hex.toLowerCase()) ||
                          (kimonoPartTarget === 'obiage' && activeObiageColor.toLowerCase() === col.hex.toLowerCase()) ||
                          (kimonoPartTarget === 'obi' && activeObiColor.toLowerCase() === col.hex.toLowerCase());

                        return (
                          <button
                            key={col.hex}
                            type="button"
                            title={col.name}
                            onClick={() => handleColorChange(col.hex)}
                            className={`w-5 h-5 rounded-full border transition-transform ${isSelected ? 'scale-125 ring-2 ring-zinc-900 shadow' : 'hover:scale-110'}`}
                            style={{ backgroundColor: col.hex, borderColor: col.border }}
                          />
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setShowFloatModal(true)}
                        className="px-1.5 py-0.5 ml-1 text-[8.5px] font-bold bg-zinc-100 hover:bg-zinc-900 hover:text-white border border-zinc-300 rounded text-zinc-700 transition-colors"
                      >
                        ＋102色
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. トリム表示 */}
          {displayMode === 'trim' && itemType === 'kyobukuro' && (
            <div className="w-full flex flex-col items-center animate-fade-in relative z-10 px-4">
              <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-[280px] h-[238px] sm:w-[350px] sm:h-[298px] flex items-center justify-center">
                {hasPattern ? (
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : `${(180 / 400) * 100}% auto`, backgroundPosition: 'center center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                ) : (
                  <span className="text-zinc-400 text-[11px] font-medium text-center p-4">図案を生成すると34cm裁断イメージが表示されます</span>
                )}
              </div>
            </div>
          )}

          {/* 3. データ表示 */}
          {displayMode === 'data' && (
            <div className="flex flex-col items-center w-full animate-fade-in relative z-10 px-4">
              {itemType === 'hanhaba' ? (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-[180px] h-[400px] flex items-center justify-center">
                  {hasPattern ? (
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 180) * 100}% auto` : '100% auto', backgroundPosition: 'top left', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                  ) : (
                    <span className="text-zinc-400 text-[11px] font-medium text-center p-4">18cmプリントデータ<br />（未生成）</span>
                  )}
                </div>
              ) : (
                <div className="relative mx-auto border border-zinc-300 bg-white shadow-md overflow-hidden w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
                  {hasPattern ? (
                    <div className="absolute inset-0" style={{ backgroundImage: `url(${effectivePatternUrl})`, backgroundSize: creationMode === 'geometric' ? `${(bgSizeMm / 400) * 100}% auto` : '100% auto', backgroundPosition: 'center', backgroundRepeat: 'repeat', backgroundColor: creationMode === 'geometric' ? geoBgColor : '#fff' }} />
                  ) : (
                    <span className="text-zinc-400 text-[11px] font-medium text-center p-4">40cm反物データ<br />（未生成）</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* フローティング「画像を保存」ボタン */}
          {displayMode === 'mockup' && (
            <button 
              type="button" 
              onClick={handleDownloadMapping} 
              disabled={mockupSubmitting} 
              className={`absolute bottom-11 right-3 z-30 px-3 py-1.5 text-[9.5px] font-bold tracking-wider rounded-full shadow-lg backdrop-blur-md border transition-all flex items-center gap-1.5 hover:bg-black ${ mockupSubmitting ? 'bg-zinc-400/80 text-white border-zinc-400 cursor-not-allowed' : 'bg-zinc-900/90 text-white border-zinc-900/50' }`}
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {mockupSubmitting ? '作成中...' : '画像を保存'}
            </button>
          )}

          {/* 最下部の手作業修正フローティング注釈バー */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-md border-t border-zinc-200 px-3 py-2 shadow-sm flex items-center justify-center pointer-events-none">
            <p className="text-[9px] sm:text-[10px] text-zinc-700 font-medium leading-tight text-center tracking-wide">
              ※ 画面上は柄のつなぎ目が切れて見える場合がありますが、実際のお仕立て時は<br className="sm:hidden" />
              <strong className="text-zinc-950 font-black">ゴフクヤサンが目視・手作業で柄送りを綺麗に修正</strong>します。
            </p>
          </div>

          {/* 102色伝統色パレット（フロートモーダル） */}
          {showFloatModal && (
            <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
              <div className="bg-white rounded-md shadow-2xl border border-zinc-300 w-full max-w-[340px] max-h-[85%] flex flex-col overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                  <span className="text-[10px] font-black text-zinc-900 tracking-wider">
                    {itemType === 'kimono' ? `${kimonoPartTarget === 'haneri' ? '半衿' : kimonoPartTarget === 'obiage' ? '帯揚げ' : '帯'}の色を選択（102色）` : '裏地の色を選択（102色）'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFloatModal(false)}
                    className="text-zinc-400 hover:text-zinc-900 text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-2 overflow-y-auto grid grid-cols-4 gap-1.5">
                  {TRADITIONAL_COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => {
                        handleColorChange(col.hex);
                        setShowFloatModal(false);
                      }}
                      className="p-1 rounded text-left border border-zinc-200 flex flex-col justify-end min-h-[38px] hover:scale-105 transition-transform shadow-2xs"
                      style={{ backgroundColor: col.hex }}
                    >
                      <span className={`text-[7.5px] font-bold truncate leading-none ${col.isDark ? 'text-white' : 'text-zinc-900'}`}>
                        {col.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* スマホ専用：右下生中継フロート小窓（PIPワイプ） */}
      <button
        type="button"
        onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className={`lg:hidden fixed bottom-6 right-5 z-50 w-[150px] h-[150px] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-[3.5px] border-white overflow-hidden active:scale-95 transition-all duration-500 group bg-[#dedee2] ${isCompact ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'}`}
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center scale-[1.1] transition-transform duration-500 group-hover:scale-[1.2]">
          <div className="w-[150px] h-[150px]">
            {renderMockup()}
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center transition-colors group-hover:bg-black/20">
          <div className="bg-black/60 p-2.5 rounded-full backdrop-blur-md shadow-sm">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </div>
        </div>
      </button>
    </div>
  );
}
