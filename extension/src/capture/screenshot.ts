import { ViewportInfo } from '../shared/types';

export interface CaptureResult {
  dataUrl: string;
  viewport: ViewportInfo;
  byteSize: number;
}

export async function captureTabScreenshot(tabId?: number): Promise<CaptureResult> {
  if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.tabs.captureVisibleTab) {
    throw new Error('chrome.tabs.captureVisibleTab is not available in current context');
  }

  // Capture visible tab as JPEG
  const dataUrl = await chrome.tabs.captureVisibleTab({
    format: 'jpeg',
    quality: 80,
  });

  // Query tab or window dimensions
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const width = tab?.width || 1280;
  const height = tab?.height || 800;

  const byteSize = Math.round((dataUrl.length * 3) / 4);

  return {
    dataUrl,
    viewport: {
      width,
      height,
      devicePixelRatio: 1.0,
      scrollX: 0,
      scrollY: 0,
    },
    byteSize,
  };
}
