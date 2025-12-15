# app/api/routes/assets.py
from fastapi import APIRouter, Request, HTTPException
from app.db.assets_crud import create_asset,get_assets,get_asset_by_id
from app.db.prediction_crud import get_latest_risk,get_risk_detail

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
@router.get("/assets")
def list_assets():
    return get_assets()

@router.get("/assets/{asset_id}/risk")
def get_asset_risk(asset_id: int):
    risk = get_latest_risk(asset_id)

    if not risk:
        raise HTTPException(
            status_code=404,
            detail="No risk data found for asset"
        )

    return {
        "asset_id": asset_id,
        "created_at": risk["created_at"],
        "pump_risk": risk["pump_risk"],
        "bearing_risk": risk["bearing_risk"],
        "compressor_risk": risk["compressor_risk"],
        "exhaust_path_risk": risk["exhaust_path_risk"],
        "cooling_or_lubrication_risk": risk["cooling_or_lubrication_risk"],
        "shutdown_risk": risk["shutdown_risk"],
    }

@router.get("/assets/{asset_id}/detail")
def get_asset_risk_detail(asset_id: int):
    rows = get_risk_detail(asset_id)

    return {
        "asset_id": asset_id,
        "rows": rows
    }


@router.get("/assets/{asset_id}")
def get_asset(asset_id: int):
    asset = get_asset_by_id(asset_id)

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return asset