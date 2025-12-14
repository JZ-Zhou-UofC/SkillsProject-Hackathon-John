from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
import asyncio
import traceback

from app.services.csv_validator import validate_training_csv
from app.services.data_processing import clean_data_for_training_model
from app.services.train_model import train_model
from app.services.websocket_progress import set_progress
from app.storage.data_store import save_cleaned_csv
from app.storage.model_store import save_model
from app.db.training_job_crud import create_training_job
from app.db.model_crud import (
    deactivate_models_for_asset,
    insert_model_record,
)

router = APIRouter()


@router.post("/upload-csv-for-model-creation-or-update")
async def upload_csv_for_model_creation_or_update(
    asset_type: str, file: UploadFile = File(...)
):
    """
    Upload training CSV, validate, preprocess, and train/update a model.
    Training runs asynchronously and progress is persisted in the database.
    """

    # -------------------------
    # 0️⃣ Basic validation
    # -------------------------
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        # -------------------------
        # 1️⃣ Create training job
        # -------------------------
        job_id = create_training_job(asset_type)

        # -------------------------
        # 2️⃣ Save uploaded CSV temporarily
        # -------------------------
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        # -------------------------
        # 3️⃣ Validate & feature engineering
        # -------------------------
        await set_progress(job_id, "validating", "Validating CSV")
        df = validate_training_csv(tmp_path)

        await set_progress(job_id, "feature_engineering", "Building features")
        df_cleaned = clean_data_for_training_model(df)

        save_cleaned_csv(df_cleaned, asset_type, job_id)

        # -------------------------
        # 4️⃣ Background training
        # -------------------------
        async def training_task():
            try:
                await set_progress(job_id, "training", "Training model")
                model = train_model(df_cleaned, asset_type)

                await set_progress(job_id, "saving_model", "Saving model")
                model_path = save_model(
                    asset_type=asset_type,
                    model=model,
                    job_id=job_id,
                )

                await set_progress(job_id, "registering_model", "Registering model")
                deactivate_models_for_asset(asset_type)

                insert_model_record(
                    asset_type=asset_type,
                    job_id=job_id,
                    model_path=str(model_path),
                )

                await set_progress(job_id, "completed", "Training completed")

            except Exception as e:
                traceback.print_exc()
                await set_progress(job_id, "failed", str(e))

        asyncio.create_task(training_task())

        # -------------------------
        # 5️⃣ Return job_id
        # -------------------------
        return {
            "status": "training started",
            "job_id": job_id,
            "asset_type": asset_type,
        }

    except Exception as e:
        # 🔴 THIS IS THE MOST IMPORTANT CHANGE
        traceback.print_exc()
        raise HTTPException(
            status_code=400, detail=f"Training request failed: {str(e)}"
        )
