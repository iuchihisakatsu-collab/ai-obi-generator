'use client';

import { Dispatch, SetStateAction, MouseEvent } from 'react';
import { TRADITIONAL_COLORS } from '../../lib/constants';

interface ControlPanelProps {
  creationMode: 'ai' | 'geometric';
  setCreationMode: Dispatch<SetStateAction<'ai' | 'geometric'>>;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  setItemType: Dispatch<SetStateAction<'hanhaba' | 'kyobukuro' | 'kimono'>>;
  aiStyle: string;
  setAiStyle: Dispatch<SetStateAction<string>>;
  selectedArtist: string;
  setSelectedArtist: Dispatch<SetStateAction<string>>;
  motif: string;
  setMotif: Dispatch<SetStateAction<string>>;
  motif2: string;
  setMotif2: Dispatch<SetStateAction<string>>;
  selectedColors: typeof TRADITIONAL_COLORS;
  setSelectedColors: Dispatch<SetStateAction<typeof TRADITIONAL_COLORS>>;
  handleColorToggle: (col: typeof TRADITIONAL_COLORS[0]) => void;
  showColorPalette: boolean;
  setShowColorPalette: Dispatch<SetStateAction<boolean>>;
  density: string;
  setDensity: Dispatch<SetStateAction<string>>;
  geoPatternType: 'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker';
  setGeoPatternType: Dispatch<SetStateAction<'plain' | 'stripe' | 'dot' | 'grid' | 'gingham' | 'checker'>>;
  stripeDir: 'vertical' | 'horizontal' | 'diagonal';
  setStripeDir: Dispatch<SetStateAction<'vertical' | 'horizontal' | 'diagonal'>>;
  dotLayout: 'staggered' | 'grid';
  setDotLayout: Dispatch<SetStateAction<'staggered' | 'grid'>>;
  dotRadius: number;
  setDotRadius: Dispatch<SetStateAction<number>>;
  gapWidth: number;
  setGapWidth: Dispatch<SetStateAction<number>>;
  lineWidth: number;
  setLineWidth: Dispatch<SetStateAction<number>>;
  geoBgColor: string;
  setGeoBgColor: Dispatch<SetStateAction<string>>;
  geoPatternColor: string;
  setGeoPatternColor: Dispatch<SetStateAction<string>>;
  showGeoPaletteFor: 'bg' | 'pattern' | null;
  setShowGeoPaletteFor: Dispatch<SetStateAction<'bg' | 'pattern' | null>>;
  obiLiningColor: string;
  setObiLiningColor: Dispatch<SetStateAction<string>>;
  kimonoHaneriColor: string;
  setKimonoHaneriColor: Dispatch<SetStateAction<string>>;
  kimonoObiageColor: string;
  setKimonoObiageColor: Dispatch<SetStateAction<string>>;
  kimonoObiColor: string;
  setKimonoObiColor: Dispatch<SetStateAction<string>>;
  customObiUrl: string | null;
  setCustomObiUrl: Dispatch<SetStateAction<string | null>>;
  handleCustomObiUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  agreed: boolean;
  setAgreed: Dispatch<SetStateAction<boolean>>;
  errorMsg: string;
  loading: boolean;
  loadingEngine: 'flux' | 'openai' | null;
  remainingCount: number | null;
  loadingStep: number;
  handleGenerate: () => void;
  imageUrl: string;
  patternTitle: string;
  setPatternTitle: Dispatch<SetStateAction<string>>;
  serialNumber: string;
  handleDownloadOriginal: () => void;
  handleOrderClick: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function ControlPanel({
  // propsは `app/page.tsx` 側で制御するため、このコンポーネントは現状空のプレースホルダーとして機能させます。
  // （実際のUIは app/page.tsx 内に統合されています）
}: ControlPanelProps) {
  return (
    <div className="hidden">
      {/* 
        ★旧分離ファイルからの移行用ダミーコンポーネント★
        現在のUI制御はすべて app/page.tsx の中で完結しているため、
        このファイルで古い変数を呼び出してビルドエラーになるのを防ぐための空ファイルです。
      */}
    </div>
  );
}
