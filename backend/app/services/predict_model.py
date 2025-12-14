import joblib
from app.storage.model_store import load_active_model

TARGET_COLS = [
    "pump_risk",
    "bearing_risk",
    "compressor_risk",
    "exhaust_path_risk",
    "cooling_or_lubrication_risk",
    "shutdown_risk",
]

def predict_risk(asset_id: int, df):
    model = load_active_model_for_asset(asset_id)

    X = df[model.feature_cols]
    preds = model.predict(X)

    # Use most recent row
    latest = preds[-1]

    return dict(zip(TARGET_COLS, latest))
