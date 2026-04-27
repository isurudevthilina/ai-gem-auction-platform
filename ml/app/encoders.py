"""
encoders.py
-----------
Canonical label ↔ integer mappings from the dataset.
These are the ONLY allowed values across the entire platform.
"""

TYPE_MAP = {
    "amethyst":      0,
    "citrine":       1,
    "pyrope garnet": 2,
    "ruby":          3,
    "sapphire":      4,
    "spinel":        5,
    "topaz":         6,
    "tourmaline":    7,
}

SHAPE_MAP = {
    "Cushion":  0,
    "Fancy":    1,
    "Heart":    2,
    "Marquise": 3,
    "Octagon":  4,
    "Other":    5,
    "Oval":     6,
    "Pear":     7,
    "Round":    8,
    "Trillion": 9,
}

COLOR_MAP = {
    "Black":       0,
    "Blood Red":   1,
    "Blue":        2,
    "Brown":       3,
    "Gold":        4,
    "Green":       5,
    "Iris":        6,
    "Lavender":    7,
    "Magenta":     8,
    "Multicolor":  9,
    "Orange":      10,
    "Orange-Gold": 11,
    "Pink":        12,
    "Pinkish Red": 13,
    "Purple":      14,
    "Red":         15,
    "Rose":        16,
    "Violet":      17,
    "White":       18,
    "Wine":        19,
    "Wine Red":    20,
    "Yellow":      21,
}

CLARITY_MAP = {
    "I1 (Included 1)":          0,
    "SI1 (Slightly Included 1)": 1,
    "SI2 (Slightly Included 2)": 2,
    "VS (Eye Clean 2)":          3,
    "VVS (Eye Clean 1)":         4,
}

TREATMENT_MAP = {
    "Be Heated":      0,
    "Fracture Filled": 1,
    "Heated":         2,
    "Irradiated":     3,
    "Untreated":      4,
}

# Reverse maps for display / SHAP explanation labels
TYPE_LABELS      = {v: k for k, v in TYPE_MAP.items()}
SHAPE_LABELS     = {v: k for k, v in SHAPE_MAP.items()}
COLOR_LABELS     = {v: k for k, v in COLOR_MAP.items()}
CLARITY_LABELS   = {v: k for k, v in CLARITY_MAP.items()}
TREATMENT_LABELS = {v: k for k, v in TREATMENT_MAP.items()}

# Feature order used during training (must match train.py)
FEATURE_ORDER = ["type", "shape", "color", "clarity", "treatment", "carat_weight"]

ALL_MAPS = {
    "type":      TYPE_MAP,
    "shape":     SHAPE_MAP,
    "color":     COLOR_MAP,
    "clarity":   CLARITY_MAP,
    "treatment": TREATMENT_MAP,
}
