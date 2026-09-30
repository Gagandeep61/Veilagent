import pytest
from app.schemas import AgentActRequest, UIElement, ViewportInfo
from app.security.payload_validator import validate_outgoing_payload_safety

def test_sanitized_payload_is_approved():
    request = AgentActRequest(
        task="Click save changes",
        ui_metadata=[
            UIElement(
                element_id="input_email",
                tag="input",
                role="textbox",
                label="[EMAIL]",
                bbox=(10, 20, 100, 40),
                visible=True
            ),
            UIElement(
                element_id="input_card",
                tag="input",
                role="textbox",
                label="[CARD]",
                bbox=(10, 50, 100, 70),
                visible=True
            ),
            UIElement(
                element_id="btn_save",
                tag="button",
                role="button",
                label="Save Changes",
                bbox=(10, 80, 100, 100),
                visible=True
            )
        ],
        viewport=ViewportInfo(width=1280, height=800)
    )
    is_safe, error = validate_outgoing_payload_safety(request)
    assert is_safe is True
    assert error is None

def test_raw_email_triggers_fail_closed_rejection():
    request = AgentActRequest(
        task="Click save changes",
        ui_metadata=[
            UIElement(
                element_id="input_email",
                tag="input",
                role="textbox",
                label="rahul.sharma@example.com",
                bbox=(10, 20, 100, 40),
                visible=True
            )
        ],
        viewport=ViewportInfo(width=1280, height=800)
    )
    is_safe, error = validate_outgoing_payload_safety(request)
    assert is_safe is False
    assert "Email detected" in error

def test_raw_card_triggers_fail_closed_rejection():
    request = AgentActRequest(
        task="Click save changes",
        ui_metadata=[
            UIElement(
                element_id="input_card",
                tag="input",
                role="textbox",
                label="4111111111111111",
                bbox=(10, 20, 100, 40),
                visible=True
            )
        ],
        viewport=ViewportInfo(width=1280, height=800)
    )
    is_safe, error = validate_outgoing_payload_safety(request)
    assert is_safe is False
    assert "Credit Card detected" in error
