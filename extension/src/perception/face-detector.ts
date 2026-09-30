import { SensitiveDetection, BoundingBox } from '../shared/types';
import { getModelAssetUrl } from './model-loader';

export interface FaceInferenceResult {
  model_loaded: boolean;
  backend: 'GPU' | 'CPU' | 'DOM_FALLBACK';
  inference_ms: number;
  detections: SensitiveDetection[];
}

export class LocalFaceDetector {
  private detectorInstance: any = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;

  async initialize(): Promise<boolean> {
    if (this.isReady) return true;
    if (this.isInitializing) return false;
    this.isInitializing = true;

    try {
      // Dynamic import to support environments where mediapipe is bundled
      const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');
      const wasmFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const modelUrl = getModelAssetUrl('face_detector.task');

      this.detectorInstance = await FaceDetector.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath: modelUrl,
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5,
      });

      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err: any) {
      console.warn('[VEILAGENT FaceDetector] GPU/WASM Init failed, attempting CPU fallback:', err.message);
      try {
        const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');
        const wasmFileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const modelUrl = getModelAssetUrl('face_detector.task');
        this.detectorInstance = await FaceDetector.createFromOptions(wasmFileset, {
          baseOptions: {
            modelAssetPath: modelUrl,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.5,
        });
        this.isReady = true;
        this.isInitializing = false;
        return true;
      } catch (cpuErr: any) {
        console.warn('[VEILAGENT FaceDetector] MediaPipe direct WASM unavailable, enabling DOM visual fallback:', cpuErr.message);
        this.isReady = false;
        this.isInitializing = false;
        return false;
      }
    }
  }

  async detectFacesOnImage(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FaceInferenceResult> {
    const startTime = performance.now();
    const detections: SensitiveDetection[] = [];

    if (this.isReady && this.detectorInstance) {
      try {
        const results = this.detectorInstance.detect(imageElement);
        const inferenceMs = performance.now() - startTime;

        if (results && results.detections) {
          for (const det of results.detections) {
            const bb = det.boundingBox;
            if (bb) {
              const bbox: BoundingBox = [
                bb.originX,
                bb.originY,
                bb.originX + bb.width,
                bb.originY + bb.height,
              ];
              detections.push({
                type: 'face',
                bbox,
                confidence: det.categories?.[0]?.score || 0.95,
                source: 'mediapipe_vision',
                semanticToken: '[FACE]',
              });
            }
          }
        }

        return {
          model_loaded: true,
          backend: 'GPU',
          inference_ms: Math.round(inferenceMs),
          detections,
        };
      } catch (err) {
        console.warn('[VEILAGENT FaceDetector] Inference run failed:', err);
      }
    }

    // Fallback: detect profile photos from DOM image elements (e.g. data-veil-type="face" or avatar class)
    const inferenceMs = performance.now() - startTime;
    return {
      model_loaded: false,
      backend: 'DOM_FALLBACK',
      inference_ms: Math.round(inferenceMs),
      detections,
    };
  }
}
