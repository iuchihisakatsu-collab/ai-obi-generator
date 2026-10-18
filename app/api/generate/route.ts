import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { motif, color, density } = await req.json();

    const apiKey = process.env.STABILITY_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。' },
        { status: 500 }
      );
    }

    // デジタル捺染向けの着物・小紋文様プロンプト
    const prompt = `A flat 2D Japanese kimono pattern, traditional Komon fabric design, seamless repeating vector motif. Background color: ${color}. Motif elements: ${motif}. Arrangement: ${density}. Top-down view, crisp lines, clean colors, high resolution textile art, NO humans, NO kimono mockup, perfectly flat graphic.`;

    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [
            { text: prompt, weight: 1 },
            { text: 'human, face, 3d model, mockup, realistic photo, shadows, folds, blurry', weight: -1 },
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || '画像生成に失敗しました。' },
        { status: response.status }
      );
    }

    // Stability AIはBase64形式で画像を返却
    const base64Image = data.artifacts?.[0]?.base64;
    if (!base64Image) {
      return NextResponse.json(
        { error: '画像データの取得に失敗しました。' },
        { status: 500 }
      );
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || '通信エラーが発生しました。' },
      { status: 500 }
    );
  }
}
