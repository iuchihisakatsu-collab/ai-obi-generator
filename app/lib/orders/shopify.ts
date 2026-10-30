// app/lib/orders/shopify.ts
import { OrderPayload, OrderResult } from './types';

export async function processShopifyOrder(payload: OrderPayload): Promise<OrderResult> {
  const { title, serialNumber, imageUrl, vendor, designFee = 1000 } = payload;
  let finalImageUrl = imageUrl;

  // 1. Base64データの場合はBlob保存してURL化
  if (finalImageUrl.startsWith('data:')) {
    const uploadRes = await fetch('/api/upload-blob', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64Data: finalImageUrl,
        filename: `${serialNumber}.png`,
      }),
    });
    const uploadData = await uploadRes.json();
    if (uploadData.url) {
      finalImageUrl = uploadData.url;
    }
  }

  // 2. 既存のShopify下書き作成APIを呼び出し
  const shopifyRes = await fetch('/api/shopify-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `${title} (${serialNumber})`,
      imageUrl: finalImageUrl,
      vendor: vendor || 'Printag Creator',
      designFee: Number(designFee) || 0,
    }),
  });

  const data = await shopifyRes.json();
  if (!shopifyRes.ok || !data.success) {
    throw new Error(data.error || 'Shopifyへの下書き登録に失敗しました');
  }

  const product = data.product;
  const productId = product?.id;

  return {
    success: true,
    productId,
    message: `【Shopify下書き登録完了】\n図案「${title}」を下書き商品（ID: ${productId}）として登録しました。\nクリエイター還元フィー（¥${Number(designFee).toLocaleString()}）を含めた7アイテムのバリエーションが自動生成されています。`,
  };
}
