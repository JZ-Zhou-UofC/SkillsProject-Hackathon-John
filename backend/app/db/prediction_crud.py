from app.db.db import db


def insert_prediction(asset_id: int, risk: dict):
    db.table("predictions").insert(
        {
            "asset_id": asset_id,
            **risk,
        }
    ).execute()


def get_latest_risk(asset_id: int) -> dict | None:
    res = (
        db.table("predictions")
        .select("*")
        .eq("asset_id", asset_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    return res.data[0] if res.data else None


def get_risk_detail(asset_id: int, limit: int = 500) -> list[dict]:
    res = (
        db.table("predictions")
        .select("created_at, shutdown_risk, bearing_risk")
        .eq("asset_id", asset_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    # Charts need ascending time
    return list(reversed(res.data or []))
def get_asset_diagnostics(asset_id: int, limit: int = 500) -> list[dict]:
    res = (
        db.table("asset_detail")
        .select(
            "created_at, output_current, exhaust_chemical_percentage"
        )
        .eq("asset_id", asset_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )

    # chart expects ascending time
    return list(reversed(res.data or []))