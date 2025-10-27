#!/bin/bash

# TAR Verification Service - API Testing Script
# This script tests the verification service API endpoints

set -e

echo "🔍 TAR Verification Service - API Testing"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVICE_URL="http://localhost:8082"
API_BASE="$SERVICE_URL/api/verify"

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
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to test HTTP endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local expected_status=$3
    local description=$4
    
    print_status "INFO" "Testing: $description"
    print_status "INFO" "URL: $method $url"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" || echo "000")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" || echo "000")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        print_status "SUCCESS" "HTTP $http_code (expected $expected_status)"
        if [ -n "$response_body" ]; then
            echo "Response: $response_body"
        fi
        return 0
    else
        print_status "ERROR" "HTTP $http_code (expected $expected_status)"
        if [ -n "$response_body" ]; then
            echo "Response: $response_body"
        fi
        return 1
    fi
}

# Function to test JSON response
test_json_response() {
    local url=$1
    local expected_field=$2
    local description=$3
    
    print_status "INFO" "Testing JSON response: $description"
    
    response=$(curl -s "$url" || echo "")
    if [ -z "$response" ]; then
        print_status "ERROR" "No response received"
        return 1
    fi
    
    # Check if response is valid JSON
    if echo "$response" | jq . > /dev/null 2>&1; then
        print_status "SUCCESS" "Valid JSON response"
        
        # Check for expected field
        if [ -n "$expected_field" ]; then
            field_value=$(echo "$response" | jq -r ".$expected_field" 2>/dev/null || echo "")
            if [ -n "$field_value" ] && [ "$field_value" != "null" ]; then
                print_status "SUCCESS" "Field '$expected_field' found: $field_value"
                return 0
            else
                print_status "ERROR" "Field '$expected_field' not found or null"
                return 1
            fi
        fi
        return 0
    else
        print_status "ERROR" "Invalid JSON response: $response"
        return 1
    fi
}

# Check if service is running
print_status "INFO" "Checking if service is running..."
if curl -s "$SERVICE_URL/api/verify/health" > /dev/null 2>&1; then
    print_status "SUCCESS" "Service is running at $SERVICE_URL"
else
    print_status "ERROR" "Service is not running at $SERVICE_URL"
    print_status "INFO" "Please start the service first: make run"
    exit 1
fi

echo ""
echo "🧪 Running API Tests"
echo "==================="

# Test 1: Health Check
echo ""
print_status "INFO" "Test 1: Health Check"
test_endpoint "GET" "$API_BASE/health" "200" "Health check endpoint"

# Test 2: Verify Token - Valid Token ID
echo ""
print_status "INFO" "Test 2: Verify Token - Valid Token ID"
test_json_response "$API_BASE?tokenId=1" "tokenId" "Verify token with ID 1"

# Test 3: Verify Token - Invalid Token ID (negative)
echo ""
print_status "INFO" "Test 3: Verify Token - Invalid Token ID (negative)"
test_endpoint "GET" "$API_BASE?tokenId=-1" "400" "Verify token with negative ID"

# Test 4: Verify Token - Invalid Token ID (zero)
echo ""
print_status "INFO" "Test 4: Verify Token - Invalid Token ID (zero)"
test_endpoint "GET" "$API_BASE?tokenId=0" "400" "Verify token with zero ID"

# Test 5: Verify Token - Missing Token ID
echo ""
print_status "INFO" "Test 5: Verify Token - Missing Token ID"
test_endpoint "GET" "$API_BASE" "400" "Verify token without ID parameter"

# Test 6: Verify by Serial - Not Implemented
echo ""
print_status "INFO" "Test 6: Verify by Serial - Not Implemented"
test_endpoint "GET" "$API_BASE/by-serial?serial=TAR-2024-001" "501" "Verify by serial number"

# Test 7: Verify by Serial - Missing Serial
echo ""
print_status "INFO" "Test 7: Verify by Serial - Missing Serial"
test_endpoint "GET" "$API_BASE/by-serial" "400" "Verify by serial without parameter"

# Test 8: Swagger UI Access
echo ""
print_status "INFO" "Test 8: Swagger UI Access"
test_endpoint "GET" "$SERVICE_URL/swagger-ui.html" "200" "Swagger UI endpoint"

# Test 9: OpenAPI Docs Access
echo ""
print_status "INFO" "Test 9: OpenAPI Docs Access"
test_endpoint "GET" "$SERVICE_URL/v3/api-docs" "200" "OpenAPI JSON docs"

# Test 10: Actuator Health
echo ""
print_status "INFO" "Test 10: Actuator Health"
test_endpoint "GET" "$SERVICE_URL/actuator/health" "200" "Spring Boot Actuator health"

# Test 11: Actuator Info
echo ""
print_status "INFO" "Test 11: Actuator Info"
test_endpoint "GET" "$SERVICE_URL/actuator/info" "200" "Spring Boot Actuator info"

# Test 12: Actuator Metrics
echo ""
print_status "INFO" "Test 12: Actuator Metrics"
test_endpoint "GET" "$SERVICE_URL/actuator/metrics" "200" "Spring Boot Actuator metrics"

# Test 13: Non-existent Endpoint
echo ""
print_status "INFO" "Test 13: Non-existent Endpoint"
test_endpoint "GET" "$API_BASE/nonexistent" "404" "Non-existent endpoint"

# Test 14: Invalid HTTP Method
echo ""
print_status "INFO" "Test 14: Invalid HTTP Method"
test_endpoint "POST" "$API_BASE?tokenId=1" "405" "POST method on GET endpoint"

# Test 15: Large Token ID
echo ""
print_status "INFO" "Test 15: Large Token ID"
test_json_response "$API_BASE?tokenId=999999999" "tokenId" "Verify token with large ID"

echo ""
echo "📊 API Test Summary"
echo "=================="

# Count successful tests
total_tests=15
successful_tests=0

# This is a simplified count - in a real scenario, you'd track each test result
print_status "INFO" "Total tests run: $total_tests"
print_status "INFO" "Check the output above for individual test results"

echo ""
print_status "INFO" "API Testing Complete!"
print_status "INFO" "Service URL: $SERVICE_URL"
print_status "INFO" "Swagger UI: $SERVICE_URL/swagger-ui.html"
print_status "INFO" "API Docs: $SERVICE_URL/v3/api-docs"

echo ""
echo "💡 Additional Testing Tips"
echo "========================="
echo "• Use Postman collection for more detailed testing"
echo "• Test with real blockchain data when available"
echo "• Monitor logs during testing: make logs"
echo "• Check metrics: curl $SERVICE_URL/actuator/metrics"
echo "• Test error scenarios with invalid data"
