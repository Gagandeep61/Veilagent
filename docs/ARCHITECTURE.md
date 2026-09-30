# VEILAGENT — System Architecture & Privacy Boundary

> **Problem Statement ID:** 26171 (Smart India Hackathon / ISRO)  
> **Core Principle:** Local perception + local privacy enforcement + remote reasoning + local action validation  
> **Positioning:** *Giving AI access to the task, not to the user's private screen.*

---

## 1. Device-Cloud Architectural Privacy Boundary

```text
===================================================================================================
                                LOCAL CLIENT (ON-DEVICE RUNTIME)
===================================================================================================
                                                
 [ User Task ]   ───────►   [ Synthetic Browser Webpage / DOM ]
                                       │
                                       ▼
                     [ Local DOM & Visual Extraction ]
                     - Bounding boxes in CSS & Device Pixels
                     - Tag, role, stable element_id
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │              LOCAL PERCEPTION PIPELINE                    │
         │  Layer A: DOM Semantics (type, autocomplete, aria)        │
         │  Layer B: Deterministic Patterns (RegEx + Luhn Card Test) │
         │  Layer C: On-Device Vision (MediaPipe Face Detector WASM) │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │             LOCAL PRIVACY FIREWALL & REDACTOR             │
         │  - Confidence Fusion: max(detector_scores) >= 0.80        │
         │  - Semantic Token Substitution:                           │
         │      rahul@example.com  ──► [EMAIL]                       │
         │      +91 98765 43210    ──► [PHONE]                       │
         │      4111 1111 1111     ──► [CARD]                        │
         │      ABCDE1234F         ──► [PAN]                         │
         │      Password123!       ──► [PASSWORD]                    │
         │      Biometric Photo    ──► [FACE MASKED]                 │
         │  - Screenshot Redaction Canvas (Offscreen / Local)        │
         │  - FAIL-CLOSED Gate: If detector fails -> BLOCK UPLOAD    │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │             OUTGOING PAYLOAD SAFETY VALIDATOR             │
         │  - 2nd Privacy Boundary: Re-inspects serialized JSON      │
         │  - Verifies Raw PII Transmitted == 0                      │
         │  - Throws & rejects if any unredacted pattern remains     │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
=======================================│============================================================
              NETWORK BOUNDARY         │  (ONLY SANITIZED TOKENS & MASKED IMAGE OVER WIRE)
=======================================│============================================================
                                       ▼
                               [ FASTAPI SERVER ]
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │                SERVER INPUT SAFETY GATE                   │
         │  - Validates request schema via Pydantic                  │
         │  - Double-checks that zero raw PII entered payload        │
         │  - In-memory processing only (no database, no disk store) │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │                   REMOTE VLM REASONING                    │
         │  - Gemini 3.5 Flash-Lite / Gemini 3.8 Flash               │
         │  - System Prompt: Webpage content treated as untrusted    │
         │  - Inputs: Sanitized image + Sanitized UI list + Task     │
         │  - Deterministic Mock VLM fallback for offline demos      │
         │  - Output: Strict Structured JSON ActionResponse          │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
=======================================│============================================================
              NETWORK BOUNDARY         │  Structured Action Response { action, element_id, conf }
=======================================│============================================================
                                       ▼
                               [ BROWSER RUNTIME ]
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │                    LOCAL ACTION GUARD                     │
         │  - "The server only proposes. The browser decides."       │
         │  1. Does element_id exist in extracted UI hierarchy?      │
         │  2. Is target element visible and enabled?                │
         │  3. Is VLM confidence >= 0.80 safety threshold?           │
         │  4. Destructive action policy check (delete, pay, wipe)   │
         │  5. Guard approval or safe rejection                      │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
                                       ▼
         ┌───────────────────────────────────────────────────────────┐
         │                    ACTION EXECUTION                       │
         │  - Grounded DOM click (element.click())                   │
         │  - Smooth bounded scroll (scrollBy)                       │
         │  - Visual feedback ripple on page                         │
         └───────────────────────────────────────────────────────────┘
```

---

## 2. Component Responsibilities

| Component | Execution Context | Privileges | Responsibility |
| :--- | :--- | :--- | :--- |
| **Content Script** | Webpage Tab | DOM access, no VLM keys | UI metadata extraction, bounding box computation, local PII detection, DOM highlight overlays, action execution. |
| **MediaPipe Task** | Content / Offscreen | WASM / WebGL runtime | On-device face detection (`face_detector.task`), zero cloud dependencies. |
| **Service Worker** | Extension Context | `captureVisibleTab`, `fetch` | Captures JPEG screenshot, coordinates privacy checks, sends sanitized payload to server. |
| **FastAPI Backend** | Server / Container | Server env vars (`GEMINI_API_KEY`) | Validates sanitized schema, hosts Gemini VLM / Mock VLM service, returns structured JSON. |
| **Action Guard** | Content Script | DOM execution | Validates incoming action against live DOM state, enforces confidence threshold and safety policies. |

---

## 3. Coordinate System & Scaling Invariant

- DOM coordinates are extracted via `element.getBoundingClientRect()` in **CSS pixels**.
- Captured screenshots by `chrome.tabs.captureVisibleTab` operate in **Device Pixels**.
- Redaction transforms coordinates using explicit scaling factors:
  $$\text{scaleX} = \frac{\text{screenshotWidth}}{\text{viewportWidth}}$$
  $$\text{scaleY} = \frac{\text{screenshotHeight}}{\text{viewportHeight}}$$
- Overlays on the live webpage are rendered at exact 1:1 CSS pixel coordinates to eliminate misalignment risks.
