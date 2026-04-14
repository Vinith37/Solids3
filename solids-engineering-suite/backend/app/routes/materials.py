"""
Routes for materials database and Ashby chart data.
Auth at router level. Sync endpoints (in-memory data, no I/O).
"""
from fastapi import APIRouter, Request, Depends
from typing import Optional
from ..data.materials import materials_db
from ..data.ashby import ashby_materials_db

router = APIRouter()


@router.get("/api/materials")
def get_materials(request: Request, search: Optional[str] = "", category: Optional[str] = "All"):
    results = materials_db
    if category != "All":
        results = [m for m in results if m["category"] == category]
    if search:
        results = [
            m for m in results
            if search.lower() in m["name"].lower()
            or search.lower() in m["category"].lower()
        ]
    return results


@router.get("/api/material-categories")
def get_material_categories(request: Request):
    cats = sorted(list(set(m["category"] for m in materials_db)))
    return ["All"] + cats


@router.get("/api/ashby-materials")
def get_ashby_materials(request: Request):
    return ashby_materials_db
