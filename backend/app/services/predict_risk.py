# app/services/predict_risk.py

import joblib
import pandas as pd

from app.db.model_crud import get_active_model


def predict_risk(asset_type: str, df_features: pd.DataFrame) -> dict[str, float]:
    """
    Load active model for asset_type and predict risk scores.
    Returns a dict of risk_name -> float (latest timestep).
    """

    model_record = get_active_model(asset_type)
    if not model_record:
        raise RuntimeError(f"No active model found for asset_type={asset_type}")

    payload = joblib.load(model_record["model_path"])

    if isinstance(payload, dict):
        model = payload["model"]
        feature_cols = payload.get("feature_cols")
    elif isinstance(payload, tuple):
        model, feature_cols = payload
    else:
        model = payload
        feature_cols = None

    X = df_features.drop(columns=["timestamp"], errors="ignore")

    if feature_cols is not None:
        missing = set(feature_cols) - set(X.columns)
        if missing:
            raise ValueError(f"Missing required features: {missing}")
        X = X[feature_cols]

    if X.empty:
        raise ValueError("No valid rows available for prediction")

    y_pred = model.predict(X)
    latest_pred = y_pred[-1]

    return {
        "pump_risk": float(latest_pred[0]),
        "bearing_risk": float(latest_pred[1]),
        "compressor_risk": float(latest_pred[2]),
        "exhaust_path_risk": float(latest_pred[3]),
        "cooling_or_lubrication_risk": float(latest_pred[4]),
        "shutdown_risk": float(latest_pred[5]),
    }
