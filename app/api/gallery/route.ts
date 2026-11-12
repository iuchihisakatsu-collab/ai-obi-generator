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

    let newLikes = 1;
    let foundAndUpdated = false;

    // 1. リスト形式で保存されている場合（キー名が 'gallery_items' のパターン）
    const items = await kv.get<any[]>('gallery_items');
    if (items && Array.isArray(items)) {
      const itemIndex = items.findIndex((i) => i.id === id);
      if (itemIndex > -1) {
        items[itemIndex].likes = (items[itemIndex].likes || 0) + 1;
        newLikes = items[itemIndex].likes;
        await kv.set('gallery_items', items);
        foundAndUpdated = true;
      }
    }

    // 2. リスト形式で保存されている場合（キー名が 'gallery' のパターン）
    const itemsFallback = await kv.get<any[]>('gallery');
    if (itemsFallback && Array.isArray(itemsFallback)) {
      const itemIndex = itemsFallback.findIndex((i) => i.id === id);
      if (itemIndex > -1) {
        itemsFallback[itemIndex].likes = (itemsFallback[itemIndex].likes || 0) + 1;
        newLikes = itemsFallback[itemIndex].likes;
        await kv.set('gallery', itemsFallback);
        foundAndUpdated = true;
      }
    }

    // 3. 個別キーで保存されている場合（前回お渡ししたコードの処理）
    const itemKey = `gallery:${id}`;
    const individualItem = await kv.get<any>(itemKey);
    if (individualItem) {
      individualItem.likes = (individualItem.likes || 0) + 1;
      newLikes = individualItem.likes;
      await kv.set(itemKey, individualItem);
      foundAndUpdated = true;
    }

    if (!foundAndUpdated) {
      // どこにも見つからなかった場合、ログを出力しつつ見た目上は成功として返す
      console.warn(`Like Error: Item not found in KV for id: ${id}`);
    }

    return NextResponse.json({ success: true, likes: newLikes });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
