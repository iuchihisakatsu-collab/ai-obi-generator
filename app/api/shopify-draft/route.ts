import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, imageUrl, vendor, designFee } = await req.json();

    const rawDomain =
      process.env.SHOPIFY_STORE_DOMAIN ||
      process.env.SHOPIFY_SHOP_DOMAIN ||
      process.env.SHOPIFY_DOMAIN ||
      process.env.SHOPIFY_STORE_URL ||
      process.env.SHOPIFY_URL ||
      '';

    const shopDomain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const accessToken =
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ||
      process.env.SHOPIFY_ACCESS_TOKEN ||
      process.env.SHOPIFY_TOKEN ||
      process.env.SHOPIFY_API_KEY ||
      '';

    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        { error: 'Shopifyの環境変数が設定されていません。' },
        { status: 500 }
      );
    }

    const fee = Number(designFee) || 0;

    const costs = {
      data: 0,       // 図案データ（原価0）
      tote: 2800,    // トートバッグ
      cushion: 3200, // クッションカバー
      scarf: 3800,   // スカーフ
      cotton: 2000,  // 綿ブロード (1m)
      poly: 2400,    // ポリエステル (1m)
      silk: 6000,    // 丹後シルク (1m)
    };

    // ★ ここを修正：Base64画像に安全な半角英数字のファイル名を必ず付与する
    let imagesPayload: Array<{ src?: string; attachment?: string; filename?: string }> = [];
    if (imageUrl) {
      if (imageUrl.startsWith('data:')) {
        // 幾何学モード等のBase64画像
        const base64Content = imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl;
        imagesPayload = [
          {
            attachment: base64Content,
            filename: `pattern_${Date.now()}.png`, // ← これでShopifyのエラーを回避
          },
        ];
      } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // AI生成等のWeb URL画像
        imagesPayload = [{ src: imageUrl }];
      }
    }

    const payload = {
      product: {
        title: title || '無題の図案',
        body_html: `
          <p><strong>【意匠銘】</strong> ${title || '無題'}</p>
          <p><strong>【意匠設計】</strong> ${vendor || 'Printag Creator'}</p>
          <p><strong>【クリエイター還元フィー】</strong> ¥${fee.toLocaleString()} / 点</p>
          <hr />
          <p>新潟自社工場のエプソン捺染機「モナリザ」にて高精細ダイレクトプリントを行う受注生産商品です。</p>
        `,
        vendor: vendor || 'Printag Creator',
        product_type: 'テキスタイル図案',
        status: 'draft',
        tags: ['先行仮掲載', 'AI生成図案', `Fee_${fee}`],
        images: imagesPayload,
        options: [
          {
            name: '展開アイテム・素材',
          },
        ],
        variants: [
          {
            option1: '図案データ (商用ライセンス)',
            price: String(costs.data + fee),
            requires_shipping: false,
          },
          {
            option1: 'トートバッグ (キャンバス)',
            price: String(costs.tote + fee),
            requires_shipping: true,
          },
          {
            option1: 'クッションカバー (45×45cm)',
            price: String(costs.cushion + fee),
            requires_shipping: true,
          },
          {
            option1: 'スカーフ (90×90cm)',
            price: String(costs.scarf + fee),
            requires_shipping: true,
          },
          {
            option1: '生地: 綿ブロード (1m単位)',
            price: String(costs.cotton + fee),
            requires_shipping: true,
          },
          {
            option1: '生地: ポリエステルちりめん (1m単位)',
            price: String(costs.poly + fee),
            requires_shipping: true,
          },
          {
            option1: '生地: 丹後別注シルク (1m単位)',
            price: String(costs.silk + fee),
            requires_shipping: true,
          },
        ],
      },
    };

    const shopifyRes = await fetch(
      `https://${shopDomain}/admin/api/2024-01/products.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await shopifyRes.json();

    if (!shopifyRes.ok) {
      console.error('Shopify API Error:', data);
      return NextResponse.json(
        { error: data.errors ? JSON.stringify(data.errors) : 'Shopify登録エラー' },
        { status: shopifyRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      product: data.product,
    });
  } catch (error: any) {
    console.error('API Server Error:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
