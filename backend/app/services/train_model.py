from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor

# -------------------------
# Target columns (fixed)
# -------------------------
TARGET_COLS = [
    "pump_risk",
    "bearing_risk",
    "compressor_risk",
    "exhaust_path_risk",
    "cooling_or_lubrication_risk",
    "shutdown_risk",
]


def train_model(df, asset_type: str):
    """
    Train a multi-output regression model for a given asset type.

    Returns:
        model: trained sklearn model
        feature_cols: list of feature column names (order matters)
    """

    # -------------------------
    # Separate features and targets
    # -------------------------
    feature_cols = [
        col for col in df.columns
        if col not in TARGET_COLS
        and col not in ["timestamp", "asset_type"]
    ]

    X = df[feature_cols]
    y = df[TARGET_COLS]

    # -------------------------
    # Time-aware train/validation split
    # -------------------------
    split_idx = int(len(df) * 0.8)

    X_train = X.iloc[:split_idx]
    y_train = y.iloc[:split_idx]

    # -------------------------
    # Model definition
    # -------------------------
    model = MultiOutputRegressor(
    RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1,
    )
)

    # -------------------------
    # Train model
    # -------------------------
    model.fit(X_train, y_train)

    return model, feature_cols
