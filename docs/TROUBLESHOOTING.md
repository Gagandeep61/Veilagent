# VEILAGENT — Troubleshooting & Diagnostics

Common issues, failure symptoms, root causes, and resolutions:

---

### 1. `captureVisibleTab` Permission or Invalidation Error
- **Symptom:** `Error: chrome.tabs.captureVisibleTab failed`
- **Cause:** Calling screen capture continuously or without active tab user gesture.
- **Resolution:** Screen capture is event-driven only (triggered on "Analyze Page" or "Run Agent"). Ensure `activeTab` permission is declared in `manifest.config.ts`.

---

### 2. MediaPipe Face Detector Fails to Load in Injected Page
- **Symptom:** `Failed to fetch file at models/face_detector.task`
- **Cause:** Using relative paths like `./models/face_detector.task` inside injected content scripts.
- **Resolution:** Always resolve extension assets via `chrome.runtime.getURL('models/face_detector.task')`. Ensure `models/*` is listed under `web_accessible_resources` in `manifest.config.ts`.

---

### 3. Misaligned Bounding Boxes on Redaction Canvas
- **Symptom:** Redaction overlay is offset or does not completely cover sensitive text.
- **Cause:** Device Pixel Ratio mismatch. `getBoundingClientRect()` outputs CSS pixels, but `captureVisibleTab()` captures device pixels.
- **Resolution:** Compute dynamic scale factors:
  `scaleX = canvas.width / viewport.width; scaleY = canvas.height / viewport.height;`

---

### 4. "Local Visual Privacy Model Unavailable. Upload Blocked."
- **Symptom:** Popup displays fail-closed warning and disables Run Agent.
- **Cause:** WebAssembly or WebGL initialization failure and biometric photos present on the page.
- **Resolution:** This is the intended **fail-closed** security behavior. Run `python3 scripts/download-model.py` and verify `face_detector.task` exists at `extension/public/models/`.

---

### 5. CORS Rejection on FastAPI Server
- **Symptom:** `Access-Control-Allow-Origin header missing`
- **Cause:** Extension background script sending request with unconfigured origin.
- **Resolution:** Set `ALLOWED_EXTENSION_ORIGIN="*"` or `ALLOWED_EXTENSION_ORIGIN="chrome-extension://<id>"` in `.env`.
