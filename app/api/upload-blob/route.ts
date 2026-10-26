import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const { base64Data, filename } = await req.json();

    if (!base64Data) {
      return NextResponse.json({ error: 'データが見つかりません' }, { status: 400 });
    }

    // Base64からバイナリデータへ復元
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const targetFilename = filename || `geo-${Date.now()}.png`;

    // Vercel Blobへアップロード（公開設定）
    const blob = await put(targetFilename, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return NextResponse.json({ error: error?.message || '画像のアップロードに失敗しました' }, { status: 500 });
  }
}
