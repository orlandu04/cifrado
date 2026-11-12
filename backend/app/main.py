"""Aplicación FastAPI de CifraLab."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import crypto

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app = FastAPI(
    title="CifraLab API",
    version="1.0.0",
    description=(
        "API para cifrado Atbash, generación de hashes SHA-256/SHA-512 y "
        "verificación de hashes."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crypto.router, prefix="/api")


@app.get("/api/health", tags=["estado"], summary="Comprobar el estado de la API")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "CifraLab API"}
