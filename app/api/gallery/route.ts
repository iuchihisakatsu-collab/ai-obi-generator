// app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ギャラリーの画像一覧をデータベースから取得する（データは消えていません）
    const items = await kv.get('gallery_items') || [];
    
    // 日付の新しい順に並び替えて返す
    const sortedItems = (items as any[]).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ success: true, items: sortedItems });
  } catch (error) {
    console.error('Gallery GET Error:', error);
    return NextResponse.json({ success: false, error: 'ギャラリーの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, title, author, note, itemType, scale, density } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: '画像URLがありません' }, { status: 400 });
    }

    const newItem = {
      id: `gal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      title: title || '無題の小紋',
      author: author || '名無しさん',
      note: note || '', // クリエイターのひとことを保存
      likes: 0, // いいねの初期値
      itemType: itemType || 'hanhaba',
      scale: scale || 'medium',
      density: density || '',
      createdAt: new Date().toISOString(),
    };

    // 既存のリストを取得して、先頭に新しいアイテムを追加
    const existingItems: any[] = (await kv.get('gallery_items')) || [];
    existingItems.unshift(newItem);

    // 最大300件（または任意の件数）を保持して保存
    const limitedItems = existingItems.slice(0, 300);
    await kv.set('gallery_items', limitedItems);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Gallery POST Error:', error);
    return NextResponse.json({ success: false, error: 'ギャラリーへの保存に失敗しました' }, { status: 500 });
  }
}
