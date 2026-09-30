# VEILAGENT — Local Setup & Execution Guide

Follow these instructions to run VEILAGENT from scratch.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Google Chrome**: Latest version (Manifest V3 support)
- **Git**

---

## 2. Quickstart with Interactive Studio (Single Command)

The project includes an all-in-one interactive Workbench & Dev Server:

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Visit `http://localhost:3000` to launch the **VEILAGENT Interactive Studio & Simulation Workbench**.

---

## 3. Chrome Extension Setup

```bash
# Navigate to the extension directory
cd extension

# Install extension dependencies
npm install

# Verify the on-device face detector model is downloaded
python3 ../scripts/verify-model.py

# Build the extension with CRXJS
npm run build
```

### Loading the Extension into Chrome:
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked**.
4. Select the `extension/dist/` directory.
5. The **VEILAGENT** shield icon will appear in your Chrome toolbar.

---

## 4. Standalone FastAPI Server Setup

To run the Python FastAPI backend separately:

```bash
cd server

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run server with Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Test health endpoint:
```bash
curl http://localhost:8000/health
```

---

## 5. Standalone Synthetic Demo Website

To run the synthetic demo site independently:

```bash
cd demo-site
npx vite --port 3001
```
Open `http://localhost:3001` in Chrome with the unpacked VEILAGENT extension enabled.
