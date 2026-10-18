import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { motif, color, density } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません。' },
        { status: 500 }
      );
    }

    // デジタル捺染（モナリザ）に最適化した小紋柄のプロンプト
    const prompt = `A flat overhead 2D Japanese textile pattern, traditional Komon kimono fabric design. Seamless repeating pattern, high resolution, top-down view, vector art style. Background base color: ${color}. Main motif elements: ${motif}. Pattern arrangement: ${density}. Clean details, elegant traditional aesthetic, NO human, NO model, NO 3D rendering.`;

    // OpenAI公式画像生成エンドポイント（dall-e-3）
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
      return NextResponse.json(
        { error: data?.error?.message || '画像生成に失敗しました。' },
        { status: res.status }
      );
    }

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: '画像の生成に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '通信エラーが発生しました。' },
      { status: 500 }
    );
  }
}
