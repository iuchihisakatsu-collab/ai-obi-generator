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
          content: "You are a professional textile prompt translator. Translate the given Japanese motifs into clear, specific English keywords suitable for pattern generation. Output ONLY English comma-separated keywords, no markdown, no quotes."
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
  yuzen: 'Traditional Kyoto Yuzen kimono dyeing style, delicate watercolor wash, elegant Japanese aesthetic, soft gradient shading, subtle gold dust accents.',
  mingei: 'Mingei folk art and Katasome stencil dyeing style by Keisuke Serizawa, bold handmade stencil cuts, rustic Japanese graphic, rich organic indigo and earth tones.',
  retro: 'Taisho Roman and Meisen silk kimono style by Yumeji Takehisa, nostalgic early 20th century Japanese retro, slightly melancholic romantic aesthetic.',
  sarasa: 'Exotic Sarasa chintz and Indonesian batik textile, intricate floral arabesque vines, detailed geometric exotic border patterns, rich block print texture.',
  morris: 'William Morris Arts and Crafts textile design, dense symmetrical botanical foliage, interlocking acanthus leaves and florals, vintage block print texture.',
  botanical: 'Vintage botanical illustration by Pierre-Joseph Redouté, delicate watercolor floral study, crisp naturalistic details, airy elegant negative space.',
  artnouveau: 'Alphonse Mucha Art Nouveau decorative textile, fluid organic whiplash curves, elegant sinuous vines and ornate floral frame motifs.',
  nordic: 'Scandinavian modern textile style like Marimekko, bold minimalist graphic shapes, clean contemporary silhouette, playful modern flat colors.',
  kissaten: 'Showa retro Japanese kissaten coffee shop nostalgic wrapping paper design, 1970s charming vintage cafe aesthetic, warm muted tones.',
  psychedelic: '1970s groovy psychedelic pattern inspired by Peter Max, vibrant swirling fluid curves, retro pop flower power, energetic optical rhythms.',
  anime: 'Modern Japanese pop anime graphic pattern, crisp cel-shaded clean line art, vibrant flat graphic colors, stylish Harajuku street fashion textile.',
  lollipop: 'Lollipop kawaii fancy aesthetic, sweet pastel candy colors, playful 80s fancy pop toy motifs, cheerful dreamy repeating elements.',
  cyberpunk: 'Cyberpunk futuristic tech aesthetic, glowing neon accents against dark background, intricate geometric circuit lines, sleek high-tech sci-fi kimono pattern.',
  steampunk: 'Steampunk Victorian aesthetic, intricate brass, bronze and copper mechanical gears, antique clockwork cogs, Victorian industrial engraving, rich warm metallic sepia.',
  retrofuturism: '1960s space age retro-futurism, mid-century atomic starbursts, vintage sci-fi geometric shapes, nostalgic cosmic graphic layout.'
};

