import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. フロントエンド（page.tsx）から送られてきたデータを受け取る
    const body = await req.json();
    const { title, imageUrl, vendor } = body;

    // 必須データが足りない場合はエラーを返す
    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'タイトルまたは画像URLが不足しています' }, { status: 400 });
    }

    // 2. Vercelに登録したShopifyの合鍵（環境変数）を読み込む
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json({ error: 'ShopifyのAPI設定（環境変数）が不足しています。Vercelの設定を確認してください。' }, { status: 500 });
    }

    // 3. Shopifyの「商品登録用API」のURLを作成
    // ※ 2024-01 の部分はAPIバージョンです。基本はこのままで動きます。
    const shopifyUrl = `https://${shopifyDomain}/admin/api/2024-01/products.json`;

    // 4. Shopifyに送る商品データの「型」を作る
    const productData = {
      product: {
        title: title,
        body_html: "<p>妄想図案帖から自動連携されたデザインです。</p>",
        vendor: vendor || "Printag Creator",
        status: "draft", // ★ここが超重要：公開ではなく「下書き」として登録する指示
        tags: "AI図案, Printag連携", // 絞り込み用のタグ
        images: [
          { src: imageUrl } // Vercel Blobに保存した画像のURLをそのまま渡す
        ]
      }
    };

    // 5. Shopifyへ送信（バケツリレー）
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken, // 合鍵を提示
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    // 6. Shopifyからエラーが返ってきた場合の処理
    if (!response.ok) {
      console.error("Shopify API Error:", data);
      return NextResponse.json({ error: `Shopifyエラー: ${JSON.stringify(data)}` }, { status: response.status });
    }

    // 7. 成功したらフロントエンドに「成功したよ！」と商品データを返す
    return NextResponse.json({ success: true, product: data.product });

  } catch (error: any) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: 'サーバー内部でエラーが発生しました' }, { status: 500 });
  }
}
