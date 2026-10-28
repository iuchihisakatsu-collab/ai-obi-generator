import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { base64Data, filename } = await req.json();

    if (!base64Data) {
      return NextResponse.json({ error: '画像データが空です。' }, { status: 400 });
    }

    // ① シリアル番号が空、または ".png" だけの場合は自動で安全な名前を生成
    let safeFilename = filename;
    if (!safeFilename || safeFilename.trim() === '' || safeFilename === '.png' || safeFilename.startsWith('-')) {
      safeFilename = `GEO-${Math.floor(1000 + Math.random() * 9000)}.png`;
    }

    // ② Base64文字列をバイナリ（Buffer）に変換（※ここが抜けていたため15バイトの[object Object]になっていました）
    let buffer: Buffer;
    if (base64Data.startsWith('data:image/svg+xml')) {
      const svgText = decodeURIComponent(base64Data.replace(/^data:image\/svg\+xml;utf8,/, ''));
      buffer = Buffer.from(svgText, 'utf-8');
      safeFilename = safeFilename.replace(/\.png$/, '.svg');
    } else {
      const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');
    }

    // ③ Vercel Blobへ実画像バイナリとして保存
    const blob = await put(safeFilename, buffer, {
      access: 'public',
      contentType: safeFilename.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ error: error?.message || 'アップロード失敗' }, { status: 500 });
  }
}
