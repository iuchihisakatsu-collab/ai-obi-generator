// app/components/NoticeModal.tsx
'use client';

import { CURRENT_NOTICE } from '../lib/noticeConfig';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToGeometric: () => void;
}

export default function NoticeModal({ isOpen, onClose, onGoToGeometric }: NoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-3 border-b border-zinc-100 bg-zinc-50">
          <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{CURRENT_NOTICE.category}</span>
          <button onClick={onClose} className="p-1 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-zinc-900 transition-colors">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="space-y-2 text-center">
            {CURRENT_NOTICE.badge && (
              <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[9px] font-black tracking-widest rounded-sm mb-1">{CURRENT_NOTICE.badge}</span>
            )}
            <h2 className="text-lg font-black text-zinc-900 leading-tight">{CURRENT_NOTICE.title}</h2>
            <p className="text-[11px] font-bold text-zinc-500">{CURRENT_NOTICE.subtitle}</p>
          </div>

          {CURRENT_NOTICE.imageUrl && (
            <div className="w-full overflow-hidden border border-zinc-200 rounded-sm">
              <img src={CURRENT_NOTICE.imageUrl} alt="キャンペーン" className="w-full h-auto object-cover" />
            </div>
          )}

          <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-zinc-700">
            {CURRENT_NOTICE.body.map((paragraph, index) => (
              <p key={index}>{paragraph === '' ? <br/> : paragraph}</p>
            ))}
          </div>

          {CURRENT_NOTICE.highlightBox && CURRENT_NOTICE.highlightBox.length > 0 && (
            <div className="p-3 bg-zinc-100 border-l-4 border-zinc-950 font-bold text-zinc-900 space-y-1 my-2 text-[11px] sm:text-xs">
              {CURRENT_NOTICE.highlightBox.map((line, idx) => (
                <p key={idx}>{line === '' ? <br/> : line}</p>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex flex-col gap-2">
          <button onClick={onClose} className="w-full py-3 bg-zinc-950 text-white text-xs font-black tracking-widest rounded-sm hover:bg-zinc-800 transition-colors shadow-sm">
            {CURRENT_NOTICE.ctaText}
          </button>
          <button onClick={onGoToGeometric} className="w-full py-2.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
            今回は格子・水玉製作所を使う
          </button>
        </div>
      </div>
    </div>
  );
}
