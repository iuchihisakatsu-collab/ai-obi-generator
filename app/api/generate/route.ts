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
  korin: 'Inspired by Ogata Korin: stylized bold organic forms, tarashikomi technique.',
  hoitsu: 'Inspired by Sakai Hoitsu: refined poetic seasonal graceful brushwork.',
  kyosai: 'Inspired by Kawanabe Kyosai: spirited and humorous expressive lines.',
  utamaro: 'Inspired by Kitagawa Utamaro: supreme delicate micro-fine line art.',
  koson: 'Inspired by Ohara Koson: exquisite woodblock color gradation (bokashi).',
  sharaku: 'Inspired by Toshusai Sharaku: striking graphic stylized dramatic contrasts.',
  klimt: 'Inspired by Gustav Klimt: shimmering ornamental mosaic geometric patterns.',
  mucha: 'Inspired by Alphonse Mucha: flowing pastel curves, lush botanical filigree.',
  vangogh: 'Inspired by Vincent van Gogh: passionate swirling thick brushstrokes.',
  monet: 'Inspired by Claude Monet: Impressionist broken color brushwork.',
  rousseau: 'Inspired by Henri Rousseau: lush exotic primeval dreamscape layers.',
  matisse: 'Inspired by Henri Matisse: bold organic silhouette gouache cut-outs.',
  redon: 'Inspired by Odilon Redon: mystical ethereal floating visionary aura.',
  gauguin: 'Inspired by Paul Gauguin: bold cloisonnist contours, exotic flat colors.',
  bonnard: 'Inspired by Pierre Bonnard: intimate sensory warm tapestry-like vibrations.'
};

