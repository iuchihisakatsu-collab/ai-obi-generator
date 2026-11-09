// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxaG8AFwsNy3tTrQ3T1MjhckJwvyNhUIBY-mXM6JkYMa60rE4LFvD1NM5rR-1kykw/exec';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get('code') || '').trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'コードが未入力です' }, { status: 400 });
    }

    const gasRes = await fetch(GAS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, action: 'check' }),
    });

    const data = await gasRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: '残数照会エラー' }, { status: 500 });
  }
}

async function translateToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) return '';
  const hasJapanese = /[^\x00-\x7F]/.test(text);
  if (!hasJapanese) return text.trim();

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional textile prompt translator for a high-end luxury kimono brand. Translate the given Japanese motifs into clear, specific English keywords. Ensure the translation implies a mature, sophisticated, and elegant aesthetic. Output ONLY English comma-separated keywords."
        },
        { role: "user", content: text }
      ],
      temperature: 0.2,
      max_tokens: 150,
    });
    return res.choices[0]?.message?.content?.trim() || text;
  } catch (err) {
    return text;
  }
}

const TASTE_PROMPTS: Record<string, string> = {
  katazome: 'Traditional Japanese katazome stencil dye aesthetic, crisp clean silhouettes, sumi ink and indigo wash, Edo-period graphic boldness, zero gradients, wabi-sabi balance.',
  botanical: 'Antique copperplate etching style, vintage scientific botanical illustration, intricate hatching lines, William Morris Arts and Crafts depth, muted sepia and earthy tones.',
  mingei: 'Folk-art woodblock and linocut print, rustic hand-stamped ink texture, imperfect rough edges, mid-20th-century retro graphic poster, bold woodcut relief.',
  mode: 'Contemporary high-end Scandinavian textile, Bauhaus minimalism, sharp graphic geometry, solid color blocking, sophisticated avant-garde kimono aesthetic, high contrast.'
};

