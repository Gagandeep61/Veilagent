# VEILAGENT — Online Deployment Guide

This guide describes how to deploy the VEILAGENT FastAPI reasoning server to production or cloud environments.

---

## 1. Generic Docker Deployment (Any VPS / Cloud Run / Render)

### Build and Run with Docker
```bash
# Build the production container
docker build -t veilagent-server ./server

# Run the container
docker run -d \
  -p 8000:8000 \
  -e PORT=8000 \
  -e GEMINI_API_KEY="your-gemini-api-key" \
  -e GEMINI_MODEL="gemini-3.1-flash-lite" \
  -e MOCK_VLM="false" \
  -e ALLOWED_EXTENSION_ORIGIN="*" \
  --name veilagent-server \
  veilagent-server
```

Verify deployment:
```bash
curl https://your-domain.com/health
```

---

## 2. Docker Compose Deployment

```bash
# Set your environment variables in .env
cp .env.example .env
# Edit .env to add your GEMINI_API_KEY

# Launch both the server and synthetic demo site
docker-compose up -d
```

- Server is accessible at: `http://localhost:8000`
- Demo site is accessible at: `http://localhost:8080`

---

## 3. Configuring the Chrome Extension for Remote Backend

When pointing the extension to your deployed server:
1. Update `VITE_API_URL` in `extension/.env` to `https://your-domain.com`.
2. In `extension/manifest.config.ts`, ensure `host_permissions` includes `https://your-domain.com/*`.
3. Rebuild the extension with `npm run build` inside `extension/`.
