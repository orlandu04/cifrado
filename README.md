# CifraLab

Aplicación web para **cifrar y descifrar con Atbash** y **generar hashes SHA-256 y SHA-512**, con historial independiente por algoritmo. Interfaz React en español con diseño responsive, estados de carga, copiado al portapapeles y validaciones claras.

## Stack

- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4 + lucide-react
- **Backend:** Python 3.14 + FastAPI + Uvicorn
- **Pruebas:** pytest + TestClient

## Estructura

```
Cifrado/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI, CORS y /api/health
│   │   ├── schemas.py           # Validación con Pydantic
│   │   ├── routers/crypto.py    # Endpoints
│   │   └── services/            # Atbash y hashing
│   ├── tests/test_crypto.py
│   ├── pytest.ini
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/client.js        # Cliente HTTP
│       ├── components/          # UI
│       ├── lib/tools.js         # Definición de herramientas
│       └── App.jsx
└── README.md
```

## Requisitos

- Python 3.11 o superior
- Node.js 20 o superior

## Instalación y ejecución

### 1. Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload --port 8000
```

- API: <http://127.0.0.1:8000>
- Documentación interactiva: <http://127.0.0.1:8000/docs>

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre <http://127.0.0.1:5173>. Vite redirige `/api` al backend en el puerto 8000.

> Si el backend está en otra URL, crea `frontend/.env` con `VITE_API_URL=http://host:puerto`.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado del servicio |
| POST | `/api/atbash` | Atbash: `{ "text", "mode": "encrypt" \| "decrypt" }` |
| POST | `/api/hash` | Hash: `{ "text", "algorithm": "sha256" \| "sha512" }` |
| POST | `/api/hash/both` | Ambos hashes: `{ "text" }` → SHA-256 y SHA-512 |
| POST | `/api/verify` | Verificación: `{ "text", "algorithm", "expected_hash" }` |

La interfaz actual usa `/api/atbash` y `/api/hash`. Los endpoints `/api/hash/both` y `/api/verify` siguen disponibles en la API, aunque la UI ya no los utiliza.

Ejemplo:

```bash
curl -X POST http://127.0.0.1:8000/api/atbash \
  -H 'Content-Type: application/json' \
  -d '{"text":"HolaMundo","mode":"encrypt"}'
# {"result":"SLOZNFMWL"}
```

Atbash solo acepta letras `A-Z` (mayúsculas o minúsculas) y devuelve el resultado en mayúsculas. Se rechazan con 422 la `Ñ`, los acentos, espacios, números y signos de puntuación.

Los endpoints de hash (`/api/hash`, `/api/hash/both` y `/api/verify`) también aceptan solo letras `A-Z` en mayúsculas o minúsculas; se rechazan con 422 espacios, números, `Ñ`, acentos y signos.

Límite de entrada: 100 000 caracteres. La verificación acepta hashes en mayúsculas y con espacios.

## Pruebas

```bash
cd backend
.venv/bin/python -m pytest -q
```

Cubren vectores oficiales de SHA-256/SHA-512, el endpoint de ambos hashes, simetría de Atbash, normalización a mayúsculas, rechazo de caracteres inválidos, verificación correcta/incorrecta y validaciones 422.

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Notas de diseño

- **Atbash es simétrico:** cifrar y descifrar aplican la misma sustitución. Trabaja con 26 letras (`A-Z`, sin `Ñ`), convierte la entrada a mayúsculas y rechaza espacios, números, signos y acentos.
- **SHA-256/512 son unidireccionales:** no se pueden descifrar. La interfaz permite generar hashes y guarda un historial independiente por algoritmo durante la sesión, con texto original, hash completo y hora de generación. Los textos de hash solo aceptan letras `A-Z`, sin espacios, números, `Ñ`, acentos ni signos.
- **Privacidad:** todo se procesa en memoria; no hay base de datos ni registro del texto.
- **Accesibilidad:** etiquetas asociadas, `aria-live` para resultados, `role="alert"` para errores, foco visible y contraste alto.
