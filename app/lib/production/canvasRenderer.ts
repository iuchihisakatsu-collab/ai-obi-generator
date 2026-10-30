// app/lib/production/canvasRenderer.ts

/**
 * 幾何学模様を40cm（400mm）反物原寸の正方形PNGとしてレンダリングする
 */
export async function renderTiledGeometricPng(
  svgDataUrl: string,
  bgSizeMm: number,
  bgColor: string,
  targetWidthMm: number = 400,
  resolutionPx: number = 2400
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = resolutionPx;
        canvas.height = resolutionPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(svgDataUrl); return; }
        ctx.fillStyle = bgColor || '#ffffff';
        ctx.fillRect(0, 0, resolutionPx, resolutionPx);

        const pxPerMm = resolutionPx / targetWidthMm;
        const tileSizePx = Math.max(1, bgSizeMm * pxPerMm);

        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = tileSizePx;
        tileCanvas.height = tileSizePx;
        const tCtx = tileCanvas.getContext('2d');
        if (tCtx) {
          tCtx.fillStyle = bgColor || '#ffffff';
          tCtx.fillRect(0, 0, tileSizePx, tileSizePx);
          tCtx.drawImage(img, 0, 0, tileSizePx, tileSizePx);
          const pattern = ctx.createPattern(tileCanvas, 'repeat');
          if (pattern) {
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, resolutionPx, resolutionPx);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        }
        resolve(svgDataUrl);
      } catch {
        resolve(svgDataUrl);
      }
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}

/**
 * 【40cm絶対ルール適用】
 * 400mm角の反物画像から、半幅帯用の中央180mmをトリミングして出力する
 */
export async function render18cmPrintDataPng(
  patternUrl: string,
  creationMode: 'ai' | 'geometric',
  bgSizeMm: number,
  bgColor: string
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // 解像度: 6px/mm (180mm = 1080px, 400mm = 2400px)
        canvas.width = 1080;
        canvas.height = 2400;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(patternUrl); return; }
        ctx.fillStyle = bgColor || '#ffffff';
        ctx.fillRect(0, 0, 1080, 2400);

        if (creationMode === 'geometric') {
          const pxPerMm = 6;
          const tileSizePx = Math.max(1, bgSizeMm * pxPerMm);
          const tileCanvas = document.createElement('canvas');
          tileCanvas.width = tileSizePx;
          tileCanvas.height = tileSizePx;
          const tCtx = tileCanvas.getContext('2d');
          if (tCtx) {
            tCtx.fillStyle = bgColor || '#ffffff';
            tCtx.fillRect(0, 0, tileSizePx, tileSizePx);
            tCtx.drawImage(img, 0, 0, tileSizePx, tileSizePx);
            const pattern = ctx.createPattern(tileCanvas, 'repeat');
            if (pattern) {
              ctx.fillStyle = pattern;
              ctx.fillRect(0, 0, 1080, 2400);
            }
          }
        } else {
          const pxPerMm = 6;
          const scaledWidth = 400 * pxPerMm; // 2400px
          const scale = scaledWidth / img.naturalWidth;
          const scaledHeight = img.naturalHeight * scale;
          const offsetX = (1080 - scaledWidth) / 2; // -660px（中央トリミング）

          let currentY = 0;
          while (currentY < 2400) {
            ctx.drawImage(img, offsetX, currentY, scaledWidth, scaledHeight);
            currentY += scaledHeight;
          }
        }
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(patternUrl);
      }
    };
    img.onerror = () => resolve(patternUrl);
    img.src = patternUrl;
  });
}
