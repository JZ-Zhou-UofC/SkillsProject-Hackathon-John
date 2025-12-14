from datetime import datetime
from app.db.db import db


def create_training_job(asset_type: str):
    result = (
        db.table("training_jobs")
        .insert(
            {
                "asset_type": asset_type,
                "status": "queued",
                "progress_message": "Queued for training",
            }
        )
        .execute()
    )

    return result.data[0]["id"]


def update_training_job(job_id: str, status: str, message: str):
    db.table("training_jobs").update(
        {
            "status": status,
            "progress_message": message,
  
        }
    ).eq("id", job_id).execute()


def get_training_job(job_id: str):
    result = db.table("training_jobs").select("*").eq("id", job_id).single().execute()
    return result.data
