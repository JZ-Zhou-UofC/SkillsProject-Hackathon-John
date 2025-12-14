from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/
DATA_DIR = BASE_DIR / "data" / "training"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def save_cleaned_csv(
    df: pd.DataFrame,
    asset_type: str,
    job_id: str
):
    """
    Save cleaned and feature-engineered CSV associated with a training job.
    """
    path = DATA_DIR / f"cleaned_{asset_type}_{job_id}.csv"
    df.to_csv(path, index=False)
    return path
