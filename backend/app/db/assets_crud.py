# app/db/assets_crud.py
from app.db.db import db


def create_asset(data: dict) -> dict:
    """
    Insert a new asset into the database.
    Assumes validation has already been done.
    """
    result = (
        db.table("assets")
        .insert(
            {
                "asset_type": data["asset_type"],
                "asset_name": data["asset_name"],
                "city": data["city"],
                "address": data["address"],
                "manager_name": data["manager_name"],
                "manager_phone": data["manager_phone"],
                # risk_status defaults to 'N/A'
            }
        )
        .execute()
    )

    if not result.data:
        raise RuntimeError("Failed to create asset")

    return result.data[0]


def get_assets() -> list[dict]:
    result = db.table("assets").select("*").order("created_at", desc=True).execute()

    return result.data or []


def insert_asset_detail(asset_id: int, df):
    rows = [
        {
            "asset_id": asset_id,
            "timestamp": row.timestamp,
            "output_current": row.output_current,
            "pump_voltage": row.pump_voltage,
            "bearing_vibration": row.bearing_vibration,
            "exhaust_chemical_percentage": row.exhaust_chemical_percentage,
            "compressor_temperature": row.compressor_temperature,
            "intake_air_temperature": row.intake_air_temperature,
        }
        for row in df.itertuples()
    ]

    db.table("asset_detail").insert(rows).execute()


def get_asset(asset_id: int) -> dict | None:
    """
    Fetch a single asset by ID.
    Returns None if asset does not exist.
    """
    result = db.table("assets").select("*").eq("id", asset_id).single().execute()


def update_asset_risk(asset_id: int, risk: str) -> None:
    """
    Update the asset's overall risk status.
    Example risk values: HIGH, MEDIUM, LOW, N/A
    """
    (
        db.table("assets")
        .update({"risk_status": risk, "updated_at": "now()"})
        .eq("id", asset_id)
        .execute()
    )
