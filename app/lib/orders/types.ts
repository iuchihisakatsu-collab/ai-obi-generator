// app/lib/orders/types.ts

export type PlatformType = 'makeshop' | 'shopify';

export interface OrderPayload {
  title: string;
  serialNumber: string;
  imageUrl: string;
  itemType: 'hanhaba' | 'kyobukuro' | 'kimono';
  creationMode: 'ai' | 'geometric';
  vendor?: string;
  designFee?: number;
}

export interface OrderResult {
  success: boolean;
  redirectUrl?: string;
  productId?: string | number;
  message?: string;
  error?: string;
}
