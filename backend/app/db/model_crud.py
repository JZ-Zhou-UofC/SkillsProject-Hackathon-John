from app.db.db import db


def deactivate_models_for_asset(asset_type: str):
    db.table("models").update({"is_active": False}).eq("asset_type", asset_type).eq(
        "is_active", True
    ).execute()


def insert_model_record(
    asset_type: str,
    job_id: str,
    model_path: str,
):
    db.table("models").insert(
        {
            "asset_type": asset_type,
            "job_id": job_id,
            "model_path": model_path,
            "is_active": True,
        }
    ).execute()


def get_active_model(asset_type: str):
    result = (
        db.table("models")
        .select("*")
        .eq("asset_type", asset_type)
        .eq("is_active", True)
        .single()
        .execute()
    )
    return result.data


def get_all_active_models():
    result = (
        db.table("models")
        .select("id, asset_type")
        .eq("is_active", True)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
