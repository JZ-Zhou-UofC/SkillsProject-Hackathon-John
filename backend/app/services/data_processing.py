import pandas as pd

# -------------------------
# Configuration
# -------------------------
WINDOW = 24
LAGS = [1, 6, 24]
MAX_ROWS = 500

SENSOR_COLS = [
    "output_current",
    "pump_voltage",
    "bearing_vibration",
    "exhaust_chemical_percentage",
    "compressor_temperature",
    "intake_air_temperature",
]

# -------------------------
# Feature Engineering
# -------------------------

def build_features(df: pd.DataFrame) -> pd.DataFrame:
    # Ensure time order
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Keep latest N rows
    df = df.tail(MAX_ROWS).reset_index(drop=True)

    # Forward fill missing values
    df = df.ffill()

    # -------------------------
    # Lag features
    # -------------------------
    for col in SENSOR_COLS:
        for lag in LAGS:
            df[f"{col}_lag_{lag}"] = df[col].shift(lag)

    # -------------------------
    # Rolling mean features
    # -------------------------
    for col in SENSOR_COLS:
        df[f"{col}_roll_mean_{WINDOW}"] = df[col].rolling(WINDOW).mean()

    # -------------------------
    # Derived physical features
    # -------------------------
    df["compressor_temp_delta"] = (
        df["compressor_temperature"] - df["intake_air_temperature"]
    )

    df["vibration_per_current"] = (
        df["bearing_vibration"] / df["output_current"]
    )

    df["temp_per_current"] = (
        df["compressor_temperature"] / df["output_current"]
    )

    # Drop rows with insufficient history
    df = df.dropna().reset_index(drop=True)

    return df

def clean_data_for_training_model(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare data for model training.
    Includes feature engineering and keeps label columns.
    """
    return build_features(df)

def clean_data_for_prediction(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare data for inference.
    Must mirror training feature engineering exactly.
    """
    return build_features(df)
