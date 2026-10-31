// components/controls/ControlPanel.tsx （生成ボタン周りのUI部分のみ抜粋）

{/* ★ここから追加：3段構えの生成エンジン選択 ＆ プレミアムコード入力欄 */}
<div className="pt-6 border-t border-zinc-200 space-y-4">
  <label className="block text-xs font-bold text-zinc-900 tracking-wider">05. どのAIで描く？（生成エンジンの選択）</label>
  
  <div className="grid grid-cols-1 gap-2">
    {/* 1. FLUX (無料・アイデア出し用) */}
    <label className={`relative flex cursor-pointer rounded-sm border p-3 shadow-sm transition-all focus:outline-none ${selectedEngine === 'flux' ? 'border-zinc-900 bg-zinc-900 text-white ring-1 ring-zinc-900' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
      <input type="radio" name="engine" value="flux" className="sr-only" checked={selectedEngine === 'flux'} onChange={() => setSelectedEngine('flux')} />
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="text-sm font-black">【無料】アイデア出し用（FLUX）</div>
        </div>
        <div className="text-xs font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded">本日残り: 15回</div>
      </div>
    </label>

    {/* 2. OpenAI (無料お試し・1日1回) */}
    <label className={`relative flex cursor-pointer rounded-sm border p-3 shadow-sm transition-all focus:outline-none ${selectedEngine === 'openai_free' ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
      <input type="radio" name="engine" value="openai_free" className="sr-only" checked={selectedEngine === 'openai_free'} onChange={() => setSelectedEngine('openai_free')} />
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="text-sm font-black">【無料お試し】本気の1枚（最高品質）</div>
        </div>
        <div className="text-xs font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">本日残り: 1回</div>
      </div>
    </label>

    {/* 3. OpenAI (プレミアムチケット利用) */}
    <label className={`relative flex flex-col cursor-pointer rounded-sm border p-3 shadow-sm transition-all focus:outline-none ${selectedEngine === 'openai_premium' ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50'}`}>
      <div className="flex w-full items-center justify-between mb-2">
        <input type="radio" name="engine" value="openai_premium" className="sr-only" checked={selectedEngine === 'openai_premium'} onChange={() => setSelectedEngine('openai_premium')} />
        <div className="flex items-center">
          <div className="text-sm font-black">【チケット利用】究極のこだわり（最高品質）</div>
        </div>
        <div className="text-xs font-bold">50回分 (実物購入で全額還元)</div>
      </div>
      
      {/* コード入力欄（プレミアム選択時のみ展開） */}
      {selectedEngine === 'openai_premium' && (
        <div className="mt-2 animate-fade-in">
          <p className="text-[10px] mb-1.5 opacity-80">MakeShopで購入したプレミアムコードを入力してください</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="例: GFK-XXXX-YYYY" 
              value={premiumCode}
              onChange={(e) => setPremiumCode(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-indigo-900"
            />
            <button type="button" className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-sm hover:bg-indigo-700 transition-colors">
              確認
            </button>
          </div>
        </div>
      )}
    </label>
  </div>
</div>
{/* ★ここまで追加 */}

<div className="pt-6 border-t border-zinc-200 space-y-3">
  {/* 同意チェックと生成ボタン（既存のまま） */}
  <button 
    type="button" 
    onClick={handleGenerate} 
    disabled={loading} 
    className="..."
  >
    妄想した図案をつくる
  </button>
</div>
