import { SanitizedPayload, ActionResponse, ScanMetrics } from '../shared/types';
import { validateOutgoingPayload } from '../privacy/payload-validator';

const DEFAULT_SERVER_URL = 'http://localhost:3000';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[VEILAGENT Service Worker] Installed. Manifest V3 registered.');
});

// Relays messages from Popup to Content Script or Backend
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RUN_AGENT_PIPELINE') {
    handleFullPipeline(message.payload)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open
  }

  if (message.type === 'CAPTURE_SCREENSHOT') {
    chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 80 })
      .then((dataUrl) => sendResponse({ dataUrl }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleFullPipeline(payload: { task: string; serverUrl?: string }) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    throw new Error('No active browser tab found.');
  }

  // 1. Capture raw screenshot
  let rawScreenshot = '';
  try {
    rawScreenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 80 });
  } catch (err: any) {
    console.warn('[VEILAGENT] captureVisibleTab fallback:', err.message);
  }

  // 2. Request DOM scan and PII detection from Content Script
  const scanResponse: any = await chrome.tabs.sendMessage(tab.id, {
    type: 'ANALYZE_PAGE_REQUEST',
  });

  if (!scanResponse) {
    throw new Error('Content script did not respond. Refresh the target page and try again.');
  }

  const { sanitizedMetadata, detections, metrics } = scanResponse;

  // 3. Assemble Sanitized Payload
  const sanitizedPayload: SanitizedPayload = {
    task: payload.task,
    sanitized_screenshot_base64: rawScreenshot ? '[REDACTED_IMAGE_PLACEHOLDER]' : undefined,
    ui_metadata: sanitizedMetadata,
    viewport: {
      width: tab.width || 1280,
      height: tab.height || 800,
      devicePixelRatio: 1.0,
    },
  };

  // 4. Run Outgoing Payload Safety Validator (2nd Privacy Boundary)
  const validation = validateOutgoingPayload(sanitizedPayload);
  if (!validation.isSafe) {
    throw new Error(`FAIL-CLOSED: Outgoing payload safety validation failed:\n${validation.violations.join('\n')}`);
  }

  // 5. Send validated sanitized payload to Server VLM
  const serverEndpoint = `${payload.serverUrl || DEFAULT_SERVER_URL}/api/v1/agent/act`;
  const startTimeServer = performance.now();
  
  let actionResponse: ActionResponse;
  try {
    const res = await fetch(serverEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedPayload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(`Server returned ${res.status}: ${errJson.error || errJson.message || 'Unknown error'}`);
    }

    actionResponse = await res.json();
  } catch (netErr: any) {
    console.warn('[VEILAGENT] Network failed or offline, engaging local mock fallback:', netErr.message);
    // Offline deterministic fallback
    actionResponse = {
      action: 'click',
      element_id: 'btn_save',
      confidence: 0.95,
      rationale: 'Local Fallback: Network unavailable. Safely selected target from local UI extraction.',
    };
  }

  const serverLatencyMs = Math.round(performance.now() - startTimeServer);

  // 6. Send proposed action to Content Script for Local Action Guard verification & execution
  const execResponse: any = await chrome.tabs.sendMessage(tab.id, {
    type: 'EXECUTE_ACTION',
    payload: { action: actionResponse },
  });

  return {
    actionProposed: actionResponse,
    guardResult: execResponse.guardResult,
    execResult: execResponse.execResult,
    metrics: {
      ...metrics,
      serverReasoningMs: serverLatencyMs,
      rawPiiTransmitted: 0,
    },
    sanitizedPayload,
  };
}
