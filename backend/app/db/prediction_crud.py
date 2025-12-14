from app.db.db import db


def insert_prediction(asset_id: int, risk: dict):
    db.table("predictions").insert(
        {
            "asset_id": asset_id,
            **risk,
        }
    ).execute()
