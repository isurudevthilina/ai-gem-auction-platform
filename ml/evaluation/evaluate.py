"""
evaluate.py
-----------
Comprehensive model evaluation for the gem price prediction XGBoost model.

Run:
    cd ml && source venv/bin/activate && python evaluation/evaluate.py

Outputs:
    evaluation/evaluation_results.json   — All metrics in JSON
    evaluation/actual_vs_predicted.png   — Scatter plot
    evaluation/residuals.png             — Residual distribution
    evaluation/feature_importance.png    — XGBoost feature importance
    evaluation/shap_summary.png          — SHAP beeswarm summary
    evaluation/price_distribution.png    — Actual price distribution
    evaluation/confusion_matrix.png      — Price-tier classification
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

# Add parent dir for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.encoders import FEATURE_ORDER
from app.model import load_model, predict
from app.schema import PredictRequest

warnings.filterwarnings('ignore')
plt.style.use('dark_background')
sns.set_palette("husl")

# ─── Paths ──────────────────────────────────────────────────────────────────
EVAL_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(EVAL_DIR, '..', 'models')
DATA_PATH = os.path.join(EVAL_DIR, '..', 'data', 'final_gem_data_for_train.csv')
SCALER_PATH = os.path.join(MODEL_DIR, 'robust_scaler.joblib')

# ─── Load Data ──────────────────────────────────────────────────────────────
def load_data():
    df = pd.read_csv(DATA_PATH)
    scaler = joblib.load(SCALER_PATH)
    scaled_vals = df[['Weight', 'X', 'Y', 'Z']].values
    original_vals = scaler.inverse_transform(scaled_vals)

    df['carat_weight'] = original_vals[:, 0]
    df['x'] = original_vals[:, 1]
    df['y'] = original_vals[:, 2]
    df['z'] = original_vals[:, 3]
    df['log_price'] = df['Log_Price']
    df['mean_width'] = (df['x'] + df['y']) / 2.0
    df['depth_ratio'] = df['z'] / df['mean_width']

    cat_cols = ['Type', 'Shape', 'Color', 'Clarity', 'Treatment']
    for c in cat_cols:
        df[c] = pd.to_numeric(df[c], errors='coerce').astype(int)

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


# ─── Price Tier Bins (for classification metrics) ───────────────────────────
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


# ─── Main Evaluation ────────────────────────────────────────────────────────
def main():
    print("📂 Loading data...")
    df = load_data()
    print(f"    Rows: {len(df)}")

    X = df[FEATURE_ORDER].values
    y_log = df['log_price'].values
    y_price = df['Price'].values

    # Train/test split
    X_train, X_test, ylog_train, ylog_test, yprice_train, yprice_test = train_test_split(
        X, y_log, y_price, test_size=0.2, random_state=42, stratify=None
    )

    # Load trained model
    print("🧠 Loading trained model...")
    model_path = os.path.join(MODEL_DIR, 'best_model.pkl')
    model = joblib.load(model_path)

    # Predictions (log-space)
    ylog_pred_train = model.predict(X_train)
    ylog_pred_test = model.predict(X_test)

    # Convert to LKR
    yprice_pred_train = np.exp(ylog_pred_train)
    yprice_pred_test = np.exp(ylog_pred_test)

    # ─── Regression Metrics ───────────────────────────────────────────────
    def reg_metrics(y_true, y_pred, prefix):
        mae = mean_absolute_error(y_true, y_pred)
        rmse = math.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)
        ev = explained_variance_score(y_true, y_pred)
        med_ae = median_absolute_error(y_true, y_pred)
        mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100

        # Log-space metrics (if applicable)
        return {
            f'{prefix}_MAE': round(float(mae), 4),
            f'{prefix}_RMSE': round(float(rmse), 4),
            f'{prefix}_R2': round(float(r2), 4),
            f'{prefix}_Explained_Variance': round(float(ev), 4),
            f'{prefix}_Median_AE': round(float(med_ae), 4),
            f'{prefix}_MAPE_pct': round(float(mape), 2),
        }

    # Log-space metrics
    log_metrics_train = reg_metrics(ylog_train, ylog_pred_train, 'Log_Train')
    log_metrics_test = reg_metrics(ylog_test, ylog_pred_test, 'Log_Test')

    # LKR-space metrics
    lkr_metrics_train = reg_metrics(yprice_train, yprice_pred_train, 'LKR_Train')
    lkr_metrics_test = reg_metrics(yprice_test, yprice_pred_test, 'LKR_Test')

    # ─── Classification Metrics (Price Tiers) ─────────────────────────────
    tiers_true = pd.Series(yprice_test).apply(price_tier)
    tiers_pred = pd.Series(yprice_pred_test).apply(price_tier)

    tier_labels = ['Budget', 'Affordable', 'Mid-Range', 'Premium', 'Luxury']
    tier_accuracy = accuracy_score(tiers_true, tiers_pred)
    tier_precision = precision_score(tiers_true, tiers_pred, labels=tier_labels, average='weighted', zero_division=0)
    tier_recall = recall_score(tiers_true, tiers_pred, labels=tier_labels, average='weighted', zero_division=0)
    tier_f1 = f1_score(tiers_true, tiers_pred, labels=tier_labels, average='weighted', zero_division=0)

    # Per-tier breakdown
    cm = confusion_matrix(tiers_true, tiers_pred, labels=tier_labels)
    per_tier = {}
    for i, tier in enumerate(tier_labels):
        tp = cm[i, i]
        fp = cm[:, i].sum() - tp
        fn = cm[i, :].sum() - tp
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
        per_tier[tier] = {
            'Precision': round(precision, 4),
            'Recall': round(recall, 4),
            'F1': round(f1, 4),
            'Support': int(cm[i, :].sum())
        }

    classification_metrics = {
        'Overall_Accuracy': round(float(tier_accuracy), 4),
        'Overall_Precision': round(float(tier_precision), 4),
        'Overall_Recall': round(float(tier_recall), 4),
        'Overall_F1': round(float(tier_f1), 4),
        'Per_Tier': per_tier,
        'Confusion_Matrix': cm.tolist(),
        'Tier_Labels': tier_labels,
    }

    # ─── Feature Importance ───────────────────────────────────────────────
    importance = model.feature_importances_
    feat_imp = {f: round(float(v), 4) for f, v in zip(FEATURE_ORDER, importance)}
    feat_imp_sorted = dict(sorted(feat_imp.items(), key=lambda x: x[1], reverse=True))

    # ─── Dataset Stats ────────────────────────────────────────────────────
    dataset_stats = {
        'Total_Samples': len(df),
        'Train_Samples': len(X_train),
        'Test_Samples': len(X_test),
        'Features': FEATURE_ORDER,
        'Price_LKR_Min': round(float(y_price.min()), 2),
        'Price_LKR_Max': round(float(y_price.max()), 2),
        'Price_LKR_Mean': round(float(y_price.mean()), 2),
        'Price_LKR_Median': round(float(np.median(y_price)), 2),
        'Price_LKR_Std': round(float(y_price.std()), 2),
        'Log_Price_Mean': round(float(y_log.mean()), 4),
        'Log_Price_Std': round(float(y_log.std()), 4),
    }

    # ─── Compile JSON ─────────────────────────────────────────────────────
    results = {
        'Dataset_Stats': dataset_stats,
        'Regression_Metrics_LogSpace': {**log_metrics_train, **log_metrics_test},
        'Regression_Metrics_LKRSpace': {**lkr_metrics_train, **lkr_metrics_test},
        'Classification_Metrics_PriceTiers': classification_metrics,
        'Feature_Importance': feat_imp_sorted,
        'Model_Info': {
            'Model_Type': 'BestModel',
            'Target': 'Log_Price (natural log of LKR)',
            'Output_Currency': 'LKR',
            'Evaluation_Date': pd.Timestamp.now().isoformat(),
        }
    }

    json_path = os.path.join(EVAL_DIR, 'evaluation_results.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✅ JSON saved → {json_path}")

    # ─── Plots ────────────────────────────────────────────────────────────
    print("\n📊 Generating plots...")

    # 1. Actual vs Predicted (LKR)
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.scatter(yprice_test, yprice_pred_test, alpha=0.5, s=20, color='#3b82f6')
    ax.plot([yprice_test.min(), yprice_test.max()], [yprice_test.min(), yprice_test.max()],
            'r--', lw=2, label='Perfect Prediction')
    ax.set_xlabel('Actual Price (LKR)', fontsize=11)
    ax.set_ylabel('Predicted Price (LKR)', fontsize=11)
    ax.set_title('Actual vs Predicted Price (Test Set)', fontsize=13, fontweight='bold')
    ax.legend()
    ax.set_xlim(0, np.percentile(yprice_test, 99))
    ax.set_ylim(0, np.percentile(yprice_pred_test, 99))
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'actual_vs_predicted.png'), dpi=150)
    plt.close()
    print("    actual_vs_predicted.png")

    # 2. Residuals
    residuals = yprice_test - yprice_pred_test
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.hist(residuals, bins=80, color='#10b981', edgecolor='black', alpha=0.8)
    ax.axvline(0, color='red', linestyle='--', lw=2)
    ax.set_xlabel('Residual (Actual − Predicted) LKR', fontsize=11)
    ax.set_ylabel('Frequency', fontsize=11)
    ax.set_title('Residual Distribution (Test Set)', fontsize=13, fontweight='bold')
    ax.set_xlim(np.percentile(residuals, 1), np.percentile(residuals, 99))
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'residuals.png'), dpi=150)
    plt.close()
    print("    residuals.png")

    # 3. Feature Importance
    fig, ax = plt.subplots(figsize=(8, 5))
    features = list(feat_imp_sorted.keys())
    values = list(feat_imp_sorted.values())
    bars = ax.barh(features[::-1], values[::-1], color='#f59e0b')
    ax.set_xlabel('Importance', fontsize=11)
    ax.set_title('XGBoost Feature Importance', fontsize=13, fontweight='bold')
    for bar, val in zip(bars, values[::-1]):
        ax.text(val + 0.005, bar.get_y() + bar.get_height()/2, f'{val:.3f}',
                va='center', fontsize=9, color='white')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'feature_importance.png'), dpi=150)
    plt.close()
    print("    feature_importance.png")

    # 4. Price Distribution
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    axes[0].hist(y_price, bins=100, color='#8b5cf6', edgecolor='black', alpha=0.8)
    axes[0].set_xlabel('Price (LKR)', fontsize=11)
    axes[0].set_ylabel('Frequency', fontsize=11)
    axes[0].set_title('Actual Price Distribution (Raw LKR)', fontsize=12, fontweight='bold')
    axes[0].set_xlim(0, np.percentile(y_price, 98))

    axes[1].hist(y_log, bins=100, color='#ec4899', edgecolor='black', alpha=0.8)
    axes[1].set_xlabel('Log(Price)', fontsize=11)
    axes[1].set_ylabel('Frequency', fontsize=11)
    axes[1].set_title('Log-Price Distribution (Model Target)', fontsize=12, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'price_distribution.png'), dpi=150)
    plt.close()
    print("    price_distribution.png")

    # 5. Confusion Matrix (Price Tiers)
    fig, ax = plt.subplots(figsize=(7, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='YlOrRd',
                xticklabels=tier_labels, yticklabels=tier_labels,
                ax=ax, linewidths=0.5)
    ax.set_xlabel('Predicted Tier', fontsize=11)
    ax.set_ylabel('Actual Tier', fontsize=11)
    ax.set_title('Price Tier Confusion Matrix (Test Set)', fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(EVAL_DIR, 'confusion_matrix.png'), dpi=150)
    plt.close()
    print("    confusion_matrix.png")

    # 6. SHAP Summary (if shap available)
    try:
        import shap
        print("\n🧠 Generating SHAP summary (this may take a moment)...")
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test.values)

        fig, ax = plt.subplots(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test.values, feature_names=FEATURE_ORDER,
                          show=False, plot_size=(10, 6))
        plt.title('SHAP Feature Impact Summary', fontsize=13, fontweight='bold')
        plt.tight_layout()
        plt.savefig(os.path.join(EVAL_DIR, 'shap_summary.png'), dpi=150)
        plt.close()
        print("    shap_summary.png")
    except Exception as e:
        print(f"    ⚠️ SHAP plot skipped: {e}")

    # ─── Print Summary ────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("📊 EVALUATION SUMMARY")
    print("="*60)
    print(f"\nDataset: {dataset_stats['Total_Samples']:,} samples")
    print(f"Train: {dataset_stats['Train_Samples']:,} | Test: {dataset_stats['Test_Samples']:,}")

    print(f"\n--- Regression (Log-Space) ---")
    for k, v in log_metrics_test.items():
        print(f"  {k:<25} {v}")

    print(f"\n--- Regression (LKR-Space) ---")
    for k, v in lkr_metrics_test.items():
        print(f"  {k:<25} {v}")

    print(f"\n--- Classification (Price Tiers) ---")
    print(f"  {'Accuracy':<25} {classification_metrics['Overall_Accuracy']}")
    print(f"  {'Precision':<25} {classification_metrics['Overall_Precision']}")
    print(f"  {'Recall':<25} {classification_metrics['Overall_Recall']}")
    print(f"  {'F1 Score':<25} {classification_metrics['Overall_F1']}")

    print(f"\n--- Per-Tier Breakdown ---")
    for tier, m in per_tier.items():
        print(f"  {tier:<12} Precision={m['Precision']}  Recall={m['Recall']}  F1={m['F1']}  N={m['Support']}")

    print(f"\n--- Top 3 Features ---")
    for i, (f, v) in enumerate(list(feat_imp_sorted.items())[:3]):
        print(f"  {i+1}. {f:<15} {v:.4f}")

    print("\n✅ All evaluation artifacts saved to ml/evaluation/")


if __name__ == '__main__':
    main()
