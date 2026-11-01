// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ★ 最新のGAS WebアプリURL
const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbxaG8AFwsNy3tTrQ3T1MjhckJwvyNhUIBY-mXM6JkYMa60rE4LFvD1NM5rR-1kykw/exec';

// ★ GET: シリアルコードの残数照会（スプレッドシートの残数は減らしません）
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

const STYLE_PROMPTS: Record<string, string> = {
  none: '',
  scarf: 'Premium luxury European silk scarf aesthetic. Vivid harmonious colors, extremely intricate decorative details.',
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
      aiStyle = 'none', 
      engine = 'flux',
      paymentMode = 'free',
      premiumCode = ''
    } = body;

    if (!motif) return NextResponse.json({ error: 'モチーフを指定してください。' }, { status: 400 });

    const isPremium = paymentMode === 'premium' || engine === 'openai_premium' || (engine === 'openai' && Boolean(premiumCode));
    const isFlux = !isPremium && engine === 'flux';
    const isOpenAiFree = !isPremium && (engine === 'openai_free' || engine === 'openai');

    // ★ 1. チケット利用：生成前の残数チェック（ここでは絶対に減らさない）
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

    // ★ 2. 無料枠：Vercel KVによる制限
    } else {
      const ip = req.headers.get('x-forwarded-for') || 'anonymous_ip';
      const today = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }).split(' ')[0].replace(/\//g, '-');

      if (isFlux) {
        const fluxKey = `usage:flux:${ip}:${today}`;
        const fluxCount = (await kv.get<number>(fluxKey)) || 0;
        if (fluxCount >= 15) {
          return NextResponse.json({ error: '本日の無料アイデア出し（FLUX）の枠（15回）を使い切りました。明日またお試しください。' }, { status: 429 });
        }
        await kv.incr(fluxKey);
        await kv.expire(fluxKey, 86400);

      } else if (isOpenAiFree) {
        const freeKey = `usage:openaifree:${ip}:${today}`;
        const freeCount = (await kv.get<number>(freeKey)) || 0;
        if (freeCount >= 1) {
          return NextResponse.json({ error: '本日の「本気の1枚（無料お試し）」はすでに利用済みです。続きはプレミアムコードをご利用ください。' }, { status: 429 });
        }
        await kv.incr(freeKey);
        await kv.expire(freeKey, 86400);

      } else {
        return NextResponse.json({ error: '不正なエンジン指定です。' }, { status: 400 });
      }
    }

    // --- プロンプト構築 ---
    const englishMotif = await translateToEnglish(motif);
    const isScarfMode = motif.includes('スカーフ') || motif.toLowerCase().includes('scarf');
    const isOtaiko = density.includes('お太鼓柄');

    let baseInstruction = `Premium high-end luxury textile pattern design. A sophisticated masterpiece blending elegant decorative European luxury textiles with poetic artisan crafts. Strictly 2D flat surface.`;
    let layoutInstruction = isScarfMode 
      ? "CRITICAL LAYOUT: Perfectly balanced square framed composition for a luxury silk scarf (Carré). Clean solid unpatterned margin around the absolute outer edge for sewing allowance. Highly ornate decorative square border inside. Majestic central focal medallion. DO NOT tile."
      : (isOtaiko ? "Non-seamless layout. A single magnificent focal motif exactly in the dead center. Vast seamless background." : "Seamless abstract floating layout. Elegantly spaced motifs with massive clean negative space.");
    
    const styleDetail = STYLE_PROMPTS[aiStyle] || '';
    const colorInstruction = (color && color !== 'おまかせ') ? `Main Color Theme: ${color}.` : 'Harmonious color palette.';
    const enforcement = `【STRICT QUALITY ENFORCEMENT】 Strictly MATURE, SOPHISTICATED, and ELEGANT high-end aesthetic. ABSOLUTELY NO childish styles, NO kawaii, NO chibi. Zero gradients, zero shadows.`;

    const prompt = `${baseInstruction} ${layoutInstruction}\n【Motifs】\n${englishMotif} (${motif})\n${styleDetail ? `【Style】\n${styleDetail}\n` : ''}【Color】\n${colorInstruction}\n${enforcement}`;

    // --- 画像生成処理（FLUX または OpenAI） ---
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

    // ★ OpenAI 高精細生成（gpt-image-2.5-sunburst）
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

    // ★ Vercel Blobへ保存（100%成功を確認）
    const blob = await put(`textile-openai-${Date.now()}.png`, buffer, { access: 'public', contentType: 'image/png' });

    // ★★★ 生成が成功した瞬間「だけ」チケット残数を1減らす（安全設計） ★★★
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
