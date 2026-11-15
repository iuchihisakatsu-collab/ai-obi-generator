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
    let code = (searchParams.get('code') || '').trim().toUpperCase();

    // SNSで拡散済みの「X-」から始まるコードを、裏側で「IG-X-」として処理するための特別対応
    if (code.startsWith('X-')) {
      code = 'IG-' + code;
    }

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
  scarf: 'Premium luxury European silk scarf aesthetic. Vivid harmonious colors, extremely intricate decorative details.',
  galle: 'Inspired by Émile Gallé Art Nouveau cameo glass: poetic botanical naturalism, layered translucent textures resembling etched glass.',
  organic: 'Poetic organic textile design, handcrafted block print texture, gentle warm wabi-sabi imperfections.',
  toile: 'Traditional French Toile de Jouy textile, delicate monochromatic line-drawn pastoral scenes.',
  risograph: 'Modern risograph print textile, elegant ink layering, beautiful subtle misregistration.',
  woodblock: 'Antique Japanese woodblock print aesthetic, subtle washi paper texture.',
  morris: 'William Morris Arts and Crafts textile design, dense symmetrical botanical foliage.',
  yuzen: 'Add subtle Kyoto Yuzen traditional elegance, soft delicate watercolor transitions.'
};

const TAG_STYLE_DICTIONARY: Record<string, string> = {
  // 和の美術・古典様式
  '浮世絵': 'Authentic Edo-period Japanese Ukiyo-e woodblock print style, crisp sumi ink key-block outlines, Prussian blue (bero-ai) and traditional mineral pigments, subtle hand-printed bokashi shading on textured washi paper.',
  '鳥獣戯画風': 'Choju-jinbutsu-giga classical Japanese narrative ink scroll style, lively calligraphic sumi brush lines, expressive anthropomorphic animals in playful dynamic motion on antique paper.',
  '狩野派・障壁画': 'Kano school Japanese Momoyama folding-screen (byobu) painting aesthetic, bold heroic brushwork, dramatic pine branches, stylized clouds, and luminous gold leaf (kinpaku) accents.',
  '光琳・琳派': 'Rinpa school (Ogata Korin) Japanese decorative painting aesthetic, bold stylized organic forms, vivid flat mineral colors, gold and silver foil accents, tarashikomi ink pooling.',
  '若冲風': 'Ito Jakuchu hyper-detailed Edo painting style, intricate plumage and botanical micro-detail, vibrant jewel-like mineral colors, dramatic contrast.',
  '北斎風': 'Katsushika Hokusai dramatic dynamic composition, bold Prussian blue waves, expressive rhythmic linework, iconic Edo ukiyo-e woodblock mastery.',
  '広重風': 'Utagawa Hiroshige poetic atmospheric ukiyo-e print style, serene bokashi gradations, refined seasonal lyricism.',
  '江戸小紋': 'Traditional Edo Komon ultra-fine stencil-dyed micro pattern, crisp geometric precision, refined two-tone artisan craftsmanship.',
  '有職文様': 'Yusoku monyo aristocratic Heian court textile pattern, noble symmetrical medallions, dignified classical Japanese geometric harmony.',
  '更紗（バティック）': 'Exotic antique Sarasa and Javanese batik textile aesthetic, intricate hand-drawn wax-resist botanical and arabesque motifs, rich earthy natural dyes.',
  '夢二浪漫': 'Takehisa Yumeji Taisho Romanticism poetic illustration style, melancholic graceful lines, muted nostalgic color palette, lyrical retro elegance.',
  '大正ロマン': 'Taisho Roman early 20th-century Japanese modernist kimono aesthetic, bold fusion of Japanese motifs with Art Nouveau geometry and stained-glass jewel tones.',
  '昭和レトロ': 'Showa-era vintage Japanese graphic design, nostalgic mid-century kissaten cafe poster charm, warm slightly weathered print colors.',
  '和モダン': 'Contemporary Japanese modern textile design, clean minimalist composition blending traditional motifs with sleek modern graphic balance.',

  // 西洋・工芸様式
  'モリス風': 'William Morris Arts and Crafts textile design, dense symmetrical botanical foliage, intertwined acanthus leaves and wildflowers, heritage tapestry richness.',
  'ガレ風': 'Émile Gallé Art Nouveau cameo glass aesthetic, poetic botanical naturalism, layered translucent organic silhouettes.',
  'ミュシャ風': 'Alphonse Mucha Art Nouveau decorative panel aesthetic, flowing whiplash contour lines, ornate floral halos, harmonious gold-accented elegance.',
  'アール・ヌーヴォー': 'Classic Art Nouveau ornamental textile style, sinuous organic curves, stylized irises and vines, graceful fin-de-siècle elegance.',
  'アール・デコ': '1920s Art Deco geometric luxury pattern, sunburst rays, stepped symmetry, sleek metallic gold and bold contrasting planes.',
  'トワルドジュイ': 'Traditional French Toile de Jouy copperplate-printed fabric, delicate monochromatic engraved pastoral and botanical vignettes on a clean light ground.',
  '北欧風': 'Scandinavian mid-century modern textile design, clean flat organic shapes, balanced negative space, Nordic folk simplicity.',
  'アンティーク': 'Vintage European antique textile aesthetic, timeless heirloom patina, classical engraving and aged fabric elegance.',

  // 墨絵・染織・画材技法
  '墨絵・水墨画': 'Traditional Japanese Sumi-e ink wash painting, expressive calligraphic brushstrokes, wet-on-wet ink diffusion, subtle tonal ink gradations (notan) on textured washi paper.',
  '墨線画（白描）': 'Hakubyo traditional Japanese fine monochrome ink line drawing, pure crisp sumi brushwork with high-contrast line artistry.',
  '友禅ぼかし': 'Kyoto Yuzen silk dyeing technique, delicate hand-painted resist outlines (itome) with soft luminous watercolor bokashi color gradations.',
  '江戸型染め': 'Traditional Edo Katazome stencil dyeing, bold crisp white resist lines, deep natural indigo and mineral pigments, artisanal hand-dyed clarity.',
  '絞り染め・辻が花風': 'Tsujigahana and Shibori tie-dye textile aesthetic, organic soft-edged dye bleeds, delicate hand-drawn ink details over tied-and-dyed floral forms.',
  'ろうけつ染め': 'Traditional Roketsu-zome wax-resist batik dyeing, characteristic fine crackle lines (hibi) and rich layered dye penetration.',
  '日本画・岩絵具': 'Nihonga traditional Japanese mineral pigment painting, matte velvety iwa-enogu texture, refined mineral luster, delicate gofun white highlights.',
  '蒔絵・漆芸風': 'Japanese Maki-e gold lacquerware aesthetic, deep glossy urushi black background with radiant gold and silver powder relief motifs.',
  '木版画': 'Hand-carved woodblock print aesthetic, crisp carved relief edges, subtle woodgrain ink impression on handmade paper.',
  '銅版画・エッチング': 'Antique copperplate etching and engraving, fine cross-hatching lines, intricate scientific and classical printmaker detail.',
  '水彩画': 'Delicate transparent watercolor painting on textured paper, soft luminous pigment washes and gentle wet-edge blooms.',
  'ペン画': 'Fine nib ink pen illustration, crisp detailed linework and delicate stippling/hatching textures.',
  '切り絵・影絵': 'Kirie Japanese paper-cutting and silhouette art, razor-sharp layered cut-paper shapes, dramatic positive-negative contrast.',
  'ステンドグラス': 'Luminous stained-glass mosaic aesthetic, bold dark leading lines framing jewel-like translucent colored glass segments.',
  'リソグラフ風': 'Contemporary Risograph soy-ink print aesthetic, tactile halftone grain, vibrant spot colors with subtle artistic ink overprint.',
  '西陣織・金襴風': 'Nishijin-ori and Kinran brocade woven textile aesthetic, intricate woven silk threads, shimmering gold thread (kinshi) highlights, opulent loom-woven texture.',
  '刺繍風': 'Traditional Japanese Nihon-shishu silk embroidery aesthetic, lustrous satin-stitch silk threads, tactile dimensional needlework relief.',

  // 人気モチーフ強調
  '金魚・鯉': 'Graceful swimming Japanese goldfish (kingyo) and Nishikigoi koi carp with flowing fins and subtle water ripples.',
  '蝶': 'Elegant Japanese swallowtail butterflies (ageha) with intricate wing patterns.',
  '桜': 'Refined Japanese cherry blossoms (sakura) with delicate petals.',
  '菊': 'Noble Japanese chrysanthemums (kiku) with layered petals.',

  // 配色・トーン
  'くすみカラー': 'Muted dusty desaturated morandi color palette, sophisticated smoky understated elegance.',
  'パステル': 'Soft luminous pastel color palette, gentle airy tints, refined delicate lightness.',
  'ビビッド': 'Bold vivid jewel-toned color palette, striking high-saturation chromatic contrast.',
  '渋め・粋': 'Edo-chic understated dark and earthy palette (indigo, charcoal, moss, rust), mature sophisticated restraint.',
  'セピア': 'Warm nostalgic sepia-toned monochrome and antique brown palette.',
  'モノトーン': 'Refined monochrome black, white, and charcoal grayscale palette with high graphic clarity.',
  '金銀彩アクセント': 'Accented with shimmering metallic gold leaf (kinpaku) and silver foil (ginpaku) highlights.'
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
      tags = [],
      engine = 'flux',
      paymentMode = 'free',
      premiumCode = '',
      patternScale: explicitScale
    } = body;

    if (!motif) return NextResponse.json({ error: 'モチーフを指定してください。' }, { status: 400 });

    const isPremium = paymentMode === 'premium' || engine === 'openai_premium' || (engine === 'openai' && Boolean(premiumCode));
    const isFlux = !isPremium && engine === 'flux';
    const isOpenAiFree = !isPremium && (engine === 'openai_free' || engine === 'openai');

    let code = (premiumCode || '').trim().toUpperCase();
    
    // SNSで拡散済みの「X-」から始まるコードを、裏側で「IG-X-」として処理するための特別対応
    if (code.startsWith('X-')) {
      code = 'IG-' + code;
    }

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
          return NextResponse.json({ error: '本日の無料スケッチ（FLUX）枠（15回）を使い切りました。明日またお試しください。' }, { status: 429 });
        }
        await kv.incr(fluxKey);
        await kv.expire(fluxKey, 86400);

      } else if (isOpenAiFree) {
        const freeKey = `usage:openaifree:${ip}:${today}`;
        const freeCount = (await kv.get<number>(freeKey)) || 0;
        if (freeCount >= 1) {
          return NextResponse.json({ error: '本日の「丁寧に作る（無料枠）」はすでに利用済みです。続きはチケットコードをご利用ください。' }, { status: 429 });
        }
        await kv.incr(freeKey);
        await kv.expire(freeKey, 86400);

      } else {
        return NextResponse.json({ error: '不正なエンジン指定です。' }, { status: 400 });
      }
    }

    const cleanMotifForTranslation = motif
      .replace(/。?雰囲気・タッチ[：:][^。\n]*/g, '')
      .replace(/。?柄の大きさ[：:][^\n]*/g, '')
      .replace(/\(tiny delicate repeating motifs[^\)]*\)/gi, '')
      .replace(/\(medium-scale repeating motifs[^\)]*\)/gi, '')
      .replace(/\(large bold prominent motifs[^\)]*\)/gi, '')
      .trim();

    // 選択されたタグ（配列 + motif文字列内のフォールバック検出）を統合して専門英語指示へ変換
    const activeTagSet = new Set<string>(Array.isArray(tags) ? tags : []);
    for (const key of Object.keys(TAG_STYLE_DICTIONARY)) {
      if (motif.includes(key)) {
        activeTagSet.add(key);
      }
    }
    const activeTags = Array.from(activeTagSet);
    const tagDirectives = activeTags
      .map((t) => TAG_STYLE_DICTIONARY[t])
      .filter(Boolean)
      .join(' ');

    const englishMotif = await translateToEnglish(cleanMotifForTranslation);
    
    // 1. 柄の向き・構成モード（お太鼓・ワンポイント / スカーフ額縁 / 四方総柄 / 一方向総柄）の判定
    const isOtaiko = density.includes('お太鼓') || density.includes('ワンポイント') || density.includes('CENTERED');
    const isScarfMode = !isOtaiko && !density.includes('四方') && (
      itemType === 'scarf' ||
      density.includes('額縁') ||
      density.includes('スクエア') ||
      motif.includes('スカーフ') ||
      motif.toLowerCase().includes('scarf')
    );
    const isShiho = !isScarfMode && !isOtaiko && (
      density.includes('四方') ||
      density.includes('ALL-OVER') ||
      density.includes('天地無用') ||
      itemType === 'kimono'
    );
    const isUpright = !isScarfMode && !isOtaiko && !isShiho && (
      density.includes('一方向') ||
      density.includes('UPWARD') ||
      density.includes('上向き')
    );

    // 2. 柄の大きさ（Scale）判定
    let detectedScale: 'small' | 'medium' | 'large' = 'medium';
    const rawScale = (explicitScale || '').toLowerCase();
    if (rawScale === 'small' || rawScale === 'fine' || motif.includes('細かい') || motif.includes('tiny delicate') || motif.includes('micro')) {
      detectedScale = 'small';
    } else if (rawScale === 'large' || motif.includes('大きい') || motif.includes('large bold') || motif.includes('大柄')) {
      detectedScale = 'large';
    }

    let scaleKeyword = '';
    let negativeScalePrompt = '';
    if (isOtaiko) {
      if (detectedScale === 'small') {
        scaleKeyword = '[SCALE: REFINED SMALL ONE-POINT FOCAL MOTIF] A single compact, delicate focal motif (approx. 25% of canvas width) centered cleanly on a wide, uninterrupted solid background.';
      } else if (detectedScale === 'large') {
        scaleKeyword = '[SCALE: BOLD STATEMENT ONE-POINT FOCAL MOTIF] A single large, dramatic focal motif (approx. 65% of canvas width) centered prominently on a clean solid background.';
      } else {
        scaleKeyword = '[SCALE: BALANCED ONE-POINT FOCAL MOTIF] A single harmonious focal motif (approx. 45% of canvas width) centered cleanly on a generous solid background.';
      }
      negativeScalePrompt = 'repeating pattern, seamless repeat, tiled pattern, grid of motifs, all-over pattern, scattered multiple copies, wallpaper repeat, edge-to-edge clutter';
    } else if (isScarfMode) {
      scaleKeyword = '[COMPOSITION: SQUARE SILK SCARF CARRÉ] Ornate decorative border frame along all four edges with a balanced central medallion composition.';
      negativeScalePrompt = 'seamless tile, cut-off edges, infinite repeat pattern';
    } else if (detectedScale === 'small') {
      scaleKeyword = '[SCALE: ULTRA-DENSE MICRO-KOMON] Miniature delicate scattered motifs (15mm scale), dozens of tiny repeating elements densely filling the surface without giant focal hero elements.';
      negativeScalePrompt = 'giant motifs, oversized subjects, single hero illustration, close-up, large empty space, huge animal, massive single object, portrait composition';
    } else if (detectedScale === 'large') {
      scaleKeyword = '[SCALE: BOLD STATEMENT MACRO PATTERN] Large prominent artistic motifs (100mm+ scale), bold impactful composition with striking presence.';
      negativeScalePrompt = 'tiny micro pattern, crowded ditsy print, dozens of small dots, miniature clutter';
    } else {
      scaleKeyword = '[SCALE: BALANCED CLASSIC KIMONO PATTERN] Medium-scale harmonious repeating motifs (40mm-50mm scale), classic Japanese kimono rhythm.';
      negativeScalePrompt = 'giant single portrait, micro dot clutter, single focal hero';
    }

    let directionHeading = '';
    let directionEnforcement = '';
    let negativeDirectionPrompt = '';

    if (isScarfMode) {
      directionHeading = 'LUXURY SILK SCARF (CARRÉ) FRAMED COMPOSITION';
      directionEnforcement = 'Perfect square framed composition with solid outer margin and central ornate medallion. DO NOT tile.';
      negativeDirectionPrompt = 'repeating tiles, cut-off border, scattered small dots';
    } else if (isOtaiko) {
      directionHeading = 'SINGLE CENTERED ONE-POINT FOCAL PANEL (NON-SEAMLESS)';
      directionEnforcement = `CRITICAL MANDATORY COMPOSITION:
Draw ONE single cohesive focal motif (or single unified focal cluster) placed cleanly in the center of the square canvas, facing upright.
Surround the single focal motif with wide, clean, uninterrupted solid background color margin on all sides.
DO NOT tile, DO NOT repeat across the edges, DO NOT scatter multiple copies across the background.`;
      negativeDirectionPrompt = 'repeating tiles, seamless repeat, tiled background, multiple scattered copies, upside down, all-over pattern';
    } else if (isShiho && !isUpright) {
      // ★ 四方柄（天地無用）：AIの直立バイアスを完全に破壊する強烈な指示
      directionHeading = 'OMNIDIRECTIONAL MULTI-DIRECTIONAL TOSSED PATTERN (CHIRA-SHI)';
      directionEnforcement = `CRITICAL MANDATORY ORIENTATION:
Every motif MUST be randomly rotated and tossed in ALL possible angles (0°, 90°, 180°, 270°, and diagonals).
AT LEAST HALF OF ALL MOTIFS MUST BE COMPLETELY UPSIDE-DOWN (INVERTED 180 DEGREES) AND SIDEWAYS.
Do NOT draw animals or objects standing straight up.
Tumble and scatter the motifs chaotically so the pattern looks identical whether viewed right-side-up, upside-down, or from the side. Zero top, zero bottom.`;
      negativeDirectionPrompt = 'all upright, all facing up, single direction, uniform orientation, upright standing animals, standing upright, vertically aligned, heads up only';
    } else {
      // ★ 一方向（上向き）
      directionHeading = 'STRICT ONE-DIRECTIONAL UPRIGHT REPEAT PATTERN';
      directionEnforcement = `CRITICAL MANDATORY ORIENTATION:
All motifs MUST face straight UP towards the top edge. Perfect vertical upright alignment, bottom-to-top orientation. No inverted motifs.`;
      negativeDirectionPrompt = 'upside down, inverted, sideways, tilted, upside down animals, random rotation';
    }

    const tasteDetail = TASTE_PROMPTS[tasteMode] || TASTE_PROMPTS['katazome'];
    const styleDetail = STYLE_PROMPTS[aiStyle] || '';

    const isSumiMonochrome =
      (activeTags.includes('墨絵・水墨画') || activeTags.includes('墨線画（白描）')) &&
      (!color || color === 'おまかせ');
    const colorInstruction = isSumiMonochrome
      ? 'Traditional monochrome sumi black ink washes and subtle grayscale tonal gradations on natural off-white/cream washi paper ground.'
      : (color && color !== 'おまかせ')
        ? `Main Color Theme: ${color}.`
        : 'Harmonious mature color palette.';

    const allowsPastel = activeTags.includes('パステル');
    const allowsGradation = activeTags.some((t) =>
      ['墨絵・水墨画', '友禅ぼかし', '絞り染め・辻が花風', '水彩画', 'ガレ風', '広重風', '浮世絵', '日本画・岩絵具', 'ろうけつ染め'].includes(t)
    );

    const pastelRule = allowsPastel ? '' : 'NO pastel, ';
    const gradientRule = allowsGradation
      ? 'Allow authentic artisanal ink wash, bokashi dye gradation, or watercolor pigment transitions matching the specified technique, while keeping a flat 2D surface.'
      : 'Zero gradients, zero 3D drop shadows.';

    const enforcement = `【STRICT QUALITY & FORMAT ENFORCEMENT】
Strictly MATURE, SOPHISTICATED, ARTISAN-CRAFTED high-end kimono textile aesthetic.
ABSOLUTELY NO kawaii, ${pastelRule}NO chibi, NO childish, NO fluffy, NO cartoon, NO anime, NO fairy tale.
${gradientRule} Top-down 2D flat orthogonal surface only. NO humans, NO mockups, NO 3D perspective.
Negative constraints: ${negativeScalePrompt}, ${negativeDirectionPrompt}, sweet cute elements, childish doodle.`;

    const formatLine = isOtaiko
      ? 'Flat 2D non-seamless single centered one-point placement artwork on a clean solid background for Japanese obi drum / tote bag front panel.'
      : isScarfMode
        ? 'Flat 2D non-seamless square scarf panel artwork with ornate border frame.'
        : 'Flat 2D continuous seamless textile pattern for Japanese kimono and obi fabric.';

    // FLUXが最も忠実に従うよう、先頭に「向き」と「サイズ」をドカンと配置
    const prompt = `[${directionHeading}]
${directionEnforcement}
${scaleKeyword}

${formatLine}

【Motifs】
${englishMotif} (${cleanMotifForTranslation})

【Artistic Style & Technique】
${tagDirectives ? `${tagDirectives} ` : ''}${tasteDetail}
${styleDetail ? `【Style Accent】\n${styleDetail}\n` : ''}
【Color】
${colorInstruction}

${enforcement}`;

    // FLUX 生成処理
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

    // OpenAI 高精細生成
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
