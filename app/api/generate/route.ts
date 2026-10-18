import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // ★ 'itemType' も受け取るように追加
    const { motif, color, density, itemType } = await request.json();

    if (!motif || !color) {
      return NextResponse.json({ success: false, error: 'モチーフまたは地色が指定されていません。' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'APIキーが設定されていません。' }, { status: 500 });
    }

    // デジナ分析を反映したプロンプト構築（人物排除・背景排除）
    const stylePrompt = "Flat overhead shot, seamless textile pattern, vector graphic style.";
    const humanExclusion = "NO humans, NO faces, NO body parts, NO clothes being worn. Absolutely NO background. The image MUST consist ONLY of the repeating pattern motifs on the solid background color.";
    const layoutPrompt = density === '総柄（ぎっしり華やか）' 
      ? 'Densely packed, continuous all-over repeating pattern, rich and gorgeous.' 
      : 'Scattered motifs with elegant empty space, refined traditional layout.';

    const systemPrompt = `You are an expert digital textile designer for the "Monalisa" inkjet printer. 
Your ONLY task is to generate a flat, 2D seamless repeating pattern design based on the user's motifs.
${humanExclusion}
${stylePrompt}
Background color MUST be exactly: ${color}.
${layoutPrompt}`;

    const userPrompt = `Motifs: ${motif}`;

    // ★ここで選ばれた種類に合わせてサイズを切り替える
    let imageSize = '1024x1024'; // デフォルト
    if (itemType === 'hanhaba') {
      imageSize = '1792x1024'; // 横長（半幅帯用）
    } else if (itemType === 'tanmono') {
      imageSize = '1024x1792'; // 縦長（反物・京袋帯用）
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        n: 1,
        size: imageSize, // ★切り替えたサイズを指定
        quality: "hd",
        response_format: "b64_json"
      }),
    });

    const aiData = await response.json();

    if (!response.ok) {
      console.error('OpenAI Error Details:', aiData);
      return NextResponse.json({ success: false, error: `OpenAI APIエラー: ${aiData.error?.message || '不明なエラー'}` }, { status: response.status });
    }

    const base64Data = aiData.data[0].b64_json;
    const dataUrl = `data:image/png;base64,${base64Data}`;

    return NextResponse.json({ success: true, imageUrl: dataUrl });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'サーバー内部エラーが発生しました。' }, { status: 500 });
  }
}
