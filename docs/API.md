# VEILAGENT — API Specification & Data Contracts

The VEILAGENT backend exposes endpoints for health monitoring and structured VLM agent reasoning over sanitized browser payloads.

---

## 1. Health Check

### `GET /health`

Returns server status, current operational mode, active VLM model, and privacy enforcement confirmation.

#### Response `200 OK`
```json
{
  "status": "healthy",
  "mode": "mock",
  "model": "gemini-3.1-flash-lite",
  "service": "VEILAGENT Server",
  "version": "1.0.0",
  "privacy_boundary": "enforced"
}
```

---

## 2. Agent Action Reasoning

### `POST /api/v1/agent/act`

Accepts a sanitized screenshot and sanitized interactive UI metadata. Returns a strictly structured next action.

#### Request Body Schema (`application/json`)
```json
{
  "task": "Find and click the Save Changes button",
  "sanitized_screenshot_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "ui_metadata": [
    {
      "element_id": "input_fullname",
      "tag": "input",
      "role": "textbox",
      "label": "[PERSON]",
      "bbox": [24, 180, 360, 220],
      "visible": true,
      "disabled": false,
      "type": "text"
    },
    {
      "element_id": "input_email",
      "tag": "input",
      "role": "textbox",
      "label": "[EMAIL]",
      "bbox": [380, 180, 720, 220],
      "visible": true,
      "disabled": false,
      "type": "email"
    },
    {
      "element_id": "btn_save",
      "tag": "button",
      "role": "button",
      "label": "Save Changes",
      "bbox": [580, 620, 720, 660],
      "visible": true,
      "disabled": false
    }
  ],
  "viewport": {
    "width": 1280,
    "height": 800,
    "devicePixelRatio": 1.0
  }
}
```

#### Success Response `200 OK`
```json
{
  "action": "click",
  "element_id": "btn_save",
  "x": 650.0,
  "y": 640.0,
  "confidence": 0.98,
  "rationale": "Grounded target 'btn_save' matches user task to save settings."
}
```

#### Error Response `400 Bad Request` (Privacy Violation)
Triggered if raw PII was present in the incoming payload:
```json
{
  "detail": {
    "error": "Privacy Invariant Violation",
    "message": "PII Leak: Email detected in element 'input_email' label: 'rahul.sharma@example.com'",
    "policy": "FAIL-CLOSED: Server refused payload containing unredacted raw sensitive data."
  }
}
```
