// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 15スタイル専用の英語プロンプト辞書
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
  anime: 'Modern Japanese pop anime graphic pattern, crisp cel-shaded clean line art, vibrant flat graphic colors, stylish Harajuku street fashion textile, NO humans.',
  lollipop: 'Lollipop kawaii fancy aesthetic, sweet pastel candy colors, playful 80s fancy pop toy motifs, cheerful dreamy repeating elements.',
  cyberpunk: 'Cyberpunk futuristic tech aesthetic, glowing neon accents against dark background, intricate geometric circuit lines, sleek high-tech sci-fi kimono pattern.',
  steampunk: 'Steampunk Victorian aesthetic, intricate brass, bronze and copper mechanical gears, antique clockwork cogs, Victorian industrial engraving, rich warm metallic sepia.',
  retrofuturism: '1960s space age retro-futurism, mid-century atomic starbursts, vintage sci-fi geometric shapes, nostalgic cosmic graphic layout.'
};

// 名画・巨匠18人の専用プロンプト辞書
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

    let baseInstruction = "Flat overhead shot, 2D seamless repeating textile graphic design. High-end digital textile printing. High resolution, crisp details, vivid color separation, no halftone dots. ";
    
    let layoutInstruction = "";
    if (density.includes('ワンポイント') || density.includes('お太鼓柄')) {
      baseInstruction = "Flat overhead shot, 2D non-seamless graphic illustration. ";
      layoutInstruction = "NON-SEAMLESS. A single central one-point motif illustration placed exactly in the middle. Abundant negative space around the central element.";
    } else if (density.includes('四方柄')) {
      layoutInstruction = "True omnidirectional / non-directional toss pattern (shihō-gara). Motifs are randomly and dynamically rotated at various angles (some upright, some inverted 180°, tilted 45°, 90°). ABSOLUTELY NO uniform upright orientation.";
    } else {
      layoutInstruction = "Scattered motifs with elegant negative space, refined balanced layout, well-spaced floating elements (Tobigara).";
    }

    // スタイルと巨匠のプロンプトを合成
    const styleDetail = STYLE_PROMPTS[aiStyle] || '';
    const artistDetail = ARTIST_PROMPTS[artist] || '';

    const colorInstruction = (color && color !== 'おまかせ')
      ? `Main Color Theme: ${color}. Incorporate these colors naturally into the palette.`
      : 'Natural and harmonious color palette chosen by the artist.';

    const negativePrompt = "NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO drop shadows, NO photographic blur, NO realistic fabric wrinkles, NO backgrounds.";

    const prompt = `${baseInstruction}
${layoutInstruction}

【Subject Motifs】
${motif}

【Style & Aesthetic】
${styleDetail}
${artistDetail}

【Color Palette】
${colorInstruction}

【Strict Restrictions】
${negativePrompt}`;

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
