import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Vercelに登録した鍵を呼び出し
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { imageBase64, komonId, title } = await request.json();

    if (!imageBase64 || !komonId) {
      return NextResponse.json({ success: false, error: 'データが不足しています' }, { status: 400 });
    }

    // 画像のBase64ヘッダー部分（data:image/png;base64,など）を取り除いてデータ化
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend初期テスト用送信元
      to: 'info@gofukuyasan.com', // ★ここを変更しました！
      subject: `【AI小紋】新規図案データ受信：${komonId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #8b1e2a; border-bottom: 2px solid #8b1e2a; padding-bottom: 8px;">AI小紋ジェネレーターから新規データを受信しました</h2>
          <p><strong>図案シリアル番号：</strong> <span style="font-size: 16px; font-weight: bold; background: #eee; padding: 2px 6px;">${komonId}</span></p>
          <p><strong>図案銘：</strong> ${title || '（無題）'}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 13px; color: #666;">※添付ファイルに高解像度PNG画像が含まれています。Makeshopの注文（シリアル番号）と突き合わせて、モナリザ捺染のプリントデータ作成にご使用ください。</p>
        </div>
      `,
      attachments: [
        {
          filename: `${komonId}.png`,
          content: base64Data,
        },
      ],
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ success: false, error: 'メール送信に失敗しました' }, { status: 500 });
  }
}
