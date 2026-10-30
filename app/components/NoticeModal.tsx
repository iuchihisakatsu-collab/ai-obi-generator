// components/NoticeModal.tsx
'use client';
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react';
import { CURRENT_NOTICE } from '../lib/noticeConfig';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToGeometric: () => void;
}

export default function NoticeModal({ isOpen, onClose, onGoToGeometric }: NoticeModalProps) {
  if (!isOpen || !CURRENT_NOTICE.enabled) return null;

  const handleAction = (action: 'close' | 'geometric' | 'link', url?: string) => {
    if (action === 'geometric') {
      onGoToGeometric();
    } else if (action === 'link' && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border-2 border-zinc-950 max-w-lg w-full p-6 sm:p-8 shadow-2xl rounded-xs space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-zinc-200 pb-3">
          <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase block mb-1">
            {CURRENT_NOTICE.category}
          </span>
          <h3 className="text-base sm:text-lg font-black text-zinc-950 leading-tight">
            {CURRENT_NOTICE.title}
          </h3>
        </div>

        {CURRENT_NOTICE.imageUrl && (
          <div className="w-full overflow-hidden border border-zinc-200 rounded-xs">
            <img 
              src={CURRENT_NOTICE.imageUrl} 
              alt="" 
              className="w-full h-auto max-h-[220px] object-cover"
            />
          </div>
        )}

        <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-zinc-700">
          {CURRENT_NOTICE.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}

          {CURRENT_NOTICE.highlightBox && CURRENT_NOTICE.highlightBox.length > 0 && (
            <div className="p-3 bg-zinc-100 border-l-4 border-zinc-950 font-bold text-zinc-900 space-y-1 my-2">
              {CURRENT_NOTICE.highlightBox.map((line, idx) => (
                <p key={idx}>・{line}</p>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-100 space-y-2">
          {CURRENT_NOTICE.secondaryButton && (
            <button
              type="button"
              onClick={() => handleAction(CURRENT_NOTICE.secondaryButton!.action, CURRENT_NOTICE.secondaryButton!.url)}
              className="w-full py-3 bg-white hover:bg-zinc-100 text-zinc-950 border-2 border-zinc-950 text-xs font-black tracking-wider transition-colors rounded-xs shadow-sm"
            >
              {CURRENT_NOTICE.secondaryButton.label}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleAction(CURRENT_NOTICE.primaryButton.action, CURRENT_NOTICE.primaryButton.url)}
            className="w-full py-3 bg-zinc-950 hover:bg-black text-white text-xs font-black tracking-wider transition-colors rounded-xs shadow-sm"
          >
            {CURRENT_NOTICE.primaryButton.label}
          </button>
        </div>
      </div>
    </div>
  );
}
