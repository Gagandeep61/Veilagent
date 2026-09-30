# VEILAGENT — Environment Variables Specification

| Variable Name | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | No (if Mock) | `""` | Google Gemini API Key. Required when `MOCK_VLM=false`. |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` | Model alias for multimodal VLM reasoning (`gemini-3.1-flash-lite` or `gemini-3.8-flash`). |
| `MOCK_VLM` | No | `true` | When `true`, activates deterministic local reasoning without external API calls. |
| `PORT` | No | `3000` (Node) / `8000` (Py) | Port for the backend reasoning server. |
| `VITE_API_URL` | No | `http://localhost:3000` | Backend API URL used by the extension and workbench. |
| `ALLOWED_EXTENSION_ORIGIN` | No | `*` | Allowed CORS origin for the extension (`chrome-extension://*`). |
