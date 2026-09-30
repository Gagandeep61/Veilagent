import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "VEILAGENT Server"
    assert data["privacy_boundary"] == "enforced"

def test_agent_act_sanitized_success():
    payload = {
        "task": "Click save",
        "ui_metadata": [
            {
                "element_id": "submit_btn",
                "tag": "button",
                "role": "button",
                "label": "Save Changes",
                "bbox": [100.0, 200.0, 220.0, 240.0],
                "visible": True,
                "disabled": False
            }
        ],
        "viewport": {
            "width": 1280.0,
            "height": 720.0,
            "devicePixelRatio": 1.0
        }
    }
    response = client.post("/api/v1/agent/act", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "click"
    assert data["element_id"] == "submit_btn"

def test_agent_act_blocks_unredacted_pii():
    payload = {
        "task": "Click save",
        "ui_metadata": [
            {
                "element_id": "input_email",
                "tag": "input",
                "role": "textbox",
                "label": "user.leaked@company.org",
                "bbox": [10.0, 20.0, 150.0, 50.0],
                "visible": True,
                "disabled": False
            }
        ],
        "viewport": {
            "width": 1280.0,
            "height": 720.0,
            "devicePixelRatio": 1.0
        }
    }
    response = client.post("/api/v1/agent/act", json=payload)
    assert response.status_code == 400
    detail = response.json()["detail"]
    assert detail["error"] == "Privacy Invariant Violation"
