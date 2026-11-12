"""Funciones hash SHA-256 y SHA-512."""

from __future__ import annotations

import hashlib
import hmac

ALGORITHMS: dict[str, int] = {
    "sha256": 256,
    "sha512": 512,
}


def _build_hash(algorithm: str):
    try:
        constructor = getattr(hashlib, algorithm)
    except AttributeError as exc:  # pragma: no cover - protegido por el schema
        raise ValueError(f"Algoritmo no soportado: {algorithm}") from exc
    return constructor()


def generate_hash(text: str, algorithm: str) -> str:
    """Calcula el hash hexadecimal de ``text`` con el algoritmo indicado."""
    digest = _build_hash(algorithm)
    digest.update(text.encode("utf-8"))
    return digest.hexdigest()


def verify_hash(text: str, algorithm: str, expected_hash: str) -> tuple[bool, str]:
    """Compara el hash calculado con ``expected_hash`` en tiempo constante."""
    computed = generate_hash(text, algorithm)
    normalized = "".join(expected_hash.split()).lower()
    return hmac.compare_digest(computed, normalized), computed


def hash_bits(algorithm: str) -> int:
    """Devuelve el tamaño en bits del algoritmo indicado."""
    if algorithm not in ALGORITHMS:
        raise ValueError(f"Algoritmo no soportado: {algorithm}")
    return ALGORITHMS[algorithm]
