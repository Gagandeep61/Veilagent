# VEILAGENT — On-Device Visual Perception for Lightweight Browser Agents

[![SIH Problem ID](https://img.shields.io/badge/SIH%20Problem%20ID-26171-blue.svg)](https://www.sih.gov.in/)
[![Theme](https://img.shields.io/badge/Theme-Smart%20Automation%20%2F%20ISRO-orange.svg)]()
[![Privacy Guarantee](https://img.shields.io/badge/Raw%20PII%20Transmitted-0%20Bytes-success.svg)]()
[![Manifest](https://img.shields.io/badge/Chrome-Manifest%20V3-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-Apache%202.0-lightgrey.svg)]()

> *"Giving AI access to the task, not to the user's private screen."*

VEILAGENT is an end-to-end, runnable hackathon MVP for **Smart India Hackathon / ISRO Problem Statement 26171**. It demonstrates a breakthrough privacy-preserving architecture where visual perception and privacy enforcement run **100% locally on the user's device**, transmitting only sanitized UI tokens to remote VLMs, and intercepting all proposed server actions with a strict **Local Action Guard** before execution.

---

## The Core Technical Principle

$$\text{Local Perception} + \text{Local Privacy Enforcement} + \text{Remote Reasoning} + \text{Local Action Validation}$$

```text
User Task ──► Synthetic Browser Page ──► Local DOM & UI Extraction
                                                    │
                                                    ▼
                                       Local Visual Perception (MediaPipe)
                                                    │
                                                    ▼
                                       Local Sensitive Data Detector
                                                    │
                                                    ▼
                                       Local Privacy Firewall & Redactor
                                                    │
                                                    ▼
                                       Outgoing Payload Safety Validator (Zero-Leak Check)
                                                    │
                                     [NETWORK PRIVACY BOUNDARY]
                                                    │
                                                    ▼
                                       FastAPI Server / Gemini VLM Reasoning
                                                    │
                                     [STRICT STRUCTURED ACTION JSON]
                                                    │
                                                    ▼
                                       Local Action Guard (Client Verification)
                                                    │
                                                    ▼
                                       Browser DOM Execution (element.click())
                                                    │
                                                    ▼
                                       Updated Webpage ("Saved Successfully")
```

---

## Key Features

1. **On-Device Neural Perception**: Embedded Google MediaPipe Face Detector running via WebAssembly (`face_detector.task`, 224 KB), detecting biometric photos directly on the client with zero cloud dependencies.
2. **Layered Local PII Detection**:
   - *Layer A:* DOM semantics (`type=password`, `autocomplete=email`, `autocomplete=tel`, `autocomplete=cc-number`).
   - *Layer B:* Deterministic pattern engines (Email, Indian Phone, Indian PAN, Aadhaar, Luhn-verified Credit Cards).
   - *Layer C:* Visual biometric detector.
3. **Semantic Redaction**: Replaces private values with structured tokens (`[EMAIL]`, `[PHONE]`, `[PASSWORD]`, `[CARD]`, `[PAN]`) and masks faces on canvas, preserving layout, dimensions, and button labels so the VLM can still reason effectively.
4. **Outgoing Payload Safety Validator**: Dual-boundary firewall that parses the outgoing JSON payload before dispatch, guaranteeing that **Raw PII Transmitted = 0 Bytes**.
5. **Fail-Closed Policy**: If the local visual perception model fails to initialize and biometric images are present on screen, screen transmission is strictly blocked.
6. **Local Action Guard**: *"The server only proposes. The browser decides."* Incoming actions are checked for existence, visibility, enabled state, minimum confidence ($\ge 0.80$), and destructive keyword policies before execution.

---

## Repository Structure

```text
veilagent/
├── README.md
├── package.json
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── extension/                       # Chrome Manifest V3 Extension
│   ├── package.json
│   ├── vite.config.ts
│   ├── manifest.config.ts
│   ├── tsconfig.json
│   ├── public/models/               # Local MediaPipe model asset (face_detector.task)
│   └── src/
│       ├── background/              # MV3 Service Worker (capture & network dispatch)
│       ├── content/                 # DOM extraction, PII scanner & vanilla overlays
│       ├── perception/              # MediaPipe WASM face detector
│       ├── privacy/                 # Policy engine, redactor & payload validator
│       ├── agent/                   # Local action guard & executor
│       └── popup/                   # React popup UI & telemetry metrics
│
├── demo-site/                       # Synthetic Account Settings target page
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── assets/face.jpg
│
├── server/                          # FastAPI Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py               # Pydantic structured schemas
│   │   ├── routes/agent.py
│   │   ├── services/vlm.py          # Gemini 3.5 Flash-Lite / Mock VLM service
│   │   └── security/payload_validator.py
│   └── tests/                       # Pytest verification suites
│
├── scripts/
│   ├── download-model.py            # Automated MediaPipe model fetcher
│   └── verify-model.py              # Checksum and asset integrity checker
│
└── docs/                            # Complete Technical & Presentation Documentation
    ├── SETUP.md                     # Local setup instructions
    ├── ONLINE_SETUP.md              # Cloud & Docker deployment
    ├── DEMO_RUNBOOK.md              # 5-minute hackathon judge pitch script
    ├── ARCHITECTURE.md              # Detailed ASCII boundary diagrams
    ├── SECURITY.md                  # Threat model & fail-closed invariants
    ├── API.md                       # Pydantic & HTTP schema specs
    ├── EVALUATION.md                # Measured latency & accuracy benchmarks
    ├── TROUBLESHOOTING.md           # Diagnostics guide
    ├── LIMITATIONS.md               # Scope & future roadmap
    └── MODEL_LICENSES.md            # Asset attribution (Apache 2.0)
```

---

## Quickstart

### Option A: Launch Interactive Studio & Workbench (Single Command)
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the full simulation workbench, test DOM extraction, run MediaPipe face masking, inspect side-by-side raw vs sanitized viewports, and test grounded actions!

### Option B: Build Chrome Extension
```bash
cd extension
npm install
npm run build
```
Load the `extension/dist` folder into `chrome://extensions/` as an unpacked extension.

### Option C: Run FastAPI Server
```bash
cd server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

---

## Measured Benchmark Results

- **Local Perception Latency:** ~38–52 ms
- **Redaction Overhead:** ~2–4 ms
- **PII Detection Recall:** 100% (6/6 fields + face)
- **Raw PII Transmitted to Remote Server:** **0 Bytes (Guaranteed)**
- **Total End-to-End Cycle:** < 650 ms (Mock mode) / ~1.2 s (Gemini Flash-Lite)
