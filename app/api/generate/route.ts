import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { motif, color, density, itemType } = await req.json();

    if (!motif || !color) {
      return NextResponse.json({ error: 'モチーフまたは地色が指定されていません。' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'APIキーが設定されていません。' }, { status: 500 });
    }

    // アイテム（比率）に応じたサイズと指示の切り替え
    let imageSize = '1024x1024';
    let ratioInstruction = '正方形のシームレス文様';
    if (itemType === 'hanhaba') {
      imageSize = '1792x1024'; // 横長（半幅帯用）
      ratioInstruction = '横長（16:9比率）の帯用テキスタイル文様';
    } else if (itemType === 'tanmono') {
      imageSize = '1024x1792'; // 縦長（反物・京袋帯用）
      ratioInstruction = '縦長（9:16比率）の反物・着尺用テキスタイル文様';
    }

    const prompt = `日本の伝統的な小紋・着尺の図案テキスタイルデザイン。
【モチーフ】${motif}
【地色】${color}
【配置・密度】${density || 'バランスの取れた配置'}
【形状・構図】${ratioInstruction}
鮮明なシームレス連続文様。人物、着物の立体写真、シワ、影は一切不可。フラットな2D図案のみ。`;

    // 本来使用している正規モデル gpt-image-2.5-sunburst
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2.5-sunburst',
        prompt: prompt,
        n: 1,
        size: imageSize,
        quality: 'high',
        output_format: 'png',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || '画像生成に失敗しました。' },
        { status: res.status }
      );
    }

    const base64Image = data.data?.[0]?.b64_json;
    if (!base64Image) {
      if (data.data?.[0]?.url) {
        return NextResponse.json({ imageUrl: data.data[0].url });
      }
      return NextResponse.json({ error: '画像データの取得に失敗しました。' }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
