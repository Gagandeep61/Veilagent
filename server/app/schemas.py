from typing import Literal, List, Tuple
from pydantic import BaseModel, Field

class UIElement(BaseModel):
    element_id: str
    tag: str
    role: str
    label: str
    bbox: Tuple[float, float, float, float]
    visible: bool
    disabled: bool = False
    type: str | None = None

class ViewportInfo(BaseModel):
    width: float
    height: float
    devicePixelRatio: float = 1.0

class AgentActRequest(BaseModel):
    task: str = Field(..., max_length=500, description="User instruction for the agent")
    sanitized_screenshot_base64: str | None = Field(None, description="JPEG base64 encoded sanitized screenshot")
    ui_metadata: List[UIElement] = Field(..., description="Sanitized interactive UI element hierarchy")
    viewport: ViewportInfo

class ActionResponse(BaseModel):
    action: Literal["click", "scroll", "none"]
    element_id: str | None = None
    x: float | None = None
    y: float | None = None
    direction: Literal["up", "down"] | None = None
    amount: int | None = None
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: str | None = None

class HealthResponse(BaseModel):
    status: str
    mode: Literal["mock", "gemini"]
    model: str
    service: str
    version: str
    privacy_boundary: str
