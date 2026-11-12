"""Endpoints de cifrado, hashing y verificación."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import (
    AtbashRequest,
    AtbashResponse,
    HashBothRequest,
    HashBothResponse,
    HashRequest,
    HashResponse,
    VerifyRequest,
    VerifyResponse,
)
from app.services.atbash import AtbashError, atbash
from app.services.hashing import generate_hash, hash_bits, verify_hash

router = APIRouter(tags=["criptografía"])


@router.post(
    "/atbash",
    response_model=AtbashResponse,
    summary="Cifrar o descifrar con Atbash",
)
def atbash_endpoint(payload: AtbashRequest) -> AtbashResponse:
    try:
        result = atbash(payload.text)
    except AtbashError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return AtbashResponse(result=result)


@router.post(
    "/hash",
    response_model=HashResponse,
    summary="Generar un hash SHA-256 o SHA-512",
)
def hash_endpoint(payload: HashRequest) -> HashResponse:
    return HashResponse(
        algorithm=payload.algorithm,
        hash=generate_hash(payload.text, payload.algorithm),
        bits=hash_bits(payload.algorithm),
    )


@router.post(
    "/hash/both",
    response_model=HashBothResponse,
    summary="Generar los hashes SHA-256 y SHA-512 del mismo texto",
)
def hash_both_endpoint(payload: HashBothRequest) -> HashBothResponse:
    return HashBothResponse(
        sha256=HashResponse(
            algorithm="sha256",
            hash=generate_hash(payload.text, "sha256"),
            bits=hash_bits("sha256"),
        ),
        sha512=HashResponse(
            algorithm="sha512",
            hash=generate_hash(payload.text, "sha512"),
            bits=hash_bits("sha512"),
        ),
    )


@router.post(
    "/verify",
    response_model=VerifyResponse,
    summary="Verificar un texto contra un hash",
)
def verify_endpoint(payload: VerifyRequest) -> VerifyResponse:
    matches, computed = verify_hash(
        payload.text, payload.algorithm, payload.expected_hash
    )
    return VerifyResponse(match=matches, computed_hash=computed)
