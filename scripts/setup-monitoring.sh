#!/bin/bash

# Purpose: Set up Cloud Run and Firebase Hosting monitoring and alerts
# This script configures monitoring dashboards and alert policies for the SSR deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up monitoring and alerts for SSR deployment...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install gcloud CLI: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: No Google Cloud project is set${NC}"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo -e "${YELLOW}Using project: $PROJECT_ID${NC}"

# Service configuration
SERVICE_NAME="portfolio-website"
REGION="us-central1"

# Check if Cloud Run service exists
echo "Checking if Cloud Run service exists..."
if ! gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo -e "${YELLOW}Warning: Cloud Run service '$SERVICE_NAME' not found in region '$REGION'${NC}"
    echo "Please deploy the service first before setting up monitoring"
    exit 1
fi

echo -e "${GREEN}Cloud Run service found${NC}"

# Create notification channel (email)
echo ""
echo -e "${YELLOW}Setting up notification channels...${NC}"
read -p "Enter email address for alerts: " ALERT_EMAIL

if [ -z "$ALERT_EMAIL" ]; then
    echo -e "${RED}Error: Email address is required${NC}"
    exit 1
fi

# Create email notification channel
CHANNEL_ID=$(gcloud alpha monitoring channels create \
    --display-name="SSR Alerts Email" \
    --type=email \
    --channel-labels=email_address=$ALERT_EMAIL \
    --project=$PROJECT_ID \
    --format="value(name)" 2>/dev/null || echo "")

if [ -z "$CHANNEL_ID" ]; then
    echo -e "${YELLOW}Note: Notification channel may already exist or creation failed${NC}"
    echo "You can create it manually in Cloud Console: https://console.cloud.google.com/monitoring/alerting/notifications"
else
    echo -e "${GREEN}Created notification channel: $CHANNEL_ID${NC}"
fi

# Create alert policies
echo ""
echo -e "${YELLOW}Creating alert policies...${NC}"

# Alert 1: High error rate (>5% of requests)
echo "Creating error rate alert..."
gcloud alpha monitoring policies create \
    --notification-channels=$CHANNEL_ID \
    --display-name="Cloud Run High Error Rate" \
    --condition-display-name="Error rate > 5%" \
    --condition-threshold-value=0.05 \
    --condition-threshold-duration=300s \
    --condition-filter="resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\"" \
    --condition-aggregation-per-series-aligner=ALIGN_RATE \
    --condition-aggregation-group-by-fields="resource.service_name" \
    --project=$PROJECT_ID 2>/dev/null || echo -e "${YELLOW}Error rate alert may already exist${NC}"

# Alert 2: High latency (>2 seconds)
echo "Creating latency alert..."
gcloud alpha monitoring policies create \
    --notification-channels=$CHANNEL_ID \
    --display-name="Cloud Run High Latency" \
    --condition-display-name="Latency > 2 seconds" \
    --condition-threshold-value=2000 \
    --condition-threshold-duration=300s \
    --condition-filter="resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"$SERVICE_NAME\" AND metric.type=\"run.googleapis.com/request_latencies\"" \
    --condition-aggregation-per-series-aligner=ALIGN_DELTA \
    --condition-aggregation-cross-series-reducer=REDUCE_PERCENTILE_95 \
    --condition-aggregation-group-by-fields="resource.service_name" \
    --project=$PROJECT_ID 2>/dev/null || echo -e "${YELLOW}Latency alert may already exist${NC}"

# Alert 3: High cost (budget alert)
echo "Creating budget alert..."
echo -e "${YELLOW}Note: Budget alerts must be configured in Cloud Console${NC}"
echo "Visit: https://console.cloud.google.com/billing/budgets"
echo "Recommended budget: \$10/month with alerts at 50%, 90%, and 100%"

echo ""
echo -e "${GREEN}Monitoring setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. View Cloud Run metrics: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID"
echo "2. View alert policies: https://console.cloud.google.com/monitoring/alerting/policies?project=$PROJECT_ID"
echo "3. Set up budget alerts: https://console.cloud.google.com/billing/budgets?project=$PROJECT_ID"
echo "4. Configure Firebase Hosting monitoring in Firebase Console"
echo ""
