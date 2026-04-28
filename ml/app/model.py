"""
model.py
--------
Loads trained model artifacts and runs inference + SHAP explanation.
Call load_model() once at startup, then predict() per request.

Supports dynamic best-model loading (XGBoost, RandomForest, LightGBM).
Computes derived dimension features (mean_width, depth_ratio) on the fly.
Generates rich SHAP explanations with a human-readable summary sentence.
"""

import os
import math
import joblib
import numpy as np
import pandas as pd
import shap

from app.encoders import (
    TYPE_MAP, SHAPE_MAP, COLOR_MAP, CLARITY_MAP, TREATMENT_MAP,
    TYPE_LABELS, SHAPE_LABELS, COLOR_LABELS, CLARITY_LABELS, TREATMENT_LABELS,
    FEATURE_ORDER,
)
from app.schema import PredictRequest, PredictResponse, SHAPEntry

# Paths
_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
_BEST_MODEL_PATH = os.path.join(_MODEL_DIR, "best_model.pkl")
_BEST_NAME_PATH = os.path.join(_MODEL_DIR, "best_model_name.pkl")
_RMSE_PATH = os.path.join(_MODEL_DIR, "rmse_std.pkl")
_FEATURE_PATH = os.path.join(_MODEL_DIR, "feature_names.pkl")

# Module-level state (loaded once at startup)
_model = None
_explainer = None
_rmse_std: float = 0.0
_feature_order: list = FEATURE_ORDER
_model_name: str = "Unknown"


def load_model():
    """Called once at app startup. Loads best model dynamically."""
    global _model, _explainer, _rmse_std, _feature_order, _model_name

    if not os.path.exists(_BEST_MODEL_PATH):
        raise FileNotFoundError(
            f"Best model not found at {_BEST_MODEL_PATH}. "
            "Run `python train.py` first to train and save the model."
        )

    _model = joblib.load(_BEST_MODEL_PATH)
    _rmse_std = joblib.load(_RMSE_PATH) if os.path.exists(_RMSE_PATH) else 0.0
    _feature_order = joblib.load(_FEATURE_PATH) if os.path.exists(_FEATURE_PATH) else FEATURE_ORDER
    _model_name = joblib.load(_BEST_NAME_PATH) if os.path.exists(_BEST_NAME_PATH) else "Unknown"

    # Build SHAP TreeExplainer (works for XGBoost, LightGBM, RandomForest)
    try:
        _explainer = shap.TreeExplainer(_model)
    except Exception as e:
        print(f"⚠️ Could not build TreeExplainer: {e}. SHAP will be unavailable.")
        _explainer = None


def _encode_request(req: PredictRequest) -> pd.DataFrame:
    """Convert a PredictRequest into a single-row DataFrame matching training features."""
    gem_family_lower = req.gemFamily.lower()
    if gem_family_lower not in TYPE_MAP:
        raise ValueError(f"Unknown gemFamily: {req.gemFamily!r}")
    if req.shape not in SHAPE_MAP:
        raise ValueError(f"Unknown shape: {req.shape!r}")
    if req.color not in COLOR_MAP:
        raise ValueError(f"Unknown color: {req.color!r}")
    if req.clarity not in CLARITY_MAP:
        raise ValueError(f"Unknown clarity: {req.clarity!r}")
    if req.treatment not in TREATMENT_MAP:
        raise ValueError(f"Unknown treatment: {req.treatment!r}")

    mean_width = (req.x + req.y) / 2.0
    depth_ratio = req.z / mean_width if mean_width > 0 else 0.0

    row = {
        "type":         TYPE_MAP[gem_family_lower],
        "shape":        SHAPE_MAP[req.shape],
        "color":        COLOR_MAP[req.color],
        "clarity":      CLARITY_MAP[req.clarity],
        "treatment":    TREATMENT_MAP[req.treatment],
        "carat_weight": req.caratWeight,
        "x":            req.x,
        "y":            req.y,
        "z":            req.z,
        "mean_width":   mean_width,
        "depth_ratio":  depth_ratio,
    }
    return pd.DataFrame([row], columns=_feature_order)


