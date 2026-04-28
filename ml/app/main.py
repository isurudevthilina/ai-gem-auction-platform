"""
main.py
-------
FastAPI application for gem price prediction.
Run with:  uvicorn app.main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schema import PredictRequest, PredictResponse
from app import model as gem_model

load_dotenv()

_CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5000",
    ).split(",")
    if o.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model artifacts once at startup
    try:
        gem_model.load_model()
        print("✅ Gem price model loaded successfully.")
    except FileNotFoundError as exc:
        # App starts but /predict will return 503 until model is trained
        print(f"⚠️  {exc}")
    yield


app = FastAPI(
    title="Gem Price Prediction API",
    version="1.0.0",
    description="Gem price predictor (XGBoost / RandomForest / LightGBM) with SHAP explanations.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    model_ready = gem_model._model is not None
    return {
        "status": "ok",
        "model_loaded": model_ready,
        "message": "Model ready" if model_ready else "Model not trained yet — run python train.py",
        "model_name": gem_model._model_name if model_ready else None,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if gem_model._model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train.py` first.",
        )
    try:
        return gem_model.predict(req)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}")
