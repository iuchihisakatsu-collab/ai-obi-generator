import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop') || process.env.SHOPIFY_STORE_DOMAIN;
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

  // 1. 認可コードがない場合：Shopifyの承認画面へ自動でジャンプしてコードを取りに行く
  if (!code) {
    if (!shop || !clientId) {
      return new NextResponse('ストア名またはSHOPIFY_CLIENT_IDが未設定です。', { status: 400 });
    }
    const redirectUri = encodeURIComponent(`https://${url.host}/api/shopify/callback`);
    const scopes = 'write_products,read_products';
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
    return NextResponse.redirect(authUrl);
  }

  // 2. 認可コードを受け取ったら、Shopifyからアクセストークンを取得
  if (!clientId || !clientSecret) {
    return new NextResponse('SHOPIFY_CLIENT_ID または SHOPIFY_CLIENT_SECRET が設定されていません。', { status: 500 });
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (!tokenRes.ok || !data.access_token) {
      return new NextResponse(`トークン取得エラー: ${JSON.stringify(data)}`, { status: 500 });
    }

    const token = data.access_token;

    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <title>Shopify トークン取得成功</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0f172a; color: #f8fafc; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; max-width: 600px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.5); text-align: center; }
          h1 { color: #10b981; font-size: 1.5rem; margin-top: 0; }
          .token-box { background: #000; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 1.1rem; word-break: break-all; color: #38bdf8; border: 1px solid #334155; margin: 1.5rem 0; user-select: all; }
          button { background: #2563eb; color: white; border: none; padding: 0.8rem 1.8rem; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 1rem; }
          button:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🎉 トークン取得に成功しました！</h1>
          <p>以下のアクセストークンをコピーして、Vercelの <strong>SHOPIFY_ACCESS_TOKEN</strong> に設定してください。</p>
          <div class="token-box" id="token">${token}</div>
          <button onclick="navigator.clipboard.writeText('${token}'); alert('コピーしました！');">アクセストークンをコピー</button>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    return new NextResponse(`サーバーエラー: ${err.message}`, { status: 500 });
  }
}
