// app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // データベースが「List型（lpushで保存されたもの）」であることを前提に取得（lrangeを使用）
    const rawItems = await kv.lrange('gallery_items', 0, -1);
    
    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    // 中身が文字列（JSON）で入っている場合と、オブジェクトで入っている場合の両方に対応
    let items = rawItems.map((item: any) => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      }
      return item;
    }).filter(Boolean);

    // 日付の新しい順に並び替え
    const sortedItems = items.sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
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

    const newEntry = {
      id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      title: title?.trim() || '無題',
      author: author?.trim() || '名無しさん',
      note: note || '',
      likes: 0,
      itemType: itemType || '不明',
      scale: scale || 'medium',
      density: density || '不明',
      createdAt: new Date().toISOString()
    };

    // 以前と同じ「List型（lpush）」として正しく保存
    await kv.lpush('gallery_items', JSON.stringify(newEntry));
    
    // ギャラリーの保持上限を300件にする (古いものを自動削除)
    await kv.ltrim('gallery_items', 0, 300);

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error('Gallery POST Error:', error);
    return NextResponse.json({ success: false, error: 'ギャラリーへの保存に失敗しました' }, { status: 500 });
  }
}
