# app/db/assets_crud.py
from app.db.db import db
import pandas as pd

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


def insert_asset_detail(asset_id: int, df: pd.DataFrame):
    rows = []

    for _, row in df.iterrows():
        rows.append({
            "asset_id": asset_id,
            "timestamp": row["timestamp"].isoformat(),
            "output_current": float(row["output_current"]),
            "pump_voltage": float(row["pump_voltage"]),
            "bearing_vibration": float(row["bearing_vibration"]),
            "exhaust_chemical_percentage": float(row["exhaust_chemical_percentage"]),
            "compressor_temperature": float(row["compressor_temperature"]),
            "intake_air_temperature": float(row["intake_air_temperature"]),
        })

    if rows:
        db.table("asset_detail").insert(rows).execute()


def get_asset(asset_id: int):
    result = db.table("assets").select("*").eq("id", asset_id).execute()

    if not result.data:
        return None

    return result.data[0]


def update_asset_risk(asset_id: int, risk_level: str) -> None:
    """
    Update the asset's overall risk status.
    Example risk values: HIGH, MEDIUM, LOW, N/A
    """
    (
        db.table("assets")
        .update({"risk_status": risk_level})
        .eq("id", asset_id)
        .execute()
    )
