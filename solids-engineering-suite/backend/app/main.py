"""
SOLIDS Engineering Suite — FastAPI Application Entry Point.

This is the modularized entry point. The old monolithic main.py still works
for backward compatibility, but this file is the canonical app factory.

Run with:
    uvicorn app.main:app --reload
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS
from .routes.calculations import router as calculations_router
from .routes.materials import router as materials_router
from .routes.analysis import router as analysis_router

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

# --- App Factory ---
app = FastAPI(
    title="SOLIDS Engineering Suite API",
    description="Backend for the SOLIDS Engineering Suite — mechanical analysis, material selection, and calculation persistence.",
    version="3.1.0",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount Routers ---
app.include_router(calculations_router)
app.include_router(materials_router)
app.include_router(analysis_router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "SOLIDS Engineering Suite API", "version": "3.1.0"}
