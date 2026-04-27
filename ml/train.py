"""
train.py
--------
Training pipeline for the gem price prediction model.

Usage:
    cd ml
    python train.py

The script:
  1. Loads the pre-processed CSV dataset (data/final_gem_data_for_train.csv)
  2. Recovers approximate carat weights from the pre-processed Weight column
  3. Uses integer-encoded categoricals directly (Type, Shape, Color, Clarity, Treatment)
  4. Trains an XGBoost regressor predicting Log_Price with 5-fold CV
  5. Saves the model, feature names, and log-space RMSE std to models/

Note on Weight preprocessing:
    The friend pre-processed the original carat weights so that the median became 0
    and values are expressed as +/- deviations. We approximate the inverse with:
        carat_weight = Weight + CARAT_RECOVERY_OFFSET
    The offset (0.656) was validated by checking that recovered carat weights produce
    realistic price-per-carat values for every gem type in the dataset.
    TODO: Replace with the exact RobustScaler inverse once the friend provides it.
"""

import os
import sys
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, cross_val_score
from sklearn.metrics import mean_squared_error
from xgboost import XGBRegressor

# Ensure app/ is importable when running from ml/
sys.path.insert(0, os.path.dirname(__file__))

from app.encoders import FEATURE_ORDER

warnings.filterwarnings("ignore")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "final_gem_data_for_train.csv")

# Approximate inverse of the friend's weight preprocessing.
# The dataset Weight column has median≈0 and min≈-0.556.
# Adding 0.656 shifts the minimum to ~0.1 ct and the median to ~0.66 ct,
# which produces very realistic price-per-carat medians across all 8 gem types.
CARAT_RECOVERY_OFFSET = 0.656

# ---------------------------------------------------------------------------
# Load & prepare
# ---------------------------------------------------------------------------
def load_and_prepare(path: str) -> pd.DataFrame:
    print(f"📂  Loading dataset: {path}")
    df = pd.read_csv(path)
    print(f"    Raw shape: {df.shape}")
    print(f"    Columns:   {list(df.columns)}")

    # Required columns in the CSV
    required = {"Type", "Shape", "Color", "Clarity", "Treatment", "Weight", "Log_Price"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Use integer-encoded categoricals directly
    cat_cols = ["Type", "Shape", "Color", "Clarity", "Treatment"]
    for col in cat_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype(int)

    # Recover approximate carat weight from pre-processed Weight
    df["carat_weight"] = pd.to_numeric(df["Weight"], errors="coerce") + CARAT_RECOVERY_OFFSET

    # Target
    df["log_price"] = pd.to_numeric(df["Log_Price"], errors="coerce")

    # Keep only what we need
    use_cols = ["Type", "Shape", "Color", "Clarity", "Treatment", "carat_weight", "log_price"]
    df = df[use_cols].copy()
    df.dropna(inplace=True)

    # Sanity filters
    df = df[df["carat_weight"] > 0]
    df = df[df["log_price"] > 0]

    # Rename to match encoders.py naming
    df.rename(columns={
        "Type": "type",
        "Shape": "shape",
        "Color": "color",
        "Clarity": "clarity",
        "Treatment": "treatment",
    }, inplace=True)

    print(f"    Clean rows:  {len(df)}")
    print(f"    Carat range: [{df['carat_weight'].min():.3f}, {df['carat_weight'].max():.3f}]")
    print(f"    LogPrice range: [{df['log_price'].min():.3f}, {df['log_price'].max():.3f}]")
    return df


# ---------------------------------------------------------------------------
# Train
# ---------------------------------------------------------------------------
def train(df: pd.DataFrame):
    X = df[FEATURE_ORDER].values
    y = df["log_price"].values

    model = XGBRegressor(
        n_estimators=800,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.1,
        reg_alpha=0.05,
        reg_lambda=1.0,
        random_state=42,
        n_jobs=-1,
        tree_method="hist",
    )

    print("\n🔀  Running 5-fold cross-validation (log-space) …")
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    neg_mse_scores = cross_val_score(model, X, y, cv=kf, scoring="neg_mean_squared_error", n_jobs=-1)
    rmse_scores = np.sqrt(-neg_mse_scores)
    print(f"    CV log-RMSE scores: {np.round(rmse_scores, 4)}")
    mean_rmse = float(rmse_scores.mean())
    std_rmse = float(rmse_scores.std())
    print(f"    Mean log-RMSE: {mean_rmse:.4f}  |  Std: {std_rmse:.4f}")

    # Approximate median percentage error in LKR space
    median_pct_err = (np.exp(mean_rmse) - 1) * 100
    print(f"    ≈ Median LKR % error: {median_pct_err:.1f}%")

    print("\n🏋️  Training final model on full dataset …")
    model.fit(X, y)

    return model, mean_rmse


# ---------------------------------------------------------------------------
# Save
# ---------------------------------------------------------------------------
def save_artifacts(model, rmse_std: float):
    model_path = os.path.join(MODEL_DIR, "gem_price_model.pkl")
    rmse_path  = os.path.join(MODEL_DIR, "rmse_std.pkl")
    feat_path  = os.path.join(MODEL_DIR, "feature_names.pkl")
    offset_path = os.path.join(MODEL_DIR, "carat_offset.pkl")

    joblib.dump(model,       model_path)
    joblib.dump(rmse_std,    rmse_path)
    joblib.dump(FEATURE_ORDER, feat_path)
    joblib.dump(CARAT_RECOVERY_OFFSET, offset_path)

    print(f"\n✅  Model saved      → {model_path}")
    print(f"    RMSE std saved   → {rmse_path}")
    print(f"    Features saved   → {feat_path}")
    print(f"    Carat offset saved → {offset_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if not os.path.exists(DATA_PATH):
        print(f"❌  Dataset not found: {DATA_PATH}")
        sys.exit(1)

    df = load_and_prepare(DATA_PATH)
    model, rmse_std = train(df)
    save_artifacts(model, rmse_std)
    print("\n🎉  Training complete. Start the API with:")
    print("    uvicorn app.main:app --reload --port 8000")
