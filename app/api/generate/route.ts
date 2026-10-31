// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
          content: "You are a professional textile prompt translator for a high-end luxury kimono brand. Translate the given Japanese motifs into clear, specific English keywords. Ensure the translation implies a mature, sophisticated, and elegant aesthetic. Output ONLY English comma-separated keywords, no markdown, no quotes."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.2,
      max_tokens: 150,
    });
    return res.choices[0]?.message?.content?.trim() || text;
  } catch (err) {
    console.error("Translation error:", err);
    return text;
  }
}

const STYLE_PROMPTS: Record<string, string> = {
  none: '',
  scarf: 'Premium luxury European silk scarf aesthetic. Vivid harmonious colors, extremely intricate decorative details.',
  galle: 'Inspired by Émile Gallé Art Nouveau cameo glass: poetic botanical naturalism, layered translucent textures resembling etched glass, subtle melancholic and mysterious atmosphere, deep jewel tones.',
  organic: 'Poetic organic textile design, handcrafted block print texture, gentle warm wabi-sabi imperfections, simplified elegant nature motifs.',
  toile: 'Traditional French Toile de Jouy textile, delicate monochromatic line-drawn pastoral or botanical scenes, classic elegant porcelain aesthetic.',
  risograph: 'Modern risograph print textile, elegant ink layering, beautiful subtle misregistration, nostalgic yet sophisticated contemporary art vibe.',
  woodblock: 'Antique Japanese woodblock print aesthetic, subtle washi paper texture, traditional handcrafted block-printing ink interactions, refined Edo-period grace.',
  morris: 'William Morris Arts and Crafts textile design, dense symmetrical botanical foliage, interlocking acanthus leaves and florals.',
  yuzen: 'Add subtle Kyoto Yuzen traditional elegance, soft delicate watercolor transitions, elegant flowing lines.'
};

const ARTIST_PROMPTS: Record<string, string> = {
  none: '',
  hokusai: 'Inspired by Katsushika Hokusai: iconic woodblock print line art.',
  jakuchu: 'Inspired by Ito Jakuchu: hyper-detailed decorative naturalism.',
  kuniyoshi: 'Inspired by Utagawa Kuniyoshi: dynamic eccentric ukiyo-e whimsical lines.',
  korin: 'Inspired by Ogata Korin: stylized bold organic forms, tarashikomi technique.'
};

export async function POST(req: Request) {
  try {
    const { 
      motif, 
      color = 'おまかせ', 
      density = '', 
      aiStyle = 'none', 
      artist = 'none', 
      engine = 'flux', // 'flux', 'openai_free', 'openai_premium'
      premiumCode = ''
    } = await req.json();

    if (!motif) {
      return NextResponse.json({ error: 'モチーフを指定してください。' }, { status: 400 });
    }

    const englishMotif = await translateToEnglish(motif);
    const isScarfMode = motif.includes('スカーフ') || motif.toLowerCase().includes('scarf');
    const isOtaiko = density.includes('お太鼓柄');

    let baseInstruction = `Premium high-end luxury textile pattern design. A sophisticated masterpiece blending elegant decorative European luxury textiles with the poetic, organic handcrafted block-print texture of artisan crafts. Strictly 2D flat surface. Pure solid colors, zero photographic realism.`;
    
    let layoutInstruction = "";
    if (isScarfMode) {
      layoutInstruction = "CRITICAL LAYOUT: Perfectly balanced square framed composition for a luxury silk scarf (Carré). You MUST leave a clean, solid, unpatterned margin around the absolute outer edge of the canvas for a sewing allowance. Inside this blank sewing margin, draw a highly ornate decorative square border (frame). Include intricate corner ornaments and a majestic central focal medallion in the dead center. DO NOT tile. ";
    } else if (isOtaiko) {
      layoutInstruction = "Non-seamless layout. A single magnificent focal motif exactly in the dead center. Vast seamless background. DO NOT tile. ";
    } else {
      layoutInstruction = "Seamless abstract floating layout. Elegantly spaced motifs with massive clean negative space. NO physical touching between motifs. ";
    }

    const styleDetail = STYLE_PROMPTS[aiStyle] || '';
    const artistDetail = ARTIST_PROMPTS[artist] || '';
    const colorInstruction = (color && color !== 'おまかせ') ? `Main Color Theme: ${color}.` : 'Harmonious color palette.';

    const enforcement = `【STRICT QUALITY ENFORCEMENT】 Strictly MATURE, SOPHISTICATED, and ELEGANT high-end aesthetic. ABSOLUTELY NO childish styles, NO cheap vector stock art, NO kawaii, NO chibi. Zero gradients, zero shadows.`;

    const prompt = `${baseInstruction}${layoutInstruction}\n【Motifs】\n${englishMotif} (${motif})\n${styleDetail ? `【Style】\n${styleDetail}\n` : ''}${artistDetail ? `【Artist】\n${artistDetail}\n` : ''}【Color】\n${colorInstruction}\n${enforcement}`;

    // FLUXエンジンの処理
    if (engine === 'flux' && process.env.FAL_KEY) {
      try {
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
              if (pollData.status === 'FAILED') break;
            }
          }
          const generatedUrl = resultData.images?.[0]?.url;
          if (generatedUrl) {
            const imgRes = await fetch(generatedUrl);
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            const blob = await put(`textile-flux-${Date.now()}.png`, buffer, { access: 'public', contentType: 'image/png' });
            return NextResponse.json({ imageUrl: blob.url, engine: 'flux' });
          }
        }
      } catch (falErr) {
        console.error('FAL failed:', falErr);
      }
    }

    // ★ OpenAIエンジンの処理（quality: "high" を削除して原価を半額に！）
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
      // quality: "high" ← 削除しました（これで1枚6〜7円になります）
    });

    const base64Image = response.data?.[0]?.b64_json;
    if (!base64Image) throw new Error('画像生成失敗');
    const buffer = Buffer.from(base64Image, 'base64');
    const blob = await put(`textile-openai-${Date.now()}.png`, buffer, { access: 'public', contentType: 'image/png' });

    return NextResponse.json({ imageUrl: blob.url, engine: 'openai' });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || '通信エラー' }, { status: 500 });
  }
}