const ARTIST_PROMPTS: Record<string, string> = {
  none: '',
  hokusai: 'In the distinct artistic style of Katsushika Hokusai, iconic woodblock print line art, dramatic waves and clouds, indigo and Prussian blue tones.',
  jakuchu: 'In the distinct artistic style of Ito Jakuchu, hyper-detailed naturalism, dynamic decorative composition, vibrant mineral pigments and gold leaf.',
  kuniyoshi: 'In the distinct artistic style of Utagawa Kuniyoshi, dynamic eccentric ukiyo-e composition, bold whimsical line art, spirited Japanese folklore energy.',
  korin: 'In the distinct artistic style of Ogata Korin (Rinpa school), tarashikomi ink-pooling technique, stylized bold organic forms against rich gold leaf background.',
  hoitsu: 'In the distinct artistic style of Sakai Hoitsu (Edo Rinpa), refined poetic seasonal flowers, delicate graceful brushwork, elegant balanced negative space.',
  kyosai: 'In the distinct artistic style of Kawanabe Kyosai, spirited and humorous ink brushwork, expressive dynamic lines, witty Japanese fantasy spirit.',
  utamaro: 'In the distinct artistic style of Kitagawa Utamaro, supreme delicate micro-fine line art, graceful sensual color palettes, elegant classical Japanese refinement.',
  koson: 'In the distinct artistic style of Ohara Koson (Shin-hanga), exquisite woodblock color gradation (bokashi), lifelike tranquil flora and fauna.',
  sharaku: 'In the distinct artistic style of Toshusai Sharaku, striking graphic caricature, dramatic bold contrasts, expressive stylized woodblock aesthetic.',
  klimt: 'In the distinct artistic style of Gustav Klimt (Golden Phase), shimmering ornamental gold leaf mosaics, rich symbolic spiral and geometric patterns.',
  mucha: 'In the distinct artistic style of Alphonse Mucha, flowing pastel curves, circular halo motifs, lush decorative botanical filigree.',
  vangogh: 'In the distinct artistic style of Vincent van Gogh, passionate swirling impasto brushstrokes, vibrant cobalt blue and radiant sunflower yellow, intense emotional texture.',
  monet: 'In the distinct artistic style of Claude Monet, Impressionist dappled light, broken color brushwork, soft shimmering water reflection nuances.',
  rousseau: 'In the distinct artistic style of Henri Rousseau, lush exotic jungle dreamscape, primeval oversized foliage, mysterious layered flat flora.',
  matisse: 'In the distinct artistic style of Henri Matisse (Late Cut-outs), vibrant joyful gouache decoupage, bold organic silhouette cutouts, pure flat color fields.',
  redon: 'In the distinct artistic style of Odilon Redon, mystical dreamlike symbolism, ethereal pastel aura, floating visionary botanical blossoms.',
  gauguin: 'In the distinct artistic style of Paul Gauguin, bold cloisonnist contours, exotic saturated decorative flat colors, warm tropical palette.',
  bonnard: 'In the distinct artistic style of Pierre Bonnard (Les Nabis), intimate sensory color vibrations, soft fractured light, tapestry-like warmth and pattern layering.'
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

    let baseInstruction = "Premium 2D flat surface pattern design for textile printing, crisp vector graphic illustration, screen print aesthetic. Pure solid unshaded colors, strictly two-dimensional flat art, zero depth of field, zero photographic realism. ";
    let layoutInstruction = "";

    // ★ FLUXの「重力補正（逆さまを嫌う性質）」を破壊し、「くっつく現象」を強制遮断する新しい構文
    if (density.includes('ワンポイント') || density.includes('お太鼓柄')) {
      baseInstruction = "Premium 2D flat centered graphic illustration for textile print. Crisp vector art, screen print aesthetic. Pure solid colors. ";
      layoutInstruction = "Non-seamless single centered one-point illustration. One clear focal motif placed exactly in the dead center with vast clean empty space surrounding it. ";
    } else if (density.includes('四方柄')) {
      layoutInstruction = "Zero gravity floating layout. Seamless abstract allover toss pattern. Each individual element is placed like a separate sticker with massive empty space between them. Absolutely NO physical touching between motifs. Motifs are violently rotated in every possible mathematical angle (180 degrees fully upside down, 90 degrees sideways, 270 degrees). NO definite top or bottom orientation. True chaos rotation. ";
    } else {
      layoutInstruction = "Seamless tobigara pattern. Zero gravity floating layout. Elegantly spaced floating motifs placed like separate stickers with massive clean negative space between each element. Absolutely NO physical touching between motifs. ";
    }

    // ★ 生き物の形を幾何学的に固定
    const integrityInstruction = "Perfect normal anatomy, flawlessly separated individual elements with crisp clean cut-out outlines. Strictly two eyes per face, simplified charming decorative features, flawless geometry. ";

    const styleDetail = STYLE_PROMPTS[aiStyle] || '';
    const artistDetail = ARTIST_PROMPTS[artist] || '';

    const colorInstruction = (color && color !== 'おまかせ')
      ? `Main Color Theme: ${color}. Incorporate these colors naturally into the pattern.`
      : 'Natural and harmonious color palette chosen by the artist.';

    const enforcement = "Strictly non-photorealistic, pure graphic art, zero gradients, zero shadows, flawless clear massive separation between objects. NO fused elements.";

    const prompt = `${baseInstruction}${layoutInstruction}${integrityInstruction}

【Subject Motifs】
${englishMotif} (${motif})

${styleDetail ? `【Aesthetic Style】\n${styleDetail}\n` : ''}${artistDetail ? `【Artist Inspiration】\n${artistDetail}\n` : ''}【Color Palette】
${colorInstruction}

【Enforcement】
${enforcement}`;

    // 1. FAL (FLUX) エンジン生成（95%）
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

    // 2. OpenAI エンジン生成（5%の大当たり、またはFLUXフォールバック）
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
