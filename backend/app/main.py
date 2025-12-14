from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import train, websocket

app = FastAPI(
    title="Turbine Maintenance Risk API",

    version="0.1.0",
)

# -------------------------
# CORS (adjust origins as needed)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Health Check
# -------------------------
@app.get("/health")
def health_check():
    return {"status": "ok"}

# -------------------------
# API Routes
# -------------------------

app.include_router(train.router, tags=["Model Training"])

app.include_router(
    websocket.router,
    prefix="",
)