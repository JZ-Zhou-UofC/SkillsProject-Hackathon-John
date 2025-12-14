from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
from app.api.routes import train, websocket, assets
from app.db.db import db

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
async def health_check():
    try:
        db.table("training_jobs").select("id").limit(1).execute()
        return {"status": "healthy", "supabase": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "supabase": "error", "error": str(e)}


app.include_router(train.router, tags=["Model Training"])

app.include_router(websocket.router, tags=["WS"])
app.include_router(assets.router, tags=["Assets"])
