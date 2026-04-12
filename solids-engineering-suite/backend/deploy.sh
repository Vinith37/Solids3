#!/usr/bin/env bash
# ============================================================
# deploy.sh – Build and deploy the SOLIDS backend to Cloud Run
# ============================================================
# Uses Google Cloud Build (remote) — no local Docker required.
#
# Usage:
#   cd backend/
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Cloud Build API and Cloud Run API enabled
# ============================================================

set -euo pipefail

PROJECT_ID="solids-cc164"
REGION="us-central1"
SERVICE_NAME="solids-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "==> Building Docker image remotely via Cloud Build: ${IMAGE_NAME}"
gcloud builds submit \
  --tag "${IMAGE_NAME}" \
  --project "${PROJECT_ID}" \
  --quiet

echo "==> Deploying to Cloud Run (${SERVICE_NAME} in ${REGION})"
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_NAME}" \
  --platform managed \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "USE_FIRESTORE=true,FIRESTORE_COLLECTION=savedCalculations,GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --service-account "firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com" \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 25 \
  --concurrency 80 \
  --cpu-boost

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
