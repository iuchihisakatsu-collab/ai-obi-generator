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

// 根っこのフィルターが強力になったため、スタイル選択は「味付け」程度に機能します
const STYLE_PROMPTS: Record<string, string> = {
  none: '',
  yuzen: 'Add subtle Kyoto Yuzen traditional elegance, soft delicate transitions.',
  mingei: 'Emphasize strong Katasome stencil dyeing aesthetic, rich earth tones.',
  retro: 'Add Taisho Roman nostalgic early 20th century Japanese romantic mood.',
  sarasa: 'Incorporate exotic Sarasa chintz and intricate floral arabesque vines.',
  morris: 'Infuse dense symmetrical botanical foliage like British Arts and Crafts.',
  botanical: 'Add delicate vintage botanical illustration study details.',
  artnouveau: 'Incorporate fluid organic whiplash curves and ornate floral frames.',
  nordic: 'Emphasize bold minimalist Scandinavian graphic shapes.',
  kissaten: 'Add Showa retro nostalgic 1970s charming warm muted tones.',
  psychedelic: 'Add 1970s groovy swirling fluid curves and energetic rhythms.',
  anime: 'Strictly crisp cel-shaded clean line art, vibrant flat graphic colors.',
  lollipop: 'Infuse sweet pastel colors and playful dreamy repeating elements.',
  cyberpunk: 'Add futuristic tech aesthetic, geometric circuit lines.',
  steampunk: 'Incorporate intricate mechanical gears, Victorian industrial engraving.',
  retrofuturism: 'Add mid-century atomic starbursts, vintage cosmic graphic layout.'
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
    const isOtaiko = density.includes('お太鼓柄');

    // ★ ここが「根っこの絶対的フィルター」です（高級シルク×オーガニック手仕事）
    let baseInstruction = `
Premium high-end luxury textile pattern design. A sophisticated masterpiece blending the highly intricate, elegant decorative narrative composition of European luxury silk scarves with the poetic, organic, handcrafted block-print texture of contemporary Scandinavian-Japanese artisan crafts. 
Subtle tactile fabric feel, gentle wabi-sabi imperfections in the print, crisp fine outlines. 
Strictly 2D flat surface, screen print or woodblock aesthetic. Pure solid colors, zero depth of field, zero photographic realism.
`;
    
    let layoutInstruction = "";
    
    // ★ 形状の維持とクオリティコントロール
    let integrityInstruction = "Flawlessly separated individual elements with exquisite, refined, and graceful outlines. Strictly two eyes per face, perfect normal anatomy. NO physical dividing lines. Strictly non-photorealistic artistic illustration. ";

    if (isOtaiko) {
      layoutInstruction = "Non-seamless layout. A single, magnificent, elegant, and highly detailed focal motif placed exactly in the dead center of the canvas. Surrounded by vast, pure, seamless background color (negative space). DO NOT repeat the pattern. DO NOT tile. ";
    } else if (density.includes('四方柄')) {
      layoutInstruction = "Zero gravity floating layout. Seamless abstract allover toss pattern. Each individual element is placed like a separate sticker with massive empty space between them. Absolutely NO physical touching between motifs. Motifs are randomly rotated in every possible mathematical angle (upside down, sideways). NO definite top or bottom orientation. True rotation. ";
    } else {
      layoutInstruction = "Seamless tobigara pattern. Zero gravity floating layout. Elegantly spaced floating motifs placed like separate stickers with massive clean negative space between each element. Absolutely NO physical touching between motifs. ";
    }

    const styleDetail = STYLE_PROMPTS[aiStyle] || '';
    const artistDetail = ARTIST_PROMPTS[artist] || '';

    const colorInstruction = (color && color !== 'おまかせ')
      ? `Main Color Theme: ${color}. Incorporate these colors elegantly into the masterpiece.`
      : 'Sophisticated, mature, and harmonious color palette chosen by the master artist.';

    // ★ ファンシー＆安物ベクター絶対殺すマン
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
