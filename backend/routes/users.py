from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from database import get_session
from auth import hash_password, verify_password, create_access_token, decode_token

router = APIRouter()
security = HTTPBearer()

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    username: str = None
    email: str = None
    role: str = None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")
    return payload

@router.post("/register")
def register(user: UserRegister):
    session = get_session()
    existing = session.run(
        "MATCH (u:User {email: $email}) RETURN u", email=user.email
    ).single()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = hash_password(user.password)
    session.run(
        "CREATE (u:User {username: $username, email: $email, password: $password, role: $role})",
        username=user.username, email=user.email, password=hashed, role=user.role
    )
    return {"message": "Usuario registrado correctamente"}

@router.post("/login")
def login(user: UserLogin):
    session = get_session()
    result = session.run(
        "MATCH (u:User {email: $email}) RETURN u", email=user.email
    ).single()
    if not result:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    db_user = result["u"]
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_access_token({"sub": db_user["email"], "role": db_user["role"], "username": db_user["username"]})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):
    session = get_session()
    results = session.run("MATCH (u:User) RETURN u")
    users = []
    for record in results:
        u = record["u"]
        users.append({
            "username": u["username"],
            "email": u["email"],
            "role": u["role"]
        })
    return users

@router.delete("/users/{email}")
def delete_user(email: str, current_user: dict = Depends(get_current_user)):
    session = get_session()
    session.run("MATCH (u:User {email: $email}) DELETE u", email=email)
    return {"message": "Usuario eliminado"}

@router.put("/users/{email}")
def update_user(email: str, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    session = get_session()
    updates = {k: v for k, v in user.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    set_clause = ", ".join([f"u.{k} = ${k}" for k in updates])
    session.run(f"MATCH (u:User {{email: $email}}) SET {set_clause}", email=email, **updates)
    return {"message": "Usuario actualizado"}