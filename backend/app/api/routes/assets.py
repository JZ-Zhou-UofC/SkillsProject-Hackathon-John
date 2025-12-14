# app/api/routes/assets.py
from fastapi import APIRouter, Request, HTTPException
from app.db.assets_crud import create_asset

router = APIRouter()

REQUIRED_FIELDS = [
    "asset_type",
    "asset_name",
    "city",
    "address",
    "manager_name",
    "manager_phone",
]

@router.post("/assets")
async def create_asset_endpoint(request: Request):
    body = await request.json()

    # 1️⃣ Validate input
    missing = [f for f in REQUIRED_FIELDS if not body.get(f)]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required fields: {', '.join(missing)}"
        )

    # 2️⃣ Create asset via CRUD layer
    try:
        asset = create_asset(body)
        return asset
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
