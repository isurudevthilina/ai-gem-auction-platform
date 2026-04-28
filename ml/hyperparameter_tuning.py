"""
hyperparameter_tuning.py
------------------------
Hyperparameter tuning setup for XGBoost, Random Forest, and LightGBM.

Uses Optuna to minimize 5-fold log-space RMSE. Each model type gets its own
study. Results are saved to ml/models/tuning_results/.

Run manually when ready:
    cd ml && source venv/bin/activate && python hyperparameter_tuning.py

Note: This script does NOT auto-run the tuning on import.
"""

import os
import sys
import json
import warnings
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

sys.path.insert(0, os.path.dirname(__file__))
from app.encoders import FEATURE_ORDER

warnings.filterwarnings("ignore")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
TUNING_DIR = os.path.join(MODEL_DIR, "tuning_results")
os.makedirs(TUNING_DIR, exist_ok=True)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "final_gem_data_for_train.csv")
SCALER_PATH = os.path.join(MODEL_DIR, "robust_scaler.joblib")


def load_data():
    df = pd.read_csv(DATA_PATH)
    scaler = joblib.load(SCALER_PATH)
    scaled_vals = df[["Weight", "X", "Y", "Z"]].values
    original_vals = scaler.inverse_transform(scaled_vals)

    df["carat_weight"] = original_vals[:, 0]
    df["x"] = original_vals[:, 1]
    df["y"] = original_vals[:, 2]
    df["z"] = original_vals[:, 3]
    df["log_price"] = pd.to_numeric(df["Log_Price"], errors="coerce")
    df["mean_width"] = (df["x"] + df["y"]) / 2.0
    df["depth_ratio"] = df["z"] / df["mean_width"]

    cat_cols = ["Type", "Shape", "Color", "Clarity", "Treatment"]
    for c in cat_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").astype(int)

    df.rename(columns={
        "Type": "type", "Shape": "shape", "Color": "color",
        "Clarity": "clarity", "Treatment": "treatment",
    }, inplace=True)

    df = df[FEATURE_ORDER + ["log_price"]].copy()
    df.dropna(inplace=True)
    df = df[
        (df["carat_weight"] > 0) & (df["x"] > 0) &
        (df["y"] > 0) & (df["z"] > 0) & (df["log_price"] > 0) &
        np.isfinite(df["depth_ratio"])
    ]
    return df


# ---------------------------------------------------------------------------
# Objective functions
# ---------------------------------------------------------------------------
def objective_xgboost(trial, X, y):
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 200, 1500),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "min_child_weight": trial.suggest_int("min_child_weight", 1, 10),
        "gamma": trial.suggest_float("gamma", 0.0, 0.5),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 1.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
        "random_state": 42,
        "n_jobs": -1,
        "tree_method": "hist",
    }
    model = XGBRegressor(**params)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    neg_mse = cross_val_score(model, X, y, cv=kf, scoring="neg_mean_squared_error", n_jobs=-1)
    rmse = np.sqrt(-neg_mse)
    return float(rmse.mean())


def objective_randomforest(trial, X, y):
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
        "max_depth": trial.suggest_int("max_depth", 5, 30),
        "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
        "min_samples_leaf": trial.suggest_int("min_samples_leaf", 1, 10),
        "max_features": trial.suggest_categorical("max_features", ["sqrt", "log2", None]),
        "random_state": 42,
        "n_jobs": -1,
    }
    model = RandomForestRegressor(**params)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    neg_mse = cross_val_score(model, X, y, cv=kf, scoring="neg_mean_squared_error", n_jobs=-1)
    rmse = np.sqrt(-neg_mse)
    return float(rmse.mean())


def objective_lightgbm(trial, X, y):
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 200, 1500),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
        "max_depth": trial.suggest_int("max_depth", 3, 12),
        "num_leaves": trial.suggest_int("num_leaves", 20, 150),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 1.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
        "random_state": 42,
        "n_jobs": -1,
        "verbose": -1,
    }
    import lightgbm as lgb
    model = lgb.LGBMRegressor(**params)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    neg_mse = cross_val_score(model, X, y, cv=kf, scoring="neg_mean_squared_error", n_jobs=-1)
    rmse = np.sqrt(-neg_mse)
    return float(rmse.mean())


# ---------------------------------------------------------------------------
# Run studies
# ---------------------------------------------------------------------------
def run_tuning(n_trials: int = 50):
    import optuna

    df = load_data()
    X = df[FEATURE_ORDER].values
    y = df["log_price"].values
    print(f"📂 Loaded {len(df)} samples with {len(FEATURE_ORDER)} features.")

    studies = {}

    # XGBoost
    print(f"\n🔵 Starting XGBoost tuning ({n_trials} trials)...")
    study_xgb = optuna.create_study(direction="minimize", study_name="xgboost_tuning")
    study_xgb.optimize(lambda trial: objective_xgboost(trial, X, y), n_trials=n_trials, show_progress_bar=True)
    studies["XGBoost"] = study_xgb
    print(f"    Best RMSE: {study_xgb.best_value:.4f}")
    print(f"    Best params: {study_xgb.best_params}")

    # Random Forest
    print(f"\n🟢 Starting RandomForest tuning ({n_trials} trials)...")
    study_rf = optuna.create_study(direction="minimize", study_name="randomforest_tuning")
    study_rf.optimize(lambda trial: objective_randomforest(trial, X, y), n_trials=n_trials, show_progress_bar=True)
    studies["RandomForest"] = study_rf
    print(f"    Best RMSE: {study_rf.best_value:.4f}")
    print(f"    Best params: {study_rf.best_params}")

    # LightGBM
    print(f"\n🟠 Starting LightGBM tuning ({n_trials} trials)...")
    study_lgb = optuna.create_study(direction="minimize", study_name="lightgbm_tuning")
    study_lgb.optimize(lambda trial: objective_lightgbm(trial, X, y), n_trials=n_trials, show_progress_bar=True)
    studies["LightGBM"] = study_lgb
    print(f"    Best RMSE: {study_lgb.best_value:.4f}")
    print(f"    Best params: {study_lgb.best_params}")

    # Save results
    summary = {}
    for name, study in studies.items():
        summary[name] = {
            "best_rmse": float(study.best_value),
            "best_params": study.best_params,
            "n_trials": len(study.trials),
        }
        # Save study
        joblib.dump(study, os.path.join(TUNING_DIR, f"{name.lower()}_study.pkl"))

    with open(os.path.join(TUNING_DIR, "tuning_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\n" + "=" * 60)
    print("🏆 TUNING SUMMARY")
    print("=" * 60)
    for name, s in summary.items():
        print(f"{name:<14} Best RMSE: {s['best_rmse']:.4f}")
    print(f"\n✅ Results saved to {TUNING_DIR}")


if __name__ == "__main__":
    print("=" * 60)
    print("🎛️  HYPERPARAMETER TUNING")
    print("=" * 60)
    print("This will run Optuna studies for XGBoost, RandomForest, and LightGBM.")
    print("Each study defaults to 50 trials. Adjust n_trials in run_tuning() if needed.")
    print("=" * 60)
    run_tuning(n_trials=50)
