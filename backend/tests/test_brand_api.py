"""API regression tests for collection, fragrance detail, and lead capture flows."""

import asyncio
import os
import time
import uuid

import pytest
import requests
from dotenv import dotenv_values
from motor.motor_asyncio import AsyncIOMotorClient


def _load_base_url() -> str:
    env_url = os.environ.get("REACT_APP_BACKEND_URL")
    if env_url:
        return env_url.rstrip("/")
    values = dotenv_values("/app/frontend/.env")
    file_url = values.get("REACT_APP_BACKEND_URL")
    if not file_url:
        pytest.fail("REACT_APP_BACKEND_URL is missing; cannot run API tests")
    return str(file_url).rstrip("/")


BASE_URL = _load_base_url()
API_BASE = f"{BASE_URL}/api"


def _load_mongo_config() -> tuple[str, str]:
    values = dotenv_values("/app/backend/.env")
    mongo_url = values.get("MONGO_URL")
    db_name = values.get("DB_NAME")
    if not mongo_url or not db_name:
        pytest.fail("MONGO_URL or DB_NAME missing in /app/backend/.env")
    return str(mongo_url).strip('"'), str(db_name).strip('"')


MONGO_URL, DB_NAME = _load_mongo_config()


@pytest.fixture
def api_client():
    """Shared HTTP session for public endpoint API checks."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def cleanup_lead_ids():
    """Collect created lead IDs and cleanup test data in MongoDB after tests."""
    lead_ids = []
    yield lead_ids

    async def _cleanup():
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        try:
            if lead_ids:
                await db.leads.delete_many({"id": {"$in": lead_ids}})
            await db.leads.delete_many({"name": {"$regex": "^TEST_"}})
        finally:
            client.close()

    asyncio.run(_cleanup())


def _get_lead_from_db(lead_id: str):
    async def _query():
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        try:
            return await db.leads.find_one({"id": lead_id}, {"_id": 0})
        finally:
            client.close()

    return asyncio.run(_query())


class TestCollectionAndFragrances:
    """Collection and fragrance read endpoints."""

    def test_get_collection_returns_three_products_schema(self, api_client):
        response = api_client.get(f"{API_BASE}/collection", timeout=20)
        assert response.status_code == 200

        data = response.json()
        assert "products" in data and isinstance(data["products"], list)
        assert len(data["products"]) == 3
        assert data.get("shop_url") is None

        expected_ids = {"air", "skin", "forest"}
        seen_ids = {p["id"] for p in data["products"]}
        assert seen_ids == expected_ids

        for product in data["products"]:
            assert "_id" not in product
            assert isinstance(product["price"], int)
            assert product["price"] > 0
            assert isinstance(product["notes"], list)
            assert len(product["notes"]) == 3
            assert isinstance(product["pyramid"], dict)
            assert len(product["pyramid"]) == 3

    def test_get_air_fragrance_success(self, api_client):
        response = api_client.get(f"{API_BASE}/fragrances/air", timeout=20)
        assert response.status_code == 200

        data = response.json()
        assert data["id"] == "air"
        assert data["name"] == "Воздух"
        assert "_id" not in data
        assert data["price"] == 8900

    def test_get_unknown_fragrance_returns_404(self, api_client):
        response = api_client.get(f"{API_BASE}/fragrances/unknown-id", timeout=20)
        assert response.status_code == 404

        data = response.json()
        assert "detail" in data


class TestLeadsValidationAndPersistence:
    """Lead create endpoint validation, persistence, and throttling behavior."""

    def test_post_lead_email_persists_in_mongo(self, api_client, cleanup_lead_ids):
        unique = uuid.uuid4().hex[:8]
        payload = {
            "name": f"TEST_Email_{unique}",
            "contact": f"test_{unique}@example.com",
            "preference": "Люблю чистые и мускусные композиции",
            "product_id": "air",
            "intent": "selection",
            "consent": True,
        }

        response = api_client.post(f"{API_BASE}/leads", json=payload, timeout=20)
        assert response.status_code == 201

        data = response.json()
        assert isinstance(data.get("id"), str) and len(data["id"]) > 10
        assert "message" in data
        cleanup_lead_ids.append(data["id"])

        lead = _get_lead_from_db(data["id"])
        assert lead is not None
        assert lead["name"] == payload["name"]
        assert lead["contact"] == payload["contact"].lower()
        assert lead["product_id"] == "air"
        assert lead["intent"] == "selection"
        assert lead["consent"] is True

    def test_post_lead_phone_normalizes_and_persists(self, api_client, cleanup_lead_ids):
        unique_digits = str(int(time.time()))[-6:]
        raw_phone = f"+7 (999) 12{unique_digits[:2]}-{unique_digits[2:]}"
        payload = {
            "name": f"TEST_Phone_{unique_digits}",
            "contact": raw_phone,
            "preference": "",
            "product_id": "skin",
            "intent": "availability",
            "consent": True,
        }

        response = api_client.post(f"{API_BASE}/leads", json=payload, timeout=20)
        assert response.status_code == 201

        data = response.json()
        cleanup_lead_ids.append(data["id"])
        lead = _get_lead_from_db(data["id"])

        assert lead is not None
        assert lead["name"] == payload["name"]
        assert lead["product_id"] == "skin"
        assert lead["intent"] == "availability"
        assert lead["contact"].startswith("+")
        assert "(" not in lead["contact"] and " " not in lead["contact"] and "-" not in lead["contact"]

    @pytest.mark.parametrize(
        "payload, expected_status",
        [
            ({"name": "TEST_Valid", "contact": "invalid@", "preference": "", "product_id": "air", "intent": "selection", "consent": True}, 422),
            ({"name": "TEST_Valid", "contact": "12345", "preference": "", "product_id": "air", "intent": "selection", "consent": True}, 422),
            ({"name": " ", "contact": "test@example.com", "preference": "", "product_id": "air", "intent": "selection", "consent": True}, 422),
            ({"name": "A", "contact": "test@example.com", "preference": "", "product_id": "air", "intent": "selection", "consent": True}, 422),
            ({"name": "TEST_NoConsent", "contact": "test@example.com", "preference": "", "product_id": "air", "intent": "selection", "consent": False}, 422),
            ({"name": "TEST_NoConsentField", "contact": "test@example.com", "preference": "", "product_id": "air", "intent": "selection"}, 422),
            ({"name": "TEST_UnknownProduct", "contact": "test@example.com", "preference": "", "product_id": "unknown", "intent": "selection", "consent": True}, 404),
            ({"name": "TEST_LongPreference", "contact": "test@example.com", "preference": "x" * 1001, "product_id": "air", "intent": "selection", "consent": True}, 422),
            ({"name": "TEST_InvalidIntent", "contact": "test@example.com", "preference": "", "product_id": "air", "intent": "buy", "consent": True}, 422),
        ],
    )
    def test_post_lead_validation_errors(self, api_client, payload, expected_status):
        response = api_client.post(f"{API_BASE}/leads", json=payload, timeout=20)
        assert response.status_code == expected_status
        data = response.json()
        assert "detail" in data

    def test_post_lead_rate_limit_4_per_10min_then_429(self, api_client, cleanup_lead_ids):
        unique = str(int(time.time() * 1000))[-6:]
        contact = f"+7 (999) 77{unique[:2]}-{unique[2:]}"
        payload = {
            "name": f"TEST_Rate_{unique}",
            "contact": contact,
            "preference": "",
            "product_id": "forest",
            "intent": "selection",
            "consent": True,
        }

        for _ in range(4):
            response = api_client.post(f"{API_BASE}/leads", json=payload, timeout=20)
            assert response.status_code == 201
            cleanup_lead_ids.append(response.json()["id"])

        fifth = api_client.post(f"{API_BASE}/leads", json=payload, timeout=20)
        assert fifth.status_code == 429
        detail = fifth.json().get("detail")
        assert isinstance(detail, str) and len(detail) > 0
