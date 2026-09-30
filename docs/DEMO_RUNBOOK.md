# VEILAGENT — Hackathon Demonstration Runbook

> **Event:** Smart India Hackathon / ISRO Evaluation  
> **Problem Statement ID:** 26171: On-device Visual Perception for Light-weight Browser Agents  
> **Presentation Duration:** 5–7 Minutes  
> **Speaker Role:** Lead Full-Stack & AI Privacy Engineer

---

## 1. The Core Pitch (30 Seconds)

> *"Respected Judges, current multimodal web agents ask users to surrender their entire visual screen to third-party cloud LLMs. That means your bank accounts, OTPs, Aadhaar numbers, work passwords, and personal faces are streamed unredacted to external servers.*  
>  
> *With **VEILAGENT**, our thesis is simple: **Give AI access to the task, not to the user's private screen.**  
>  
> *We prove this with a lightweight 4-stage architecture: **Local Perception + Local Privacy Enforcement + Remote Reasoning + Local Action Validation**."*

---

## 2. Live Demo Script (Step-by-Step)

### Step 1: Show the Unprotected Webpage
- Open the synthetic portal page (`Account Settings`).
- Point out the sensitive data:
  1. Full Name: `"Rahul Sharma"`
  2. Email: `"rahul.sharma@example.com"`
  3. Phone: `"+91 98765 43210"`
  4. Password: `"SuperSecretPassword123!"`
  5. Credit Card: `"4532 8901 2345 6789"`
  6. Indian PAN: `"ABCDE1234F"`
  7. High-resolution Biometric Headshot photo.

### Step 2: Trigger Local Perception Scan
- Click **"Analyze Page"** in the VEILAGENT UI.
- Direct the judge's eyes to the screen:
  - **Red Bounding Boxes** highlight all 6 sensitive fields and the face image.
  - Notice the tags: `[PERSON]`, `[EMAIL]`, `[PHONE]`, `[PASSWORD]`, `[CARD]`, `[PAN]`, `[FACE MASKED]`.
  - **Green Bounding Box** highlights the actionable target: `[AGENT TARGET: Save Changes]`.
- State to the judges:
  > *"Notice that this detection ran 100% locally on this machine using DOM semantics, pattern heuristics, and an on-device MediaPipe neural vision model. No network request was made yet."*

### Step 3: Inspect the Privacy Boundary & Network Request
- Toggle the **"Sanitized Payload Inspector"**.
- Challenge the judges:
  > *"Look at the JSON payload prepared for transmission. Does 'rahul.sharma@example.com' exist here? No, it has been replaced with '[EMAIL]'. Does the credit card exist? No, '[CARD]'. And the face image on canvas has been pixel-masked.*  
  > *Our Outgoing Payload Safety Validator re-scanned this payload before dispatch and verified: **Raw PII Transmitted: 0**."*

### Step 4: Run the Agent & Action Guard
- Click **"Run Agent"** with task: *"Find and click the Save Changes button"*.
- Observe:
  1. The server VLM (Gemini 3.5 Flash-Lite / Mock) reasons over the sanitized context and returns structured JSON:
     `{ action: "click", element_id: "btn_save", confidence: 0.98 }`
  2. The **Local Action Guard** intercepts this:
     - Confirms element `btn_save` exists in live DOM.
     - Confirms it is visible and enabled.
     - Confirms confidence is `0.98 >= 0.80`.
     - Confirms action is non-destructive.
  3. The browser executes `element.click()`.
  4. The page displays the green success banner: **"Saved successfully! Changes updated in portal record."**

### Step 5: Conclude with Measurable Metrics
- Point to the metrics dashboard:
  - **Local Perception Latency:** ~35–50 ms
  - **Redaction Overhead:** ~2–5 ms
  - **Redacted Fields:** 6 fields + 1 face
  - **Raw PII Leaked:** **0 bytes**
  - **Task Completion:** 100% successful grounded action.
