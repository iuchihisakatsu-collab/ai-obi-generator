import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { motif, color, density, itemType } = await req.json();

    if (!motif || !color) {
      return NextResponse.json({ error: 'モチーフまたは地色が指定されていません。' }, { status: 400 });
    }

    let imageSize: "1024x1024" | "1792x1024" | "1024x1792" = '1024x1024';
    let ratioInstruction = '正方形のテキスタイルデザイン';
    if (itemType === 'hanhaba') {
      imageSize = '1792x1024';
      ratioInstruction = '横長（16:9比率）の帯用テキスタイルデザイン';
    } else if (itemType === 'tanmono') {
      imageSize = '1024x1792';
      ratioInstruction = '縦長（9:16比率）の反物・着尺用テキスタイルデザイン';
    }

// 基本指示（シームレスの記述を一旦外す）
    let baseInstruction = "Flat overhead shot, 2D textile graphic design. Intended for Epson Monna Lisa high-end digital textile printing on silk. High resolution, crisp details, vivid color separation, no halftone dots. ";
    
    // 柄の密度による条件分岐
    let layoutInstruction = "";
    if (density === 'お太鼓柄（ワンポイント/1枚絵）') {
      // ワンポイント用の特別な指示
      layoutInstruction = "NON-SEAMLESS. A single, large, central one-point motif illustration placed exactly in the middle of the solid background. This is a standalone picture (Otaiko style), NOT a repeating pattern. Do NOT repeat the motif. Leave abundant solid negative space around the central element.";
    } else if (density === '四方柄・散らし柄') {
      // ▼▼▼ 今回追加する箇所：四方柄・散らし柄用の指示 ▼▼▼
      baseInstruction += "Perfectly seamless repeating pattern. ";
      layoutInstruction = "Tossed pattern, scattered layout, non-directional, no clear top or bottom. Motifs are rotated and distributed evenly in all directions.";
    } else if (density === '総柄（ぎっしり華やか）') {
      // 総柄用の指示（シームレスを追加）
      baseInstruction += "Perfectly seamless repeating pattern. ";
      layoutInstruction = "Continuous all-over repeating pattern, densely packed motifs, rich and gorgeous layout with minimal negative space.";
    } else {
      // 飛び柄用の指示（シームレスを追加）
      baseInstruction += "Perfectly seamless repeating pattern. ";
      layoutInstruction = "Scattered motifs with elegant negative space, refined traditional Japanese layout, well-balanced floating elements.";
    }

    let tunedStyle = 'Masterpiece, highly detailed digital textile design. ';
    
    if (motif.includes('浮世絵')) tunedStyle += 'Ukiyo-e woodblock print aesthetic, flat bold colors, precise ink outlines, Edo period traditional art style. ';
    if (motif.includes('京友禅')) tunedStyle += 'Kyo-Yuzen dyeing style, delicate line art, elegant and refined motifs, soft gradation, subtle gold leaf accents. ';
    if (motif.includes('水彩画')) tunedStyle += 'Soft pastel watercolor wash, delicate color blending, transparent and gentle texture. ';
    if (motif.includes('油絵')) tunedStyle += 'Thick impasto oil painting style, visible rich brushstrokes, expressive texture, deep color saturation. ';
    if (motif.includes('アールヌーヴォー')) tunedStyle += 'Art Nouveau style, Alphonse Mucha aesthetic, elegant flowing curves, intricate floral ornaments. ';
    if (motif.includes('アールデコ')) tunedStyle += 'Art Deco style, geometric elegance, symmetrical balance, 1920s glamour, gold and black contrasts. ';
    if (motif.includes('ミッドセンチュリー')) tunedStyle += 'Mid-century modern textile, organic abstract shapes, retro color palette, minimal and stylish. ';
    if (motif.includes('70sサイケ')) tunedStyle += '70s psychedelic pop art, vibrant contrasting colors, wavy hypnotic patterns, retro groovy vibe. ';
    if (motif.includes('大正ロマン') || motif.includes('昭和レトロ')) tunedStyle += 'Taisho Roman retro style, nostalgic Japanese aesthetic, Takehisa Yumeji style, vintage modern crossover. ';
    if (motif.includes('スチームパンク')) tunedStyle += 'Steampunk aesthetic, brass clockwork, gears and cogs, Victorian industrial fantasy, metallic accents. ';
    if (motif.includes('ゴスロリ')) tunedStyle += 'Gothic Lolita aesthetic, dark elegant fantasy, intricate black lace borders, decadent beauty, mysterious mood. ';
    if (motif.includes('ゆめかわいい')) tunedStyle += 'Dreamy kawaii style, pastel color palette, magical girl aesthetic, sparkling stars, soft fluffy texture. ';

    const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes. The image MUST consist ONLY of the requested motifs on the solid background color.";

    const prompt = `${baseInstruction}\n${layoutInstruction}\n\n【Textile Requirements】\nMotifs: ${motif}\nBackground Color: Solid ${color}\nFormat: ${ratioInstruction}\n\n【Art Style & Texture】\n${tunedStyle}\n\n【Strict Restrictions】\n${negativePrompt}`;

    const response = await openai.images.generate({
      model: "gpt-image-2.5-sunburst", 
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: "high", 
      output_format: "png",
    });

    const base64Image = response.data?.[0]?.b64_json;
    if (!base64Image) throw new Error('画像データの取得に失敗しました。');

    const buffer = Buffer.from(base64Image, 'base64');
    const filename = `komon-${Date.now()}.png`;

    const blob = await put(filename, buffer, { 
      access: 'public', 
      contentType: 'image/png' 
    });

    return NextResponse.json({ 
      imageUrl: blob.url, 
      blobUrl: blob.url
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
