from fastapi import APIRouter, HTTPException, status
from ..schemas import AgentActRequest, ActionResponse
from ..security.payload_validator import validate_outgoing_payload_safety
from ..services.vlm import run_vlm_reasoning

router = APIRouter(prefix="/api/v1/agent", tags=["agent"])

@router.post("/act", response_model=ActionResponse)
async def act(request: AgentActRequest):
    # Enforce Server-Side Privacy Invariant
    is_safe, error_msg = validate_outgoing_payload_safety(request)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Privacy Invariant Violation",
                "message": error_msg,
                "policy": "FAIL-CLOSED: Server refused payload containing unredacted raw sensitive data."
            }
        )

    # Remote VLM Reasoning
    action_response = run_vlm_reasoning(request)
    return action_response
