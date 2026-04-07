"""
Persistence service — abstracts Firestore vs local JSON storage.
"""
import json
import os
import uuid
import logging
from datetime import datetime
from typing import List

from ..config import (
    USE_FIRESTORE, FIRESTORE_COLLECTION, FIRESTORE_CLIENT, FIRESTORE_MODULE, STORAGE_FILE
)
from ..models.schemas import CalculationState

logger = logging.getLogger(__name__)

# In-memory store for local mode
_saved_calculations: List[CalculationState] = []


def _load_from_disk():
    global _saved_calculations
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r") as f:
                data = json.load(f)
                _saved_calculations = [CalculationState(**item) for item in data]
        except Exception as e:
            logger.error(f"Error loading calculations from disk: {e}")
            _saved_calculations = []


def _save_to_disk():
    try:
        with open(STORAGE_FILE, "w") as f:
            json.dump([item.model_dump() for item in _saved_calculations], f)
    except Exception as e:
        logger.error(f"Error saving calculations to disk: {e}")


# Initialize local store on import (if not using Firestore)
if not USE_FIRESTORE:
    _load_from_disk()


def _build_firestore_summary(doc):
    data = doc.to_dict() or {}
    return {
        "id": doc.id,
        "name": data.get("name"),
        "type": data.get("type"),
        "module": data.get("module"),
        "timestamp": data.get("timestamp"),
    }


# ---- Public API ----

def list_calculations():
    if USE_FIRESTORE:
        if not FIRESTORE_COLLECTION or not FIRESTORE_MODULE:
            return []
        results = []
        try:
            query = FIRESTORE_COLLECTION.order_by(
                "timestamp", direction=FIRESTORE_MODULE.Query.DESCENDING
            )
            for doc in query.stream():
                results.append(_build_firestore_summary(doc))
        except Exception as e:
            logger.error(f"Error reading calculations from Firestore: {e}")
        return results
    else:
        return [
            {
                "id": calc.id,
                "name": calc.name,
                "type": calc.type,
                "module": calc.module,
                "timestamp": calc.timestamp,
            }
            for calc in reversed(_saved_calculations)
        ]


def save_calculation(calc: CalculationState):
    calc_id = calc.id or str(uuid.uuid4())
    calc.id = calc_id
    calc.timestamp = calc.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        data = calc.model_dump(exclude_none=True)
        try:
            FIRESTORE_COLLECTION.document(calc_id).set(data)
        except Exception as e:
            logger.error(f"Error saving calculation to Firestore: {e}")
            return {"status": "error", "message": "Failed to save calculation to Firestore"}
        return {"status": "success", "id": calc_id}

    _saved_calculations.append(calc)
    _save_to_disk()
    return {"status": "success", "id": calc_id}


def load_calculation(id: str):
    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        try:
            doc = FIRESTORE_COLLECTION.document(id).get()
        except Exception as e:
            logger.error(f"Error loading calculation from Firestore: {e}")
            return {"error": "Calculation not found"}
        if not doc.exists:
            return {"error": "Calculation not found"}
        data = doc.to_dict() or {}
        data["id"] = doc.id
        return data

    for calc in _saved_calculations:
        if calc.id == id:
            return calc
    return {"error": "Calculation not found"}


def delete_calculation(id: str):
    global _saved_calculations
    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        try:
            FIRESTORE_COLLECTION.document(id).delete()
        except Exception as e:
            logger.error(f"Error deleting calculation from Firestore: {e}")
        return {"status": "deleted"}

    _saved_calculations = [c for c in _saved_calculations if c.id != id]
    _save_to_disk()
    return {"status": "deleted"}


def clear_calculations():
    global _saved_calculations
    if USE_FIRESTORE and FIRESTORE_COLLECTION and FIRESTORE_CLIENT:
        try:
            batch = FIRESTORE_CLIENT.batch()
            for doc in FIRESTORE_COLLECTION.stream():
                batch.delete(doc.reference)
            batch.commit()
        except Exception as e:
            logger.error(f"Error clearing Firestore collection: {e}")
        return {"status": "cleared"}

    _saved_calculations = []
    _save_to_disk()
    return {"status": "cleared"}
