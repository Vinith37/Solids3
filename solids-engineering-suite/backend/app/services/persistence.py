"""
Persistence service — abstracts Firestore vs local JSON storage.

Production-hardened with:
  - Paginated Firestore queries (.limit() + cursor-based pagination)
  - Chunked batch deletes (respects Firestore 500-per-batch limit)
  - Async wrappers for Firestore I/O (asyncio.to_thread)
"""
import asyncio
import json
import os
import uuid
import logging
from datetime import datetime
from typing import List, Optional

from ..config import (
    USE_FIRESTORE, FIRESTORE_COLLECTION, FIRESTORE_CLIENT, FIRESTORE_MODULE, STORAGE_FILE
)
from ..models.schemas import CalculationState

logger = logging.getLogger(__name__)

# In-memory store for local mode
_saved_calculations: List[CalculationState] = []

# Firestore pagination defaults
DEFAULT_PAGE_SIZE = 50
MAX_BATCH_SIZE = 499  # Firestore limit is 500 per batch


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


# ---------------------------------------------------------------------------
# Synchronous Firestore helpers (run in thread for async endpoints)
# ---------------------------------------------------------------------------

def _firestore_list(limit: int = DEFAULT_PAGE_SIZE, start_after_id: Optional[str] = None):
    """Paginated Firestore query with .limit() and cursor support."""
    if not FIRESTORE_COLLECTION or not FIRESTORE_MODULE:
        return []
    results = []
    try:
        query = FIRESTORE_COLLECTION.order_by(
            "timestamp", direction=FIRESTORE_MODULE.Query.DESCENDING
        ).limit(limit)

        # Cursor-based pagination
        if start_after_id:
            cursor_doc = FIRESTORE_COLLECTION.document(start_after_id).get()
            if cursor_doc.exists:
                query = query.start_after(cursor_doc)

        for doc in query.stream():
            results.append(_build_firestore_summary(doc))
    except Exception as e:
        logger.error(f"Error reading calculations from Firestore: {e}")
    return results


def _firestore_save(calc_id: str, data: dict):
    FIRESTORE_COLLECTION.document(calc_id).set(data)


def _firestore_load(doc_id: str):
    return FIRESTORE_COLLECTION.document(doc_id).get()


def _firestore_delete_one(doc_id: str):
    FIRESTORE_COLLECTION.document(doc_id).delete()


def _firestore_clear_all():
    """Delete all documents in chunked batches of MAX_BATCH_SIZE."""
    if not FIRESTORE_COLLECTION or not FIRESTORE_CLIENT:
        return

    deleted = 0
    while True:
        # Fetch a batch of document references
        docs = list(FIRESTORE_COLLECTION.limit(MAX_BATCH_SIZE).stream())
        if not docs:
            break

        batch = FIRESTORE_CLIENT.batch()
        for doc in docs:
            batch.delete(doc.reference)
        batch.commit()
        deleted += len(docs)
        logger.info(f"Deleted batch of {len(docs)} documents (total: {deleted})")

    logger.info(f"Cleared all {deleted} documents from Firestore")


# ---------------------------------------------------------------------------
# Public Async API
# ---------------------------------------------------------------------------

async def list_calculations(
    limit: int = DEFAULT_PAGE_SIZE,
    start_after_id: Optional[str] = None,
):
    """List saved calculations with pagination."""
    if USE_FIRESTORE:
        return await asyncio.to_thread(_firestore_list, limit, start_after_id)
    else:
        calcs = [
            {
                "id": calc.id,
                "name": calc.name,
                "type": calc.type,
                "module": calc.module,
                "timestamp": calc.timestamp,
            }
            for calc in reversed(_saved_calculations)
        ]
        # Apply in-memory pagination
        return calcs[:limit]


async def save_calculation(calc: CalculationState):
    """Save a calculation to Firestore or local storage."""
    calc_id = calc.id or str(uuid.uuid4())
    calc.id = calc_id
    calc.timestamp = calc.timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        data = calc.model_dump(exclude_none=True)
        try:
            await asyncio.to_thread(_firestore_save, calc_id, data)
        except Exception as e:
            logger.error(f"Error saving calculation to Firestore: {e}")
            return {"status": "error", "message": "Failed to save calculation to Firestore"}
        return {"status": "success", "id": calc_id}

    _saved_calculations.append(calc)
    _save_to_disk()
    return {"status": "success", "id": calc_id}


async def load_calculation(id: str):
    """Load a single calculation by ID."""
    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        try:
            doc = await asyncio.to_thread(_firestore_load, id)
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


async def delete_calculation(id: str):
    """Delete a single calculation by ID."""
    global _saved_calculations
    if USE_FIRESTORE and FIRESTORE_COLLECTION:
        try:
            await asyncio.to_thread(_firestore_delete_one, id)
        except Exception as e:
            logger.error(f"Error deleting calculation from Firestore: {e}")
        return {"status": "deleted"}

    _saved_calculations = [c for c in _saved_calculations if c.id != id]
    _save_to_disk()
    return {"status": "deleted"}


async def clear_calculations():
    """Clear all saved calculations with chunked batch deletes."""
    global _saved_calculations
    if USE_FIRESTORE and FIRESTORE_COLLECTION and FIRESTORE_CLIENT:
        try:
            await asyncio.to_thread(_firestore_clear_all)
        except Exception as e:
            logger.error(f"Error clearing Firestore collection: {e}")
        return {"status": "cleared"}

    _saved_calculations = []
    _save_to_disk()
    return {"status": "cleared"}
