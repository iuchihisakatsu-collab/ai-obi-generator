// app/lib/orders/makeshop.ts
import { OrderPayload, OrderResult } from './types';

export async function processMakeshopOrder(payload: OrderPayload): Promise<OrderResult> {
  const { title, serialNumber, imageUrl } = payload;
  let finalImageUrl = imageUrl;

  // 1. Base64データの場合はVercel Blobに保存してURL化
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
    if (!uploadRes.ok || !uploadData.url) {
      throw new Error('画像ストレージへの保存に失敗しました');
    }
    finalImageUrl = uploadData.url;
  }

  // 2. 新潟工場（Resend）へメール送信
  const emailRes = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: finalImageUrl,
      komonId: serialNumber,
      title: title || '（無題）',
    }),
  });
  const emailData = await emailRes.json();
  if (!emailRes.ok || !emailData.success) {
    throw new Error('工場への送信メール作成に失敗しました');
  }

  // 3. クリップボードへコピー
  await navigator.clipboard.writeText(`図案ID: ${serialNumber}\n作品名: ${title}`).catch(() => {});

  // 4. MakeShop商品ページへの遷移URL
  const redirectUrl = `https://store.gofukuyasan.com/view/item/000000007300?komon_id=${encodeURIComponent(
    serialNumber
  )}&title=${encodeURIComponent(title)}&image_url=${encodeURIComponent(finalImageUrl)}`;

  return {
    success: true,
    redirectUrl,
    message: '[工場へのデータ送信完了]\n自動入力されているかご確認ください。',
  };
}
