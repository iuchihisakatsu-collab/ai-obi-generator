// app/api/admin/codes/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const { password, count = 10 } = await req.json();

    // ★秘密の合言葉（お好きなものに変更可能です）
    if (password !== 'gofuku2026') {
      return NextResponse.json({ error: 'パスワードが違います' }, { status: 401 });
    }

    const codes = [];
    for (let i = 0; i < count; i++) {
      // 例: GFK-X7P9-K3M2 のようなランダムな文字列を生成
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `GFK-${part1}-${part2}`;

      // Vercel KVに「このコードは50回使える」というデータを登録
      await kv.set(`premium:${code}`, 50);
      codes.push(code);
    }

    return NextResponse.json({ codes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
