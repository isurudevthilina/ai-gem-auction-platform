"""
compare_models.py
-----------------
Comprehensive model comparison + EDA for gem price prediction.

Trains XGBoost, Random Forest, and LightGBM on the same train/test split,
computes regression & classification metrics, generates comparison plots,
and prints a ranked leaderboard.

Run:
    cd ml && source venv/bin/activate && python evaluation/compare_models.py

Outputs:
    evaluation/model_comparison.json
    evaluation/model_comparison_r2.png
    evaluation/model_comparison_rmse.png
    evaluation/model_comparison_mape.png
    evaluation/feature_correlation_heatmap.png
    evaluation/dimension_distribution.png
    evaluation/price_vs_dimensions.png
    evaluation/shap_comparison.png
    evaluation/residuals_comparison.png
"""

import os
import sys
import json
import math
import warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    explained_variance_score, median_absolute_error,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix
)
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from app.encoders import FEATURE_ORDER

warnings.filterwarnings('ignore')
plt.style.use('dark_background')
sns.set_palette("husl")

EVAL_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(EVAL_DIR, '..', 'models')
DATA_PATH = os.path.join(EVAL_DIR, '..', 'data', 'final_gem_data_for_train.csv')
SCALER_PATH = os.path.join(MODEL_DIR, 'robust_scaler.joblib')

# ---------------------------------------------------------------------------
# Load data (same pipeline as train.py)
# ---------------------------------------------------------------------------
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
        'Type': 'type', 'Shape': 'shape', 'Color': 'color',
        'Clarity': 'clarity', 'Treatment': 'treatment'
    }, inplace=True)

    df = df[FEATURE_ORDER + ['log_price', 'Price']].copy()
    df.dropna(inplace=True)
    df = df[
        (df['carat_weight'] > 0) & (df['x'] > 0) &
        (df['y'] > 0) & (df['z'] > 0) & (df['log_price'] > 0) &
        np.isfinite(df['depth_ratio'])
    ]
    return df


# ---------------------------------------------------------------------------
# Price tier bins
# ---------------------------------------------------------------------------
def price_tier(price_lkr):
    if price_lkr < 10_000:
        return 'Budget'
    elif price_lkr < 50_000:
        return 'Affordable'
    elif price_lkr < 200_000:
        return 'Mid-Range'
    elif price_lkr < 1_000_000:
        return 'Premium'
    else:
        return 'Luxury'


# ---------------------------------------------------------------------------
# Model builders
# ---------------------------------------------------------------------------
def get_models():
    models = {
        "XGBoost": XGBRegressor(
            n_estimators=800, learning_rate=0.05, max_depth=6,
            subsample=0.8, colsample_bytree=0.8, min_child_weight=3,
            gamma=0.1, reg_alpha=0.05, reg_lambda=1.0,
            random_state=42, n_jobs=-1, tree_method="hist",
        ),
        "RandomForest": RandomForestRegressor(
            n_estimators=500, max_depth=12, min_samples_split=5,
            min_samples_leaf=2, max_features="sqrt",
            random_state=42, n_jobs=-1,
        ),
    }
    try:
        import lightgbm as lgb
        models["LightGBM"] = lgb.LGBMRegressor(
            n_estimators=800, learning_rate=0.05, max_depth=6,
            subsample=0.8, colsample_bytree=0.8,
            reg_alpha=0.05, reg_lambda=1.0,
            random_state=42, n_jobs=-1, verbose=-1,
        )
    except ImportError:
        pass
    return models


