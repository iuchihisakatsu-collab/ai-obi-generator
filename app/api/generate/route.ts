// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { 
      motif, 
      color = 'モチーフに準拠した配色', 
      density = '', 
      itemType, 
      aiStyle = 'mingei' 
    } = await req.json();

    if (!motif) {
      return NextResponse.json({ error: 'モチーフが入力されていません。' }, { status: 400 });
    }

    // 1. アイテムに応じたアスペクト比と物理スケールの定義
    let imageSize: "1024x1024" | "1792x1024" | "1024x1792" = '1024x1024';
    let ratioInstruction = 'Square (1:1) textile design. Physical scale: Canvas is exactly 40cm x 40cm.';
    let scaleInstruction = 'Motifs should be appropriately scaled for a 40cm wide fabric.';

    if (itemType === 'hanhaba') {
      imageSize = '1792x1024';
      ratioInstruction = 'Horizontal rectangular (16:9) textile design. Physical scale: Canvas HEIGHT is exactly 18cm (Japanese Han-haba Obi).';
      scaleInstruction = 'CRITICAL SIZE: Since the canvas height is 18cm, individual motifs MUST be scaled to about 3cm to 5cm. 2 to 3 motifs should fit vertically within the 18cm height. Do NOT make motifs too huge.';
    } else if (itemType === 'kimono') {
      imageSize = '1024x1792';
      ratioInstruction = 'Vertical rectangular (9:16) textile design. Physical scale: Canvas WIDTH is exactly 40cm (Japanese Tanmono).';
      scaleInstruction = 'Motifs should be appropriately scaled for a 40cm wide fabric, ensuring a balanced repeat.';
    }

    // 2. モナリザ印刷専用の鉄則ベース指示
    const baseInstruction = "Flat overhead shot, perfectly seamless 2D textile pattern graphic design. Intended for Epson Monna Lisa high-end digital textile printing on silk. High resolution, crisp details, vivid color separation, no halftone dots. ";

    // 3. 5つの世界観（スタイル）の注入プロンプト
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
        stylePrompt = "Katazome stencil dye style, Keisuke Serizawa inspired, bold silhouette, hand-crafted folk art aesthetic.";
    }

    // 4. 柄の配置（四方柄 / 飛び柄 / お太鼓柄）
    let layoutInstruction = "";
    if (density.includes('ワンポイント') || density.includes('お太鼓柄')) {
      layoutInstruction = "NON-SEAMLESS. A single, large, central one-point motif illustration placed exactly in the middle of the solid background. Leave abundant solid negative space around the central element.";
    } else if (density.includes('飛び柄')) {
      layoutInstruction = "Scattered motifs with elegant negative space, refined balanced layout, well-spaced floating elements (Tobigara).";
    } else {
      // 四方柄（上下なし）
      layoutInstruction = "True omnidirectional / non-directional toss pattern (shihō-gara). Motifs MUST be randomly and dynamically rotated at various angles (some pointing upwards, some upside-down 180°, tilted 45°, 90°, etc.). ABSOLUTELY NO uniform upright orientation.";
    }

    // 5. 人間や服の誤描画を完全シャットアウトする禁止事項
    const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes.";

    // プロンプトの統合調合
    const prompt = `${baseInstruction}
${layoutInstruction}
${scaleInstruction}

【Art Style】
${stylePrompt}

【Textile Requirements】
Motifs: ${motif}
Color Palette: ${color}
Format: ${ratioInstruction}

【Strict Restrictions】
${negativePrompt}`;

    // 6. OpenAI 最新モデル呼び出し
    const response = await openai.images.generate({
      model: "gpt-image-2.5-sunburst",
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: "high",
      output_format: "png",
    });

    const base64Image = response.data?.[0]?.b64_json;
    if (!base64Image) {
      throw new Error('画像データの取得に失敗しました。');
    }

    // 7. Vercel Blobへ安全に自動保存
    const buffer = Buffer.from(base64Image, 'base64');
    const filename = `textile-${Date.now()}.png`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png'
    });

    return NextResponse.json({
      imageUrl: blob.url,
      blobUrl: blob.url
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || '画像生成に失敗しました。' }, { status: 500 });
  }
}
