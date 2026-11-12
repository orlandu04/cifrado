"""Modelos de entrada y salida de la API."""

from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator

MAX_TEXT_LENGTH = 100_000

Algorithm = Literal["sha256", "sha512"]
AtbashMode = Literal["encrypt", "decrypt"]

_HEX_PATTERN = re.compile(r"^[0-9a-fA-F]+$")
_ATBASH_PATTERN = re.compile(r"^[A-Za-z]+$")
_HASH_TEXT_PATTERN = re.compile(r"^[A-Za-z]+$")

_LETTERS_ONLY_ERROR = (
    "Solo se permiten letras A-Z, sin Ñ, espacios, números, "
    "signos ni acentos."
)


class AtbashRequest(BaseModel):
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
        if not _ATBASH_PATTERN.fullmatch(value):
            raise ValueError(_LETTERS_ONLY_ERROR)
        return value.upper()


class AtbashResponse(BaseModel):
    result: str


class HashRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    algorithm: Algorithm

    @field_validator("text")
    @classmethod
    def validate_hash_text(cls, value: str) -> str:
        if not _HASH_TEXT_PATTERN.fullmatch(value):
            raise ValueError(_LETTERS_ONLY_ERROR)
        return value


class HashResponse(BaseModel):
    algorithm: Algorithm
    hash: str
    bits: int


class HashBothRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)

    @field_validator("text")
    @classmethod
    def validate_hash_text(cls, value: str) -> str:
        if not _HASH_TEXT_PATTERN.fullmatch(value):
            raise ValueError(_LETTERS_ONLY_ERROR)
        return value


class HashBothResponse(BaseModel):
    sha256: HashResponse
    sha512: HashResponse


class VerifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=MAX_TEXT_LENGTH)
    algorithm: Algorithm
    expected_hash: str = Field(..., min_length=1, max_length=256)

    @field_validator("text")
    @classmethod
    def validate_hash_text(cls, value: str) -> str:
        if not _HASH_TEXT_PATTERN.fullmatch(value):
            raise ValueError(_LETTERS_ONLY_ERROR)
        return value

    @field_validator("expected_hash")
    @classmethod
    def validate_expected_hash(cls, value: str) -> str:
        normalized = "".join(value.split())
        if not normalized:
            raise ValueError("El hash esperado no puede estar vacío.")
        if not _HEX_PATTERN.fullmatch(normalized):
            raise ValueError(
                "El hash esperado solo puede contener caracteres hexadecimales (0-9, a-f)."
            )
        return normalized


class VerifyResponse(BaseModel):
    match: bool
    computed_hash: str
