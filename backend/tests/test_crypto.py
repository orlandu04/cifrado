"""Pruebas de la API y de los servicios criptográficos.

Se combinan pruebas unitarias de los servicios con pruebas de integración del
router mediante ``TestClient``. Los vectores SHA conocidos permiten detectar
regresiones en el cálculo de los hashes.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.atbash import AtbashError, atbash

client = TestClient(app)

# Vectores oficiales para el texto "ABC". Se usan en las pruebas de /api/hash.
# La API normaliza la entrada a mayúsculas antes de calcular el digest.
SHA256_ABC = "B5D4045C3F466FA91FE2CC6ABE79232A1A57CDF104F7A26E716E0A1E2789DF78"
SHA512_ABC = (
    "397118FDAC8D83AD98813C50759C85B8C47565D8268BF10DA483153B747A7474"
    "3A58A90E85AA9F705CE6984FFC128DB567489817E4092D050D8A1CC596DDC119"
)


# --- Estado de la API -------------------------------------------------------


def test_health() -> None:
    """El endpoint de salud responde correctamente cuando la app está activa."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# --- Servicio Atbash --------------------------------------------------------


def test_atbash_service_uppercases_letters() -> None:
    """Atbash acepta minúsculas y devuelve siempre mayúsculas."""
    assert atbash("hello") == "SVOOL"
    assert atbash("HolaMundo") == "SLOZNFMWL"
    assert atbash("abcXYZ") == "ZYXCBA"


@pytest.mark.parametrize(
    "value",
    ["Hola mundo", "ABC123", "HOLA!", "AÑO", "ÁRBOL", "ñ", "HOLA-MUNDO"],
)
def test_atbash_service_rejects_invalid_characters(value: str) -> None:
    """El servicio rechaza cualquier carácter fuera del alfabeto A-Z."""
    with pytest.raises(AtbashError):
        atbash(value)


def test_atbash_is_symmetric() -> None:
    """Aplicar Atbash dos veces recupera el texto original."""
    original = "LAPRIVACIDADESUNDERECHOFUNDAMENTAL"
    assert atbash(atbash(original)) == original


# --- Endpoint Atbash --------------------------------------------------------


def test_atbash_endpoint_both_modes() -> None:
    """El modo es informativo: cifrar y descifrar producen el mismo resultado."""
    for mode in ("encrypt", "decrypt"):
        response = client.post("/api/atbash", json={"text": "Hello", "mode": mode})
        assert response.status_code == 200
        assert response.json() == {"result": "SVOOL"}


def test_atbash_endpoint_normalizes_to_uppercase() -> None:
    """El schema normaliza el texto antes de llamar al servicio."""
    response = client.post("/api/atbash", json={"text": "hello", "mode": "encrypt"})
    assert response.status_code == 200
    assert response.json() == {"result": "SVOOL"}


@pytest.mark.parametrize(
    "text",
    ["Hola mundo", "ABC123", "HOLA!", "AÑO", "ÁRBOL", "   ", "HOLA-MUNDO"],
)
def test_atbash_rejects_invalid_characters(text: str) -> None:
    """La API responde 422 ante textos con caracteres no permitidos."""
    response = client.post("/api/atbash", json={"text": text, "mode": "encrypt"})
    assert response.status_code == 422


def test_atbash_rejects_empty_text() -> None:
    """El campo text tiene min_length=1 y no admite cadenas vacías."""
    response = client.post("/api/atbash", json={"text": "", "mode": "encrypt"})
    assert response.status_code == 422


# --- Endpoint de hashes -----------------------------------------------------


def test_sha256_known_vector() -> None:
    """SHA-256 de "abc" se normaliza a "ABC" y coincide con el vector oficial."""
    response = client.post("/api/hash", json={"text": "abc", "algorithm": "sha256"})
    assert response.status_code == 200
    body = response.json()
    assert body["hash"] == SHA256_ABC
    assert body["bits"] == 256
    assert len(body["hash"]) == 64


def test_sha512_known_vector() -> None:
    """SHA-512 de "abc" se normaliza a "ABC" y coincide con el vector oficial."""
    response = client.post("/api/hash", json={"text": "abc", "algorithm": "sha512"})
    assert response.status_code == 200
    body = response.json()
    assert body["hash"] == SHA512_ABC
    assert body["bits"] == 512
    assert len(body["hash"]) == 128


def test_hash_normalizes_case() -> None:
    """Minúsculas y mayúsculas producen el mismo hash, como en Atbash."""
    lowercase = client.post(
        "/api/hash", json={"text": "abcxyz", "algorithm": "sha256"}
    )
    uppercase = client.post(
        "/api/hash", json={"text": "ABCXYZ", "algorithm": "sha256"}
    )
    assert lowercase.status_code == 200
    assert uppercase.status_code == 200
    assert lowercase.json()["hash"] == uppercase.json()["hash"]


def test_hash_digest_is_uppercase() -> None:
    """El digest hexadecimal solo contiene mayúsculas (0-9 y A-F)."""
    for algorithm, length in (("sha256", 64), ("sha512", 128)):
        response = client.post(
            "/api/hash", json={"text": "abc", "algorithm": algorithm}
        )
        assert response.status_code == 200
        value = response.json()["hash"]
        assert len(value) == length
        assert value == value.upper()
        assert all(char in "0123456789ABCDEF" for char in value)


def test_hash_rejects_unknown_algorithm() -> None:
    """El literal Algorithm limita los valores a sha256 y sha512."""
    response = client.post("/api/hash", json={"text": "abc", "algorithm": "md5"})
    assert response.status_code == 422


@pytest.mark.parametrize(
    "text",
    ["Hola mundo", "ABC123", "HOLA!", "Árbol", "AÑO", "sha256", "hola-mundo"],
)
def test_hash_rejects_invalid_text(text: str) -> None:
    """La API rechaza textos con espacios, números, acentos o signos."""
    response = client.post(
        "/api/hash", json={"text": text, "algorithm": "sha256"}
    )
    assert response.status_code == 422


def test_hash_accepts_mixed_case_letters() -> None:
    """Mayúsculas y minúsculas son válidas y se normalizan antes de hashear."""
    mixed = client.post(
        "/api/hash", json={"text": "HolaMundoSeguro", "algorithm": "sha512"}
    )
    uppercase = client.post(
        "/api/hash", json={"text": "HOLAMUNDOSEGURO", "algorithm": "sha512"}
    )
    assert mixed.status_code == 200
    assert uppercase.status_code == 200
    assert mixed.json()["hash"] == uppercase.json()["hash"]
    assert len(mixed.json()["hash"]) == 128
