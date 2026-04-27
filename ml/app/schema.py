"""
schema.py
---------
Pydantic request / response models for POST /predict.
Matches the frontend contract defined in aiPredictorService.js.
"""

from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from app.encoders import (
    TYPE_MAP, SHAPE_MAP, COLOR_MAP, CLARITY_MAP, TREATMENT_MAP
)

GemFamily   = Literal[tuple(TYPE_MAP.keys())]      # type: ignore[valid-type]
ShapeOption = Literal[tuple(SHAPE_MAP.keys())]     # type: ignore[valid-type]
ColorOption = Literal[tuple(COLOR_MAP.keys())]     # type: ignore[valid-type]
ClarityOption = Literal[tuple(CLARITY_MAP.keys())] # type: ignore[valid-type]
TreatmentOption = Literal[tuple(TREATMENT_MAP.keys())] # type: ignore[valid-type]


class PredictRequest(BaseModel):
    gemFamily:   str = Field(..., description="Gem type — must match dataset type labels")
    shape:       str = Field(..., description="Gem shape — must match dataset shape labels")
    color:       str = Field(..., description="Gem color — must match dataset color labels")
    clarity:     str = Field(..., description="Clarity grade — must match dataset clarity labels")
    treatment:   str = Field(..., description="Treatment — must match dataset treatment labels")
    caratWeight: float = Field(..., gt=0, le=999.99, description="Carat weight (numeric)")

    model_config = {"json_schema_extra": {"example": {
        "gemFamily":   "ruby",
        "shape":       "Round",
        "color":       "Red",
        "clarity":     "VVS (Eye Clean 1)",
        "treatment":   "Untreated",
        "caratWeight": 1.5,
    }}}


class SHAPEntry(BaseModel):
    feature:      str
    value:        str
    contribution: float
    direction:    Literal["positive", "negative", "neutral"]


class PredictResponse(BaseModel):
    predictedPrice:  float
    confidenceLow:   float
    confidenceHigh:  float
    currency:        str = "LKR"
    shapValues:      List[SHAPEntry]
