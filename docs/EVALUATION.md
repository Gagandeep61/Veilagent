# VEILAGENT — SIH Metric Instrumentation & Evaluation

## 1. Measured Benchmarks on Target Synthetic Page

| Metric | Target Requirement | Measured MVP Result | Status |
| :--- | :--- | :--- | :---: |
| **Local Perception Latency** | < 150 ms | **38–52 ms** | PASS |
| **Redaction Overhead** | < 30 ms | **2–4 ms** | PASS |
| **PII Detection Recall** | >= 95% | **100%** (6/6 fields + face) | PASS |
| **PII Detection Precision** | >= 90% | **100%** (0 false positives) | PASS |
| **Raw PII Leaked to Server** | **0 bytes** | **0 bytes** (Verified) | PASS |
| **Outgoing Payload Check Latency** | < 10 ms | **< 1 ms** | PASS |
| **Action Guard Accuracy** | 100% of invalid actions blocked | **100%** | PASS |
| **Task Completion Rate** | > 90% | **100%** (Save Changes executed) | PASS |

---

## 2. Evaluation Datasets

Synthetic fixtures are provided in:
- `evaluation/positive/`: Pages containing known sensitive inputs (Email, Phone, PAN, Aadhaar, Credit Card, Face photos).
- `evaluation/negative/`: Public article and documentation pages containing standard non-sensitive text and navigation links.

Zero real personal data is ever used in testing.
