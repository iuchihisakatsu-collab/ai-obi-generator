// app/lib/orders/index.ts
export * from './types';
export * from './makeshop';
export * from './shopify';

import { PlatformType, OrderPayload, OrderResult } from './types';
import { processMakeshopOrder } from './makeshop';
import { processShopifyOrder } from './shopify';

export async function submitOrder(platform: PlatformType, payload: OrderPayload): Promise<OrderResult> {
  if (platform === 'shopify') {
    return await processShopifyOrder(payload);
  }
  return await processMakeshopOrder(payload);
}
