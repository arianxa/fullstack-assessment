# Fullstack Assessment — React + Python + Neo4j

## Stack tecnológico

- **Frontend:** React + Vite + React Router + Leaflet
- **Backend:** Python + FastAPI
- **Base de datos:** Neo4j 4.4.x
- **Autenticación:** JWT

---

## Requisitos previos

- Python 3.10+
- Node.js 18+
- Neo4j Desktop con DBMS versión 4.4.x

---

## Configuración de Neo4j

1. Descarga Neo4j Desktop desde https://neo4j.com/download/
2. Crea un nuevo DBMS con versión **4.4.x**
3. Instala los plugins **APOC** y **Neosemantics (n10s)**
4. Importa el dump proporcionado:
   - Copia `fullstack-graph-db.dump` en la carpeta `import` del DBMS
   - Abre la terminal del DBMS y ejecuta:
```bash
   bin\neo4j-admin load --from=import\fullstack-graph-db.dump --database=neo4j --force
```
5. Inicia el DBMS
6. Desactiva la autenticación en `neo4j.conf`:
dbms.security.auth_enabled=false

---

## Instalación del backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

### Variables de entorno

Crea un archivo `.env` en la carpeta `backend`:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=
SECRET_KEY=supersecretkey123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
EXTERNAL_API_URL=https://crbcn-go-api.kube.tech.beegroup-cimne.com
EXTERNAL_API_EMAIL=testui_registered@cimne.upc.edu
EXTERNAL_API_PASSWORD=123456aA!
```

### Arrancar el backend

```bash
uvicorn main:app --reload
```

El backend estará disponible en `http://localhost:8000`
La documentación de la API en `http://localhost:8000/docs`

---

## Instalación del frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

---

## Estructura del proyecto
fullstack-assessment/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── .env
│   └── routes/
│       ├── users.py
│       └── buildings.py
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
└── README.md

---

## Decisiones arquitectónicas y asunciones

- **Autenticación desactivada en Neo4j** por simplicidad del entorno local. En producción debería estar habilitada.
- **Coordenadas de edificios** obtenidas en tiempo real desde la API del Catastro español usando la referencia catastral de cada edificio.
- **Inconsistencia del dataset:** Las referencias de los edificios del dump proporcionado (`9729505DF2892H`, etc.) no coinciden con las referencias devueltas por la API externa en el endpoint `average_dwelling_area`. Por este motivo, el valor del indicador aparece como `null` para los edificios del dump. El código de filtrado está correctamente implementado y funcionaría si los datasets estuvieran sincronizados.
- **Roles de usuario:** Se implementan dos roles (`user` y `admin`) aunque la autorización por rol no está completamente restrictiva, priorizando la simplicidad según las indicaciones del enunciado.