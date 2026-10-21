import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import OpenAI from 'openai';

// 常に最新の生成結果を返すため、Next.jsのキャッシュを無効化
export const dynamic = 'force-dynamic';

// OpenAI APIクライアントの初期化（環境変数のAPIキーを使用）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. フロントエンド（画面）から送信された設定パラメータを受け取る
    const { motif, color, density, itemType } = await req.json();

    // 必須項目の入力チェック
    if (!motif || !color) {
      return NextResponse.json({ error: 'モチーフまたは地色が指定されていません。' }, { status: 400 });
    }

    // 2. 出力する画像サイズと縦横比（アスペクト比）の判定
    let imageSize: "1024x1024" | "1792x1024" | "1024x1792" = '1024x1024';
    let ratioInstruction = '正方形のテキスタイルデザイン';

    if (itemType === 'hanhaba') {
      // 半幅帯向け（横長 16:9）
      imageSize = '1792x1024';
      ratioInstruction = '横長（16:9比率）の帯用テキスタイルデザイン';
    } else if (itemType === 'tanmono') {
      // 反物・着尺向け（縦長 9:16）
      imageSize = '1024x1792';
      ratioInstruction = '縦長（9:16比率）の反物・着尺用テキスタイルデザイン';
    }

    // 3. 基本となるテキスタイル印刷用の前提プロンプト
    // （エプソン製モナリザ印刷機、シルク印刷適性、網点除去、高解像度などを英語で指定）
    let baseInstruction = "Flat overhead shot, 2D textile graphic design. Intended for Epson Monna Lisa high-end digital textile printing on silk. High resolution, crisp details, vivid color separation, no halftone dots. ";
    
    // 4. 「柄の密度・配置」に応じたプロンプト分岐
    let layoutInstruction = "";

    if (density === 'お太鼓柄（ワンポイント/1枚絵）') {
      // 【お太鼓柄】シームレスにせず、中央に大きくワンポイントで配置
      layoutInstruction = "NON-SEAMLESS. A single, large, central one-point motif illustration placed exactly in the middle of the solid background. This is a standalone picture (Otaiko style), NOT a repeating pattern. Do NOT repeat the motif. Leave abundant solid negative space around the central element.";
    } else if (density === '四方柄・散らし柄') {
      // 【四方柄・散らし柄】裁断しやすさを重視。上下方向をなくし、回転・多方向配置を強制
      baseInstruction += "Perfectly seamless repeating pattern. ";
      layoutInstruction = "STRICTLY NON-DIRECTIONAL TOSSED PATTERN. Motifs MUST be rotated randomly at completely different angles (e.g., 90 degrees, 180 degrees, 270 degrees, upside down, sideways). Ensure the motifs are scattered facing multiple different directions. Absolutely NO clear top or bottom. Ignore gravity.";
    } else if (density === '総柄（ぎっしり華やか）') {
      // 【総柄】余白を極力減らし、柄をぎっしり敷き詰めたリピート
      baseInstruction += "Perfectly seamless repeating pattern. ";
      layoutInstruction = "Continuous all-over repeating pattern, densely packed motifs, rich and gorgeous layout with minimal negative space.";
    } else {
      // 【飛び柄（デフォルト）】伝統的な着物小紋のように、上品な余白（地色）を残した配置
      baseInstruction += "Perfectly seamless repeating pattern. ";
      layoutInstruction = "Scattered motifs with elegant negative space, refined traditional Japanese layout, well-balanced floating elements.";
    }

    // 5. テイスト・様式の追加補正（キーワードが含まれていた場合に英語で追加指定）
    let tunedStyle = 'Masterpiece, highly detailed digital textile design. ';
    
    if (motif.includes('浮世絵')) tunedStyle += 'Ukiyo-e woodblock print aesthetic, flat bold colors, precise ink outlines, Edo period traditional art style. ';
    if (motif.includes('京友禅')) tunedStyle += 'Kyo-Yuzen dyeing style, delicate line art, elegant and refined motifs, soft gradation, subtle gold leaf accents. ';
    if (motif.includes('水彩画')) tunedStyle += 'Soft pastel watercolor wash, delicate color blending, transparent and gentle texture. ';
    if (motif.includes('油絵')) tunedStyle += 'Thick impasto oil painting style, visible rich brushstrokes, expressive texture, deep color saturation. ';
    if (motif.includes('アールヌーヴォー')) tunedStyle += 'Art Nouveau style, Alphonse Mucha aesthetic, elegant flowing curves, intricate floral ornaments. ';
    if (motif.includes('アールデコ')) tunedStyle += 'Art Deco style, geometric elegance, symmetrical balance, 1920s glamour, gold and black contrasts. ';
    if (motif.includes('ミッドセンチュリー')) tunedStyle += 'Mid-century modern textile, organic abstract shapes, retro color palette, minimal and stylish. ';
    if (motif.includes('70sサイケ')) tunedStyle += '70s psychedelic pop art, vibrant contrasting colors, wavy hypnotic patterns, retro groovy vibe. ';
    if (motif.includes('大正ロマン') || motif.includes('昭和レトロ')) tunedStyle += 'Taisho Roman retro style, nostalgic Japanese aesthetic, Takehisa Yumeji style, vintage modern crossover. ';
    if (motif.includes('スチームパンク')) tunedStyle += 'Steampunk aesthetic, brass clockwork, gears and cogs, Victorian industrial fantasy, metallic accents. ';
    if (motif.includes('ゴスロリ')) tunedStyle += 'Gothic Lolita aesthetic, dark elegant fantasy, intricate black lace borders, decadent beauty, mysterious mood. ';
    if (motif.includes('ゆめかわいい')) tunedStyle += 'Dreamy kawaii style, pastel color palette, magical girl aesthetic, sparkling stars, soft fluffy texture. ';

    // 6. ネガティブ指示（不要な要素の完全排除）
    // （人間、顔、衣服の着用写真、布のしわ、3Dの陰影、背景風景などを禁止して平面データ化）
    const negativePrompt = "Absolutely NO humans, NO faces, NO body parts, NO clothing items being worn. NO 3D perspective, NO fabric folds, NO wrinkles, NO lighting/shadow effects, NO background scenes. The image MUST consist ONLY of the requested motifs on the solid background color.";

    // 7. 完成プロンプトの組み立て
    const prompt = `${baseInstruction}\n${layoutInstruction}\n\n【Textile Requirements】\nMotifs: ${motif}\nBackground Color: Solid ${color}\nFormat: ${ratioInstruction}\n\n【Art Style & Texture】\n${tunedStyle}\n\n【Strict Restrictions】\n${negativePrompt}`;

    // 8. OpenAI API（画像生成モデル）へリクエスト
    const response = await openai.images.generate({
      model: "gpt-image-2.5-sunburst", 
      prompt: prompt,
      n: 1,
      size: imageSize,
      quality: "high", 
      output_format: "png",
    });

    // 9. 生成されたBase64画像データを取得
    const base64Image = response.data?.[0]?.b64_json;
    if (!base64Image) throw new Error('画像データの取得に失敗しました。');

    // 10. 画像を一時的なバッファに変換し、ファイル名を生成
    const buffer = Buffer.from(base64Image, 'base64');
    const filename = `komon-${Date.now()}.png`;

    // 11. Vercel Blob（クラウドストレージ）にアップロードして永続化
    const blob = await put(filename, buffer, { 
      access: 'public', 
      contentType: 'image/png' 
    });

    // 12. 保存された画像の公開URLをフロントエンドに返却
    return NextResponse.json({ 
      imageUrl: blob.url, 
      blobUrl: blob.url
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error: any) {
    // エラー発生時のログ出力とエラーメッセージ返却
    console.error('API Error:', error);
    return NextResponse.json({ error: error?.message || '通信エラーが発生しました。' }, { status: 500 });
  }
}
