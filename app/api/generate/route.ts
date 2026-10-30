// app/api/generate/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { motif, color, density, itemType, aiStyle } = await req.json();

    if (!motif) {
      return NextResponse.json({ error: 'モチーフが入力されていません。' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
    }

    // 鉄則ルール：絶対にイラストや絵画にさせない。2Dのテキスタイルに限定する。
    const baseRules = "Flat 2D seamless textile pattern, repeat pattern for kimono fabric, top-down overhead shot. NO humans, NO faces, NO clothing mockups, NO 3D shading, NO perspective distortion. High-resolution vector-like printing plate for digital textile printing.";

    // 5つの世界観（スタイル）ごとの画風注入プロンプト
    let stylePrompt = "";
    switch (aiStyle) {
      case 'mingei':
        stylePrompt = "Katazome stencil dye style, Keisuke Serizawa inspired, bold silhouette, crisp resist-dye white edges, hand-crafted folk art aesthetic, simplified flat graphic motif.";
        break;
      case 'retro':
        stylePrompt = "Taisho Roman aesthetic, Meisen kimono silk weave print, nostalgic retro chiyogami paper texture, subtle lithograph bleeding effect, lyrical and romantic early 20th century Japanese graphic.";
        break;
      case 'mode':
        stylePrompt = "Contemporary geometric textile, sharp Bauhaus inspired line-art, stark contrast, urban minimal graphic, pop-art silkscreen look, bold rhythm and negative space.";
        break;
      case 'sarasa':
        stylePrompt = "Traditional Sarasa textile pattern, Persian arabesque vine work, Javanese batik crackle texture, intricate floral ornamentation, rich exotic block-print detailing.";
        break;
      case 'classic':
        stylePrompt = "Trompe-l'œil Nishijin brocade weave illusion, faux golden metallic foil thread texture, antique court textile style, Yusoku pattern layout, opulent woven relief appearance printed completely flat.";
        break;
      default:
        stylePrompt = "Katazome stencil dye style, bold silhouette, flat graphic.";
    }

    let densityPrompt = "";
    if (density === '四方柄（上下なし）') densityPrompt = "All-over repeating pattern, evenly distributed.";
    else if (density === '飛び柄（余白あり）') densityPrompt = "Scattered isolated motifs with elegant empty negative space.";
    else if (density === 'お太鼓柄（ワンポイント/1枚絵）') densityPrompt = "Single large striking placement motif in the center, bold composition.";

    // プロンプトを調合
    const prompt = `${baseRules} Style: ${stylePrompt} Motif: ${motif}. Colors: ${color}. Layout: ${densityPrompt}`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
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
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI Error:', errorData);
      return NextResponse.json({ error: '画像生成に失敗しました。' }, { status: response.status });
    }

    const data = await response.json();
    const base64Image = data.data[0].b64_json;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ imageUrl, blobUrl: imageUrl });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
