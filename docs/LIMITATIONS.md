# VEILAGENT — MVP Limitations & Future Roadmap

## Current Hackathon MVP Scope & Limitations

1. **Browser Target:** Developed and optimized for Chromium-based browsers (Google Chrome, Microsoft Edge, Brave) running Manifest V3. Firefox Manifest V2/V3 has not been validated for this MVP.
2. **Action Domain:** Supports single-turn grounded `click` and `scroll` actions. Does not support arbitrary typing of user credentials or multi-step autonomous browsing loops.
3. **Synthetic Evaluation:** Evaluated on synthetic and controlled enterprise portal fixtures. Not formally certified under statutory DPDP Act or GDPR legal compliance frameworks.
4. **Local Vision Model:** Uses Google MediaPipe BlazeFace for on-device face perception. Complex multi-class visual document analysis (passport OCR, signature segmentation) is reserved for future versions.
5. **Character Budget:** Non-sensitive textual UI context is capped at 5,000 characters to conserve VLM bandwidth and latency.

---

## Future Roadmap

- **Open-Weight On-Premise VLM:** Support for self-hosted Qwen2-VL or Qwen3-VL running via vLLM for air-gapped defense and government deployments.
- **Transformers.js Local Text Embeddings:** On-device semantic field classification.
- **Audio & Video Guardrails:** Extending on-device perception to protect microphone and video streams during agent interactions.
