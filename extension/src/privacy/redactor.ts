import { SensitiveDetection, UIElement, ViewportInfo } from '../shared/types';

export interface RedactionResult {
  sanitizedMetadata: UIElement[];
  redactedCount: number;
}

export function redactUIMetadata(
  elements: UIElement[],
  detections: SensitiveDetection[]
): RedactionResult {
  let redactedCount = 0;

  const sanitized = elements.map((elem) => {
    // Find matching detection for this element's bbox
    const match = detections.find((det) => {
      const [ex1, ey1, ex2, ey2] = elem.bbox;
      const [dx1, dy1, dx2, dy2] = det.bbox;
      // Overlap or proximity check
      const xOverlap = Math.max(0, Math.min(ex2, dx2) - Math.max(ex1, dx1));
      const yOverlap = Math.max(0, Math.min(ey2, dy2) - Math.max(ey1, dy1));
      return xOverlap > 0 && yOverlap > 0;
    });

    if (match) {
      redactedCount++;
      return {
        ...elem,
        label: match.semanticToken,
        type: match.type,
      };
    }

    return { ...elem };
  });

  return {
    sanitizedMetadata: sanitized,
    redactedCount,
  };
}

export async function redactScreenshotCanvas(
  rawImageBase64: string,
  detections: SensitiveDetection[],
  viewport: ViewportInfo
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawImageBase64);
        return;
      }

      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      // Draw original screenshot
      ctx.drawImage(img, 0, 0);

      // Coordinate scaling factor between DOM viewport (CSS pixels) and screenshot pixels
      const scaleX = canvas.width / (viewport.width || canvas.width);
      const scaleY = canvas.height / (viewport.height || canvas.height);

      // Apply redactions
      for (const det of detections) {
        const [minX, minY, maxX, maxY] = det.bbox;
        const x = minX * scaleX;
        const y = minY * scaleY;
        const w = (maxX - minX) * scaleX;
        const h = (maxY - minY) * scaleY;

        if (det.type === 'face') {
          // Pixelate / blur face region
          ctx.save();
          // Draw subtle privacy mask pattern
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, w, h);
          // Border
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);

          // Center label
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('[FACE MASKED]', x + w / 2, y + h / 2);
          ctx.restore();
        } else {
          // Sensitive text field redaction
          ctx.save();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, w, h);

          ctx.strokeStyle = '#e11d48';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, w, h);

          ctx.fillStyle = '#fda4af';
          ctx.font = '600 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(det.semanticToken, x + w / 2, y + h / 2);
          ctx.restore();
        }
      }

      // Convert to compressed JPEG
      const sanitizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      resolve(sanitizedBase64);
    };

    img.onerror = () => {
      resolve(rawImageBase64);
    };

    img.src = rawImageBase64;
  });
}
