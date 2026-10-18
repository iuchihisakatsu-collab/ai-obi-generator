import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 画面側から渡された imageUrl（Blob URL）を受け取る
    const { imageUrl, komonId, title } = await req.json();

    if (!imageUrl || !komonId) {
      return NextResponse.json({ error: '必要なデータが不足しています。' }, { status: 400 });
    }

    const resendResponse = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'iuchihisakatsu@gmail.com', // 居内様のメールアドレス
      subject: `【ゴフクヤサンAI】新規お誂え注文が入りました（${komonId}）`,
      html: `
        <h2>ゴフクヤサン カスタムAI小紋ジェネレーターより</h2>
        <p>お客様がお誂えボタンを押しました。</p>
        <hr />
        <ul>
          <li><strong>図案ID：</strong> ${komonId}</li>
          <li><strong>図案銘：</strong> ${title || '（無題）'}</li>
        </ul>
        <h3>▼ モナリザ印刷用の超高解像度データ（ダウンロードリンク）</h3>
        <p>
          <a href="${imageUrl}" target="_blank" style="font-size:18px; color:blue;">ここをクリックしてダウンロード（Vercel Blob）</a>
        </p>
        <p style="font-size:12px; color:gray;">※リンク先の画像を「右クリックして保存」してください。データは印刷用の高精細サイズ（数MB）です。</p>
      `,
    });

    if (resendResponse.error) {
      console.error('Resend error:', resendResponse.error);
      return NextResponse.json({ error: 'メール送信に失敗しました。' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました。' }, { status: 500 });
  }
}
