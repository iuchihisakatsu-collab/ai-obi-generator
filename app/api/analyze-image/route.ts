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
          content: `あなたは老舗染物工場直結のテキスタイルデザイナー・図案スキャナーです。
ユーザーから提供された画像から、人物、顔、服の立体的な縫製・シワ、背景、影を完全に無視し、布地の「平面パターン（テキスタイル図案）」に必要なエッセンスのみを抽出してください。

【厳格な著作権・商標ガードレール】
- 特定のキャラクター、登録商標、有名ブランド名、特定の美術作品の固有名詞は一切出力に含めないでください。
- 普遍的な工芸・美術・織物用語（例: 幾何学文様、植物更紗、水彩ぼかし、版画調、アールデコ調など）に抽象化して変換してください。

【出力形式】
以下のJSONフォーマットのみを返してください。
{
  "motif": "モチーフ（形・配置・密度。例: 舞い散る桜と流水の幾何学パターン、余白を生かした飛び柄）",
  "color": "主要配色（2〜3色程度。例: 藍色と生成り、灰桜と墨色）",
  "texture": "質感・タッチ（例: 水彩のにじみ調、マットな切り絵風、掠れのある線画）",
  "prompt": "AI妄想モードに直接入力できる推奨プロンプト（30〜60文字程度）"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'この画像から、着物・帯の図案として再構築するための柄・色・タッチを抽出してください。',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'low', // 爆速＆激安（1回約0.02円）
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
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