const STYLE_PROMPTS: Record<string, string> = {
  none: '',
  scarf: 'Premium luxury European square silk scarf aesthetic. Vivid harmonious colors, extremely intricate decorative border details.',
  galle: 'Inspired by Émile Gallé Art Nouveau cameo glass: poetic botanical naturalism, layered translucent textures resembling etched glass.',
  organic: 'Poetic organic textile design, handcrafted block print texture, gentle warm wabi-sabi imperfections.',
  toile: 'Traditional French Toile de Jouy textile, delicate monochromatic line-drawn pastoral scenes.',
  risograph: 'Modern risograph print textile, elegant ink layering, beautiful subtle misregistration.',
  woodblock: 'Antique Japanese woodblock print aesthetic, subtle washi paper texture.',
  morris: 'William Morris Arts and Crafts textile design, dense symmetrical botanical foliage.',
  yuzen: 'Add subtle Kyoto Yuzen traditional elegance, soft delicate watercolor transitions.'
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      motif, 
      color = 'おまかせ', 
      density = '', 
      itemType = 'hanhaba',
      aiStyle = 'none', 
      tasteMode = 'katazome',
      engine = 'flux',
      paymentMode = 'free',
      premiumCode = '',
      patternScale: explicitScale
    } = body;

    if (!motif) return NextResponse.json({ error: 'モチーフを指定してください。' }, { status: 400 });

    const isPremium = paymentMode === 'premium' || engine === 'openai_premium' || (engine === 'openai' && Boolean(premiumCode));
    const isFlux = !isPremium && engine === 'flux';
    const isOpenAiFree = !isPremium && (engine === 'openai_free' || engine === 'openai');

    const code = (premiumCode || '').trim().toUpperCase();
    if (isPremium) {
      if (!code) {
        return NextResponse.json({ error: 'プレミアムチケットのシリアルコードを入力してください。' }, { status: 400 });
      }

      const checkRes = await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, action: 'check' }),
      });
      const checkData = await checkRes.json();

      if (!checkData.success) {
        return NextResponse.json({ error: checkData.error || '無効なシリアルコードです。' }, { status: 400 });
      }
      if (checkData.remaining <= 0) {
        return NextResponse.json({ error: 'このチケットは利用上限（50回）に達しました。' }, { status: 403 });
      }

    } else {
      const ip = req.headers.get('x-forwarded-for') || 'anonymous_ip';
      const today = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).split(' ')[0].replace(/\//g, '-');

      if (isFlux) {
        const fluxKey = `usage:flux:${ip}:${today}`;
        const fluxCount = (await kv.get<number>(fluxKey)) || 0;
        if (fluxCount >= 15) {
          return NextResponse.json({ error: '本日の気まぐれスケッチ枠（15回）を使い切りました。明日またお試しください。' }, { status: 429 });
        }
        await kv.incr(fluxKey);
        await kv.expire(fluxKey, 86400);

      } else if (isOpenAiFree) {
        const freeKey = `usage:openaifree:${ip}:${today}`;
        const freeCount = (await kv.get<number>(freeKey)) || 0;
        if (freeCount >= 1) {
          return NextResponse.json({ error: '本日の「本気デザイン（無料枠）」はすでに利用済みです。続きはチケットコードをご利用ください。' }, { status: 429 });
        }
        await kv.incr(freeKey);
        await kv.expire(freeKey, 86400);

      } else {
        return NextResponse.json({ error: '不正な指定です。' }, { status: 400 });
      }
    }

    const cleanMotifForTranslation = motif
      .replace(/。?柄の大きさ[：:][^\n]*/g, '')
      .replace(/\(tiny delicate repeating motifs[^\)]*\)/gi, '')
      .replace(/\(medium-scale repeating motifs[^\)]*\)/gi, '')
      .replace(/\(large bold prominent motifs[^\)]*\)/gi, '')
      .trim();

    const englishMotif = await translateToEnglish(cleanMotifForTranslation);
    
    // 1. 柄の大きさ（Scale）判定
    let detectedScale: 'small' | 'medium' | 'large' = 'medium';
    const rawScale = (explicitScale || '').toLowerCase();
    if (rawScale === 'small' || rawScale === 'fine' || motif.includes('細かい') || motif.includes('tiny delicate') || motif.includes('micro')) {
      detectedScale = 'small';
    } else if (rawScale === 'large' || motif.includes('大きい') || motif.includes('large bold') || motif.includes('大柄')) {
      detectedScale = 'large';
    }

    let scaleKeyword = '';
    let negativeScalePrompt = '';
    if (detectedScale === 'small') {
      scaleKeyword = '[SCALE: ULTRA-DENSE MICRO-KOMON] Miniature delicate scattered motifs (15mm scale), dozens of tiny repeating elements densely filling the surface without giant focal hero elements.';
      negativeScalePrompt = 'giant motifs, oversized subjects, single hero illustration, close-up, large empty space, huge animal, massive single object, portrait composition';
    } else if (detectedScale === 'large') {
      scaleKeyword = '[SCALE: BOLD STATEMENT MACRO PATTERN] Large prominent artistic motifs (100mm+ scale), bold impactful composition with striking presence.';
      negativeScalePrompt = 'tiny micro pattern, crowded ditsy print, dozens of small dots, miniature clutter';
    } else {
      scaleKeyword = '[SCALE: BALANCED CLASSIC KIMONO PATTERN] Medium-scale harmonious repeating motifs (40mm-50mm scale), classic Japanese kimono rhythm.';
      negativeScalePrompt = 'giant single portrait, micro dot clutter, single focal hero';
    }

    // 2. 柄の向き・天地（Direction / Orientation）判定
    const isScarfMode = itemType === 'scarf' || density.includes('スカーフ') || density.includes('額縁') || motif.includes('スカーフ') || motif.toLowerCase().includes('scarf');
    const isOtaiko = density.includes('お太鼓柄');
    const isShiho = density.includes('四方') || density.includes('天地無用') || (!isScarfMode && !isOtaiko && (density.includes('四方') || itemType === 'kimono'));
    const isUpright = density.includes('一方向') || density.includes('上向き');

    let directionHeading = '';
    let directionEnforcement = '';
    let negativeDirectionPrompt = '';

    if (isScarfMode) {
      directionHeading = 'LUXURY SQUARE SCARF FRAMED PANEL COMPOSITION';
      directionEnforcement = 'Perfect square framed composition with solid outer margin border and central ornate decorative medallion. DO NOT tile.';
    } else if (isOtaiko) {
      directionHeading = 'OTAIKO DRUM ACCENT PANEL';
      directionEnforcement = 'Non-seamless centered panel design with a single magnificent focal motif placed in upper center.';
    } else if (isShiho && !isUpright) {
      directionHeading = 'OMNIDIRECTIONAL MULTI-DIRECTIONAL TOSSED PATTERN (CHIRA-SHI)';
      directionEnforcement = `CRITICAL MANDATORY ORIENTATION:
Every motif MUST be randomly rotated and tossed in ALL possible angles (0°, 90°, 180°, 270°, and diagonals).
AT LEAST HALF OF ALL MOTIFS MUST BE COMPLETELY UPSIDE-DOWN (INVERTED 180 DEGREES) AND SIDEWAYS.
Do NOT draw animals or objects standing straight up.
Tumble and scatter the motifs chaotically so the pattern looks identical whether viewed right-side-up, upside-down, or from the side. Zero top, zero bottom.`;
      negativeDirectionPrompt = 'all upright, all facing up, single direction, uniform orientation, upright standing animals, standing upright, vertically aligned, heads up only';
    } else {
      directionHeading = 'STRICT ONE-DIRECTIONAL UPRIGHT REPEAT PATTERN';
      directionEnforcement = `CRITICAL MANDATORY ORIENTATION:
All motifs MUST face straight UP towards the top edge. Perfect vertical upright alignment, bottom-to-top orientation. No inverted motifs.`;
      negativeDirectionPrompt = 'upside down, inverted, sideways, tilted, upside down animals, random rotation';
    }

    const tasteDetail = TASTE_PROMPTS[tasteMode] || TASTE_PROMPTS['katazome'];
    const styleDetail = STYLE_PROMPTS[aiStyle] || '';

    // ★ コロさん指摘対策：選んだ色を確実に着物の「地色（メイン背景色）」にする強力ロジック
    const colorInstruction = (color && color !== 'おまかせ') 
      ? `CRITICAL MANDATORY COLOR RULE: The primary background / ground color (地色) of the fabric MUST BE dyed in ${color}. Ensure the base textile surface is predominantly ${color}, with the motifs harmoniously composed on top of this ${color} ground color.` 
      : 'Harmonious mature kimono color palette.';

    const enforcement = `【STRICT QUALITY & FORMAT ENFORCEMENT】
Strictly MATURE, SOPHISTICATED, ARTISAN-CRAFTED high-end textile aesthetic.
ABSOLUTELY NO kawaii, NO pastel, NO chibi, NO childish, NO fluffy, NO cartoon, NO anime, NO fairy tale, NO soft glowing gradient.
Zero gradients, zero shadows. Top-down 2D flat orthogonal surface only. NO humans, NO mockups, NO 3D perspective.
Negative constraints: ${negativeScalePrompt}, ${negativeDirectionPrompt}, sweet cute elements, childish doodle.`;

    const prompt = `[${directionHeading}]
${directionEnforcement}
${scaleKeyword}

Flat 2D continuous textile pattern design.

【Motifs】
${englishMotif} (${cleanMotifForTranslation})

【Taste & Technique】
${tasteDetail}
${styleDetail ? `【Style Accent】\n${styleDetail}\n` : ''}
【Color & Ground Dye】
${colorInstruction}

${enforcement}`;

    // 気まぐれスケッチ（FLUX schnell）生成処理
    if (isFlux && process.env.FAL_KEY) {
      const falResponse = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
        method: 'POST',
        headers: { 'Authorization': `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt, image_size: 'square_hd', num_images: 1, enable_safety_checker: true })
      });
      if (falResponse.ok) {
        const falData = await falResponse.json();
        let resultData = falData;
        if (falData.status_url) {
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const pollRes = await fetch(falData.status_url, { headers: { 'Authorization': `Key ${process.env.FAL_KEY}` } });
            const pollData = await pollRes.json();
            if (pollData.status === 'COMPLETED') {
              const resResponse = await fetch(falData.response_url, { headers: { 'Authorization': `Key ${process.env.FAL_KEY}` } });
              resultData = await resResponse.json();
              break;
            }
          }
        }
        const generatedUrl = resultData.images?.[0]?.url;
        if (generatedUrl) {
          const imgRes = await fetch(generatedUrl);
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          const blob = await put(`textile-flux-${Date.now()}.png`, buffer, { access: 'public', contentType: 'image/png' });
          return NextResponse.json({ imageUrl: blob.url, blobUrl: blob.url, engine: 'flux' });
        }
      }
    }

    // 本気デザイン（OpenAI 高精度描出）
    const response = await openai.images.generate({
      model: "gpt-image-2.5-sunburst",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    });

    const item = response.data?.[0];
    let buffer: Buffer;

    if (item?.b64_json) {
      buffer = Buffer.from(item.b64_json, 'base64');
    } else if (item?.url) {
      const imgRes = await fetch(item.url);
      buffer = Buffer.from(await imgRes.arrayBuffer());
    } else {
      throw new Error('画像データの取得に失敗しました');
    }

    const blob = await put(`textile-openai-${Date.now()}.png`, buffer, { access: 'public', contentType: 'image/png' });

    let finalRemaining: number | null = null;
    if (isPremium) {
      try {
        const consumeRes = await fetch(GAS_WEBAPP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, action: 'consume' }),
        });
        const consumeData = await consumeRes.json();
        if (consumeData.success) {
          finalRemaining = consumeData.remaining;
        }
      } catch (err) {
        console.error('GAS消費処理エラー（生成は成功済み）:', err);
      }
    }

    return NextResponse.json({ 
      imageUrl: blob.url, 
      blobUrl: blob.url, 
      engine: 'openai',
      remainingTickets: finalRemaining,
      ticketRemaining: finalRemaining,
      remaining: finalRemaining
    });

  } catch (error: any) {
    console.error('Generate Route Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラー' }, { status: 500 });
  }
}