# ---------------------------------------------------------------------------
# Metrics helper
# ---------------------------------------------------------------------------
def compute_metrics(y_true_log, y_pred_log, y_true_price, y_pred_price):
    mae_log = mean_absolute_error(y_true_log, y_pred_log)
    rmse_log = math.sqrt(mean_squared_error(y_true_log, y_pred_log))
    r2_log = r2_score(y_true_log, y_pred_log)
    mape_log = np.mean(np.abs((y_true_log - y_pred_log) / y_true_log)) * 100

    mae_lkr = mean_absolute_error(y_true_price, y_pred_price)
    rmse_lkr = math.sqrt(mean_squared_error(y_true_price, y_pred_price))
    r2_lkr = r2_score(y_true_price, y_pred_price)
    mape_lkr = np.mean(np.abs((y_true_price - y_pred_price) / y_true_price)) * 100
    med_ae_lkr = median_absolute_error(y_true_price, y_pred_price)

    # Price-tier classification
    tiers_true = pd.Series(y_true_price).apply(price_tier)
    tiers_pred = pd.Series(y_pred_price).apply(price_tier)
    tier_labels = ['Budget', 'Affordable', 'Mid-Range', 'Premium', 'Luxury']
    tier_acc = accuracy_score(tiers_true, tiers_pred)

    return {
        "Log_RMSE": round(rmse_log, 4),
        "Log_MAE": round(mae_log, 4),
        "Log_R2": round(r2_log, 4),
        "Log_MAPE_pct": round(mape_log, 2),
        "LKR_RMSE": round(rmse_lkr, 2),
        "LKR_MAE": round(mae_lkr, 2),
        "LKR_R2": round(r2_lkr, 4),
        "LKR_MAPE_pct": round(mape_lkr, 2),
        "LKR_Median_AE": round(med_ae_lkr, 2),
        "Tier_Accuracy": round(float(tier_acc), 4),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("📂 Loading data...")
    df = load_data()
    print(f"    Rows: {len(df)}  |  Features: {len(FEATURE_ORDER)}")

    X = df[FEATURE_ORDER]
    y_log = df['log_price'].values
    y_price = df['Price'].values

    X_train, X_test, ylog_train, ylog_test, yprice_train, yprice_test = train_test_split(
        X, y_log, y_price, test_size=0.2, random_state=42
    )

    models = get_models()
    results = {}
    trained = {}

    print("\n" + "=" * 60)
    print("🧠 TRAINING & EVALUATING MODELS")
    print("=" * 60)

    for name, model in models.items():
        print(f"\n📌 {name}")
        model.fit(X_train, ylog_train)
        ylog_pred = model.predict(X_test)
        yprice_pred = np.exp(ylog_pred)
        metrics = compute_metrics(ylog_test, ylog_pred, yprice_test, yprice_pred)
        results[name] = metrics
        trained[name] = model
        print(f"    Log R²: {metrics['Log_R2']:.4f}  |  Log RMSE: {metrics['Log_RMSE']:.4f}")
        print(f"    LKR MAPE: {metrics['LKR_MAPE_pct']:.2f}%  |  Tier Acc: {metrics['Tier_Accuracy']:.2%}")

    # Rank by Log R² (primary) then Log RMSE
    ranked = sorted(results, key=lambda n: (results[n]["Log_R2"], -results[n]["Log_RMSE"]), reverse=True)
    best_name = ranked[0]

    print("\n" + "=" * 60)
    print("🏆 LEADERBOARD")
    print("=" * 60)
    for i, name in enumerate(ranked, 1):
        m = results[name]
        marker = "🥇" if i == 1 else "🥈" if i == 2 else "🥉"
        print(f"{marker} #{i} {name:<14}  Log R²={m['Log_R2']:.4f}  RMSE={m['Log_RMSE']:.4f}  LKR_MAPE={m['LKR_MAPE_pct']:.2f}%  TierAcc={m['Tier_Accuracy']:.2%}")

    # Save JSON
    json_path = os.path.join(EVAL_DIR, 'model_comparison.json')
    with open(json_path, 'w') as f:
        json.dump({
            "best_model": best_name,
            "ranking": ranked,
            "metrics": results,
            "features": FEATURE_ORDER,
            "dataset_size": len(df),
            "test_size": len(X_test),
        }, f, indent=2)
    print(f"\n✅ JSON saved → {json_path}")

    # ------------------------------------------------------------------
    # Plots
    # ------------------------------------------------------------------
    print("\n📊 Generating plots...")

    # 1. Model comparison bars (R²)
    fig, ax = plt.subplots(figsize=(8, 5))
    names = list(results.keys())
    r2_vals = [results[n]["Log_R2"] for n in names]
    colors = ['#3b82f6', '#10b981', '#f59e0b']
    bars = ax.bar(names, r2_vals, color=colors[:len(names)], edgecolor='white', linewidth=0.5)
    ax.set_ylabel('Log-Space R²', fontsize=11)
    ax.set_title('Model Comparison — R² Score (Test Set)', fontsize=13, fontweight='bold')
    ax.set_ylim(0.9, 1.0)
    for bar, val in zip(bars, r2_vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.001,
                f'{val:.4f}', ha='center', va='bottom', fontsize=10, color='white', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'model_comparison_r2.png'), dpi=150)
    plt.close()
    print("    model_comparison_r2.png")

    # 2. Model comparison bars (RMSE)
    fig, ax = plt.subplots(figsize=(8, 5))
    rmse_vals = [results[n]["Log_RMSE"] for n in names]
    bars = ax.bar(names, rmse_vals, color=colors[:len(names)], edgecolor='white', linewidth=0.5)
    ax.set_ylabel('Log-Space RMSE', fontsize=11)
    ax.set_title('Model Comparison — RMSE (Test Set)', fontsize=13, fontweight='bold')
    for bar, val in zip(bars, rmse_vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.002,
                f'{val:.4f}', ha='center', va='bottom', fontsize=10, color='white', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'model_comparison_rmse.png'), dpi=150)
    plt.close()
    print("    model_comparison_rmse.png")

    # 3. Model comparison bars (MAPE)
    fig, ax = plt.subplots(figsize=(8, 5))
    mape_vals = [results[n]["LKR_MAPE_pct"] for n in names]
    bars = ax.bar(names, mape_vals, color=colors[:len(names)], edgecolor='white', linewidth=0.5)
    ax.set_ylabel('LKR-Space MAPE (%)', fontsize=11)
    ax.set_title('Model Comparison — MAPE (Test Set)', fontsize=13, fontweight='bold')
    for bar, val in zip(bars, mape_vals):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1,
                f'{val:.2f}%', ha='center', va='bottom', fontsize=10, color='white', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'model_comparison_mape.png'), dpi=150)
    plt.close()
    print("    model_comparison_mape.png")

    # 4. Feature correlation heatmap
    corr_cols = FEATURE_ORDER + ['log_price']
    corr = df[corr_cols].corr()
    fig, ax = plt.subplots(figsize=(12, 10))
    sns.heatmap(corr, annot=True, fmt='.2f', cmap='RdBu_r', center=0,
                square=True, linewidths=0.5, ax=ax, vmin=-1, vmax=1)
    ax.set_title('Feature Correlation Heatmap', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'feature_correlation_heatmap.png'), dpi=150)
    plt.close()
    print("    feature_correlation_heatmap.png")

    # 5. Dimension distributions
    fig, axes = plt.subplots(2, 3, figsize=(14, 8))
    dim_cols = ['x', 'y', 'z', 'mean_width', 'depth_ratio', 'carat_weight']
    dim_titles = ['Length (X)', 'Width (Y)', 'Depth (Z)', 'Mean Width', 'Depth Ratio', 'Carat Weight']
    for ax, col, title in zip(axes.flat, dim_cols, dim_titles):
        ax.hist(df[col], bins=80, color='#8b5cf6', edgecolor='black', alpha=0.8)
        ax.set_title(title, fontsize=11, fontweight='bold')
        ax.set_xlabel('Value')
        ax.set_ylabel('Frequency')
        # Clip extreme outliers for visualization
        ax.set_xlim(df[col].quantile(0.01), df[col].quantile(0.99))
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'dimension_distribution.png'), dpi=150)
    plt.close()
    print("    dimension_distribution.png")

    # 6. Price vs dimensions scatter
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    scatter_pairs = [
        ('x', 'Length (X) mm'),
        ('y', 'Width (Y) mm'),
        ('z', 'Depth (Z) mm'),
        ('carat_weight', 'Carat Weight'),
    ]
    for ax, (col, label) in zip(axes.flat, scatter_pairs):
        ax.scatter(df[col], df['Price'], alpha=0.3, s=8, color='#3b82f6')
        ax.set_xlabel(label, fontsize=10)
        ax.set_ylabel('Price (LKR)', fontsize=10)
        ax.set_title(f'Price vs {label}', fontsize=11, fontweight='bold')
        ax.set_ylim(0, df['Price'].quantile(0.98))
        ax.set_xlim(df[col].quantile(0.01), df[col].quantile(0.99))
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'price_vs_dimensions.png'), dpi=150)
    plt.close()
    print("    price_vs_dimensions.png")

    # 7. SHAP summary for best model
    try:
        import shap
        print("\n🧠 Generating SHAP summary for best model...")
        best_model = trained[best_name]
        explainer = shap.TreeExplainer(best_model)
        shap_values = explainer.shap_values(X_test)

        fig, ax = plt.subplots(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test, feature_names=FEATURE_ORDER,
                          show=False, plot_size=(10, 6))
        plt.title(f'SHAP Summary — {best_name}', fontsize=13, fontweight='bold')
        plt.tight_layout()
        plt.savefig(os.path.join(EVAL_DIR, 'shap_comparison.png'), dpi=150)
        plt.close()
        print("    shap_comparison.png")
    except Exception as e:
        print(f"    ⚠️ SHAP plot skipped: {e}")

    # 8. Residuals comparison
    fig, axes = plt.subplots(1, len(models), figsize=(6 * len(models), 5))
    if len(models) == 1:
        axes = [axes]
    for ax, (name, model) in zip(axes, trained.items()):
        ylog_pred = model.predict(X_test)
        residuals = ylog_test - ylog_pred
        ax.hist(residuals, bins=80, color='#10b981', edgecolor='black', alpha=0.8)
        ax.axvline(0, color='red', linestyle='--', lw=2)
        ax.set_xlabel('Residual (Log-Space)', fontsize=10)
        ax.set_ylabel('Frequency', fontsize=10)
        ax.set_title(f'{name} Residuals', fontsize=11, fontweight='bold')
        ax.set_xlim(np.percentile(residuals, 1), np.percentile(residuals, 99))
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'residuals_comparison.png'), dpi=150)
    plt.close()
    print("    residuals_comparison.png")

    print("\n✅ All evaluation artifacts saved to ml/evaluation/")


if __name__ == '__main__':
    main()
