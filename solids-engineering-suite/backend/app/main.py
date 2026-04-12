"""
SOLIDS Engineering Suite — FastAPI Application Entry Point.

Production-hardened with:
  - Firebase Auth verification (router-level dependency)
  - Rate limiting via slowapi (user-aware key: UID or IP fallback)
  - Structured JSON logging for Cloud Monitoring
  - Request logging middleware (method, path, status, latency)

Run with:
    uvicorn app.main:app --reload
"""
import json
import logging
import time

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .config import ALLOWED_ORIGINS
from .routes.calculations import router as calculations_router
from .routes.materials import router as materials_router
from .routes.beams import router as beams_router
from .routes.fatigue import router as fatigue_router
from .routes.failure import router as failure_router
from .routes.mohr import router as mohr_router
from .routes.torsion import router as torsion_router
from .routes.dynamic import router as dynamic_router
from .routes.thin_cylinder import router as thin_cylinder_router
from .routes.buckling import router as buckling_router


# ---------------------------------------------------------------------------
# Structured JSON Logging (Cloud Monitoring compatible)
# ---------------------------------------------------------------------------

class JSONFormatter(logging.Formatter):
    """Outputs structured JSON logs compatible with Google Cloud Logging."""
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "timestamp": self.formatTime(record),
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.root.handlers = [handler]
logging.root.setLevel(logging.INFO)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Rate Limiter Setup (user-aware key)
# ---------------------------------------------------------------------------

def rate_limit_key(request: Request) -> str:
    """
    Rate limit key function.
    Uses Firebase UID for authenticated users, falls back to IP address.
    """
    user = getattr(request.state, "user", None)
    if user and isinstance(user, dict):
        return user.get("uid", get_remote_address(request))
    return get_remote_address(request)


limiter = Limiter(
    key_func=rate_limit_key,
    default_limits=["100/minute"],
    storage_uri="memory://",
)


# ---------------------------------------------------------------------------
# App Factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SOLIDS Engineering Suite API",
    description="Backend for the SOLIDS Engineering Suite — mechanical analysis, material selection, and calculation persistence.",
    version="3.2.0",
)

# Attach limiter to app state (required by slowapi)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request Logging Middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request with method, path, status code, and latency."""
    start = time.time()

    # Initialize request.state.user to None so rate_limit_key doesn't fail
    # before auth dependency runs
    if not hasattr(request.state, "user"):
        request.state.user = None

    response: Response = await call_next(request)
    latency_ms = (time.time() - start) * 1000

    logger.info(
        f"{request.method} {request.url.path} → {response.status_code} ({latency_ms:.0f}ms)"
    )

    return response


# ---------------------------------------------------------------------------
# Mount Routers
# ---------------------------------------------------------------------------

app.include_router(calculations_router)
app.include_router(materials_router)
app.include_router(beams_router)
app.include_router(fatigue_router)
app.include_router(failure_router)
app.include_router(mohr_router)
app.include_router(torsion_router)
app.include_router(dynamic_router)
app.include_router(thin_cylinder_router)
app.include_router(buckling_router)


# ---------------------------------------------------------------------------
# Public Health Check (no auth required)
# ---------------------------------------------------------------------------

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SOLIDS Engineering Suite API", "version": "3.2.0"}
