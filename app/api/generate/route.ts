import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { motif, color, density } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません。' }, { status: 500 });
    }

    const prompt = `フルカラーの日本の伝統的な着物の小紋柄テキスタイルデザイン。デジタル捺染印刷用の完全な平面2Dパターン、真上からのフラットな構図。
【最重要カラー指定】地色および全体の色調は必ず「${color || '鮮やかな和色'}」を基調に彩色すること。白黒の線画やモノクロは絶対不可。
【モチーフ】${motif || '伝統文様'}
【配置・密度】${density || 'バランスの取れた配置'}
鮮明なシームレス連続文様。人物、着物の立体写真、シワ、影は一切不可。`;

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || '画像生成に失敗しました。' }, { status: res.status });
    }

    return NextResponse.json({ imageUrl: data.data?.[0]?.url });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
