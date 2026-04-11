"""
Configuration module — environment variables and Firestore setup.
"""
import os

USE_FIRESTORE = os.environ.get("USE_FIRESTORE", "false").lower() in ("1", "true", "yes")
FIRESTORE_COLLECTION_NAME = os.environ.get("FIRESTORE_COLLECTION", "savedCalculations")

FIRESTORE_CLIENT = None
FIRESTORE_COLLECTION = None
FIRESTORE_MODULE = None

if USE_FIRESTORE:
    try:
        from google.cloud import firestore
    except ImportError as exc:
        raise RuntimeError("google-cloud-firestore is required when USE_FIRESTORE is enabled") from exc
    FIRESTORE_MODULE = firestore
    FIRESTORE_CLIENT = firestore.Client()
    FIRESTORE_COLLECTION = FIRESTORE_CLIENT.collection(FIRESTORE_COLLECTION_NAME)

# CORS origins
_default_origins = [
    "https://structuralsolver.com",
    "https://www.structuralsolver.com",
    "https://solids-cc164.web.app",
    "https://solids-cc164.firebaseapp.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
]
_env_origins = os.environ.get("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _env_origins.split(",") if o.strip()] or _default_origins

STORAGE_FILE = "saved_calculations.json"
