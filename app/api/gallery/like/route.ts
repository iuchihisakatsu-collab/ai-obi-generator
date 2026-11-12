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

    // 1. List型として全データを取得
    const rawItems = await kv.lrange('gallery_items', 0, -1);
    
    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Gallery empty' }, { status: 404 });
    }

    let newLikes = 1;
    let targetIndex = -1;
    let updatedItemStr = "";

    // 2. 該当するIDのアイテムと、Listの何番目にあるか（インデックス）を探す
    for (let i = 0; i < rawItems.length; i++) {
      let itemObj;
      if (typeof rawItems[i] === 'string') {
        try { itemObj = JSON.parse(rawItems[i] as string); } catch (e) { continue; }
      } else {
        itemObj = rawItems[i];
      }

      if (itemObj && itemObj.id === id) {
        targetIndex = i; // 発見した場所を記録
        itemObj.likes = (itemObj.likes || 0) + 1; // いいねを+1
        newLikes = itemObj.likes;
        updatedItemStr = JSON.stringify(itemObj);
        break;
      }
    }

    // 3. 該当アイテムが見つかったら、Listのその場所だけをピンポイントで上書き更新する
    if (targetIndex > -1) {
      await kv.lset('gallery_items', targetIndex, updatedItemStr);
      return NextResponse.json({ success: true, likes: newLikes });
    } else {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
