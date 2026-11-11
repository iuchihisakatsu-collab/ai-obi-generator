// app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { imageUrl, title, author, itemType, scale, density } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: '画像URLが必要です' }, { status: 400 });
    }

    const newEntry = {
      id: `gallery_${Date.now()}`,
      imageUrl,
      title: title?.trim() || '無題',
      author: author?.trim() || '名無しさん',
      itemType: itemType || '不明',
      scale: scale || 'medium',
      density: density || '不明',
      createdAt: new Date().toISOString()
    };

    // Vercel KV の List (gallery_items) に先頭追加
    await kv.lpush('gallery_items', JSON.stringify(newEntry));

    // ギャラリーの保存上限を100件に制限する（古いものを自動削除）
    await kv.ltrim('gallery_items', 0, 99);

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error: any) {
    console.error('Gallery Save Error:', error);
    return NextResponse.json({ error: 'ギャラリーへの保存に失敗しました' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Vercel KV から最大100件取得
    const items = await kv.lrange('gallery_items', 0, 99);
    
    // JSON文字列として保存されている場合はオブジェクトにパース
    const parsedItems = items.map(item => typeof item === 'string' ? JSON.parse(item) : item);

    return NextResponse.json({ success: true, items: parsedItems });
  } catch (error: any) {
    console.error('Gallery Fetch Error:', error);
    return NextResponse.json({ error: 'ギャラリーの取得に失敗しました' }, { status: 500 });
  }
}
