// app/api/analyze-image/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: '画像URLが必要です' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは老舗染物工場直結の専属テキスタイル図案スキャナーです。
画像内の人物、顔、服のシワや縫製、立体的な陰影、写真の背景は完全に無視し、布地の「平面パターン（テキスタイル図案）」のみを極めて精密にスキャン・言語化してください。

【重要：曖昧・抽象表現の禁止】
「上品な雰囲気」「抽象的な文様」「美しい色合い」といった抽象的な表現は一切禁止します。画像に見えている要素を客観的・具体的に名指ししてください。

1. 柄（モチーフ・形状・配置密度）:
   - 描かれている具体的な花、植物、動物、幾何学図形の種類と形状（例: 直径約5cmの白椿、八重咲きの花弁、細い金色の流水紋）
   - 主役と脇役のバランス、配置パターン（総柄、飛び柄、市松配置など）と余白の割合
2. 配色（地色とパーツごとの配色）:
   - 全体のベースとなる地色（例: 深い濃藍色、黄みを帯びた練色）
   - モチーフごとの具体的な色、差し色、輪郭線の色（例: 花弁は真紅、葉は青磁色、縁取りに金泥）
3. 質感・筆致・技法:
   - 線の描き込み（はっきりした黒の均一な輪郭線、かすれた毛筆調、輪郭線のない水彩ぼかし、切り絵のようなエッジ）
   - 面の塗り（均一なベタ塗り、手捺染風の版ズレ、微細なグラデーション、木版調の木目感）
4. プロンプト:
   - AI妄想モードに入力して、この画像の持つ密度や空気感をそっくりそのまま再現できる、具体的で解像度の高いプロンプト（80〜120文字程度）。

【商標ガードレール】
特定のキャラクター名、有名ブランド名、特定の作家名の固有名詞は普遍的な美術・工芸用語に置き換えてください。

【出力形式】
以下のJSONフォーマットのみを返してください。
{
  "motif": "具体的なモチーフの名称・形状・配置（詳細に）",
  "color": "地色と各モチーフの具体的な配色（詳細に）",
  "texture": "筆致・輪郭線・描画タッチの技法（詳細に）",
  "prompt": "再現性の高い具体的な推奨プロンプト（80〜120文字）"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'この画像から、着物・帯の図案として忠実に再構築できるよう、柄の細部、配色、線のタッチを極めて具体的に抽出してください。',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // ★ 細部の描き込み・テクスチャまで読み取るため high に設定
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AIからの解析結果が空でした');
    }

    const data = JSON.parse(content);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Analyze Image Error:', err);
    return NextResponse.json(
      { error: err.message || '画像解析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
