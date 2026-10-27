export type StripeDirection = 'vertical' | 'horizontal' | 'diagonal';
export type DotLayout = 'grid' | 'staggered';

/**
 * 縞（ストライプ）SVG生成
 */
export function generateStripeSvg({
  direction,
  lineWidth,
  gap,
  bgColor,
  stripeColor,
}: {
  direction: StripeDirection;
  lineWidth: number;
  gap: number;
  bgColor: string;
  stripeColor: string;
}): string {
  const period = Math.max(1, lineWidth + gap);

  if (direction === 'vertical') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${period}" viewBox="0 0 ${period} ${period}">
      <rect x="-1" y="-1" width="${period + 2}" height="${period + 2}" fill="${bgColor}" />
      <rect x="0" y="0" width="${lineWidth}" height="${period}" fill="${stripeColor}" />
    </svg>`;
  } else if (direction === 'horizontal') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${period}" viewBox="0 0 ${period} ${period}">
      <rect x="-1" y="-1" width="${period + 2}" height="${period + 2}" fill="${bgColor}" />
      <rect x="0" y="0" width="${period}" height="${lineWidth}" fill="${stripeColor}" />
    </svg>`;
  } else {
    // 斜め縞（45度・完全シームレス）
    const size = period * 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="${bgColor}" />
      <path d="M-${period},${period} l${size},-${size} M0,${size} l${size},-${size} M${period},${size * 1.5} l${size},-${size}" 
            stroke="${stripeColor}" stroke-width="${lineWidth}" stroke-linecap="square" />
    </svg>`;
  }
}

/**
 * 水玉（ドット）SVG生成（千鳥の送りズレ・ボーダー化を解消）
 */
export function generateDotSvg({
  layout,
  radius,
  gap,
  bgColor,
  dotColor,
}: {
  layout: DotLayout;
  radius: number;
  gap: number;
  bgColor: string;
  dotColor: string;
}): string {
  const r = radius;
  // ドット直径 ＋ 間隔 ＝ ピッチ
  const pitch = Math.max(1, r * 2 + gap);

  if (layout === 'grid') {
    // 正方格子
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${pitch}" height="${pitch}" viewBox="0 0 ${pitch} ${pitch}">
      <rect x="-1" y="-1" width="${pitch + 2}" height="${pitch + 2}" fill="${bgColor}" />
      <circle cx="${pitch / 2}" cy="${pitch / 2}" r="${r}" fill="${dotColor}" />
    </svg>`;
  } else {
    // 千鳥（正方千鳥：中心＋四隅による完全シームレス送り）
    const w = pitch;
    const h = pitch;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect x="-1" y="-1" width="${w + 2}" height="${h + 2}" fill="${bgColor}" />
      {/* タイル中心 */}
      <circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${dotColor}" />
      {/* タイル境界・四隅の送り */}
      <circle cx="0" cy="0" r="${r}" fill="${dotColor}" />
      <circle cx="${w}" cy="0" r="${r}" fill="${dotColor}" />
      <circle cx="0" cy="${h}" r="${r}" fill="${dotColor}" />
      <circle cx="${w}" cy="${h}" r="${r}" fill="${dotColor}" />
    </svg>`;
  }
}

/**
 * 格子（ラインチェック）SVG生成
 */
export function generateGridSvg({
  lineWidth,
  gap,
  bgColor,
  gridColor,
}: {
  lineWidth: number;
  gap: number;
  bgColor: string;
  gridColor: string;
}): string {
  const period = Math.max(1, lineWidth + gap);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${period}" viewBox="0 0 ${period} ${period}">
    <rect x="-1" y="-1" width="${period + 2}" height="${period + 2}" fill="${bgColor}" />
    <rect x="0" y="0" width="${lineWidth}" height="${period}" fill="${gridColor}" />
    <rect x="0" y="0" width="${period}" height="${lineWidth}" fill="${gridColor}" />
  </svg>`;
}

/**
 * ギンガムチェックSVG生成
 */
export function generateGinghamSvg({
  lineWidth,
  gap,
  bgColor,
  checkColor,
}: {
  lineWidth: number;
  gap: number;
  bgColor: string;
  checkColor: string;
}): string {
  const period = Math.max(1, lineWidth + gap);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${period}" viewBox="0 0 ${period} ${period}">
    <rect x="-1" y="-1" width="${period + 2}" height="${period + 2}" fill="${bgColor}" />
    <rect x="0" y="0" width="${lineWidth}" height="${period}" fill="${checkColor}" fill-opacity="0.5" />
    <rect x="0" y="0" width="${period}" height="${lineWidth}" fill="${checkColor}" fill-opacity="0.5" />
  </svg>`;
}

/**
 * 市松模様（チェッカー）SVG生成
 */
export function generateCheckerSvg({
  blockSize,
  bgColor,
  checkColor,
}: {
  blockSize: number;
  bgColor: string;
  checkColor: string;
}): string {
  const size = Math.max(1, blockSize * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="${bgColor}" />
    <rect x="0" y="0" width="${blockSize}" height="${blockSize}" fill="${checkColor}" />
    <rect x="${blockSize}" y="${blockSize}" width="${blockSize}" height="${blockSize}" fill="${checkColor}" />
  </svg>`;
}

/**
 * SVGを高解像度PNGに変換
 */
export async function svgToHighResPng(svgString: string, size: number = 2400): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }
      const pattern = ctx.createPattern(img, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, size, size);
      } else {
        ctx.drawImage(img, 0, 0, size, size);
      }
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(blobUrl);
      reject(e);
    };
    img.src = blobUrl;
  });
}
