import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, imageUrl, vendor } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: '画像URLが見つかりません。' }, { status: 400 });
    }

    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    let accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!shopifyDomain) {
      return NextResponse.json({ error: 'Shopifyのストア名（SHOPIFY_STORE_DOMAIN）が設定されていません。' }, { status: 500 });
    }

    // 画面手動コピー用トークンがない場合、クライアントIDとシークレットから自動取得
    if (!accessToken) {
      if (!clientId || !clientSecret) {
        return NextResponse.json({ 
          error: 'ShopifyのAPI設定（クライアントIDまたはシークレット）が不足しています。' 
        }, { status: 500 });
      }

      const tokenRes = await fetch(`https://${shopifyDomain}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenRes.ok) {
        const tokenErr = await tokenRes.text();
        console.error('Failed to get access token:', tokenErr);
        return NextResponse.json({ error: `トークン取得エラー: ${tokenErr}` }, { status: 500 });
      }

      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
    }

    const shopifyUrl = `https://${shopifyDomain}/admin/api/2026-10/products.json`;

    const productData = {
      product: {
        title: title || '無題の帯図案',
        body_html: '<p>妄想図案帖から自動連携されたデザインです。</p>',
        vendor: vendor || 'Printag Creator',
        status: 'draft', // 下書きとして作成
        tags: 'AI図案, Printag連携',
        images: [
          { src: imageUrl }
        ]
      }
    };

    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Shopify API Error:', data);
      return NextResponse.json({ error: `Shopifyエラー: ${JSON.stringify(data)}` }, { status: response.status });
    }

    return NextResponse.json({ success: true, product: data.product });

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: 'サーバー内部でエラーが発生しました' }, { status: 500 });
  }
}
