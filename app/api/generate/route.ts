// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { motif, color, density, itemType, aiStyle, engine } = await req.json();

    // 1. プロンプト生成（OpenAIキーがあれば翻訳、なければ自動テンプレートでフォールバック）
    const openAiKey = process.env.OPENAI_API_KEY;
    let englishPrompt = `${motif}, traditional Japanese kimono pattern, color scheme: ${color}, density: ${density}, style: ${aiStyle}, perfectly seamless 2D textile pattern, flat overhead shot, high resolution, crisp details, NO humans, NO faces, NO clothing`;

    if (openAiKey) {
      try {
        const systemPrompt = `You are a professional textile designer. Translate the user's Japanese design idea into a clear English prompt for an AI image generator.
The output must be a 2D textile pattern graphic design for digital silk printing.
Rule: NO humans, NO faces, NO clothing.

User's motif: ${motif}
Color: ${color}
Density: ${density}
Style: ${aiStyle}

Output ONLY the English prompt.`;

        const translateRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.7,
          }),
        });

        const translateData = await translateRes.json();
        if (translateData?.choices?.[0]?.message?.content) {
          englishPrompt = translateData.choices[0].message.content.trim() + ", perfectly seamless 2D textile pattern, flat overhead shot, high resolution, crisp details";
        }
      } catch (err) {
        console.warn('Translation skipped or failed, using fallback prompt:', err);
      }
    }

    let base64Image = '';

    // 【絶対ルール】フロント側の完璧なタイリング計算（40cm基準）を活かすため、
    // アイテム種別に関わらず画像は全て「正方形」で生成します。
    const falImageSize = 'square_hd';
    const openaiImageSize = '1024x1024';

    // 2. エンジン分岐 (fal or OpenAI)
    if (engine === 'flux') {
      const falKey = process.env.FAL_KEY;
      if (!falKey) {
        throw new Error('Vercelの環境変数に FAL_KEY が設定されていません。');
      }

      // falの即時実行（同期）エンドポイントを使用
      const falRes = await fetch('https://fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`,
        },
        body: JSON.stringify({
          prompt: englishPrompt,
          image_size: falImageSize,
          num_inference_steps: 4,
          num_images: 1,
        }),
      });

      const falData = await falRes.json();

      if (!falRes.ok || falData.detail || !falData.images?.[0]?.url) {
        throw new Error(falData.detail || falData.error?.message || 'falでの画像生成に失敗しました。');
      }

      const imgUrl = falData.images[0].url;
      const imgFetch = await fetch(imgUrl);
      const imgBuffer = await imgFetch.arrayBuffer();
      base64Image = Buffer.from(imgBuffer).toString('base64');

    } else {
      // OpenAI
      if (!openAiKey) {
        throw new Error('Vercelの環境変数に OPENAI_API_KEY が設定されていません。');
      }

      const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-image-2.5-sunburst',
          prompt: englishPrompt,
          n: 1,
          size: openaiImageSize,
          quality: 'high',
          output_format: 'png',
        }),
      });

      const openaiData = await openaiRes.json();
      if (!openaiRes.ok || openaiData.error || !openaiData.data?.[0]) {
        throw new Error(openaiData.error?.message || 'OpenAIでの画像生成に失敗しました。');
      }

      base64Image = openaiData.data[0].b64_json;
    }

    // 3. Vercel Blobへ保存
    const buffer = Buffer.from(base64Image, 'base64');
    const blob = await put(`komon-${Date.now()}.png`, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return NextResponse.json({
      imageUrl: blob.url,
      blobUrl: blob.url,
      rotatedPatternUrl: blob.url,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
