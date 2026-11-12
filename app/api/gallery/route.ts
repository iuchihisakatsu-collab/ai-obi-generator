// app/api/gallery/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

// どんなデータ形式でも強制的に配列（リスト）に変換する安全装置
function toArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return [data];
}

export async function GET() {
  try {
    // 過去のデータがどちらの名前で保存されていても確実に救出するため、両方取得します
    const rawItems1 = await kv.get('gallery');
    const rawItems2 = await kv.get('gallery_items');
    
    // 強制的にリスト化
    const items1 = toArray(rawItems1);
    const items2 = toArray(rawItems2);
    
    // 両方のリストを合体させる
    let allItems = [...items1, ...items2];

    // さらに、個別キー (gallery:gal_xxx) で孤立して保存されたものを救出する
    try {
      const keys = await kv.keys('gallery:*');
      if (keys && keys.length > 0) {
        for (const k of keys) {
          const individualItem = await kv.get(k);
          if (individualItem) {
            allItems.push(individualItem);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch individual keys:', e);
    }

    // IDが空のものを弾き、重複を排除する（最強の安全対策）
    const uniqueItems = Array.from(
      new Map(allItems.filter(item => item && item.id).map(item => [item.id, item])).values()
    );
    
    // 日付の新しい順に並び替え
    const sortedItems = uniqueItems.sort((a: any, b: any) => {
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

    const newItem = {
      id: `gal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      title: title || '無題の小紋',
      author: author || '名無しさん',
      note: note || '',
      likes: 0,
      itemType: itemType || 'hanhaba',
      scale: scale || 'medium',
      density: density || '',
      createdAt: new Date().toISOString(),
    };

    // 保存先を統一するため、これまでのデータをすべて合体させる
    const existingItems1 = toArray(await kv.get('gallery'));
    const existingItems2 = toArray(await kv.get('gallery_items'));
    
    let mergedItems = [...existingItems1, ...existingItems2];
    const uniqueMerged = Array.from(
      new Map(mergedItems.filter(i => i && i.id).map(item => [item.id, item])).values()
    );
    
    // 先頭に新しい投稿を追加
    uniqueMerged.unshift(newItem);

    // 最大300件を保持
    const limitedItems = uniqueMerged.slice(0, 300);
    
    // 今後は 'gallery_items' というキー名に統一して保存
    await kv.set('gallery_items', limitedItems);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Gallery POST Error:', error);
    return NextResponse.json({ success: false, error: 'ギャラリーへの保存に失敗しました' }, { status: 500 });
  }
}
