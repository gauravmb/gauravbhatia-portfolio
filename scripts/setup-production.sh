#!/bin/bash

###
# Firebase Production Setup Script
#
# Automates the setup process for connecting localhost to Firebase production.
# This script handles deployment of rules, seeding data, creating admin user,
# and deploying functions.
#
# Usage: ./scripts/setup-production.sh
###

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "\n${BLUE}==>${NC} ${GREEN}$1${NC}\n"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main script
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Firebase Production Setup Script                   ║"
echo "║   Portfolio Website - Production Configuration       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Check prerequisites
print_step "Step 1: Checking prerequisites..."

if ! command_exists firebase; then
    print_error "Firebase CLI not found. Install it with: npm install -g firebase-tools"
    exit 1
fi
print_success "Firebase CLI installed"

if ! command_exists node; then
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi
print_success "Node.js installed"

if ! command_exists npm; then
    print_error "npm not found. Please install npm first."
    exit 1
fi
print_success "npm installed"

# Step 2: Check Firebase login
print_step "Step 2: Checking Firebase authentication..."

if ! firebase projects:list >/dev/null 2>&1; then
    print_error "Not logged into Firebase. Run: firebase login"
    exit 1
fi
print_success "Logged into Firebase"

# Step 3: Check project configuration
print_step "Step 3: Verifying Firebase project..."

if [ ! -f ".firebaserc" ]; then
    print_error ".firebaserc not found. Please configure your Firebase project first."
    exit 1
fi

PROJECT_ID=$(grep -o '"default": "[^"]*' .firebaserc | cut -d'"' -f4)
if [ -z "$PROJECT_ID" ]; then
    print_error "Could not read project ID from .firebaserc"
    exit 1
fi

print_success "Project ID: $PROJECT_ID"

# Step 4: Check environment variables
print_step "Step 4: Checking environment configuration..."

if [ ! -f ".env.local" ]; then
    print_error ".env.local not found. Please create it from .env.local.example"
    exit 1
fi
print_success ".env.local exists"

# Check if emulator is disabled
if grep -q "NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true" .env.local; then
    print_warning "Emulator is enabled in .env.local"
    echo "Do you want to disable it for production? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        sed -i.bak 's/NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true/NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false/' .env.local
        print_success "Emulator disabled in .env.local"
    fi
fi

# Step 5: Check service account key
print_step "Step 5: Checking service account key..."

if [ ! -f "serviceAccountKey.json" ]; then
    print_error "serviceAccountKey.json not found"
    echo "Please download it from Firebase Console:"
    echo "  1. Go to Project Settings → Service Accounts"
    echo "  2. Click 'Generate new private key'"
    echo "  3. Save as serviceAccountKey.json in project root"
    exit 1
fi
print_success "Service account key found"

# Set environment variable for service account
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"
print_success "GOOGLE_APPLICATION_CREDENTIALS set"

# Step 6: Install dependencies
print_step "Step 6: Installing dependencies..."

npm install --silent
print_success "Root dependencies installed"

cd functions
npm install --silent
cd ..
print_success "Functions dependencies installed"

# Step 7: Deploy security rules
print_step "Step 7: Deploying security rules..."

firebase deploy --only firestore:rules,firestore:indexes,storage --project "$PROJECT_ID"
print_success "Security rules deployed"

# Step 8: Seed initial data
print_step "Step 8: Seeding initial data..."

echo "Do you want to seed initial data? This will add profile and projects to Firestore. (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    npx ts-node scripts/seed-data.ts
    print_success "Initial data seeded"
else
    print_warning "Skipped data seeding"
fi

# Step 9: Create admin user
print_step "Step 9: Creating admin user..."

echo "Do you want to create an admin user? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Enter admin email (or press Enter for default: admin@test.com):"
    read -r admin_email
    admin_email=${admin_email:-admin@test.com}
    
    echo "Enter admin password (or press Enter for default: admin123456):"
    read -rs admin_password
    admin_password=${admin_password:-admin123456}
    echo
    
    ADMIN_EMAIL="$admin_email" ADMIN_PASSWORD="$admin_password" node scripts/create-admin-user.js
    print_success "Admin user created"
else
    print_warning "Skipped admin user creation"
fi

# Step 10: Build functions
print_step "Step 10: Building functions..."

cd functions
npm run build
cd ..
print_success "Functions built"

# Step 11: Deploy functions
print_step "Step 11: Deploying functions..."

echo "Do you want to deploy functions to production? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    firebase deploy --only functions --project "$PROJECT_ID"
    print_success "Functions deployed"
else
    print_warning "Skipped functions deployment"
fi

# Step 12: Clear cache
print_step "Step 12: Clearing local cache..."

npm run clear-cache
print_success "Cache cleared"

# Final summary
echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo "  1. Start development server: ${GREEN}npm run dev${NC}"
echo "  2. Open browser: ${GREEN}http://localhost:3000${NC}"
echo "  3. Test admin login: ${GREEN}http://localhost:3000/admin/login${NC}"
echo ""
echo -e "${BLUE}Your localhost is now connected to Firebase Production!${NC}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "  - Verify .env.local has NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false"
echo "  - Check Firebase Console to verify data and functions"
echo "  - Keep serviceAccountKey.json secure and never commit it"
echo ""
echo -e "${BLUE}Functions URLs:${NC}"
echo "  https://us-central1-$PROJECT_ID.cloudfunctions.net/getProjects"
echo "  https://us-central1-$PROJECT_ID.cloudfunctions.net/getProfile"
echo ""
echo -e "${BLUE}Firebase Console:${NC}"
echo "  https://console.firebase.google.com/project/$PROJECT_ID"
echo ""
