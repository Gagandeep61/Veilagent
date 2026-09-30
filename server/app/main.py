import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .schemas import HealthResponse
from .routes.agent import router as agent_router

app = FastAPI(
    title="VEILAGENT Server",
    description="Privacy-Preserving Visual Perception & Browser Agent Backend",
    version="1.0.0"
)

# CORS Configuration
allowed_origin = os.getenv("ALLOWED_EXTENSION_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin] if allowed_origin != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(agent_router)

@app.get("/health", response_model=HealthResponse)
async def health():
    is_mock = os.getenv("MOCK_VLM", "true").lower() == "true" or not os.getenv("GEMINI_API_KEY")
    return HealthResponse(
        status="healthy",
        mode="mock" if is_mock else "gemini",
        model=os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite"),
        service="VEILAGENT Server",
        version="1.0.0",
        privacy_boundary="enforced"
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
