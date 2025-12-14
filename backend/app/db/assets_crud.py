# app/db/assets_crud.py
from app.db.db import db

def create_asset(data: dict) -> dict:
    """
    Insert a new asset into the database.
    Assumes validation has already been done.
    """
    result = db.table("assets").insert({
        "asset_type": data["asset_type"],
        "city": data["city"],
        "address": data["address"],
        "manager_name": data["manager_name"],
        "manager_phone": data["manager_phone"],
        # risk_status defaults to 'N/A'
    }).execute()

    if not result.data:
        raise RuntimeError("Failed to create asset")

    return result.data[0]
