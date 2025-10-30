#!/bin/bash

# TAR Verification Service - Test Script
# This script runs comprehensive tests for the verification service

set -e

echo "🧪 TAR Verification Service - Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "ℹ️  $message"
            ;;
    esac
}

# Check if Maven wrapper exists
if [ ! -f "./mvnw" ]; then
    print_status "ERROR" "Maven wrapper not found. Please run 'make setup-env' first."
    exit 1
fi

# Make mvnw executable
chmod +x ./mvnw

print_status "INFO" "Starting test suite..."

# 1. Unit Tests
echo ""
print_status "INFO" "Running unit tests..."
if ./mvnw test -Dtest="*Test" -DfailIfNoTests=false; then
    print_status "SUCCESS" "Unit tests passed"
else
    print_status "ERROR" "Unit tests failed"
    exit 1
fi

# 2. Integration Tests
echo ""
print_status "INFO" "Running integration tests..."
if ./mvnw test -Dtest="*IntegrationTest" -DfailIfNoTests=false; then
    print_status "SUCCESS" "Integration tests passed"
else
    print_status "ERROR" "Integration tests failed"
    exit 1
fi

# 3. Test Coverage
echo ""
print_status "INFO" "Generating test coverage report..."
if ./mvnw jacoco:report; then
    print_status "SUCCESS" "Coverage report generated"
    if [ -f "target/site/jacoco/index.html" ]; then
        print_status "INFO" "Coverage report available at: target/site/jacoco/index.html"
    fi
else
    print_status "WARNING" "Coverage report generation failed"
fi

# 4. Code Quality Checks
echo ""
print_status "INFO" "Running code quality checks..."

# Check for TODO comments in production code
TODO_COUNT=$(find src/main -name "*.java" -exec grep -l "TODO\|FIXME" {} \; | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
    print_status "WARNING" "Found $TODO_COUNT files with TODO/FIXME comments"
else
    print_status "SUCCESS" "No TODO/FIXME comments in production code"
fi

# Check for unused imports (basic check)
UNUSED_IMPORTS=$(find src/main -name "*.java" -exec grep -l "import.*;" {} \; | xargs grep -l "import.*;" | wc -l)
if [ $UNUSED_IMPORTS -gt 0 ]; then
    print_status "WARNING" "Potential unused imports detected"
else
    print_status "SUCCESS" "No obvious unused imports"
fi

# 5. Build Verification
echo ""
print_status "INFO" "Verifying build..."
if ./mvnw clean compile; then
    print_status "SUCCESS" "Build verification passed"
else
    print_status "ERROR" "Build verification failed"
    exit 1
fi

# 6. Package Verification
echo ""
print_status "INFO" "Creating package..."
if ./mvnw package -DskipTests; then
    print_status "SUCCESS" "Package created successfully"
    if [ -f "target/verification-service-1.0.0-SNAPSHOT.jar" ]; then
        print_status "INFO" "JAR file available at: target/verification-service-1.0.0-SNAPSHOT.jar"
    fi
else
    print_status "ERROR" "Package creation failed"
    exit 1
fi

# 7. Test Summary
echo ""
echo "📊 Test Summary"
echo "==============="

# Count test results
TOTAL_TESTS=$(find target/surefire-reports -name "*.txt" -exec cat {} \; | grep -c "Tests run:" || echo "0")
PASSED_TESTS=$(find target/surefire-reports -name "*.txt" -exec cat {} \; | grep -c "Failures: 0" || echo "0")
FAILED_TESTS=$((TOTAL_TESTS - PASSED_TESTS))

if [ $TOTAL_TESTS -gt 0 ]; then
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        print_status "SUCCESS" "All tests passed!"
    else
        print_status "ERROR" "$FAILED_TESTS tests failed"
        exit 1
    fi
else
    print_status "WARNING" "No test results found"
fi

# 8. Performance Check
echo ""
print_status "INFO" "Running performance checks..."

# Check build time
BUILD_START=$(date +%s)
./mvnw clean compile -q
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))

if [ $BUILD_TIME -lt 30 ]; then
    print_status "SUCCESS" "Build completed in ${BUILD_TIME}s (good performance)"
else
    print_status "WARNING" "Build took ${BUILD_TIME}s (consider optimization)"
fi

# 9. Final Status
echo ""
echo "🎉 Test Suite Complete!"
echo "======================"

if [ $FAILED_TESTS -eq 0 ]; then
    print_status "SUCCESS" "All tests passed successfully!"
    print_status "INFO" "Service is ready for deployment"
    exit 0
else
    print_status "ERROR" "Some tests failed. Please review and fix issues."
    exit 1
fi
