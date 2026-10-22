export type StripeDirection = 'vertical' | 'horizontal' | 'diagonal';
export type DotLayout = 'grid' | 'staggered';

export interface StripeParams {
  direction: StripeDirection;
  lineWidth: number;
  gap: number;
  bgColor: string;
  stripeColor: string;
}

export interface DotParams {
  layout: DotLayout;
  radius: number;
  gap: number;
  bgColor: string;
  dotColor: string;
}

export function generateStripeSvg(params: StripeParams): string {
  const { direction, lineWidth, gap, bgColor, stripeColor } = params;
  const period = lineWidth + gap;

  if (direction === 'vertical') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${period}" viewBox="0 0 ${period} ${period}">
      <rect width="${period}" height="${period}" fill="${bgColor}" />
      <rect x="0" y="0" width="${lineWidth}" height="${period}" fill="${stripeColor}" />
    </svg>`;
  }

  if (direction === 'horizontal') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${period}" height="${period}" viewBox="0 0 ${period} ${period}">
      <rect width="${period}" height="${period}" fill="${bgColor}" />
      <rect x="0" y="0" width="${period}" height="${lineWidth}" fill="${stripeColor}" />
    </svg>`;
  }

  const size = period * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bgColor}" />
    <path d="M -${period/2},${period/2} l ${period},-${period} M 0,${size} l ${size},-${size} M ${size - period/2},${size + period/2} l ${period},-${period}" stroke="${stripeColor}" stroke-width="${lineWidth}" />
  </svg>`;
}

export function generateDotSvg(params: DotParams): string {
  const { layout, radius, gap, bgColor, dotColor } = params;
  const pitch = radius * 2 + gap;

  if (layout === 'grid') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${pitch}" height="${pitch}" viewBox="0 0 ${pitch} ${pitch}">
      <rect width="${pitch}" height="${pitch}" fill="${bgColor}" />
      <circle cx="${pitch / 2}" cy="${pitch / 2}" r="${radius}" fill="${dotColor}" />
    </svg>`;
  }

  const size = pitch * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="${bgColor}" />
    <circle cx="${pitch}" cy="${pitch}" r="${radius}" fill="${dotColor}" />
    <circle cx="0" cy="0" r="${radius}" fill="${dotColor}" />
    <circle cx="${size}" cy="0" r="${radius}" fill="${dotColor}" />
    <circle cx="0" cy="${size}" r="${radius}" fill="${dotColor}" />
    <circle cx="${size}" cy="${size}" r="${radius}" fill="${dotColor}" />
    <circle cx="${pitch}" cy="0" r="${radius}" fill="${dotColor}" />
    <circle cx="${pitch}" cy="${size}" r="${radius}" fill="${dotColor}" />
    <circle cx="0" cy="${pitch}" r="${radius}" fill="${dotColor}" />
    <circle cx="${size}" cy="${pitch}" r="${radius}" fill="${dotColor}" />
  </svg>`;
}

export async function svgToHighResPng(svgString: string, exportSize = 2400): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject('Canvas error');
      }
      const pattern = ctx.createPattern(img, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, exportSize, exportSize);
      }
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}
