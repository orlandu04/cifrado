# CifraLab

Aplicación web para **cifrar y descifrar con Atbash** y **generar hashes SHA-256 y SHA-512**, con historial independiente por algoritmo y un comparador SHA-256/SHA-512 en modal. Interfaz React en español con diseño responsive, estados de carga, copiado al portapapeles y validaciones claras.

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
│       ├── lib/text.js          # Saneamiento y límite de texto
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

Ejemplo:

```bash
curl -X POST http://127.0.0.1:8000/api/atbash \
  -H 'Content-Type: application/json' \
  -d '{"text":"HolaMundo","mode":"encrypt"}'
# {"result":"SLOZNFMWL"}
```

Atbash solo acepta letras `A-Z` (mayúsculas o minúsculas) y devuelve el resultado en mayúsculas. Se rechazan con 422 la `Ñ`, los acentos, espacios, números y signos de puntuación.

El endpoint de hash (`/api/hash`) también acepta solo letras `A-Z` en mayúsculas o minúsculas; se rechazan con 422 espacios, números, `Ñ`, acentos y signos. El texto se normaliza a mayúsculas antes de hashear (igual que Atbash, `"abc"` y `"ABC"` producen el mismo hash) y el digest hexadecimal se devuelve en mayúsculas (`A-F`).

Límite de entrada: 100 000 caracteres.

## Pruebas

```bash
cd backend
.venv/bin/python -m pytest -q
```

Cubren vectores oficiales de SHA-256/SHA-512, simetría de Atbash, normalización a mayúsculas de Atbash y hashes, digests en hexadecimal mayúsculo, rechazo de caracteres inválidos y validaciones 422.

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Despliegue

El repositorio incluye la configuración para desplegar el frontend en **Netlify** y el backend en **Render** mediante auto-deploy desde GitHub.

### Backend en Render

`render.yaml` define el servicio `cifralab-api` (plan Free) con:

- Directorio: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/health`
- Python fijado en `backend/.python-version`

Pasos:

1. En Render, elige **New > Blueprint** y conecta el repositorio.
2. Cuando tengas la URL del frontend, define la variable `CORS_ORIGINS` con ese dominio (por ejemplo `https://tu-sitio.netlify.app`) y redeploya.

### Frontend en Netlify

`netlify.toml` configura el build:

- Base: `frontend`
- Build: `npm run build`
- Publish: `dist`
- Node: `22`
- Redirección SPA a `/index.html`

Pasos:

1. En Netlify, importa el repositorio y deja que detecte `netlify.toml`.
2. Añade la variable de build `VITE_API_URL` con la URL del backend en Render (por ejemplo `https://cifralab-api.onrender.com`).
3. Despliega y verifica que el indicador de la cabecera muestre la API en línea.

> El plan Free de Render suspende el servicio por inactividad: la primera petición puede tardar unos segundos en responder.

## Notas de diseño

- **Atbash es simétrico:** cifrar y descifrar aplican la misma sustitución. Trabaja con 26 letras (`A-Z`, sin `Ñ`), convierte la entrada a mayúsculas y rechaza espacios, números, signos y acentos.
- **SHA-256/512 son unidireccionales:** no se pueden descifrar. La interfaz permite generar hashes y guarda un historial independiente por algoritmo durante la sesión, con texto original, hash completo y hora de generación. Los textos de hash solo aceptan letras `A-Z`, sin espacios, números, `Ñ`, acentos ni signos; se normalizan a mayúsculas y el digest se muestra en mayúsculas, igual que Atbash.
- **Comparador SHA:** el botón «Comparar» abre un modal con su propio campo de texto. Al generar, calcula SHA-256 y SHA-512 en paralelo y muestra ambos hashes uno al lado del otro, sin verificar coincidencias ni guardar historial adicional.
- **Privacidad:** todo se procesa en memoria; no hay base de datos ni registro del texto.
- **Accesibilidad:** etiquetas asociadas, `aria-live` para resultados, `role="alert"` para errores, foco visible y contraste alto.
