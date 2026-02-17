#!/bin/bash

# Google Cloud Prerequisites Setup Script
# Purpose: Verify and configure Google Cloud services required for SSR migration
# This script checks Google Cloud project setup, enables required APIs,
# verifies service account permissions, and sets up billing alerts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_ID="mindcruit"
REGION="us-central1"
SERVICE_NAME="portfolio-website"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Google Cloud Prerequisites Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
print_status "Checking if gcloud CLI is installed..."
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI is not installed"
    echo ""
    echo "Please install gcloud CLI from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
print_success "gcloud CLI is installed"
echo ""

# Check if user is authenticated
print_status "Checking gcloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_warning "Not authenticated with gcloud"
    echo ""
    print_status "Running: gcloud auth login"
    gcloud auth login
else
    ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
    print_success "Authenticated as: $ACTIVE_ACCOUNT"
fi
echo ""

# Set the project
print_status "Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID
print_success "Project set to: $PROJECT_ID"
echo ""

# Verify project exists and is accessible
print_status "Verifying project access..."
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    print_success "Project $PROJECT_ID is accessible"
    
    # Get project details
    PROJECT_NAME=$(gcloud projects describe $PROJECT_ID --format="value(name)")
    PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    print_status "Project Name: $PROJECT_NAME"
    print_status "Project Number: $PROJECT_NUMBER"
else
    print_error "Cannot access project $PROJECT_ID"
    echo ""
    echo "Please ensure:"
    echo "  1. The project exists"
    echo "  2. You have the necessary permissions"
    echo "  3. The project ID is correct"
    exit 1
fi
echo ""

# Check billing status
print_status "Checking billing status..."
BILLING_ENABLED=$(gcloud beta billing projects describe $PROJECT_ID --format="value(billingEnabled)" 2>/dev/null || echo "unknown")
if [ "$BILLING_ENABLED" = "True" ]; then
    print_success "Billing is enabled for this project"
else
    print_warning "Billing status: $BILLING_ENABLED"
    echo ""
    echo "To enable billing:"
    echo "  1. Visit: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    echo "  2. Link a billing account to this project"
    echo ""
    read -p "Press Enter to continue after enabling billing..."
fi
echo ""

# Enable required APIs
print_status "Enabling required APIs..."
echo ""

APIS=(
    "run.googleapis.com:Cloud Run API"
    "cloudbuild.googleapis.com:Cloud Build API"
    "containerregistry.googleapis.com:Container Registry API"
    "artifactregistry.googleapis.com:Artifact Registry API"
)

for api_info in "${APIS[@]}"; do
    IFS=':' read -r api_name api_description <<< "$api_info"
    print_status "Enabling $api_description ($api_name)..."
    
    if gcloud services enable $api_name --project=$PROJECT_ID 2>&1; then
        print_success "$api_description enabled"
    else
        print_error "Failed to enable $api_description"
    fi
done
echo ""

# Wait for APIs to be fully enabled
print_status "Waiting for APIs to be fully enabled (this may take a minute)..."
sleep 10
print_success "APIs should now be active"
echo ""

# Verify service account permissions
print_status "Verifying service account permissions..."
echo ""

# Get the default compute service account
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
print_status "Default Compute Service Account: $COMPUTE_SA"

# Check if service account exists
if gcloud iam service-accounts describe $COMPUTE_SA --project=$PROJECT_ID &> /dev/null; then
    print_success "Service account exists"
    
    # List current IAM roles
    print_status "Current IAM roles for service account:"
    gcloud projects get-iam-policy $PROJECT_ID \
        --flatten="bindings[].members" \
        --filter="bindings.members:serviceAccount:$COMPUTE_SA" \
        --format="table(bindings.role)" 2>/dev/null || echo "  (Unable to list roles)"
else
    print_warning "Default compute service account not found"
fi
echo ""

# Check required permissions
print_status "Checking required permissions for Cloud Run and Cloud Build..."
REQUIRED_ROLES=(
    "roles/run.admin"
    "roles/cloudbuild.builds.builder"
    "roles/storage.admin"
)

print_status "Required roles for deployment:"
for role in "${REQUIRED_ROLES[@]}"; do
    echo "  - $role"
done
echo ""

print_warning "Please ensure your account or service account has these roles"
echo "To grant roles, visit: https://console.cloud.google.com/iam-admin/iam?project=$PROJECT_ID"
echo ""

# Set up billing alerts
print_status "Setting up billing alerts..."
echo ""
print_warning "Billing alerts must be configured through the Cloud Console"
echo ""
echo "To set up billing alerts:"
echo "  1. Visit: https://console.cloud.google.com/billing"
echo "  2. Select your billing account"
echo "  3. Go to 'Budgets & alerts'"
echo "  4. Click 'CREATE BUDGET'"
echo "  5. Set budget amount (recommended: \$10-20/month for this project)"
echo "  6. Configure alert thresholds (50%, 90%, 100%)"
echo "  7. Add email notifications"
echo ""
read -p "Press Enter after setting up billing alerts..."
echo ""

# Test Cloud Run access
print_status "Testing Cloud Run access..."
if gcloud run services list --region=$REGION --project=$PROJECT_ID &> /dev/null; then
    print_success "Cloud Run access verified"
    
    # Check if service already exists
    if gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID &> /dev/null 2>&1; then
        print_warning "Cloud Run service '$SERVICE_NAME' already exists"
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID --format="value(status.url)")
        print_status "Service URL: $SERVICE_URL"
    else
        print_status "Cloud Run service '$SERVICE_NAME' does not exist yet (will be created during deployment)"
    fi
else
    print_error "Cannot access Cloud Run services"
    echo "Please check your permissions"
fi
echo ""

# Test Cloud Build access
print_status "Testing Cloud Build access..."
if gcloud builds list --project=$PROJECT_ID --limit=1 &> /dev/null; then
    print_success "Cloud Build access verified"
else
    print_error "Cannot access Cloud Build"
    echo "Please check your permissions"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setup Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
print_success "Prerequisites check complete!"
echo ""
echo "Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Service Name: $SERVICE_NAME"
echo ""
echo "Next steps:"
echo "  1. Ensure billing alerts are configured"
echo "  2. Verify service account has necessary permissions"
echo "  3. Run 'npm run docker:build' to test Docker build locally"
echo "  4. Run 'npm run deploy:build' to deploy to Cloud Run"
echo ""
print_status "For more information, see: docs/SSR-MIGRATION-GUIDE.md"
echo ""
