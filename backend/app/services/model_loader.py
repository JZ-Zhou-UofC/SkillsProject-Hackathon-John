import joblib
from app.db.model_crud import get_active_model

_MODEL_CACHE = {}

def load_model_for_asset_type(asset_type: str):
    # Fast in-memory cache
    if asset_type in _MODEL_CACHE:
        return _MODEL_CACHE[asset_type]

    record = get_active_model(asset_type)
    if not record:
        raise ValueError(f"No active model found for asset_type={asset_type}")

    model_path = record["model_path"]

    payload = joblib.load(model_path)

    # ✅ Handle all possible saved formats
    if isinstance(payload, dict):
        model = payload["model"]
        feature_cols = payload.get("feature_cols")
    elif isinstance(payload, tuple):
        model, feature_cols = payload
    else:
        model = payload
        feature_cols = None

    _MODEL_CACHE[asset_type] = (model, feature_cols)
    return model, feature_cols
