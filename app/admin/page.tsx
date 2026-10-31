// app/admin/page.tsx
'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [count, setCount] = useState(30);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCodes([]);
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, count })
      });
      const data = await res.json();
      
      if (data.error) {
        alert(data.error);
      } else {
        setCodes(data.codes);
      }
    } catch (err) {
      alert('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-black text-zinc-900 mb-6">プレミアムコード発行所（管理者専用）</h1>
        
        <div className="space-y-4 mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">合言葉（パスワード）</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="パスワードを入力"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">一度に発行する枚数（MakeShopの在庫追加分）</label>
            <input 
              type="number" 
              value={count} 
              onChange={e => setCount(Number(e.target.value))} 
              className="w-full p-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <button 
            onClick={handleGenerate} 
            disabled={loading} 
            className="w-full mt-4 bg-zinc-900 text-white px-4 py-3 font-bold rounded hover:bg-zinc-800 transition-colors"
          >
            {loading ? 'データベースに登録中...' : `${count}枚のプレミアムコード（50回用）を発行する`}
          </button>
        </div>

        {codes.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-indigo-700 mb-2">✅ 発行完了！以下のコードをMakeShopの在庫にコピペしてください</h2>
            <p className="text-xs text-zinc-500 mb-2">※すでにデータベース（Vercel KV）には「50回使えるコード」として登録済みです。</p>
            <textarea
              readOnly
              value={codes.join('\n')}
              className="w-full h-64 p-4 border border-indigo-300 bg-indigo-50 text-indigo-900 font-mono rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
