#!/usr/bin/env bash
# ============================================================
# deploy.sh – Build and deploy the SOLIDS backend to Cloud Run
# ============================================================
# Usage:
#   cd backend/
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Docker installed
#   - Artifact Registry API and Cloud Run API enabled
# ============================================================

set -euo pipefail

PROJECT_ID="solids-cc164"
REGION="us-central1"
SERVICE_NAME="solids-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"
AR_REPO="gcr.io"   # using Container Registry (GCR); switch to Artifact Registry if preferred

echo "==> Building Docker image: ${IMAGE_NAME}"
docker build --platform linux/amd64 -t "${IMAGE_NAME}" .

echo "==> Pushing image to GCR: ${IMAGE_NAME}"
gcloud auth configure-docker --quiet
docker push "${IMAGE_NAME}"

echo "==> Deploying to Cloud Run (${SERVICE_NAME} in ${REGION})"
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "USE_FIRESTORE=true,FIRESTORE_COLLECTION=savedCalculations" \
  --service-account "firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com" \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 5

echo ""
echo "==> Deployment complete!"
echo "    Service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --format "value(status.url)"
echo ""
echo "==> IMPORTANT: Copy the Service URL above and:"
echo "    1. Update firebase.json 'run.serviceId' if your service name differs"
echo "    2. Add VITE_API_BASE_URL=<service-url> to your .env.local for local dev"
