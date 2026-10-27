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
      basicPattern = 'none', 
      patternScale = 'medium', 
      colors = ['#ffffff', '#000000'], 
      density = '', 
      itemType 
    } = await req.json();

    if (basicPattern === 'none' && !motif) {
      return NextResponse.json({ error: 'モチーフまたは柄を指定してください。' }, { status: 400 });
    }

    let imageSize: "1024x1024" | "1792x1024" | "1024x1792" = '1024x1024';
    let ratioInstruction = 'Square (1:1) textile design. Physical scale: Canvas is exactly 40cm x 40cm.';
    let scaleInstruction = 'CRITICAL SCALE: Motifs MUST be drawn LARGE and BOLD. Each single motif should occupy about 20% to 30% of the canvas. DO NOT draw tiny micro-patterns.';

    if (itemType === 'hanhaba') {
      imageSize = '1792x1024';
      ratioInstruction = 'Horizontal rectangular (16:9) textile design. Physical scale: Canvas HEIGHT is exactly 18cm (Japanese Han-haba Obi).';
      // ★ cm指定を廃止し、キャンバスに対する相対比率（20-30%）で大きく描画させる
      scaleInstruction = 'CRITICAL SCALE: Motifs MUST be drawn LARGE and BOLD. Each single motif should occupy about 20% to 30% of the total canvas HEIGHT. Ensure a spacious layout where only 2 to 3 motifs fit vertically. DO NOT draw tiny micro-patterns.';
    } else if (itemType === 'tanmono') {
      imageSize = '1024x1792';
      ratioInstruction = 'Vertical rectangular (9:16) textile design. Physical scale: Canvas WIDTH is exactly 40cm (Japanese Tanmono).';
      scaleInstruction = 'CRITICAL SCALE: Motifs MUST be drawn LARGE and BOLD. Each single motif should occupy about 20% to 30% of the total canvas WIDTH. DO NOT draw tiny micro-patterns.';
    }

    const bgColor = colors[0] || '#ffffff';
    const fgColor = colors[1] || '#000000';

    let prompt = "";

    if (basicPattern !== 'none') {
      let patternName = "windowpane grid pattern, crossing straight lines";
      if (basicPattern === 'grid') patternName = "windowpane grid pattern, crossing straight lines";
      if (basicPattern === 'gingham') patternName = "checkerboard block gingham pattern";
      if (basicPattern === 'vertical') patternName = "vertical stripes pattern, parallel straight lines";
      if (basicPattern === 'horizontal') patternName = "horizontal stripes pattern, parallel straight lines";
      if (basicPattern === 'diagonal') patternName = "diagonal stripes pattern, parallel slanted lines";
      if (basicPattern === 'dots') patternName = "polka dots pattern, evenly spaced solid circles";

      let geomScale = "Medium scale, standard lines and balanced proportions";
      if (patternScale === 'large') geomScale = "Large scale, macro pattern, bold thick lines, wide spacing";
      else if (patternScale === 'small') geomScale = "Small scale, micro pattern, fine thin lines, tight dense spacing";

      prompt = `Flat 2D vector graphic design. Perfectly seamless repeating ${patternName}.
${geomScale}.
STRICT COLOR PALETTE: Strictly ONLY TWO COLORS. Solid background color is ${bgColor}. Solid foreground pattern color is ${fgColor}.
ABSOLUTELY NO gradients, NO 3D shading, NO drop shadows, NO textures. Pure flat geometric vector. Format: ${ratioInstruction}.`;

    } else {
      let baseInstruction = "Flat overhead shot, 2D textile graphic design. Intended for high-end digital textile printing. High resolution, crisp details, vivid color separation, no halftone dots. ";
      
      let layoutInstruction = "";
      if (density.includes('ワンポイント') || density.includes('お太鼓柄')) {
        layoutInstruction = "NON-SEAMLESS. A single, large, central one-point motif illustration placed exactly in the middle of the solid background. Leave abundant solid negative space around the central element.";
      } else if (density.includes('四方柄')) {
        baseInstruction += "Perfectly seamless repeating pattern. ";
        layoutInstruction = `True omnidirectional / non-directional toss pattern (shihō-gara). 
Motifs MUST be randomly and dynamically rotated at various angles (some pointing upwards, some upside-down 180°, tilted 45°, 90°, etc.). ABSOLUTELY NO uniform upright orientation.`;
      } else {
        baseInstruction += "Perfectly seamless repeating pattern. ";
        layoutInstruction = "Scattered motifs with elegant negative space, refined balanced layout, well-spaced floating elements (Tobigara).";
      }

      let tunedStyle = 'Masterpiece, highly detailed digital textile design. ';
      if (motif.includes('浮世絵')) tunedStyle += 'Ukiyo-e aesthetic, flat bold colors. ';
      if (motif.includes('水彩画')) tunedStyle += 'Soft pastel watercolor wash. ';
      if (motif.includes('油絵')) tunedStyle += 'Thick impasto oil painting style. ';
      if (motif.includes('ミッドセンチュリー')) tunedStyle += 'Mid-century modern textile. ';
      if (motif.includes('大正ロマン') || motif.includes('昭和レトロ')) tunedStyle += 'Retro vintage style. ';
      if (motif.includes('ゆめかわいい')) tunedStyle += 'Dreamy kawaii style, pastel color palette. ';

      const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes.";

      prompt = `${baseInstruction}
${layoutInstruction}
${scaleInstruction}

【Textile Requirements】
Motifs: ${motif}
Background Color: Solid ${bgColor}
Accent Color: ${fgColor}
Format: ${ratioInstruction}

【Art Style & Texture】
${tunedStyle}

【Strict Restrictions】
${negativePrompt}`;
    }

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
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
