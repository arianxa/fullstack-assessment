from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users, buildings

app = FastAPI(title="Fullstack Assessment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/auth", tags=["auth"])
app.include_router(buildings.router, prefix="/api", tags=["buildings"])

@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}