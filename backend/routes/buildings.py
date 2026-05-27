from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth import decode_token
from database import get_session
import httpx
import os
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

load_dotenv()

router = APIRouter()
security = HTTPBearer()

EXTERNAL_API_URL = os.getenv("EXTERNAL_API_URL")
EXTERNAL_API_EMAIL = os.getenv("EXTERNAL_API_EMAIL")
EXTERNAL_API_PASSWORD = os.getenv("EXTERNAL_API_PASSWORD")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

async def get_external_token():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{EXTERNAL_API_URL}/auth/login",
            json={"email": EXTERNAL_API_EMAIL, "password": EXTERNAL_API_PASSWORD}
        )
        data = response.json()
        return data["token"]

async def get_coordinates_from_cadastre(reference: str):
    try:
        url = "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_CPMRC"
        params = {
            "Provincia": "",
            "Municipio": "",
            "SRS": "EPSG:4326",
            "RC": reference
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, params=params)
            root = ET.fromstring(response.text)
            ns = {"ns": "http://www.catastro.meh.es/"}
            lat = root.find(".//ns:ycen", ns)
            lon = root.find(".//ns:xcen", ns)
            if lat is not None and lon is not None:
                return [float(lat.text), float(lon.text)]
    except Exception:
        pass
    return [41.3851, 2.1734]

@router.get("/buildings/indicators")
async def get_building_indicators(current_user: dict = Depends(get_current_user)):
    session = get_session()
    results = session.run("MATCH (n:bigg__Patrimony) RETURN n.reference AS reference, n.name AS name")
    neo4j_buildings = {record["reference"]: record["name"] for record in results}

    external_token = await get_external_token()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{EXTERNAL_API_URL}/data/collection/average_dwelling_area",
            params={"calculation_date": "2025-05-14"},
            headers={"Authorization": f"Bearer {external_token}"}
        )
        raw = response.json()
        data_dict = raw[0].get("kpis", {}) if isinstance(raw, list) and raw else {}

    filtered = []
    for ref, name in neo4j_buildings.items():
        value = data_dict.get(ref, None)
        coords = await get_coordinates_from_cadastre(ref)
        filtered.append({
            "reference": ref,
            "name": name,
            "value": value,
            "indicator": "average_dwelling_area",
            "lat": coords[0] if coords else None,
            "lng": coords[1] if coords else None,
        })

    return filtered