// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const { motif, color, density, itemType, aiStyle, engine } = await req.json();

    // 1. gpt-4o-miniによる「プロンプト翻訳＆物理サイズ（スケール）の強制制御」
    const openAiKey = process.env.OPENAI_API_KEY;
    const systemPrompt = `You are an expert textile pattern designer for digital silk printing.
Translate the user's Japanese design idea into a concise English prompt for an AI image generator.

【CRITICAL SIZING & DENSITY RULES (MUST FOLLOW)】
1. SCALE: The pattern MUST be a "micro-scale" dense repeating layout.
2. NO GIANT MOTIFS: A single focal motif MUST NOT dominate the canvas. The image must contain AT LEAST 15-30 small, evenly spaced repeating elements.
3. COMPOSITION: "Flat overhead shot, perfectly seamless 2D textile pattern graphic design. Small repeating motifs, dense layout. High resolution, crisp details, no halftone dots."
4. PROHIBITED: NO humans, NO faces, NO clothing, NO 3D perspective, NO background scenery, NO large focal objects.

User's requested motif: ${motif}
Color scheme: ${color}
Layout density: ${density}
Style: ${aiStyle}

Output ONLY the final comma-separated English prompt.`;

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
    const englishPrompt = translateData.choices[0].message.content.trim();

    let base64Image = '';

    // 2. エンジン分岐 (fal or OpenAI)
    if (engine === 'flux') {
      const falKey = process.env.FAL_KEY;
      const falRes = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`,
        },
        body: JSON.stringify({
          prompt: englishPrompt,
          image_size: 'square_hd',
          num_inference_steps: 4,
          num_images: 1,
          sync_mode: true,
        }),
      });
      const falData = await falRes.json();
      const imgUrl = falData.images[0].url;
      
      const imgFetch = await fetch(imgUrl);
      const imgBuffer = await imgFetch.arrayBuffer();
      base64Image = Buffer.from(imgBuffer).toString('base64');

    } else {
      // OpenAI (最新プリントモデル準拠)
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
          size: '1024x1024',
          quality: 'high',
          output_format: 'png',
        }),
      });
      const openaiData = await openaiRes.json();
      if (openaiData.error) throw new Error(openaiData.error.message);
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
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
