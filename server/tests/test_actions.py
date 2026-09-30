import pytest
from app.schemas import AgentActRequest, UIElement, ViewportInfo
from app.services.vlm import run_mock_reasoning

def test_mock_reasoning_click_action():
    request = AgentActRequest(
        task="Find and click the Save Changes button",
        ui_metadata=[
            UIElement(
                element_id="btn_cancel",
                tag="button",
                role="button",
                label="Cancel",
                bbox=(100, 300, 180, 340),
                visible=True
            ),
            UIElement(
                element_id="btn_save",
                tag="button",
                role="button",
                label="Save Changes",
                bbox=(200, 300, 320, 340),
                visible=True
            )
        ],
        viewport=ViewportInfo(width=1280, height=800)
    )

    action = run_mock_reasoning(request)
    assert action.action == "click"
    assert action.element_id == "btn_save"
    assert action.x == 260.0
    assert action.y == 320.0
    assert action.confidence >= 0.80

def test_mock_reasoning_scroll_action():
    request = AgentActRequest(
        task="Scroll down to view billing history",
        ui_metadata=[],
        viewport=ViewportInfo(width=1280, height=800)
    )

    action = run_mock_reasoning(request)
    assert action.action == "scroll"
    assert action.direction == "down"
    assert action.amount == 300
