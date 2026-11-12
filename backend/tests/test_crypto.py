import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.atbash import AtbashError, atbash

client = TestClient(app)

SHA256_ABC = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
SHA512_ABC = (
    "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a"
    "2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_atbash_service_uppercases_letters() -> None:
    assert atbash("hello") == "SVOOL"
    assert atbash("HolaMundo") == "SLOZNFMWL"
    assert atbash("abcXYZ") == "ZYXCBA"


@pytest.mark.parametrize(
    "value",
    ["Hola mundo", "ABC123", "HOLA!", "AÑO", "ÁRBOL", "ñ", "HOLA-MUNDO"],
)
def test_atbash_service_rejects_invalid_characters(value: str) -> None:
    with pytest.raises(AtbashError):
        atbash(value)


def test_atbash_is_symmetric() -> None:
    original = "LAPRIVACIDADESUNDERECHOFUNDAMENTAL"
    assert atbash(atbash(original)) == original


def test_atbash_endpoint_both_modes() -> None:
    for mode in ("encrypt", "decrypt"):
        response = client.post("/api/atbash", json={"text": "Hello", "mode": mode})
        assert response.status_code == 200
        assert response.json() == {"result": "SVOOL"}


def test_atbash_endpoint_normalizes_to_uppercase() -> None:
    response = client.post("/api/atbash", json={"text": "hello", "mode": "encrypt"})
    assert response.status_code == 200
    assert response.json() == {"result": "SVOOL"}


@pytest.mark.parametrize(
    "text",
    ["Hola mundo", "ABC123", "HOLA!", "AÑO", "ÁRBOL", "   ", "HOLA-MUNDO"],
)
def test_atbash_rejects_invalid_characters(text: str) -> None:
    response = client.post("/api/atbash", json={"text": text, "mode": "encrypt"})
    assert response.status_code == 422


def test_atbash_rejects_empty_text() -> None:
    response = client.post("/api/atbash", json={"text": "", "mode": "encrypt"})
    assert response.status_code == 422


def test_sha256_known_vector() -> None:
    response = client.post("/api/hash", json={"text": "abc", "algorithm": "sha256"})
    assert response.status_code == 200
    body = response.json()
    assert body["hash"] == SHA256_ABC
    assert body["bits"] == 256
    assert len(body["hash"]) == 64


def test_sha512_known_vector() -> None:
    response = client.post("/api/hash", json={"text": "abc", "algorithm": "sha512"})
    assert response.status_code == 200
    body = response.json()
    assert body["hash"] == SHA512_ABC
    assert body["bits"] == 512
    assert len(body["hash"]) == 128


def test_hash_both_known_vectors() -> None:
    response = client.post("/api/hash/both", json={"text": "abc"})
    assert response.status_code == 200
    body = response.json()
    assert body["sha256"] == {
        "algorithm": "sha256",
        "hash": SHA256_ABC,
        "bits": 256,
    }
    assert body["sha512"] == {
        "algorithm": "sha512",
        "hash": SHA512_ABC,
        "bits": 512,
    }


def test_hash_both_rejects_empty_text() -> None:
    response = client.post("/api/hash/both", json={"text": ""})
    assert response.status_code == 422


def test_hash_rejects_unknown_algorithm() -> None:
    response = client.post("/api/hash", json={"text": "abc", "algorithm": "md5"})
    assert response.status_code == 422


@pytest.mark.parametrize(
    "text",
    ["Hola mundo", "ABC123", "HOLA!", "Árbol", "AÑO", "sha256", "hola-mundo"],
)
def test_hash_rejects_invalid_text(text: str) -> None:
    response = client.post(
        "/api/hash", json={"text": text, "algorithm": "sha256"}
    )
    assert response.status_code == 422


@pytest.mark.parametrize(
    "text",
    ["Hola mundo", "ABC123", "HOLA!", "Árbol", "AÑO", "sha256", "hola-mundo"],
)
def test_hash_both_rejects_invalid_text(text: str) -> None:
    response = client.post("/api/hash/both", json={"text": text})
    assert response.status_code == 422


@pytest.mark.parametrize(
    "text",
    ["Hola mundo", "ABC123", "HOLA!", "Árbol", "AÑO", "sha256", "hola-mundo"],
)
def test_verify_rejects_invalid_text(text: str) -> None:
    response = client.post(
        "/api/verify",
        json={"text": text, "algorithm": "sha256", "expected_hash": SHA256_ABC},
    )
    assert response.status_code == 422


def test_hash_accepts_mixed_case_letters() -> None:
    response = client.post(
        "/api/hash", json={"text": "HolaMundoSeguro", "algorithm": "sha512"}
    )
    assert response.status_code == 200
    assert len(response.json()["hash"]) == 128


def test_hash_both_accepts_letters_only() -> None:
    response = client.post("/api/hash/both", json={"text": "HolaMundo"})
    assert response.status_code == 200
    body = response.json()
    assert len(body["sha256"]["hash"]) == 64
    assert len(body["sha512"]["hash"]) == 128


def test_verify_match() -> None:
    response = client.post(
        "/api/verify",
        json={"text": "abc", "algorithm": "sha256", "expected_hash": SHA256_ABC},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["match"] is True
    assert body["computed_hash"] == SHA256_ABC


def test_verify_is_case_and_space_insensitive() -> None:
    spaced = SHA256_ABC.upper()[:32] + " " + SHA256_ABC.upper()[32:]
    response = client.post(
        "/api/verify",
        json={"text": "abc", "algorithm": "sha256", "expected_hash": spaced},
    )
    assert response.status_code == 200
    assert response.json()["match"] is True


def test_verify_no_match() -> None:
    response = client.post(
        "/api/verify",
        json={"text": "abcd", "algorithm": "sha256", "expected_hash": SHA256_ABC},
    )
    assert response.status_code == 200
    assert response.json()["match"] is False


def test_verify_rejects_non_hex_hash() -> None:
    response = client.post(
        "/api/verify",
        json={"text": "abc", "algorithm": "sha256", "expected_hash": "no-es-hex"},
    )
    assert response.status_code == 422
