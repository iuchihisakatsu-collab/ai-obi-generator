import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // ==========================================
    // 1. リクエスト受信とパラメータ取得
    // ==========================================
    const { 
      motif, 
      basicPattern = 'none', 
      patternScale = 'medium', 
      colors = ['#ffffff', '#000000'], 
      density = '', 
      itemType 
    } = await req.json();

    // フリーワードモード時にモチーフが空の場合はエラー
    if (basicPattern === 'none' && !motif) {
      return NextResponse.json({ error: 'モチーフまたは柄を指定してください。' }, { status: 400 });
    }

    // ==========================================
    // 2. 出力サイズ（比率）とカラーの設定
    // ==========================================
    let imageSize: "1024x1024" | "1792x1024" | "1024x1792" = '1024x1024';
    let ratioInstruction = 'Square (1:1) textile design';

    if (itemType === 'hanhaba') {
      imageSize = '1792x1024';
      ratioInstruction = 'Horizontal rectangular (16:9) textile design';
    } else if (itemType === 'tanmono') {
      imageSize = '1024x1792';
      ratioInstruction = 'Vertical rectangular (9:16) textile design';
    }

    // 2色の割り当て（1色目を背景地色、2色目を柄色）
    const bgColor = colors[0] || '#ffffff';
    const fgColor = colors[1] || '#000000';

    let prompt = "";

    // ==========================================
    // 3. プロンプト生成ロジック
    // ==========================================

    // --- パターンA：ベーシック幾何学柄（2色・フラットベクター） ---
    if (basicPattern !== 'none') {
      // 1. 基本パターンの英語定義
      let patternName = "windowpane grid pattern, crossing straight lines";
      if (basicPattern === 'grid') patternName = "windowpane grid pattern, crossing straight lines";
      if (basicPattern === 'gingham') patternName = "checkerboard block gingham pattern";
      if (basicPattern === 'vertical') patternName = "vertical stripes pattern, parallel straight lines";
      if (basicPattern === 'horizontal') patternName = "horizontal stripes pattern, parallel straight lines";
      if (basicPattern === 'diagonal') patternName = "diagonal stripes pattern, parallel slanted lines";
      if (basicPattern === 'dots') patternName = "polka dots pattern, evenly spaced solid circles";

      // 2. スケール（大・中・小）による線幅・密度の指示
      let scaleInstruction = "Medium scale, standard lines and balanced proportions";
      if (patternScale === 'large') {
        scaleInstruction = "Large scale, macro pattern, bold thick lines, wide spacing";
      } else if (patternScale === 'small') {
        scaleInstruction = "Small scale, micro pattern, fine thin lines, tight dense spacing";
      }

      // 3. 創作を徹底排除するプロンプトの組み立て
      prompt = `Flat 2D vector graphic design. Perfectly seamless repeating ${patternName}.
${scaleInstruction}.
STRICT COLOR PALETTE: Strictly ONLY TWO COLORS. Solid background color is ${bgColor}. Solid foreground pattern color is ${fgColor}.
ABSOLUTELY NO gradients, NO 3D shading, NO drop shadows, NO textures, NO hand-drawn imperfections, NO fabric wrinkles. Pure flat geometric vector. Format: ${ratioInstruction}.`;

    } else {
      // --- パターンB：フリーワードモチーフ生成（既存ロジック・汎用化版） ---
      let baseInstruction = "Flat overhead shot, 2D textile graphic design. Intended for high-end digital textile printing. High resolution, crisp details, vivid color separation, no halftone dots. ";
      
      // 柄の密度による分岐（フロントエンドの文言ゆれに対応できるよう includes で判定）
      let layoutInstruction = "";
      if (density.includes('ワンポイント') || density.includes('お太鼓柄') || density === 'ワンポイント・パネル柄') {
        layoutInstruction = "NON-SEAMLESS. A single, large, central one-point motif illustration placed exactly in the middle of the solid background. This is a standalone picture, NOT a repeating pattern. Do NOT repeat the motif. Leave abundant solid negative space around the central element.";
      } else if (density.includes('四方柄') || density === '四方柄・散らし柄') {
        // ★ 四方柄の強化：モチーフの上下反転・多方向回転を強制し、全部上向きになる癖を排除
        baseInstruction += "Perfectly seamless repeating pattern. ";
        layoutInstruction = `True omnidirectional / non-directional toss pattern (shihō-gara). 
CRITICAL COMPOSITION RULE: Motifs MUST be randomly and dynamically rotated at various angles (some pointing upwards, some completely upside-down / inverted 180°, and others tilted 45°, 90°, or 135° in all four directions). 
ABSOLUTELY NO uniform upright orientation. The fabric pattern must look perfectly balanced, seamless, and natural when rotated upside down or viewed from any angle. Motifs are scattered and distributed evenly across the canvas.`;
      } else if (density.includes('総柄') || density === 'シームレス総柄') {
        baseInstruction += "Perfectly seamless repeating pattern. ";
        layoutInstruction = "Continuous all-over repeating pattern, densely packed motifs, rich and gorgeous layout with minimal negative space.";
      } else {
        // 余白あり（飛び柄）
        baseInstruction += "Perfectly seamless repeating pattern. ";
        layoutInstruction = "Scattered motifs with elegant negative space, refined balanced layout, well-spaced floating elements.";
      }

      // キーワードに応じたテイスト補正
      let tunedStyle = 'Masterpiece, highly detailed digital textile design. ';
      if (motif.includes('浮世絵')) tunedStyle += 'Ukiyo-e aesthetic, flat bold colors, precise ink outlines. ';
      if (motif.includes('水彩画')) tunedStyle += 'Soft pastel watercolor wash, delicate color blending, transparent and gentle texture. ';
      if (motif.includes('油絵')) tunedStyle += 'Thick impasto oil painting style, visible rich brushstrokes, expressive texture. ';
      if (motif.includes('アールヌーヴォー')) tunedStyle += 'Art Nouveau style, Alphonse Mucha aesthetic, elegant flowing curves, intricate floral ornaments. ';
      if (motif.includes('アールデコ')) tunedStyle += 'Art Deco style, geometric elegance, symmetrical balance, 1920s glamour. ';
      if (motif.includes('ミッドセンチュリー')) tunedStyle += 'Mid-century modern textile, organic abstract shapes, retro color palette. ';
      if (motif.includes('70sサイケ')) tunedStyle += '70s psychedelic pop art, vibrant contrasting colors, wavy hypnotic patterns. ';
      if (motif.includes('大正ロマン') || motif.includes('昭和レトロ')) tunedStyle += 'Retro vintage style, nostalgic crossover aesthetic. ';
      if (motif.includes('スチームパンク')) tunedStyle += 'Steampunk aesthetic, brass clockwork, gears and cogs, Victorian industrial fantasy. ';
      if (motif.includes('ゴスロリ')) tunedStyle += 'Gothic aesthetic, dark elegant fantasy, intricate black lace borders. ';
      if (motif.includes('ゆめかわいい')) tunedStyle += 'Dreamy kawaii style, pastel color palette, sparkling elements, soft fluffy texture. ';

      // 共通ネガティブプロンプト
      const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes. The image MUST consist ONLY of the requested motifs on the solid background color.";

      prompt = `${baseInstruction}\n${layoutInstruction}\n\n【Textile Requirements】\nMotifs: ${motif}\nBackground Color: Solid ${bgColor}\nAccent Color: ${fgColor}\nFormat: ${ratioInstruction}\n\n【Art Style & Texture】\n${tunedStyle}\n\n【Strict Restrictions】\n${negativePrompt}`;
    }

    // ==========================================
    // 4. OpenAI API による画像生成
    // ==========================================
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

    // ==========================================
    // 5. Vercel Blob への画像保存とURL返却
    // ==========================================
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
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
