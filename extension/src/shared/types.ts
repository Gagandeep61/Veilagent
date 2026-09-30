export type BoundingBox = [number, number, number, number]; // [minX, minY, maxX, maxY]

export interface UIElement {
  element_id: string;
  tag: string;
  role: string;
  label: string;
  bbox: BoundingBox;
  visible: boolean;
  disabled: boolean;
  type?: string;
}

export type PIIType = 'email' | 'phone' | 'password' | 'card' | 'pan' | 'aadhaar' | 'person' | 'face';

export interface SensitiveDetection {
  type: PIIType;
  bbox: BoundingBox;
  confidence: number;
  source: 'dom_semantics' | 'regex' | 'luhn' | 'mediapipe_vision' | 'ground_truth_annotation';
  semanticToken: string;
}

export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  screenshotWidth?: number;
  screenshotHeight?: number;
}

export interface SanitizedPayload {
  task: string;
  sanitized_screenshot_base64?: string;
  ui_metadata: UIElement[];
  viewport: {
    width: number;
    height: number;
    devicePixelRatio: number;
  };
}

export interface ActionResponse {
  action: 'click' | 'scroll' | 'none';
  element_id?: string | null;
  x?: number | null;
  y?: number | null;
  direction?: 'up' | 'down' | null;
  amount?: number | null;
  confidence: number;
  rationale?: string;
}

export interface ScanMetrics {
  domElementsScanned: number;
  piiRedactionsCount: number;
  faceDetectionsCount: number;
  localPerceptionMs: number;
  redactionMs: number;
  payloadCheckMs: number;
  serverReasoningMs?: number;
  actionValidationMs?: number;
  totalCycleMs?: number;
  rawPiiTransmitted: number; // MUST BE 0!
  payloadSizeBytes: number;
}

export interface ExtensionMessage<T = any> {
  type: 
    | 'ANALYZE_PAGE_REQUEST' 
    | 'ANALYZE_PAGE_RESPONSE' 
    | 'TOGGLE_OVERLAY_REQUEST' 
    | 'RUN_AGENT_TASK' 
    | 'AGENT_TASK_RESULT'
    | 'GET_STATUS';
  payload?: T;
  error?: string;
}
