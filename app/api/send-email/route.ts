import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

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
    let ratioInstruction = '正方形のシームレス文様';
    if (itemType === 'hanhaba') {
      imageSize = '1792x1024';
      ratioInstruction = '横長（16:9比率）の帯用テキスタイル文様';
    } else if (itemType === 'tanmono') {
      imageSize = '1024x1792';
      ratioInstruction = '縦長（9:16比率）の反物・着尺用テキスタイル文様';
    }

    let baseInstruction = "Flat overhead shot, perfectly seamless 2D textile pattern graphic design. Intended for Epson Monna Lisa high-end digital textile printing on silk. High resolution, crisp details, vivid color separation, no halftone dots. ";
    let layoutInstruction = density === '総柄（ぎっしり華やか）'
      ? "Continuous all-over repeating pattern, densely packed motifs, rich and gorgeous layout with minimal negative space."
      : "Scattered motifs with elegant negative space, refined traditional Japanese layout, well-balanced floating elements.";
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

    const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes. The image MUST consist ONLY of the repeating pattern motifs on the solid background color.";

    const prompt = `${baseInstruction}\n${layoutInstruction}\n\n【Textile Requirements】\nMotifs: ${motif}\nBackground Color: Solid ${color}\nFormat: ${ratioInstruction}\n\n【Art Style & Texture】\n${tunedStyle}\n\n【Strict Restrictions】\n${negativePrompt}`;

    // ★ ChatGPTが教えてくれた正解のモデルとパラメータ
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

    // Blobに保存する
    const buffer = Buffer.from(base64Image, 'base64');
    const filename = `komon-${Date.now()}.png`;
    const blob = await put(filename, buffer, { 
      access: 'public', 
      contentType: 'image/png' 
    });

    // ★ 超重要ポイント：フロントには巨大なBase64を返さず、BlobのURLだけを返す（これでVercelの4.5MB制限を完全回避！）
    return NextResponse.json({ 
      imageUrl: blob.url, // 画面表示用にもBlob URLを使う
      blobUrl: blob.url
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
