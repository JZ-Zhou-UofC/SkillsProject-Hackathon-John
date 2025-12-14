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
def clean_data_for_training_model(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and transform raw time-series sensor data into model-ready features.
    """

    # Ensure time order
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Keep latest N rows (e.g., 500 hours)
    df = df.tail(MAX_ROWS).reset_index(drop=True)

    # Forward fill missing values (time-series safe)
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

    # -------------------------
    # Drop rows with insufficient history
    # -------------------------
    df = df.dropna().reset_index(drop=True)

    return df
