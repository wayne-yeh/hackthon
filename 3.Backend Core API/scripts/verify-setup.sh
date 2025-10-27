#!/bin/bash

# Verification script for TAR Backend Core API setup
# This script checks if all required components are properly configured

set -e

echo "=========================================="
echo "TAR Backend Core API - Setup Verification"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
ERRORS=0

# Check Java version
echo "1. Checking Java version..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        echo -e "${GREEN}✓ Java $JAVA_VERSION is installed${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}✗ Java 17 or higher is required (found Java $JAVA_VERSION)${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗ Java is not installed${NC}"
    ((ERRORS++))
fi
echo ""

# Check Maven
echo "2. Checking Maven..."
if [ -f "./mvnw" ]; then
    echo -e "${GREEN}✓ Maven Wrapper is present${NC}"
    ((SUCCESS++))
elif command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn -version | head -n 1)
    echo -e "${GREEN}✓ Maven is installed: $MVN_VERSION${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠ Maven not found. Run 'make setup' to install Maven Wrapper${NC}"
    ((WARNINGS++))
fi
echo ""

# Check Docker
echo "3. Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker is installed: $DOCKER_VERSION${NC}"
    ((SUCCESS++))
    
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✓ Docker daemon is running${NC}"
        ((SUCCESS++))
    else
        echo -e "${YELLOW}⚠ Docker daemon is not running${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ Docker is not installed (optional for development)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check Docker Compose
echo "4. Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ Docker Compose is installed: $COMPOSE_VERSION${NC}"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠ Docker Compose is not installed (optional for development)${NC}"
    ((WARNINGS++))
fi
echo ""

# Check environment file
echo "5. Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    ((SUCCESS++))
    
    # Check critical environment variables
    source .env 2>/dev/null || true
    
    if [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${YELLOW}⚠ CONTRACT_ADDRESS is not set in .env${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ CONTRACT_ADDRESS is configured${NC}"
        ((SUCCESS++))
    fi
    
    if [ -z "$ISSUER_PRIVATE_KEY" ]; then
        echo -e "${YELLOW}⚠ ISSUER_PRIVATE_KEY is not set in .env${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✓ ISSUER_PRIVATE_KEY is configured${NC}"
        ((SUCCESS++))
    fi
else
    echo -e "${RED}✗ .env file not found. Copy .env.sample to .env and configure it${NC}"
    ((ERRORS++))
fi
echo ""

# Check project structure
echo "6. Checking project structure..."
REQUIRED_DIRS=(
    "src/main/java/com/tar/backend"
    "src/main/resources"
    "src/test/java/com/tar/backend"
    "scripts"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ Directory exists: $dir${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}✗ Missing directory: $dir${NC}"
        ((ERRORS++))
    fi
done
echo ""

# Check key files
echo "7. Checking key files..."
REQUIRED_FILES=(
    "pom.xml"
    "Dockerfile"
    "docker-compose.yml"
    "Makefile"
    "README.md"
    ".gitignore"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ File exists: $file${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}✗ Missing file: $file${NC}"
        ((ERRORS++))
    fi
done
echo ""

# Check if PostgreSQL is accessible (if configured)
echo "8. Checking database connectivity..."
if [ -f ".env" ]; then
    source .env 2>/dev/null || true
    
    if [ ! -z "$POSTGRES_HOST" ] && command -v pg_isready &> /dev/null; then
        if pg_isready -h "$POSTGRES_HOST" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-taruser}" &> /dev/null; then
            echo -e "${GREEN}✓ PostgreSQL is accessible${NC}"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠ PostgreSQL is not accessible (may need to start it)${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "${YELLOW}⚠ Cannot check PostgreSQL connectivity (pg_isready not installed)${NC}"
        ((WARNINGS++))
    fi
else
    echo -e "${YELLOW}⚠ Skipping database check (.env not configured)${NC}"
    ((WARNINGS++))
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "${GREEN}Successful checks: $SUCCESS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Errors: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Setup verification passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Configure .env file with your settings"
    echo "  2. Run 'make build' to build the application"
    echo "  3. Run 'make test' to run tests"
    echo "  4. Run 'make docker-up' to start with Docker"
    echo "  5. Visit http://localhost:8080/swagger-ui.html"
    exit 0
else
    echo -e "${RED}✗ Setup verification failed with $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above and run this script again."
    exit 1
fi


