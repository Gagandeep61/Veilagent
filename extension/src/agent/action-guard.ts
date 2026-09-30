import { ActionResponse, UIElement } from '../shared/types';

export interface GuardEvaluation {
  allowed: boolean;
  reason?: string;
  isDestructive: boolean;
  targetElement?: HTMLElement | null;
}

const DESTRUCTIVE_KEYWORDS = [
  'delete',
  'remove',
  'erase',
  'purchase',
  'pay',
  'transfer',
  'terminate',
  'cancel account',
  'wipe',
];

export class LocalActionGuard {
  private minConfidenceThreshold: number;

  constructor(minConfidenceThreshold: number = 0.80) {
    this.minConfidenceThreshold = minConfidenceThreshold;
  }

  evaluateAction(action: ActionResponse, extractedElements: UIElement[]): GuardEvaluation {
    // 1. Check confidence threshold
    if (action.confidence < this.minConfidenceThreshold) {
      return {
        allowed: false,
        reason: `Server action confidence (${action.confidence.toFixed(2)}) is below safety threshold (${this.minConfidenceThreshold}).`,
        isDestructive: false,
      };
    }

    if (action.action === 'scroll') {
      return {
        allowed: true,
        isDestructive: false,
      };
    }

    if (action.action === 'click') {
      if (!action.element_id) {
        return {
          allowed: false,
          reason: 'Click action proposed without explicit element_id.',
          isDestructive: false,
        };
      }

      // Check if element was in extracted list
      const meta = extractedElements.find((e) => e.element_id === action.element_id);
      if (!meta) {
        return {
          allowed: false,
          reason: `Proposed element_id '${action.element_id}' does not exist in local UI extraction hierarchy.`,
          isDestructive: false,
        };
      }

      if (meta.disabled) {
        return {
          allowed: false,
          reason: `Proposed element '${action.element_id}' is disabled in the DOM.`,
          isDestructive: false,
        };
      }

      // Check for destructive actions
      const labelLower = (meta.label || '').toLowerCase();
      const isDestructive = DESTRUCTIVE_KEYWORDS.some((kw) => labelLower.includes(kw));

      // Resolve live DOM element
      const domElement =
        document.querySelector(`[data-veil-id="${action.element_id}"]`) ||
        document.getElementById(action.element_id);

      if (!domElement) {
        return {
          allowed: false,
          reason: `DOM element for id '${action.element_id}' not found in live document.`,
          isDestructive,
        };
      }

      return {
        allowed: true,
        isDestructive,
        targetElement: domElement as HTMLElement,
      };
    }

    return {
      allowed: false,
      reason: `Unsupported action type: '${action.action}'`,
      isDestructive: false,
    };
  }
}
