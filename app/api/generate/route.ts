import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { motif, color, density } = await req.json();

    if (!motif || !color) {
      return NextResponse.json({ error: '意匠の情報が不足しています' }, { status: 400 });
    }

    // 密度指示の英語化
    const densityPrompt = density && density.includes('飛び柄')
      ? 'sparse repeating pattern with generous background spacing (tobigara style)'
      : 'dense seamless repeating textile pattern (sougara style)';

    // モナリザプリントの解像度と規格に合わせたプロンプト構築
    const prompt = `Flat overhead view, Japanese kimono obi textile design. ${densityPrompt}. Motif: ${motif}. Base color scheme: ${color}. Traditional Japanese elegance, balanced geometry, NO humans, NO faces, NO borders, NO 3D mockup, high-res for digital textile printing.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return NextResponse.json({ imageUrl: data.data[0].url });
    } else {
      console.error('OpenAI Error:', data);
      return NextResponse.json(
        { error: data.error?.message || '図案の生成に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'サーバー通信エラーが発生しました' }, { status: 500 });
  }
}
