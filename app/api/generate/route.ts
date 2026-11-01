// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzhOwP3nHglg5z23lFTULbHNLfOGh0R0VxKsF1IhVYYL-bEAENbyzoGW0ikaz187lvn/exec';

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

    // エンジン種別の判定（page.tsxと直接指定の両方に対応）
    const isPremium = paymentMode === 'premium' || engine === 'openai_premium' || (engine === 'openai' && Boolean(premiumCode));
    const isFlux = !isPremium && engine === 'flux';
    const isOpenAiFree = !isPremium && (engine === 'openai_free' || engine === 'openai');

    let remainingTickets: number | null = null;

    // ★ 1. チケット利用（極みの意匠）：Googleスプレッドシート（GAS）で残数チェック＆消費
    if (isPremium) {
      const code = (premiumCode || '').trim().toUpperCase();
      if (!code) {
        return NextResponse.json({ error: 'プレミアムチケットのシリアルコードを入力してください。' }, { status: 400 });
      }

      try {
        const gasRes = await fetch(GAS_WEBAPP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const gasData = await gasRes.json();

        // コードが存在しない、または上限（50回）に達している場合はここで遮断
        if (!gasData.success) {
          return NextResponse.json(
            { error: gasData.error || 'チケットの認証に失敗しました。' },
            { status: 400 }
          );
        }

        remainingTickets = gasData.remaining;
      } catch (gasErr: any) {
        console.error('GASチケット認証通信エラー:', gasErr);
        return NextResponse.json(
          { error: 'チケット認証サーバーとの通信に失敗しました。時間をおいて再試行してください。' },
          { status: 500 }
        );
      }

    // ★ 2. 無料枠（FLUX / OpenAI無料お試し）：Vercel KVによるIP/日付制限
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
          return NextResponse.json({ 
            imageUrl: blob.url, 
            blobUrl: blob.url, 
            engine: 'flux' 
          });
        }
      }
    }

    // チケット利用 または 本番清書（OpenAI DALL-E 3）
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
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

    return NextResponse.json({ 
      imageUrl: blob.url, 
      blobUrl: blob.url, 
      engine: 'openai',
      remainingTickets 
    });

  } catch (error: any) {
    console.error('Generate Route Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラー' }, { status: 500 });
  }
}
