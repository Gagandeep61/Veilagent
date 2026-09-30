import { SanitizedPayload } from '../shared/types';
import { passesLuhnCheck } from './pii-detector';

const EMAIL_TEST = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const PHONE_TEST = /(?:\+91|0)?[6-9]\d{9}/;
const PAN_TEST = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/;
const AADHAAR_TEST = /\b\d{4}\s\d{4}\s\d{4}\b/;
const CARD_TEST = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})\b/;

export interface ValidationSafetyResult {
  isSafe: boolean;
  violations: string[];
}

export function validateOutgoingPayload(payload: SanitizedPayload): ValidationSafetyResult {
  const violations: string[] = [];

  // 1. Inspect elements label and type
  for (const el of payload.ui_metadata) {
    const text = el.label || '';

    if (EMAIL_TEST.test(text)) {
      violations.push(`Raw email leaked in element '${el.element_id}': '${text}'`);
    }

    if (PHONE_TEST.test(text)) {
      violations.push(`Raw phone leaked in element '${el.element_id}': '${text}'`);
    }

    if (PAN_TEST.test(text)) {
      violations.push(`Raw PAN leaked in element '${el.element_id}': '${text}'`);
    }

    if (AADHAAR_TEST.test(text)) {
      violations.push(`Raw Aadhaar leaked in element '${el.element_id}': '${text}'`);
    }

    if (CARD_TEST.test(text) && passesLuhnCheck(text)) {
      violations.push(`Raw Credit Card leaked in element '${el.element_id}': '${text}'`);
    }
  }

  // 2. Full JSON string inspection (excluding base64 screenshot data)
  const clone = { ...payload, sanitized_screenshot_base64: '[IMAGE_DATA]' };
  const serialized = JSON.stringify(clone);

  if (EMAIL_TEST.test(serialized)) {
    violations.push('Regex match: unredacted email string found in JSON structure');
  }

  return {
    isSafe: violations.length === 0,
    violations,
  };
}
