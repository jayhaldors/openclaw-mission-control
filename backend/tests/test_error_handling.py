from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

from app.core.error_handling import REQUEST_ID_HEADER, install_error_handling


def test_request_validation_error_includes_request_id():
    app = FastAPI()
    install_error_handling(app)

    @app.get("/needs-int")
    def needs_int(limit: int) -> dict[str, int]:
        return {"limit": limit}

    client = TestClient(app)
    resp = client.get("/needs-int?limit=abc")

    assert resp.status_code == 422
    body = resp.json()
    assert isinstance(body.get("detail"), list)
    assert isinstance(body.get("request_id"), str) and body["request_id"]
    assert resp.headers.get(REQUEST_ID_HEADER) == body["request_id"]


def test_http_exception_includes_request_id():
    app = FastAPI()
    install_error_handling(app)

    @app.get("/nope")
    def nope() -> None:
        raise HTTPException(status_code=404, detail="nope")

    client = TestClient(app)
    resp = client.get("/nope")

    assert resp.status_code == 404
    body = resp.json()
    assert body["detail"] == "nope"
    assert isinstance(body.get("request_id"), str) and body["request_id"]
    assert resp.headers.get(REQUEST_ID_HEADER) == body["request_id"]


def test_unhandled_exception_returns_500_with_request_id():
    app = FastAPI()
    install_error_handling(app)

    @app.get("/boom")
    def boom() -> None:
        raise RuntimeError("boom")

    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/boom")

    assert resp.status_code == 500
    body = resp.json()
    assert body["detail"] == "Internal Server Error"
    assert isinstance(body.get("request_id"), str) and body["request_id"]
    assert resp.headers.get(REQUEST_ID_HEADER) == body["request_id"]


def test_response_validation_error_returns_500_with_request_id():
    class Out(BaseModel):
        name: str = Field(min_length=1)

    app = FastAPI()
    install_error_handling(app)

    @app.get("/bad", response_model=Out)
    def bad() -> dict[str, str]:
        return {"name": ""}

    client = TestClient(app, raise_server_exceptions=False)
    resp = client.get("/bad")

    assert resp.status_code == 500
    body = resp.json()
    assert body["detail"] == "Internal Server Error"
    assert isinstance(body.get("request_id"), str) and body["request_id"]
    assert resp.headers.get(REQUEST_ID_HEADER) == body["request_id"]
