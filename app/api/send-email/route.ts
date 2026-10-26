import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { imageUrl, komonId, title } = await req.json();

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'iuchihisakatsu@gmail.com',
      subject: `【図案決定】${title} (${komonId})`,
      html: `
        <h2>小紋図案のお誂え注文が入りました</h2>
        <p><strong>図案銘:</strong> ${title}</p>
        <p><strong>識別ID:</strong> ${komonId}</p>
        <p><strong>高解像度画像URL:</strong></p>
        <p><a href="${imageUrl}" target="_blank">${imageUrl}</a></p>
        <div style="margin-top: 20px;">
          <img src="${imageUrl}" style="max-width: 400px; height: auto; border: 1px solid #ccc;" />
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error?.message || 'メール送信に失敗しました。' }, { status: 500 });
  }
}
