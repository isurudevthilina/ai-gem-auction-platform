"""
train.py
--------
Training pipeline for the gem price prediction model.

Usage:
    cd ml
    python train.py

The script:
  1. Loads the pre-processed CSV dataset (data/final_gem_data_for_train.csv)
  2. Applies the real RobustScaler inverse to recover original carat_weight, x, y, z
  3. Engineers derived features: mean_width, depth_ratio
  4. Trains 3 regressors (XGBoost, Random Forest, LightGBM) with 5-fold CV
  5. Compares models on a hold-out test set and selects the best
  6. Retrains the best model on the full dataset
  7. Saves all model artifacts to models/
"""

import os
import sys
import json
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.ensemble import RandomForestRegressor
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
SCALER_PATH = os.path.join(MODEL_DIR, "robust_scaler.joblib")

# Scaler was fit on [Weight, X, Y, Z] in this order
SCALER_FEATURE_ORDER = ["Weight", "X", "Y", "Z"]

# ---------------------------------------------------------------------------
# Load & prepare
# ---------------------------------------------------------------------------
def load_and_prepare(path: str) -> pd.DataFrame:
    print(f"📂  Loading dataset: {path}")
    df = pd.read_csv(path)
    print(f"    Raw shape: {df.shape}")
    print(f"    Columns:   {list(df.columns)}")

    # Required columns in the CSV
    required = {"Type", "Shape", "Color", "Clarity", "Treatment", "Weight", "Log_Price", "X", "Y", "Z"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Use integer-encoded categoricals directly
    cat_cols = ["Type", "Shape", "Color", "Clarity", "Treatment"]
    for col in cat_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype(int)

    # Load real robust scaler and inverse-transform [Weight, X, Y, Z]
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"RobustScaler not found at {SCALER_PATH}. Place the real scaler there.")

    scaler = joblib.load(SCALER_PATH)
    scaled_vals = df[["Weight", "X", "Y", "Z"]].values
    original_vals = scaler.inverse_transform(scaled_vals)

    df["carat_weight"] = original_vals[:, 0]
    df["x"] = original_vals[:, 1]
    df["y"] = original_vals[:, 2]
    df["z"] = original_vals[:, 3]

    # Target
    df["log_price"] = pd.to_numeric(df["Log_Price"], errors="coerce")

    # Derived features
    df["mean_width"] = (df["x"] + df["y"]) / 2.0
    df["depth_ratio"] = df["z"] / df["mean_width"]

    # Keep only what we need
    use_cols = cat_cols + ["carat_weight", "x", "y", "z", "mean_width", "depth_ratio", "log_price"]
    df = df[use_cols].copy()
    df.dropna(inplace=True)

    # Sanity filters
    df = df[df["carat_weight"] > 0]
    df = df[df["x"] > 0]
    df = df[df["y"] > 0]
    df = df[df["z"] > 0]
    df = df[df["log_price"] > 0]
    df = df[np.isfinite(df["depth_ratio"])]

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
    print(f"    X range:     [{df['x'].min():.3f}, {df['x'].max():.3f}]")
    print(f"    Y range:     [{df['y'].min():.3f}, {df['y'].max():.3f}]")
    print(f"    Z range:     [{df['z'].min():.3f}, {df['z'].max():.3f}]")
    print(f"    LogPrice range: [{df['log_price'].min():.3f}, {df['log_price'].max():.3f}]")
    return df


# ---------------------------------------------------------------------------
# Model definitions
# ---------------------------------------------------------------------------
def get_models():
    """Return a dict of model_name -> (model_instance, needs_log_target)."""
    models = {
        "XGBoost": XGBRegressor(
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
        ),
        "RandomForest": RandomForestRegressor(
            n_estimators=500,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features="sqrt",
            random_state=42,
            n_jobs=-1,
        ),
    }

    # LightGBM is optional
    try:
        import lightgbm as lgb
        models["LightGBM"] = lgb.LGBMRegressor(
            n_estimators=800,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.05,
            reg_lambda=1.0,
            random_state=42,
            n_jobs=-1,
            verbose=-1,
        )
    except ImportError:
        print("⚠️  LightGBM not installed. Skipping LightGBM model.")

    return models


# ---------------------------------------------------------------------------
# Evaluate helper
# ---------------------------------------------------------------------------
def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    return {"rmse": rmse, "mae": mae, "r2": r2, "mape": mape}


