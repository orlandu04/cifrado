"""Punto de entrada de la API de Cifratab.

Configura FastAPI, el middleware CORS que permite las peticiones del servidor
de desarrollo de Vite y el router con las operaciones criptográficas. También
expone un endpoint ligero de salud para que el frontend pueda indicar si la API
está disponible.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import crypto

# Orígenes permitidos durante el desarrollo local. Vite sirve el frontend en
# el puerto 5173 y puede hacerlo tanto con localhost como con 127.0.0.1.
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# La documentación interactiva se genera automáticamente en /docs.
app = FastAPI(
    title="CifraLab API",
    version="1.0.0",
    description=(
        "API para cifrado Atbash y generación de hashes SHA-256/SHA-512."
    ),
)

# CORS es necesario porque el frontend y la API corren en puertos distintos
# durante el desarrollo. En producción conviene restringir los orígenes.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todas las rutas criptográficas comparten el prefijo /api.
app.include_router(crypto.router, prefix="/api")


@app.get("/api/health", tags=["estado"], summary="Comprobar el estado de la API")
def health() -> dict[str, str]:
    """Devuelve una respuesta mínima para comprobar que la API está activa."""
    return {"status": "ok", "service": "CifraLab API"}
