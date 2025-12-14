import pandas as pd

# -------------------------
# Common sensor columns
# -------------------------
SENSOR_COLUMNS = {
    "timestamp",
    "output_current",
    "pump_voltage",
    "bearing_vibration",
    "exhaust_chemical_percentage",
    "compressor_temperature",
    "intake_air_temperature",
}

# -------------------------
# Training target columns
# -------------------------
TARGET_COLUMNS = {
    "pump_risk",
    "bearing_risk",
    "compressor_risk",
    "exhaust_path_risk",
    "cooling_or_lubrication_risk",
    "shutdown_risk",
}

# -------------------------
# Validation functions
# -------------------------
def validate_input_csv(path: str) -> pd.DataFrame:
    """
    Validate CSV used for prediction (sensor data only).
    """
    df = pd.read_csv(path, parse_dates=["timestamp"])

    missing = SENSOR_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required sensor columns: {missing}")

    return df.sort_values("timestamp").reset_index(drop=True)


def validate_training_csv(path: str) -> pd.DataFrame:
    """
    Validate CSV used for model training (sensor + target data).
    """
    df = pd.read_csv(path, parse_dates=["timestamp"])

    required = SENSOR_COLUMNS | TARGET_COLUMNS
    missing = required - set(df.columns)

    if missing:
        raise ValueError(f"Missing required training columns: {missing}")

    return df.sort_values("timestamp").reset_index(drop=True)
