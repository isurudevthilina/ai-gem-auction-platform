"""
model.py
--------
Loads trained XGBoost artifacts and runs inference + SHAP explanation.
Call load_model() once at startup, then predict() per request.

Important: the model predicts Log_Price. We exponentiate the output to
return the price in LKR. Confidence intervals are also computed in log-space
and then exponentiated.
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
_MODEL_PATH   = os.path.join(_MODEL_DIR, "gem_price_model.pkl")
_RMSE_PATH    = os.path.join(_MODEL_DIR, "rmse_std.pkl")
_OFFSET_PATH  = os.path.join(_MODEL_DIR, "carat_offset.pkl")

# Module-level state (loaded once at startup)
_model = None
_explainer = None
_rmse_std: float = 0.0
_carat_offset: float = 0.656  # fallback if artifact missing


def load_model():
    """Called once at app startup."""
    global _model, _explainer, _rmse_std, _carat_offset

    if not os.path.exists(_MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {_MODEL_PATH}. "
            "Run `python train.py` first to train and save the model."
        )

    _model = joblib.load(_MODEL_PATH)
    _rmse_std = joblib.load(_RMSE_PATH) if os.path.exists(_RMSE_PATH) else 0.0
    _carat_offset = joblib.load(_OFFSET_PATH) if os.path.exists(_OFFSET_PATH) else 0.656

    # Build SHAP TreeExplainer (fast for XGBoost)
    _explainer = shap.TreeExplainer(_model)


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

    row = {
        "type":         TYPE_MAP[gem_family_lower],
        "shape":        SHAPE_MAP[req.shape],
        "color":        COLOR_MAP[req.color],
        "clarity":      CLARITY_MAP[req.clarity],
        "treatment":    TREATMENT_MAP[req.treatment],
        "carat_weight": req.caratWeight,
    }
    return pd.DataFrame([row], columns=FEATURE_ORDER)


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

    # SHAP values (in log-space)
    shap_values = _explainer.shap_values(X)[0]  # shape: (n_features,)

    feature_display = {
        "type":         ("Gem Type",     req.gemFamily),
        "shape":        ("Shape",        req.shape),
        "color":        ("Color",        req.color),
        "clarity":      ("Clarity",      req.clarity),
        "treatment":    ("Treatment",    req.treatment),
        "carat_weight": ("Carat Weight", f"{req.caratWeight} ct"),
    }

    shap_entries = []
    for i, feat in enumerate(FEATURE_ORDER):
        contrib = float(shap_values[i])
        display_name, display_val = feature_display[feat]
        shap_entries.append(SHAPEntry(
            feature=display_name,
            value=display_val,
            contribution=round(contrib, 2),
            direction="positive" if contrib > 0 else ("negative" if contrib < 0 else "neutral"),
        ))

    # Sort by absolute contribution descending
    shap_entries.sort(key=lambda e: abs(e.contribution), reverse=True)

    return PredictResponse(
        predictedPrice=round(predicted_price, 2),
        confidenceLow=round(confidence_low, 2),
        confidenceHigh=round(confidence_high, 2),
        currency="LKR",
        shapValues=shap_entries,
    )
