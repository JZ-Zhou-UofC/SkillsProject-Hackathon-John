from fastapi import APIRouter, UploadFile, File, HTTPException
import tempfile
from dataclasses import asdict
from app.services.csv_validator import validate_input_csv
from app.services.data_processing import clean_data_for_prediction
from app.services.predict_risk import predict_risk
from app.storage.data_store import save_cleaned_prediction_csv
from app.db.assets_crud import get_asset, update_asset_risk, insert_asset_detail
from app.db.prediction_crud import insert_prediction


router = APIRouter()


@router.post("/upload-csv-for-an-asset")
async def upload_csv_for_prediction(asset_id: int, file: UploadFile = File(...)):
    print(asset_id,"~~~~~~~~~~asset_id")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    # 1️⃣ Validate + load asset
    asset = get_asset(asset_id)
    asset_type = asset["asset_type"]

    # 2️⃣ Save temp CSV
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    # 3️⃣ Validate input schema
    df = validate_input_csv(tmp_path)

    # 4️⃣ Feature engineering (same as training)
    df_features = clean_data_for_prediction(df)
    save_cleaned_prediction_csv(df_features, asset_type,asset_id)
    # 5️⃣ Persist time-series for charts
    insert_asset_detail(asset_id, df_features)

    # 6️⃣ Load model + predict
    risk = predict_risk(asset_type, df_features)

    # 7️⃣ Persist prediction + update asset
    insert_prediction(asset_id, risk)
    update_asset_risk(asset_id, shutdown_risk=risk["shutdown_risk"])

    return {
        "status": "prediction completed",
        "asset_id": asset_id,
        "risk": risk,
    }
