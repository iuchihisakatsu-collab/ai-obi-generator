{/* クリエイターのひとこと（Quoteスタイル） */}
              {selectedItem.note && (
                <div className="mb-10 relative">
                  <span className="absolute -top-4 -left-3 text-4xl text-zinc-200 font-serif leading-none select-none">"</span>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium relative z-10 pl-2 border-l-2 border-zinc-200">
                    {selectedItem.note}
                  </p>
                </div>
              )}

              {/* ▼▼▼ ここから下の <div> ブロックを丸ごと削除（または非表示） ▼▼▼ */}
              <div className="space-y-4 mb-10 w-full">
                <div className="p-4 bg-zinc-50 border border-zinc-100 relative">
                  <p className="text-[9px] font-bold tracking-widest text-zinc-900 uppercase mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full"></span>
                    GOFUKUYASAN OFFICIAL
                  </p>
                  <p className="text-[11px] text-zinc-600 leading-relaxed font-light">
                    素晴らしい図案ですね。アーカイブへのご登録ありがとうございます。
                  </p>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a comment..." disabled className="flex-1 text-[10px] bg-white border-b border-zinc-200 py-2 focus:outline-none focus:border-zinc-900 transition-colors" />
                  <button disabled className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">POST</button>
                </div>
              </div>
              {/* ▲▲▲ ここまで削除 ▲▲▲ */}
