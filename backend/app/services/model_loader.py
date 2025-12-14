import joblib
from app.db.model_crud import get_active_model

_MODEL_CACHE = {}

def load_model_for_asset_type(asset_type: str):
    # Optional in-memory cache (fast)
    if asset_type in _MODEL_CACHE:
        return _MODEL_CACHE[asset_type]

    record = get_active_model(asset_type)
    model_path = record["model_path"]

    model = joblib.load(model_path)

    _MODEL_CACHE[asset_type] = model
    return model
