"""Endpoints de cifrado Atbash y generación de hashes.

El router se monta bajo ``/api`` desde ``app.main``. Cada endpoint delega la
lógica de negocio en ``app.services`` y se limita a traducir los modelos de
entrada/salida de Pydantic.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas import (
    AtbashRequest,
    AtbashResponse,
    HashRequest,
    HashResponse,
)
from app.services.atbash import AtbashError, atbash
from app.services.hashing import generate_hash, hash_bits

router = APIRouter(tags=["criptografía"])


@router.post(
    "/atbash",
    response_model=AtbashResponse,
    summary="Cifrar o descifrar con Atbash",
)
def atbash_endpoint(payload: AtbashRequest) -> AtbashResponse:
    """Aplica Atbash al texto validado.

    Atbash es simétrico, por lo que ``mode`` no cambia el resultado; el campo
    existe para que la interfaz pueda describir la acción realizada.
    """
    try:
        result = atbash(payload.text)
    except AtbashError as exc:
        # El servicio también valida caracteres. Se convierte el error de
        # dominio en una respuesta HTTP 422 con un mensaje legible.
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return AtbashResponse(result=result)


@router.post(
    "/hash",
    response_model=HashResponse,
    summary="Generar un hash SHA-256 o SHA-512",
)
def hash_endpoint(payload: HashRequest) -> HashResponse:
    """Calcula el hash del texto con el algoritmo solicitado.

    ``generate_hash`` devuelve el digest en hexadecimal y ``hash_bits`` aporta
    el tamaño del algoritmo para que el frontend pueda mostrarlo.
    """
    return HashResponse(
        algorithm=payload.algorithm,
        hash=generate_hash(payload.text, payload.algorithm),
        bits=hash_bits(payload.algorithm),
    )
