import { SensitiveDetection } from '../shared/types';

export const DEFAULT_PRIVACY_THRESHOLD = 0.80;

export interface PolicyEvaluationResult {
  allowedToTransmit: boolean;
  activeDetections: SensitiveDetection[];
  suppressedDetections: SensitiveDetection[];
  reason?: string;
}

export class PrivacyPolicyEngine {
  private threshold: number;

  constructor(threshold: number = DEFAULT_PRIVACY_THRESHOLD) {
    this.threshold = threshold;
  }

  evaluateDetections(detections: SensitiveDetection[]): PolicyEvaluationResult {
    const active: SensitiveDetection[] = [];
    const suppressed: SensitiveDetection[] = [];

    for (const det of detections) {
      if (det.confidence >= this.threshold) {
        active.push(det);
      } else {
        suppressed.push(det);
      }
    }

    return {
      allowedToTransmit: true, // Will be redacted prior to transmission
      activeDetections: active,
      suppressedDetections: suppressed,
    };
  }

  enforceFailClosed(
    visualModelAvailable: boolean,
    hasBiometricImagesOnPage: boolean
  ): { safe: boolean; reason?: string } {
    if (hasBiometricImagesOnPage && !visualModelAvailable) {
      return {
        safe: false,
        reason: 'Local visual privacy model unavailable and biometric face images present. Fail-closed policy triggered: Upload blocked.',
      };
    }
    return { safe: true };
  }
}