def _build_explanation(shap_entries: list, predicted_price: float) -> str:
    """Build a human-readable SHAP summary sentence using pre-computed LKR impact."""
    positives = [e for e in shap_entries if e.direction == "positive"][:2]
    negatives = [e for e in shap_entries if e.direction == "negative"][:2]

    parts = []
    if positives:
        p_text = ", ".join([
            f"{e.feature} (+LKR {e.impactLkr:,.0f})"
            for e in positives
        ])
        parts.append(f"driven up by {p_text}")
    if negatives:
        n_text = ", ".join([
            f"{e.feature} (−LKR {abs(e.impactLkr):,.0f})"
            for e in negatives
        ])
        parts.append(f"pulled down by {n_text}")

    if parts:
        return f"Price {' and '.join(parts)}."
    return "All factors balanced evenly."


def predict(req: PredictRequest) -> PredictResponse:
    if _model is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")

    X = _encode_request(req)

    # Predict in log-space
    log_pred = float(_model.predict(X)[0])

    # Prediction interval: ±1 RMSE in log-space (~68% coverage)
    margin = 1.0 * _rmse_std if _rmse_std > 0 else 0.15
    log_low = log_pred - margin
    log_high = log_pred + margin

    # Exponentiate back to LKR
    predicted_price = math.exp(log_pred)
    confidence_low = math.exp(log_low)
    confidence_high = math.exp(log_high)

    # Ensure non-negative
    predicted_price = max(predicted_price, 0.0)
    confidence_low = max(confidence_low, 0.0)
    confidence_high = max(confidence_high, 0.0)

    mean_width = (req.x + req.y) / 2.0
    depth_ratio = req.z / mean_width if mean_width > 0 else 0.0

    feature_display = {
        "type":         ("Gem Type",     req.gemFamily),
        "shape":        ("Shape",        req.shape),
        "color":        ("Color",        req.color),
        "clarity":      ("Clarity",      req.clarity),
        "treatment":    ("Treatment",    req.treatment),
        "carat_weight": ("Carat Weight", f"{req.caratWeight} ct"),
        "x":            ("Length (X)",   f"{req.x} mm"),
        "y":            ("Width (Y)",    f"{req.y} mm"),
        "z":            ("Depth (Z)",    f"{req.z} mm"),
        "mean_width":   ("Mean Width",   f"{mean_width:.2f} mm"),
        "depth_ratio":  ("Depth Ratio",  f"{depth_ratio:.3f}"),
    }

    # SHAP values (in log-space) + LKR impact
    log_price = math.log(predicted_price) if predicted_price > 0 else 0

    def _impact_lkr(shap_val: float) -> float:
        return predicted_price - math.exp(max(log_price - shap_val, -50))

    shap_entries = []
    if _explainer is not None:
        try:
            shap_values = _explainer.shap_values(X)[0]  # shape: (n_features,)
            for i, feat in enumerate(_feature_order):
                contrib = float(shap_values[i])
                display_name, display_val = feature_display[feat]
                impact = _impact_lkr(contrib)
                shap_entries.append(SHAPEntry(
                    feature=display_name,
                    value=display_val,
                    contribution=round(contrib, 2),
                    direction="positive" if contrib > 0 else ("negative" if contrib < 0 else "neutral"),
                    impactLkr=round(impact, 2),
                ))
            # Sort by absolute LKR impact descending
            shap_entries.sort(key=lambda e: abs(e.impactLkr), reverse=True)
        except Exception as e:
            print(f"⚠️ SHAP computation failed: {e}")
            # Fallback: return zero contributions
            for feat in _feature_order:
                display_name, display_val = feature_display[feat]
                shap_entries.append(SHAPEntry(
                    feature=display_name, value=display_val,
                    contribution=0.0, direction="neutral", impactLkr=0.0,
                ))
    else:
        for feat in _feature_order:
            display_name, display_val = feature_display[feat]
            shap_entries.append(SHAPEntry(
                feature=display_name, value=display_val,
                contribution=0.0, direction="neutral", impactLkr=0.0,
            ))

    explanation = _build_explanation(shap_entries, predicted_price)

    return PredictResponse(
        predictedPrice=round(predicted_price, 2),
        confidenceLow=round(confidence_low, 2),
        confidenceHigh=round(confidence_high, 2),
        currency="LKR",
        shapValues=shap_entries,
        explanation=explanation,
        modelUsed=_model_name,
    )