# ---------------------------------------------------------------------------
# Train & compare
# ---------------------------------------------------------------------------
def train_and_compare(df: pd.DataFrame):
    X = df[FEATURE_ORDER].values
    y = df["log_price"].values

    # Train/test split for fair comparison (20% hold-out)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = get_models()
    results = {}
    trained_models = {}
    cv_scores = {}

    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    print("\n" + "=" * 60)
    print("🏋️  TRAINING & COMPARING MODELS")
    print("=" * 60)

    for name, model in models.items():
        print(f"\n📌 {name}")

        # 5-fold CV on log-space RMSE
        neg_mse = cross_val_score(model, X_train, y_train, cv=kf,
                                   scoring="neg_mean_squared_error", n_jobs=-1)
        rmse_scores = np.sqrt(-neg_mse)
        print(f"    CV log-RMSE: {np.round(rmse_scores, 4)}")
        print(f"    Mean: {rmse_scores.mean():.4f}  |  Std: {rmse_scores.std():.4f}")
        cv_scores[name] = float(rmse_scores.std())

        # Train on full train split for test evaluation
        model.fit(X_train, y_train)
        metrics = evaluate_model(model, X_test, y_test)
        print(f"    Test log-RMSE: {metrics['rmse']:.4f}")
        print(f"    Test R²:       {metrics['r2']:.4f}")
        print(f"    Test MAPE:     {metrics['mape']:.2f}%")

        results[name] = metrics
        trained_models[name] = model

    # Select best model by Test R² (primary), then lower RMSE
    best_name = max(results, key=lambda n: (results[n]["r2"], -results[n]["rmse"]))
    print("\n" + "=" * 60)
    print("🏆 BEST MODEL:", best_name)
    print("=" * 60)
    for name, m in results.items():
        marker = "✅" if name == best_name else "  "
        print(f"{marker} {name:<14} R²={m['r2']:.4f}  RMSE={m['rmse']:.4f}  MAPE={m['mape']:.2f}%")

    # Retrain best model on FULL dataset for production
    print(f"\n🔁 Retraining {best_name} on full dataset …")
    best_model = trained_models[best_name]
    best_model.fit(X, y)

    return best_model, best_name, cv_scores[best_name], results, trained_models


# ---------------------------------------------------------------------------
# Save
# ---------------------------------------------------------------------------
def save_artifacts(best_model, best_name: str, rmse_std: float,
                   all_results: dict, all_models: dict):
    # Best model artifacts
    joblib.dump(best_model, os.path.join(MODEL_DIR, "best_model.pkl"))
    joblib.dump(best_name, os.path.join(MODEL_DIR, "best_model_name.pkl"))
    joblib.dump(rmse_std, os.path.join(MODEL_DIR, "rmse_std.pkl"))
    joblib.dump(FEATURE_ORDER, os.path.join(MODEL_DIR, "feature_names.pkl"))

    # Individual model backups
    for name, model in all_models.items():
        fname = name.lower().replace(" ", "_") + "_model.pkl"
        joblib.dump(model, os.path.join(MODEL_DIR, fname))

    # Comparison JSON
    comparison = {
        "best_model": best_name,
        "best_metrics": all_results[best_name],
        "all_models": {
            name: {k: round(v, 6) if isinstance(v, float) else v for k, v in metrics.items()}
            for name, metrics in all_results.items()
        },
        "feature_order": FEATURE_ORDER,
    }
    with open(os.path.join(MODEL_DIR, "model_comparison.json"), "w") as f:
        json.dump(comparison, f, indent=2)

    print(f"\n✅  Best model saved      → {os.path.join(MODEL_DIR, 'best_model.pkl')}")
    print(f"    Model name saved      → {os.path.join(MODEL_DIR, 'best_model_name.pkl')}")
    print(f"    RMSE std saved        → {os.path.join(MODEL_DIR, 'rmse_std.pkl')}")
    print(f"    Features saved        → {os.path.join(MODEL_DIR, 'feature_names.pkl')}")
    print(f"    Comparison JSON saved → {os.path.join(MODEL_DIR, 'model_comparison.json')}")
    for name in all_models:
        fname = name.lower().replace(" ", "_") + "_model.pkl"
        print(f"    {name} backup saved   → {os.path.join(MODEL_DIR, fname)}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if not os.path.exists(DATA_PATH):
        print(f"❌  Dataset not found: {DATA_PATH}")
        sys.exit(1)

    df = load_and_prepare(DATA_PATH)
    best_model, best_name, rmse_std, results, all_models = train_and_compare(df)
    save_artifacts(best_model, best_name, rmse_std, results, all_models)

    print("\n🎉  Training complete. Start the API with:")
    print("    uvicorn app.main:app --reload --port 8000")
