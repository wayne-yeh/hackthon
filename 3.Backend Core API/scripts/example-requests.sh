#!/bin/bash

# Example API requests for TAR Backend Core API
# Make sure the API is running before executing these commands

API_URL="http://localhost:8080/api/v1"
API_KEY="change-this-in-production"

echo "=== TAR Backend Core API Example Requests ==="
echo ""

# 1. Issue a receipt
echo "1. Issuing a new receipt..."
ISSUE_RESPONSE=$(curl -s -X POST "${API_URL}/receipts/issue" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d '{
    "invoiceNo": "INV-2024-001",
    "purchaseDate": "2024-01-15",
    "amount": 1000.00,
    "itemName": "MacBook Pro 16 inch",
    "ownerAddress": "0x1234567890123456789012345678901234567890"
  }')

echo "Response: $ISSUE_RESPONSE"
echo ""

# Extract token ID from response (requires jq)
if command -v jq &> /dev/null; then
    TOKEN_ID=$(echo $ISSUE_RESPONSE | jq -r '.tokenId')
    METADATA_HASH=$(echo $ISSUE_RESPONSE | jq -r '.metadataHash')
    echo "Token ID: $TOKEN_ID"
    echo "Metadata Hash: $METADATA_HASH"
    echo ""
else
    echo "Install jq for better JSON parsing"
    TOKEN_ID=1
    METADATA_HASH="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
fi

sleep 2

# 2. Get receipt details
echo "2. Getting receipt details..."
curl -s "${API_URL}/receipts/${TOKEN_ID}/details" | jq '.'
echo ""

sleep 1

# 3. Verify receipt
echo "3. Verifying receipt..."
curl -s -X POST "${API_URL}/receipts/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"tokenId\": ${TOKEN_ID},
    \"metadataHash\": \"${METADATA_HASH}\"
  }" | jq '.'
echo ""

sleep 1

# 4. Get receipts by owner
echo "4. Getting receipts by owner..."
curl -s "${API_URL}/receipts/owner/0x1234567890123456789012345678901234567890" \
  -H "X-API-Key: ${API_KEY}" | jq '.'
echo ""

sleep 1

# 5. Get active receipts by owner
echo "5. Getting active receipts by owner..."
curl -s "${API_URL}/receipts/owner/0x1234567890123456789012345678901234567890/active" \
  -H "X-API-Key: ${API_KEY}" | jq '.'
echo ""

sleep 1

# 6. Revoke receipt (commented out by default)
# echo "6. Revoking receipt..."
# curl -s -X POST "${API_URL}/receipts/${TOKEN_ID}/revoke" \
#   -H "X-API-Key: ${API_KEY}"
# echo ""

echo "=== Example requests completed ==="


