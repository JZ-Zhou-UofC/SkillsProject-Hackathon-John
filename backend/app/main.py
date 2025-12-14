from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import upload, train, predict, assets

app = FastAPI(
    title="Turbine Maintenance Risk API",
    description="Predictive maintenance system for turbine units",
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
app.include_router(upload.router, prefix="", tags=["Upload"])
app.include_router(train.router, prefix="", tags=["Training"])
app.include_router(predict.router, prefix="", tags=["Prediction"])
app.include_router(assets.router, prefix="", tags=["Assets"])
