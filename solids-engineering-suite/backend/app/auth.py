"""
Firebase Authentication middleware for FastAPI.

Verifies Firebase ID tokens from the Authorization header and
attaches decoded user info to request.state.user.
"""
import logging
import os

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import Request, HTTPException

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK.
# On Cloud Run with the firebase-adminsdk service account, default credentials
# are automatically available. Locally, set GOOGLE_APPLICATION_CREDENTIALS.
if not firebase_admin._apps:
    try:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {
            "projectId": os.environ.get("GOOGLE_CLOUD_PROJECT", "solids-cc164"),
        })
    except Exception:
        # Fallback: initialize without explicit credentials (works on GCP)
        firebase_admin.initialize_app()


async def verify_firebase_token(request: Request) -> dict:
    """
    FastAPI dependency that verifies the Firebase ID token.

    Extracts the Bearer token from the Authorization header, verifies it
    with Firebase Admin SDK, and stores the decoded token on request.state.user.

    Returns:
        dict: Decoded token payload containing uid, email, etc.

    Raises:
        HTTPException(401): If token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header. Expected: Bearer <token>",
        )

    token = auth_header[7:]  # Strip "Bearer "

    try:
        decoded_token = firebase_auth.verify_id_token(token)
        # Attach user info to request state for downstream use
        request.state.user = {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email", ""),
            "name": decoded_token.get("name", ""),
        }
        return request.state.user
    except firebase_auth.ExpiredIdTokenError:
        logger.warning("Expired Firebase ID token received")
        raise HTTPException(status_code=401, detail="Token has expired. Please re-authenticate.")
    except firebase_auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase ID token received")
        raise HTTPException(status_code=401, detail="Invalid authentication token.")
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")
