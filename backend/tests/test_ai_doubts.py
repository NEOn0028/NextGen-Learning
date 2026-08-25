"""Tests for AI Doubt Assistant with multi-model support (GPT-5.2, Claude Sonnet 5, Claude Haiku 4.5)"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://board-ready-3.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "teststudent@nextgen.com"
STUDENT_PASSWORD = "test123"


@pytest.fixture(scope="module")
def student_token():
    # Try login; if fails, register
    r = requests.post(f"{API}/auth/login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD})
    if r.status_code != 200:
        reg = requests.post(f"{API}/auth/register", json={
            "email": STUDENT_EMAIL,
            "password": STUDENT_PASSWORD,
            "name": "Test Student",
            "role": "student"
        })
        assert reg.status_code in (200, 201), f"Register failed: {reg.text}"
        return reg.json()["token"]
    return r.json()["token"]


@pytest.fixture
def auth_headers(student_token):
    return {"Authorization": f"Bearer {student_token}"}


# ---- AI Models endpoint ----

def test_get_ai_models_list():
    r = requests.get(f"{API}/ai-models")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    ids = [m["id"] for m in data]
    assert "gpt-5.2" in ids
    assert "claude-sonnet-5" in ids
    assert "claude-haiku-4.5" in ids
    for m in data:
        assert "name" in m and "description" in m


# ---- Doubt creation with each model ----

@pytest.mark.parametrize("model_id", ["gpt-5.2", "claude-sonnet-5", "claude-haiku-4.5"])
def test_create_doubt_with_ai_model(auth_headers, model_id):
    payload = {
        "subject": "Mathematics",
        "message": "What is 12 x 8? Explain briefly.",
        "use_ai": True,
        "ai_model": model_id
    }
    r = requests.post(f"{API}/doubts", json=payload, headers=auth_headers, timeout=90)
    assert r.status_code == 200, f"Failed for {model_id}: {r.status_code} - {r.text}"
    data = r.json()
    assert data["subject"] == "Mathematics"
    assert data["message"] == payload["message"]
    # AI response should be produced
    assert data.get("is_ai_response") is True, f"AI response missing for {model_id}: {data}"
    assert data.get("ai_response"), f"Empty ai_response for {model_id}"
    assert isinstance(data["ai_response"], str)
    assert len(data["ai_response"]) > 5
    # ai_model label should be present
    assert data.get("ai_model"), f"ai_model label missing for {model_id}"


def test_create_doubt_without_ai(auth_headers):
    payload = {
        "subject": "Physics",
        "message": "TEST_no_ai question",
        "use_ai": False,
        "ai_model": "gpt-5.2"
    }
    r = requests.post(f"{API}/doubts", json=payload, headers=auth_headers, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data["is_ai_response"] is False
    assert data.get("ai_response") in (None, "")


def test_get_student_doubts(auth_headers):
    r = requests.get(f"{API}/doubts/student", headers=auth_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
