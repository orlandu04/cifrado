"""Modelos de entrada y salida de la API.

Pydantic se encarga de validar tipos, longitudes y valores permitidos antes de
que la petición llegue a los endpoints. Las restricciones de caracteres se
centralizan aquí para que la API y el frontend compartan las mismas reglas.
"""

from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

# Límite defensivo para evitar peticiones desproporcionadas. El frontend usa el
# mismo valor en el atributo maxLength del textarea.
MAX_TEXT_LENGTH = 100_000

# Literales que restringen los valores aceptados por la API.
Algorithm = Literal["sha256", "sha512"]
AtbashMode = Literal["encrypt", "decrypt"]

# Atbash y los hashes solo aceptan letras ASCII. Se excluyen Ñ, vocales
# acentuadas, espacios, números y signos.
_ATBASH_PATTERN = re.compile(r"^[A-Za-z]+$")
_HASH_TEXT_PATTERN = re.compile(r"^[A-Za-z]+$")

# Mensaje compartido por todos los validadores de texto.
_LETTERS_ONLY_ERROR = (
    "Solo se permiten letras A-Z, sin Ñ, espacios, números, "
    "signos ni acentos."
)


class AtbashRequest(BaseModel):
    """Datos necesarios para cifrar o descifrar con Atbash."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=MAX_TEXT_LENGTH,
        description="Texto que se desea transformar. Solo letras A-Z.",
    )
    mode: AtbashMode = Field(
        default="encrypt",
        description="Atbash es simétrico; el modo es informativo para la UI.",
    )

    @field_validator("text")
    @classmethod
    def validate_atbash_text(cls, value: str) -> str:
        """Rechaza caracteres fuera de A-Z y normaliza a mayúsculas."""
        if not _ATBASH_PATTERN.fullmatch(value):
            raise ValueError(_LETTERS_ONLY_ERROR)
        return value.upper()


class AtbashResponse(BaseModel):
    """Resultado de aplicar Atbash al texto de entrada."""

    result: str


class HashRequest(BaseModel):
    """Datos necesarios para generar un hash SHA-256 o SHA-512."""

    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    algorithm: Algorithm

    @field_validator("text")
    @classmethod
    def validate_hash_text(cls, value: str) -> str:
        """Impide hashear textos con caracteres no permitidos."""
        if not _HASH_TEXT_PATTERN.fullmatch(value):
            raise ValueError(_LETTERS_ONLY_ERROR)
        return value


class HashResponse(BaseModel):
    """Hash hexadecimal calculado y metadatos del algoritmo."""

    algorithm: Algorithm
    hash: str
    bits: int
