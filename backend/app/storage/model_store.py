from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
MODEL_DIR = BASE_DIR / "data" / "model"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def save_model(asset_type: str, model, job_id: str):
    """
    Save only the trained model.
    """
    model_path = MODEL_DIR / f"{asset_type}_{job_id}.joblib"
    joblib.dump(model, model_path)
    return model_path
