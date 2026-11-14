// app/components/controls/ControlPanel.tsx
'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: (mode: 'ai' | 'geometric') => void;
  // ★ ここに 'tote' を追加しました
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf' | 'tote';
  setItemType: (type: 'hanhaba' | 'kyobukuro' | 'kimono' | 'scarf' | 'tote') => void;
  
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
  
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: (colors: typeof TRADITIONAL_COLORS) => void;
  handleColorToggle: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: (val: boolean) => void;
  density: string;
  setDensity: (val: string) => void;
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: (val: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker') => void;
  stripeDir: 'vertical' | 'horizontal' | 'diagonal';
  setStripeDir: (val: 'vertical' | 'horizontal' | 'diagonal') => void;
  dotLayout: 'staggered' | 'grid';
  setDotLayout: (val: 'staggered' | 'grid') => void;
  dotRadius: number;
  setDotRadius: (val: number) => void;
  gapWidth: number;
  setGapWidth: (val: number) => void;
  lineWidth: number;
  setLineWidth: (val: number) => void;
  geoBgColor: string;
  setGeoBgColor: (val: string) => void;
  geoPatternColor: string;
  setGeoPatternColor: (val: string) => void;
  showGeoPaletteFor: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor: (val: 'bg' | 'pattern' | null) => void;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  errorMsg: string;
  loading: boolean;
  loadingEngine?: 'flux' | 'openai' | null;
  generatingMode?: 'flux' | 'openai_free' | 'openai_premium' | null;
  remainingCount?: number;
  remainingFlux?: number;
  remainingOpenAI?: number;
  ticketRemaining?: number | null;
  loadingStep: number;
  handleGenerate: (engineType: 'flux' | 'openai_free' | 'openai_premium') => void;
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: (val: string) => void;
  serialNumber: string;
  handleDownloadOriginal: () => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  premiumCode: string;
  setPremiumCode: (val: string) => void;
  premiumStatusMsg: string;
  
  onOpenPolicy: () => void;
}

// （中略：長いので上記と同じ内容です。既存のControlPanel.tsxの型定義部分に 'tote' を追加するだけで大丈夫です）
