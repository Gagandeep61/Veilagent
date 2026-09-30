export interface ModelLoadResult {
  loaded: boolean;
  source: string;
  error?: string;
}

export function getModelAssetUrl(filename: string = 'face_detector.task'): string {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
    return chrome.runtime.getURL(`models/${filename}`);
  }
  return `/models/${filename}`;
}