export async function POST(req: Request) {
  try {
    const { 
      motif, 
      color = 'おまかせ', 
      density = '', 
      itemType = 'hanhaba', 
      aiStyle = 'none', 
      artist = 'none', 
      engine = 'flux' 
    } = await req.json();

    if (!motif) {
      return NextResponse.json({ error: 'モチーフを指定してください。' }, { status: 400 });
    }

    const englishMotif = await translateToEnglish(motif);
    
    // ★「スカーフ」という文字が入っていたら強制的にスカーフモード発動
    const isScarfMode = motif.includes('スカーフ') || motif.toLowerCase().includes('scarf');
    const isOtaiko = density.includes('お太鼓柄');

    let baseInstruction = `
Premium high-end luxury textile pattern design. A sophisticated masterpiece blending elegant decorative European luxury textiles with the poetic, organic handcrafted block-print texture of artisan crafts. 
Subtle tactile fabric feel, gentle wabi-sabi imperfections in the print, crisp fine outlines. 
Strictly 2D flat surface, screen print or woodblock aesthetic. Pure solid colors, zero depth of field, zero photographic realism.
`;
    
    let layoutInstruction = "";
    let integrityInstruction = "Flawlessly separated individual elements with exquisite, refined, and graceful outlines. Strictly two eyes per face, perfect normal anatomy. NO physical dividing lines. Strictly non-photorealistic artistic illustration. ";

    if (isScarfMode) {
      // ★ 縫い代マージン ＋ 額縁 ＋ 中央メダリオンの最強カレ構図
      layoutInstruction = "CRITICAL LAYOUT: Perfectly balanced square framed composition for a luxury silk scarf (Carré). You MUST leave a clean, solid, unpatterned margin around the absolute outer edge of the canvas for a sewing allowance. Inside this blank sewing margin, draw a highly ornate decorative square border (frame). Include intricate corner ornaments and a majestic central focal medallion in the dead center. DO NOT tile. ";
    } else if (isOtaiko) {
      layoutInstruction = "Non-seamless layout. A single, magnificent, elegant, and highly detailed focal motif placed exactly in the dead center of the canvas. Surrounded by vast, pure, seamless background color (negative space). DO NOT repeat the pattern. DO NOT tile. ";
    } else if (density.includes('四方柄')) {
      layoutInstruction = "Zero gravity floating layout. Seamless abstract allover toss pattern. Each individual element is placed like a separate sticker with massive empty space between them. Absolutely NO physical touching between motifs. Motifs are randomly rotated in every possible mathematical angle. NO definite top or bottom orientation. True rotation. ";
    } else {
      layoutInstruction = "Seamless tobigara pattern. Zero gravity floating layout. Elegantly spaced floating motifs placed like separate stickers with massive clean negative space between each element. Absolutely NO physical touching between motifs. ";
    }

    const styleDetail = STYLE_PROMPTS[aiStyle] || '';
    const artistDetail = ARTIST_PROMPTS[artist] || '';

    const colorInstruction = (color && color !== 'おまかせ')
      ? `Main Color Theme: ${color}. Incorporate these colors elegantly into the masterpiece.`
      : 'Sophisticated, mature, and harmonious color palette chosen by the master artist.';

    const enforcement = `
【STRICT QUALITY ENFORCEMENT】
Must look like a premium luxury masterpiece worth thousands of dollars.
Strictly MATURE, SOPHISTICATED, and ELEGANT high-end aesthetic. 
ABSOLUTELY NO childish styles, NO cheap vector stock art, NO kawaii, NO chibi proportions, NO cute cartoon eyes, NO cheap fancy pop elements. 
Emphasize wabi-sabi, subtle grace, and refined artistic quality.
Zero gradients, zero shadows, flawless clear massive separation between objects. NO fused elements.
`;

    const prompt = `${baseInstruction}${layoutInstruction}${integrityInstruction}

【Subject Motifs】
${englishMotif} (${motif})

${styleDetail ? `【Additional Flavor】\n${styleDetail}\n` : ''}${artistDetail ? `【Artist Inspiration】\n${artistDetail}\n` : ''}【Color Palette】
${colorInstruction}

${enforcement}`;

    if (engine === 'flux' && process.env.FAL_KEY) {
      try {
        const falResponse = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${process.env.FAL_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            image_size: 'square_hd',
            num_images: 1,
            enable_safety_checker: true
          })
        });

        if (falResponse.ok) {
          const falData = await falResponse.json();
          let resultData = falData;

          if (falData.status_url) {
            for (let i = 0; i < 30; i++) {
              await new Promise(r => setTimeout(r, 1000));
              const pollRes = await fetch(falData.status_url, {
                headers: { 'Authorization': `Key ${process.env.FAL_KEY}` }
              });
              const pollData = await pollRes.json();
              if (pollData.status === 'COMPLETED') {
                const resResponse = await fetch(falData.response_url, {
                  headers: { 'Authorization': `Key ${process.env.FAL_KEY}` }
                });
                resultData = await resResponse.json();
                break;
              }
              if (pollData.status === 'FAILED') break;
            }
          }

          const generatedUrl = resultData.images?.[0]?.url;
          if (generatedUrl) {
            const imgRes = await fetch(generatedUrl);
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const filename = `textile-flux-${Date.now()}.png`;

            const blob = await put(filename, buffer, {
              access: 'public',
              contentType: 'image/png'
            });

            return NextResponse.json({
              imageUrl: blob.url,
              blobUrl: blob.url,
              engine: 'flux'
            }, {
              headers: { 'Cache-Control': 'no-store, max-age=0' }
            });
          }
        }
      } catch (falErr) {
        console.error('FAL generation failed, fallback to OpenAI:', falErr);
      }
    }

    const response = await openai.images.generate({
      model: "gpt-image-2.5-sunburst",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
      output_format: "png",
    });

    const base64Image = response.data?.[0]?.b64_json;
    if (!base64Image) throw new Error('画像データの取得に失敗しました。');

    const buffer = Buffer.from(base64Image, 'base64');
    const filename = `textile-openai-${Date.now()}.png`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png'
    });

    return NextResponse.json({
      imageUrl: blob.url,
      blobUrl: blob.url,
      engine: 'openai'
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
