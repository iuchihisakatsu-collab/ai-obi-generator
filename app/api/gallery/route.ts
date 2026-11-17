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
    const { imageUrl, title, author, authorSns, note, itemType, scale, density } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: '画像URLがありません' }, { status: 400 });
    }

    const rawAuthor = (author || '').trim();
    const sanitizedHandle = rawAuthor
      .replace(/^https?:\/\/(www\.)?(instagram\.com|twitter\.com|x\.com)\//i, '')
      .replace(/\/.*$/, '')
      .replace(/^@+/, '')
      .replace(/[^a-zA-Z0-9._]/g, '')
      .slice(0, 30);

    const normalizedAuthor = sanitizedHandle ? `@${sanitizedHandle}` : '名無しさん';
    const normalizedSns = sanitizedHandle
      ? (authorSns === 'x' ? 'x' : 'instagram')
      : '';

    const newEntry = {
      id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      title: title?.trim() || '無題',
      author: normalizedAuthor,
      authorSns: normalizedSns,
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

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { password, id, imageUrl } = body;

    if (password !== 'gofuku2026') {
      return NextResponse.json({ success: false, error: 'パスワードが違います' }, { status: 401 });
    }

    if (!id && !imageUrl) {
      return NextResponse.json({ success: false, error: '削除対象のIDが指定されていません' }, { status: 400 });
    }

    const rawItems = await kv.lrange('gallery_items', 0, -1);
    if (!rawItems || rawItems.length === 0) {
      return NextResponse.json({ success: true, deleted: false });
    }

    let removedCount = 0;
    const remainingSerialized: string[] = [];

    for (const raw of rawItems) {
      let parsed: any = null;
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = null;
        }
      } else if (raw && typeof raw === 'object') {
        parsed = raw;
      }

      const isTarget =
        parsed &&
        ((id && parsed.id === id) || (!id && imageUrl && parsed.imageUrl === imageUrl));

      if (isTarget) {
        removedCount += 1;
      } else {
        remainingSerialized.push(typeof raw === 'string' ? raw : JSON.stringify(raw));
      }
    }

    if (removedCount > 0) {
      await kv.del('gallery_items');
      if (remainingSerialized.length > 0) {
        await kv.rpush('gallery_items', ...remainingSerialized);
      }
    }

    return NextResponse.json({ success: true, deleted: removedCount > 0, removedCount });
  } catch (error) {
    console.error('Gallery DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'ギャラリー作品の削除に失敗しました' }, { status: 500 });
  }
}
