// app/api/gallery/like/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // KVで保存している特定のギャラリーアイテムのいいね数を+1する
    const itemKey = `gallery:${id}`;
    const item = await kv.get<any>(itemKey);
    
    if (item) {
      item.likes = (item.likes || 0) + 1;
      await kv.set(itemKey, item);
    }

    return NextResponse.json({ success: true, likes: item?.likes || 1 });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
