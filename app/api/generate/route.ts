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
    let ratioInstruction = 'Square (1:1) textile design. Physical scale: Canvas is 40cm x 40cm.';
    let scaleInstruction = 'BOLD & PROMINENT SCALE: Do NOT pack countless tiny miniature dots. Draw bold, large-scale graphic motifs with elegant negative space suitable for adult kimono fabric.';

    if (itemType === 'hanhaba') {
      imageSize = '1792x1024';
      ratioInstruction = 'Horizontal rectangular (16:9) textile design. Physical scale: Canvas HEIGHT is 18cm (Japanese Han-haba Obi).';
      scaleInstruction = 'CRITICAL SIZE: Individual motifs must be bold and prominent (approx 5cm to 8cm), fitting 2 motifs vertically within the 18cm height. Do NOT make them tiny or cluttered.';
    } else if (itemType === 'kimono') {
      imageSize = '1024x1792';
      ratioInstruction = 'Vertical rectangular (9:16) textile design. Physical scale: Canvas WIDTH is 40cm (Japanese Tanmono).';
      scaleInstruction = 'BOLD SCALE: Prominent, sophisticated medium-to-large scale motifs designed for adult tanmono cloth.';
    }

    // 2. モナリザ印刷専用の鉄則ベース指示
    const baseInstruction = "Flat overhead shot, perfectly seamless 2D textile pattern graphic design. Intended for Epson Monna Lisa high-end digital textile printing on silk. High resolution, crisp linework, vivid color separation, no halftone dots. ";

    // 3. 12大スタイルのプロンプト調合（すべて甘さを排した大人の佇まい）
    let stylePrompt = "";
    switch (aiStyle) {
      case 'mingei':
        // 01. 民藝と型染め
        stylePrompt = "Katazome stencil dye style, Keisuke Serizawa inspired, bold primitive silhouette, crisp resist-dye white edges, hand-crafted folk art aesthetic, simplified flat graphic motif, rich handmade texture.";
        break;
      case 'retro':
        // 02. 大正ロマン
        stylePrompt = "Taisho Roman aesthetic, Yumeji Takehisa inspired, Meisen silk weave print look, nostalgic retro chiyogami paper texture, lyrical and mature early 20th century Japanese graphic, poetic chic color harmony.";
        break;
      case 'kissaten':
        // 03. 純喫茶レトロ
        stylePrompt = "1970s Japanese retro kissaten cafe culture aesthetic, nostalgic graphic, vintage warm muted screen-print look, understated retro everyday motifs.";
        break;
      case 'nordic':
        // 04. 北欧モダン
        stylePrompt = "Scandinavian modern textile design, Marimekko inspired bold graphic, clean minimalist flat shapes, oversized simplified silhouette, striking geometric rhythm and chic contemporary feel.";
        break;
      case 'morris':
        // 05. 英国ボタニカル
        stylePrompt = "William Morris Arts and Crafts style, intricate botanical and floral ornamentation, flowing rhythmic foliage and vines, classical Victorian tapestry engraving texture, rich noble elegance.";
        break;
      case 'sarasa':
        // 06. エキゾチック更紗
        stylePrompt = "Traditional Sarasa textile pattern, Persian arabesque vine work, Javanese batik crackle texture, intricate exotic ornamentation, rich deep spice tones, detailed block-print heritage.";
        break;
      case 'classic':
        // 07. 騙し絵クラシック（フェイク・フォーマル）
        stylePrompt = "Trompe-l'œil Nishijin brocade weave illusion, faux golden metallic foil thread texture, antique court textile style, Yusoku pattern layout, opulent woven relief appearance printed completely flat.";
        break;
      case 'mode':
        // 08. モード＆ストリート
        stylePrompt = "Contemporary avant-garde street fashion textile, sharp Bauhaus inspired line-art, stark high contrast, urban minimal graphic, pop-art silkscreen look, bold rhythm and chic negative space.";
        break;
      case 'yuzen':
        // 09. はんなり友禅
        stylePrompt = "Refined Kyo-Yuzen kimono aesthetic, delicate outline brushwork, subtle watercolor bokashi gradation, graceful flowing composition, poetic and feminine soft Japanese traditional elegance.";
        break;
      case 'etching':
        // 10. アンティーク銅版画
        stylePrompt = "Vintage copperplate etching illustration, fine delicate crosshatch linework, antique natural history encyclopedia engraving aesthetic, intellectual and mystical curiosity cabinet vibe.";
        break;
      case 'silhouette':
        // 11. 切り絵影絵
        stylePrompt = "Kirie paper-cut silhouette art, shadow theater aesthetic, high contrast solid silhouettes against negative space, clean decorative cutout contours, sophisticated minimalist graphic.";
        break;
      case 'artdeco':
        // 12. アール・デコ
        stylePrompt = "1920s Art Deco luxury geometric ornament, stylized streamlined fan and chevron shapes, lavish symmetry, gilded geometric elegance, glamorous Gatsby-era decorative rhythm.";
        break;
      default:
        stylePrompt = "Katazome stencil dye style, bold primitive silhouette, hand-crafted folk art aesthetic.";
    }

    // 4. 配色の強制反映ロジック（地色と柄色の分離）
    let colorInstruction = `Color Palette: ${color}.`;
    if (color && color !== 'モチーフに準拠した配色' && color !== '自由配色') {
      colorInstruction = `STRICT COLOR HARMONY: The fabric must be composed strictly using the traditional Japanese colors: [${color}]. The primary ground color must cover the entire solid background, and motifs must be drawn using the secondary accent tone. OVERRIDE and IGNORE realistic colors of the motif (e.g. coffee, cat, flowers must adhere strictly to [${color}], NO natural brown or realistic animal coloring).`;
    }

    // 5. 柄の配置
    let layoutInstruction = "";
    if (density.includes('ワンポイント') || density.includes('お太鼓柄')) {
      layoutInstruction = "NON-SEAMLESS. A single, large, central striking one-point motif placed boldly in the middle of the solid background. Abundant solid negative space around the central element.";
    } else if (density.includes('飛び柄')) {
      layoutInstruction = "Scattered isolated motifs with generous empty negative space, refined balanced layout, well-spaced floating elements (Tobigara).";
    } else {
      layoutInstruction = "True omnidirectional toss pattern (shihō-gara). Motifs MUST be dynamically rotated at various angles (some upright, some 180° upside-down, 45°, 90°). NO uniform direction.";
    }

    // 6. 【最重要】ファンシー・カワイイ完全禁止＆大人の辛口指定
    const negativePrompt = `ABSOLUTELY NO cute, NO kawaii, NO sugary cartoonish elements, NO anime character aesthetic, NO childish pastel fluff, NO fancy toy-like illustrations.
NO humans, NO faces, NO body parts, NO clothing items being worn.
NO 3D perspective, NO fabric folds, NO wrinkles, NO realistic lighting/shadow effects, NO background scenes.
MUST BE mature, sharp, understated, sophisticated, edgy Japanese textile art for adult kimono.`;

    // プロンプト統合調合
    const prompt = `${baseInstruction}
${layoutInstruction}
${scaleInstruction}

【Art Style & Worldview】
${stylePrompt}

【Textile Requirements】
Motifs: ${motif}
${colorInstruction}
Format: ${ratioInstruction}

【Strict Restrictions & Negative Enforcements】
${negativePrompt}`;

    // 7. OpenAI 最新モデル呼び出し
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

    // 8. Vercel Blobへ安全に自動保存
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
