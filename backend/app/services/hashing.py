"""Funciones de hashing SHA-256 y SHA-512.

Se usa ``hashlib`` de la biblioteca estándar para evitar implementaciones
propias de criptografía. El texto se normaliza a mayúsculas y se codifica
siempre en UTF-8, aunque los schemas limitan la entrada a letras ASCII. El
digest se devuelve en hexadecimal con letras mayúsculas (A-F).
"""

from __future__ import annotations

import hashlib

# Tamaño en bits de cada algoritmo soportado. El diccionario actúa también
# como lista blanca para ``hash_bits``.
ALGORITHMS: dict[str, int] = {
    "sha256": 256,
    "sha512": 512,
}


def _build_hash(algorithm: str):
    """Crea una instancia de hashlib para ``algorithm``.

    El schema ya restringe los algoritmos válidos. La comprobación con
    ``getattr`` protege a los llamadores internos que no pasen por Pydantic.
    """
    try:
        constructor = getattr(hashlib, algorithm)
    except AttributeError as exc:  # pragma: no cover - protegido por el schema
        raise ValueError(f"Algoritmo no soportado: {algorithm}") from exc
    return constructor()


def generate_hash(text: str, algorithm: str) -> str:
    """Calcula el hash hexadecimal de ``text`` con el algoritmo indicado.

    El texto se normaliza a mayúsculas para que ``"abc"`` y ``"ABC"`` produzcan
    el mismo digest, y el resultado se devuelve en hexadecimal mayúsculo.
    """
    digest = _build_hash(algorithm)
    # UTF-8 convierte el texto en una secuencia de bytes estable y reproducible.
    digest.update(text.upper().encode("utf-8"))
    return digest.hexdigest().upper()


def hash_bits(algorithm: str) -> int:
    """Devuelve el tamaño en bits del algoritmo indicado.

    Raises:
        ValueError: Si el algoritmo no está en ``ALGORITHMS``.
    """
    if algorithm not in ALGORITHMS:
        raise ValueError(f"Algoritmo no soportado: {algorithm}")
    return ALGORITHMS[algorithm]
